import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { debug, debugError } from '@/utils/debug';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { hasValidGoldenFractalKey } from '@/utils/auth/gold-keys';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TIER_PRICES: Record<string, number> = {
  'SynthScan Light': 50000, // $500 in cents
  'SynthScan Pro': 150000, // $1,500 in cents
  'SynthScan Enterprise': 500000, // $5,000 in cents
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
      debug('SynthScanCheckout', 'Exempt from payment', {
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
    const { tier, price, nodeCount = 1, totalPrice } = body;

    if (!tier || typeof tier !== 'string') {
      return NextResponse.json({ error: 'Missing required field: tier' }, { status: 400 });
    }

    // Validate tier
    const pricePerNodeInCents = TIER_PRICES[tier];
    if (!pricePerNodeInCents) {
      return NextResponse.json({ error: `Invalid tier: ${tier}` }, { status: 400 });
    }

    // Validate and calculate node count
    const nodes = Math.max(1, Math.min(1000, parseInt(String(nodeCount)) || 1));
    const totalPriceInCents = totalPrice 
      ? Math.round(totalPrice * 100) 
      : pricePerNodeInCents * nodes;

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SynthScan™ MRI Monthly Access - ${tier}`,
              description: `${nodes} node${nodes > 1 ? 's' : ''} × $${(pricePerNodeInCents / 100).toLocaleString()}/node/month = $${(totalPriceInCents / 100).toLocaleString()}/month`,
            },
            unit_amount: totalPriceInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/synthscan/control-panel?subscription=success&tier=${encodeURIComponent(tier)}`,
      cancel_url: `${baseUrl}/subscribe?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_email: user.email,
        tier: tier,
        node_count: String(nodes),
        price_per_node: String(pricePerNodeInCents / 100),
        total_price: String(totalPriceInCents / 100),
        product_type: 'synthscan_monthly_access',
      },
      subscription_data: {
        metadata: {
          tier: tier,
          node_count: String(nodes),
          price_per_node: String(pricePerNodeInCents / 100),
          total_price: String(totalPriceInCents / 100),
          product_type: 'synthscan_monthly_access',
        },
      },
    });

    debug('SynthScanCheckout', 'Checkout session created', {
      sessionId: session.id,
      tier: tier,
      nodeCount: nodes,
      pricePerNode: pricePerNodeInCents / 100,
      totalPrice: totalPriceInCents / 100,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    debugError('SynthScanCheckout', 'Error creating checkout session', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
