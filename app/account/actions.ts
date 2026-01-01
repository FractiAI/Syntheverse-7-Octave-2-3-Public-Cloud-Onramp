"use server"

import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateUsername(formData: FormData) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        return { success: false, error: 'Not authenticated' }
    }

    const user = data.user
    const newName = formData.get('name') as string

    if (!newName || newName.trim().length === 0) {
        return { success: false, error: 'Username cannot be empty' }
    }

    if (newName.trim().length > 100) {
        return { success: false, error: 'Username must be 100 characters or less' }
    }

    try {
        // First verify the user exists in the database
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, user.id))
            .limit(1)

        if (existingUsers.length === 0) {
            // User doesn't exist in users_table - try to find by email as fallback
            const usersByEmail = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.email, user.email!))
                .limit(1)
            
            if (usersByEmail.length === 0) {
                // User doesn't exist at all - create the record automatically
                // Stripe is only used when anchoring/registering a qualified PoC (fee-based operator service)
                // Use a placeholder value that indicates "free user, Stripe customer created on-demand when needed"
                const stripeID = 'pending' // Placeholder - Stripe customer created when user registers a PoC
                console.log('Creating user account (Stripe customer will be created when user registers a PoC):', {
                    userId: user.id,
                    email: user.email,
                    name: newName.trim()
                })
                try {
                    
                    try {
                        await db.insert(usersTable).values({
                            id: user.id,
                            name: newName.trim(),
                            email: user.email!,
                            stripe_id: stripeID,
                            plan: 'none'
                        })
                    } catch (dbError) {
                        console.error('Error inserting user into database:', dbError)
                        const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
                        
                        // Check if it's a duplicate key error (user was created between checks)
                        if (dbErrorMsg.includes('unique constraint') || dbErrorMsg.includes('duplicate key')) {
                            // User was created by another process, just update the name
                            await db
                                .update(usersTable)
                                .set({ name: newName.trim() })
                                .where(eq(usersTable.id, user.id))
                            
                            revalidatePath('/account')
                            return { success: true }
                        }
                        
                        throw dbError // Re-throw to be caught by outer catch
                    }
                    
                    // User created successfully
                    revalidatePath('/account')
                    return { success: true }
                } catch (createError) {
                    console.error('Error creating user record:', createError)
                    const errorMsg = createError instanceof Error ? createError.message : String(createError)
                    const errorStack = createError instanceof Error ? createError.stack : undefined
                    const errorCode = (createError as any)?.code || (createError as any)?.constraint || undefined
                    
                    // Log detailed error information for debugging
                    console.error('User creation error details:', {
                        error: createError,
                        message: errorMsg,
                        code: errorCode,
                        stack: errorStack,
                        userId: user.id,
                        email: user.email,
                        name: newName.trim()
                    })
                    
                    // Provide more specific error messages
                    let userFriendlyError = 'Failed to create user account. Please try again or contact support.'
                    
                    if (errorMsg.includes('unique constraint') || errorMsg.includes('duplicate key')) {
                        userFriendlyError = 'An account with this information already exists. Please try refreshing the page.'
                    } else if (errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
                        userFriendlyError = 'Database configuration error. Please contact support.'
                    } else if (errorMsg.includes('timeout') || errorMsg.includes('connection')) {
                        userFriendlyError = 'Database connection timeout. Please try again in a moment.'
                    } else if (errorMsg.includes('Stripe')) {
                        userFriendlyError = 'Payment system error. Your account was created but payment setup failed. You can update your username later.'
                    } else if (errorMsg) {
                        // Include the actual error message for debugging (can be filtered in production)
                        userFriendlyError = `Failed to create user account: ${errorMsg}`
                    }
                    
                    return {
                        success: false,
                        error: userFriendlyError,
                        // Include detailed error in development/preview
                        ...(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' ? {
                            details: {
                                originalError: errorMsg,
                                code: errorCode,
                                stack: errorStack?.substring(0, 500) // Limit stack trace length
                            }
                        } : {})
                    }
                }
            }
            
            // User exists but with different ID - update by email instead
            await db
                .update(usersTable)
                .set({ name: newName.trim() })
                .where(eq(usersTable.email, user.email!))
        } else {
            // User exists - update by ID
            await db
                .update(usersTable)
                .set({ name: newName.trim() })
                .where(eq(usersTable.id, user.id))
        }

        revalidatePath('/account')
        return { success: true }
    } catch (err) {
        console.error('Error updating username:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        const errorStack = err instanceof Error ? err.stack : undefined
        const errorCode = (err as any)?.code || (err as any)?.constraint || undefined
        
        console.error('Error details:', {
            error: err,
            errorMessage,
            errorCode,
            errorStack,
            userId: user.id,
            email: user.email,
            newName: newName.trim()
        })
        
        // Provide more helpful error messages based on error type
        let userFriendlyError = 'Failed to update username. Please try again or contact support.'
        
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
            userFriendlyError = 'Database configuration error. Please contact support.'
        } else if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
            userFriendlyError = 'Database connection timeout. Please try again in a moment.'
        } else if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
            userFriendlyError = 'This username may already be in use. Please try a different name.'
        } else if (errorMessage.includes('permission denied') || errorMessage.includes('unauthorized')) {
            userFriendlyError = 'Permission denied. Please ensure you are logged in and try again.'
        } else if (errorMessage) {
            // Include the actual error message for better debugging
            userFriendlyError = `Failed to update username: ${errorMessage}`
        }
        
        return { 
            success: false, 
            error: userFriendlyError,
            // Include detailed error in development/preview
            ...(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' ? {
                details: {
                    originalError: errorMessage,
                    code: errorCode,
                    stack: errorStack?.substring(0, 500) // Limit stack trace length
                }
            } : {})
        }
    }
}

