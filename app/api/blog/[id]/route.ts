import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { blogPostsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Get a single blog post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, params.id))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post: post[0] });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

// PATCH: Update a blog post
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

    // Get the existing post
    const existingPost = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, params.id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = existingPost[0];

    // Check permissions
    if (post.sandbox_id) {
      // Sandbox post: creator or sandbox operator can edit
      const sandbox = await db
        .select()
        .from(enterpriseSandboxesTable)
        .where(eq(enterpriseSandboxesTable.id, post.sandbox_id))
        .limit(1);

      if (sandbox.length === 0) {
        return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
      }

      if (!isCreator && sandbox[0].operator !== user.email && post.author !== user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Main blog post: only creator can edit
      if (!isCreator && post.author !== user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.content !== undefined) updates.content = body.content.trim();
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt?.trim() || null;
    if (body.status !== undefined) {
      updates.status = body.status;
      // Set published_at if status changes to published (always set, even if already exists)
      if (body.status === 'published') {
        updates.published_at = new Date();
      }
    }
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.author_name !== undefined) updates.author_name = body.author_name?.trim() || null;

    const updatedPost = await db
      .update(blogPostsTable)
      .set(updates)
      .where(eq(blogPostsTable.id, params.id))
      .returning();

    return NextResponse.json({ post: updatedPost[0] });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE: Delete a blog post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

    // Get the existing post
    const existingPost = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, params.id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = existingPost[0];

    // Check permissions
    if (post.sandbox_id) {
      // Sandbox post: creator or sandbox operator can delete
      const sandbox = await db
        .select()
        .from(enterpriseSandboxesTable)
        .where(eq(enterpriseSandboxesTable.id, post.sandbox_id))
        .limit(1);

      if (sandbox.length === 0) {
        return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
      }

      if (!isCreator && sandbox[0].operator !== user.email && post.author !== user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Main blog post: only creator can delete
      if (!isCreator && post.author !== user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}

