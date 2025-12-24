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
        // Update the name in users_table using user ID (primary key, most reliable)
        await db
            .update(usersTable)
            .set({ name: newName.trim() })
            .where(eq(usersTable.id, user.id))

        revalidatePath('/account')
        return { success: true }
    } catch (err) {
        console.error('Error updating username:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Error details:', {
            error: err,
            userId: user.id,
            email: user.email,
            newName: newName.trim()
        })
        return { 
            success: false, 
            error: errorMessage.includes('does not exist') || errorMessage.includes('relation')
                ? 'Database error. Please contact support.'
                : `Failed to update username: ${errorMessage}`
        }
    }
}

