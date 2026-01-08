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
import { CloudChannel } from '@/components/CloudChannel';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { PersistentDetails } from '@/components/PersistentDetails';

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
    <div className="cockpit-bg min-h-screen flex flex-col">
      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={false} />

      {/* Main Layout: Content + Cloud Channel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-[1400px]">
            {/* Mobile Status Indicators */}
            <div className="block md:hidden mb-6">
              <MobileStatusIndicators />
            </div>

            {/* Core Instrument Cluster - Reactor Core */}
            <PersistentDetails storageKey="reactor-core" defaultOpen={true} className="mb-6">
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
            </PersistentDetails>

            {/* System Broadcast Banners */}
            <div className="mb-6">
              <OperatorBroadcastBanner />
            </div>

            {/* Navigators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Sandbox Navigator */}
              <PersistentDetails storageKey="sandbox-navigator" defaultOpen={true} className="cockpit-panel">
                <summary className="cursor-pointer select-none list-none p-3 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-[10px] uppercase tracking-wider">
                      CLOUD NAVIGATOR
                    </div>
                    <ChevronDown className="cockpit-chevron h-4 w-4 opacity-70" />
                  </div>
                </summary>
                <div className="px-3 pb-3 pt-2">
                  <SandboxNavigator userEmail={user.email!} isCreator={isCreator} isOperator={isOperator} />
                </div>
              </PersistentDetails>

              {/* SynthChat Navigator */}
              <PersistentDetails storageKey="synthchat-navigator" defaultOpen={true} className="cockpit-panel">
                <summary className="cursor-pointer select-none list-none p-3 border-b border-[var(--keyline-primary)]">
                  <div className="flex items-center justify-between">
                    <div className="cockpit-label text-[10px] uppercase tracking-wider">
                      SYNTHCHAT NAVIGATOR
                    </div>
                    <ChevronDown className="cockpit-chevron h-4 w-4 opacity-70" />
                  </div>
                </summary>
                <div className="px-3 pb-3 pt-2">
                  <SynthChatNavigator />
                </div>
              </PersistentDetails>
            </div>

            {/* PoC Navigator */}
            <PersistentDetails storageKey="poc-navigator" defaultOpen={true} className="cockpit-panel">
              <summary className="cursor-pointer select-none list-none p-4 border-b border-[var(--keyline-primary)]">
                <div className="flex items-center justify-between">
                  <div className="cockpit-label text-xs uppercase tracking-wider">
                    PoC NAVIGATOR
                  </div>
                  <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
                </div>
              </summary>
              <div className="px-4 pb-4 pt-3">
                <FrontierModule userEmail={user.email!} />
              </div>
            </PersistentDetails>
          </div>
        </div>

        {/* Cloud Channel - Right Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:flex w-[320px] border-l border-[var(--keyline-primary)] flex-shrink-0" style={{ transition: 'width 0.3s ease' }}>
          <CloudChannel />
        </aside>
      </div>
    </div>
  );
}
