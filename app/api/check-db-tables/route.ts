import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { sql } from 'drizzle-orm';

/**
 * Check which tables exist in the database
 * GET /api/check-db-tables
 */
export async function GET(request: NextRequest) {
  try {
    // Query to check if users_table exists
    const tablesQuery = sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;

    const tablesResult = await db.execute(tablesQuery);
    const tables = (tablesResult as any[]).map((row: any) => row.table_name);

    // Check specifically for users_table
    const hasUsersTable = tables.includes('users_table');
    const hasContributionsTable = tables.includes('contributions');
    const hasTokenomicsTable = tables.includes('tokenomics');
    const hasAllocationsTable = tables.includes('allocations');
    const hasEpochBalancesTable = tables.includes('epoch_balances');
    const hasPocLogTable = tables.includes('poc_log');

    return NextResponse.json(
      {
        success: true,
        tables: tables,
        checks: {
          users_table: hasUsersTable,
          contributions: hasContributionsTable,
          tokenomics: hasTokenomicsTable,
          allocations: hasAllocationsTable,
          epoch_balances: hasEpochBalancesTable,
          poc_log: hasPocLogTable,
        },
        summary: {
          totalTables: tables.length,
          requiredTables: {
            users_table: hasUsersTable ? '✅ exists' : '❌ missing',
            contributions: hasContributionsTable ? '✅ exists' : '❌ missing',
            tokenomics: hasTokenomicsTable ? '✅ exists' : '❌ missing',
            allocations: hasAllocationsTable ? '✅ exists' : '❌ missing',
            epoch_balances: hasEpochBalancesTable ? '✅ exists' : '❌ missing',
            poc_log: hasPocLogTable ? '✅ exists' : '❌ missing',
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
