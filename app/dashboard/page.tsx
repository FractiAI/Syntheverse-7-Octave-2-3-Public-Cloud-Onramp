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
import { SocialMediaPanel } from '@/components/SocialMediaPanel';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';

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
      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={false} />

      {/* Main Cockpit Container */}
      <div className="container mx-auto px-4 py-6 max-w-[1920px]">
        {/* Mobile Status Indicators - Top of mobile dashboards */}
        <div className="block md:hidden mb-6">
          <MobileStatusIndicators />
        </div>

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

        {/* Main Content Grid - Three Column Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column - Compact Navigators (3 columns on large screens) */}
          <aside className="lg:col-span-3 space-y-3">
            {/* Sandbox Navigator - Collapsible */}
            <details className="cockpit-panel" open>
              <summary className="cursor-pointer select-none list-none p-3 border-b border-[var(--keyline-primary)]">
                <div className="flex items-center justify-between">
                  <div className="cockpit-label text-[10px] uppercase tracking-wider">
                    SANDBOX
                  </div>
                  <ChevronDown className="cockpit-chevron h-4 w-4 opacity-70" />
                </div>
              </summary>
              <div className="px-3 pb-3 pt-2">
                <div className="cockpit-navigator-compact">
                  <SandboxNavigator userEmail={user.email!} isCreator={isCreator} isOperator={isOperator} />
                </div>
              </div>
            </details>

            {/* SynthChat Navigator - Collapsible */}
            <details className="cockpit-panel" open>
              <summary className="cursor-pointer select-none list-none p-3 border-b border-[var(--keyline-primary)]">
                <div className="flex items-center justify-between">
                  <div className="cockpit-label text-[10px] uppercase tracking-wider">
                    SYNTHCHAT
                  </div>
                  <ChevronDown className="cockpit-chevron h-4 w-4 opacity-70" />
                </div>
              </summary>
              <div className="px-3 pb-3 pt-2">
                <div className="cockpit-navigator-compact">
                  <SynthChatNavigator />
                </div>
              </div>
            </details>
          </aside>

          {/* Center Column - Primary Content (6 columns on large screens) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Social Media Panel - Main Focus */}
            <details className="cockpit-panel" open>
              <summary className="cursor-pointer select-none list-none p-4 border-b border-[var(--keyline-primary)]">
                <div className="flex items-center justify-between">
                  <div className="cockpit-label text-xs uppercase tracking-wider">
                    SANDBOX CHANNEL
                  </div>
                  <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                </div>
              </summary>
              <div className="px-4 pb-4 pt-3">
                <SocialMediaPanel />
              </div>
            </details>

            {/* Frontier Module - Collapsible */}
            <details className="cockpit-panel" open>
              <summary className="cursor-pointer select-none list-none p-4 border-b border-[var(--keyline-primary)]">
                <div className="flex items-center justify-between">
                  <div className="cockpit-label text-xs uppercase tracking-wider">
                    FRONTIER MODULE
                  </div>
                  <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                </div>
              </summary>
              <div className="px-4 pb-4 pt-3">
                <FrontierModule userEmail={user.email!} />
              </div>
            </details>
          </div>

          {/* Right Column - Future Expansion (3 columns on large screens) */}
          <aside className="lg:col-span-3 space-y-3">
            {/* Reserved for metrics, alerts, or quick actions */}
          </aside>
        </div>
      </div>
    </div>
  );
}
