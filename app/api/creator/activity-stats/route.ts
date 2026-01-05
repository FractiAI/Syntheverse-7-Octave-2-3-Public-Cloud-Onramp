import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  enterpriseContributionsTable,
  usersTable,
  pocLogTable,
  auditLogTable,
} from '@/utils/db/schema';
import { sql, and, gte, eq, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface ActivityStats {
  pageActivity: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  newUsers: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  submissions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: {
      evaluating: number;
      qualified: number;
      unqualified: number;
      payment_pending: number;
    };
  };
  chatSessions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  problemsReported: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: {
      errors: number;
      evaluation_errors: number;
      payment_errors: number;
      other: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isOperator && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Page Activity - count from poc_log (all events) and contributions (all activity)
    const pageActivityTotal = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable);

    const pageActivityToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(gte(pocLogTable.created_at, startOfToday));

    const pageActivityThisWeek = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(gte(pocLogTable.created_at, startOfWeek));

    const pageActivityThisMonth = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(gte(pocLogTable.created_at, startOfMonth));

    // New Users
    const newUsersTotal = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(sql`${usersTable.deleted_at} IS NULL`);

    // Note: users_table doesn't have created_at field
    // For date-based tracking, we'd need to add created_at to users_table
    // For now, we'll return 0 for date-based counts and show total
    const newUsersToday = await db
      .select({ count: sql<number>`0::int` })
      .from(usersTable)
      .limit(1);

    const newUsersThisWeek = await db
      .select({ count: sql<number>`0::int` })
      .from(usersTable)
      .limit(1);

    const newUsersThisMonth = await db
      .select({ count: sql<number>`0::int` })
      .from(usersTable)
      .limit(1);

    // Submissions - from contributions and enterprise_contributions
    const submissionsTotalMain = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable);

    const submissionsTotalEnterprise = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enterpriseContributionsTable);

    const submissionsTodayMain = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(gte(contributionsTable.created_at, startOfToday));

    const submissionsTodayEnterprise = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enterpriseContributionsTable)
      .where(gte(enterpriseContributionsTable.created_at, startOfToday));

    const submissionsThisWeekMain = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(gte(contributionsTable.created_at, startOfWeek));

    const submissionsThisWeekEnterprise = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enterpriseContributionsTable)
      .where(gte(enterpriseContributionsTable.created_at, startOfWeek));

    const submissionsThisMonthMain = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(gte(contributionsTable.created_at, startOfMonth));

    const submissionsThisMonthEnterprise = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(enterpriseContributionsTable)
      .where(gte(enterpriseContributionsTable.created_at, startOfMonth));

    // Submissions by status
    const submissionsByStatus = await db
      .select({
        status: contributionsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(contributionsTable)
      .groupBy(contributionsTable.status);

    // Chat Sessions - count from poc_log where event_type might indicate chat
    // For now, we'll use a placeholder since there's no dedicated chat table
    const chatSessionsTotal = await db
      .select({ count: sql<number>`0::int` })
      .from(pocLogTable)
      .limit(1);

    // Problems Reported - count errors from poc_log and audit_log
    const problemsTotal = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(
        and(eq(pocLogTable.event_type, 'evaluation_error'), isNotNull(pocLogTable.error_message))
      );

    const problemsToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(
        and(
          eq(pocLogTable.event_type, 'evaluation_error'),
          isNotNull(pocLogTable.error_message),
          gte(pocLogTable.created_at, startOfToday)
        )
      );

    const problemsThisWeek = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(
        and(
          eq(pocLogTable.event_type, 'evaluation_error'),
          isNotNull(pocLogTable.error_message),
          gte(pocLogTable.created_at, startOfWeek)
        )
      );

    const problemsThisMonth = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(
        and(
          eq(pocLogTable.event_type, 'evaluation_error'),
          isNotNull(pocLogTable.error_message),
          gte(pocLogTable.created_at, startOfMonth)
        )
      );

    // Problems by type
    const problemsByType = {
      errors: problemsTotal[0]?.count || 0,
      evaluation_errors: problemsTotal[0]?.count || 0,
      payment_errors: 0, // Would need to track separately
      other: 0,
    };

    const stats: ActivityStats = {
      pageActivity: {
        total: pageActivityTotal[0]?.count || 0,
        today: pageActivityToday[0]?.count || 0,
        thisWeek: pageActivityThisWeek[0]?.count || 0,
        thisMonth: pageActivityThisMonth[0]?.count || 0,
      },
      newUsers: {
        total: newUsersTotal[0]?.count || 0,
        today: newUsersToday[0]?.count || 0,
        thisWeek: newUsersThisWeek[0]?.count || 0,
        thisMonth: newUsersThisMonth[0]?.count || 0,
      },
      submissions: {
        total: (submissionsTotalMain[0]?.count || 0) + (submissionsTotalEnterprise[0]?.count || 0),
        today: (submissionsTodayMain[0]?.count || 0) + (submissionsTodayEnterprise[0]?.count || 0),
        thisWeek:
          (submissionsThisWeekMain[0]?.count || 0) + (submissionsThisWeekEnterprise[0]?.count || 0),
        thisMonth:
          (submissionsThisMonthMain[0]?.count || 0) +
          (submissionsThisMonthEnterprise[0]?.count || 0),
        byStatus: {
          evaluating: submissionsByStatus.find((s) => s.status === 'evaluating')?.count || 0,
          qualified: submissionsByStatus.find((s) => s.status === 'qualified')?.count || 0,
          unqualified: submissionsByStatus.find((s) => s.status === 'unqualified')?.count || 0,
          payment_pending:
            submissionsByStatus.find((s) => s.status === 'payment_pending')?.count || 0,
        },
      },
      chatSessions: {
        total: 0, // Placeholder - no chat table yet
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
      problemsReported: {
        total: problemsTotal[0]?.count || 0,
        today: problemsToday[0]?.count || 0,
        thisWeek: problemsThisWeek[0]?.count || 0,
        thisMonth: problemsThisMonth[0]?.count || 0,
        byType: problemsByType,
      },
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}
