import { createClient } from '@/utils/supabase/server';
import { BlogPage } from '@/components/BlogPage';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { blogPermissionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function SandboxBlogRoute({ params }: { params: { sandboxId: string } }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
  
  // For sandbox blogs, operators and creators can create if they have access to the sandbox
  // Check main blog permissions for consistency
  let canCreate = false;
  if (user?.email) {
    try {
      const permissions = await db
        .select()
        .from(blogPermissionsTable)
        .where(eq(blogPermissionsTable.id, 'main'))
        .limit(1);

      const blogPerms = permissions.length > 0 ? permissions[0] : {
        allow_contributors: false,
        allow_operators: true,
        allow_creator: true,
      };

      // For sandbox blogs, operators and creators can create if they have access to the sandbox
      canCreate =
        (isCreator && blogPerms.allow_creator) ||
        (isOperator && blogPerms.allow_operators);
    } catch (error) {
      console.error('Error checking blog permissions:', error);
      // Fallback to original logic
      canCreate = isCreator || isOperator;
    }
  }

  return (
    <BlogPage
      sandboxId={params.sandboxId}
      isAuthenticated={!!user}
      userEmail={user?.email || null}
      canCreate={canCreate}
    />
  );
}

