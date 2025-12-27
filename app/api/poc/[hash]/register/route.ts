/**
 * API endpoint to initiate PoC registration via Stripe checkout
 * 
 * POST /api/poc/[hash]/register
 * 
 * Creates a Stripe checkout session for $200 registration fee
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

// Force dynamic rendering - this route must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const REGISTRATION_FEE = 20000 // $200.00 in cents

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    // Extract hash from params outside try block for error handling
    if (!params) {
        debugError('RegisterPoC', 'Params object is missing', {})
        return NextResponse.json(
            { error: 'Invalid request: missing parameters' },
            { status: 400 }
        )
    }
    
    const submissionHash = params?.hash || 'unknown'
    
    try {
        if (!submissionHash || submissionHash === 'unknown') {
            debugError('RegisterPoC', 'Missing submission hash in params', { params })
            return NextResponse.json(
                { error: 'Missing submission hash' },
                { status: 400 }
            )
        }
        
        debug('RegisterPoC', 'Initiating PoC registration', { submissionHash })
        
        // Verify user is authenticated
        let supabase
        try {
            supabase = createClient()
        } catch (supabaseError) {
            debugError('RegisterPoC', 'Failed to create Supabase client', supabaseError)
            return NextResponse.json(
                { 
                    error: 'Authentication service error',
                    message: supabaseError instanceof Error ? supabaseError.message : 'Failed to initialize authentication'
                },
                { status: 500 }
            )
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debugError('RegisterPoC', 'Authentication failed', { 
                authError: authError?.message,
                hasUser: !!user 
            })
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        let contributions
        try {
            contributions = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
        } catch (dbError) {
            debugError('RegisterPoC', 'Database query error', dbError)
            return NextResponse.json(
                { 
                    error: 'Database error',
                    message: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            )
        }
        
        if (!contributions || contributions.length === 0) {
            debugError('RegisterPoC', 'Contribution not found', { submissionHash })
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            debugError('RegisterPoC', 'User is not the contributor', {
                contributor: contrib.contributor,
                userEmail: user.email
            })
            return NextResponse.json(
                { error: 'Forbidden: You can only register your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already registered
        if (contrib.registered) {
            debug('RegisterPoC', 'PoC already registered', { submissionHash })
            return NextResponse.json(
                { error: 'PoC is already registered' },
                { status: 400 }
            )
        }
        
        // Get Stripe instance
        if (!process.env.STRIPE_SECRET_KEY) {
            debugError('RegisterPoC', 'STRIPE_SECRET_KEY environment variable is missing', {})
            return NextResponse.json(
                { 
                    error: 'Stripe not configured',
                    message: 'STRIPE_SECRET_KEY environment variable is not set'
                },
                { status: 500 }
            )
        }
        
        // Sanitize the Stripe key - remove whitespace and invalid characters
        const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
        
        // Validate key format (supports standard sk_ keys and restricted ssk_ keys)
        if (!sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)) {
            debugError('RegisterPoC', 'Invalid Stripe key format', {
                keyPrefix: sanitizedKey.substring(0, 10) + '...',
                keyLength: sanitizedKey.length
            })
            return NextResponse.json(
                { 
                    error: 'Invalid Stripe key format',
                    message: 'Stripe key must start with sk_test_, sk_live_, ssk_test_, ssk_live_, rk_test_, or rk_live_'
                },
                { status: 500 }
            )
        }
        
        const stripe = new Stripe(sanitizedKey, {
            apiVersion: '2024-06-20'
        })
        
        // Create Stripe checkout session
        // Get base URL - must be a valid absolute URL for Stripe
        let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL
        
        // If no env var, try to get from request headers (for production)
        if (!baseUrl) {
            const host = request.headers.get('host')
            const protocol = request.headers.get('x-forwarded-proto') || 'https'
            if (host) {
                baseUrl = `${protocol}://${host}`
            }
        }
        
        // Fallback to localhost only in development
        if (!baseUrl) {
            baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
        }
        
        // Validate baseUrl is a valid absolute URL
        if (!baseUrl || !baseUrl.match(/^https?:\/\//)) {
            debugError('RegisterPoC', 'Invalid baseUrl for Stripe checkout', {
                baseUrl,
                NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
                NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
                NODE_ENV: process.env.NODE_ENV
            })
            return NextResponse.json(
                { 
                    error: 'Configuration error',
                    message: 'Site URL not configured. NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_WEBSITE_URL must be set to a valid absolute URL (e.g., https://your-app.vercel.app)'
                },
                { status: 500 }
            )
        }
        
        // Sanitize title for Stripe (max 500 chars, no special characters that might cause issues)
        const sanitizedTitle = (contrib.title || 'PoC Registration').substring(0, 500).replace(/[^\w\s-]/g, '')
        const productName = `PoC Registration: ${sanitizedTitle}`
        const productDescription = `Register PoC submission ${submissionHash.substring(0, 8)}... on Hard Hat L1 blockchain`
        
        debug('RegisterPoC', 'Creating Stripe checkout session', {
            baseUrl,
            productName: productName.substring(0, 100),
            submissionHash
        })
        
        let session
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
                            unit_amount: REGISTRATION_FEE,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${baseUrl}/dashboard?registration=success&hash=${submissionHash}`,
                cancel_url: `${baseUrl}/dashboard?registration=cancelled&hash=${submissionHash}`,
                client_reference_id: submissionHash,
                metadata: {
                    submission_hash: submissionHash,
                    contributor: contrib.contributor,
                    title: sanitizedTitle,
                    type: 'poc_registration',
                },
            })
        } catch (stripeError: any) {
            debugError('RegisterPoC', 'Stripe API error', {
                error: stripeError,
                type: stripeError?.type,
                code: stripeError?.code,
                message: stripeError?.message,
                param: stripeError?.param,
                statusCode: stripeError?.statusCode
            })
            
            // Return detailed error for debugging
            const errorResponse: any = {
                error: 'Stripe checkout error',
                message: stripeError?.message || 'Failed to create checkout session',
                details: stripeError?.type || 'unknown_error'
            }
            
            // Include additional details if available
            if (stripeError?.code) {
                errorResponse.code = stripeError.code
            }
            if (stripeError?.param) {
                errorResponse.param = stripeError.param
            }
            
            return NextResponse.json(errorResponse, { status: 500 })
        }
        
        debug('RegisterPoC', 'Stripe checkout session created', { 
            sessionId: session.id,
            submissionHash,
            checkoutUrl: session.url ? 'present' : 'missing'
        })
        
        // Validate session URL is present
        if (!session.url) {
            debugError('RegisterPoC', 'Stripe session created but URL is missing', {
                sessionId: session.id,
                session: JSON.stringify(session).substring(0, 200)
            })
            return NextResponse.json(
                { 
                    error: 'Stripe checkout error',
                    message: 'Failed to get checkout URL from Stripe session'
                },
                { status: 500 }
            )
        }
        
        return NextResponse.json({
            checkout_url: session.url,
            session_id: session.id
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorName = error instanceof Error ? error.name : 'Error'
        
        debugError('RegisterPoC', 'Unexpected error in registration endpoint', {
            error,
            errorName,
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            submissionHash
        })
        
        // Return detailed error for debugging (always include message, stack only in dev)
        const errorResponse: any = {
            error: 'Registration failed',
            message: errorMessage,
            error_type: errorName,
            submission_hash: submissionHash
        }
        
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
            errorResponse.stack = error.stack.substring(0, 1000)
        }
        
        return NextResponse.json(errorResponse, { status: 500 })
    }
}

