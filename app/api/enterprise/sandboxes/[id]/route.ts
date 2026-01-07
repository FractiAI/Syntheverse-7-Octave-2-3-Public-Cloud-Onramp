import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Get single sandbox
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!sandbox || sandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    return NextResponse.json({ sandbox: sandbox[0] });
  } catch (error) {
    console.error('Error fetching sandbox:', error);
    return NextResponse.json({ error: 'Failed to fetch sandbox' }, { status: 500 });
  }
}

// PATCH: Update sandbox configuration
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

    const body = await request.json();
    const { name, description, scoring_config } = body;

    // Verify sandbox exists
    const existingSandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, params.id))
      .limit(1);

    if (!existingSandbox || existingSandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    const sandbox = existingSandbox[0];

    // Permission check: Contributors can only edit their own sandboxes
    // Creators and operators can edit any sandbox
    if (!isCreator && !isOperator && sandbox.operator !== user.email) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own sandboxes' }, { status: 403 });
    }

    // Update sandbox
    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Sandbox name is required' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (scoring_config !== undefined) {
      updateData.scoring_config = scoring_config;
    }

    const updated = await db
      .update(enterpriseSandboxesTable)
      .set(updateData)
      .where(eq(enterpriseSandboxesTable.id, params.id))
      .returning();

    return NextResponse.json({ sandbox: updated[0] });
  } catch (error) {
    console.error('Error updating sandbox:', error);
    return NextResponse.json({ error: 'Failed to update sandbox' }, { status: 500 });
  }
}

// DELETE: Delete sandbox (contributors can delete their own, creators/operators can delete any except Syntheverse)
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

    // Prevent deletion of Syntheverse root sandbox
    if (params.id === 'syntheverse') {
      return NextResponse.json({ error: 'Cannot delete Syntheverse root sandbox' }, { status: 400 });
    }

    // Check if sandbox exists
    const existingSandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, params.id))
      .limit(1);

    if (!existingSandbox || existingSandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    const sandbox = existingSandbox[0];

    // Permission check: Contributors can only delete their own sandboxes
    // Creators and operators can delete any sandbox (except Syntheverse, already checked)
    if (!isCreator && !isOperator && sandbox.operator !== user.email) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own sandboxes' }, { status: 403 });
    }

    // Delete the sandbox
    await db.delete(enterpriseSandboxesTable).where(eq(enterpriseSandboxesTable.id, params.id));

    return NextResponse.json({ success: true, message: 'Sandbox deleted successfully' });
  } catch (error) {
    console.error('Error deleting sandbox:', error);
    return NextResponse.json({ error: 'Failed to delete sandbox' }, { status: 500 });
  }
}
