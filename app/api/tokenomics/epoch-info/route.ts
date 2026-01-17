import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { tokenomicsTable, epochBalancesTable, epochMetalBalancesTable } from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  debug('EpochInfo', 'Fetching epoch information');

  // Prevent caching - always return fresh data
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  const fetchOperation = async () => {
    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        debug('EpochInfo', 'DATABASE_URL not configured, returning default epoch info');
        return {
          current_epoch: 'founder',
          epochs: {
            founder: {
              balance: 45000000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 50.0,
              available_tiers: [],
            },
            pioneer: {
              balance: 22500000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 25.0,
              available_tiers: [],
            },
            community: {
              balance: 11250000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 12.5,
              available_tiers: [],
            },
            ecosystem: {
              balance: 11250000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 12.5,
              available_tiers: [],
            },
          },
          epoch_metals: {
            founder: {
              gold: {
                balance: 22500000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 50.0,
              },
              silver: {
                balance: 11250000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 50.0,
              },
              copper: {
                balance: 11250000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 50.0,
              },
            },
            pioneer: {
              gold: {
                balance: 11250000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 25.0,
              },
              silver: {
                balance: 5625000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 25.0,
              },
              copper: {
                balance: 5625000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 25.0,
              },
            },
            community: {
              gold: {
                balance: 5625000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
              silver: {
                balance: 2812500000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
              copper: {
                balance: 2812500000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
            },
            ecosystem: {
              gold: {
                balance: 5625000000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
              silver: {
                balance: 2812500000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
              copper: {
                balance: 2812500000000,
                threshold: 0,
                distribution_amount: 0,
                distribution_percent: 12.5,
              },
            },
          },
        };
      }

      // Fetch current epoch + per-metal epoch balances in parallel (keep this endpoint fast).
      const [tokenomics, metalEpochBalances] = await Promise.all([
        db.select().from(tokenomicsTable).where(eq(tokenomicsTable.id, 'main')).limit(1),
        (async () => {
          try {
            // If this table ever accumulates duplicate rows, group down to one row per (epoch, metal).
            // Use MAX(...) as a pragmatic “latest/current value” reducer.
            return await db
              .select({
                epoch: epochMetalBalancesTable.epoch,
                metal: epochMetalBalancesTable.metal,
                balance: sql<string | null>`MAX(${epochMetalBalancesTable.balance})`,
                threshold: sql<string | null>`MAX(${epochMetalBalancesTable.threshold})`,
                distribution_amount: sql<
                  string | null
                >`MAX(${epochMetalBalancesTable.distribution_amount})`,
                distribution_percent: sql<
                  string | null
                >`MAX(${epochMetalBalancesTable.distribution_percent})`,
              })
              .from(epochMetalBalancesTable)
              .groupBy(epochMetalBalancesTable.epoch, epochMetalBalancesTable.metal);
          } catch (metalErr) {
            debug(
              'EpochInfo',
              'epoch_metal_balances not available (fallback to legacy epoch_balances)',
              metalErr
            );
            return [];
          }
        })(),
      ]);

      let currentEpoch = tokenomics[0]?.current_epoch || 'founder';

      // Ensure currentEpoch is normalized to lowercase
      currentEpoch = String(currentEpoch).toLowerCase().trim();

      // IMPORTANT: Do NOT call checkAndTransitionEpoch() here - this API should only READ the current epoch
      // Automatic transitions should only happen during allocation, not when reading epoch info
      // This prevents the epoch from changing just by viewing the dashboard

      // Debug log to see what we're getting from the database
      debug('EpochInfo', 'Current epoch from database (read-only, no transitions)', {
        raw: tokenomics[0]?.current_epoch,
        normalized: currentEpoch,
        tokenomicsRecord: tokenomics[0],
      });

      if (metalEpochBalances.length > 0) {
        const epochMetals: Record<string, any> = {};
        const epochs: Record<string, any> = {};

        for (const row of metalEpochBalances) {
          const epoch = String(row.epoch).toLowerCase().trim();
          const metal = String(row.metal).toLowerCase().trim();
          if (!epochMetals[epoch]) epochMetals[epoch] = {};

          const balance = row.balance ? parseFloat(String(row.balance)) : 0;
          const threshold = row.threshold ? parseFloat(String(row.threshold)) : 0;
          const distributionAmount = row.distribution_amount
            ? parseFloat(String(row.distribution_amount))
            : 0;
          const distributionPercent = row.distribution_percent
            ? parseFloat(String(row.distribution_percent))
            : 0;

          epochMetals[epoch][metal] = {
            balance,
            threshold,
            distribution_amount: distributionAmount,
            distribution_percent: distributionPercent,
          };

          // Aggregate epoch totals (sum of metals)
          if (!epochs[epoch]) {
            epochs[epoch] = {
              balance: 0,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: distributionPercent,
              available_tiers: [],
            };
          }
          epochs[epoch].balance += balance;
        }

        return {
          current_epoch: currentEpoch,
          epochs,
          epoch_metals: epochMetals,
        };
      }

      // Fallback: legacy epoch_balances table
      const epochBalances = await db.select().from(epochBalancesTable);

      // If no epoch balances exist, DO NOT write defaults here (read-only endpoint).
      // Return defaults immediately to avoid slow writes/locks and keep this endpoint responsive.
      if (epochBalances.length === 0) {
        return {
          current_epoch: currentEpoch,
          epochs: {
            founder: {
              balance: 45000000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 50.0,
              available_tiers: [],
            },
            pioneer: {
              balance: 22500000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 25.0,
              available_tiers: [],
            },
            community: {
              balance: 11250000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 12.5,
              available_tiers: [],
            },
            ecosystem: {
              balance: 11250000000000,
              threshold: 0,
              distribution_amount: 0,
              distribution_percent: 12.5,
              available_tiers: [],
            },
          },
        };
      }

      // Format epoch data
      const epochs: Record<string, any> = {};
      epochBalances.forEach((epoch) => {
        // Convert numeric strings to numbers, handling null/undefined
        // Drizzle returns numeric as strings, so we need to parse them
        let balance = 0;
        let threshold = 0;
        let distributionAmount = 0;
        let distributionPercent = 0;

        try {
          // Convert to string first, then parse as float
          balance = epoch.balance ? parseFloat(String(epoch.balance)) : 0;
          threshold = epoch.threshold ? parseFloat(String(epoch.threshold)) : 0;
          distributionAmount = epoch.distribution_amount
            ? parseFloat(String(epoch.distribution_amount))
            : 0;
          distributionPercent = epoch.distribution_percent
            ? parseFloat(String(epoch.distribution_percent))
            : 0;

          // Verify conversion worked (check for NaN)
          if (isNaN(balance)) {
            debug('EpochInfo', 'Failed to parse balance', {
              epoch: epoch.epoch,
              rawBalance: epoch.balance,
              balanceType: typeof epoch.balance,
            });
            balance = 0;
          }
        } catch (error) {
          debug('EpochInfo', 'Error parsing epoch balance', {
            epoch: epoch.epoch,
            error,
            rawBalance: epoch.balance,
          });
        }

        epochs[epoch.epoch] = {
          balance: balance,
          threshold: threshold,
          distribution_amount: distributionAmount,
          distribution_percent: distributionPercent,
          available_tiers: [], // Can be populated later
        };
      });

      // Debug: Log the balances being returned
      debug('EpochInfo', 'Formatted epoch balances', {
        epochCount: epochBalances.length,
        epochs: Object.keys(epochs),
        balances: Object.fromEntries(
          Object.entries(epochs).map(([key, value]) => [key, value.balance])
        ),
        rawBalances: epochBalances.map((e) => ({
          epoch: e.epoch,
          balance: e.balance,
          balanceType: typeof e.balance,
          id: e.id,
        })),
        founderBalance: epochs.founder?.balance,
        founderRaw: epochBalances.find((e) => e.epoch === 'founder')?.balance,
      });

      const epochInfo = {
        current_epoch: currentEpoch,
        epochs,
      };

      debug('EpochInfo', 'Epoch information fetched successfully', epochInfo);

      return epochInfo;
    } catch (error) {
      debugError('EpochInfo', 'Error in fetch operation', error);
      throw error;
    }
  };

  try {
    // Execute the fetch operation (keep this endpoint fast; client has its own timeout).
    const result = await fetchOperation();
    return NextResponse.json(result, { headers });
  } catch (error) {
    debugError('EpochInfo', 'Error fetching epoch information', error);
    // Return default epoch info instead of 500 error to prevent UI crashes
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(
      {
        current_epoch: 'founder',
        epochs: {
          founder: {
            balance: 45000000000000,
            threshold: 0,
            distribution_amount: 0,
            distribution_percent: 50.0,
            available_tiers: [],
          },
          pioneer: {
            balance: 22500000000000,
            threshold: 0,
            distribution_amount: 0,
            distribution_percent: 25.0,
            available_tiers: [],
          },
          community: {
            balance: 11250000000000,
            threshold: 0,
            distribution_amount: 0,
            distribution_percent: 12.5,
            available_tiers: [],
          },
          ecosystem: {
            balance: 11250000000000,
            threshold: 0,
            distribution_amount: 0,
            distribution_percent: 12.5,
            available_tiers: [],
          },
        },
      },
      { headers }
    );
  }
}
