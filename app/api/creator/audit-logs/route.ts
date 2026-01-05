/**
 * Creator-only endpoint to view audit logs
 * 
 * GET /api/creator/audit-logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { auditLogTable } from '@/utils/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const actionType = searchParams.get('action_type');

    let query = db.select().from(auditLogTable).orderBy(desc(auditLogTable.created_at));

    if (actionType) {
      const { eq } = await import('drizzle-orm');
      query = query.where(eq(auditLogTable.action_type, actionType)) as any;
    }

    const logs = await query.limit(limit).offset(offset);

    // Get total count
    const { count } = await import('drizzle-orm');
    const totalCount = await db
      .select({ count: count() })
      .from(auditLogTable);

    return NextResponse.json({
      logs,
      pagination: {
        limit,
        offset,
        total: Number(totalCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get audit logs',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

