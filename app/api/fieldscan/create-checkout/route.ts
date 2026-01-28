import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { debug, debugError } from '@/utils/debug';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { hasValidGoldenFractalKey } from '@/utils/auth/gold-keys';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TIER_PRICES: Record<string, number> = {
  'FieldScan Light': 50000, // $500 in cents
  'FieldScan Pro': 150000, // $1,500 in cents
  'FieldScan Enterprise': 500000, // $5,000 in cents
};

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

    // Check if user is creator or operator - exempt from payment for testing
    // NSPFRNP catalog: valid Golden Fractal Key (gold key) also authorizes API access
    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const hasGoldKey = hasValidGoldenFractalKey(request);
    const isExemptFromPayment = isCreator || isOperator || hasGoldKey;

    if (isExemptFromPayment) {
      debug('FieldScanCheckout', 'Exempt from payment', {
        email: user.email,
        isCreator,
        isOperator,
        hasGoldKey,
      });

      // Return success without creating checkout session
      return NextResponse.json({
        success: true,
        exempt: true,
        gold_key_accepted: hasGoldKey,
        message: hasGoldKey
          ? 'Golden Fractal Key accepted. Payment bypassed.'
          : 'Creator/Operator: Payment bypassed for testing',
        checkout_url: null,
        session_id: null,
      });
    }

    // Parse request body
    const body = await request.json();
    const { tier, price } = body;

    if (!tier || typeof tier !== 'string') {
      return NextResponse.json({ error: 'Missing required field: tier' }, { status: 400 });
    }

    // Validate tier
    const priceInCents = TIER_PRICES[tier];
    if (!priceInCents) {
      return NextResponse.json({ error: `Invalid tier: ${tier}` }, { status: 400 });
    }

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

    if (!baseUrl) {
      return NextResponse.json({ error: 'Site URL not configured' }, { status: 500 });
    }

    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
    const stripe = new Stripe(sanitizedKey, {
      apiVersion: '2024-06-20',
    });

    // Create checkout session (one-time payment for service)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FieldScan - ${tier}`,
              description: `Full-service complex systems imaging service - ${tier} tier (per session)`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/fractiai/synthscan-field-imaging?success=true&tier=${encodeURIComponent(tier)}`,
      cancel_url: `${baseUrl}/fractiai/synthscan-field-imaging?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_email: user.email,
        tier: tier,
        product_type: 'fieldscan_service',
      },
    });

    debug('FieldScanCheckout', 'Checkout session created', {
      sessionId: session.id,
      tier: tier,
      price: priceInCents,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    debugError('FieldScanCheckout', 'Error creating checkout session', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
