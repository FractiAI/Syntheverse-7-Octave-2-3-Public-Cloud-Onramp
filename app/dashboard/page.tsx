import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { FrontierModule } from '@/components/FrontierModule';
import { ReactorCore } from '@/components/ReactorCore';
import { BootSequenceIndicators } from '@/components/BootSequenceIndicators';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { GenesisButton } from '@/components/GenesisButton';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
// Optional ecosystem support is intentionally not placed in the primary beta cockpit.
// The reference client stays protocol-first and avoids any "package" framing in the main dashboard.
import { BookOpen, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
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

  // Get display name: prefer database name, fallback to email username, then full email
  const displayName = dbUser?.name || user.email?.split('@')[0] || user.email || 'User';

  // Check if user is Creator - direct email check (hard-coded)
  const isCreator = user.email?.toLowerCase() === 'info@fractiai.com';

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto space-y-8 px-6 py-8">
        {/* Operator Broadcast Banner */}
        <OperatorBroadcastBanner
          message="Welcome to Syntheverse! SYNTH90T MOTHERLODE VAULT opens Spring Equinox, March 20, 2026. All qualifying PoCs will be registered on-chain and allocated SYNTH, by score. Be sure to get your best work in by March 19."
          nature="milestone"
          storageKey="motherlode_vault_opening_banner"
        />

        {/* Command Zone - Welcome & Action Control */}
        <div className="cockpit-panel p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <div className="cockpit-label">
                  SYNTHEVERSE PROTOCOL (PUBLIC) · FRACTIAI REFERENCE CLIENT
                </div>
                {/* Boot Sequence Indicator Lights */}
                <BootSequenceIndicators />
              </div>
              <div className="cockpit-title mt-1 text-2xl">{displayName.toUpperCase()}</div>
              <div className="cockpit-text mt-2">
                You are using the FractiAI reference client to interact with the public Syntheverse
                protocol. Records are verifiable and permanent; this UI does not represent protocol
                ownership, centralized governance, or financial promises.
              </div>
              <div className="cockpit-text bg-[var(--hydrogen-amber)]/5 mt-3 border-l-4 border-[var(--hydrogen-amber)] px-4 py-2 text-sm">
                <strong>Liberating Contributions:</strong> Through our hydrogen spin MRI-based PoC
                protocol on the blockchain, your contributions are no longer gatekept—they become{' '}
                <strong>visible and demonstrable to all</strong> via HHF-AI MRI science and
                technology.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/fractiai" className="cockpit-lever inline-block">
                <span className="mr-2">◎</span>
                FractiAI
              </Link>
              <Link href="/onboarding" className="cockpit-lever inline-block">
                <BookOpen className="mr-2 inline h-4 w-4" />
                Onboarding Navigator
              </Link>
              <Link href="/submit" className="cockpit-lever inline-block">
                <span className="mr-2">✎</span>
                Submit Contribution
              </Link>
              {isCreator && (
                <Link href="/creator/dashboard" className="cockpit-lever inline-block">
                  <Shield className="mr-2 inline h-4 w-4" />
                  Creator Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Core Instrument Panel - Reactor Core */}
        <ReactorCore />

        {/* Genesis Button */}
        <div className="cockpit-panel p-4">
          <GenesisButton />
        </div>

        {/* Frontier Modules - PoC Archive */}
        <FrontierModule userEmail={user.email!} />
      </div>
    </div>
  );
}
