/**
 * Creator Lab™ - Syntheverse Cockpit
 * Creator-controlled command center for PoC lifecycle and system administration
 * Only accessible to Creator (info@fractiai.com)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorCockpitStats } from '@/components/creator/CreatorCockpitStats';
import { CreatorCockpitNavigation } from '@/components/creator/CreatorCockpitNavigation';
import { StatusPanel } from '@/components/StatusPanel';
import { SalesTracking } from '@/components/SalesTracking';
import { WorkChat } from "@/components/WorkChat";
import { FrontierModule } from '@/components/FrontierModule';
import { ActivityAnalytics } from '@/components/activity/ActivityAnalytics';
import { CreatorEnterpriseSandboxes } from '@/components/creator/CreatorEnterpriseSandboxes';
import { ReferenceCustomersList } from '@/components/ReferenceCustomersList';
import { SandboxNavigator } from '@/components/SandboxNavigator';
import { WorkChatNavigator } from "@/components/WorkChatNavigator";
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import CockpitHeader from '@/components/CockpitHeader';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { Shield, Activity, FileText, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggleWrapper } from '@/components/MultiplierToggleWrapper';
import { CloudChannel } from '@/components/CloudChannel';
import '../../control-lab.css';

export const dynamic = 'force-dynamic';

export default async function CreatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

  // Allow Creator and Operators (enterprises) to access this dashboard
  // Operators can see their own enterprise sandboxes
  if ((!isCreator && !isOperator) || !user?.email) {
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
      
      {/* Control Lab Header - Scientific Control Station */}
      <div className="lab-header relative z-10 flex-shrink-0">
        <div className="lab-header-grid">
          <div>
            <h1 className="lab-title" style={{color: 'hsl(var(--hydrogen-gamma))'}}>
              Creator Lab™
            </h1>
            <p className="lab-subtitle" style={{color: 'hsl(var(--text-secondary))'}}>
              Reality Worldbuilding · Infinite Materials · Frontier Creation
            </p>
          </div>
          <div className="lab-status-monitors">
            <div className="lab-status-monitor">
              <div className="lab-monitor-label">Lab Status</div>
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
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Layout: Content + Cloud Channel */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto space-y-6 px-6 py-8">
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
        <details className="lab-panel" open>
          <summary className="lab-collapsible-trigger list-none mb-0 rounded-b-none">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-[var(--lab-primary)]" />
              <div>
                <div className="lab-section-label mb-0 border-0 pb-0">NAVIGATION MODULES</div>
                <div className="text-xs text-[var(--lab-text-secondary)] font-medium">System Access & Coordination</div>
              </div>
            </div>
            <ChevronDown className="lab-chevron h-5 w-5" />
          </summary>
          <div className="p-6 space-y-6 border-t-2 border-[var(--lab-border)]" style={{color: 'var(--lab-text-primary)'}}>
            <SandboxNavigator userEmail={userEmail} isCreator={isCreator} isOperator={isOperator} />
            <FrontierModule userEmail={userEmail} />
            <WorkChatNavigator />
            <BroadcastArchiveNavigator />
          </div>
        </details>

        {/* Creator Control Panel - Collapsible */}
        <details className="lab-panel" open>
          <summary className="lab-panel-header cursor-pointer select-none list-none">
            <div className="flex items-center justify-between">
              <div className="lab-panel-title">
                <Shield className="lab-panel-icon text-red-500" />
                <span>Creator Control Panel</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="lab-badge lab-badge-warning">
                  <Shield className="h-3 w-3 mr-1" />
                  ADMIN ACCESS
                </div>
                <ChevronDown className="lab-chevron h-5 w-5" />
              </div>
            </div>
            <div className="lab-panel-description mt-2">
              System administration, PoC lifecycle management, and creator controls
            </div>
          </summary>
          <div className="lab-panel-body">
            <div className="mb-4">
              <div className="lab-section-label">
                CREATOR CONTROLS
              </div>
              <h2 className="text-2xl font-bold text-[var(--lab-text-primary)] mb-2">Awareness Bridge/Router</h2>
              <p className="text-sm text-[var(--lab-text-secondary)] mb-4">
                Creator control interface for liberated contributions, on-chain proofs, and system
                coherence. All actions are logged and auditable.
              </p>
              <Link href="/blog" className="lab-button lab-button-primary">
                <FileText className="h-4 w-4" />
                <span>Blog Management</span>
              </Link>
            </div>
          </div>
        </details>

        {/* Core Metrics - Collapsible */}
        <details className="lab-panel" open>
          <summary className="lab-panel-header cursor-pointer select-none list-none">
            <div className="flex items-center justify-between">
              <div className="lab-panel-title">
                <Activity className="lab-panel-icon" />
                <span>System Metrics & Analytics</span>
              </div>
              <ChevronDown className="lab-chevron h-5 w-5" />
            </div>
            <div className="lab-panel-description mt-2">
              Real-time system measurements and performance indicators
            </div>
          </summary>
          <div className="lab-panel-body">
            <CreatorCockpitStats />
          </div>
        </details>

        {/* Control Panels - Collapsible */}
        <details className="lab-panel" open>
          <summary className="lab-panel-header cursor-pointer select-none list-none">
            <div className="flex items-center justify-between">
              <div className="lab-panel-title">
                <Settings className="lab-panel-icon" />
                <span>Configuration Controls</span>
              </div>
              <ChevronDown className="lab-chevron h-5 w-5" />
            </div>
            <div className="lab-panel-description mt-2">
              System configuration and administrative controls
            </div>
          </summary>
          <div className="lab-panel-body">
            <CreatorCockpitNavigation />
          </div>
        </details>


        {/* Enterprise Sandboxes - Collapsible (For Creators and Enterprises) */}
        {(isCreator || isOperator) && (
          <details className="lab-panel" open>
            <summary className="lab-panel-header cursor-pointer select-none list-none">
              <div className="flex items-center justify-between">
                <div className="lab-panel-title">
                  <BookOpen className="lab-panel-icon" />
                  <span>Enterprise Sandbox Laboratory</span>
                </div>
                <ChevronDown className="lab-chevron h-5 w-5" />
              </div>
              <div className="lab-panel-description mt-2">
                Nested HHF-AI sandbox configuration and management
              </div>
            </summary>
            <div className="lab-panel-body">
              <CreatorEnterpriseSandboxes />
            </div>
          </details>
        )}

        {/* Sales Tracking - Collapsible (Creators Only) */}
        {isCreator && (
          <details className="lab-panel" open>
            <summary className="lab-panel-header cursor-pointer select-none list-none">
              <div className="flex items-center justify-between">
                <div className="lab-panel-title">
                  <Activity className="lab-panel-icon" />
                  <span>Revenue Analytics</span>
                </div>
                <ChevronDown className="lab-chevron h-5 w-5" />
              </div>
              <div className="lab-panel-description mt-2">
                Sales tracking and financial measurements
              </div>
            </summary>
            <div className="lab-panel-body">
              <SalesTracking />
            </div>
          </details>
        )}

        {/* Reference Customers - Collapsible (Creators Only) */}
        {isCreator && (
          <details className="cockpit-panel" open>
            <summary className="cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)]">
              <div className="flex items-center justify-between">
                <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider">
                  REFERENCE CUSTOMERS
                </div>
                <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
              </div>
            </summary>
            <div className="px-4 md:px-5 pb-4 md:pb-5">
              <ReferenceCustomersList />
            </div>
          </details>
        )}

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

        {/* Cloud Channel - Right Sidebar */}
        <aside className="flex border-l border-[var(--keyline-primary)] flex-shrink-0" style={{ width: 'auto', transition: 'all 0.3s ease' }}>
          <CloudChannel />
        </aside>
      </div>
    </div>
  );
}
