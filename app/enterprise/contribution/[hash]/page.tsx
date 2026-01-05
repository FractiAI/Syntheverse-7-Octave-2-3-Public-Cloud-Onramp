import EnterpriseContributionDetail from '@/components/EnterpriseContributionDetail';
import { createClient } from '@/utils/supabase/server';
import '../../../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function EnterpriseContributionDetailPage({
  params,
}: {
  params: { hash: string };
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <EnterpriseContributionDetail
      submissionHash={params.hash}
      isAuthenticated={!!user}
      userEmail={user?.email || null}
    />
  );
}
