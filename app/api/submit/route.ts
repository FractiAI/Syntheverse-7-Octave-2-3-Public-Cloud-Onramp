import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable, pocLogTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { debug, debugError } from '@/utils/debug';
import { evaluateWithGroq } from '@/utils/grok/evaluate';
import { vectorizeSubmission } from '@/utils/vectors';
import { sendApprovalRequestEmail } from '@/utils/email/send-approval-request';
import { isQualifiedForOpenEpoch, getOpenEpochInfo } from '@/utils/epochs/qualification';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { hasValidGoldenFractalKey } from '@/utils/auth/gold-keys';
import * as crypto from 'crypto';
import Stripe from 'stripe';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitHeaders,
  RateLimitConfig,
} from '@/utils/rate-limit';
import { handleCorsPreflight, createCorsHeaders } from '@/utils/cors';

function toPublicEvaluationError(message: string): string {
  const m = String(message || '');
  if (
    m.includes('Request too large') ||
    m.includes('TPM') ||
    m.includes('rate_limit_exceeded') ||
    m.includes('Grok API error (413)') ||
    m.includes('token budget')
  ) {
    return 'Evaluation queued: provider token budget exceeded. Your submission was saved and will be evaluated shortly.';
  }
  if (m.includes('timed out')) {
    return 'Evaluation queued: provider timeout. Your submission was saved and will be evaluated shortly.';
  }
  return m;
}

function isProviderTokenBudgetError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    msg.includes('Request too large') ||
    msg.includes('TPM') ||
    msg.includes('rate_limit_exceeded') ||
    msg.includes('Grok API error (413)') ||
    msg.toLowerCase().includes('token budget')
  );
}

function truncateForEvaluation(
  text: string,
  maxChars: number
): {
  text: string;
  truncated: boolean;
  originalChars: number;
  truncatedChars: number;
} {
  const original = (text || '').trim();
  if (original.length <= maxChars) {
    return {
      text: original,
      truncated: false,
      originalChars: original.length,
      truncatedChars: original.length,
    };
  }
  const truncatedText = original.slice(0, maxChars).trimEnd();
  return {
    text: truncatedText,
    truncated: true,
    originalChars: original.length,
    truncatedChars: truncatedText.length,
  };
}

export async function POST(request: NextRequest) {
  debug('SubmitContribution', 'Submission request received');

  // Handle CORS preflight
  const corsPreflight = handleCorsPreflight(request);
  if (corsPreflight) return corsPreflight;

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, RateLimitConfig.SUBMIT);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      debug('SubmitContribution', 'Rate limit exceeded', {
        identifier: identifier.substring(0, 20) + '...',
      });
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many submission requests. Please try again after ${new Date(rateLimitResult.reset).toISOString()}`,
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      debug('SubmitContribution', 'Unauthorized submission attempt');
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: rateLimitHeaders }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const contributor = (formData.get('contributor') as string | null) || user.email;
    // Category is determined by evaluation, not user input
    const category = null;
    const text_content = (formData.get('text_content') as string | null) || '';
    const payment_method = (formData.get('payment_method') as string | null) || 'paypal'; // Solitary pipe: PayPal only
    const stateImageFile = formData.get('state_image') as File | null;
    const useStateImageEncryption = formData.get('use_state_image_encryption') === 'true';

    if (!title || !title.trim()) {
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // Text-only submission is required
    if (!text_content || !text_content.trim()) {
      return NextResponse.json(
        {
          error:
            'Submission text is required. Please paste your contribution into the submission window.',
        },
        { status: 400 }
      );
    }
    // Basic anti-empty / anti-noise guard
    if (text_content.trim().length < 40) {
      return NextResponse.json(
        {
          error:
            'Submission text is too short. Please include more detail (at least 40 characters).',
        },
        { status: 400 }
      );
    }

    // Content will be truncated to 4000 characters during evaluation if needed
    // (handled in evaluate.ts to prevent Groq API token limit errors)

    // Get base URL for Stripe redirects
    let baseUrl: string | undefined = (
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL
    )?.trim();

    // If no env var, try to get from request headers (for production)
    if (!baseUrl) {
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      if (host) {
        baseUrl = `${protocol}://${host}`;
      }
    }

    // Fallback to localhost only in development
    if (!baseUrl) {
      baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined;
    }

    // Validate baseUrl
    if (!baseUrl || !baseUrl.match(/^https?:\/\//)) {
      debugError('SubmitContribution', 'Invalid baseUrl for Stripe checkout', {
        baseUrl,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
        NODE_ENV: process.env.NODE_ENV,
      });
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'Site URL not configured for payment processing',
        },
        { status: 500 }
      );
    }

    // Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      debugError(
        'SubmitContribution',
        'STRIPE_SECRET_KEY not configured',
        new Error('Missing STRIPE_SECRET_KEY')
      );
      return NextResponse.json(
        {
          error: 'Payment service not configured',
          message: 'STRIPE_SECRET_KEY environment variable is missing',
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Generate submission hash for payment
    const submissionHash = crypto.randomBytes(32).toString('hex');
    const contentHash = crypto.createHash('sha256').update(text_content.trim()).digest('hex');

    // Handle state image upload if provided
    let stateImagePath: string | null = null;
    if (useStateImageEncryption && stateImageFile) {
      try {
        // Validate file type
        if (!stateImageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'State image must be an image file' },
            { status: 400 }
          );
        }

        // Validate file size (max 10MB)
        if (stateImageFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'State image must be less than 10MB' },
            { status: 400 }
          );
        }

        // Convert file to buffer
        const arrayBuffer = await stateImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename
        const fileExt = stateImageFile.name.split('.').pop() || 'jpg';
        const fileName = `${submissionHash}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('state-images')
          .upload(filePath, buffer, {
            contentType: stateImageFile.type,
            upsert: false,
          });

        if (uploadError) {
          debugError('SubmitContribution', 'Failed to upload state image', uploadError);
          return NextResponse.json(
            { error: 'Failed to upload state image' },
            { status: 500 }
          );
        }

        stateImagePath = filePath;
        debug('SubmitContribution', 'State image uploaded', {
          submissionHash,
          path: stateImagePath,
        });
      } catch (imageError) {
        debugError('SubmitContribution', 'Error processing state image', imageError);
        return NextResponse.json(
          { error: 'Failed to process state image' },
          { status: 500 }
        );
      }
    }

    // Check if user is creator or operator - exempt from payment for testing
    // NSPFRNP catalog: valid Golden Fractal Key (gold key) also authorizes API access (paywall bypass)
    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const hasGoldKey = hasValidGoldenFractalKey(request);
    const isExemptFromPayment = isCreator || isOperator || hasGoldKey;

    if (isExemptFromPayment) {
      const paymentStatus = isCreator
        ? 'creator_exempt'
        : isOperator
          ? 'operator_exempt'
          : 'gold_key_exempt';
      debug('SubmitContribution', 'Exempt from payment', {
        email: user.email,
        isCreator,
        isOperator,
        hasGoldKey,
        paymentStatus,
        submissionHash,
      });

      // Save submission directly with evaluating status (exempt)
      try {
        await db.insert(contributionsTable).values({
          submission_hash: submissionHash,
          title: title.trim(),
          contributor: contributor,
          content_hash: contentHash,
          category: category,
          metals: [], // Will be determined during evaluation
          status: 'evaluating', // Direct to evaluation
          text_content: text_content.trim(),
          metadata: {
            payment_status: paymentStatus,
            user_email: user.email,
            submission_timestamp: new Date().toISOString(),
            creator_mode: isCreator,
            operator_mode: isOperator,
            gold_key_exempt: hasGoldKey,
            use_state_image_encryption: useStateImageEncryption,
            state_image_path: stateImagePath,
          },
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Log the submission
        await db.insert(pocLogTable).values({
          id: crypto.randomUUID(),
          submission_hash: submissionHash,
          contributor: contributor,
          event_type: 'submission',
          event_status: 'evaluating',
          title: title.trim(),
          category: category,
          request_data: {
            title: title.trim(),
            category: category,
            content_hash: contentHash,
            text_content_length: text_content.length,
            user_email: user.email,
            creator_mode: isCreator,
            operator_mode: isOperator,
            gold_key_exempt: hasGoldKey,
          },
          created_at: new Date(),
        });

        // Trigger evaluation directly (async, don't await)
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXT_PUBLIC_WEBSITE_URL ||
          'http://localhost:3000';
        const evaluateUrl = `${baseUrl}/api/evaluate/${submissionHash}`;

        fetch(evaluateUrl, { method: 'POST' }).catch((err) => {
          debugError('SubmitContribution', 'Failed to trigger creator/operator evaluation', err);
        });

        debug('SubmitContribution', 'Creator/Operator submission saved, evaluation triggered', {
          submissionHash,
          isCreator,
          isOperator,
        });

        const corsHeaders = createCorsHeaders(request);
        corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
        return NextResponse.json(
          {
            success: true,
            submission_hash: submissionHash,
            message: isCreator
              ? 'Creator submission accepted. Evaluation in progress.'
              : isOperator
                ? 'Operator submission accepted. Evaluation in progress.'
                : 'Golden Fractal Key accepted. Evaluation in progress.',
            creator_mode: isCreator,
            operator_mode: isOperator,
            gold_key_accepted: hasGoldKey,
          },
          { headers: rateLimitHeaders }
        );
      } catch (dbError) {
        debugError('SubmitContribution', 'Failed to save creator/operator submission', dbError);
        return NextResponse.json(
          {
            error: 'Database error',
            message: 'Failed to save operator submission',
          },
          { status: 500 }
        );
      }
    }

    debug('SubmitContribution', 'Creating Stripe checkout session for PoC submission fee', {
      submissionHash,
    });

    // Save submission data temporarily with payment_pending status
    try {
      // Save the contribution with payment_pending status
      await db.insert(contributionsTable).values({
        submission_hash: submissionHash,
        title: title.trim(),
        contributor: contributor,
        content_hash: contentHash,
        category: category,
        metals: [], // Will be determined during evaluation
        status: 'payment_pending', // Custom status for pending payment
        text_content: text_content.trim(),
        metadata: {
          payment_status: 'pending',
          user_email: user.email,
          submission_timestamp: new Date().toISOString(),
        },
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Log the submission attempt
      await db.insert(pocLogTable).values({
        id: crypto.randomUUID(),
        submission_hash: submissionHash,
        contributor: contributor,
        event_type: 'submission',
        event_status: 'payment_pending',
        title: title.trim(),
        category: category,
        request_data: {
          title: title.trim(),
          category: category,
          content_hash: contentHash,
          text_content_length: text_content.length,
          user_email: user.email,
        },
        created_at: new Date(),
      });
    } catch (dbError) {
      debugError('SubmitContribution', 'Failed to save submission data', dbError);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to prepare submission for payment',
        },
        { status: 500 }
      );
    }

    // Solitary pipe: PayPal @PrudencioMendez924 only. $500 submission fee.
    const SUBMISSION_FEE_USD = 500;
    const PAYPAL_ME = 'PrudencioMendez924';
    const paypalMeUrl = `https://www.paypal.com/paypalme/${PAYPAL_ME}/${SUBMISSION_FEE_USD}USD`;

    if (payment_method === 'paypal') {
      // Redirect to PayPal.Me — solitary pipe. No Stripe.
      debug('SubmitContribution', 'PayPal solitary pipe: redirect to PayPal.Me', {
        submissionHash,
        paypalMe: PAYPAL_ME,
      });
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        {
          checkout_url: paypalMeUrl,
          session_id: `paypal-${submissionHash}`,
          submission_hash: submissionHash,
          message: 'Redirect to PayPal (solitary pipe). Complete payment at PayPal.Me, then contact to confirm evaluation.',
          payment_method: 'paypal',
        },
        { headers: rateLimitHeaders }
      );
    }

    // Legacy: Stripe (not in UI — solitary pipe is PayPal only)
    const sanitizedTitle = title.substring(0, 100).replace(/[^\w\s-]/g, '');
    const productName = `PoC Submission: ${sanitizedTitle}`;
    const productDescription = `AI evaluation and scoring service for your Proof-of-Contribution submission`;

    let session;
    try {
      if (payment_method === 'stripe') {
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
                unit_amount: 50000, // $500.00
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${baseUrl}/submit?session_id={CHECKOUT_SESSION_ID}&status=success&hash=${submissionHash}`,
          cancel_url: `${baseUrl}/submit?canceled=true`,
          metadata: {
            submission_hash: submissionHash,
            user_email: user.email,
            title: sanitizedTitle,
            category: category,
            submission_type: 'poc_submission',
            payment_method: 'stripe',
          },
        });
      } else {
        session = {
          id: `session-${submissionHash}`,
          url: `${baseUrl}/submit?session_id=payment-pending&status=pending&hash=${submissionHash}&method=${payment_method}`,
        } as any;
      }
    } catch (stripeError: any) {
      debugError('SubmitContribution', 'Stripe checkout creation failed', {
        error: stripeError.message,
        type: stripeError.type,
      });

      // Clean up the pending submission on error
      try {
        await db
          .delete(contributionsTable)
          .where(eq(contributionsTable.submission_hash, submissionHash));
      } catch (cleanupError) {
        debugError('SubmitContribution', 'Failed to cleanup pending submission', cleanupError);
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
      debugError('SubmitContribution', 'Stripe session missing URL', { sessionId: session.id });

      // Clean up the pending submission on error
      try {
        await db
          .delete(contributionsTable)
          .where(eq(contributionsTable.submission_hash, submissionHash));
      } catch (cleanupError) {
        debugError('SubmitContribution', 'Failed to cleanup pending submission', cleanupError);
      }

      return NextResponse.json(
        {
          error: 'Payment session error',
          message: 'Failed to get checkout URL',
        },
        { status: 500 }
      );
    }

    debug('SubmitContribution', 'Stripe checkout session created', {
      sessionId: session.id,
      submissionHash,
      checkoutUrl: session.url.substring(0, 50) + '...',
    });

    // Return checkout URL to frontend with CORS and rate limit headers
    const corsHeaders = createCorsHeaders(request);
    corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
    return NextResponse.json(
      {
        checkout_url: session.url,
        session_id: session.id,
        submission_hash: submissionHash,
        message: 'Redirecting to payment for PoC evaluation service',
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    debugError('SubmitContribution', 'Error submitting contribution', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log the full error for debugging
    console.error('SubmitContribution Error:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    // Return detailed error for debugging with CORS headers
    const corsHeaders = createCorsHeaders(request);
    const errorHeaders = new Headers();
    corsHeaders.forEach((value, key) => errorHeaders.set(key, value));
    return NextResponse.json(
      {
        error: 'Failed to submit contribution',
        message: errorMessage,
        details:
          process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development'
            ? errorMessage
            : 'An error occurred while submitting. Please try again.',
        ...(process.env.NODE_ENV === 'development'
          ? {
              stack: errorStack,
              name: error instanceof Error ? error.name : undefined,
            }
          : {}),
      },
      { status: 500, headers: errorHeaders }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsPreflight = handleCorsPreflight(request);
  return corsPreflight || new Response(null, { status: 204 });
}
