import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, CreditCard, User, TrendingUp, Award, Coins, CheckCircle2, XCircle, Clock } from "lucide-react"
import { getStripePlan } from "@/utils/stripe/api"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { PoCDashboardStats } from '@/components/PoCDashboardStats'

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const user = data.user

    // Get user data from database
    let dbUser = null
    let stripePlan = "Free"
    
    try {
        const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        if (userResult.length > 0) {
            dbUser = userResult[0]
            // Get Stripe plan name
            try {
                stripePlan = await getStripePlan(user.email!)
            } catch (err) {
                console.error("Error getting Stripe plan:", err)
            }
        }
    } catch (dbError) {
        console.error("Error fetching user data:", dbError)
    }

    const planStatus = dbUser?.plan && dbUser.plan !== "none" ? "active" : "inactive"
    const planBadgeVariant = planStatus === "active" ? "default" : "secondary"

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {user.email}. Manage your account and view your contributions.
                </p>
            </div>

            {/* Account Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Email</span>
                                <span className="text-sm font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Name</span>
                                <span className="text-sm font-medium">{dbUser?.name || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={planBadgeVariant} className="capitalize">
                                    {planStatus}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Current Plan</span>
                                <Badge variant="outline" className="text-sm font-semibold">
                                    {stripePlan}
                                </Badge>
                            </div>
                            {dbUser?.plan && dbUser.plan !== "none" ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Subscription Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <XCircle className="h-4 w-4 text-yellow-500" />
                                    <span>No Active Subscription</span>
                                </div>
                            )}
                            <Link href="/subscribe" className="block mt-4">
                                <Button variant="outline" size="sm" className="w-full">
                                    {planStatus === "active" ? "Manage Plan" : "Choose Plan"}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Link href="/billing-portal">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Billing Portal
                                </Button>
                            </Link>
                            <Link href="/account">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <User className="h-4 w-4 mr-2" />
                                    Account Settings
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PoC Evaluation Statistics - Client Component for API calls */}
            <PoCDashboardStats />

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submit Contribution</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Upload your work for PoC evaluation
                        </p>
                        <Link href="/submit">
                            <Button size="sm" className="w-full">Submit Now</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Billing & Plans</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Manage subscriptions and payments
                        </p>
                        <Link href="/subscribe">
                            <Button variant="outline" size="sm" className="w-full">Manage Billing</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Settings</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Update profile and preferences
                        </p>
                        <Link href="/account">
                            <Button variant="outline" size="sm" className="w-full">View Account</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Explore System</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            View ecosystem statistics
                        </p>
                        <Link href="/subscribe">
                            <Button variant="outline" size="sm" className="w-full">Explore</Button>
                        </Link>
                    </CardContent>
                </Card>
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
                            <span className="text-sm font-medium">Account Type</span>
                            <Badge variant={planBadgeVariant}>{stripePlan}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Subscription Status</span>
                            {planStatus === "active" ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600">Active</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-yellow-600">Inactive</span>
                                </div>
                            )}
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

            {/* Getting Started */}
            {planStatus === "inactive" && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Get Started with Syntheverse</CardTitle>
                        <CardDescription>
                            Choose a subscription plan to unlock full features
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <h4 className="font-medium">1. Choose Your Plan</h4>
                                <p className="text-sm text-muted-foreground">
                                    Select a subscription tier that fits your needs
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">2. Complete Payment</h4>
                                <p className="text-sm text-muted-foreground">
                                    Secure checkout powered by Stripe
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">3. Start Contributing</h4>
                                <p className="text-sm text-muted-foreground">
                                    Begin submitting your work for PoC evaluation
                                </p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <Link href="/subscribe">
                                <Button className="w-full md:w-auto">Choose Your Plan</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
