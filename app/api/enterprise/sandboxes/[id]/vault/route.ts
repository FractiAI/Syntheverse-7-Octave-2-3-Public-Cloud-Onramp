import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PATCH: Update vault status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vault_status } = body;

    if (!['active', 'paused'].includes(vault_status)) {
      return NextResponse.json({ error: 'Invalid vault status' }, { status: 400 });
    }

    // Verify the user owns this sandbox
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(and(eq(enterpriseSandboxesTable.id, params.id), eq(enterpriseSandboxesTable.operator, user.email)))
      .limit(1);

    if (!sandbox || sandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found or access denied' }, { status: 404 });
    }

    const updated = await db
      .update(enterpriseSandboxesTable)
      .set({
        vault_status,
        updated_at: new Date(),
      })
      .where(eq(enterpriseSandboxesTable.id, params.id))
      .returning();

    return NextResponse.json({ sandbox: updated[0] });
  } catch (error) {
    console.error('Error updating vault status:', error);
    return NextResponse.json({ error: 'Failed to update vault status' }, { status: 500 });
  }
}

