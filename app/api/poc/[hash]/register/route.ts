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
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            )
        }
        
        // Sanitize the Stripe key - remove whitespace and invalid characters
        const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
        
        // Validate key format
        if (!sanitizedKey.match(/^sk_(test|live)_/)) {
            return NextResponse.json(
                { error: 'Invalid Stripe key format' },
                { status: 500 }
            )
        }
        
        const stripe = new Stripe(sanitizedKey, {
            apiVersion: '2024-06-20'
        })
        
        // Create Stripe checkout session
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'
        
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
                param: stripeError?.param
            })
            return NextResponse.json(
                { 
                    error: 'Stripe checkout error',
                    message: stripeError?.message || 'Failed to create checkout session',
                    details: stripeError?.type || 'unknown_error'
                },
                { status: 500 }
            )
        }
        
        debug('RegisterPoC', 'Stripe checkout session created', { 
            sessionId: session.id,
            submissionHash 
        })
        
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

