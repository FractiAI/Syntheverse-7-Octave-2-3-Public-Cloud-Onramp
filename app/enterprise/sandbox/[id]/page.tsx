import EnterpriseSandboxDetail from '@/components/EnterpriseSandboxDetail';
import { createClient } from '@/utils/supabase/server';
import '../../../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function EnterpriseSandboxDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <EnterpriseSandboxDetail
      sandboxId={params.id}
      isAuthenticated={!!user}
      userEmail={user?.email || null}
    />
  );
}
