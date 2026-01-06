import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BlogPage } from '@/components/BlogPage';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { blogPermissionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function BlogRoute() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
  
  // Check blog permissions
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

      canCreate =
        (isCreator && blogPerms.allow_creator) ||
        (isOperator && blogPerms.allow_operators) ||
        (!isCreator && !isOperator && blogPerms.allow_contributors);
    } catch (error) {
      console.error('Error checking blog permissions:', error);
      // Fallback to original logic
      canCreate = isCreator || isOperator;
    }
  }

  return (
    <BlogPage
      isAuthenticated={!!user}
      userEmail={user?.email || null}
      canCreate={canCreate}
    />
  );
}

