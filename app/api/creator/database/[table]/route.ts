/**
 * Creator-only endpoint to view database table contents
 * 
 * GET /api/creator/database/[table]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  usersTable,
  allocationsTable,
  auditLogTable,
  enterpriseSandboxesTable,
  enterpriseContributionsTable,
} from '@/utils/db/schema';
import { desc, sql } from 'drizzle-orm';

const TABLE_MAP: Record<string, any> = {
  contributions: contributionsTable,
  users_table: usersTable,
  allocations: allocationsTable,
  audit_log: auditLogTable,
  enterprise_sandboxes: enterpriseSandboxesTable,
  enterprise_contributions: enterpriseContributionsTable,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const tableName = decodeURIComponent(params.table);
    const table = TABLE_MAP[tableName];

    if (!table) {
      return NextResponse.json(
        { error: `Table "${tableName}" not found or not accessible` },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get table data
    let query = db.select().from(table).limit(limit).offset(offset);

    // Add ordering for tables that have created_at or id
    if (tableName === 'audit_log' || tableName === 'contributions') {
      query = query.orderBy(desc((table as any).created_at)) as any;
    } else if (tableName === 'users_table') {
      query = query.orderBy(desc((table as any).email)) as any;
    }

    const rows = await query;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(table);

    return NextResponse.json({
      table: tableName,
      rows: rows.map((row) => {
        // Convert to plain objects, handling dates and big numbers
        const plain: any = {};
        for (const [key, value] of Object.entries(row)) {
          if (value instanceof Date) {
            plain[key] = value.toISOString();
          } else if (typeof value === 'object' && value !== null) {
            plain[key] = value;
          } else {
            plain[key] = value;
          }
        }
        return plain;
      }),
      pagination: {
        limit,
        offset,
        total: Number(countResult[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error('Get database table error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get table data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

