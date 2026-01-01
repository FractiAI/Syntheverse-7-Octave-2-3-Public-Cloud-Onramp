/**
 * API endpoint to initiate PoC registration via Stripe checkout
 * 
 * POST /api/poc/[hash]/register
 * 
 * Creates a Stripe checkout session for an operator-configured, fee-based on-chain anchoring service.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, epochMetalBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import type { MetalType } from '@/utils/tokenomics/metal-assay'

// Force dynamic rendering - this route must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    // Extract hash from params outside try block for error handling
    if (!params) {
        debugError('RegisterPoC', 'Params object is missing', {})
        return NextResponse.json(
            { error: 'Invalid request: missing parameters' },
            { status: 400 }
        )
    }
    
    const submissionHash = params?.hash || 'unknown'
    
    try {
        if (!submissionHash || submissionHash === 'unknown') {
            debugError('RegisterPoC', 'Missing submission hash in params', { params })
            return NextResponse.json(
                { error: 'Missing submission hash' },
                { status: 400 }
            )
        }
        
        debug('RegisterPoC', 'Initiating PoC registration', { submissionHash })
        
        // Verify user is authenticated
        let supabase
        try {
            supabase = createClient()
        } catch (supabaseError) {
            debugError('RegisterPoC', 'Failed to create Supabase client', supabaseError)
            return NextResponse.json(
                { 
                    error: 'Authentication service error',
                    message: supabaseError instanceof Error ? supabaseError.message : 'Failed to initialize authentication'
                },
                { status: 500 }
            )
        }
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debugError('RegisterPoC', 'Authentication failed', { 
                authError: authError?.message,
                hasUser: !!user 
            })
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Get contribution
        let contributions
        try {
            contributions = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
        } catch (dbError) {
            debugError('RegisterPoC', 'Database query error', dbError)
            return NextResponse.json(
                { 
                    error: 'Database error',
                    message: dbError instanceof Error ? dbError.message : 'Unknown database error'
                },
                { status: 500 }
            )
        }
        
        if (!contributions || contributions.length === 0) {
            debugError('RegisterPoC', 'Contribution not found', { submissionHash })
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contributions[0]
        
        // Verify user is the contributor
        if (contrib.contributor !== user.email) {
            debugError('RegisterPoC', 'User is not the contributor', {
                contributor: contrib.contributor,
                userEmail: user.email
            })
            return NextResponse.json(
                { error: 'Forbidden: You can only register your own PoCs' },
                { status: 403 }
            )
        }
        
        // Check if already registered
        if (contrib.registered) {
            debug('RegisterPoC', 'PoC already registered', { submissionHash })
            return NextResponse.json(
                { error: 'PoC is already registered' },
                { status: 400 }
            )
        }

        // Enforce: only qualified PoCs can be anchored/registered
        if (contrib.status !== 'qualified') {
            debugError('RegisterPoC', 'PoC is not qualified for on-chain anchoring', {
                submissionHash,
                status: contrib.status,
            })
            return NextResponse.json(
                { error: 'PoC is not qualified for on-chain anchoring' },
                { status: 400 }
            )
        }

        // Registration is now free - directly register the PoC on blockchain
        debug('RegisterPoC', 'Initiating free PoC registration (no payment required)', {
            submissionHash
        })

        const metadata = contrib.metadata as any || {}
        const metals = (contrib.metals as string[]) || []
        
        // Register PoC on Hard Hat L1 blockchain
        let blockchainTxHash: string | null = null
        try {
            const { registerPoCOnBlockchain } = await import('@/utils/blockchain/register-poc')
            const blockchainResult = await registerPoCOnBlockchain(
                submissionHash,
                contrib.contributor,
                {
                    novelty: metadata.novelty,
                    density: metadata.density,
                    coherence: metadata.coherence,
                    alignment: metadata.alignment,
                    pod_score: metadata.pod_score
                },
                metals,
                contrib.text_content || null
            )
            
            if (blockchainResult.success && blockchainResult.transaction_hash) {
                blockchainTxHash = blockchainResult.transaction_hash
                debug('RegisterPoC', 'PoC registered on Hard Hat L1 blockchain', {
                    submissionHash,
                    txHash: blockchainTxHash,
                    blockNumber: blockchainResult.block_number
                })
            } else {
                debugError('RegisterPoC', 'Blockchain registration failed', {
                    submissionHash,
                    error: blockchainResult.error
                })
                return NextResponse.json(
                    { 
                        error: 'Blockchain registration failed',
                        message: blockchainResult.error || 'Failed to register PoC on blockchain'
                    },
                    { status: 500 }
                )
            }
        } catch (blockchainError) {
            debugError('RegisterPoC', 'Blockchain registration error', blockchainError)
            return NextResponse.json(
                { 
                    error: 'Blockchain registration error',
                    message: blockchainError instanceof Error ? blockchainError.message : 'Unknown error during blockchain registration'
                },
                { status: 500 }
            )
        }
        
        // Update contribution with registration info
        try {
            await db
                .update(contributionsTable)
                .set({
                    registered: true,
                    status: 'registered',
                    registration_date: new Date(),
                    registration_tx_hash: blockchainTxHash,
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            debug('RegisterPoC', 'PoC registration completed successfully', {
                submissionHash,
                txHash: blockchainTxHash
            })
        } catch (updateError) {
            debugError('RegisterPoC', 'Failed to update contribution after registration', updateError)
            // Still return success since blockchain registration succeeded
        }
        
        // Automatically allocate tokens for registered PoC (same logic as webhook)
        // Check if allocation already exists
        const existingAllocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        // Check if PoC is qualified - accept both 'qualified' and 'registered' status since registered PoCs were qualified
        const isQualified = metadata.qualified_founder === true || 
                           metadata.qualified === true || 
                           contrib.status === 'qualified' || 
                           contrib.status === 'registered'
        
        // Skip allocations for financial support contributions (they qualify but don't receive token allocations)
        const isFinancialSupport = metadata.type === 'financial_support' || 
                                  metadata.type === 'financial_alignment_poc' || 
                                  metadata.support_only === true
        
        // Re-fetch contribution to get updated status after registration
        const updatedContrib = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        const currentStatus = updatedContrib[0]?.status || contrib.status
        
        debug('RegisterPoC', 'Allocation check', {
            submissionHash,
            existingAllocationsCount: existingAllocations.length,
            qualified_founder: metadata.qualified_founder,
            qualified: metadata.qualified,
            original_status: contrib.status,
            current_status: currentStatus,
            isQualified,
            isFinancialSupport,
            pod_score: metadata.pod_score,
            metals: metals.length > 0 ? metals : 'none'
        })
        
        if (existingAllocations.length === 0 && isQualified && !isFinancialSupport) {
            try {
                const podScore = metadata.pod_score || 0
                const qualifiedEpoch = metadata.qualified_epoch || 'founder' // Use the epoch that was open when PoC qualified
                
                debug('RegisterPoC', 'Processing automatic token allocation for registered PoC', {
                    submissionHash,
                    podScore,
                    qualifiedEpoch,
                    metals
                })
                
                // Per-metal epoch allocation:
                // - Compute assay weights from contribution metals
                // - For each metal, allocate against the first epoch (>= qualifiedEpoch) that has balance
                //   (supports "epoch opens by metal" when an epoch metal pool is depleted).
                const { computeMetalAssay } = await import('@/utils/tokenomics/metal-assay')
                const { pickEpochForMetalWithBalance, advanceGlobalEpochTo, advanceGlobalEpochIfCurrentPoolDepleted } = await import('@/utils/tokenomics/epoch-metal-pools')
                const assay = computeMetalAssay(metals)
                const scorePct = (podScore || 0) / 10000.0

                const metalKeys: string[] = Object.keys(assay).filter((m) => Number((assay as any)[m]) > 0)
                let totalAllocated = 0

                for (const metalRaw of metalKeys) {
                    const metal = metalRaw.toLowerCase().trim() as MetalType
                    const w = Number((assay as any)[metal] || 0)
                    if (w <= 0) continue

                    // Find an epoch pool for this metal starting at the qualified epoch.
                    const pool = await pickEpochForMetalWithBalance(metal, 1, qualifiedEpoch as any)
                    if (!pool || pool.balance <= 0) continue
                    await advanceGlobalEpochTo(pool.epoch as any)

                    // Allocate against THIS epoch metal balance.
                    const amount = Math.floor(scorePct * pool.balance * w)
                    if (amount <= 0) continue
                    if (amount > pool.balance) continue

                    const balanceBefore = pool.balance
                    const balanceAfter = balanceBefore - amount

                    const allocationId = crypto.randomUUID()
                    await db.insert(allocationsTable).values({
                        id: allocationId,
                        submission_hash: submissionHash,
                        contributor: contrib.contributor,
                        metal,
                        epoch: pool.epoch,
                        tier: metal,
                        reward: amount.toString(),
                        tier_multiplier: '1.0',
                        epoch_balance_before: balanceBefore.toString(),
                        epoch_balance_after: balanceAfter.toString(),
                    })

                    await db
                        .update(epochMetalBalancesTable)
                        .set({ balance: balanceAfter.toString(), updated_at: new Date() })
                        .where(eq(epochMetalBalancesTable.id, pool.id as any))

                    // If this allocation depleted the current epoch's pool for this metal, open the next epoch globally.
                    await advanceGlobalEpochIfCurrentPoolDepleted(pool.epoch as any, balanceAfter)

                    const tokenomicsState = await db
                        .select()
                        .from(tokenomicsTable)
                        .where(eq(tokenomicsTable.id, 'main'))
                        .limit(1)

                    if (tokenomicsState.length > 0) {
                        const state: any = tokenomicsState[0]
                        const metalKey =
                            metal === 'gold' ? 'total_distributed_gold' :
                            metal === 'silver' ? 'total_distributed_silver' :
                            'total_distributed_copper'
                        const newMetalDistributed = Number(state[metalKey] || 0) + amount
                        const newTotalDistributed = Number(state.total_distributed || 0) + amount
                        await db.update(tokenomicsTable).set({
                            total_distributed: newTotalDistributed.toString(),
                            [metalKey]: newMetalDistributed.toString(),
                            updated_at: new Date()
                        } as any).where(eq(tokenomicsTable.id, 'main'))
                    }

                    totalAllocated += amount
                }

                // Trigger global epoch transition check (opens next epoch when ALL metals in current epoch are exhausted).
                if (totalAllocated > 0) {
                    const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
                    await getOpenEpochInfo()
                }

                debug('RegisterPoC', 'Tokens auto-allocated successfully (per-metal epoch)', {
                    submissionHash,
                    qualifiedEpoch,
                    podScore,
                    totalAllocated,
                    assay,
                })
            } catch (allocationError) {
                // Log allocation error but don't fail the registration (registration is complete)
                debugError('RegisterPoC', 'Auto-allocation failed (non-fatal)', allocationError)
                console.error('RegisterPoC: Allocation error details:', {
                    submissionHash,
                    error: allocationError instanceof Error ? allocationError.message : String(allocationError),
                    stack: allocationError instanceof Error ? allocationError.stack : undefined
                })
            }
        } else if (existingAllocations.length > 0) {
            debug('RegisterPoC', 'Allocation already exists, skipping', {
                submissionHash,
                existingAllocationCount: existingAllocations.length
            })
        } else if (isFinancialSupport) {
            debug('RegisterPoC', 'Financial support contribution - skipping allocation (qualifies but no tokens)', {
                submissionHash,
                type: metadata.type
            })
        } else if (!isQualified) {
            debug('RegisterPoC', 'PoC not qualified, skipping allocation', {
                submissionHash,
                qualified_founder: metadata.qualified_founder,
                qualified: metadata.qualified,
                status: currentStatus,
                pod_score: metadata.pod_score,
                note: 'PoC must be qualified (status: qualified/registered OR metadata.qualified/qualified_founder = true)'
            })
        }
        
        // Verify allocations were created
        const finalAllocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        const totalAllocated = finalAllocations.reduce((sum, a) => sum + Number(a.reward), 0)
        
        debug('RegisterPoC', 'Registration and allocation summary', {
            submissionHash,
            registered: true,
            blockchainTxHash,
            allocationCount: finalAllocations.length,
            totalAllocated,
            allocationsCreated: finalAllocations.length > 0
        })
        
        return NextResponse.json({
            success: true,
            registered: true,
            registration_tx_hash: blockchainTxHash,
            message: 'PoC registered successfully on blockchain',
            allocations: {
                created: finalAllocations.length > 0,
                count: finalAllocations.length,
                total: totalAllocated
            }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorName = error instanceof Error ? error.name : 'Error'
        
        debugError('RegisterPoC', 'Unexpected error in registration endpoint', {
            error,
            errorName,
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            submissionHash
        })
        
        // Return detailed error for debugging (always include message, stack only in dev)
        const errorResponse: any = {
            error: 'Registration failed',
            message: errorMessage,
            error_type: errorName,
            submission_hash: submissionHash
        }
        
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
            errorResponse.stack = error.stack.substring(0, 1000)
        }
        
        return NextResponse.json(errorResponse, { status: 500 })
    }
}

