import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/app/auth/actions';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateUsernameForm } from '@/components/UpdateUsernameForm';

export default async function AccountPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const user = data.user;

  // Get user data from database
  let dbUser = null;
  try {
    const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email!));
    if (userResult.length > 0) {
      dbUser = userResult[0];
    }
  } catch (dbError) {
    console.error('Error fetching user data:', dbError);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account preferences and settings</p>
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
              <Label htmlFor="username">Username</Label>
              <UpdateUsernameForm
                currentName={dbUser?.name || user.email?.split('@')[0] || 'User'}
              />
            </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" value={user.id} disabled className="bg-muted font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                <Shield className="mr-1 h-3 w-3" />
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
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
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
            <div className="space-y-3 text-sm">
              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span>Gold: Research</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                  <span>Silver: Technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-600"></div>
                  <span>Copper: Alignment</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Combination Amplifications:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    • Gold + Silver + Copper: <strong>1.5×</strong>
                  </div>
                  <div>
                    • Gold + Silver: <strong>1.25×</strong>
                  </div>
                  <div>
                    • Gold + Copper: <strong>1.2×</strong>
                  </div>
                  <div>
                    • Silver + Copper: <strong>1.15×</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">SYNTH Token Rewards</h4>
            <p className="text-sm text-muted-foreground">
              Earn SYNTH tokens based on your contribution quality. Tokens are allocated when your
              PoC is approved and registered on-chain, based on your PoC Score and available tokens
              at the time of registration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
