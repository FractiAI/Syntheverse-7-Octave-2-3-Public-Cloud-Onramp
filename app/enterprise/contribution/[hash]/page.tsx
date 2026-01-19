import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import EnterpriseContributionDetail from '@/components/EnterpriseContributionDetail';

export const dynamic = 'force-dynamic';

export default async function EnterpriseContributionPage({ params }: { params: { hash: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <EnterpriseContributionDetail
      submissionHash={params.hash}
      isAuthenticated={!!user}
      userEmail={user?.email || null}
    />
  );
}
