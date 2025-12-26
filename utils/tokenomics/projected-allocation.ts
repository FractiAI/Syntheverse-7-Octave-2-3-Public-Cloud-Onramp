/**
 * Calculate projected SYNTH token allocation for a PoC submission
 * 
 * This calculates what the allocation would be if tokens were allocated now,
 * based on current epoch availability, scores, and metallic amplification.
 */

import { db } from '@/utils/db/db'
import { contributionsTable, tokenomicsTable, epochBalancesTable, allocationsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { calculateMetalAmplification } from './metal-amplification'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'

export interface ProjectedAllocationResult {
    submission_hash: string
    projected_allocation: number
    eligible: boolean
    epoch: string
    breakdown: {
        base_score: number
        pod_score: number
        metal_multiplier: number
        metal_combination: string
        epoch_availability: number
        tier_multiplier: number
        final_amount: number
    }
    error?: string
}

/**
 * Calculate projected token allocation for a PoC
 */
export async function calculateProjectedAllocation(
    submissionHash: string
): Promise<ProjectedAllocationResult> {
    try {
        // Get contribution
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return {
                submission_hash: submissionHash,
                projected_allocation: 0,
                eligible: false,
                epoch: 'unknown',
                breakdown: {
                    base_score: 0,
                    pod_score: 0,
                    metal_multiplier: 1.0,
                    metal_combination: 'none',
                    epoch_availability: 0,
                    tier_multiplier: 1.0,
                    final_amount: 0
                },
                error: 'Contribution not found'
            }
        }
        
        const contrib = contributions[0]
        const metadata = contrib.metadata as any || {}
        const podScore = metadata.pod_score || 0
        const density = metadata.density || 0
        const metals = (contrib.metals as string[]) || []
        
        // Check if qualified
        const qualified = metadata.qualified_founder || await isQualifiedForOpenEpoch(podScore, density)
        
        if (!qualified || podScore === 0) {
            return {
                submission_hash: submissionHash,
                projected_allocation: 0,
                eligible: false,
                epoch: 'unknown',
                breakdown: {
                    base_score: 0,
                    pod_score: podScore,
                    metal_multiplier: 1.0,
                    metal_combination: 'none',
                    epoch_availability: 0,
                    tier_multiplier: 1.0,
                    final_amount: 0
                },
                error: 'PoC not qualified'
            }
        }
        
        // Check if already allocated
        const existingAllocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        if (existingAllocations.length > 0) {
            const totalAllocated = existingAllocations.reduce((sum, a) => sum + Number(a.reward), 0)
            return {
                submission_hash: submissionHash,
                projected_allocation: totalAllocated,
                eligible: true,
                epoch: existingAllocations[0].epoch,
                breakdown: {
                    base_score: (podScore / 10000) * 100, // Percentage
                    pod_score: podScore,
                    metal_multiplier: 1.0,
                    metal_combination: 'already_allocated',
                    epoch_availability: 0,
                    tier_multiplier: 1.0,
                    final_amount: totalAllocated
                },
                error: 'Already allocated'
            }
        }
        
        // Determine epoch from density
        const epoch = metadata.tokenomics_recommendation?.eligible_epochs?.[0] || 'founder'
        
        // Get epoch balance
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
            .where(eq(epochBalancesTable.epoch, epoch))
            .limit(1)
        
        const epochBalance = epochBalances[0] 
            ? Number(epochBalances[0].balance) 
            : 0
        
        // Calculate metallic amplification
        const amplification = calculateMetalAmplification(metals)
        const metalMultiplier = amplification.multiplier
        
        // Tokenomics formula: (score/10000) * Available tokens
        // Convert pod_score (0-10000) to percentage (0-1)
        const scorePercentage = podScore / 10000.0
        
        // Base allocation as percentage of available epoch balance
        const baseAllocation = scorePercentage * epochBalance
        
        // Apply metal amplification
        const amplifiedAllocation = baseAllocation * metalMultiplier
        
        // Get tier multiplier (default to 1.0, can be enhanced)
        const tierMultiplier = metadata.tokenomics_recommendation?.tier_multiplier || 1.0
        
        // Calculate final allocation with tier multiplier
        // Cap at epoch availability
        let finalAmount = Math.floor(amplifiedAllocation * tierMultiplier)
        finalAmount = Math.min(finalAmount, epochBalance)
        finalAmount = Math.max(0, finalAmount) // Ensure non-negative
        
        return {
            submission_hash: submissionHash,
            projected_allocation: finalAmount,
            eligible: true,
            epoch,
            breakdown: {
                base_score: scorePercentage * 100, // Percentage (0-100)
                pod_score: podScore,
                metal_multiplier: metalMultiplier,
                metal_combination: amplification.combination,
                epoch_availability: epochBalance,
                tier_multiplier: tierMultiplier,
                final_amount: finalAmount
            }
        }
    } catch (error) {
        return {
            submission_hash: submissionHash,
            projected_allocation: 0,
            eligible: false,
            epoch: 'unknown',
            breakdown: {
                base_score: 0,
                pod_score: 0,
                metal_multiplier: 1.0,
                metal_combination: 'error',
                epoch_availability: 0,
                tier_multiplier: 1.0,
                final_amount: 0
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

