/**
 * Social Media Posts API
 * GET: Fetch posts for a sandbox
 * POST: Create a new post
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { socialPostsTable, socialPostLikesTable, usersTable } from '@/utils/db/schema';
import { eq, and, desc, isNull, or, inArray } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/social/posts
 * Query params: sandbox_id, limit, offset, author_email
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get('sandbox_id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const authorEmail = searchParams.get('author_email');

    // Build query conditions
    const conditions = [eq(socialPostsTable.is_deleted, false)];

    if (sandboxId === 'null' || sandboxId === '') {
      conditions.push(isNull(socialPostsTable.sandbox_id));
    } else if (sandboxId) {
      conditions.push(eq(socialPostsTable.sandbox_id, sandboxId));
    }

    if (authorEmail) {
      conditions.push(eq(socialPostsTable.author_email, authorEmail));
    }

    // Fetch posts
    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(...conditions))
      .orderBy(desc(socialPostsTable.is_pinned), desc(socialPostsTable.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalPosts = await db
      .select()
      .from(socialPostsTable)
      .where(and(...conditions));

    // Get user likes for these posts
    const postIds = posts.map((p) => p.id);
    const userLikes = postIds.length > 0
      ? await db
          .select()
          .from(socialPostLikesTable)
          .where(
            and(
              eq(socialPostLikesTable.user_email, user.email),
              inArray(socialPostLikesTable.post_id, postIds)
            )
          )
      : [];

    const likedPostIds = new Set(userLikes.map((l) => l.post_id));

    // Get author names
    const authorEmails = [...new Set(posts.map((p) => p.author_email))];
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
    const formattedPosts = posts.map((post) => {
      const authorInfo = authorMap.get(post.author_email) || {
        name: post.author_email.split('@')[0],
        profile_picture_url: null,
      };
      return {
        id: post.id,
        sandbox_id: post.sandbox_id,
        author_email: post.author_email,
        author_role: post.author_role,
        author_name: authorInfo.name,
        author_profile_picture: authorInfo.profile_picture_url,
        content: post.content,
        image_url: post.image_url,
        image_path: post.image_path,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        is_pinned: post.is_pinned,
        created_at: post.created_at?.toISOString(),
        updated_at: post.updated_at?.toISOString(),
        author_liked: likedPostIds.has(post.id),
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      total: totalPosts.length,
      has_more: offset + limit < totalPosts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

/**
 * POST /api/social/posts
 * Body: { sandbox_id, content, image_url }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const userRole = isCreator ? 'creator' : isOperator ? 'operator' : 'contributor';

    const body = await request.json();
    const { sandbox_id, content, image_url } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Content must be less than 2000 characters' }, { status: 400 });
    }

    // Generate unique post ID
    const postId = `post-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;

    // Extract image path from URL if provided
    let imagePath = null;
    if (image_url) {
      try {
        const url = new URL(image_url);
        imagePath = url.pathname.split('/').slice(-2).join('/'); // Get sandbox_folder/filename
      } catch {
        // If URL parsing fails, use image_url as-is
      }
    }

    // Create post
    const newPost = await db.insert(socialPostsTable).values({
      id: postId,
      sandbox_id: sandbox_id || null,
      author_email: user.email,
      author_role: userRole,
      content: content.trim(),
      image_url: image_url || null,
      image_path: imagePath,
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      is_deleted: false,
    }).returning();

    // Get author name
    const authors = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1);

    const authorName = authors[0]?.name || user.email.split('@')[0];

    const formattedPost = {
      id: newPost[0].id,
      sandbox_id: newPost[0].sandbox_id,
      author_email: newPost[0].author_email,
      author_role: newPost[0].author_role,
      author_name: authorName,
      content: newPost[0].content,
      image_url: newPost[0].image_url,
      image_path: newPost[0].image_path,
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      created_at: newPost[0].created_at?.toISOString(),
      updated_at: newPost[0].updated_at?.toISOString(),
      author_liked: false,
    };

    return NextResponse.json({
      success: true,
      post: formattedPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

