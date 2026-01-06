/**
 * Creator Dashboard - Syntheverse Cockpit
 * Creator-controlled command center for PoC lifecycle and system administration
 * Only accessible to Creator (info@fractiai.com)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorCockpitStats } from '@/components/creator/CreatorCockpitStats';
import { CreatorCockpitNavigation } from '@/components/creator/CreatorCockpitNavigation';
import { BootSequenceIndicators } from '@/components/BootSequenceIndicators';
import { SalesTracking } from '@/components/SalesTracking';
import { SynthChat } from '@/components/SynthChat';
import { FrontierModule } from '@/components/FrontierModule';
import { ActivityAnalytics } from '@/components/activity/ActivityAnalytics';
import { SystemBroadcastCenter } from '@/components/creator/SystemBroadcastCenter';
import { CreatorEnterpriseSandboxes } from '@/components/creator/CreatorEnterpriseSandboxes';
import { ReferenceCustomersList } from '@/components/ReferenceCustomersList';
import { SandboxNavigator } from '@/components/SandboxNavigator';
import { SynthChatNavigator } from '@/components/SynthChatNavigator';
import { ReactorCore } from '@/components/ReactorCore';
import CockpitHeader from '@/components/CockpitHeader';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { Shield, Activity, FileText, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboard() {
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
    <div className="cockpit-bg min-h-screen">
      <CockpitHeader />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Core Instrument Panel - Reactor Core - At the very top */}
        <ReactorCore />

        {/* Navigation Modules - Three Navigators in Sequence */}
        <SandboxNavigator />
        <FrontierModule userEmail={userEmail} />
        <SynthChatNavigator />

        {/* Cockpit Header */}
        <div className="cockpit-panel border-l-4 border-red-500 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="cockpit-label mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-400" />
                CREATOR COCKPIT
              </div>
              <h1 className="cockpit-title mb-2 text-3xl">Awareness Bridge/Router</h1>
              <p className="cockpit-text opacity-80">
                Creator control interface for liberated contributions, on-chain proofs, and system
                coherence. All actions are logged and auditable.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/blog" className="cockpit-lever inline-block text-center">
                <FileText className="mr-2 inline h-4 w-4" />
                Blog
              </Link>
              <Activity className="h-5 w-5 animate-pulse text-green-500" />
              <BootSequenceIndicators />
            </div>
          </div>
          <div className="cockpit-text mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs opacity-60">
            FRACTIAI RESEARCH TEAM · PROTOCOL OPERATOR REFERENCE CLIENT
          </div>
        </div>

        {/* Core Metrics */}
        <CreatorCockpitStats />

        {/* Control Panels */}
        <CreatorCockpitNavigation />

        {/* System Broadcast Center */}
        <SystemBroadcastCenter />

        {/* Enterprise Sandboxes - For Creators and Enterprises */}
        {(isCreator || isOperator) && <CreatorEnterpriseSandboxes />}

        {/* Sales Tracking - Revenue & Subscriptions (Creators Only) */}
        {isCreator && <SalesTracking />}

        {/* Reference Customers - Creators Only */}
        {isCreator && <ReferenceCustomersList />}

        {/* Activity Analytics */}
        <ActivityAnalytics />
      </div>
    </div>
  );
}
