import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BlogPage } from '@/components/BlogPage';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export default async function BlogRoute() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
  const canCreate = isCreator || isOperator;

  return (
    <BlogPage
      isAuthenticated={!!user}
      userEmail={user?.email || null}
      canCreate={canCreate}
    />
  );
}

