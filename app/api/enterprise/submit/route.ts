import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, enterpriseContributionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import Stripe from 'stripe';
import { debug, debugError } from '@/utils/debug';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sandbox_id, title, text_content, category } = body;

    if (!sandbox_id || !title || !text_content) {
      return NextResponse.json(
        { error: 'sandbox_id, title, and text_content are required' },
        { status: 400 }
      );
    }

    // Verify sandbox exists and user has access
    const sandboxes = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, sandbox_id))
      .limit(1);

    if (!sandboxes || sandboxes.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    const sandbox = sandboxes[0];

    // Check if sandbox vault is active
    if (sandbox.vault_status !== 'active') {
      return NextResponse.json(
        { error: 'Sandbox vault is not active. Please activate the vault first.' },
        { status: 400 }
      );
    }

    // Check if user is operator or has permission (for now, only operator can submit)
    // TODO: Add contributor permissions system
    if (sandbox.operator !== user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Generate submission hash
    const contentHash = crypto.createHash('sha256').update(text_content).digest('hex');
    const submissionHash = crypto
      .createHash('sha256')
      .update(`${sandbox_id}:${contentHash}:${Date.now()}`)
      .digest('hex');

    // Save submission with payment_pending status
    await db.insert(enterpriseContributionsTable).values({
      submission_hash: submissionHash,
      sandbox_id: sandbox_id,
      title: title.trim(),
      contributor: user.email,
      content_hash: contentHash,
      text_content: text_content,
      category: category || null,
      status: 'payment_pending', // Payment required before evaluation
      metadata: {
        payment_status: 'pending',
        user_email: user.email,
        submission_timestamp: new Date().toISOString(),
      } as any,
    });

    // Create Stripe checkout session for $500 submission fee
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_WEBSITE_URL ||
      'http://localhost:3000';

    // Get sandbox subscription tier to determine submission fee
    // Enterprise submission fees are lower than main Syntheverse ($500)
    // Pricing: Pioneer: $50, Trading Post: $40, Settlement: $30, Metropolis: $25
    const tier = sandbox.subscription_tier || 'Pioneer';
    const submissionFees: Record<string, number> = {
      Pioneer: 5000, // $50.00
      'Trading Post': 4000, // $40.00
      Settlement: 3000, // $30.00
      Metropolis: 2500, // $25.00
    };
    const submissionFeeCents = submissionFees[tier] || submissionFees.Pioneer;
    const submissionFeeDollars = submissionFeeCents / 100;

    const sanitizedTitle = title.substring(0, 100).replace(/[^\w\s-]/g, '');
    const productName = `Enterprise PoC Submission: ${sanitizedTitle}`;
    const productDescription = `AI evaluation and scoring service for your enterprise sandbox contribution (${tier} tier - $${submissionFeeDollars} per submission)`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productName,
                description: productDescription,
              },
              unit_amount: submissionFeeCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/enterprise/sandbox/${sandbox_id}?session_id={CHECKOUT_SESSION_ID}&status=success&hash=${submissionHash}`,
        cancel_url: `${baseUrl}/enterprise/sandbox/${sandbox_id}?canceled=true`,
        metadata: {
          submission_hash: submissionHash,
          sandbox_id: sandbox_id,
          user_email: user.email,
          title: sanitizedTitle,
          category: category || '',
          submission_type: 'enterprise_poc_submission',
        },
      });
    } catch (stripeError: any) {
      debugError('EnterpriseSubmit', 'Stripe checkout creation failed', {
        error: stripeError.message,
        type: stripeError.type,
      });

      // Clean up the pending submission on error
      try {
        await db
          .delete(enterpriseContributionsTable)
          .where(eq(enterpriseContributionsTable.submission_hash, submissionHash));
      } catch (cleanupError) {
        debugError('EnterpriseSubmit', 'Failed to cleanup pending submission', cleanupError);
      }

      return NextResponse.json(
        {
          error: 'Payment session creation failed',
          message: stripeError.message || 'Failed to create payment session',
        },
        { status: 500 }
      );
    }

    if (!session.url) {
      debugError('EnterpriseSubmit', 'Stripe session missing URL', { sessionId: session.id });

      // Clean up the pending submission on error
      try {
        await db
          .delete(enterpriseContributionsTable)
          .where(eq(enterpriseContributionsTable.submission_hash, submissionHash));
      } catch (cleanupError) {
        debugError('EnterpriseSubmit', 'Failed to cleanup pending submission', cleanupError);
      }

      return NextResponse.json(
        {
          error: 'Payment session error',
          message: 'Failed to get checkout URL',
        },
        { status: 500 }
      );
    }

    debug('EnterpriseSubmit', 'Checkout session created', {
      submissionHash,
      sandboxId: sandbox_id,
      sessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      submission_hash: submissionHash,
      checkout_url: session.url,
      message: 'Payment required to proceed with evaluation',
    });
  } catch (error) {
    debugError('EnterpriseSubmit', 'Submission error', error);
    return NextResponse.json(
      { error: 'Failed to submit contribution' },
      { status: 500 }
    );
  }
}


