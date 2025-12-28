import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    debug('EpochInfo', 'Fetching epoch information')
    
    // Prevent caching - always return fresh data
    const headers = new Headers()
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    
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
            }, { headers })
        }

        // Get current epoch from tokenomics
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        let currentEpoch = tokenomics[0]?.current_epoch || 'founder'
        
        // Ensure currentEpoch is normalized to lowercase
        currentEpoch = String(currentEpoch).toLowerCase().trim()
        
        // IMPORTANT: Do NOT call checkAndTransitionEpoch() here - this API should only READ the current epoch
        // Automatic transitions should only happen during allocation, not when reading epoch info
        // This prevents the epoch from changing just by viewing the dashboard
        
        // Debug log to see what we're getting from the database
        debug('EpochInfo', 'Current epoch from database (read-only, no transitions)', {
            raw: tokenomics[0]?.current_epoch,
            normalized: currentEpoch,
            tokenomicsRecord: tokenomics[0]
        })
        
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
                }, { headers })
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
                }, { headers })
            }
        }
        
        // Format epoch data
        const epochs: Record<string, any> = {}
        epochBalances.forEach(epoch => {
            // Convert numeric strings to numbers, handling null/undefined
            // Drizzle returns numeric as strings, so we need to parse them
            let balance = 0
            let threshold = 0
            let distributionAmount = 0
            let distributionPercent = 0
            
            try {
                // Convert to string first, then parse as float
                balance = epoch.balance ? parseFloat(String(epoch.balance)) : 0
                threshold = epoch.threshold ? parseFloat(String(epoch.threshold)) : 0
                distributionAmount = epoch.distribution_amount ? parseFloat(String(epoch.distribution_amount)) : 0
                distributionPercent = epoch.distribution_percent ? parseFloat(String(epoch.distribution_percent)) : 0
                
                // Verify conversion worked (check for NaN)
                if (isNaN(balance)) {
                    debug('EpochInfo', 'Failed to parse balance', { 
                        epoch: epoch.epoch, 
                        rawBalance: epoch.balance,
                        balanceType: typeof epoch.balance 
                    })
                    balance = 0
                }
            } catch (error) {
                debug('EpochInfo', 'Error parsing epoch balance', { 
                    epoch: epoch.epoch, 
                    error,
                    rawBalance: epoch.balance 
                })
            }
            
            epochs[epoch.epoch] = {
                balance: balance,
                threshold: threshold,
                distribution_amount: distributionAmount,
                distribution_percent: distributionPercent,
                available_tiers: [] // Can be populated later
            }
        })
        
        // Debug: Log the balances being returned
        debug('EpochInfo', 'Formatted epoch balances', {
            epochCount: epochBalances.length,
            epochs: Object.keys(epochs),
            balances: Object.fromEntries(
                Object.entries(epochs).map(([key, value]) => [key, value.balance])
            ),
            rawBalances: epochBalances.map(e => ({ epoch: e.epoch, balance: e.balance, balanceType: typeof e.balance }))
        })
        
        const epochInfo = {
            current_epoch: currentEpoch,
            epochs
        }
        
        debug('EpochInfo', 'Epoch information fetched successfully', epochInfo)
        
        return NextResponse.json(epochInfo, { headers })
    } catch (error) {
        debugError('EpochInfo', 'Error fetching epoch information', error)
        // Return default epoch info instead of 500 error to prevent UI crashes
        const headers = new Headers()
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        headers.set('Pragma', 'no-cache')
        headers.set('Expires', '0')
        
        return NextResponse.json({
            current_epoch: 'founder',
            epochs: {
                founder: { balance: 45000000000000, threshold: 0, distribution_amount: 0, distribution_percent: 50.0, available_tiers: [] },
                pioneer: { balance: 22500000000000, threshold: 0, distribution_amount: 0, distribution_percent: 25.0, available_tiers: [] },
                community: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] },
                ecosystem: { balance: 11250000000000, threshold: 0, distribution_amount: 0, distribution_percent: 12.5, available_tiers: [] }
            }
        }, { headers })
    }
}
