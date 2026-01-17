import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import {
  tokenomicsTable,
  epochBalancesTable,
  epochMetalBalancesTable,
  allocationsTable,
} from '@/utils/db/schema';
import { eq, sql, sum } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';

export async function GET(request: NextRequest) {
  debug('TokenomicsStatistics', 'Fetching tokenomics statistics');

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      debug('TokenomicsStatistics', 'DATABASE_URL not configured, returning default stats');
      return NextResponse.json({
        total_supply: 90000000000000,
        total_distributed: 0,
        total_remaining: 90000000000000,
        total_supply_by_metal: {
          gold: 45000000000000,
          silver: 22500000000000,
          copper: 22500000000000,
        },
        total_distributed_by_metal: { gold: 0, silver: 0, copper: 0 },
        total_remaining_by_metal: {
          gold: 45000000000000,
          silver: 22500000000000,
          copper: 22500000000000,
        },
        epoch_balances: {},
        epoch_metal_balances: {},
        current_epoch: 'founder',
        founder_halving_count: 0,
        total_coherence_density: 0,
        total_holders: 0,
        total_allocations: 0,
      });
    }

    // Get main tokenomics state
    const tokenomics = await db
      .select()
      .from(tokenomicsTable)
      .where(eq(tokenomicsTable.id, 'main'))
      .limit(1);

    if (!tokenomics || tokenomics.length === 0) {
      // Try to initialize default tokenomics if not exists
      try {
        await db.insert(tokenomicsTable).values({
          id: 'main',
          total_supply: '90000000000000', // 90T
          total_distributed: '0',
          current_epoch: 'founder',
          founder_halving_count: 0,
        });
      } catch (insertError) {
        // Table might not exist, return default values
        debug(
          'TokenomicsStatistics',
          'Could not insert default tokenomics, returning defaults',
          insertError
        );
      }

      return NextResponse.json({
        total_supply: 90000000000000,
        total_distributed: 0,
        total_remaining: 90000000000000,
        total_supply_by_metal: {
          gold: 45000000000000,
          silver: 22500000000000,
          copper: 22500000000000,
        },
        total_distributed_by_metal: { gold: 0, silver: 0, copper: 0 },
        total_remaining_by_metal: {
          gold: 45000000000000,
          silver: 22500000000000,
          copper: 22500000000000,
        },
        epoch_balances: {},
        epoch_metal_balances: {},
        current_epoch: 'founder',
        founder_halving_count: 0,
        total_coherence_density: 0,
        total_holders: 0,
        total_allocations: 0,
      });
    }

    const state = tokenomics[0];

    // Epoch balances (legacy + per-metal)
    const epochBalances = await db.select().from(epochBalancesTable);

    const epochBalancesMap: Record<string, number> = {};
    epochBalances.forEach((epoch) => {
      epochBalancesMap[epoch.epoch] = Number(epoch.balance);
    });

    let epochMetalBalances: any[] = [];
    try {
      epochMetalBalances = await db.select().from(epochMetalBalancesTable);
    } catch (err) {
      debug('TokenomicsStatistics', 'epoch_metal_balances not available (legacy only)', err);
      epochMetalBalances = [];
    }

    const epochMetalBalancesMap: Record<string, Record<string, number>> = {};
    for (const row of epochMetalBalances) {
      const epoch = String(row.epoch).toLowerCase().trim();
      const metal = String(row.metal).toLowerCase().trim();
      if (!epochMetalBalancesMap[epoch]) epochMetalBalancesMap[epoch] = {};
      epochMetalBalancesMap[epoch][metal] = Number(row.balance);
    }

    // Get total allocations count
    const allocationsCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(allocationsTable);

    // Get unique holders count
    const holdersCount = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${allocationsTable.contributor})` })
      .from(allocationsTable);

    // Calculate total coherence + density (sum from contributions metadata)
    // This would require joining with contributions table
    // For now, return 0 as placeholder
    const totalCoherenceDensity = 0;

    const totalSupplyByMetal = {
      gold: Number((state as any).total_supply_gold ?? 45000000000000),
      silver: Number((state as any).total_supply_silver ?? 22500000000000),
      copper: Number((state as any).total_supply_copper ?? 22500000000000),
    };
    const totalDistributedByMetal = {
      gold: Number((state as any).total_distributed_gold ?? 0),
      silver: Number((state as any).total_distributed_silver ?? 0),
      copper: Number((state as any).total_distributed_copper ?? 0),
    };
    const totalRemainingByMetal = {
      gold: totalSupplyByMetal.gold - totalDistributedByMetal.gold,
      silver: totalSupplyByMetal.silver - totalDistributedByMetal.silver,
      copper: totalSupplyByMetal.copper - totalDistributedByMetal.copper,
    };
    const totalSupply =
      totalSupplyByMetal.gold + totalSupplyByMetal.silver + totalSupplyByMetal.copper;
    const totalDistributed =
      totalDistributedByMetal.gold +
      totalDistributedByMetal.silver +
      totalDistributedByMetal.copper;

    const statistics = {
      total_supply: totalSupply,
      total_distributed: totalDistributed,
      total_remaining: totalSupply - totalDistributed,
      total_supply_by_metal: totalSupplyByMetal,
      total_distributed_by_metal: totalDistributedByMetal,
      total_remaining_by_metal: totalRemainingByMetal,
      epoch_balances: epochBalancesMap,
      epoch_metal_balances: epochMetalBalancesMap,
      current_epoch: state.current_epoch,
      founder_halving_count: state.founder_halving_count,
      total_coherence_density: totalCoherenceDensity,
      total_holders: Number(holdersCount[0]?.count || 0),
      total_allocations: Number(allocationsCount[0]?.count || 0),
    };

    debug('TokenomicsStatistics', 'Statistics fetched successfully', statistics);

    return NextResponse.json(statistics);
  } catch (error) {
    debugError('TokenomicsStatistics', 'Error fetching tokenomics statistics', error);
    // Return default stats instead of 500 error to prevent UI crashes
    return NextResponse.json({
      total_supply: 90000000000000,
      total_distributed: 0,
      total_remaining: 90000000000000,
      epoch_balances: {},
      current_epoch: 'founder',
      founder_halving_count: 0,
      total_coherence_density: 0,
      total_holders: 0,
      total_allocations: 0,
    });
  }
}
