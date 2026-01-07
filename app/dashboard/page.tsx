import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { FrontierModule } from '@/components/FrontierModule';
import { ReactorCore } from '@/components/ReactorCore';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { SandboxNavigator } from '@/components/SandboxNavigator';
import { SynthChatNavigator } from '@/components/SynthChatNavigator';
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import { SocialMediaPanel } from '@/components/SocialMediaPanel';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { StatusPanel } from '@/components/StatusPanel';

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
      {/* Status Panel - Top Bar */}
      <StatusPanel />

      {/* Quick Actions Panel - Top Bar */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={false} />

      {/* Main Cockpit Container */}
      <div className="container mx-auto px-4 py-6 max-w-[1920px]">
        {/* Mobile Status Indicators - Top of mobile dashboards */}
        <div className="block md:hidden mb-6">
          <MobileStatusIndicators />
        </div>

        {/* Primary Header - Cockpit Identity */}
        <div className="cockpit-panel border-l-4 border-[var(--hydrogen-amber)] mb-6 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="cockpit-label mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span className="text-[var(--hydrogen-amber)] text-lg">◎</span>
                <span className="uppercase tracking-[0.15em]">CONTRIBUTOR COCKPIT</span>
              </div>
              <h1 className="cockpit-title mb-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Proof-of-Contribution Station
              </h1>
              <p className="cockpit-text opacity-90 text-sm md:text-base max-w-2xl leading-relaxed">
                Submit, evaluate, and anchor contributions to the Syntheverse protocol. All records are verifiable and permanent on Base Mainnet.
              </p>
            </div>
          </div>
          <div className="cockpit-text mt-4 pt-4 border-t border-[var(--keyline-primary)] text-[10px] md:text-xs opacity-70 uppercase tracking-wider">
            FRACTIAI RESEARCH TEAM · PROTOCOL OPERATOR REFERENCE CLIENT
          </div>
        </div>

        {/* Command Zone - Operator Identity - Moved to Top */}
        <details className="cockpit-panel mb-6" open>
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-[10px] md:text-xs uppercase tracking-wider">
                COMMAND ZONE
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
            <div>
              <div className="cockpit-label text-[9px] uppercase tracking-wider opacity-70 mb-2">
                OPERATOR
              </div>
              <div className="cockpit-title text-xl md:text-2xl mb-2">{displayName.toUpperCase()}</div>
              <div className="cockpit-text text-xs md:text-sm leading-relaxed opacity-85">
                FractiAI reference client for Syntheverse protocol. Records are verifiable and permanent.
              </div>
            </div>
            <div className="cockpit-text border-l-3 border-[var(--hydrogen-amber)] bg-[var(--hydrogen-amber)]/8 px-3 py-2.5 text-[11px] md:text-xs leading-relaxed">
              <strong className="text-[var(--hydrogen-amber)]">Liberating Contributions:</strong> Hydrogen spin MRI-based PoC protocol makes contributions{' '}
              <strong>visible and demonstrable to all</strong> via HHF-AI MRI science.
            </div>
          </div>
        </details>

        {/* Core Instrument Cluster - Reactor Core */}
        <details className="mb-6" open>
          <summary className="cockpit-panel cursor-pointer select-none list-none p-4 md:p-5 mb-0">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                REACTOR CORE
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="mt-0">
            <ReactorCore />
          </div>
        </details>

        {/* System Broadcast Banners - Priority Display */}
        <div className="mb-6">
          <OperatorBroadcastBanner />
        </div>

        {/* Main Content Grid - Optimized Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Navigation Modules (8 columns on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Navigation Modules - Stacked for better visibility */}
            <div className="space-y-6">
              {/* Sandbox Navigator - Collapsible */}
              <details className="cockpit-panel" open>
                <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                      SANDBOX NAVIGATOR
                    </div>
                    <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                  </div>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <SandboxNavigator userEmail={user.email!} isCreator={isCreator} isOperator={isOperator} />
                </div>
              </details>

              {/* Frontier Module - Collapsible */}
              <details className="cockpit-panel" open>
                <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                      FRONTIER MODULE
                    </div>
                    <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                  </div>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <FrontierModule userEmail={user.email!} />
                </div>
              </details>

              {/* SynthChat Navigator - Collapsible */}
              <details className="cockpit-panel" open>
                <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                      SYNTHCHAT NAVIGATOR
                    </div>
                    <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                  </div>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <SynthChatNavigator />
                </div>
              </details>

              {/* Broadcast Archive Navigator - Collapsible */}
              <details className="cockpit-panel" open>
                <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                      BROADCAST ARCHIVE
                    </div>
                    <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                  </div>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <BroadcastArchiveNavigator />
                </div>
              </details>

              {/* Social Media Panel - Collapsible */}
              <details className="cockpit-panel" open>
                <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                      SOCIAL FEED
                    </div>
                    <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                  </div>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                  <SocialMediaPanel />
                </div>
              </details>
            </div>
          </div>

          {/* Right Column - Status Panels (4 columns on large screens) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Additional status panels can be added here */}
          </aside>
        </div>
      </div>
    </div>
  );
}
