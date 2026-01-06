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
import { BookOpen, Shield, Settings, FileText } from 'lucide-react';
import { SynthChat } from '@/components/SynthChat';
import { SandboxSelector } from '@/components/SandboxSelector';

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

  // Check user role
  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto space-y-4 px-4 py-6 md:space-y-6 md:px-6 md:py-8">
        {/* Sandbox Selector - Cockpit Control */}
        <div className="cockpit-panel p-3 md:p-4">
          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-between">
            <div className="cockpit-label text-xs uppercase tracking-wider">SANDBOX SELECTOR</div>
            <SandboxSelector />
          </div>
        </div>

        {/* System Broadcast Banners - Fetched from API */}
        <OperatorBroadcastBanner />

        {/* Command Zone - Welcome & Action Control */}
        <div className="cockpit-panel p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3">
            <div className="cockpit-label text-xs uppercase tracking-wider">
              SYNTHEVERSE PROTOCOL (PUBLIC) · FRACTIAI REFERENCE CLIENT
            </div>
            {/* Boot Sequence Indicator Lights */}
            <BootSequenceIndicators />
          </div>
          
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <div>
                <div className="cockpit-title text-xl md:text-2xl">{displayName.toUpperCase()}</div>
                <div className="cockpit-text mt-2 text-sm md:text-base">
                  You are using the FractiAI reference client to interact with the public Syntheverse
                  protocol. Records are verifiable and permanent; this UI does not represent protocol
                  ownership, centralized governance, or financial promises.
                </div>
              </div>
              <div className="cockpit-text border-l-4 border-[var(--hydrogen-amber)] bg-[var(--hydrogen-amber)]/5 px-3 py-2 text-xs md:px-4 md:py-2 md:text-sm">
                <strong>Liberating Contributions:</strong> Through our hydrogen spin MRI-based PoC
                protocol on the blockchain, your contributions are no longer gatekept—they become{' '}
                <strong>visible and demonstrable to all</strong> via HHF-AI MRI science and
                technology.
              </div>
            </div>
            
            {/* Action Controls */}
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
              <Link href="/fractiai" className="cockpit-lever inline-block text-center">
                <span className="mr-2">◎</span>
                FractiAI
              </Link>
              <Link href="/onboarding" className="cockpit-lever inline-block text-center">
                <BookOpen className="mr-2 inline h-4 w-4" />
                Onboarding Navigator
              </Link>
              <Link href="/submit" className="cockpit-lever inline-block text-center">
                <span className="mr-2">✎</span>
                Submit Contribution
              </Link>
              <Link href="/blog" className="cockpit-lever inline-block text-center">
                <FileText className="mr-2 inline h-4 w-4" />
                Blog
              </Link>
              <SynthChat />
              {isCreator && (
                <Link href="/creator/dashboard" className="cockpit-lever inline-block text-center">
                  <Shield className="mr-2 inline h-4 w-4" />
                  Creator Dashboard
                </Link>
              )}
              {isOperator && !isCreator && (
                <Link href="/operator/dashboard" className="cockpit-lever inline-block text-center">
                  <Settings className="mr-2 inline h-4 w-4" />
                  Operator Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Core Instrument Panel - Reactor Core */}
        <ReactorCore />

        {/* Genesis Button */}
        <div className="cockpit-panel p-3 md:p-4">
          <GenesisButton />
        </div>

        {/* Frontier Modules - PoC Archive */}
        <FrontierModule userEmail={user.email!} />
      </div>
    </div>
  );
}
