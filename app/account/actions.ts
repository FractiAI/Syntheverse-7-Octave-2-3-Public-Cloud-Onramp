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
        // Update the name in users_table
        await db
            .update(usersTable)
            .set({ name: newName.trim() })
            .where(eq(usersTable.email, user.email!))

        revalidatePath('/account')
        return { success: true }
    } catch (err) {
        console.error('Error updating username:', err)
        return { success: false, error: 'Failed to update username' }
    }
}

