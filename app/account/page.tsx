import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, Settings, LogOut } from "lucide-react"
import { signOut } from '@/app/auth/actions'

export default async function AccountPage() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const user = data.user

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account preferences and settings
                </p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed. Contact support if needed.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={user.id}
                                disabled
                                className="bg-muted font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500">
                                <Shield className="h-3 w-3 mr-1" />
                                Active
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Account created {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-medium">Sign Out</h4>
                            <p className="text-sm text-muted-foreground">
                                Sign out of your account on this device
                            </p>
                        </div>
                        <form action={signOut}>
                            <Button variant="outline" type="submit">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            {/* Syntheverse Information */}
            <Card>
                <CardHeader>
                    <CardTitle>About Syntheverse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Hydrogen-Holographic Evaluation</h4>
                        <p className="text-sm text-muted-foreground">
                            Your contributions are evaluated using advanced AI across multiple dimensions:
                            novelty, density, coherence, and alignment with Syntheverse objectives.
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="font-medium">Metallic Amplifications</h4>
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Gold: 1.5× multiplier</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span>Silver: 1.2× multiplier</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span>Copper: 1.15× multiplier</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="font-medium">SYNTH Token Rewards</h4>
                        <p className="text-sm text-muted-foreground">
                            Earn SYNTH tokens based on your contribution quality. Approved contributions
                            are registered on-chain for $200, establishing your &ldquo;I was here first&rdquo; recognition.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

