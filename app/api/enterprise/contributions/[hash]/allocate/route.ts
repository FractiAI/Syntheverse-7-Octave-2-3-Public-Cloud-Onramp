import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import {
  enterpriseContributionsTable,
  enterpriseAllocationsTable,
  enterpriseSandboxesTable,
} from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import crypto from 'crypto';
import { computeMetalAssay } from '@/utils/tokenomics/metal-assay';
import type { MetalType } from '@/utils/tokenomics/epoch-metal-pools';

export const dynamic = 'force-dynamic';

// Simplified allocation for enterprise sandboxes
// Uses sandbox's own token supply if tokenized, or allocates from main SYNTH pool
async function allocateEnterpriseTokens(
  sandboxId: string,
  submissionHash: string,
  contributor: string,
  podScore: number,
  metals: string[],
  qualifiedEpoch: string
) {
  const assay = computeMetalAssay(metals);
  const scorePct = podScore / 10000.0;

  // For now, use a simplified allocation model
  // TODO: Implement full tokenized sandbox token allocation
  // For enterprise sandboxes, we'll allocate from a simplified pool
  const baseAllocation = 1000000; // Base allocation amount
  const allocation = Math.floor(baseAllocation * scorePct);

  const allocations: Array<{
    id: string;
    sandbox_id: string;
    submission_hash: string;
    contributor: string;
    metal: string;
    epoch: string;
    tier: string | null;
    reward: string; // numeric as string for database
    tier_multiplier: string; // numeric as string for database
    epoch_balance_before: string; // numeric as string for database
    epoch_balance_after: string; // numeric as string for database
  }> = [];

  for (const metal of Object.keys(assay) as MetalType[]) {
    const weight = Number((assay as any)[metal] || 0);
    if (weight <= 0) continue;

    const metalAllocation = Math.floor(allocation * weight);
    if (metalAllocation <= 0) continue;

    allocations.push({
      id: crypto.randomUUID(),
      sandbox_id: sandboxId,
      submission_hash: submissionHash,
      contributor,
      metal,
      epoch: qualifiedEpoch,
      tier: null,
      reward: metalAllocation.toString(),
      tier_multiplier: '1.0',
      epoch_balance_before: '0', // TODO: Track sandbox epoch balances
      epoch_balance_after: '0',
    });
  }

  // Insert allocations
  if (allocations.length > 0) {
    await db.insert(enterpriseAllocationsTable).values(allocations);
  }

  return allocations;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionHash = params.hash;

    // Get contribution
    const contributions = await db
      .select()
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contributions || contributions.length === 0) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    const contrib = contributions[0];

    // Verify user is operator of the sandbox
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, contrib.sandbox_id))
      .limit(1);

    if (!sandbox || sandbox.length === 0 || sandbox[0].operator !== user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already allocated
    const existingAllocations = await db
      .select()
      .from(enterpriseAllocationsTable)
      .where(eq(enterpriseAllocationsTable.submission_hash, submissionHash));

    if (existingAllocations.length > 0) {
      return NextResponse.json({ error: 'Tokens already allocated for this contribution' }, { status: 400 });
    }

    // Get metadata
    const metadata = (contrib.metadata as any) || {};
    const metals = (contrib.metals as string[]) || [];
    const podScore = Number(metadata.pod_score || 0);

    if (!podScore || contrib.status !== 'qualified') {
      return NextResponse.json(
        { error: 'Contribution must be qualified with a pod_score to allocate tokens' },
        { status: 400 }
      );
    }

    const qualifiedEpoch = String(metadata.qualified_epoch || sandbox[0].current_epoch)
      .toLowerCase()
      .trim();

    // Allocate tokens
    const allocations = await allocateEnterpriseTokens(
      contrib.sandbox_id,
      submissionHash,
      contrib.contributor,
      podScore,
      metals,
      qualifiedEpoch
    );

    debug('EnterpriseAllocate', 'Tokens allocated', {
      submissionHash,
      sandboxId: contrib.sandbox_id,
      allocationsCount: allocations.length,
    });

    return NextResponse.json({
      success: true,
      allocations,
      total_allocated: allocations.reduce((sum, a) => sum + Number(a.reward), 0),
    });
  } catch (error) {
    debugError('EnterpriseAllocate', 'Allocation error', error);
    return NextResponse.json({ error: 'Failed to allocate tokens' }, { status: 500 });
  }
}

