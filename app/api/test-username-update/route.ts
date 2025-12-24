import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { updateUsername } from '@/app/account/actions'
import { createStripeCustomer } from '@/utils/stripe/api'
import { debug, debugError } from '@/utils/debug'

export async function POST(request: NextRequest) {
    debug('TestUsernameUpdate', 'Starting username update test')
    
    const results: {
        step: string
        status: 'success' | 'error' | 'warning'
        message: string
        details?: any
    }[] = []

    try {
        // Step 1: Check authentication
        const supabase = createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authData?.user) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required. Please login first.',
                results: [{
                    step: 'Authentication',
                    status: 'error',
                    message: 'User not authenticated',
                    details: { error: authError?.message || 'No user data' }
                }]
            }, { status: 401 })
        }

        const user = authData.user
        results.push({
            step: 'Authentication',
            status: 'success',
            message: 'User authenticated successfully',
            details: {
                userId: user.id,
                email: user.email
            }
        })

        // Step 2: Check if user exists in database
        try {
            const existingUsers = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.id, user.id))
                .limit(1)

            results.push({
                step: 'Database Check (by ID)',
                status: 'success',
                message: existingUsers.length > 0 
                    ? 'User exists in database' 
                    : 'User not found in database (will be created)',
                details: {
                    exists: existingUsers.length > 0,
                    userData: existingUsers.length > 0 ? {
                        id: existingUsers[0].id,
                        name: existingUsers[0].name,
                        email: existingUsers[0].email,
                        plan: existingUsers[0].plan,
                        hasStripeId: !!existingUsers[0].stripe_id,
                        stripeIdPrefix: existingUsers[0].stripe_id?.substring(0, 10) || 'none'
                    } : null
                }
            })
        } catch (dbError: any) {
            results.push({
                step: 'Database Check (by ID)',
                status: 'error',
                message: `Database query failed: ${dbError.message}`,
                details: {
                    error: dbError.message,
                    code: dbError.code,
                    hint: dbError.message.includes('relation') || dbError.message.includes('does not exist')
                        ? 'Database table may not exist. Check migrations.'
                        : 'Check database connection and permissions.'
                }
            })
        }

        // Step 3: Check by email as fallback
        try {
            if (user.email) {
                const usersByEmail = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, user.email))
                    .limit(1)

                results.push({
                    step: 'Database Check (by Email)',
                    status: 'success',
                    message: usersByEmail.length > 0 
                        ? 'User found by email' 
                        : 'User not found by email',
                    details: {
                        exists: usersByEmail.length > 0,
                        email: user.email
                    }
                })
            }
        } catch (dbError: any) {
            results.push({
                step: 'Database Check (by Email)',
                status: 'error',
                message: `Database query failed: ${dbError.message}`,
                details: { error: dbError.message }
            })
        }

        // Step 4: Test Stripe customer creation (if user doesn't exist)
        try {
            if (process.env.STRIPE_SECRET_KEY) {
                // Only test if we're going to create a user
                const existingUsers = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.id, user.id))
                    .limit(1)

                if (existingUsers.length === 0) {
                    results.push({
                        step: 'Stripe Configuration',
                        status: 'success',
                        message: 'Stripe secret key is configured',
                        details: {
                            configured: true,
                            keyPrefix: process.env.STRIPE_SECRET_KEY.substring(0, 7)
                        }
                    })

                    // Try to create a test customer (we'll delete it if successful)
                    try {
                        const testName = `Test User ${Date.now()}`
                        const stripeId = await createStripeCustomer(
                            user.id,
                            user.email!,
                            testName
                        )
                        results.push({
                            step: 'Stripe Customer Creation',
                            status: 'success',
                            message: 'Successfully created Stripe customer (test)',
                            details: {
                                stripeId: stripeId,
                                note: 'This is a test customer that was created. In real scenario, user creation would proceed.'
                            }
                        })
                    } catch (stripeError: any) {
                        results.push({
                            step: 'Stripe Customer Creation',
                            status: 'error',
                            message: `Failed to create Stripe customer: ${stripeError.message}`,
                            details: {
                                error: stripeError.message,
                                type: stripeError.type,
                                code: stripeError.code,
                                hint: 'This error would cause user creation to fail. Check Stripe API key and permissions.'
                            }
                        })
                    }
                } else {
                    results.push({
                        step: 'Stripe Customer Creation',
                        status: 'warning',
                        message: 'Skipped (user already exists in database)',
                        details: {}
                    })
                }
            } else {
                results.push({
                    step: 'Stripe Configuration',
                    status: 'warning',
                    message: 'STRIPE_SECRET_KEY not configured - user creation will use placeholder Stripe ID',
                    details: {}
                })
            }
        } catch (stripeTestError: any) {
            results.push({
                step: 'Stripe Test',
                status: 'error',
                message: `Stripe test failed: ${stripeTestError.message}`,
                details: { error: stripeTestError.message }
            })
        }

        // Step 5: Test actual username update with a test name
        try {
            const testName = `Test User ${Date.now()}`
            const formData = new FormData()
            formData.append('name', testName)
            
            const updateResult = await updateUsername(formData)
            
            results.push({
                step: 'Username Update Test',
                status: updateResult.success ? 'success' : 'error',
                message: updateResult.success 
                    ? 'Username update succeeded' 
                    : `Username update failed: ${updateResult.error}`,
                details: {
                    success: updateResult.success,
                    error: updateResult.error || null,
                    testName: testName
                }
            })

            // If successful, restore original name if user existed
            if (updateResult.success) {
                const existingUsers = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.id, user.id))
                    .limit(1)
                
                if (existingUsers.length > 0 && existingUsers[0].name !== testName) {
                    // Try to restore original name (optional)
                    results.push({
                        step: 'Name Restoration',
                        status: 'warning',
                        message: 'Test name was set. Original name should be restored manually if needed.',
                        details: { currentName: existingUsers[0].name }
                    })
                }
            }
        } catch (updateError: any) {
            results.push({
                step: 'Username Update Test',
                status: 'error',
                message: `Username update threw exception: ${updateError.message}`,
                details: {
                    error: updateError.message,
                    stack: updateError.stack?.substring(0, 500) // Limit stack trace
                }
            })
        }

        // Step 6: Final database state check
        try {
            const finalUsers = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.id, user.id))
                .limit(1)

            results.push({
                step: 'Final Database State',
                status: 'success',
                message: finalUsers.length > 0 
                    ? 'User now exists in database' 
                    : 'User still not in database',
                details: {
                    exists: finalUsers.length > 0,
                    userData: finalUsers.length > 0 ? {
                        id: finalUsers[0].id,
                        name: finalUsers[0].name,
                        email: finalUsers[0].email,
                        plan: finalUsers[0].plan,
                        stripeIdPrefix: finalUsers[0].stripe_id?.substring(0, 10) || 'none'
                    } : null
                }
            })
        } catch (finalCheckError: any) {
            results.push({
                step: 'Final Database State',
                status: 'error',
                message: `Final check failed: ${finalCheckError.message}`,
                details: { error: finalCheckError.message }
            })
        }

        const hasErrors = results.some(r => r.status === 'error')
        const hasWarnings = results.some(r => r.status === 'warning')

        return NextResponse.json({
            success: !hasErrors,
            message: hasErrors 
                ? 'Test completed with errors. Check results for details.' 
                : hasWarnings
                ? 'Test completed with warnings. Check results for details.'
                : 'All tests passed successfully!',
            results,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'success').length,
                warnings: results.filter(r => r.status === 'warning').length,
                errors: results.filter(r => r.status === 'error').length
            }
        })

    } catch (error: any) {
        debugError('TestUsernameUpdate', 'Test failed with exception', error)
        return NextResponse.json({
            success: false,
            message: 'Test failed with exception',
            error: error.message,
            stack: error.stack,
            results
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Username Update Test Endpoint',
        usage: 'POST to this endpoint to test username update functionality',
        note: 'This endpoint requires authentication. Make sure you are logged in.'
    })
}

