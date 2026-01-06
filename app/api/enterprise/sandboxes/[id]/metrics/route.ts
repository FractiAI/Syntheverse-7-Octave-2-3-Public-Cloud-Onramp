import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, sandboxMetricsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculatePricing } from '@/utils/enterprise/synth-pricing';

export const dynamic = 'force-dynamic';

/**
 * GET: Get reach and activity metrics for a sandbox
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify sandbox exists and user has access
    const sandboxes = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!sandboxes || sandboxes.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    // Get metrics
    const metrics = await db
      .select()
      .from(sandboxMetricsTable)
      .where(eq(sandboxMetricsTable.sandbox_id, params.id))
      .limit(1);

    if (metrics.length === 0) {
      // Initialize metrics if not exists
      await db.insert(sandboxMetricsTable).values({
        sandbox_id: params.id,
        unique_contributors: 0,
        total_submissions: 0,
        total_evaluations: 0,
        total_registrations: 0,
        total_allocations: 0,
        total_analytics_queries: 0,
      });

      return NextResponse.json({
        sandbox_id: params.id,
        metrics: {
          unique_contributors: 0,
          total_submissions: 0,
          total_evaluations: 0,
          total_registrations: 0,
          total_allocations: 0,
          total_analytics_queries: 0,
        },
        pricing: calculatePricing({
          unique_contributors: 0,
          total_submissions: 0,
          total_evaluations: 0,
          total_registrations: 0,
          total_allocations: 0,
          total_analytics_queries: 0,
        }),
      });
    }

    const metricsData = metrics[0];

    // Calculate pricing
    const pricing = calculatePricing({
      unique_contributors: Number(metricsData.unique_contributors) || 0,
      total_submissions: Number(metricsData.total_submissions) || 0,
      total_evaluations: Number(metricsData.total_evaluations) || 0,
      total_registrations: Number(metricsData.total_registrations) || 0,
      total_allocations: Number(metricsData.total_allocations) || 0,
      total_analytics_queries: Number(metricsData.total_analytics_queries) || 0,
    });

    return NextResponse.json({
      sandbox_id: params.id,
      metrics: {
        unique_contributors: metricsData.unique_contributors,
        total_submissions: metricsData.total_submissions,
        total_evaluations: metricsData.total_evaluations,
        total_registrations: metricsData.total_registrations,
        total_allocations: metricsData.total_allocations,
        total_analytics_queries: metricsData.total_analytics_queries,
        last_calculated_at: metricsData.last_calculated_at?.toISOString() || null,
      },
      pricing,
    });
  } catch (error: any) {
    console.error('Error fetching sandbox metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

