import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText } from "lucide-react"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { PoCDashboardStats } from '@/components/PoCDashboardStats'
import { PoCArchive } from '@/components/PoCArchive'

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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, {user.email}. Manage your account and view your contributions.
                    </p>
                </div>
                <Link href="/submit">
                    <Button size="lg">
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Contribution
                    </Button>
                </Link>
            </div>

            {/* PoC Evaluation Statistics - Client Component for API calls */}
            <PoCDashboardStats />

            {/* PoC Submissions Archive */}
            <PoCArchive userEmail={user.email!} />

        </div>
    )
}
