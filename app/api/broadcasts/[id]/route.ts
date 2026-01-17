/**
 * System Broadcast Management API
 * PUT - Update broadcast (creator/operator only)
 * DELETE - Delete/deactivate broadcast (creator/operator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { systemBroadcastsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/broadcasts/[id] - Update broadcast
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { message, nature, is_active, expires_at } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (message !== undefined) {
      if (!message.trim()) {
        return NextResponse.json(
          { error: 'Message cannot be empty' },
          { status: 400 }
        );
      }
      updateData.message = message.trim();
    }

    if (nature !== undefined) {
      const validNatures = ['announcement', 'warning', 'info', 'success', 'milestone', 'alert', 'update'];
      if (!validNatures.includes(nature)) {
        return NextResponse.json(
          { error: `Invalid nature. Must be one of: ${validNatures.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.nature = nature;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    if (expires_at !== undefined) {
      updateData.expires_at = expires_at ? new Date(expires_at) : null;
    }

    await db
      .update(systemBroadcastsTable)
      .set(updateData)
      .where(eq(systemBroadcastsTable.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating broadcast:', error);
    return NextResponse.json(
      {
        error: 'Failed to update broadcast',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/broadcasts/[id] - Deactivate broadcast
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db
      .update(systemBroadcastsTable)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(eq(systemBroadcastsTable.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete broadcast',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

