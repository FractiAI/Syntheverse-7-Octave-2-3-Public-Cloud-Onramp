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
import { BootSequenceIndicators } from '@/components/BootSequenceIndicators';
import { SynthChat } from '@/components/SynthChat';
import { FrontierModule } from '@/components/FrontierModule';
import { ActivityAnalytics } from '@/components/activity/ActivityAnalytics';
import { SystemBroadcastCenter } from '@/components/creator/SystemBroadcastCenter';
import { SandboxSelector } from '@/components/SandboxSelector';
import { Settings, Activity, FileText } from 'lucide-react';
import Link from 'next/link';

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
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Sandbox Selector - Cockpit Control */}
        <div className="cockpit-panel p-3 md:p-4">
          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:justify-between">
            <div className="cockpit-label text-xs uppercase tracking-wider">SANDBOX SELECTOR</div>
            <SandboxSelector />
          </div>
        </div>

        {/* Cockpit Header */}
        <div className="cockpit-panel border-l-4 border-blue-500 p-6">
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
              <Link href="/blog" className="cockpit-lever inline-block text-center">
                <FileText className="mr-2 inline h-4 w-4" />
                Blog
              </Link>
              <Activity className="h-5 w-5 animate-pulse text-green-500" />
              <BootSequenceIndicators />
            </div>
          </div>
          <div className="cockpit-text mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs opacity-60">
            OPERATOR ACCESS · PROTOCOL OPERATOR REFERENCE CLIENT
          </div>
        </div>

        {/* Core Metrics */}
        <CreatorCockpitStats />

        {/* Control Panels */}
        <CreatorCockpitNavigation />

        {/* System Broadcast Center */}
        <SystemBroadcastCenter />

        {/* Activity Analytics */}
        <ActivityAnalytics />

        {/* PoC Archive - Same as Contributor Dashboard */}
        <FrontierModule userEmail={userEmail} />
      </div>
    </div>
  );
}

