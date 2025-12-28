import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText } from "lucide-react"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { PoCArchive } from '@/components/PoCArchive'
import { EpochTokenDisplay } from '@/components/EpochTokenDisplay'

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const user = data.user

    // Get user data from database
    let dbUser = null
    
    try {
        const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        if (userResult.length > 0) {
            dbUser = userResult[0]
        }
    } catch (dbError) {
        console.error("Error fetching user data:", dbError)
    }

    // Get display name: prefer database name, fallback to email username, then full email
    const displayName = dbUser?.name || user.email?.split('@')[0] || user.email || 'User'

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, {displayName}. Manage your account and view your contributions.
                    </p>
                </div>
                <Link href="/submit">
                    <Button size="lg">
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Contribution
                    </Button>
                </Link>
            </div>

            {/* Epoch and Token Display */}
            <EpochTokenDisplay />

            {/* PoC Submissions Archive */}
            <PoCArchive userEmail={user.email!} />

        </div>
    )
}
