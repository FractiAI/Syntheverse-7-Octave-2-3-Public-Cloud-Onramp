/**
 * Admin endpoint to approve/reject token allocations for qualifying PoCs
 * 
 * Can be called via:
 * 1. POST with JSON body (for authenticated admin UI)
 * 2. GET with query params (for email links with token)
 * 
 * This endpoint:
 * 1. Verifies the PoC is qualified (pod_score >= 8000 for Founder)
 * 2. Creates allocations based on tokenomics_recommendation from evaluation
 * 3. Updates epoch balances
 * 4. Records allocations in allocationsTable
 * 5. Updates allocation_status to 'approved' or 'rejected'
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq, sql } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import { createClient } from '@/utils/supabase/server'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'
import { calculateMetalAmplification } from '@/utils/tokenomics/metal-amplification'
import crypto from 'crypto'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'espressolico@gmail.com'

export async function GET(request: NextRequest) {
    // Handle email link clicks (approve/reject buttons)
    const { searchParams } = new URL(request.url)
    const submission_hash = searchParams.get('hash')
    const action = searchParams.get('action') // 'approve' or 'reject'
    const token = searchParams.get('token') // Security token from email
    
    if (!submission_hash || !action) {
        return NextResponse.redirect(new URL('/dashboard?error=missing_params', request.url))
    }
    
    // Process the action
    if (action === 'approve') {
        return handleApproval(submission_hash, 'admin@email')
    } else if (action === 'reject') {
        return handleRejection(submission_hash, 'admin@email')
    }
    
    return NextResponse.redirect(new URL('/dashboard?error=invalid_action', request.url))
}

export async function POST(request: NextRequest) {
    debug('ApproveAllocation', 'Admin allocation approval request')
    
    try {
        // Check authentication (admin check - for now, any authenticated user can approve)
        // TODO: Add proper admin role checking
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Admin authentication required.' },
                { status: 401 }
            )
        }
        
        const { submission_hash, action } = await request.json()
        
        if (!submission_hash || !action) {
            return NextResponse.json(
                { error: 'submission_hash and action are required' },
                { status: 400 }
            )
        }
        
        if (action === 'approve') {
            return handleApproval(submission_hash, user.email || 'unknown')
        } else if (action === 'reject') {
            return handleRejection(submission_hash, user.email || 'unknown')
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            )
        }
    } catch (error) {
        debugError('ApproveAllocation', 'Failed to process allocation request', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process allocation request',
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}

async function handleApproval(submission_hash: string, approvedBy: string): Promise<NextResponse> {
    debug('ApproveAllocation', 'Processing allocation approval', { submission_hash, approvedBy })
    
    try {
        // Get contribution with evaluation results
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submission_hash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        const metadata = contrib.metadata as any || {}
        
        // Check if already approved
        if (metadata.allocation_status === 'approved') {
            return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&status=already_approved`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
        }
        
        // Verify PoC is qualified for current open epoch
        const podScore = metadata.pod_score || 0
        const density = metadata.density || 0
        const qualified = metadata.qualified_founder || await isQualifiedForOpenEpoch(podScore, density)
        
        if (!qualified) {
            return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=not_qualified`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
        }
        
        // Get tokenomics recommendation from evaluation
        const tokenomicsRec = metadata.tokenomics_recommendation || {}
        const eligibleEpochs = tokenomicsRec.eligible_epochs || ['founder']
        const suggestedAllocation = tokenomicsRec.suggested_allocation || 0
        const tierMultiplier = tokenomicsRec.tier_multiplier || 1
        const epochDistribution = tokenomicsRec.epoch_distribution || {}
        const metals = contrib.metals as string[] || []
        
        if (metals.length === 0) {
            return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=no_metals`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
        }
        
        // Get current tokenomics state
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .where(eq(tokenomicsTable.id, 'main'))
            .limit(1)
        
        if (!tokenomics || tokenomics.length === 0) {
            return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=tokenomics_not_found`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
        }
        
        const tokenomicsState = tokenomics[0]
        const currentEpoch = tokenomicsState.current_epoch || 'founder'
        
        // Get epoch balances
        const epochBalances = await db
            .select()
            .from(epochBalancesTable)
        
        const epochBalancesMap = new Map<string, { balance: number, threshold: number, distribution_amount: number }>()
        epochBalances.forEach(eb => {
            epochBalancesMap.set(eb.epoch, {
                balance: Number(eb.balance),
                threshold: Number(eb.threshold),
                distribution_amount: Number(eb.distribution_amount)
            })
        })
        
        // Calculate metallic amplification based on COMBINATIONS (Blueprint §3.4)
        const amplification = calculateMetalAmplification(metals)
        
        // Calculate base reward
        let baseReward = suggestedAllocation
        if (baseReward === 0) {
            // Calculate from pod_score if no suggested allocation
            // Base allocation formula: pod_score / 1000 * tier_multiplier
            baseReward = Math.floor((metadata.pod_score || 0) / 1000) * tierMultiplier
        }
        
        // Apply combination-based amplification (not individual metal multipliers)
        const amplifiedReward = Math.floor(baseReward * amplification.multiplier)
        
        // Create allocations for each metal (all share the same amplified reward)
        const createdAllocations: Array<{
            id: string
            submission_hash: string
            contributor: string
            metal: string
            epoch: string
            reward: number
            tier_multiplier: number
        }> = []
        
        const updatedEpochBalances: Array<{ epoch: string, balance_before: number, balance_after: number }> = []
        
        // Determine epoch (use first eligible epoch or current epoch)
        const epoch = eligibleEpochs[0] || currentEpoch
        
        // Calculate reward per metal: divide amplified reward equally among all metals
        // Each metal gets its own allocation record, but they share the amplified reward
        const rewardPerMetal = Math.floor(amplifiedReward / metals.length)
        
        for (const metal of metals) {
            const reward = rewardPerMetal
            
            // Check epoch balance
            const epochBalance = epochBalancesMap.get(epoch)
            if (!epochBalance) {
                debugError('ApproveAllocation', `Epoch balance not found for ${epoch}`, null)
                continue
            }
            
            const balanceBefore = epochBalance.balance
            const balanceAfter = balanceBefore - reward
            
            // Check if epoch has sufficient balance
            if (balanceAfter < 0) {
                debug('ApproveAllocation', `Insufficient balance in ${epoch} epoch`, {
                    balance: balanceBefore,
                    reward,
                    epoch
                })
                continue // Skip this allocation if insufficient balance
            }
            
            // Create allocation record
            const allocationId = crypto.randomUUID()
            await db.insert(allocationsTable).values({
                id: allocationId,
                submission_hash,
                contributor: contrib.contributor,
                metal: metal.toLowerCase(),
                epoch,
                tier: metal.toLowerCase(),
                reward: reward.toString(),
                tier_multiplier: amplification.multiplier.toString(), // Store combination amplification multiplier
                epoch_balance_before: balanceBefore.toString(),
                epoch_balance_after: balanceAfter.toString(),
                created_at: new Date()
            })
            
            // Update epoch balance
            await db
                .update(epochBalancesTable)
                .set({
                    balance: balanceAfter.toString(),
                    updated_at: new Date()
                })
                .where(eq(epochBalancesTable.epoch, epoch))
            
            // Update tokenomics total_distributed
            const newTotalDistributed = Number(tokenomicsState.total_distributed) + reward
            await db
                .update(tokenomicsTable)
                .set({
                    total_distributed: newTotalDistributed.toString(),
                    updated_at: new Date()
                })
                .where(eq(tokenomicsTable.id, 'main'))
            
            createdAllocations.push({
                id: allocationId,
                submission_hash,
                contributor: contrib.contributor,
                metal: metal.toLowerCase(),
                epoch,
                reward,
                tier_multiplier: amplification.multiplier // Store combination amplification multiplier
            })
            
            updatedEpochBalances.push({
                epoch,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            })
            
            // Update epoch balance in map for next iteration
            epochBalancesMap.set(epoch, {
                ...epochBalance,
                balance: balanceAfter
            })
        }
        
        if (createdAllocations.length === 0) {
            return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=no_allocations_created`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
        }
        
        // Check if current epoch is fully allocated and transition if needed
        // This happens after allocations are created and balances updated
        try {
            const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
            const updatedEpochInfo = await getOpenEpochInfo()
            
            if (updatedEpochInfo.current_epoch !== currentEpoch) {
                debug('ApproveAllocation', 'Epoch transitioned after allocation', {
                    old_epoch: currentEpoch,
                    new_epoch: updatedEpochInfo.current_epoch,
                    founder_balance: epochBalancesMap.get('founder') || 0
                })
            }
        } catch (transitionError) {
            // Non-fatal - log but don't fail the allocation
            debug('ApproveAllocation', 'Error checking epoch transition', transitionError)
        }
        
        // Update contribution allocation_status
        await db
            .update(contributionsTable)
            .set({
                metadata: {
                    ...metadata,
                    allocation_status: 'approved',
                    allocations_created: createdAllocations.map(a => ({
                        id: a.id,
                        metal: a.metal,
                        epoch: a.epoch,
                        reward: a.reward
                    })),
                    allocation_approved_at: new Date().toISOString(),
                    allocation_approved_by: approvedBy
                },
                updated_at: new Date()
            })
            .where(eq(contributionsTable.submission_hash, submission_hash))
        
        debug('ApproveAllocation', 'Allocation approved successfully', {
            submission_hash,
            allocations_created: createdAllocations.length,
            total_reward: createdAllocations.reduce((sum, a) => sum + a.reward, 0)
        })
        
        // Redirect to dashboard with success message
        return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&status=approved&allocations=${createdAllocations.length}`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    } catch (error) {
        debugError('ApproveAllocation', 'Failed to approve allocation', error)
        return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=approval_failed`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    }
}

async function handleRejection(submission_hash: string, rejectedBy: string): Promise<NextResponse> {
    debug('ApproveAllocation', 'Processing allocation rejection', { submission_hash, rejectedBy })
    
    try {
        // Get contribution
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submission_hash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        const metadata = contrib.metadata as any || {}
        
        // Update contribution allocation_status
        await db
            .update(contributionsTable)
            .set({
                metadata: {
                    ...metadata,
                    allocation_status: 'rejected',
                    allocation_rejected_at: new Date().toISOString(),
                    allocation_rejected_by: rejectedBy
                },
                updated_at: new Date()
            })
            .where(eq(contributionsTable.submission_hash, submission_hash))
        
        debug('ApproveAllocation', 'Allocation rejected', { submission_hash })
        
        // Redirect to dashboard
        return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&status=rejected`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    } catch (error) {
        debugError('ApproveAllocation', 'Failed to reject allocation', error)
        return NextResponse.redirect(new URL(`/dashboard?submission=${submission_hash}&error=rejection_failed`, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    }
}

async function getExistingAllocations(submissionHash: string) {
    const allocations = await db
        .select()
        .from(allocationsTable)
        .where(eq(allocationsTable.submission_hash, submissionHash))
    
    return allocations.map(a => ({
        id: a.id,
        metal: a.metal,
        epoch: a.epoch,
        reward: Number(a.reward),
        tier_multiplier: Number(a.tier_multiplier),
        created_at: a.created_at?.toISOString()
    }))
}
