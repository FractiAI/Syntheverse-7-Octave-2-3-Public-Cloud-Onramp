/**
 * API endpoint to get allocations for a specific submission
 *
 * Returns all token allocations created for a PoC submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { allocationsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  const submissionHash = params.hash;
  debug('GetAllocations', 'Fetching allocations', { submissionHash });

  try {
    const allocations = await db
      .select()
      .from(allocationsTable)
      .where(eq(allocationsTable.submission_hash, submissionHash))
      .orderBy(allocationsTable.created_at);

    const formattedAllocations = allocations.map((a) => ({
      id: a.id,
      submission_hash: a.submission_hash,
      contributor: a.contributor,
      metal: a.metal,
      epoch: a.epoch,
      tier: a.tier,
      reward: Number(a.reward),
      tier_multiplier: Number(a.tier_multiplier),
      epoch_balance_before: Number(a.epoch_balance_before),
      epoch_balance_after: Number(a.epoch_balance_after),
      created_at: a.created_at?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      submission_hash: submissionHash,
      count: formattedAllocations.length,
      allocations: formattedAllocations,
      total_reward: formattedAllocations.reduce((sum, a) => sum + a.reward, 0),
    });
  } catch (error) {
    debugError('GetAllocations', 'Failed to fetch allocations', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch allocations',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
