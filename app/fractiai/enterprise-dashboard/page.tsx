import EnterpriseDashboard from '@/components/EnterpriseDashboard';
import { createClient } from '@/utils/supabase/server';
import '../../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function EnterpriseDashboardPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return <EnterpriseDashboard isAuthenticated={!!user} userEmail={user?.email || null} />;
}
