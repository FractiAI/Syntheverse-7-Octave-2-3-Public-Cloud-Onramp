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
import { Shield, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isCreator } = await getAuthenticatedUserWithRole();

  if (!isCreator) {
    redirect('/dashboard');
  }

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Cockpit Header */}
        <div className="cockpit-panel border-l-4 border-red-500 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="cockpit-label mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-400" />
                CREATOR COCKPIT
              </div>
              <h1 className="cockpit-title mb-2 text-3xl">Syntheverse Command Center</h1>
              <p className="cockpit-text opacity-80">
                Awareness Bridge/Router control interface. Creator-only access to PoC archive, user
                administration, Base Mainnet contents, and database operations. All actions are
                logged and auditable.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse text-green-500" />
              <BootSequenceIndicators />
            </div>
          </div>
          <div className="cockpit-text mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs opacity-60">
            FRACTIAI RESEARCH TEAM · PROTOCOL OPERATOR REFERENCE CLIENT
          </div>
        </div>

        {/* Cockpit Statistics */}
        <CreatorCockpitStats />

        {/* Navigation Window */}
        <CreatorCockpitNavigation />
      </div>
    </div>
  );
}
