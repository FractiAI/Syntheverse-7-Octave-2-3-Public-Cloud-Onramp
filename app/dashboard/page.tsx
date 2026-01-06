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
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} />

      {/* Cockpit Grid Layout - Multi-column control center */}
      <div className="cockpit-grid-layout">
        {/* Left Sidebar - Status */}
        <aside className="cockpit-sidebar">
          {/* System Status Panel */}
          <div className="cockpit-panel p-3 md:p-4">
            <div className="mb-3 border-b border-[var(--keyline-primary)] pb-2">
              <div className="cockpit-label text-[10px] uppercase tracking-wider">
                SYSTEM STATUS
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-xs">Protocol</span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-xs">Blockchain</span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="cockpit-text text-xs">HHF-AI</span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Instrument Cluster */}
        <main className="cockpit-main">
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
                <div className="cockpit-title text-lg md:text-xl">{displayName.toUpperCase()}</div>
                <div className="cockpit-text mt-1.5 text-xs leading-relaxed">
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
            <div className="space-y-1.5 text-xs">
              <div className="cockpit-text text-[10px]">
                <strong>Status:</strong> Public Protocol
              </div>
              <div className="cockpit-text text-[10px]">
                <strong>Client:</strong> FractiAI Reference
              </div>
              <div className="cockpit-text text-[10px]">
                <strong>Network:</strong> Base Mainnet
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
