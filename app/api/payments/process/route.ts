/**
 * Payment Processing API
 * 
 * POST /api/payments/process
 * 
 * Processes payments across all methods:
 * - On-chain
 * - PayPal (solitary pipe)
 * - Cash App
 * - Top-scoring blockchain method
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processPayment,
  type PaymentRequest,
  type PaymentResult,
} from '@/utils/payments/processor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST: Process payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const paymentRequest: PaymentRequest = {
      amount: body.amount || 0,
      currency: body.currency || 'usd',
      method: body.method || 'paypal',
      metadata: body.metadata || {},
    };

    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount',
          message: 'Payment amount must be greater than 0',
        },
        { status: 400 }
      );
    }

    const result = await processPayment(paymentRequest);

    return NextResponse.json({
      success: true,
      payment: result,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('[Payment Processing API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
