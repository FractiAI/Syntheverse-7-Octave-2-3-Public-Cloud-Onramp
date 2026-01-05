/**
 * Test endpoint to create a small Stripe checkout session for testing live mode
 * 
 * POST /api/test/stripe-small
 * 
 * Body: { amount_cents?: number } (optional, defaults to 50 cents = $0.50)
 * 
 * Creates a minimal test checkout session to verify Stripe live mode integration.
 * Minimum amount: 50 cents ($0.50 USD) per Stripe requirements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { debug, debugError } from '@/utils/debug';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Stripe minimum amount: $0.50 USD = 50 cents
const MINIMUM_AMOUNT_CENTS = 50;

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body (optional amount_cents)
    let amount_cents = MINIMUM_AMOUNT_CENTS; // Default to minimum
    try {
      const body = await request.json();
      if (body.amount_cents && typeof body.amount_cents === 'number') {
        amount_cents = Math.max(MINIMUM_AMOUNT_CENTS, Math.round(body.amount_cents));
      }
    } catch {
      // No body provided, use default
    }

    // Validate amount meets Stripe minimum
    if (amount_cents < MINIMUM_AMOUNT_CENTS) {
      return NextResponse.json(
        {
          error: `Amount too small. Minimum is ${MINIMUM_AMOUNT_CENTS} cents ($${(MINIMUM_AMOUNT_CENTS / 100).toFixed(2)} USD)`,
          minimum_cents: MINIMUM_AMOUNT_CENTS,
        },
        { status: 400 }
      );
    }

    // Get Stripe instance
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
    
    // Verify we're using live keys (for production testing)
    if (!sanitizedKey.startsWith('sk_live_') && !sanitizedKey.startsWith('ssk_live_') && !sanitizedKey.startsWith('rk_live_')) {
      return NextResponse.json(
        {
          error: 'This endpoint is for testing live mode only. Live keys required.',
          detected_key_type: sanitizedKey.substring(0, 7),
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(sanitizedKey, {
      apiVersion: '2024-06-20',
    });

    // Get base URL
    let baseUrl: string | undefined = (
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL
    )?.trim();

    if (!baseUrl) {
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      if (host) {
        baseUrl = `${protocol}://${host}`;
      }
    }

    if (!baseUrl) {
      baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined;
    }

    if (!baseUrl || !baseUrl.match(/^https?:\/\//)) {
      return NextResponse.json(
        { error: 'Configuration error: Site URL not configured' },
        { status: 500 }
      );
    }

    const productName = 'Test Transaction - Syntheverse';
    const productDescription = `Small test transaction to verify Stripe live mode integration. Amount: $${(amount_cents / 100).toFixed(2)} USD.`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard?test_transaction=success&amount=${amount_cents}`,
      cancel_url: `${baseUrl}/dashboard?test_transaction=cancelled`,
      customer_email: user.email,
      metadata: {
        test: 'true',
        type: 'stripe_live_test',
        amount_cents: amount_cents.toString(),
        user_email: user.email,
      },
      payment_intent_data: {
        description: productDescription,
        metadata: {
          test: 'true',
          purpose: 'Stripe live mode integration test',
          amount_cents: amount_cents.toString(),
        },
      },
    });

    debug('StripeSmallTest', 'Test checkout session created', {
      sessionId: session.id,
      amountCents: amount_cents,
      amountUSD: `$${(amount_cents / 100).toFixed(2)}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to get checkout URL from Stripe session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      amount_cents,
      amount_usd: `$${(amount_cents / 100).toFixed(2)}`,
      message: `Test checkout session created for $${(amount_cents / 100).toFixed(2)} USD`,
    });
  } catch (error) {
    debugError('StripeSmallTest', 'Error creating test checkout session', error);
    return NextResponse.json(
      {
        error: 'Test checkout creation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

