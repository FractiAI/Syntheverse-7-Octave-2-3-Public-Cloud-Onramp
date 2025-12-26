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

const REGISTRATION_FEE = 20000 // $200.00 in cents

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ hash: string }> | { hash: string } }
) {
    const resolvedParams = await Promise.resolve(params)
    const submissionHash = resolvedParams.hash
    debug('RegisterPoC', 'Initiating PoC registration', { submissionHash })
    
    try {
        // Verify user is authenticated
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            return NextResponse.json(
                { error: 'Forbidden: You can only register your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already registered
        if (contrib.registered) {
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
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `PoC Registration: ${contrib.title}`,
                            description: `Register PoC submission ${submissionHash.substring(0, 8)}... on Hard Hat L1 blockchain`,
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
                title: contrib.title,
                type: 'poc_registration',
            },
        })
        
        debug('RegisterPoC', 'Stripe checkout session created', { 
            sessionId: session.id,
            submissionHash 
        })
        
        return NextResponse.json({
            checkout_url: session.url,
            session_id: session.id
        })
    } catch (error) {
        debugError('RegisterPoC', 'Error creating registration checkout', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

