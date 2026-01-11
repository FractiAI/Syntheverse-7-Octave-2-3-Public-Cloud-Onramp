import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable, pocLogTable, allocationsTable } from '@/utils/db/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  debug('ArchiveContributions', 'Fetching contributions');

  // Prevent caching - always return fresh data
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  try {
    // Require auth for archive access (prevents bots and reduces accidental load)
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contributor = searchParams.get('contributor');
    const metal = searchParams.get('metal');
    const limitParam = searchParams.get('limit');

    // Default + clamp to keep response time bounded (prevents Vercel 300s timeouts)
    const limit = Math.max(1, Math.min(500, Number(limitParam || 200) || 200));

    debug('ArchiveContributions', 'Query parameters', { status, contributor, metal, limit });

    // Build query conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(contributionsTable.status, status));
    }
    if (contributor) {
      conditions.push(eq(contributionsTable.contributor, contributor));
    }

    let contributions = await db
      // Avoid pulling large text fields for list view (text_content can be huge)
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        content_hash: contributionsTable.content_hash,
        status: contributionsTable.status,
        category: contributionsTable.category,
        metals: contributionsTable.metals,
        // THALET Protocol: Include atomic_score column (CRITICAL for UI)
        atomic_score: contributionsTable.atomic_score,
        // Extract only the lightweight metadata fields needed for list view.
        // This avoids transferring the full metadata JSON (which can contain large Grok responses).
        meta_pod_score: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'pod_score'), '')::double precision`,
        meta_novelty: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'novelty'), '')::double precision`,
        meta_density: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'density'), '')::double precision`,
        meta_coherence: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'coherence'), '')::double precision`,
        meta_alignment: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'alignment'), '')::double precision`,
        meta_redundancy_overlap: sql<
          number | null
        >`NULLIF((${contributionsTable.metadata} ->> 'redundancy_overlap_percent'), '')::double precision`,
        meta_redundancy_penalty: sql<
          number | null
        >`NULLIF(((${contributionsTable.metadata} -> 'grok_evaluation_details' ->> 'redundancy_penalty_percent')), '')::double precision`,
        meta_redundancy_bonus: sql<
          number | null
        >`NULLIF(((${contributionsTable.metadata} -> 'grok_evaluation_details' ->> 'redundancy_bonus_points')), '')::double precision`,
        meta_qualified_founder: sql<
          boolean | null
        >`NULLIF((${contributionsTable.metadata} ->> 'qualified_founder'), '')::boolean`,
        meta_qualified_epoch: sql<
          string | null
        >`(${contributionsTable.metadata} ->> 'qualified_epoch')`,
        registered: contributionsTable.registered,
        registration_date: contributionsTable.registration_date,
        registration_tx_hash: contributionsTable.registration_tx_hash,
        stripe_payment_id: contributionsTable.stripe_payment_id,
        // Seed, Edge, and Sweet Spot Detection
        is_seed: contributionsTable.is_seed,
        is_edge: contributionsTable.is_edge,
        has_sweet_spot_edges: contributionsTable.has_sweet_spot_edges,
        overlap_percent: contributionsTable.overlap_percent,
        created_at: contributionsTable.created_at,
        updated_at: contributionsTable.updated_at,
      })
      .from(contributionsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contributionsTable.created_at))
      .limit(limit);

    // Filter by metal if specified (post-query since metals is JSONB array)
    if (metal) {
      contributions = contributions.filter((contrib) => {
        const metals = (contrib.metals as string[]) || [];
        return metals.includes(metal.toLowerCase());
      });
    }

    // Fetch allocations only for the returned contributions (bounded query)
    const submissionHashes = contributions.map((c) => c.submission_hash);
    const allocations =
      submissionHashes.length === 0
        ? []
        : await db
            .select({
              submission_hash: allocationsTable.submission_hash,
              reward: allocationsTable.reward,
            })
            .from(allocationsTable)
            .where(inArray(allocationsTable.submission_hash, submissionHashes));

    const allocatedHashes = new Set(allocations.map((a) => a.submission_hash));
    // Create a map of submission_hash -> total allocation amount
    const allocationAmounts = new Map<string, number>();
    allocations.forEach((a) => {
      const existing = allocationAmounts.get(a.submission_hash) || 0;
      allocationAmounts.set(a.submission_hash, existing + Number(a.reward));
    });

    // Format contributions to match expected API response
    const formattedContributions = contributions.map((contrib) => {
      const qualified = contrib.meta_qualified_founder ?? false;

      // Use the stored qualified_epoch from metadata
      // This should have been set to the open epoch that was used to qualify the submission
      // If missing, we can't reliably determine which epoch was open at qualification time,
      // so we'll return null rather than calculating based on density (which doesn't reflect historical epoch state)
      // Only show a qualified epoch when the PoC is actually qualified.
      // Some historical records may have an epoch-like value even when unqualified
      // (e.g., derived from score bands). That should not render as an epoch.
      const qualified_epoch = qualified ? (contrib.meta_qualified_epoch ?? null) : null;

      // Determine status: use qualified_founder from metadata as source of truth
      // If metadata says qualified but status field says unqualified, trust metadata
      // This handles cases where evaluation determined qualification but status wasn't updated
      let displayStatus = contrib.status;
      if (qualified && contrib.status === 'unqualified') {
        displayStatus = 'qualified';
        debug(
          'ArchiveContributions',
          'Status mismatch detected - using qualified_founder from metadata',
          {
            submission_hash: contrib.submission_hash,
            status_field: contrib.status,
            qualified_founder: qualified,
            pod_score: contrib.meta_pod_score,
          }
        );
      } else if (!qualified && contrib.status === 'qualified') {
        displayStatus = 'unqualified';
      }

      return {
        submission_hash: contrib.submission_hash,
        title: contrib.title,
        contributor: contrib.contributor,
        content_hash: contrib.content_hash,
        status: displayStatus, // Use corrected status
        category: contrib.category,
        metals: Array.isArray(contrib.metals) ? (contrib.metals as string[]) : [],
        // THALET Protocol: Include atomic_score for UI consumption
        atomic_score: contrib.atomic_score || null,
        // Extract scores from metadata
        pod_score: contrib.meta_pod_score ?? null,
        novelty: contrib.meta_novelty ?? null,
        density: contrib.meta_density ?? null,
        coherence: contrib.meta_coherence ?? null,
        alignment: contrib.meta_alignment ?? null,
        redundancy: contrib.meta_redundancy_overlap ?? null, // Overlap effect (-100 to +100)
        qualified: qualified, // Use qualified_founder from metadata as source of truth
        qualified_epoch: qualified_epoch,
        // Direct fields
        registered: contrib.registered ?? false,
        registration_date: contrib.registration_date?.toISOString() || null,
        registration_tx_hash: contrib.registration_tx_hash || null,
        stripe_payment_id: contrib.stripe_payment_id || null,
        allocated: allocatedHashes.has(contrib.submission_hash),
        allocation_amount: allocationAmounts.get(contrib.submission_hash) || null, // Total SYNTH tokens allocated
        // Seed, Edge, and Sweet Spot Detection (for UI highlighting)
        is_seed: contrib.is_seed ?? false,
        is_edge: contrib.is_edge ?? false,
        has_sweet_spot_edges: contrib.has_sweet_spot_edges ?? false,
        overlap_percent: contrib.overlap_percent ? Number(contrib.overlap_percent) : null,
        // NOTE: Do not include full metadata in list view (it can be very large).
        // Full details (including metadata + raw Grok response) are available via /api/archive/contributions/[hash].
        created_at: contrib.created_at?.toISOString() || '',
        updated_at: contrib.updated_at?.toISOString() || '',
      };
    });

    debug('ArchiveContributions', 'Contributions fetched', {
      count: formattedContributions.length,
    });

    return NextResponse.json(
      {
        contributions: formattedContributions,
        count: formattedContributions.length,
      },
      { headers }
    );
  } catch (error: any) {
    // If table doesn't exist or other database error, return empty array instead of 500
    // This allows the UI to continue working even if archive tables aren't set up
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      debug('ArchiveContributions', 'Contributions table not found, returning empty array', error.message);
      return NextResponse.json({
        contributions: [],
        count: 0,
      }, { headers });
    }
    
    debugError('ArchiveContributions', 'Error fetching contributions', error);
    return NextResponse.json({ 
      error: 'Failed to fetch contributions',
      message: error.message || String(error)
    }, { status: 500, headers });
  }
}

// POST endpoint to cleanup test submissions
export async function POST(request: NextRequest) {
  debug('ArchiveContributions', 'Cleaning up test submissions');

  try {
    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      debug('ArchiveContributions', 'Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find test submissions (identified by title, contributor, or submission_hash patterns)
    const allContributions = await db.select().from(contributionsTable);

    const testSubmissions = allContributions.filter((contrib) => {
      const title = contrib.title?.toLowerCase() || '';
      const contributor = contrib.contributor?.toLowerCase() || '';
      const hash = contrib.submission_hash?.toLowerCase() || '';

      return (
        title.includes('test') ||
        title.includes('demo') ||
        contributor.includes('test') ||
        contributor.includes('@example.com') ||
        hash.endsWith('-test-123') ||
        hash.endsWith('-123')
      );
    });

    debug('ArchiveContributions', 'Found test submissions', { count: testSubmissions.length });

    let cleanedCount = 0;

    // Delete test submissions and their logs
    for (const submission of testSubmissions) {
      try {
        // Delete related poc_log entries
        await db
          .delete(pocLogTable)
          .where(eq(pocLogTable.submission_hash, submission.submission_hash));

        // Delete the contribution
        await db
          .delete(contributionsTable)
          .where(eq(contributionsTable.submission_hash, submission.submission_hash));

        cleanedCount++;
        debug('ArchiveContributions', 'Deleted test submission', {
          hash: submission.submission_hash,
          title: submission.title,
        });
      } catch (error) {
        debugError('ArchiveContributions', 'Error deleting test submission', {
          error,
          hash: submission.submission_hash,
        });
        // Continue with other deletions even if one fails
      }
    }

    debug('ArchiveContributions', 'Cleanup completed', { cleanedCount });

    return NextResponse.json({
      success: true,
      cleaned_count: cleanedCount,
      message: `Successfully deleted ${cleanedCount} test submission(s)`,
    });
  } catch (error) {
    debugError('ArchiveContributions', 'Error cleaning up test submissions', error);
    return NextResponse.json({ error: 'Failed to cleanup test submissions' }, { status: 500 });
  }
}
