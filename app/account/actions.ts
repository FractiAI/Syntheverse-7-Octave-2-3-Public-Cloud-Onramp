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
                return { 
                    success: false, 
                    error: 'User account not found in database. Please contact support or sign up again.'
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
        
        console.error('Error details:', {
            error: err,
            errorMessage,
            errorStack,
            userId: user.id,
            email: user.email,
            newName: newName.trim()
        })
        
        // Provide more helpful error messages
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
            return { 
                success: false, 
                error: `Database table not found. Please verify database migrations are applied. Error: ${errorMessage}`
            }
        }
        
        if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
            return { 
                success: false, 
                error: 'Database connection timeout. Please try again in a moment.'
            }
        }
        
        return { 
            success: false, 
            error: `Failed to update username: ${errorMessage}`
        }
    }
}

