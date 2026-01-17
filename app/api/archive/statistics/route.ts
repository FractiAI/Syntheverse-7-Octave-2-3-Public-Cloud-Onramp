import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable, allocationsTable } from '@/utils/db/schema';
import { sql, count, eq } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';

export async function GET(request: NextRequest) {
  debug('ArchiveStatistics', 'Fetching archive statistics');

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      debug('ArchiveStatistics', 'DATABASE_URL not configured, returning empty stats');
      return NextResponse.json({
        total_contributions: 0,
        status_counts: {},
        metal_counts: {},
        unique_contributors: 0,
        unique_content_hashes: 0,
        last_updated: new Date().toISOString(),
      });
    }

    // Get total contributions count
    const totalContributions = await db.select({ count: count() }).from(contributionsTable);

    // Get status counts
    const statusCounts = await db
      .select({
        status: contributionsTable.status,
        count: count(),
      })
      .from(contributionsTable)
      .groupBy(contributionsTable.status);

    // Get metal counts
    const metalCounts = await db
      .select({
        metal: sql<string>`jsonb_array_elements_text(${contributionsTable.metals})`,
        count: count(),
      })
      .from(contributionsTable)
      .where(sql`${contributionsTable.metals} IS NOT NULL`)
      .groupBy(sql`jsonb_array_elements_text(${contributionsTable.metals})`);

    // Get unique contributors
    const uniqueContributors = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${contributionsTable.contributor})` })
      .from(contributionsTable);

    // Get unique content hashes
    const uniqueContentHashes = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${contributionsTable.content_hash})` })
      .from(contributionsTable);

    // Get last updated timestamp
    const lastUpdated = await db
      .select({
        max: sql<Date>`MAX(${contributionsTable.updated_at})`,
      })
      .from(contributionsTable);

    // Format status counts
    const statusCountsMap: Record<string, number> = {};
    statusCounts.forEach((row) => {
      statusCountsMap[row.status] = Number(row.count);
    });

    // Format metal counts
    const metalCountsMap: Record<string, number> = {};
    metalCounts.forEach((row) => {
      const metal = row.metal.toLowerCase();
      metalCountsMap[metal] = (metalCountsMap[metal] || 0) + Number(row.count);
    });

    // Handle last updated date - convert to Date if needed
    let lastUpdatedDate: string;
    const maxDate = lastUpdated[0]?.max;
    if (maxDate instanceof Date) {
      lastUpdatedDate = maxDate.toISOString();
    } else if (maxDate) {
      // If it's a string or other type, try to convert it
      lastUpdatedDate = new Date(maxDate).toISOString();
    } else {
      lastUpdatedDate = new Date().toISOString();
    }

    const statistics = {
      total_contributions: Number(totalContributions[0]?.count || 0),
      status_counts: statusCountsMap,
      metal_counts: metalCountsMap,
      unique_contributors: Number(uniqueContributors[0]?.count || 0),
      unique_content_hashes: Number(uniqueContentHashes[0]?.count || 0),
      last_updated: lastUpdatedDate,
    };

    debug('ArchiveStatistics', 'Statistics fetched successfully', statistics);

    return NextResponse.json(statistics);
  } catch (error) {
    debugError('ArchiveStatistics', 'Error fetching archive statistics', error);
    // Return empty stats instead of 500 error to prevent UI crashes
    return NextResponse.json({
      total_contributions: 0,
      status_counts: {},
      metal_counts: {},
      unique_contributors: 0,
      unique_content_hashes: 0,
      last_updated: new Date().toISOString(),
    });
  }
}
