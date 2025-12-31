/**
 * API endpoint to fetch Financial Alignment PoC products from Stripe
 * 
 * GET /api/financial-alignment/products
 * 
 * Returns list of active Stripe products used for voluntary ecosystem support.
 * 
 * Expected Financial Alignment Products:
 * (IDs are kept for reliability; UI copy should frame these as support levels.)
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 500 }
            )
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
            apiVersion: '2024-06-20'
        })

        // Fetch all active products (include inactive ones too to catch all known IDs)
        const allProducts = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
            limit: 100
        })
        
        // Also fetch the specific known product IDs to ensure we get all of them
        const knownProductIds = [
            'prod_ThCg591XcQWl8v', // $10,000
            'prod_ThCivl88RobmOP', // $25,000
            'prod_ThCjft1qMQNBVo', // $50,000
            'prod_ThCkM2ilGNZ1mo', // $100,000
            'prod_ThCn3TWm8mrVqT', // $250,000
        ]
        
        // Fetch known products individually to ensure we get them even if they're inactive or missing prices
        // Also fetch their prices separately if needed
        const knownProducts = await Promise.all(
            knownProductIds.map(async (productId) => {
                try {
                    const product = await stripe.products.retrieve(productId, {
                        expand: ['default_price']
                    })
                    
                    // If default_price is just an ID string, fetch the price object
                    if (typeof product.default_price === 'string') {
                        try {
                            const price = await stripe.prices.retrieve(product.default_price)
                            product.default_price = price
                        } catch (priceErr) {
                            debugError('FinancialAlignmentProducts', `Failed to fetch price for product ${productId}`, priceErr)
                        }
                    }
                    
                    return product
                } catch (err) {
                    debugError('FinancialAlignmentProducts', `Failed to fetch known product ${productId}`, err)
                    return null
                }
            })
        )
        
        // Merge products, prioritizing known products to ensure all are included
        const productMap = new Map<string, Stripe.Product>()
        
        // Add all products from list
        allProducts.data.forEach(product => {
            productMap.set(product.id, product)
        })
        
        // Override/add known products (ensures we have all 5)
        knownProducts.forEach(product => {
            if (product) {
                productMap.set(product.id, product)
            }
        })
        
        const products = { data: Array.from(productMap.values()) }


        // Filter for ecosystem support products.
        // Always include known product IDs; otherwise include metadata.type matches.
        const financialAlignmentProducts = products.data
            .filter(product => {
                // Always include known product IDs
                if (knownProductIds.includes(product.id)) {
                    return true
                }
                
                const name = product.name.toLowerCase()
                const metadataType = product.metadata?.type?.toLowerCase()
                const hasSupportKeyword = name.includes('support') || name.includes('contribution')
                const isSupport = metadataType === 'financial_support' || metadataType === 'financial_alignment' || metadataType === 'financial_alignment_poc'
                
                return isSupport || hasSupportKeyword
            })
            .map(product => {
                // Handle both expanded price object and price ID string
                let price: Stripe.Price | null = null
                let priceId: string | null = null
                
                if (typeof product.default_price === 'string') {
                    priceId = product.default_price
                } else if (product.default_price) {
                    price = product.default_price as Stripe.Price
                    priceId = price.id
                }
                
                // Calculate amount
                let amount = 0
                let currency = 'usd'
                
                if (price && typeof price.unit_amount === 'number') {
                    amount = price.unit_amount / 100
                    currency = price.currency || 'usd'
                }
                
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description || '',
                    price_id: priceId,
                    amount: amount,
                    currency: currency,
                    metadata: product.metadata || {}
                }
            })
            .filter(product => {
                // Always include known product IDs, even if they don't have prices yet
                return knownProductIds.includes(product.id) || product.price_id !== null
            })
            .sort((a, b) => {
                // Sort by amount, but if amounts are equal, sort by known order
                if (a.amount !== b.amount) {
                    return a.amount - b.amount
                }
                // Fallback to known product order
                const aIndex = knownProductIds.indexOf(a.id)
                const bIndex = knownProductIds.indexOf(b.id)
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex
                }
                return 0
            })

        debug('FinancialAlignmentProducts', 'Fetched products', {
            count: financialAlignmentProducts.length,
            products: financialAlignmentProducts.map(p => ({ name: p.name, amount: p.amount }))
        })

        return NextResponse.json({
            products: financialAlignmentProducts
        })
    } catch (error) {
        debugError('FinancialAlignmentProducts', 'Error fetching products', error)
        return NextResponse.json(
            { error: 'Failed to fetch products', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

