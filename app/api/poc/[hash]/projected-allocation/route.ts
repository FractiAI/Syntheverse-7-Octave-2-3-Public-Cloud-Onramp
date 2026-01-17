/**
 * API endpoint to get projected SYNTH token allocation for a PoC
 *
 * GET /api/poc/[hash]/projected-allocation
 *
 * Returns projected allocation amount if tokens were allocated now
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation';
import { debug, debugError } from '@/utils/debug';

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  const submissionHash = params.hash;
  debug('ProjectedAllocation', 'Fetching projected allocation', { submissionHash });

  try {
    const result = await calculateProjectedAllocation(submissionHash);

    return NextResponse.json(result);
  } catch (error) {
    debugError('ProjectedAllocation', 'Error calculating projected allocation', error);
    return NextResponse.json(
      {
        submission_hash: submissionHash,
        projected_allocation: 0,
        eligible: false,
        epoch: 'unknown',
        breakdown: {
          base_score: 0,
          pod_score: 0,
          metal_multiplier: 1.0,
          metal_combination: 'error',
          epoch_availability: 0,
          tier_multiplier: 1.0,
          final_amount: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
