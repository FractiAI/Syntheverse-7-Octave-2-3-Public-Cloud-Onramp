/**
 * Epoch-based qualification logic
 * 
 * Determines PoC qualification based on current open epoch and density thresholds
 */

import { db } from '@/utils/db/db'
import { tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug } from '@/utils/debug'

// Epoch qualification thresholds based on density score
export const EPOCH_THRESHOLDS = {
    founder: 8000,    // Density >= 8000
    pioneer: 4000,    // Density >= 4000
    community: 3000,  // Density >= 3000
    ecosystem: 2000,  // Density >= 2000
} as const

// Epoch unlock thresholds (coherence density required to unlock)
export const EPOCH_UNLOCK_THRESHOLDS = {
    founder: 0,           // Founder epoch starts immediately
    pioneer: 1_000_000,   // 1M coherence density units
    community: 2_000_000, // 2M coherence density units
    ecosystem: 3_000_000, // 3M coherence density units
} as const

export type EpochType = 'founder' | 'pioneer' | 'community' | 'ecosystem'

export interface OpenEpochInfo {
    current_epoch: EpochType
    open_epochs: EpochType[]
    qualification_threshold: number
    total_coherence_density: number
}

/**
 * Check if an epoch is fully allocated and transition to next epoch if needed
 * Returns the current epoch (may have been updated)
 */
async function checkAndTransitionEpoch(): Promise<EpochType> {
    try {
        // Get tokenomics state
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        if (!tokenomics || tokenomics.length === 0) {
            return 'founder'
        }
        
        const currentEpoch = (tokenomics[0]?.current_epoch || 'founder') as EpochType
        
        // Get epoch balances
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
        
        const epochBalancesMap = new Map<string, number>()
        epochBalances.forEach(eb => {
            epochBalancesMap.set(eb.epoch, Number(eb.balance || 0))
        })
        
        // Check if current epoch is fully allocated (balance <= 0 or very low)
        const currentEpochBalance = epochBalancesMap.get(currentEpoch) || 0
        const FULLY_ALLOCATED_THRESHOLD = 1000 // Consider fully allocated if balance < 1000 tokens
        
        if (currentEpoch === 'founder' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
            // Founder epoch is fully allocated, transition to pioneer
            debug('CheckAndTransitionEpoch', 'Founder epoch fully allocated, transitioning to pioneer', {
                founder_balance: currentEpochBalance
            })
            
            await db
                .update(tokenomicsTable)
                .set({
                    current_epoch: 'pioneer',
                    updated_at: new Date()
                })
                .where(eq(tokenomicsTable.id, 'main'))
            
            return 'pioneer'
        } else if (currentEpoch === 'pioneer' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
            // Pioneer epoch is fully allocated, transition to community
            debug('CheckAndTransitionEpoch', 'Pioneer epoch fully allocated, transitioning to community', {
                pioneer_balance: currentEpochBalance
            })
            
            await db
                .update(tokenomicsTable)
                .set({
                    current_epoch: 'community',
                    updated_at: new Date()
                })
                .where(eq(tokenomicsTable.id, 'main'))
            
            return 'community'
        } else if (currentEpoch === 'community' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
            // Community epoch is fully allocated, transition to ecosystem
            debug('CheckAndTransitionEpoch', 'Community epoch fully allocated, transitioning to ecosystem', {
                community_balance: currentEpochBalance
            })
            
            await db
                .update(tokenomicsTable)
                .set({
                    current_epoch: 'ecosystem',
                    updated_at: new Date()
                })
                .where(eq(tokenomicsTable.id, 'main'))
            
            return 'ecosystem'
        }
        
        return currentEpoch
    } catch (error) {
        debug('CheckAndTransitionEpoch', 'Error checking epoch transition', error)
        return 'founder'
    }
}

/**
 * Get current open epochs and qualification threshold
 */
export async function getOpenEpochInfo(): Promise<OpenEpochInfo> {
    try {
        // Check and transition epoch if needed (e.g., founder fully allocated)
        const currentEpoch = await checkAndTransitionEpoch()
        
        // Calculate total coherence density (sum of all coherence + density from contributions)
        // For now, we'll use a placeholder - in production this should be calculated from contributions
        const totalCoherenceDensity = 0 // TODO: Calculate from contributions metadata
        
        // Determine which epochs are open based on current epoch
        // All epochs up to and including current epoch are open
        const openEpochs: EpochType[] = ['founder']
        
        if (currentEpoch === 'pioneer' || currentEpoch === 'community' || currentEpoch === 'ecosystem') {
            openEpochs.push('pioneer')
        }
        if (currentEpoch === 'community' || currentEpoch === 'ecosystem') {
            openEpochs.push('community')
        }
        if (currentEpoch === 'ecosystem') {
            openEpochs.push('ecosystem')
        }
        
        // Get qualification threshold based on current epoch
        const qualificationThreshold = EPOCH_THRESHOLDS[currentEpoch]
        
        debug('GetOpenEpochInfo', 'Open epoch info retrieved', {
            current_epoch: currentEpoch,
            open_epochs: openEpochs,
            qualification_threshold: qualificationThreshold,
            total_coherence_density: totalCoherenceDensity
        })
        
        return {
            current_epoch: currentEpoch,
            open_epochs: openEpochs,
            qualification_threshold: qualificationThreshold,
            total_coherence_density: totalCoherenceDensity
        }
    } catch (error) {
        debug('GetOpenEpochInfo', 'Error getting epoch info, using defaults', error)
        // Return default (founder epoch)
        return {
            current_epoch: 'founder',
            open_epochs: ['founder'],
            qualification_threshold: EPOCH_THRESHOLDS.founder,
            total_coherence_density: 0
        }
    }
}

/**
 * Determine which epoch a PoC qualifies for based on density score
 */
export function qualifyEpoch(density: number): EpochType {
    if (density >= EPOCH_THRESHOLDS.founder) {
        return 'founder'
    } else if (density >= EPOCH_THRESHOLDS.pioneer) {
        return 'pioneer'
    } else if (density >= EPOCH_THRESHOLDS.community) {
        return 'community'
    } else if (density >= EPOCH_THRESHOLDS.ecosystem) {
        return 'ecosystem'
    } else {
        // Below ecosystem threshold - return ecosystem as fallback
        return 'ecosystem'
    }
}

/**
 * Check if a PoC qualifies for the current open epoch
 * 
 * Qualification is based on the current epoch's threshold:
 * - Founder: pod_score >= 8000
 * - Pioneer: pod_score >= 4000
 * - Community: pod_score >= 3000
 * - Ecosystem: pod_score >= 2000
 * 
 * @param pod_score - Total PoC score (0-10000)
 * @param density - Density score (0-2500, but used for epoch qualification)
 * @returns true if PoC qualifies for current open epoch
 */
export async function isQualifiedForOpenEpoch(pod_score: number, density: number): Promise<boolean> {
    const epochInfo = await getOpenEpochInfo()
    
    // Get threshold for current epoch
    const epochThreshold = EPOCH_THRESHOLDS[epochInfo.current_epoch]
    
    // Check if pod_score meets the current epoch's qualification threshold
    const meetsPodScoreThreshold = pod_score >= epochInfo.qualification_threshold
    
    // Check if density meets the current epoch's threshold
    const meetsDensityThreshold = density >= epochThreshold
    
    // PoC qualifies if both density and pod_score meet current epoch requirements
    const qualified = meetsDensityThreshold && meetsPodScoreThreshold
    
    debug('IsQualifiedForOpenEpoch', `Qualification check for ${epochInfo.current_epoch} epoch`, {
        pod_score,
        density,
        current_epoch: epochInfo.current_epoch,
        open_epochs: epochInfo.open_epochs,
        qualification_threshold: epochInfo.qualification_threshold,
        density_threshold: epochThreshold,
        meets_density_threshold: meetsDensityThreshold,
        meets_pod_score_threshold: meetsPodScoreThreshold,
        qualified
    })
    
    return qualified
}

