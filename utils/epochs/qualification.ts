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
    pioneer: 6000,    // Density >= 6000
    community: 4000,  // Density >= 4000
    ecosystem: 0,     // Density < 4000 (all others)
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
 * Get current open epochs and qualification threshold
 */
export async function getOpenEpochInfo(): Promise<OpenEpochInfo> {
    try {
        // Get tokenomics state
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        const currentEpoch = (tokenomics[0]?.current_epoch || 'founder') as EpochType
        
        // Calculate total coherence density (sum of all coherence + density from contributions)
        // For now, we'll use a placeholder - in production this should be calculated from contributions
        const totalCoherenceDensity = 0 // TODO: Calculate from contributions metadata
        
        // Determine which epochs are open based on coherence density thresholds
        // Founder epoch is always open (threshold is 0)
        const openEpochs: EpochType[] = ['founder']
        
        // Additional epochs unlock as coherence density increases
        if (totalCoherenceDensity >= EPOCH_UNLOCK_THRESHOLDS.pioneer) {
            openEpochs.push('pioneer')
        }
        if (totalCoherenceDensity >= EPOCH_UNLOCK_THRESHOLDS.community) {
            openEpochs.push('community')
        }
        if (totalCoherenceDensity >= EPOCH_UNLOCK_THRESHOLDS.ecosystem) {
            openEpochs.push('ecosystem')
        }
        
        // Founder is the current open epoch (highest priority)
        // PoCs must meet the founder threshold (density >= 8000) to qualify
        const qualificationThreshold = EPOCH_THRESHOLDS.founder
        
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
    } else {
        return 'ecosystem'
    }
}

/**
 * Check if a PoC qualifies for the current open epoch
 * 
 * For Founder epoch (current open epoch):
 * - Density must be >= 8000 (epoch threshold)
 * - Pod_score must be >= 8000 (qualification threshold)
 * 
 * @param pod_score - Total PoD score (0-10000)
 * @param density - Density score (0-2500, but used for epoch qualification)
 * @returns true if PoC qualifies for current open epoch (founder)
 */
export async function isQualifiedForOpenEpoch(pod_score: number, density: number): Promise<boolean> {
    const epochInfo = await getOpenEpochInfo()
    
    // Founder is the current open epoch
    // Check if density meets the founder threshold (density >= 8000)
    const meetsDensityThreshold = density >= EPOCH_THRESHOLDS.founder
    
    // Check if pod_score meets the founder qualification threshold (pod_score >= 8000)
    const meetsPodScoreThreshold = pod_score >= epochInfo.qualification_threshold
    
    // PoC qualifies if both density and pod_score meet founder epoch requirements
    const qualified = meetsDensityThreshold && meetsPodScoreThreshold
    
    debug('IsQualifiedForOpenEpoch', 'Qualification check for Founder epoch', {
        pod_score,
        density,
        current_epoch: epochInfo.current_epoch,
        open_epochs: epochInfo.open_epochs,
        qualification_threshold: epochInfo.qualification_threshold,
        density_threshold: EPOCH_THRESHOLDS.founder,
        meets_density_threshold: meetsDensityThreshold,
        meets_pod_score_threshold: meetsPodScoreThreshold,
        qualified
    })
    
    return qualified
}

