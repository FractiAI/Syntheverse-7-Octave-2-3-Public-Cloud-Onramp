/**
 * API endpoint to allocate SYNTH tokens for a PoC
 *
 * POST /api/poc/[hash]/allocate
 *
 * Allocates tokens if PoC is qualified and not yet allocated
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  allocationsTable,
  epochMetalBalancesTable,
  tokenomicsTable,
} from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation';
import { debug, debugError } from '@/utils/debug';
import crypto from 'crypto';
import {
  advanceGlobalEpochIfCurrentPoolDepleted,
  advanceGlobalEpochTo,
  pickEpochForMetalWithBalance,
  type MetalType,
} from '@/utils/tokenomics/epoch-metal-pools';
import { computeMetalAssay } from '@/utils/tokenomics/metal-assay';

export async function POST(request: NextRequest, { params }: { params: { hash: string } }) {
  const submissionHash = params.hash;
  debug('AllocateTokens', 'Allocating tokens for PoC', { submissionHash });

  try {
    // Verify user is authenticated
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contribution
    const contributions = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contributions || contributions.length === 0) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    const contrib = contributions[0];

    // Verify user is the contributor
    if (contrib.contributor !== user.email) {
      return NextResponse.json(
        { error: 'Forbidden: You can only allocate tokens for your own PoCs' },
        { status: 403 }
      );
    }

    // Check if already allocated
    const existingAllocations = await db
      .select()
      .from(allocationsTable)
      .where(eq(allocationsTable.submission_hash, submissionHash));

    if (existingAllocations.length > 0) {
      return NextResponse.json({ error: 'Tokens already allocated for this PoC' }, { status: 400 });
    }

    // Get metadata
    const metadata = (contrib.metadata as any) || {};
    const metals = (contrib.metals as string[]) || [];
    const podScore = Number(metadata.pod_score || 0);
    if (!podScore) {
      return NextResponse.json({ error: 'PoC has no pod_score; cannot allocate' }, { status: 400 });
    }

    // Use the epoch that was open when the PoC qualified as the minimum epoch we can allocate from.
    const qualifiedEpoch = String(metadata.qualified_epoch || 'founder')
      .toLowerCase()
      .trim();
    const assay = computeMetalAssay(metals);
    const scorePct = podScore / 10000.0;

    let totalAllocated = 0;
    const perMetal: Record<string, { epoch: string; amount: number }> = {};

    for (const metal of Object.keys(assay) as MetalType[]) {
      const w = Number((assay as any)[metal] || 0);
      if (w <= 0) continue;

      const pool = await pickEpochForMetalWithBalance(metal, 1, qualifiedEpoch as any);
      if (!pool || pool.balance <= 0) continue;
      await advanceGlobalEpochTo(pool.epoch as any);

      const amount = Math.floor(scorePct * pool.balance * w);
      if (amount <= 0) continue;
      if (amount > pool.balance) {
        return NextResponse.json(
          { error: `Insufficient ${metal} balance for allocation` },
          { status: 400 }
        );
      }

      const balanceBefore = pool.balance;
      const balanceAfter = balanceBefore - amount;

      const allocationId = crypto.randomUUID();
      await db.insert(allocationsTable).values({
        id: allocationId,
        submission_hash: submissionHash,
        contributor: contrib.contributor,
        metal: metal,
        epoch: pool.epoch,
        tier: metal,
        reward: amount.toString(),
        tier_multiplier: '1.0',
        epoch_balance_before: balanceBefore.toString(),
        epoch_balance_after: balanceAfter.toString(),
      });

      await db
        .update(epochMetalBalancesTable)
        .set({ balance: balanceAfter.toString(), updated_at: new Date() })
        .where(eq(epochMetalBalancesTable.id, pool.id as any));

      // If this allocation depleted the current epoch's pool for this metal, open the next epoch globally.
      await advanceGlobalEpochIfCurrentPoolDepleted(pool.epoch as any, balanceAfter);

      const tokenomicsState = await db
        .select()
        .from(tokenomicsTable)
        .where(eq(tokenomicsTable.id, 'main'))
        .limit(1);
      if (tokenomicsState.length > 0) {
        const state = tokenomicsState[0] as any;
        const metalKey =
          metal === 'gold'
            ? 'total_distributed_gold'
            : metal === 'silver'
              ? 'total_distributed_silver'
              : 'total_distributed_copper';
        const newMetalDistributed = Number(state[metalKey] || 0) + amount;
        const newTotalDistributed = Number(state.total_distributed || 0) + amount;
        await db
          .update(tokenomicsTable)
          .set({
            total_distributed: newTotalDistributed.toString(),
            [metalKey]: newMetalDistributed.toString(),
            updated_at: new Date(),
          } as any)
          .where(eq(tokenomicsTable.id, 'main'));
      }

      perMetal[metal] = { epoch: pool.epoch, amount };
      totalAllocated += amount;
    }

    if (totalAllocated <= 0) {
      return NextResponse.json(
        { error: 'No allocatable metal balances available for this PoC' },
        { status: 400 }
      );
    }

    debug('AllocateTokens', 'Tokens allocated successfully', {
      submissionHash,
      amount: totalAllocated,
      perMetal,
    });

    return NextResponse.json({
      success: true,
      amount: totalAllocated,
      per_metal: perMetal,
    });
  } catch (error) {
    debugError('AllocateTokens', 'Error allocating tokens', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
