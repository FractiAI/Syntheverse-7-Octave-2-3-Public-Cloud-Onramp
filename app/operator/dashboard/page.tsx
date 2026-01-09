/**
 * Operator Lab™ - Syntheverse Cockpit
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
import { WorkChatNavigator } from "@/components/WorkChatNavigator";
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import CockpitHeader from '@/components/CockpitHeader';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { CloudChannel } from '@/components/CloudChannel';
import { Settings, Activity, FileText, BookOpen, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggleWrapper } from '@/components/MultiplierToggleWrapper';
import '../../control-lab.css';

export const dynamic = 'force-dynamic';

export default async function OperatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this lab (Creators should use Creator Lab™)
  if (!isOperator || !user?.email) {
    redirect('/dashboard');
  }

  // TypeScript guard: ensure user and email exist after checks
  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/dashboard');
  }

  return (
    <div className="lab-bg holographic-grid min-h-screen relative flex flex-col">
      <div className="nebula-background" style={{opacity: 0.3}} />
      
      {/* Operator Control Center Header */}
      <div className="lab-header relative z-10 flex-shrink-0">
        <div className="lab-header-grid">
          <div>
            <h1 className="lab-title" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
              Operator Lab™
            </h1>
            <p className="lab-subtitle" style={{color: 'hsl(var(--text-secondary))'}}>
              Cloud Infrastructure Management · Community Coordination · System Operations
            </p>
          </div>
          <div className="lab-status-monitors">
            <div className="lab-status-monitor">
              <div className="lab-monitor-label">Center Status</div>
              <div className="lab-monitor-status">
                <div className="lab-indicator"></div>
                <span>OPERATIONAL</span>
              </div>
            </div>
            <div className="lab-status-monitor">
              <div className="lab-monitor-label">System Time</div>
              <div className="lab-monitor-value">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Panel - Top Bar */}
      <StatusPanel />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={false} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Layout: Content + Cloud Channel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto space-y-6 px-6 py-8 relative z-10">
        {/* Cloud Channel - Mobile Banner (Top of Content) */}
        <div className="lg:hidden">
          <CloudChannel />
        </div>
        
        {/* Mobile Status Indicators - Top of mobile dashboards */}
        <div className="block md:hidden">
          <MobileStatusIndicators />
        </div>

        {/* System Broadcast Banners - Priority Display */}
        <div className="mb-6">
          <OperatorBroadcastBanner />
        </div>

        {/* Scoring Multiplier Controls - Testing/Tuning */}
        <div className="mb-6">
          <MultiplierToggleWrapper />
        </div>

        {/* Navigation Modules - Collapsible */}
        <details className="mb-6 frontier-panel relative" open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 mb-0 border-b" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.1)'}}>
            <div className="flex items-center justify-between">
              <div className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                NAVIGATION MODULES
              </div>
              <ChevronDown className="h-5 w-5 opacity-70" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-6" style={{color: 'hsl(var(--text-primary))'}}>
            <SandboxNavigator userEmail={userEmail} isCreator={false} isOperator={isOperator} />
            <FrontierModule userEmail={userEmail} />
            <WorkChatNavigator />
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
        <details className="mb-6 frontier-panel relative" open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 mb-0 border-b" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.1)'}}>
            <div className="flex items-center justify-between">
              <div className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                CORE METRICS
              </div>
              <ChevronDown className="h-5 w-5 opacity-70" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <CreatorCockpitStats />
          </div>
        </details>

        {/* Control Panels - Collapsible */}
        <details className="mb-6 frontier-panel relative" open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 mb-0 border-b" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.1)'}}>
            <div className="flex items-center justify-between">
              <div className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                CONTROL PANELS
              </div>
              <ChevronDown className="h-5 w-5 opacity-70" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <CreatorCockpitNavigation />
          </div>
        </details>


        {/* Activity Analytics - Collapsible */}
        <details className="mb-6 frontier-panel relative" open>
          <div className="scan-line" />
          <summary className="cursor-pointer select-none list-none p-4 md:p-5 mb-0 border-b" style={{borderColor: 'hsl(var(--hydrogen-beta) / 0.1)'}}>
            <div className="flex items-center justify-between">
              <div className="text-xs md:text-sm uppercase tracking-wider font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                ACTIVITY ANALYTICS
              </div>
              <ChevronDown className="h-5 w-5 opacity-70" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            </div>
          </summary>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <ActivityAnalytics />
          </div>
        </details>
          </div>
        </div>

        {/* Cloud Channel - Right Sidebar */}
        <aside className="flex border-l border-[var(--keyline-primary)] flex-shrink-0" style={{ width: 'auto', transition: 'all 0.3s ease' }}>
          <CloudChannel />
        </aside>
      </div>
    </div>
  );
}

