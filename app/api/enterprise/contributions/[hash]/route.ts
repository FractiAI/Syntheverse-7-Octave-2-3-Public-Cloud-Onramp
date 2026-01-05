import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseContributionsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Get single contribution
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contribution = await db
      .select()
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.submission_hash, params.hash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Verify user has access (operator of the sandbox)
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, contribution[0].sandbox_id))
      .limit(1);

    if (!sandbox || sandbox.length === 0 || sandbox[0].operator !== user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ contribution: contribution[0] });
  } catch (error) {
    console.error('Error fetching contribution:', error);
    return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 });
  }
}

