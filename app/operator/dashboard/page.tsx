/**
 * Operator Dashboard - Syntheverse Cockpit
 * Operator-controlled command center for PoC lifecycle and system administration
 * Accessible to Operators (users with role='operator' in database)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorCockpitStats } from '@/components/creator/CreatorCockpitStats';
import { CreatorCockpitNavigation } from '@/components/creator/CreatorCockpitNavigation';
import { StatusPanel } from '@/components/StatusPanel';
import { FrontierModule } from '@/components/FrontierModule';
import { ActivityAnalytics } from '@/components/activity/ActivityAnalytics';
import { SandboxNavigator } from '@/components/SandboxNavigator';
import { SynthChatNavigator } from '@/components/SynthChatNavigator';
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import { ReactorCore } from '@/components/ReactorCore';
import CockpitHeader from '@/components/CockpitHeader';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { Settings, Activity, FileText, BookOpen, Shield } from 'lucide-react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggle } from '@/components/MultiplierToggle';

export const dynamic = 'force-dynamic';

export default async function OperatorDashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this dashboard (Creators should use Creator Dashboard)
  if (!isOperator || !user?.email) {
    redirect('/dashboard');
  }

  // TypeScript guard: ensure user and email exist after checks
  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/dashboard');
  }

  return (
    <div className="cockpit-bg min-h-screen">
      <CockpitHeader />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={false} isOperator={isOperator} showContributorDashboard={true} />
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Mobile Status Indicators - Top of mobile dashboards */}
        <div className="block md:hidden">
          <MobileStatusIndicators />
        </div>

        {/* Core Instrument Panel - Reactor Core - Collapsible */}
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

        {/* Scoring Multiplier Controls - Testing/Tuning */}
        <div className="mb-6">
          <MultiplierToggle />
        </div>

        {/* Navigation Modules - Collapsible */}
        <details className="cockpit-panel" open>
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                NAVIGATION MODULES
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-6">
            <SandboxNavigator userEmail={userEmail} isCreator={false} isOperator={isOperator} />
            <FrontierModule userEmail={userEmail} />
            <SynthChatNavigator />
            <BroadcastArchiveNavigator />
          </div>
        </details>

        {/* Cockpit Header - Collapsible */}
        <details className="cockpit-panel border-l-4 border-blue-500" open>
          <summary className="cursor-pointer select-none list-none p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="cockpit-label mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  OPERATOR COCKPIT
                </div>
                <h1 className="cockpit-title mb-2 text-3xl">Operator Control Center</h1>
                <p className="cockpit-text opacity-80">
                  Operator interface for managing PoC submissions, sandboxes, and system operations.
                  All actions are logged and auditable.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/blog" className="cockpit-lever inline-block text-center" onClick={(e) => e.stopPropagation()}>
                  <FileText className="mr-2 inline h-4 w-4" />
                  Blog
                </Link>
                <Activity className="h-5 w-5 animate-pulse text-green-500" />
                <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70 ml-2" />
              </div>
            </div>
          </summary>
          <div className="px-6 pb-6">
            <div className="cockpit-text mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs opacity-60">
              OPERATOR ACCESS · PROTOCOL OPERATOR REFERENCE CLIENT
            </div>
          </div>
        </details>

        {/* Core Metrics - Collapsible */}
        <details className="cockpit-panel" open>
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                CORE METRICS
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <CreatorCockpitStats />
          </div>
        </details>

        {/* Control Panels - Collapsible */}
        <details className="cockpit-panel" open>
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                CONTROL PANELS
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <CreatorCockpitNavigation />
          </div>
        </details>


        {/* Activity Analytics - Collapsible */}
        <details className="cockpit-panel" open>
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between">
              <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                ACTIVITY ANALYTICS
              </div>
              <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <ActivityAnalytics />
          </div>
        </details>
      </div>
    </div>
  );
}

