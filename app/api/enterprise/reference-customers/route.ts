import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET: Get list of reference customers (sandboxes where reference_customer = true)
 * Only accessible to operators/creators
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sandboxes where reference_customer is true
    // Using SQL to check JSONB metadata field
    const referenceSandboxes = await db
      .select({
        id: enterpriseSandboxesTable.id,
        name: enterpriseSandboxesTable.name,
        description: enterpriseSandboxesTable.description,
        operator: enterpriseSandboxesTable.operator,
        synth_activated_at: enterpriseSandboxesTable.synth_activated_at,
        created_at: enterpriseSandboxesTable.created_at,
        metadata: enterpriseSandboxesTable.metadata,
      })
      .from(enterpriseSandboxesTable)
      .where(
        sql`(${enterpriseSandboxesTable.metadata}->>'reference_customer')::boolean = true`
      );

    // Format response
    const referenceCustomers = referenceSandboxes.map((sandbox) => ({
      sandbox_id: sandbox.id,
      sandbox_name: sandbox.name,
      sandbox_description: sandbox.description,
      operator_email: sandbox.operator,
      activated_at: sandbox.synth_activated_at,
      created_at: sandbox.created_at,
      discount_applied: (sandbox.metadata as any)?.activation_discount_applied || false,
      discount_percent: (sandbox.metadata as any)?.activation_discount_percent || 0,
    }));

    return NextResponse.json({
      reference_customers: referenceCustomers,
      total: referenceCustomers.length,
    });
  } catch (error) {
    console.error('Error fetching reference customers:', error);
    return NextResponse.json({ error: 'Failed to fetch reference customers' }, { status: 500 });
  }
}

