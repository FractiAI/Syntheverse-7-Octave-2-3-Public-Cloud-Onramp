/**
 * Get All Broadcasts API (including inactive)
 * For creator/operator dashboards to manage broadcasts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { systemBroadcastsTable } from '@/utils/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/broadcasts/all - Get all broadcasts (including inactive)
 * Creator/Operator only
 */
export async function GET(request: NextRequest) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const broadcasts = await db
      .select()
      .from(systemBroadcastsTable)
      .orderBy(desc(systemBroadcastsTable.created_at));

    return NextResponse.json({
      broadcasts: broadcasts.map((b) => ({
        id: b.id,
        message: b.message,
        nature: b.nature,
        is_active: b.is_active,
        created_by: b.created_by,
        created_at: b.created_at?.toISOString(),
        expires_at: b.expires_at?.toISOString() || null,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching all broadcasts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch broadcasts',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

