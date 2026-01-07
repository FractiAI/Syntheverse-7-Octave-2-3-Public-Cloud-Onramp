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
