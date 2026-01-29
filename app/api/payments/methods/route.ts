/**
 * Payment Methods API
 * 
 * GET /api/payments/methods
 * 
 * Returns all available payment methods including:
 * - On-chain
 * - PayPal (solitary pipe)
 * - Cash App
 * - Top-scoring blockchain method (selected using NSPFRP)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPaymentMethods,
  getTopScoringBlockchainMethod,
  scoreBlockchainPaymentMethods,
  type PaymentMethod,
} from '@/utils/payments/method-scoring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET: Get all payment methods
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeScores = searchParams.get('includeScores') === 'true';
    const topBlockchainOnly = searchParams.get('topBlockchainOnly') === 'true';

    if (topBlockchainOnly) {
      const topMethod = getTopScoringBlockchainMethod();
      const scored = scoreBlockchainPaymentMethods();
      const topScore = scored.find((s) => s.method.id === topMethod.id);

      return NextResponse.json({
        success: true,
        method: topMethod,
        score: topScore,
        message: `Top-scoring blockchain payment method: ${topMethod.name}`,
      });
    }

    const methods = getAllPaymentMethods();
    const scored = includeScores ? scoreBlockchainPaymentMethods() : null;

    return NextResponse.json({
      success: true,
      methods,
      topBlockchainMethod: getTopScoringBlockchainMethod(),
      scores: scored,
      message: 'Payment methods retrieved',
    });
  } catch (error) {
    console.error('[Payment Methods API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get payment methods',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
