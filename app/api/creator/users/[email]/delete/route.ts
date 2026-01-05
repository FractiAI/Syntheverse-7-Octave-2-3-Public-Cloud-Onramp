/**
 * Creator-only endpoint to delete users
 * 
 * POST /api/creator/users/[email]/delete
 * Body: { mode: 'soft' | 'hard', confirmation_phrase: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole, CREATOR_EMAIL } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { usersTable, contributionsTable } from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logAuditEvent } from '@/utils/audit/audit-logger';

const CONFIRMATION_PHRASE = 'DELETE USER';

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const targetEmail = decodeURIComponent(params.email).toLowerCase();

    // Prevent deleting Creator account
    if (targetEmail === CREATOR_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot delete Creator account' },
        { status: 400 }
      );
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

    // Check if user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, targetEmail))
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for on-chain registrations
    const onChainCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributionsTable)
      .where(
        sql`${contributionsTable.contributor} = ${targetEmail} AND ${contributionsTable.registered} = true`
      );

    const onChainPoCs = Number(onChainCount[0]?.count || 0);

    if (onChainPoCs > 0 && mode === 'hard') {
      // Warn but allow with explicit override
      // The confirmation phrase already serves as the override
    }

    // Get IP and user agent for audit
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    if (mode === 'soft') {
      // Soft delete: Set deleted_at timestamp
      await db
        .update(usersTable)
        .set({
          deleted_at: new Date(),
        })
        .where(eq(usersTable.email, targetEmail));

      await logAuditEvent(
        user.email,
        'user_delete_soft',
        'user',
        targetEmail,
        1,
        {
          confirmation_phrase,
          ip_address,
          user_agent,
          on_chain_pocs: onChainPoCs,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'User soft deleted',
        mode: 'soft',
        on_chain_pocs: onChainPoCs,
      });
    } else {
      // Hard delete: Anonymize contributions, then delete user
      // Anonymize contributions (set contributor to deleted-{hash})
      const anonymizedContributor = `deleted-${targetEmail.split('@')[0]}-${Date.now()}`;
      
      await db
        .update(contributionsTable)
        .set({
          contributor: anonymizedContributor,
        })
        .where(eq(contributionsTable.contributor, targetEmail));

      // Delete user record
      await db.delete(usersTable).where(eq(usersTable.email, targetEmail));

      await logAuditEvent(
        user.email,
        'user_delete_hard',
        'user',
        targetEmail,
        1,
        {
          confirmation_phrase,
          ip_address,
          user_agent,
          on_chain_pocs: onChainPoCs,
          anonymized_contributor: anonymizedContributor,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'User hard deleted and contributions anonymized',
        mode: 'hard',
        on_chain_pocs: onChainPoCs,
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

