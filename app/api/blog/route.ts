import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { blogPostsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, desc, and, isNull, or, sql } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET: List blog posts (optionally filtered by sandbox_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get('sandbox_id');
    const status = searchParams.get('status') || 'published'; // Default to published posts
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(blogPostsTable);

    // Filter by sandbox_id
    if (sandboxId) {
      query = query.where(eq(blogPostsTable.sandbox_id, sandboxId));
    } else {
      // Main blog (no sandbox_id)
      query = query.where(isNull(blogPostsTable.sandbox_id));
    }

    // Filter by status
    if (status !== 'all') {
      query = query.where(eq(blogPostsTable.status, status));
    }

    // Order by published_at (most recent first) or created_at if published_at is null
    const posts = await query
      .orderBy(desc(sql`COALESCE(${blogPostsTable.published_at}, ${blogPostsTable.created_at})`))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST: Create a new blog post
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

    // Only creators, operators, and enterprise sandbox operators can create blog posts
    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, excerpt, sandbox_id, status, featured, tags, author_name } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // If sandbox_id is provided, verify the user has access to it
    if (sandbox_id) {
      const sandbox = await db
        .select()
        .from(enterpriseSandboxesTable)
        .where(eq(enterpriseSandboxesTable.id, sandbox_id))
        .limit(1);

      if (sandbox.length === 0) {
        return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
      }

      // Only creator or the sandbox operator can create posts for this sandbox
      if (!isCreator && sandbox[0].operator !== user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Main blog posts can only be created by creators
      if (!isCreator) {
        return NextResponse.json({ error: 'Only creators can create main blog posts' }, { status: 403 });
      }
    }

    const postId = crypto.randomUUID();
    const publishedAt = status === 'published' ? new Date() : null;

    const newPost = await db
      .insert(blogPostsTable)
      .values({
        id: postId,
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        author: user.email,
        author_name: author_name?.trim() || user.email.split('@')[0],
        sandbox_id: sandbox_id || null,
        status: status || 'draft',
        published_at: publishedAt,
        featured: featured || false,
        tags: tags || [],
        metadata: {},
      })
      .returning();

    return NextResponse.json({ post: newPost[0] });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

