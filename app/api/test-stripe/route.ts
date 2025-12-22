import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'
import Stripe from 'stripe'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
    debug('TestStripe', 'Testing Stripe connection')
    
    const results: {
        step: string
        status: 'success' | 'error' | 'warning'
        message: string
        details?: any
    }[] = []
    
    try {
        // Step 1: Check environment variables
        results.push({
            step: 'Environment Variables',
            status: process.env.STRIPE_SECRET_KEY ? 'success' : 'error',
            message: process.env.STRIPE_SECRET_KEY 
                ? 'STRIPE_SECRET_KEY is configured' 
                : 'STRIPE_SECRET_KEY is missing',
            details: {
                hasKey: !!process.env.STRIPE_SECRET_KEY,
                keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none',
                keyLength: process.env.STRIPE_SECRET_KEY?.length || 0
            }
        })
        
        results.push({
            step: 'Publishable Key',
            status: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'success' : 'warning',
            message: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
                ? 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured' 
                : 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing',
            details: {
                hasKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
                keyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'none'
            }
        })
        
        // Step 2: Initialize Stripe
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({
                success: false,
                message: 'Stripe secret key not configured',
                results
            }, { status: 400 })
        }
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        
        results.push({
            step: 'Stripe Initialization',
            status: 'success',
            message: 'Stripe client initialized successfully',
            details: {
                apiVersion: stripe.getApiField('version')
            }
        })
        
        // Step 3: Test API connection - Get account info
        try {
            const account = await stripe.account.retrieve()
            results.push({
                step: 'API Connection',
                status: 'success',
                message: 'Successfully connected to Stripe API',
                details: {
                    accountId: account.id,
                    country: account.country,
                    type: account.type,
                    chargesEnabled: account.charges_enabled,
                    payoutsEnabled: account.payouts_enabled
                }
            })
        } catch (apiError: any) {
            results.push({
                step: 'API Connection',
                status: 'error',
                message: `Failed to connect to Stripe API: ${apiError.message}`,
                details: {
                    error: apiError.type || 'unknown',
                    code: apiError.code || 'none'
                }
            })
        }
        
        // Step 4: Test Billing Portal configuration
        try {
            const portalConfigs = await stripe.billingPortal.configurations.list({ limit: 1 })
            results.push({
                step: 'Billing Portal',
                status: portalConfigs.data.length > 0 ? 'success' : 'warning',
                message: portalConfigs.data.length > 0 
                    ? `Found ${portalConfigs.data.length} billing portal configuration(s)`
                    : 'No billing portal configurations found (using default)',
                details: {
                    configCount: portalConfigs.data.length,
                    defaultActive: portalConfigs.data.find(c => c.is_default)?.id || 'none'
                }
            })
        } catch (portalError: any) {
            results.push({
                step: 'Billing Portal',
                status: 'error',
                message: `Error checking billing portal: ${portalError.message}`,
                details: {
                    error: portalError.type || 'unknown'
                }
            })
        }
        
        // Step 5: Test Products/Prices (if any)
        try {
            const products = await stripe.products.list({ limit: 5 })
            results.push({
                step: 'Products',
                status: 'success',
                message: `Found ${products.data.length} product(s)`,
                details: {
                    productCount: products.data.length,
                    products: products.data.map(p => ({
                        id: p.id,
                        name: p.name,
                        active: p.active
                    }))
                }
            })
        } catch (productsError: any) {
            results.push({
                step: 'Products',
                status: 'warning',
                message: `Error fetching products: ${productsError.message}`,
                details: {
                    error: productsError.type || 'unknown'
                }
            })
        }
        
        // Step 6: Check authentication
        try {
            const supabase = createClient()
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (user && user.email) {
                results.push({
                    step: 'User Authentication',
                    status: 'success',
                    message: 'User is authenticated',
                    details: {
                        email: user.email,
                        userId: user.id
                    }
                })
                
                // Step 7: Check user's Stripe customer ID
                try {
                    const dbUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email))
                    
                    if (dbUser && dbUser.length > 0 && dbUser[0].stripe_id) {
                        // Test if customer exists in Stripe
                        try {
                            const customer = await stripe.customers.retrieve(dbUser[0].stripe_id)
                            results.push({
                                step: 'Stripe Customer',
                                status: 'success',
                                message: 'User has valid Stripe customer ID',
                                details: {
                                    customerId: dbUser[0].stripe_id,
                                    email: (customer as Stripe.Customer).email,
                                    created: new Date((customer as Stripe.Customer).created * 1000).toISOString()
                                }
                            })
                        } catch (customerError: any) {
                            results.push({
                                step: 'Stripe Customer',
                                status: 'error',
                                message: `Stripe customer ID exists but is invalid: ${customerError.message}`,
                                details: {
                                    customerId: dbUser[0].stripe_id,
                                    error: customerError.type || 'unknown'
                                }
                            })
                        }
                    } else {
                        results.push({
                            step: 'Stripe Customer',
                            status: 'warning',
                            message: 'User does not have a Stripe customer ID yet',
                            details: {
                                hasStripeId: false
                            }
                        })
                    }
                } catch (dbError: any) {
                    results.push({
                        step: 'Database Check',
                        status: 'warning',
                        message: `Could not check user database: ${dbError.message}`,
                        details: {
                            error: dbError.message
                        }
                    })
                }
            } else {
                results.push({
                    step: 'User Authentication',
                    status: 'warning',
                    message: 'No authenticated user (this is OK for testing)',
                    details: {
                        authError: authError?.message || 'none'
                    }
                })
            }
        } catch (authError: any) {
            results.push({
                step: 'User Authentication',
                status: 'warning',
                message: 'Could not check authentication',
                details: {
                    error: authError.message
                }
            })
        }
        
        const allSuccess = results.every(r => r.status === 'success' || r.status === 'warning')
        const hasErrors = results.some(r => r.status === 'error')
        
        return NextResponse.json({
            success: allSuccess && !hasErrors,
            message: hasErrors ? 'Stripe connection test completed with errors' : 'Stripe connection test completed successfully',
            results,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'success').length,
                warnings: results.filter(r => r.status === 'warning').length,
                errors: results.filter(r => r.status === 'error').length
            }
        })
    } catch (error) {
        debugError('TestStripe', 'Error in Stripe connection test', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to complete Stripe connection test',
            error: error instanceof Error ? error.message : String(error),
            results
        }, { status: 500 })
    }
}

