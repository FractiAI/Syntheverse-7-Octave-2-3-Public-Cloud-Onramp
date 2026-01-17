/**
 * API endpoint to clear the PoC archive and reset registration/payment history
 *
 * DELETE /api/admin/clear-archive
 *
 * This endpoint clears:
 * - All contributions
 * - All allocations
 * - All poc_log entries
 * - Resets tokenomics total_distributed to 0
 * - Resets epoch balances (preserves epoch structure, just resets distributed amounts)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  allocationsTable,
  pocLogTable,
  tokenomicsTable,
  epochBalancesTable,
  epochMetalBalancesTable,
} from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: NextRequest) {
  debug('ClearArchive', 'Archive cleanup requested');

  try {
    // Check authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      debug('ClearArchive', 'Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Start transaction-like operation (delete in correct order to respect foreign keys)
    let contributionsDeleted = 0;
    let allocationsDeleted = 0;
    let logsDeleted = 0;

    try {
      // 1. Delete all allocations first
      const allocations = await db.select().from(allocationsTable);

      for (const allocation of allocations) {
        await db.delete(allocationsTable).where(eq(allocationsTable.id, allocation.id));
      }
      allocationsDeleted = allocations.length;
      debug('ClearArchive', 'Deleted allocations', { count: allocationsDeleted });

      // 2. Delete all poc_log entries
      const logs = await db.select().from(pocLogTable);

      for (const log of logs) {
        await db.delete(pocLogTable).where(eq(pocLogTable.id, log.id));
      }
      logsDeleted = logs.length;
      debug('ClearArchive', 'Deleted logs', { count: logsDeleted });

      // 3. Delete all contributions (this will also clear registration data)
      const contributions = await db.select().from(contributionsTable);

      for (const contribution of contributions) {
        await db
          .delete(contributionsTable)
          .where(eq(contributionsTable.submission_hash, contribution.submission_hash));
      }
      contributionsDeleted = contributions.length;
      debug('ClearArchive', 'Deleted contributions', { count: contributionsDeleted });

      // 4. Reset tokenomics to initial state
      const tokenomicsState = await db
        .select()
        .from(tokenomicsTable)
        .where(eq(tokenomicsTable.id, 'main'))
        .limit(1);

      if (tokenomicsState.length > 0) {
        await db
          .update(tokenomicsTable)
          .set({
            total_distributed: '0',
            total_distributed_gold: '0',
            total_distributed_silver: '0',
            total_distributed_copper: '0',
            current_epoch: 'founder',
            founder_halving_count: 0,
            updated_at: new Date(),
          })
          .where(eq(tokenomicsTable.id, 'main'));
        debug('ClearArchive', 'Reset tokenomics to initial state (founder epoch, 0 distributed)');
      } else {
        // Insert tokenomics record if it doesn't exist
        await db.insert(tokenomicsTable).values({
          id: 'main',
          total_supply: '90000000000000',
          total_distributed: '0',
          total_supply_gold: '45000000000000',
          total_supply_silver: '22500000000000',
          total_supply_copper: '22500000000000',
          total_distributed_gold: '0',
          total_distributed_silver: '0',
          total_distributed_copper: '0',
          current_epoch: 'founder',
          founder_halving_count: 0,
        });
        debug('ClearArchive', 'Created tokenomics record with initial state');
      }

      // 5a. Reset epoch metal balances to original per-metal distribution amounts (new model)
      const originalMetalBalances: Record<string, Record<string, string>> = {
        founder: { gold: '22500000000000', silver: '11250000000000', copper: '11250000000000' },
        pioneer: { gold: '11250000000000', silver: '5625000000000', copper: '5625000000000' },
        community: { gold: '5625000000000', silver: '2812500000000', copper: '2812500000000' },
        ecosystem: { gold: '5625000000000', silver: '2812500000000', copper: '2812500000000' },
      };

      try {
        const metalRows = await db.select().from(epochMetalBalancesTable);
        for (const row of metalRows) {
          const epoch = String(row.epoch).toLowerCase().trim();
          const metal = String(row.metal).toLowerCase().trim();
          const original = originalMetalBalances[epoch]?.[metal];
          if (!original) continue;
          await db
            .update(epochMetalBalancesTable)
            .set({
              balance: original,
              distribution_amount: original,
              updated_at: new Date(),
            })
            .where(eq(epochMetalBalancesTable.id, row.id));
        }
      } catch (metalResetErr) {
        debug(
          'ClearArchive',
          'epoch_metal_balances reset skipped (table may not exist)',
          metalResetErr
        );
      }

      // 5. Reset epoch balances to original distribution amounts
      // Original distribution amounts:
      // - Founder: 45T (45,000,000,000,000)
      // - Pioneer: 22.5T (22,500,000,000,000)
      // - Community: 11.25T (11,250,000,000,000)
      // - Ecosystem: 11.25T (11,250,000,000,000)
      const originalBalances: Record<string, string> = {
        founder: '45000000000000',
        pioneer: '22500000000000',
        community: '11250000000000',
        ecosystem: '11250000000000',
      };

      const epochBalances = await db.select().from(epochBalancesTable);

      for (const epochBalance of epochBalances) {
        const originalBalance =
          originalBalances[epochBalance.epoch] || epochBalance.distribution_amount.toString();
        await db
          .update(epochBalancesTable)
          .set({
            balance: originalBalance,
            distribution_amount: '0',
            updated_at: new Date(),
          })
          .where(eq(epochBalancesTable.id, epochBalance.id));
      }

      // Ensure all epochs exist with correct balances (insert if missing)
      for (const [epoch, balance] of Object.entries(originalBalances)) {
        const distributionPercent: Record<string, number> = {
          founder: 50.0,
          pioneer: 25.0,
          community: 12.5,
          ecosystem: 12.5,
        };

        await db
          .insert(epochBalancesTable)
          .values({
            id: `epoch_${epoch}`,
            epoch: epoch,
            balance: balance,
            threshold: '0',
            distribution_amount: '0',
            distribution_percent: distributionPercent[epoch].toString(),
          })
          .onConflictDoUpdate({
            target: epochBalancesTable.id,
            set: {
              balance: balance,
              distribution_amount: '0',
              updated_at: new Date(),
            },
          });
      }

      debug('ClearArchive', 'Reset epoch balances to original distribution amounts', {
        count: epochBalances.length,
      });

      debug('ClearArchive', 'Archive cleanup completed successfully', {
        contributionsDeleted,
        allocationsDeleted,
        logsDeleted,
      });

      return NextResponse.json({
        success: true,
        message: 'Archive cleared successfully',
        deleted: {
          contributions: contributionsDeleted,
          allocations: allocationsDeleted,
          logs: logsDeleted,
        },
        reset: {
          tokenomics_total_distributed: 0,
          epoch_balances: epochBalances.length,
        },
      });
    } catch (deleteError) {
      debugError('ClearArchive', 'Error during cleanup', deleteError);
      throw deleteError;
    }
  } catch (error) {
    debugError('ClearArchive', 'Archive cleanup failed', error);
    return NextResponse.json(
      {
        error: 'Failed to clear archive',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
