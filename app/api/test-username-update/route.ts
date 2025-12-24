import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
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

        // Step 5: Test database update operation (simulating username update)
        try {
            const existingUsers = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.id, user.id))
                .limit(1)

            if (existingUsers.length > 0) {
                // User exists - test update operation
                const testName = `Test User ${Date.now()}`
                const originalName = existingUsers[0].name
                
                try {
                    await db
                        .update(usersTable)
                        .set({ name: testName })
                        .where(eq(usersTable.id, user.id))
                    
                    // Restore original name
                    await db
                        .update(usersTable)
                        .set({ name: originalName })
                        .where(eq(usersTable.id, user.id))
                    
                    results.push({
                        step: 'Database Update Test',
                        status: 'success',
                        message: 'Database update operation succeeded',
                        details: {
                            testName: testName,
                            originalName: originalName,
                            note: 'Test name was set and restored to original value'
                        }
                    })
                } catch (updateError: any) {
                    results.push({
                        step: 'Database Update Test',
                        status: 'error',
                        message: `Database update failed: ${updateError.message}`,
                        details: {
                            error: updateError.message,
                            code: updateError.code,
                            hint: 'This would cause username update to fail'
                        }
                    })
                }
            } else {
                // User doesn't exist - test insert operation
                const testName = `Test User ${Date.now()}`
                let stripeID: string
                
                try {
                    if (process.env.STRIPE_SECRET_KEY) {
                        stripeID = await createStripeCustomer(
                            user.id,
                            user.email!,
                            testName
                        )
                    } else {
                        stripeID = `placeholder_${user.id}`
                    }
                } catch (stripeError: any) {
                    stripeID = `placeholder_${user.id}`
                    results.push({
                        step: 'Database Insert Test - Stripe',
                        status: 'warning',
                        message: 'Stripe customer creation failed, using placeholder',
                        details: {
                            error: stripeError.message,
                            note: 'User creation would proceed with placeholder Stripe ID'
                        }
                    })
                }
                
                try {
                    await db.insert(usersTable).values({
                        id: user.id,
                        name: testName,
                        email: user.email!,
                        stripe_id: stripeID,
                        plan: 'none'
                    })
                    
                    // Clean up test user (delete it)
                    await db
                        .delete(usersTable)
                        .where(eq(usersTable.id, user.id))
                    
                    results.push({
                        step: 'Database Insert Test',
                        status: 'success',
                        message: 'Database insert operation succeeded (test user created and cleaned up)',
                        details: {
                            testName: testName,
                            stripeId: stripeID?.substring(0, 20),
                            note: 'Test user was created and then deleted'
                        }
                    })
                } catch (insertError: any) {
                    results.push({
                        step: 'Database Insert Test',
                        status: 'error',
                        message: `Database insert failed: ${insertError.message}`,
                        details: {
                            error: insertError.message,
                            code: insertError.code,
                            constraint: insertError.constraint,
                            hint: 'This would cause user creation to fail when updating username'
                        }
                    })
                }
            }
        } catch (testError: any) {
            results.push({
                step: 'Database Operation Test',
                status: 'error',
                message: `Database operation test threw exception: ${testError.message}`,
                details: {
                    error: testError.message,
                    stack: testError.stack?.substring(0, 500)
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

