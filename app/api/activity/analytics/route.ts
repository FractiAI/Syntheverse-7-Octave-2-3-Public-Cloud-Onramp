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
    
    // Convert Date objects to ISO strings for SQL queries
    const startDateISO = startDate.toISOString();
    const startHourISO = startHour.toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStartISO = todayStart.toISOString();

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
      .where(gte(contributionsTable.created_at, todayStart));

    const qualificationsRealtime = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contributionsTable)
      .where(
        and(
          gte(contributionsTable.created_at, todayStart),
          eq(contributionsTable.status, 'qualified')
        )
      );

    // Historical data - Daily page activity
    const pageActivityDailyResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM poc_log
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const pageActivityDaily = Array.isArray(pageActivityDailyResult) ? pageActivityDailyResult : [];

    // Historical data - Hourly page activity (last 24 hours)
    const pageActivityHourlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', created_at) as date,
        COUNT(*)::int as value
      FROM poc_log
      WHERE created_at >= ${startHourISO}::timestamp
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY date ASC
    `);
    const pageActivityHourly = Array.isArray(pageActivityHourlyResult) ? pageActivityHourlyResult : [];

    // Historical data - Weekly page activity
    const pageActivityWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', created_at) as date,
        COUNT(*)::int as value
      FROM poc_log
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date ASC
    `);
    const pageActivityWeekly = Array.isArray(pageActivityWeeklyResult) ? pageActivityWeeklyResult : [];

    // Historical data - Daily user count
    const userCountDailyResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT contributor)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const userCountDaily = Array.isArray(userCountDailyResult) ? userCountDailyResult : [];

    // Historical data - Weekly user count
    const userCountWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', created_at) as date,
        COUNT(DISTINCT contributor)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date ASC
    `);
    const userCountWeekly = Array.isArray(userCountWeeklyResult) ? userCountWeeklyResult : [];

    // Historical data - Monthly user count
    const userCountMonthlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', created_at) as date,
        COUNT(DISTINCT contributor)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY date ASC
    `);
    const userCountMonthly = Array.isArray(userCountMonthlyResult) ? userCountMonthlyResult : [];

    // Historical data - Daily submissions
    const submissionsDailyResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const submissionsDaily = Array.isArray(submissionsDailyResult) ? submissionsDailyResult : [];

    // Historical data - Hourly submissions (last 24 hours)
    const submissionsHourlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('hour', created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startHourISO}::timestamp
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY date ASC
    `);
    const submissionsHourly = Array.isArray(submissionsHourlyResult) ? submissionsHourlyResult : [];

    // Historical data - Weekly submissions
    const submissionsWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date ASC
    `);
    const submissionsWeekly = Array.isArray(submissionsWeeklyResult) ? submissionsWeeklyResult : [];

    // Historical data - Daily qualifications
    const qualificationsDailyResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
        AND status = 'qualified'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    const qualificationsDaily = Array.isArray(qualificationsDailyResult) ? qualificationsDailyResult : [];

    // Historical data - Weekly qualifications
    const qualificationsWeeklyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('week', created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
        AND status = 'qualified'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY date ASC
    `);
    const qualificationsWeekly = Array.isArray(qualificationsWeeklyResult) ? qualificationsWeeklyResult : [];

    // Historical data - Monthly qualifications
    const qualificationsMonthlyResult = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', created_at) as date,
        COUNT(*)::int as value
      FROM contributions
      WHERE created_at >= ${startDateISO}::timestamp
        AND status = 'qualified'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY date ASC
    `);
    const qualificationsMonthly = Array.isArray(qualificationsMonthlyResult) ? qualificationsMonthlyResult : [];

    // Qualifications breakdown by tier
    const qualificationsBreakdownResult = await db.execute(sql`
      SELECT 
        CASE 
          WHEN (metadata->>'pod_score')::numeric >= 8000 THEN 'founder'
          WHEN (metadata->>'pod_score')::numeric >= 6000 THEN 'pioneer'
          WHEN (metadata->>'pod_score')::numeric >= 5000 THEN 'community'
          WHEN (metadata->>'pod_score')::numeric >= 4000 THEN 'ecosystem'
          ELSE 'other'
        END as tier,
        COUNT(*)::int as count
      FROM contributions
      WHERE status = 'qualified'
      GROUP BY tier
    `);
    const qualificationsBreakdown = Array.isArray(qualificationsBreakdownResult) ? qualificationsBreakdownResult : [];

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
        pageActivity: pageActivityDaily.map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
          value: Number(r.value || 0),
        })),
        userCount: userCountDaily.map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
          value: Number(r.value || 0),
        })),
        submissions: submissionsDaily.map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
          value: Number(r.value || 0),
        })),
        qualifications: qualificationsDaily.map((r: any) => ({
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
          value: Number(r.value || 0),
        })),
      },
      historical: {
        pageActivity: {
          hourly: pageActivityHourly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
          daily: pageActivityDaily.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
            value: Number(r.value || 0),
          })),
          weekly: pageActivityWeekly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
        },
        userCount: {
          daily: userCountDaily.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
            value: Number(r.value || 0),
          })),
          weekly: userCountWeekly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
          monthly: userCountMonthly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
        },
        submissions: {
          hourly: submissionsHourly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
          daily: submissionsDaily.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
            value: Number(r.value || 0),
          })),
          weekly: submissionsWeekly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
        },
        qualifications: {
          daily: qualificationsDaily.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date || '').split('T')[0],
            value: Number(r.value || 0),
          })),
          weekly: qualificationsWeekly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
          monthly: qualificationsMonthly.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString() : new Date(r.date || Date.now()).toISOString(),
            value: Number(r.value || 0),
          })),
        },
      },
      locations: locationData,
      qualifications: {
        total: qualificationsBreakdown.reduce((sum, r: any) => sum + Number(r.count || 0), 0),
        founder: Number(qualificationsBreakdown.find((r: any) => r.tier === 'founder')?.count || 0),
        pioneer: Number(qualificationsBreakdown.find((r: any) => r.tier === 'pioneer')?.count || 0),
        community: Number(qualificationsBreakdown.find((r: any) => r.tier === 'community')?.count || 0),
        ecosystem: Number(qualificationsBreakdown.find((r: any) => r.tier === 'ecosystem')?.count || 0),
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

