/**
 * Activity Analytics API
 * Provides real-time and historical runrate data including:
 * - Page activity (time series)
 * - User count (time series)
 * - Submissions (time series)
 * - PoC qualifications (time series)
 * - Origin location data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  enterpriseContributionsTable,
  usersTable,
  pocLogTable,
} from '@/utils/db/schema';
import { sql, gte, eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  count: number;
}

interface ActivityAnalytics {
  realtime: {
    pageActivity: number;
    activeUsers: number;
    submissionsToday: number;
    qualificationsToday: number;
  };
  runrate: {
    pageActivity: TimeSeriesDataPoint[];
    userCount: TimeSeriesDataPoint[];
    submissions: TimeSeriesDataPoint[];
    qualifications: TimeSeriesDataPoint[];
  };
  historical: {
    pageActivity: {
      hourly: TimeSeriesDataPoint[];
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
    };
    userCount: {
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
      monthly: TimeSeriesDataPoint[];
    };
    submissions: {
      hourly: TimeSeriesDataPoint[];
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
    };
    qualifications: {
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
      monthly: TimeSeriesDataPoint[];
    };
  };
  locations: LocationData[];
  qualifications: {
    total: number;
    founder: number;
    pioneer: number;
    community: number;
    ecosystem: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isOperator && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const hours = parseInt(searchParams.get('hours') || '24');

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    const startHour = new Date(now);
    startHour.setHours(now.getHours() - hours);

    // Real-time data
    const pageActivityRealtime = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pocLogTable)
      .where(gte(pocLogTable.created_at, startHour));

    const activeUsersRealtime = await db
      .select({ count: sql<number>`count(DISTINCT ${pocLogTable.contributor})::int` })
      .from(pocLogTable)
      .where(gte(pocLogTable.created_at, startHour));

    const submissionsRealtime = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(gte(contributionsTable.created_at, new Date(now.getFullYear(), now.getMonth(), now.getDate())));

    const qualificationsRealtime = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(
        and(
          gte(contributionsTable.created_at, new Date(now.getFullYear(), now.getMonth(), now.getDate())),
          eq(contributionsTable.status, 'qualified')
        )
      );

    // Historical data - Daily page activity
    const pageActivityDailyResult = await db.execute(sql`
      SELECT 
        DATE(${pocLogTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${pocLogTable}
      WHERE ${pocLogTable.created_at} >= ${startDate}
      GROUP BY DATE(${pocLogTable.created_at})
      ORDER BY date ASC
    `);
    const pageActivityDaily = (pageActivityDailyResult as any).rows || pageActivityDailyResult;

    // Historical data - Hourly page activity (last 24 hours)
    const pageActivityHourlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', ${pocLogTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${pocLogTable}
      WHERE ${pocLogTable.created_at} >= ${startHour}
      GROUP BY DATE_TRUNC('hour', ${pocLogTable.created_at})
      ORDER BY date ASC
    `);
    const pageActivityHourly = (pageActivityHourlyResult as any).rows || pageActivityHourlyResult;

    // Historical data - Weekly page activity
    const pageActivityWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', ${pocLogTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${pocLogTable}
      WHERE ${pocLogTable.created_at} >= ${startDate}
      GROUP BY DATE_TRUNC('week', ${pocLogTable.created_at})
      ORDER BY date ASC
    `);
    const pageActivityWeekly = (pageActivityWeeklyResult as any).rows || pageActivityWeeklyResult;

    // Historical data - Daily user count
    const userCountDailyResult = await db.execute(sql`
      SELECT 
        DATE(${contributionsTable.created_at}) as date,
        COUNT(DISTINCT ${contributionsTable.contributor})::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
      GROUP BY DATE(${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const userCountDaily = (userCountDailyResult as any).rows || userCountDailyResult;

    // Historical data - Weekly user count
    const userCountWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', ${contributionsTable.created_at}) as date,
        COUNT(DISTINCT ${contributionsTable.contributor})::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
      GROUP BY DATE_TRUNC('week', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const userCountWeekly = (userCountWeeklyResult as any).rows || userCountWeeklyResult;

    // Historical data - Monthly user count
    const userCountMonthlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', ${contributionsTable.created_at}) as date,
        COUNT(DISTINCT ${contributionsTable.contributor})::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
      GROUP BY DATE_TRUNC('month', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const userCountMonthly = (userCountMonthlyResult as any).rows || userCountMonthlyResult;

    // Historical data - Daily submissions
    const submissionsDailyResult = await db.execute(sql`
      SELECT 
        DATE(${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
      GROUP BY DATE(${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const submissionsDaily = (submissionsDailyResult as any).rows || submissionsDailyResult;

    // Historical data - Hourly submissions (last 24 hours)
    const submissionsHourlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', ${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startHour}
      GROUP BY DATE_TRUNC('hour', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const submissionsHourly = (submissionsHourlyResult as any).rows || submissionsHourlyResult;

    // Historical data - Weekly submissions
    const submissionsWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', ${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
      GROUP BY DATE_TRUNC('week', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const submissionsWeekly = (submissionsWeeklyResult as any).rows || submissionsWeeklyResult;

    // Historical data - Daily qualifications
    const qualificationsDailyResult = await db.execute(sql`
      SELECT 
        DATE(${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
        AND ${contributionsTable.status} = 'qualified'
      GROUP BY DATE(${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const qualificationsDaily = (qualificationsDailyResult as any).rows || qualificationsDailyResult;

    // Historical data - Weekly qualifications
    const qualificationsWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', ${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
        AND ${contributionsTable.status} = 'qualified'
      GROUP BY DATE_TRUNC('week', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const qualificationsWeekly = (qualificationsWeeklyResult as any).rows || qualificationsWeeklyResult;

    // Historical data - Monthly qualifications
    const qualificationsMonthlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', ${contributionsTable.created_at}) as date,
        COUNT(*)::int as value
      FROM ${contributionsTable}
      WHERE ${contributionsTable.created_at} >= ${startDate}
        AND ${contributionsTable.status} = 'qualified'
      GROUP BY DATE_TRUNC('month', ${contributionsTable.created_at})
      ORDER BY date ASC
    `);
    const qualificationsMonthly = (qualificationsMonthlyResult as any).rows || qualificationsMonthlyResult;

    // Qualifications breakdown by tier
    const qualificationsBreakdownResult = await db.execute(sql`
      SELECT 
        CASE 
          WHEN (${contributionsTable.metadata}->>'pod_score')::numeric >= 8000 THEN 'founder'
          WHEN (${contributionsTable.metadata}->>'pod_score')::numeric >= 6000 THEN 'pioneer'
          WHEN (${contributionsTable.metadata}->>'pod_score')::numeric >= 5000 THEN 'community'
          WHEN (${contributionsTable.metadata}->>'pod_score')::numeric >= 4000 THEN 'ecosystem'
          ELSE 'other'
        END as tier,
        COUNT(*)::int as count
      FROM ${contributionsTable}
      WHERE ${contributionsTable.status} = 'qualified'
      GROUP BY tier
    `);
    const qualificationsBreakdown = (qualificationsBreakdownResult as any).rows || qualificationsBreakdownResult;

    // Location data - extract from metadata or use placeholder
    // Note: Real location tracking would require IP geolocation or user-provided data
    const locationData: LocationData[] = [];

    const analytics: ActivityAnalytics = {
      realtime: {
        pageActivity: pageActivityRealtime[0]?.count || 0,
        activeUsers: activeUsersRealtime[0]?.count || 0,
        submissionsToday: submissionsRealtime[0]?.count || 0,
        qualificationsToday: qualificationsRealtime[0]?.count || 0,
      },
      runrate: {
        pageActivity: (pageActivityDaily as any[]).map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
          value: Number(r.value),
        })),
        userCount: (userCountDaily as any[]).map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
          value: Number(r.value),
        })),
        submissions: (submissionsDaily as any[]).map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
          value: Number(r.value),
        })),
        qualifications: (qualificationsDaily as any[]).map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
          value: Number(r.value),
        })),
      },
      historical: {
        pageActivity: {
          hourly: (pageActivityHourly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
          daily: (pageActivityDaily as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
            value: Number(r.value),
          })),
          weekly: (pageActivityWeekly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
        },
        userCount: {
          daily: (userCountDaily as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
            value: Number(r.value),
          })),
          weekly: (userCountWeekly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
          monthly: (userCountMonthly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
        },
        submissions: {
          hourly: (submissionsHourly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
          daily: (submissionsDaily as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
            value: Number(r.value),
          })),
          weekly: (submissionsWeekly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
        },
        qualifications: {
          daily: (qualificationsDaily as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
            value: Number(r.value),
          })),
          weekly: (qualificationsWeekly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
          monthly: (qualificationsMonthly as any[]).map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date).toISOString(),
            value: Number(r.value),
          })),
        },
      },
      locations: locationData,
      qualifications: {
        total: (qualificationsBreakdown as any[]).reduce((sum, r: any) => sum + Number(r.count), 0),
        founder: (qualificationsBreakdown as any[]).find((r: any) => r.tier === 'founder')?.count || 0,
        pioneer: (qualificationsBreakdown as any[]).find((r: any) => r.tier === 'pioneer')?.count || 0,
        community: (qualificationsBreakdown as any[]).find((r: any) => r.tier === 'community')?.count || 0,
        ecosystem: (qualificationsBreakdown as any[]).find((r: any) => r.tier === 'ecosystem')?.count || 0,
      },
    };

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error('Error fetching activity analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity analytics' },
      { status: 500 }
    );
  }
}

