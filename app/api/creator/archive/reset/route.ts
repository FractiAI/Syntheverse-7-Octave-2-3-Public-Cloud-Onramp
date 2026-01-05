/**
 * Creator-only endpoint to reset PoC archive
 *
 * POST /api/creator/archive/reset
 * Body: { mode: 'soft' | 'hard', confirmation_phrase: string }
 *
 * Soft Reset: Clears archived PoC records, preserves on-chain registrations, audit logs, aggregate metrics
 * Hard Reset: Deletes archived PoC data, requires explicit confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCreator, getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { eq, isNull, isNotNull, sql } from 'drizzle-orm';
import { logAuditEvent } from '@/utils/audit/audit-logger';
import { CREATOR_EMAIL } from '@/utils/auth/permissions';

const CONFIRMATION_PHRASE = 'RESET ARCHIVE';

export async function POST(request: NextRequest) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const body = await request.json();
    const { mode, confirmation_phrase } = body;

    if (!mode || (mode !== 'soft' && mode !== 'hard')) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "soft" or "hard"' },
        { status: 400 }
      );
    }

    if (!confirmation_phrase || confirmation_phrase !== CONFIRMATION_PHRASE) {
      return NextResponse.json(
        { error: `Invalid confirmation phrase. Must be exactly: ${CONFIRMATION_PHRASE}` },
        { status: 400 }
      );
    }

    // Get IP and user agent for audit
    const ip_address =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // Count affected records (only archived PoCs, not active or on-chain)
    const archivedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributionsTable)
      .where(
        sql`${contributionsTable.status} = 'archived' AND ${contributionsTable.registered} = false`
      );

    const affectedCount = Number(archivedCount[0]?.count || 0);

    if (mode === 'soft') {
      // Soft reset: Set archived_at timestamp, preserve data
      await db
        .update(contributionsTable)
        .set({
          archived_at: new Date(),
          updated_at: new Date(),
        })
        .where(
          sql`${contributionsTable.status} = 'archived' AND ${contributionsTable.registered} = false AND ${contributionsTable.archived_at} IS NULL`
        );

      await logAuditEvent(
        user.email,
        'archive_reset_soft',
        'archive',
        'all_archived_pocs',
        affectedCount,
        {
          confirmation_phrase,
          ip_address,
          user_agent,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Archive soft reset completed',
        affected_count: affectedCount,
        mode: 'soft',
      });
    } else {
      // Hard reset: Delete archived PoC data (but preserve on-chain registrations)
      // Only delete contributions that are archived AND not registered on-chain
      const deleted = await db
        .delete(contributionsTable)
        .where(
          sql`${contributionsTable.status} = 'archived' AND ${contributionsTable.registered} = false`
        );

      await logAuditEvent(
        user.email,
        'archive_reset_hard',
        'archive',
        'all_archived_pocs',
        affectedCount,
        {
          confirmation_phrase,
          ip_address,
          user_agent,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Archive hard reset completed',
        affected_count: affectedCount,
        mode: 'hard',
      });
    }
  } catch (error) {
    console.error('Archive reset error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset archive',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/creator/archive/reset - Get archive statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    // Get statistics
    const stats = await db
      .select({
        status: contributionsTable.status,
        count: sql<number>`count(*)`,
      })
      .from(contributionsTable)
      .groupBy(contributionsTable.status);

    const registeredCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributionsTable)
      .where(eq(contributionsTable.registered, true));

    const archivedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributionsTable)
      .where(
        sql`${contributionsTable.status} = 'archived' AND ${contributionsTable.registered} = false`
      );

    return NextResponse.json({
      statistics: {
        by_status: stats.map((s) => ({ status: s.status, count: Number(s.count) })),
        registered: Number(registeredCount[0]?.count || 0),
        archived_resettable: Number(archivedCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error('Archive stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get archive statistics',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
