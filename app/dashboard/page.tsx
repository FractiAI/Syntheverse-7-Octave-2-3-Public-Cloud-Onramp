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
import { SandboxNavigator } from '@/components/SandboxNavigator';
import { SynthChatNavigator } from '@/components/SynthChatNavigator';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';

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
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={false} />

      {/* Cockpit Grid Layout - Multi-column control center */}
      <div className="cockpit-grid-layout">
        {/* Left Sidebar - Empty or can be used for other content */}
        <aside className="cockpit-sidebar">
          {/* Left sidebar content can be added here if needed */}
        </aside>

        {/* Central Instrument Cluster */}
        <main className="cockpit-main">
          {/* Cockpit Header Panel - Contributor Identity */}
          <div className="cockpit-panel border-l-4 border-[var(--hydrogen-amber)] p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="cockpit-label mb-2 flex items-center gap-2">
                  <span className="text-[var(--hydrogen-amber)]">◎</span>
                  CONTRIBUTOR COCKPIT
                </div>
                <h1 className="cockpit-title mb-2 text-2xl md:text-3xl">Proof-of-Contribution Station</h1>
                <p className="cockpit-text opacity-80 text-sm">
                  Submit, evaluate, and anchor contributions to the Syntheverse protocol. All records are verifiable and permanent on Base Mainnet.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BootSequenceIndicators />
              </div>
            </div>
            <div className="cockpit-text mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs opacity-60">
              FRACTIAI RESEARCH TEAM · PROTOCOL OPERATOR REFERENCE CLIENT
            </div>
          </div>

          {/* Core Instrument Panel - Reactor Core */}
          <ReactorCore />

          {/* Navigation Modules Grid */}
          <div className="cockpit-modules-grid">
            <SandboxNavigator />
            <FrontierModule userEmail={user.email!} />
            <SynthChatNavigator />
          </div>

          {/* System Broadcast Banners */}
          <OperatorBroadcastBanner />
        </main>

        {/* Right Sidebar - Command Zone */}
        <aside className="cockpit-sidebar">
          {/* Command Zone */}
          <div className="cockpit-panel p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-2">
              <div className="cockpit-label text-[10px] uppercase tracking-wider">
                COMMAND ZONE
              </div>
              <BootSequenceIndicators />
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="cockpit-label text-[8px] uppercase tracking-wider opacity-60 mb-1">
                  OPERATOR
                </div>
                <div className="cockpit-title text-lg md:text-xl">{displayName.toUpperCase()}</div>
                <div className="cockpit-text mt-1.5 text-xs leading-relaxed opacity-80">
                  FractiAI reference client for Syntheverse protocol. Records are verifiable and permanent.
                </div>
              </div>
              <div className="cockpit-text border-l-2 border-[var(--hydrogen-amber)] bg-[var(--hydrogen-amber)]/5 px-2 py-1.5 text-[10px] leading-tight">
                <strong>Liberating Contributions:</strong> Hydrogen spin MRI-based PoC protocol makes contributions{' '}
                <strong>visible and demonstrable to all</strong> via HHF-AI MRI science.
              </div>
            </div>
          </div>

          {/* Protocol Info */}
          <div className="cockpit-panel p-3 md:p-4 mt-3">
            <div className="mb-3 border-b border-[var(--keyline-primary)] pb-2">
              <div className="cockpit-label text-[10px] uppercase tracking-wider">
                PROTOCOL INFO
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-[10px]">Status:</span>
                <span className="cockpit-text text-[10px] font-mono text-[var(--hydrogen-amber)]">PUBLIC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-[10px]">Client:</span>
                <span className="cockpit-text text-[10px] font-mono">FRACTIAI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-[10px]">Network:</span>
                <span className="cockpit-text text-[10px] font-mono text-green-400">BASE MAINNET</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-[10px]">Chain ID:</span>
                <span className="cockpit-text text-[10px] font-mono">8453</span>
              </div>
            </div>
          </div>

          {/* Genesis Info */}
          <div className="cockpit-panel p-3 md:p-4 mt-3">
            <div className="mb-3 border-b border-[var(--keyline-primary)] pb-2">
              <div className="cockpit-label text-[10px] uppercase tracking-wider">
                GENESIS STATUS
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="cockpit-text text-[10px] leading-tight">
                <strong>SYNTH90T MOTHERLODE VAULT</strong> opens Spring Equinox, March 20, 2026.
              </div>
              <div className="cockpit-text text-[10px] leading-tight opacity-80">
                Submission deadline: March 19, 2026
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--keyline-primary)]">
                <GenesisButton />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
