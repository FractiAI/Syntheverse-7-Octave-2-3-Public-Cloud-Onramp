import EnterpriseDashboard from '@/components/EnterpriseDashboard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import '../../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function EnterpriseDashboardPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  // Require authentication - redirect to login if not authenticated
  if (error || !data?.user) {
    redirect('/login');
  }

  const user = data.user;

  return <EnterpriseDashboard isAuthenticated={true} userEmail={user.email || null} />;
}
