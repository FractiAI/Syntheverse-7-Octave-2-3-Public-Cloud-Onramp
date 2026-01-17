/**
 * Individual Post API
 * DELETE: Delete a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { socialPostsTable, enterpriseSandboxesTable, usersTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/social/posts/[postId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator } = await getAuthenticatedUserWithRole();

    // Get the post
    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(eq(socialPostsTable.id, params.postId))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];

    // Check permissions: user can delete own post, or operator/creator can delete posts in their sandboxes
    const canDelete =
      post.author_email === user.email ||
      isCreator ||
      (post.sandbox_id &&
        (await db
          .select()
          .from(enterpriseSandboxesTable)
          .where(
            and(
              eq(enterpriseSandboxesTable.id, post.sandbox_id),
              eq(enterpriseSandboxesTable.operator, user.email)
            )
          )
          .limit(1)).length > 0);

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await db
      .update(socialPostsTable)
      .set({ is_deleted: true, updated_at: new Date() })
      .where(eq(socialPostsTable.id, params.postId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

