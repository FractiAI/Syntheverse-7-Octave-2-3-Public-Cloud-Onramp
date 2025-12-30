/**
 * Calculate projected SYNTH token allocation for a PoC submission
 * 
 * This calculates what the allocation would be if tokens were allocated now,
 * based on current epoch availability, scores, and metallic amplification.
 */

import { db } from '@/utils/db/db'
import { contributionsTable, epochMetalBalancesTable, allocationsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'
import { computeMetalAssay, type Metal } from './metal-assay'

export interface ProjectedAllocationResult {
    submission_hash: string
    projected_allocation: number
    eligible: boolean
    epoch: string
    breakdown: {
        base_score: number
        pod_score: number
        epoch_availability: number
        metal_assay?: Record<string, number>
        metal_allocations?: Record<string, number>
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
                    epoch_availability: 0,
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
                    epoch_availability: 0,
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
                    epoch_availability: 0,
                    final_amount: totalAllocated
                },
                error: 'Already allocated'
            }
        }
        
        // Determine epoch from density
        const epoch = metadata.qualified_epoch || metadata.tokenomics_recommendation?.eligible_epochs?.[0] || 'founder'

        const assay = computeMetalAssay(metals)
        const scorePercentage = podScore / 10000.0

        // Fetch per-metal balances for the epoch and allocate per metal by assay proportion.
        const epochMetalRows = await db
          .select()
          .from(epochMetalBalancesTable)
          .where(eq(epochMetalBalancesTable.epoch, epoch))

        const balanceByMetal: Record<string, number> = {}
        for (const row of epochMetalRows) {
          balanceByMetal[String(row.metal).toLowerCase().trim()] = Number(row.balance)
        }

        const metalAllocations: Record<string, number> = {}
        let epochAvailability = 0
        let total = 0

        ;(['gold', 'silver', 'copper'] as Metal[]).forEach((m) => {
          const bal = balanceByMetal[m] || 0
          epochAvailability += bal
          const w = assay[m] || 0
          if (bal <= 0 || w <= 0) return
          const amt = Math.min(Math.floor(scorePercentage * bal * w), bal)
          if (amt > 0) {
            metalAllocations[m] = amt
            total += amt
          }
        })

        let finalAmount = Math.max(0, total)
        
        return {
            submission_hash: submissionHash,
            projected_allocation: finalAmount,
            eligible: true,
            epoch,
            breakdown: {
                base_score: scorePercentage * 100, // Percentage (0-100)
                pod_score: podScore,
                epoch_availability: epochAvailability,
                metal_assay: assay,
                metal_allocations: metalAllocations,
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
                epoch_availability: 0,
                final_amount: 0
            },
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

