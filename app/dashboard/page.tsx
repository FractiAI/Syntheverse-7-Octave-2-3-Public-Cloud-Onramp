import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, CreditCard, User, TrendingUp, Award, Coins } from "lucide-react"

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {data.user.email}. Manage your contributions and billing.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submit Contribution</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Upload your work for AI evaluation
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
                        <Link href="/explorer">
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
                            <Badge variant="secondary">Free Tier</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Contributions</span>
                            <span className="text-sm text-muted-foreground">0 submitted</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">SYNTH Tokens</span>
                            <span className="text-sm text-muted-foreground">0 earned</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Quick Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">System Status</span>
                            <Badge variant="default" className="bg-green-500">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Evaluation</span>
                            <span className="text-sm text-muted-foreground">Available</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Blockchain</span>
                            <span className="text-sm text-muted-foreground">Connected</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Getting Started */}
            <Card>
                <CardHeader>
                    <CardTitle>Get Started with Syntheverse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <h4 className="font-medium">1. Submit Your Work</h4>
                            <p className="text-sm text-muted-foreground">
                                Upload PDFs or text content for hydrogen-holographic evaluation
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">2. AI Evaluation</h4>
                            <p className="text-sm text-muted-foreground">
                                Receive scores across novelty, density, coherence, and alignment dimensions
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">3. Earn Rewards</h4>
                            <p className="text-sm text-muted-foreground">
                                Get SYNTH tokens and metallic amplifications based on your contribution quality
                            </p>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Link href="/submit">
                            <Button>Start Your First Contribution</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}