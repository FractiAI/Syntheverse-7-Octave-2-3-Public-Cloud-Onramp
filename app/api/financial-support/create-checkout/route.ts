/**
 * API endpoint to create Stripe checkout session for financial support
 * 
 * POST /api/financial-support/create-checkout
 * 
 * Body: { amount_cents: number, support_type: string }
 * 
 * Creates a Stripe checkout session with direct pricing for ecosystem support.
 *
 * IMPORTANT: This is not a token purchase/sale/investment. Any internal token recognition is discretionary and
 * conceptually/procedurally separated from financial support.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user || !user.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { amount_cents, support_type } = body

        if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount_cents: must be a positive number' },
                { status: 400 }
            )
        }

        if (!support_type || typeof support_type !== 'string') {
            return NextResponse.json(
                { error: 'Missing required field: support_type' },
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

        const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '')
        const stripe = new Stripe(sanitizedKey, {
            apiVersion: '2024-06-20'
        })

        // Get base URL
        let baseUrl: string | undefined = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL)?.trim()
        
        if (!baseUrl) {
            const host = request.headers.get('host')
            const protocol = request.headers.get('x-forwarded-proto') || 'https'
            if (host) {
                baseUrl = `${protocol}://${host}`
            }
        }
        
        if (!baseUrl) {
            baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined
        }
        
        if (!baseUrl || !baseUrl.match(/^https?:\/\//)) {
            return NextResponse.json(
                { error: 'Configuration error: Site URL not configured' },
                { status: 500 }
            )
        }

        const productName = `${support_type} - Syntheverse Ecosystem Support`
        const productDescription = `Voluntary ecosystem support for Syntheverse infrastructure, research, and operations. Not a purchase, token sale, investment, or exchange of money for tokens. No expectation of profit/return. SYNTH is a fixed-supply internal coordination marker; any recognition is optional, discretionary, and separate from support.`

        // Create Stripe checkout session with price_data (direct pricing)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productName,
                            description: productDescription.substring(0, 500), // Stripe has 500 char limit
                        },
                        unit_amount: Math.round(amount_cents),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/dashboard?financial_support=success&support_type=${encodeURIComponent(support_type)}`,
            cancel_url: `${baseUrl}/submit?financial_support=cancelled`,
            metadata: {
                contributor: user.email,
                type: 'financial_support',
                support_type: support_type,
                amount_cents: amount_cents.toString(),
                support_only: 'true',
                not_a_purchase: 'true',
                not_a_token_sale: 'true',
                no_expectation_of_profit: 'true',
            },
            payment_intent_data: {
                description: productDescription.substring(0, 500),
                metadata: {
                    support_only: 'true',
                    not_a_purchase: 'true',
                    not_a_token_sale: 'true',
                    no_expectation_of_profit: 'true',
                    purpose: 'Voluntary ecosystem support (infrastructure, research, operations)',
                    support_type: support_type,
                }
            }
        })

        debug('FinancialSupportCheckout', 'Checkout session created', {
            sessionId: session.id,
            supportType: support_type,
            amountCents: amount_cents,
        })

        if (!session.url) {
            return NextResponse.json(
                { error: 'Failed to get checkout URL from Stripe session' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            checkout_url: session.url,
            session_id: session.id
        })
    } catch (error) {
        debugError('FinancialSupportCheckout', 'Error creating checkout session', error)
        return NextResponse.json(
            { 
                error: 'Checkout creation failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

