/**
 * API endpoint to initiate voluntary ecosystem support via Stripe checkout
 * 
 * POST /api/financial-alignment/register
 * 
 * Body: { product_id: string, price_id: string }
 * 
 * Creates a Stripe checkout session for a support level.
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
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { product_id, price_id } = body

        if (!product_id || !price_id) {
            return NextResponse.json(
                { error: 'Missing required fields: product_id and price_id are required' },
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

        // Fetch product details from Stripe to get name
        let productName = 'Ecosystem Support'
        let productDescription = ''
        try {
            const product = await stripe.products.retrieve(product_id)
            productName = product.name
            productDescription = product.description || ''
        } catch (err) {
            debugError('FinancialAlignmentRegister', 'Failed to fetch product details', err)
        }

        // Checkout description (keep within Stripe's 500 char limit)
        const supportDescription = `Syntheverse Ecosystem Support: ${productName}.
Not a purchase, token sale, investment, or exchange of money for tokens. No expectation of profit/return.
SYNTH is a fixed-supply internal coordination marker; any recognition is optional, discretionary, and separate from support.`

        // Create Stripe checkout session using the price_id
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price_id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/dashboard?financial_support=success&product_id=${product_id}`,
            cancel_url: `${baseUrl}/dashboard?financial_support=cancelled`,
            metadata: {
                contributor: user.email!,
                type: 'financial_support',
                product_id: product_id,
                product_name: productName,
                support_only: 'true',
                not_a_purchase: 'true',
                not_a_token_sale: 'true',
                no_expectation_of_profit: 'true',
            },
            // Add custom description to payment intent metadata
            payment_intent_data: {
                description: supportDescription.substring(0, 500), // Stripe has 500 char limit
                metadata: {
                    support_only: 'true',
                    not_a_purchase: 'true',
                    not_a_token_sale: 'true',
                    no_expectation_of_profit: 'true',
                    purpose: 'Voluntary ecosystem support (infrastructure, research, operations)',
                }
            }
        })

        debug('FinancialAlignmentRegister', 'Checkout session created', {
            sessionId: session.id,
            productId: product_id,
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
        debugError('FinancialAlignmentRegister', 'Error creating checkout session', error)
        return NextResponse.json(
            { 
                error: 'Registration failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

