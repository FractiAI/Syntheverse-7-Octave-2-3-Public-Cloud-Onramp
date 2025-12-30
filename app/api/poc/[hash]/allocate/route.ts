/**
 * API endpoint to allocate SYNTH tokens for a PoC
 * 
 * POST /api/poc/[hash]/allocate
 * 
 * Allocates tokens if PoC is qualified and not yet allocated
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, epochMetalBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation'
import { isQualifiedForOpenEpoch } from '@/utils/epochs/qualification'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('AllocateTokens', 'Allocating tokens for PoC', { submissionHash })
    
    try {
        // Verify user is authenticated
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            return NextResponse.json(
                { error: 'Forbidden: You can only allocate tokens for your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already allocated
        const existingAllocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        if (existingAllocations.length > 0) {
            return NextResponse.json(
                { error: 'Tokens already allocated for this PoC' },
                { status: 400 }
            )
        }
        
        // Calculate projected allocation
        const projectedAlloc = await calculateProjectedAllocation(submissionHash)
        
        if (!projectedAlloc.eligible || projectedAlloc.projected_allocation === 0) {
            return NextResponse.json(
                { error: 'PoC is not eligible for token allocation' },
                { status: 400 }
            )
        }
        
        // Get metadata
        const metadata = contrib.metadata as any || {}
        const metals = (contrib.metals as string[]) || []
        
        const metalAllocations = projectedAlloc.breakdown.metal_allocations || {}
        const metalKeys = Object.keys(metalAllocations).filter((m) => Number(metalAllocations[m]) > 0)

        if (metalKeys.length === 0 || projectedAlloc.projected_allocation === 0) {
            return NextResponse.json(
                { error: 'No metal allocations available for this PoC' },
                { status: 400 }
            )
        }

        // For each metal, decrement that metal's epoch pool and write an allocation record.
        for (const metal of metalKeys) {
            const amount = Math.floor(Number(metalAllocations[metal]))
            if (amount <= 0) continue

            const rows = await db
                .select()
                .from(epochMetalBalancesTable)
                .where(eq(epochMetalBalancesTable.epoch, projectedAlloc.epoch))

            const row = rows.find(r => String(r.metal).toLowerCase().trim() === metal)
            if (!row) {
                return NextResponse.json({ error: `Epoch ${projectedAlloc.epoch} metal pool not found: ${metal}` }, { status: 404 })
            }

            const balanceBefore = Number(row.balance)
            const balanceAfter = balanceBefore - amount
            if (balanceAfter < 0) {
                return NextResponse.json({ error: `Insufficient ${metal} balance for allocation` }, { status: 400 })
            }

            const allocationId = crypto.randomUUID()
            await db.insert(allocationsTable).values({
                id: allocationId,
                submission_hash: submissionHash,
                contributor: contrib.contributor,
                metal: metal,
                epoch: projectedAlloc.epoch,
                tier: metal,
                reward: amount.toString(),
                tier_multiplier: '1.0',
                epoch_balance_before: balanceBefore.toString(),
                epoch_balance_after: balanceAfter.toString(),
            })

            await db
                .update(epochMetalBalancesTable)
                .set({
                    balance: balanceAfter.toString(),
                    updated_at: new Date()
                })
                .where(eq(epochMetalBalancesTable.id, row.id))

            // Update tokenomics totals (best-effort; keep legacy total_distributed in sync too)
            const tokenomicsState = await db.select().from(tokenomicsTable).where(eq(tokenomicsTable.id, 'main')).limit(1)
            if (tokenomicsState.length > 0) {
                const state = tokenomicsState[0] as any
                const metalKey = metal === 'gold' ? 'total_distributed_gold' : metal === 'silver' ? 'total_distributed_silver' : 'total_distributed_copper'
                const currentMetalDistributed = Number(state[metalKey] || 0)
                const newMetalDistributed = currentMetalDistributed + amount
                const newTotalDistributed = Number(state.total_distributed || 0) + amount
                await db.update(tokenomicsTable).set({
                    total_distributed: newTotalDistributed.toString(),
                    [metalKey]: newMetalDistributed.toString(),
                    updated_at: new Date()
                } as any).where(eq(tokenomicsTable.id, 'main'))
            }
        }
        
        debug('AllocateTokens', 'Tokens allocated successfully', {
            submissionHash,
            amount: projectedAlloc.projected_allocation,
            epoch: projectedAlloc.epoch
        })
        
        return NextResponse.json({
            success: true,
            amount: projectedAlloc.projected_allocation,
            epoch: projectedAlloc.epoch,
            breakdown: projectedAlloc.breakdown
        })
    } catch (error) {
        debugError('AllocateTokens', 'Error allocating tokens', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

