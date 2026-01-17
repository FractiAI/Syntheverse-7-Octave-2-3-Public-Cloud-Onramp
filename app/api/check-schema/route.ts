import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { sql } from 'drizzle-orm';

/**
 * Check contributions table schema
 * GET /api/check-schema
 */
export async function GET(request: NextRequest) {
  try {
    // Check all columns in contributions table
    const columnsQuery = sql`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'contributions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `;

    const columnsResult = await db.execute(columnsQuery);
    const columns = (columnsResult as any[]).map((row: any) => ({
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
      column_default: row.column_default,
    }));

    // Check specifically for registration-related columns
    const registrationColumns = columns.filter(
      (col) =>
        col.column_name.startsWith('registration') ||
        col.column_name === 'stripe_payment_id' ||
        col.column_name === 'registered'
    );

    // Check indexes
    const indexesQuery = sql`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE tablename = 'contributions'
            AND schemaname = 'public'
            ORDER BY indexname
        `;

    const indexesResult = await db.execute(indexesQuery);
    const indexes = (indexesResult as any[]).map((row: any) => ({
      indexname: row.indexname,
      indexdef: row.indexdef,
    }));

    // Expected registration columns
    const expectedColumns = [
      'registered',
      'registration_date',
      'registration_tx_hash',
      'stripe_payment_id',
    ];

    const missingColumns = expectedColumns.filter(
      (expected) => !columns.some((col) => col.column_name === expected)
    );

    return NextResponse.json({
      success: true,
      table: 'contributions',
      total_columns: columns.length,
      registration_columns: {
        found: registrationColumns.map((col) => col.column_name),
        missing: missingColumns,
        all_present: missingColumns.length === 0,
      },
      columns: columns,
      registration_columns_detail: registrationColumns,
      indexes: indexes,
      schema_status: missingColumns.length === 0 ? 'complete' : 'incomplete',
    });
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
