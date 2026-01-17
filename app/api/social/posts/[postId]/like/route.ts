/**
 * Post Like API
 * POST: Like a post
 * DELETE: Unlike a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { socialPostLikesTable, socialPostsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/social/posts/[postId]/like
 */
export async function POST(
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

    // Check if post exists
    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(eq(socialPostsTable.id, params.postId), eq(socialPostsTable.is_deleted, false)))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLikes = await db
      .select()
      .from(socialPostLikesTable)
      .where(
        and(
          eq(socialPostLikesTable.post_id, params.postId),
          eq(socialPostLikesTable.user_email, user.email)
        )
      )
      .limit(1);

    if (existingLikes.length > 0) {
      // Already liked, return current state
      const post = await db
        .select()
        .from(socialPostsTable)
        .where(eq(socialPostsTable.id, params.postId))
        .limit(1);

      return NextResponse.json({
        success: true,
        liked: true,
        likes_count: post[0].likes_count || 0,
      });
    }

    // Create like
    const likeId = `like-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
    await db.insert(socialPostLikesTable).values({
      id: likeId,
      post_id: params.postId,
      user_email: user.email,
    });

    // Get updated likes count (trigger updates it automatically)
    const post = await db
      .select()
      .from(socialPostsTable)
      .where(eq(socialPostsTable.id, params.postId))
      .limit(1);

    return NextResponse.json({
      success: true,
      liked: true,
      likes_count: post[0].likes_count || 0,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

/**
 * DELETE /api/social/posts/[postId]/like
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

    // Remove like
    await db
      .delete(socialPostLikesTable)
      .where(
        and(
          eq(socialPostLikesTable.post_id, params.postId),
          eq(socialPostLikesTable.user_email, user.email)
        )
      );

    // Get updated likes count (trigger updates it automatically)
    const post = await db
      .select()
      .from(socialPostsTable)
      .where(eq(socialPostsTable.id, params.postId))
      .limit(1);

    return NextResponse.json({
      success: true,
      liked: false,
      likes_count: post[0]?.likes_count || 0,
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}

