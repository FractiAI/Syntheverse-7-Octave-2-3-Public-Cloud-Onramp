import { createClient } from '@/utils/supabase/server';
import { BlogPage } from '@/components/BlogPage';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

export default async function SandboxBlogRoute({ params }: { params: { sandboxId: string } }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
  const canCreate = isCreator || isOperator;

  return (
    <BlogPage
      sandboxId={params.sandboxId}
      isAuthenticated={!!user}
      userEmail={user?.email || null}
      canCreate={canCreate}
    />
  );
}

