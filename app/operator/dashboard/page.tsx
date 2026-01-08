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
import { CloudChannel } from '@/components/CloudChannel';
import { Settings, Activity, FileText, BookOpen, Shield } from 'lucide-react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggleWrapper } from '@/components/MultiplierToggleWrapper';

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
    <div className="cockpit-bg holographic-grid min-h-screen flex flex-col">
      <div className="nebula-background" style={{opacity: 0.3}} />
      <CockpitHeader />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={false} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Layout: Content + Cloud Channel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto space-y-6 px-6 py-8 relative z-10">
        {/* Mobile Status Indicators - Top of mobile dashboards */}
        <div className="block md:hidden">
          <MobileStatusIndicators />
        </div>

        {/* Core Instrument Panel - Reactor Core - Collapsible */}
        <details className="mb-6 frontier-panel relative" open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 mb-0 border-b" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.1)'}}>
            <div className="flex items-center justify-between">
              <div className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                REACTOR CORE
              </div>
              <ChevronDown className="h-5 w-5 opacity-70" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
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
          <MultiplierToggleWrapper />
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

        {/* Cloud Control Center Header - Collapsible */}
        <details className="frontier-panel relative" style={{borderLeft: '4px solid hsl(var(--hydrogen-beta))'}} open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2" style={{color: 'hsl(var(--hydrogen-beta))'}}>
                  <Settings className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">CLOUD OPERATOR</span>
                </div>
                <h1 className="mb-2 text-3xl font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
                  Cloud Control Center
                </h1>
                <p className="text-sm" style={{color: 'hsl(var(--text-secondary))'}}>
                  Operator interface for managing PoC submissions, cloud instances, and system operations.
                  All actions are logged and auditable.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/blog" className="hydrogen-btn hydrogen-btn-gamma inline-flex items-center gap-2 px-4 py-2 text-sm">
                  <FileText className="h-4 w-4" />
                  Blog
                </Link>
                <Activity className="h-5 w-5 holographic-pulse" style={{color: 'hsl(var(--status-active))'}} />
                <ChevronDown className="h-5 w-5 opacity-70 ml-2" style={{color: 'hsl(var(--hydrogen-beta))'}} />
              </div>
            </div>
          </summary>
          <div className="px-6 pb-6">
            <div className="mt-3 border-t pt-3 text-xs" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.2)', color: 'hsl(var(--text-tertiary))'}}>
              CLOUD OPERATOR ACCESS · HOLOGRAPHIC HYDROGEN FRONTIER
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

        {/* Cloud Channel - Right Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:block w-[320px] border-l border-[var(--keyline-primary)] flex-shrink-0">
          <CloudChannel />
        </aside>
      </div>
    </div>
  );
}

