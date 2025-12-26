import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, User, TrendingUp, Award, Coins, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { PoCDashboardStats } from '@/components/PoCDashboardStats'
import dynamic from 'next/dynamic'

// Dynamically import 3D map component to avoid SSR issues with Three.js
const SandboxMap3DUpgraded = dynamic(
    () => import('@/components/SandboxMap3DUpgraded').then(mod => ({ default: mod.SandboxMap3DUpgraded })),
    { 
        ssr: false,
        loading: () => (
            <Card>
                <CardContent className="flex items-center justify-center h-[800px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }
)

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

            {/* 3D Sandbox Map Visualization */}
            <div className="mt-8">
                <SandboxMap3DUpgraded />
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Your Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Contributor ID</span>
                            <span className="text-sm text-muted-foreground">{user.email?.split('@')[0] || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Stripe Customer ID</span>
                            <span className="text-sm text-muted-foreground font-mono text-xs">
                                {dbUser?.stripe_id ? `${dbUser.stripe_id.slice(0, 8)}...` : 'Not set'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Authentication</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Verified</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Database</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Connected</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">PoC System</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Integrated</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
