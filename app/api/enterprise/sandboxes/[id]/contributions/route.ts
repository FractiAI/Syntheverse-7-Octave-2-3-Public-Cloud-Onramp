import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, enterpriseContributionsTable } from '@/utils/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Get contributions for a sandbox
export async function GET(
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

    // Verify sandbox exists and user has access
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(and(eq(enterpriseSandboxesTable.id, params.id), eq(enterpriseSandboxesTable.operator, user.email)))
      .limit(1);

    if (!sandbox || sandbox.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    // Get contributions
    const contributions = await db
      .select({
        submission_hash: enterpriseContributionsTable.submission_hash,
        title: enterpriseContributionsTable.title,
        contributor: enterpriseContributionsTable.contributor,
        status: enterpriseContributionsTable.status,
        metadata: enterpriseContributionsTable.metadata,
        created_at: enterpriseContributionsTable.created_at,
      })
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.sandbox_id, params.id))
      .orderBy(desc(enterpriseContributionsTable.created_at));

    return NextResponse.json({ contributions });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}

