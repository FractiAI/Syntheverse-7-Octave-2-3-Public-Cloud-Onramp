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
import { contributionsTable, allocationsTable, tokenomicsTable, epochMetalBalancesTable } from '@/utils/db/schema'
import { eq, sql } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import { createClient } from '@/utils/supabase/server'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'
import { computeMetalAssay } from '@/utils/tokenomics/metal-assay'
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
        
        // New tokenomics model:
        // Allocate from each metal pool in proportion to the PoC metal assay, using the same score scaling
        // against that metal's available balance.
        const epoch = metadata.qualified_epoch || eligibleEpochs[0] || currentEpoch
        const assay = computeMetalAssay(metals)
        const scorePercentage = (podScore || 0) / 10000.0

        const pools = await db
            .select()
            .from(epochMetalBalancesTable)
            .where(eq(epochMetalBalancesTable.epoch, epoch))

        const poolsByMetal = new Map<string, any>()
        pools.forEach(p => poolsByMetal.set(String(p.metal).toLowerCase().trim(), p))

        const createdAllocations: Array<{
            id: string
            submission_hash: string
            contributor: string
            metal: string
            epoch: string
            reward: number
            tier_multiplier: number
        }> = []

        const updatedEpochBalances: Array<{ epoch: string, metal: string, balance_before: number, balance_after: number }> = []

        for (const metal of ['gold', 'silver', 'copper']) {
            const w = (assay as any)[metal] || 0
            if (w <= 0) continue

            const pool = poolsByMetal.get(metal)
            if (!pool) continue

            const balanceBefore = Number(pool.balance)
            const reward = Math.min(Math.floor(scorePercentage * balanceBefore * w), balanceBefore)
            if (reward <= 0) continue

            const balanceAfter = balanceBefore - reward
            const allocationId = crypto.randomUUID()

            await db.insert(allocationsTable).values({
                id: allocationId,
                submission_hash,
                contributor: contrib.contributor,
                metal: metal,
                epoch,
                tier: metal,
                reward: reward.toString(),
                tier_multiplier: '1.0',
                epoch_balance_before: balanceBefore.toString(),
                epoch_balance_after: balanceAfter.toString(),
                created_at: new Date()
            })

            await db.update(epochMetalBalancesTable).set({
                balance: balanceAfter.toString(),
                updated_at: new Date()
            }).where(eq(epochMetalBalancesTable.id, pool.id))

            const metalKey =
                metal === 'gold' ? 'total_distributed_gold' :
                metal === 'silver' ? 'total_distributed_silver' :
                'total_distributed_copper'
            const currentMetalDistributed = Number((tokenomicsState as any)[metalKey] || 0)
            const newMetalDistributed = currentMetalDistributed + reward
            const newTotalDistributed = Number(tokenomicsState.total_distributed) + reward

            await db.update(tokenomicsTable).set({
                total_distributed: newTotalDistributed.toString(),
                [metalKey]: newMetalDistributed.toString(),
                updated_at: new Date()
            } as any).where(eq(tokenomicsTable.id, 'main'))

            createdAllocations.push({
                id: allocationId,
                submission_hash,
                contributor: contrib.contributor,
                metal: metal,
                epoch,
                reward,
                tier_multiplier: 1.0
            })

            updatedEpochBalances.push({
                epoch,
                metal,
                balance_before: balanceBefore,
                balance_after: balanceAfter
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
                    founder_balance: 'n/a (per-metal pools)'
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
