import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { tokenomicsTable, epochBalancesTable, allocationsTable } from '@/utils/db/schema'
import { eq, sql, sum } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('TokenomicsStatistics', 'Fetching tokenomics statistics')
    
    try {
        // Get main tokenomics state
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        if (!tokenomics || tokenomics.length === 0) {
            // Initialize default tokenomics if not exists
            await db.insert(tokenomicsTable).values({
                id: 'main',
                total_supply: '90000000000000', // 90T
                total_distributed: '0',
                current_epoch: 'founder',
                founder_halving_count: 0
            })
            
            return NextResponse.json({
                total_supply: 90000000000000,
                total_distributed: 0,
                total_remaining: 90000000000000,
                epoch_balances: {},
                current_epoch: 'founder',
                founder_halving_count: 0,
                total_coherence_density: 0,
                total_holders: 0,
                total_allocations: 0
            })
        }
        
        const state = tokenomics[0]
        
        // Get epoch balances
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
        
        const epochBalancesMap: Record<string, number> = {}
        epochBalances.forEach(epoch => {
            epochBalancesMap[epoch.epoch] = Number(epoch.balance)
        })
        
        // Get total allocations count
        const allocationsCount = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(allocationsTable)
        
        // Get unique holders count
        const holdersCount = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${allocationsTable.contributor})` })
            .from(allocationsTable)
        
        // Calculate total coherence + density (sum from contributions metadata)
        // This would require joining with contributions table
        // For now, return 0 as placeholder
        const totalCoherenceDensity = 0
        
        const statistics = {
            total_supply: Number(state.total_supply),
            total_distributed: Number(state.total_distributed),
            total_remaining: Number(state.total_supply) - Number(state.total_distributed),
            epoch_balances: epochBalancesMap,
            current_epoch: state.current_epoch,
            founder_halving_count: state.founder_halving_count,
            total_coherence_density: totalCoherenceDensity,
            total_holders: Number(holdersCount[0]?.count || 0),
            total_allocations: Number(allocationsCount[0]?.count || 0)
        }
        
        debug('TokenomicsStatistics', 'Statistics fetched successfully', statistics)
        
        return NextResponse.json(statistics)
    } catch (error) {
        debugError('TokenomicsStatistics', 'Error fetching tokenomics statistics', error)
        return NextResponse.json(
            { error: 'Failed to fetch tokenomics statistics' },
            { status: 500 }
        )
    }
}

