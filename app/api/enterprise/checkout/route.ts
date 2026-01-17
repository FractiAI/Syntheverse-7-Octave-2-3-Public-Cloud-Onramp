import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable } from '@/utils/db/schema';
import crypto from 'crypto';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { debug } from '@/utils/debug';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export const dynamic = 'force-dynamic';

const PRICING_TIERS = {
  Pioneer: { pricePerNode: 500, minNodes: 1, maxNodes: 5 },
  'Trading Post': { pricePerNode: 400, minNodes: 6, maxNodes: 25 },
  Settlement: { pricePerNode: 300, minNodes: 26, maxNodes: 125 },
  Metropolis: { pricePerNode: 250, minNodes: 126, maxNodes: Infinity },
};

function calculatePrice(tierName: string, nodeCount: number): number {
  const tier = PRICING_TIERS[tierName as keyof typeof PRICING_TIERS];
  if (!tier) return 0;

  if (nodeCount < tier.minNodes) return 0;
  if (tier.maxNodes !== Infinity && nodeCount > tier.maxNodes) {
    // Calculate across multiple tiers
    let total = 0;
    let remaining = nodeCount;

    const tiers = ['Pioneer', 'Trading Post', 'Settlement', 'Metropolis'];
    for (const t of tiers) {
      const tConfig = PRICING_TIERS[t as keyof typeof PRICING_TIERS];
      if (remaining <= 0) break;
      if (nodeCount > tConfig.maxNodes) {
        const tierNodes = tConfig.maxNodes - (tConfig.minNodes - 1);
        total += tierNodes * tConfig.pricePerNode;
        remaining -= tierNodes;
      } else {
        total += remaining * tConfig.pricePerNode;
        break;
      }
    }
    return total;
  }

  const nodesInTier = Math.min(nodeCount, tier.maxNodes) - (tier.minNodes - 1);
  return nodesInTier * tier.pricePerNode;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is creator or operator - exempt from payment for testing
    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const isExemptFromPayment = isCreator || isOperator;

    if (isExemptFromPayment) {
      debug('EnterpriseCheckout', 'Creator/Operator mode: exempt from payment', {
        email: user.email,
        isCreator,
        isOperator,
      });

      // Return success without creating checkout session
      // For exempt users, we'll create the sandbox directly if needed
      const body = await request.json();
      let { tier, nodeCount, sandboxId } = body;

      if (!tier || !nodeCount || nodeCount < 1) {
        return NextResponse.json({ error: 'Tier and node count are required' }, { status: 400 });
      }

      // If no sandboxId provided, create a new sandbox for the user
      if (!sandboxId || sandboxId.trim() === '') {
        const newSandboxId = crypto.randomUUID();
        const sandboxName = `${user.email.split('@')[0]}-sandbox-${Date.now().toString().slice(-6)}`;
        
        await db
          .insert(enterpriseSandboxesTable)
          .values({
            id: newSandboxId,
            operator: user.email,
            name: sandboxName,
            description: `Enterprise sandbox for ${tier} tier with ${nodeCount} nodes (Creator/Operator - Payment Exempt)`,
            vault_status: 'active', // Directly activate for exempt users
            tokenized: false,
            current_epoch: 'founder',
            scoring_config: {
              novelty_weight: 1.0,
              density_weight: 1.0,
              coherence_weight: 1.0,
              alignment_weight: 1.0,
              qualification_threshold: 4000,
            },
            metadata: {
              creator_exempt: isCreator,
              operator_exempt: isOperator,
              payment_bypassed: true,
            },
          });
        
        sandboxId = newSandboxId;
      }

      return NextResponse.json({
        success: true,
        exempt: true,
        message: 'Creator/Operator: Payment bypassed for testing',
        checkout_url: null,
        session_id: null,
        sandbox_id: sandboxId,
      });
    }

    const body = await request.json();
    let { tier, nodeCount, sandboxId } = body;

    if (!tier || !nodeCount || nodeCount < 1) {
      return NextResponse.json({ error: 'Tier and node count are required' }, { status: 400 });
    }

    const monthlyPrice = calculatePrice(tier, nodeCount);
    if (monthlyPrice === 0) {
      return NextResponse.json({ error: 'Invalid tier or node count' }, { status: 400 });
    }

    // If no sandboxId provided, create a new sandbox for the user
    if (!sandboxId || sandboxId.trim() === '') {
      const newSandboxId = crypto.randomUUID();
      const sandboxName = `${user.email.split('@')[0]}-sandbox-${Date.now().toString().slice(-6)}`;
      
      await db
        .insert(enterpriseSandboxesTable)
        .values({
          id: newSandboxId,
          operator: user.email,
          name: sandboxName,
          description: `Enterprise sandbox for ${tier} tier with ${nodeCount} nodes`,
          vault_status: 'paused', // Will be activated after successful payment
          tokenized: false,
          current_epoch: 'founder',
          scoring_config: {
            novelty_weight: 1.0,
            density_weight: 1.0,
            coherence_weight: 1.0,
            alignment_weight: 1.0,
            qualification_threshold: 4000,
          },
          metadata: {},
        });
      
      sandboxId = newSandboxId;
    }

    // Create Stripe Checkout Session
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_WEBSITE_URL ||
      'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Enterprise Frontier Sandbox - ${tier}`,
              description: `${nodeCount} nodes at $${PRICING_TIERS[tier as keyof typeof PRICING_TIERS].pricePerNode}/node/month`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: monthlyPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_email: user.email,
        tier,
        node_count: String(nodeCount),
        sandbox_id: sandboxId || '',
        product_type: 'enterprise_sandbox',
      },
      subscription_data: {
        metadata: {
          product_type: 'enterprise_sandbox',
          tier,
          node_count: String(nodeCount),
          sandbox_id: sandboxId || '',
        },
      },
      success_url: `${baseUrl}/fractiai/enterprise-dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/fractiai/enterprise-dashboard`,
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
