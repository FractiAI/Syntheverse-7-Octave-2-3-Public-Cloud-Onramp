/**
 * Test endpoint to verify Stripe connection and configuration
 * GET /api/test/stripe
 * 
 * Tests:
 * - Stripe key presence and format
 * - Stripe API connectivity
 * - Checkout session creation
 * - Base URL configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface TestResult {
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
    details?: any
}

export async function GET(request: NextRequest) {
    const results: TestResult[] = []
    
    // Test 1: Check if Stripe key exists
    results.push({
        name: 'Stripe Key Presence',
        status: process.env.STRIPE_SECRET_KEY ? 'pass' : 'fail',
        message: process.env.STRIPE_SECRET_KEY 
            ? 'STRIPE_SECRET_KEY is set' 
            : 'STRIPE_SECRET_KEY is missing',
        details: process.env.STRIPE_SECRET_KEY 
            ? { keyPrefix: process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...', length: process.env.STRIPE_SECRET_KEY.length }
            : undefined
    })
    
    // Test 2: Validate Stripe key format
    if (process.env.STRIPE_SECRET_KEY) {
        const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '')
        const isValidFormat = sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)
        
        results.push({
            name: 'Stripe Key Format',
            status: isValidFormat ? 'pass' : 'fail',
            message: isValidFormat 
                ? `Valid Stripe key format: ${sanitizedKey.substring(0, 7)}...`
                : `Invalid Stripe key format. Must start with sk_test_, sk_live_, ssk_test_, ssk_live_, rk_test_, or rk_live_`,
            details: {
                keyPrefix: sanitizedKey.substring(0, 15) + '...',
                keyLength: sanitizedKey.length,
                matchedPattern: isValidFormat ? sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)?.[0] : null
            }
        })
        
        // Test 3: Test Stripe API connectivity
        if (isValidFormat) {
            try {
                const stripe = new Stripe(sanitizedKey, {
                    apiVersion: '2024-06-20'
                })
                
                // Try to retrieve account information (lightweight API call)
                const account = await stripe.accounts.retrieve()
                
                results.push({
                    name: 'Stripe API Connectivity',
                    status: 'pass',
                    message: `Successfully connected to Stripe API`,
                    details: {
                        accountId: account.id,
                        country: account.country,
                        defaultCurrency: account.default_currency,
                        type: account.type,
                        chargesEnabled: account.charges_enabled,
                        payoutsEnabled: account.payouts_enabled
                    }
                })
                
                // Test 4: Test checkout session creation
                try {
                    // Get base URL
                    let baseUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL
                    
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
                    
                    results.push({
                        name: 'Base URL Configuration',
                        status: baseUrl ? 'pass' : 'warning',
                        message: baseUrl 
                            ? `Base URL configured: ${baseUrl}`
                            : 'Base URL not configured. Using fallback.',
                        details: {
                            baseUrl,
                            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
                            NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'not set',
                            NODE_ENV: process.env.NODE_ENV,
                            host: request.headers.get('host'),
                            protocol: request.headers.get('x-forwarded-proto') || 'https'
                        }
                    })
                    
                    if (baseUrl) {
                        // Validate baseUrl format
                        const isValidUrl = baseUrl.match(/^https?:\/\//)
                        
                        if (isValidUrl) {
                            // Try to create a test checkout session
                            const testSession = await stripe.checkout.sessions.create({
                                payment_method_types: ['card'],
                                line_items: [
                                    {
                                        price_data: {
                                            currency: 'usd',
                                            product_data: {
                                                name: 'Test PoC Registration',
                                                description: 'Test checkout session creation',
                                            },
                                            unit_amount: 20000, // $200.00
                                        },
                                        quantity: 1,
                                    },
                                ],
                                mode: 'payment',
                                success_url: `${baseUrl}/dashboard?test=success`,
                                cancel_url: `${baseUrl}/dashboard?test=cancelled`,
                                metadata: {
                                    test: 'true',
                                    type: 'stripe_test'
                                },
                            })
                            
                            results.push({
                                name: 'Checkout Session Creation',
                                status: testSession.url ? 'pass' : 'fail',
                                message: testSession.url 
                                    ? `Successfully created test checkout session`
                                    : `Checkout session created but URL is missing`,
                                details: {
                                    sessionId: testSession.id,
                                    url: testSession.url || 'missing',
                                    urlLength: testSession.url?.length || 0,
                                    status: testSession.status,
                                    paymentStatus: testSession.payment_status
                                }
                            })
                            
                            // Clean up test session (expire it immediately)
                            if (testSession.id) {
                                try {
                                    await stripe.checkout.sessions.expire(testSession.id)
                                } catch (expireError) {
                                    // Ignore expire errors
                                }
                            }
                        } else {
                            results.push({
                                name: 'Checkout Session Creation',
                                status: 'fail',
                                message: `Invalid base URL format: ${baseUrl}`,
                                details: {
                                    baseUrl,
                                    reason: 'Must start with http:// or https://'
                                }
                            })
                        }
                    } else {
                        results.push({
                            name: 'Checkout Session Creation',
                            status: 'fail',
                            message: 'Cannot create checkout session: Base URL is required',
                            details: {
                                reason: 'NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_WEBSITE_URL must be set'
                            }
                        })
                    }
                } catch (checkoutError: any) {
                    results.push({
                        name: 'Checkout Session Creation',
                        status: 'fail',
                        message: `Failed to create checkout session: ${checkoutError?.message || 'Unknown error'}`,
                        details: {
                            error: checkoutError?.message,
                            type: checkoutError?.type,
                            code: checkoutError?.code,
                            param: checkoutError?.param,
                            statusCode: checkoutError?.statusCode
                        }
                    })
                }
            } catch (stripeError: any) {
                results.push({
                    name: 'Stripe API Connectivity',
                    status: 'fail',
                    message: `Failed to connect to Stripe API: ${stripeError?.message || 'Unknown error'}`,
                    details: {
                        error: stripeError?.message,
                        type: stripeError?.type,
                        code: stripeError?.code,
                        statusCode: stripeError?.statusCode
                    }
                })
            }
        } else {
            results.push({
                name: 'Stripe API Connectivity',
                status: 'warning',
                message: 'Skipped: Invalid key format',
                details: {}
            })
        }
    } else {
        results.push({
            name: 'Stripe Key Format',
            status: 'warning',
            message: 'Skipped: No key to validate',
            details: {}
        })
    }
    
    // Summary
    const passed = results.filter(r => r.status === 'pass').length
    const failed = results.filter(r => r.status === 'fail').length
    const warnings = results.filter(r => r.status === 'warning').length
    const total = results.length
    
    const allPassed = failed === 0
    
    return NextResponse.json({
        success: allPassed,
        summary: {
            total,
            passed,
            failed,
            warnings
        },
        results,
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            hasSiteUrl: !!(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL)
        }
    }, {
        status: allPassed ? 200 : 500
    })
}

