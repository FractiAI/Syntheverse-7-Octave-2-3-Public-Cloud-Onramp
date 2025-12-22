import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('EpochInfo', 'Fetching epoch information')
    
    try {
        // Check if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            debug('EpochInfo', 'DATABASE_URL not configured, returning default epoch info')
            return NextResponse.json({
                current_epoch: 'founder',
                epochs: {
                    founder: { balance: 45000000000000, threshold: 0, distribution_amount: 0, distribution_percent: 50.0, available_tiers: [] },
                    pioneer: { balance: 22500000000000, threshold: 0, distribution_amount: 0, distribution_percent: 25.0, available_tiers: [] },
                    community: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] },
                    ecosystem: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] }
                }
            })
        }

        // Get current epoch from tokenomics
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        const currentEpoch = tokenomics[0]?.current_epoch || 'founder'
        
        // Get all epoch balances
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
        
        // If no epoch balances exist, try to initialize defaults
        if (epochBalances.length === 0) {
            const defaultEpochs = [
                { epoch: 'founder', balance: '45000000000000', threshold: 0, distribution_amount: 0, distribution_percent: 50.0 },
                { epoch: 'pioneer', balance: '22500000000000', threshold: 0, distribution_amount: 0, distribution_percent: 25.0 },
                { epoch: 'community', balance: '11250000000000', threshold: 0, distribution_amount: 0, distribution_percent: 12.5 },
                { epoch: 'ecosystem', balance: '11250000000000', threshold: 0, distribution_amount: 0, distribution_percent: 12.5 }
            ]
            
            try {
                for (const epoch of defaultEpochs) {
                    await db.insert(epochBalancesTable).values({
                        id: `epoch_${epoch.epoch}`,
                        epoch: epoch.epoch,
                        balance: epoch.balance.toString(),
                        threshold: '0',
                        distribution_amount: '0',
                        distribution_percent: epoch.distribution_percent.toString(),
                    })
                }
                
                // Fetch again after initialization
                const newBalances = await db
                    .select()
                    .from(epochBalancesTable)
                
                const epochs: Record<string, any> = {}
                newBalances.forEach(epoch => {
                    epochs[epoch.epoch] = {
                        balance: Number(epoch.balance),
                        threshold: Number(epoch.threshold),
                        distribution_amount: Number(epoch.distribution_amount),
                        distribution_percent: Number(epoch.distribution_percent),
                        available_tiers: [] // Can be populated later
                    }
                })
                
                return NextResponse.json({
                    current_epoch: currentEpoch,
                    epochs
                })
            } catch (insertError) {
                // Table might not exist, return default values
                debug('EpochInfo', 'Could not insert default epochs, returning defaults', insertError)
                return NextResponse.json({
                    current_epoch: 'founder',
                    epochs: {
                        founder: { balance: 45000000000000, threshold: 0, distribution_amount: 0, distribution_percent: 50.0, available_tiers: [] },
                        pioneer: { balance: 22500000000000, threshold: 0, distribution_amount: 0, distribution_percent: 25.0, available_tiers: [] },
                        community: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] },
                        ecosystem: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] }
                    }
                })
            }
        }
        
        // Format epoch data
        const epochs: Record<string, any> = {}
        epochBalances.forEach(epoch => {
            epochs[epoch.epoch] = {
                balance: Number(epoch.balance),
                threshold: Number(epoch.threshold),
                distribution_amount: Number(epoch.distribution_amount),
                distribution_percent: Number(epoch.distribution_percent),
                available_tiers: [] // Can be populated later
            }
        })
        
        const epochInfo = {
            current_epoch: currentEpoch,
            epochs
        }
        
        debug('EpochInfo', 'Epoch information fetched successfully', epochInfo)
        
        return NextResponse.json(epochInfo)
    } catch (error) {
        debugError('EpochInfo', 'Error fetching epoch information', error)
        // Return default epoch info instead of 500 error to prevent UI crashes
        return NextResponse.json({
            current_epoch: 'founder',
            epochs: {
                founder: { balance: 45000000000000, threshold: 0, distribution_amount: 0, distribution_percent: 50.0, available_tiers: [] },
                pioneer: { balance: 22500000000000, threshold: 0, distribution_amount: 0, distribution_percent: 25.0, available_tiers: [] },
                community: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] },
                ecosystem: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] }
            }
        })
    }
}

