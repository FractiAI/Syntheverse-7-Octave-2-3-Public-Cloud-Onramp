/**
 * Post Comments API
 * GET: Fetch comments for a post
 * POST: Create a new comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { socialPostCommentsTable, socialPostsTable, usersTable } from '@/utils/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/posts/[postId]/comments
 * Query params: limit, offset
 */
export async function GET(
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch comments
    const comments = await db
      .select()
      .from(socialPostCommentsTable)
      .where(
        and(
          eq(socialPostCommentsTable.post_id, params.postId),
          eq(socialPostCommentsTable.is_deleted, false)
        )
      )
      .orderBy(desc(socialPostCommentsTable.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalComments = await db
      .select()
      .from(socialPostCommentsTable)
      .where(
        and(
          eq(socialPostCommentsTable.post_id, params.postId),
          eq(socialPostCommentsTable.is_deleted, false)
        )
      );

    // Get author names
    const authorEmails = [...new Set(comments.map((c) => c.author_email))];
    const authors = authorEmails.length > 0
      ? await db
          .select()
          .from(usersTable)
          .where(inArray(usersTable.email, authorEmails))
      : [];

    const authorMap = new Map(
      authors.map((a) => [
        a.email,
        {
          name: a.name || a.email.split('@')[0],
          profile_picture_url: a.profile_picture_url || null,
        },
      ])
    );

    // Format response
    const formattedComments = comments.map((comment) => {
      const authorInfo = authorMap.get(comment.author_email) || {
        name: comment.author_email.split('@')[0],
        profile_picture_url: null,
      };
      return {
        id: comment.id,
        post_id: comment.post_id,
        author_email: comment.author_email,
        author_role: comment.author_role,
        author_name: authorInfo.name,
        author_profile_picture: authorInfo.profile_picture_url,
        content: comment.content,
        created_at: comment.created_at?.toISOString(),
        updated_at: comment.updated_at?.toISOString(),
      };
    });

    return NextResponse.json({
      comments: formattedComments,
      total: totalComments.length,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/**
 * POST /api/social/posts/[postId]/comments
 * Body: { content }
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

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const userRole = isCreator ? 'creator' : isOperator ? 'operator' : 'contributor';

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment must be less than 1000 characters' }, { status: 400 });
    }

    // Generate unique comment ID
    const commentId = `comment-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;

    // Create comment
    const newComment = await db.insert(socialPostCommentsTable).values({
      id: commentId,
      post_id: params.postId,
      author_email: user.email,
      author_role: userRole,
      content: content.trim(),
      is_deleted: false,
    }).returning();

    // Get author name
    const authors = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1);

    const authorName = authors[0]?.name || user.email.split('@')[0];

    const formattedComment = {
      id: newComment[0].id,
      post_id: newComment[0].post_id,
      author_email: newComment[0].author_email,
      author_role: newComment[0].author_role,
      author_name: authorName,
      content: newComment[0].content,
      created_at: newComment[0].created_at?.toISOString(),
      updated_at: newComment[0].updated_at?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

