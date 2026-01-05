/**
 * Creator-only endpoint for user management
 * 
 * GET /api/creator/users - List all users
 * POST /api/creator/users/[email]/delete - Delete user (soft/hard)
 * POST /api/creator/users/[email]/role - Grant/revoke operator privileges
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole, CREATOR_EMAIL } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { usersTable, contributionsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, isNull, sql, desc } from 'drizzle-orm';

/**
 * GET /api/creator/users - List all users with metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeDeleted = searchParams.get('include_deleted') === 'true';

    // Build query
    let query = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        plan: usersTable.plan,
        deleted_at: usersTable.deleted_at,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.email))
      .limit(limit)
      .offset(offset);

    if (!includeDeleted) {
      query = query.where(isNull(usersTable.deleted_at)) as any;
    }

    const users = await query;

    // Get additional metadata for each user
    const usersWithMetadata = await Promise.all(
      users.map(async (u) => {
        // Count contributions
        const contributionCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(contributionsTable)
          .where(eq(contributionsTable.contributor, u.email));

        // Count enterprise sandboxes
        const sandboxCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(enterpriseSandboxesTable)
          .where(eq(enterpriseSandboxesTable.operator, u.email));

        // Get last activity (most recent contribution)
        const lastContribution = await db
          .select({
            updated_at: contributionsTable.updated_at,
          })
          .from(contributionsTable)
          .where(eq(contributionsTable.contributor, u.email))
          .orderBy(desc(contributionsTable.updated_at))
          .limit(1);

        // Check for on-chain registrations
        const onChainCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(contributionsTable)
          .where(
            sql`${contributionsTable.contributor} = ${u.email} AND ${contributionsTable.registered} = true`
          );

        return {
          ...u,
          contribution_count: Number(contributionCount[0]?.count || 0),
          sandbox_count: Number(sandboxCount[0]?.count || 0),
          on_chain_count: Number(onChainCount[0]?.count || 0),
          last_activity: lastContribution[0]?.updated_at?.toISOString() || null,
          is_creator: u.email.toLowerCase() === CREATOR_EMAIL.toLowerCase(),
        };
      })
    );

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(includeDeleted ? undefined : isNull(usersTable.deleted_at));

    return NextResponse.json({
      users: usersWithMetadata,
      pagination: {
        limit,
        offset,
        total: Number(totalCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list users',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

