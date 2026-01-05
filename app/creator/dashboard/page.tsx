/**
 * Creator Dashboard - Destructive controls for PoC lifecycle and user administration
 * Only accessible to Creator (info@fractiai.com)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorArchiveManagement } from '@/components/creator/CreatorArchiveManagement';
import { CreatorUserManagement } from '@/components/creator/CreatorUserManagement';
import { CreatorAuditLog } from '@/components/creator/CreatorAuditLog';

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
      <div className="container mx-auto space-y-8 px-6 py-8">
        {/* Header */}
        <div className="cockpit-panel p-6 border-l-4 border-red-500">
          <div className="cockpit-label mb-2">CREATOR DASHBOARD</div>
          <h1 className="cockpit-title text-3xl mb-2">Destructive Controls</h1>
          <p className="cockpit-text opacity-80">
            Creator-only controls for PoC archive management and user administration. All actions are
            logged and irreversible.
          </p>
        </div>

        {/* PoC Archive Management */}
        <CreatorArchiveManagement />

        {/* User Management */}
        <CreatorUserManagement />

        {/* Audit Log */}
        <CreatorAuditLog />
      </div>
    </div>
  );
}

