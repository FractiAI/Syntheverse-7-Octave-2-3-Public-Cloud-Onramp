/**
 * Individual Comment API
 * DELETE: Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { socialPostCommentsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/social/posts/[postId]/comments/[commentId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the comment
    const comments = await db
      .select()
      .from(socialPostCommentsTable)
      .where(
        and(
          eq(socialPostCommentsTable.id, params.commentId),
          eq(socialPostCommentsTable.post_id, params.postId)
        )
      )
      .limit(1);

    if (comments.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = comments[0];

    // Check permissions: user can only delete own comments
    if (comment.author_email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await db
      .update(socialPostCommentsTable)
      .set({ is_deleted: true, updated_at: new Date() })
      .where(eq(socialPostCommentsTable.id, params.commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

