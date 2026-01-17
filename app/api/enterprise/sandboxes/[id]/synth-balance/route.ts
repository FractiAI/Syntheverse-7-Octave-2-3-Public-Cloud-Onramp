import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, sandboxMetricsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { calculatePricing, formatSynthAmount, getLowBalanceWarning } from '@/utils/enterprise/synth-pricing';

export const dynamic = 'force-dynamic';

/**
 * GET: Get SYNTH balance and activation status for a sandbox
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

    // Get sandbox
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

    const sandbox = sandboxes[0];

    // Get metrics
    const metrics = await db
      .select()
      .from(sandboxMetricsTable)
      .where(eq(sandboxMetricsTable.sandbox_id, params.id))
      .limit(1);

    const metricsData = metrics[0] || {
      unique_contributors: 0,
      total_submissions: 0,
      total_evaluations: 0,
      total_registrations: 0,
      total_allocations: 0,
      total_analytics_queries: 0,
    };

    // Calculate pricing
    const pricing = calculatePricing({
      unique_contributors: Number(metricsData.unique_contributors) || 0,
      total_submissions: Number(metricsData.total_submissions) || 0,
      total_evaluations: Number(metricsData.total_evaluations) || 0,
      total_registrations: Number(metricsData.total_registrations) || 0,
      total_allocations: Number(metricsData.total_allocations) || 0,
      total_analytics_queries: Number(metricsData.total_analytics_queries) || 0,
    });

    const balance = Number(sandbox.synth_balance || 0);
    const warning = getLowBalanceWarning(balance);

    return NextResponse.json({
      sandbox_id: sandbox.id,
      balance: balance.toString(),
      balance_formatted: formatSynthAmount(balance),
      activated: sandbox.synth_activated || false,
      activated_at: sandbox.synth_activated_at?.toISOString() || null,
      testing_mode: sandbox.testing_mode !== false, // Default to true
      activation_fee: Number(sandbox.synth_activation_fee || 10000),
      current_reach_tier: pricing.reach_tier,
      monthly_rent: pricing.monthly_rent,
      metrics: {
        unique_contributors: metricsData.unique_contributors,
        total_submissions: metricsData.total_submissions,
        total_evaluations: metricsData.total_evaluations,
        total_registrations: metricsData.total_registrations,
        total_allocations: metricsData.total_allocations,
      },
      pricing,
      warning,
    });
  } catch (error: any) {
    console.error('Error fetching SYNTH balance:', error);
    return NextResponse.json({ error: 'Failed to fetch SYNTH balance' }, { status: 500 });
  }
}

