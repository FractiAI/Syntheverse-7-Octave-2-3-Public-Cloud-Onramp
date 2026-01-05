import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, enterpriseContributionsTable } from '@/utils/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Get analytics for a sandbox
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
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!sandbox || sandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    // Get all contributions
    const contributions = await db
      .select({
        submission_hash: enterpriseContributionsTable.submission_hash,
        contributor: enterpriseContributionsTable.contributor,
        status: enterpriseContributionsTable.status,
        metadata: enterpriseContributionsTable.metadata,
      })
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.sandbox_id, params.id));

    // Calculate analytics
    const totalContributions = contributions.length;
    const qualifiedContributions = contributions.filter((c) => c.status === 'qualified').length;
    const evaluatingContributions = contributions.filter((c) => c.status === 'evaluating').length;

    const scores = contributions
      .map((c) => (c.metadata as any)?.pod_score)
      .filter((s): s is number => typeof s === 'number' && s > 0);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Calculate cost (assuming $20 per on-chain registration for qualified contributions)
    const totalCost = qualifiedContributions * 20;

    // Score distribution
    const scoreDistribution = {
      founder: scores.filter((s) => s >= 8000).length,
      pioneer: scores.filter((s) => s >= 6000 && s < 8000).length,
      community: scores.filter((s) => s >= 5000 && s < 6000).length,
      ecosystem: scores.filter((s) => s >= 4000 && s < 5000).length,
      unqualified: scores.filter((s) => s < 4000).length,
    };

    // Top contributors
    const contributorMap = new Map<
      string,
      { count: number; qualified: number; totalScore: number }
    >();
    contributions.forEach((c) => {
      const existing = contributorMap.get(c.contributor) || {
        count: 0,
        qualified: 0,
        totalScore: 0,
      };
      existing.count++;
      if (c.status === 'qualified') existing.qualified++;
      const score = (c.metadata as any)?.pod_score;
      if (typeof score === 'number' && score > 0) {
        existing.totalScore += score;
      }
      contributorMap.set(c.contributor, existing);
    });

    const topContributors = Array.from(contributorMap.entries())
      .map(([contributor, data]) => ({
        contributor,
        count: data.count,
        qualified: data.qualified,
        avgScore: data.count > 0 ? data.totalScore / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const analytics = {
      totalContributions,
      qualifiedContributions,
      evaluatingContributions,
      averageScore,
      totalCost,
      qualifiedRate:
        totalContributions > 0 ? (qualifiedContributions / totalContributions) * 100 : 0,
      topContributors,
      scoreDistribution,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
