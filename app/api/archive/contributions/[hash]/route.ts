import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable, pocLogTable, allocationsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  const submissionHash = params.hash;
  debug('ArchiveContribution', 'Fetching contribution', { submissionHash });

  try {
    const contribution = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      debug('ArchiveContribution', 'Contribution not found', { submissionHash });
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    const contrib = contribution[0];

    // Get allocation amount for this submission
    const allocations = await db
      .select()
      .from(allocationsTable)
      .where(eq(allocationsTable.submission_hash, submissionHash));

    const allocationAmount = allocations.reduce((sum, a) => sum + Number(a.reward), 0);

    const formatted = {
      submission_hash: contrib.submission_hash,
      title: contrib.title,
      contributor: contrib.contributor,
      content_hash: contrib.content_hash,
      text_content: contrib.text_content,
      status: contrib.status,
      category: contrib.category,
      metals: (contrib.metals as string[]) || [],
      // THALET Protocol: Include atomic_score as top-level field
      atomic_score: contrib.atomic_score || null,
      metadata: {
        ...(contrib.metadata || {}),
        // ALSO include in metadata for UI compatibility
        atomic_score: contrib.atomic_score || null,
      },
      registered: contrib.registered ?? false,
      registration_date: contrib.registration_date?.toISOString() || null,
      registration_tx_hash: contrib.registration_tx_hash || null,
      stripe_payment_id: contrib.stripe_payment_id || null,
      allocation_amount: allocationAmount > 0 ? allocationAmount : null,
      // Seed, Edge, and Sweet Spot Detection
      is_seed: contrib.is_seed ?? false,
      is_edge: contrib.is_edge ?? false,
      has_sweet_spot_edges: contrib.has_sweet_spot_edges ?? false,
      overlap_percent: contrib.overlap_percent ? Number(contrib.overlap_percent) : null,
      created_at: contrib.created_at?.toISOString() || '',
      updated_at: contrib.updated_at?.toISOString() || '',
    };

    debug('ArchiveContribution', 'Contribution fetched successfully', { submissionHash });

    return NextResponse.json(formatted);
  } catch (error) {
    debugError('ArchiveContribution', 'Error fetching contribution', error);
    return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { hash: string } }) {
  const submissionHash = params.hash;
  debug('ArchiveContribution', 'Deleting contribution', { submissionHash });

  try {
    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      debug('ArchiveContribution', 'Unauthorized delete attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contribution to verify it exists
    const contribution = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      debug('ArchiveContribution', 'Contribution not found for deletion', { submissionHash });
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Delete related poc_log entries first
    await db.delete(pocLogTable).where(eq(pocLogTable.submission_hash, submissionHash));

    // Delete the contribution
    await db
      .delete(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash));

    debug('ArchiveContribution', 'Contribution deleted successfully', { submissionHash });

    return NextResponse.json({
      success: true,
      message: 'Contribution deleted successfully',
      submission_hash: submissionHash,
    });
  } catch (error) {
    debugError('ArchiveContribution', 'Error deleting contribution', error);
    return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 });
  }
}
