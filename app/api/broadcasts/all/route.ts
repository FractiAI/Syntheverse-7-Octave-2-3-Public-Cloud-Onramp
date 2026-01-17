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
    // If table doesn't exist or other database error, return empty array instead of 500
    // This allows the UI to continue working even if broadcasts table isn't set up
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      console.warn('Broadcasts table not found, returning empty array:', error.message);
      return NextResponse.json({
        broadcasts: [],
      });
    }
    
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

