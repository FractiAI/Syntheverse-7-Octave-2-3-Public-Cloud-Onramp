import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable, contributionsTable, allocationsTable, epochMetalBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation'
import crypto from 'crypto'

// Force dynamic rendering - webhooks must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Initialize Stripe with sanitized key
function getStripeClient(): Stripe | null {
    if (!process.env.STRIPE_SECRET_KEY) {
        return null;
    }
    // Sanitize the Stripe key - remove whitespace and invalid characters
    const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
    // Validate key format (supports standard sk_ keys and restricted ssk_/rk_ keys)
    if (!sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)) {
        return null;
    }
    return new Stripe(sanitizedKey, {
        apiVersion: '2024-06-20'
    });
}

const stripe = getStripeClient();

export async function POST(req: Request) {
    try {
        if (!stripe) {
            return new Response('Stripe not configured', { status: 500 });
        }
        
        // Get raw body as text (required for signature verification)
        const body = await req.text()
        const sig = headers().get('stripe-signature')

        if (!sig) {
            debugError('StripeWebhook', 'Missing stripe-signature header', {})
            return new Response('Missing stripe-signature header', { status: 400 })
        }

        // Sanitize webhook secret (remove whitespace, newlines, etc.)
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!webhookSecret) {
            debugError('StripeWebhook', 'STRIPE_WEBHOOK_SECRET not configured', {})
            return new Response('Webhook secret not configured', { status: 500 })
        }

        // Sanitize the webhook secret - remove all whitespace including newlines
        const sanitizedSecret = webhookSecret.trim().replace(/\s+/g, '')
        
        if (sanitizedSecret.length === 0) {
            debugError('StripeWebhook', 'STRIPE_WEBHOOK_SECRET is empty after sanitization', {})
            return new Response('Invalid webhook secret', { status: 500 })
        }

        // Log secret format (first/last 4 chars only for security)
        debug('StripeWebhook', 'Verifying webhook signature', {
            secretLength: sanitizedSecret.length,
            secretPrefix: sanitizedSecret.substring(0, 4),
            secretSuffix: sanitizedSecret.substring(sanitizedSecret.length - 4),
            bodyLength: body.length,
            hasSignature: !!sig
        })

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, sig, sanitizedSecret)
        } catch (err: any) {
            debugError('StripeWebhook', 'Signature verification failed', {
                error: err.message,
                secretLength: sanitizedSecret.length,
                secretPrefix: sanitizedSecret.substring(0, 4),
                bodyLength: body.length,
                signatureHeader: sig?.substring(0, 20) + '...'
            })
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                debug('StripeWebhook', `${event.type}`, { id: event.data.object.id })
                await db.update(usersTable)
                    .set({ plan: event.data.object.id })
                    .where(eq(usersTable.stripe_id, (event.data.object as any).customer));
                break;
            case 'customer.subscription.deleted':
                debug('StripeWebhook', 'Subscription deleted', { id: event.data.object.id })
                // Optionally handle subscription cancellation
                break;
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
                break;
            default:
                debug('StripeWebhook', `Unhandled event type`, { type: event.type })
        }

        return new Response('Success', { status: 200 })
    } catch (err) {
        debugError('StripeWebhook', 'Webhook error', err)
        return new Response(`Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`, {
            status: 400,
        })
    }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    debug('StripeWebhook', 'Checkout session completed', { 
        sessionId: session.id,
        metadata: session.metadata 
    })
    
    // Check if this is a Financial Alignment contribution
    if (session.metadata?.type === 'financial_alignment_poc') {
        await handleFinancialAlignmentPayment(session)
        return
    }
    
    // Check if this is a PoC registration payment
    if (session.metadata?.type === 'poc_registration') {
        const submissionHash = session.metadata.submission_hash
        
        if (!submissionHash) {
            debugError('StripeWebhook', 'Missing submission_hash in metadata', { metadata: session.metadata })
            return
        }
        
        try {
            // Get contribution data for blockchain registration
            const contributions = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
            
            if (!contributions || contributions.length === 0) {
                debugError('StripeWebhook', 'Contribution not found for blockchain registration', { submissionHash })
                return
            }
            
            const contrib = contributions[0]
            const metadata = contrib.metadata as any || {}
            const metals = (contrib.metals as string[]) || []
            
            // Register PoC on Hard Hat L1 blockchain
            // Text-only submissions: anchor using a stable SHA-256 hash of the submitted text (no file storage).
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
                
                debug('StripeWebhook', 'Blockchain registration includes submission text hash', {
                    submissionHash,
                    hasText: !!contrib.text_content && String(contrib.text_content).trim().length > 0,
                    note: 'Text-only: submission text is hashed and anchored (no Supabase Storage dependency)'
                })
                
                if (blockchainResult.success && blockchainResult.transaction_hash) {
                    blockchainTxHash = blockchainResult.transaction_hash
                    debug('StripeWebhook', 'PoC registered on Hard Hat L1 blockchain', {
                        submissionHash,
                        txHash: blockchainTxHash,
                        blockNumber: blockchainResult.block_number
                    })
                } else {
                    debugError('StripeWebhook', 'Blockchain registration failed', {
                        submissionHash,
                        error: blockchainResult.error
                    })
                    // Continue with registration even if blockchain fails (payment is complete)
                }
            } catch (blockchainError) {
                debugError('StripeWebhook', 'Blockchain registration error (non-fatal)', blockchainError)
                // Continue with registration even if blockchain fails
            }
            
            // Update contribution with registration info (Stripe payment + blockchain transaction)
            await db
                .update(contributionsTable)
                .set({
                    registered: true,
                    status: 'registered', // Set status to registered so UI displays correctly
                    registration_date: new Date(),
                    stripe_payment_id: session.payment_intent as string,
                    registration_tx_hash: blockchainTxHash, // Hard Hat L1 transaction hash
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            // Automatically allocate tokens for registered PoC based on PoC submission, open epoch, and available tokens per metal
            // Check if allocation already exists
            const existingAllocations = await db
                .select()
                .from(allocationsTable)
                .where(eq(allocationsTable.submission_hash, submissionHash))
            
            // Check if PoC is qualified (either qualified_founder or qualified flag in metadata)
            const isQualified = metadata.qualified_founder === true || metadata.qualified === true || contrib.status === 'qualified'
            
            debug('StripeWebhook', 'Allocation check', {
                submissionHash,
                existingAllocationsCount: existingAllocations.length,
                qualified_founder: metadata.qualified_founder,
                qualified: metadata.qualified,
                status: contrib.status,
                isQualified,
                pod_score: metadata.pod_score
            })
            
            if (existingAllocations.length === 0 && isQualified) {
                try {
                    const podScore = metadata.pod_score || 0
                    const qualifiedEpoch = metadata.qualified_epoch || 'founder' // Use the epoch that was open when PoC qualified
                    
                    debug('StripeWebhook', 'Processing automatic token allocation for registered PoC', {
                        submissionHash,
                        podScore,
                        qualifiedEpoch,
                        metals
                    })
                    
                    // Use projected allocation logic (now per-metal) for consistency
                    const projected = await calculateProjectedAllocation(submissionHash)
                    const metalAllocations = projected.breakdown.metal_allocations || {}
                    const metalKeys = Object.keys(metalAllocations).filter((m) => Number(metalAllocations[m]) > 0)

                    if (projected.eligible && projected.epoch === qualifiedEpoch && metalKeys.length > 0) {
                        debug('StripeWebhook', 'Allocation calculation (per metal)', {
                            submissionHash,
                            epoch: qualifiedEpoch,
                            podScore,
                            metalAllocations,
                            total: projected.projected_allocation,
                        })

                        for (const metal of metalKeys) {
                            const amount = Math.floor(Number(metalAllocations[metal]))
                            if (amount <= 0) continue

                            const pools = await db
                                .select()
                                .from(epochMetalBalancesTable)
                                .where(eq(epochMetalBalancesTable.epoch, qualifiedEpoch))

                            const pool = pools.find(p => String(p.metal).toLowerCase().trim() === metal)
                            if (!pool) {
                                debugError('StripeWebhook', 'Epoch metal pool not found', { epoch: qualifiedEpoch, metal })
                                continue
                            }

                            const balanceBefore = Number(pool.balance)
                            const balanceAfter = balanceBefore - amount
                            if (balanceAfter < 0) {
                                debugError('StripeWebhook', 'Insufficient metal balance (skipping)', { epoch: qualifiedEpoch, metal, balanceBefore, amount })
                                continue
                            }

                            const allocationId = crypto.randomUUID()
                            await db.insert(allocationsTable).values({
                                id: allocationId,
                                submission_hash: submissionHash,
                                contributor: contrib.contributor,
                                metal: metal.toLowerCase(),
                                epoch: qualifiedEpoch,
                                tier: metal.toLowerCase(),
                                reward: amount.toString(),
                                tier_multiplier: '1.0',
                                epoch_balance_before: balanceBefore.toString(),
                                epoch_balance_after: balanceAfter.toString(),
                            })

                            await db
                                .update(epochMetalBalancesTable)
                                .set({ balance: balanceAfter.toString(), updated_at: new Date() })
                                .where(eq(epochMetalBalancesTable.id, pool.id))

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
                        }
                            
                            // Check and transition epoch if balance is exhausted
                            // Transition happens when epoch balance reaches threshold (automatically opens next epoch)
                            const FULLY_ALLOCATED_THRESHOLD = 1000 // Consider fully allocated if balance < 1000 tokens
                            // Trigger transition check (it uses per-metal balances when available)
                            if (projected.projected_allocation > 0) {
                                const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
                                // This will check and transition epoch automatically (e.g., founder -> pioneer)
                                await getOpenEpochInfo()
                                
                                debug('StripeWebhook', 'Epoch balance exhausted, triggering automatic epoch transition', {
                                    epoch: qualifiedEpoch,
                                    threshold: FULLY_ALLOCATED_THRESHOLD,
                                    note: 'Automatically transitioning to next epoch when balance is exhausted'
                                })
                            }
                            
                            debug('StripeWebhook', 'Tokens auto-allocated successfully', {
                                submissionHash,
                                allocationAmount: projected.projected_allocation,
                                epoch: qualifiedEpoch,
                                podScore
                            })
                    }
                } catch (allocationError) {
                    // Log allocation error but don't fail the registration (payment is complete)
                    debugError('StripeWebhook', 'Auto-allocation failed (non-fatal)', allocationError)
                    console.error('StripeWebhook: Allocation error details:', {
                        submissionHash,
                        error: allocationError instanceof Error ? allocationError.message : String(allocationError),
                        stack: allocationError instanceof Error ? allocationError.stack : undefined
                    })
                }
            } else if (existingAllocations.length > 0) {
                debug('StripeWebhook', 'Allocation already exists, skipping', {
                    submissionHash,
                    existingAllocationCount: existingAllocations.length
                })
            } else if (!isQualified) {
                debug('StripeWebhook', 'PoC not qualified, skipping allocation', {
                    submissionHash,
                    qualified_founder: metadata.qualified_founder,
                    qualified: metadata.qualified,
                    status: contrib.status
                })
            }
            
            // Verify the updates were successful by fetching the updated contribution
            const updatedContrib = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
            
            const finalAllocations = await db
                .select()
                .from(allocationsTable)
                .where(eq(allocationsTable.submission_hash, submissionHash))
            
            debug('StripeWebhook', 'PoC registration completed', { 
                submissionHash, 
                sessionId: session.id,
                stripePaymentId: session.payment_intent,
                blockchainTxHash: blockchainTxHash || 'pending',
                registered: updatedContrib[0]?.registered || false,
                status: updatedContrib[0]?.status || 'unknown',
                allocationCount: finalAllocations.length,
                totalAllocated: finalAllocations.reduce((sum, a) => sum + Number(a.reward), 0)
            })
        } catch (error) {
            debugError('StripeWebhook', 'Error updating PoC registration', error)
            throw error
        }
    }
}

async function handleFinancialAlignmentPayment(session: Stripe.Checkout.Session) {
    debug('StripeWebhook', 'Processing Financial Alignment payment', {
        sessionId: session.id,
        metadata: session.metadata,
        customerEmail: session.customer_email || session.customer_details?.email
    })
    
    try {
        const contributorEmail = session.metadata?.contributor || session.customer_email || session.customer_details?.email
        
        if (!contributorEmail) {
            debugError('StripeWebhook', 'No contributor email found for Financial Alignment payment', {
                sessionId: session.id,
                metadata: session.metadata
            })
            return
        }
        
        // Get user from database
        const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, contributorEmail))
            .limit(1)
        
        if (users.length === 0) {
            debugError('StripeWebhook', 'User not found for Financial Alignment payment', {
                email: contributorEmail,
                sessionId: session.id
            })
            return
        }
        
        const user = users[0]
        const productId = session.metadata?.product_id || ''
        const productName = session.metadata?.product_name || 'Financial Alignment Contribution'
        const amount = session.amount_total ? Number(session.amount_total) / 100 : 0 // Convert from cents
        
        // Create a record in the contributions table for financial alignment
        // Use a hash based on session ID + timestamp for submission_hash
        const submissionHash = `financial_alignment_${session.id.replace('cs_', '')}`
        
        // Check if already exists
        const existing = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (existing.length > 0) {
            debug('StripeWebhook', 'Financial Alignment contribution already recorded', {
                submissionHash,
                sessionId: session.id
            })
            return
        }
        
        // Insert financial alignment contribution record
        await db.insert(contributionsTable).values({
            submission_hash: submissionHash,
            title: productName,
            contributor: contributorEmail,
            content_hash: submissionHash, // Use same hash as submission_hash for financial alignment
            status: 'registered', // Financial alignment contributions are immediately registered
            category: 'alignment',
            metals: ['copper'], // Default metal for financial alignment
            metadata: {
                type: 'financial_alignment_poc',
                product_id: productId,
                product_name: productName,
                amount: amount,
                erc20_alignment_only: true,
                no_ownership: true,
                no_external_trading: true
            },
            registered: true,
            registration_date: new Date(),
            stripe_payment_id: session.payment_intent as string,
            registration_tx_hash: null, // No blockchain registration for financial alignment (just payment)
            created_at: new Date(),
            updated_at: new Date()
        })
        
        debug('StripeWebhook', 'Financial Alignment contribution recorded', {
            submissionHash,
            sessionId: session.id,
            contributorEmail,
            productName,
            amount,
            stripePaymentId: session.payment_intent
        })
        
        // Allocate tokens for Financial Alignment from Founders' 5% (4.5T SYNTH)
        // Fixed token allocations per contribution level:
        // $10,000: 18M SYNTH
        // $25,000: 90M SYNTH
        // $50,000: 450M SYNTH
        // $100,000: 1.2B SYNTH
        // $250,000: 4.5B SYNTH
        
        const FINANCIAL_ALIGNMENT_ALLOCATIONS: Record<number, { tokens: number, tier: string }> = {
            10000: { tokens: 18_000_000, tier: 'copper' },           // 18M SYNTH
            25000: { tokens: 90_000_000, tier: 'copper' },           // 90M SYNTH
            50000: { tokens: 450_000_000, tier: 'silver' },          // 450M SYNTH
            100000: { tokens: 1_200_000_000, tier: 'silver' },       // 1.2B SYNTH
            250000: { tokens: 4_500_000_000, tier: 'gold' },         // 4.5B SYNTH
        }
        
        // Find matching allocation based on amount (exact match)
        let synthAllocation = 0
        let tier = 'copper'
        
        if (FINANCIAL_ALIGNMENT_ALLOCATIONS[amount]) {
            synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[amount].tokens
            tier = FINANCIAL_ALIGNMENT_ALLOCATIONS[amount].tier
        } else {
            // If amount doesn't match exactly, use closest tier
            // This shouldn't happen with our product structure, but handle gracefully
            if (amount >= 250000) {
                tier = 'gold'
                synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[250000].tokens
            } else if (amount >= 100000) {
                tier = 'silver'
                synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[100000].tokens
            } else if (amount >= 50000) {
                tier = 'silver'
                synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[50000].tokens
            } else if (amount >= 25000) {
                tier = 'copper'
                synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[25000].tokens
            } else if (amount >= 10000) {
                tier = 'copper'
                synthAllocation = FINANCIAL_ALIGNMENT_ALLOCATIONS[10000].tokens
            } else {
                debugError('StripeWebhook', 'Financial Alignment amount below minimum tier', {
                    submissionHash,
                    amount,
                    minimumAmount: 10000
                })
                return
            }
        }
        
        debug('StripeWebhook', 'Financial Alignment token allocation calculation', {
            submissionHash,
            amount,
            tier,
            synthAllocation,
            allocationType: 'fixed_amount'
        })
        
        // Allocate tokens from Founder epoch, from the specific metal pool (gold/silver/copper)
        try {
            const founderEpoch = 'founder'
            const pools = await db
                .select()
                .from(epochMetalBalancesTable)
                .where(eq(epochMetalBalancesTable.epoch, founderEpoch))
            
            const pool = pools.find(p => String(p.metal).toLowerCase().trim() === tier.toLowerCase())
            if (!pool) {
                debugError('StripeWebhook', 'Founder epoch metal pool not found for Financial Alignment allocation', {
                    submissionHash,
                    tier,
                    synthAllocation
                })
                return
            }
            
            const currentBalance = Number(pool.balance)
            
            if (currentBalance < synthAllocation) {
                debugError('StripeWebhook', 'Insufficient Founder epoch metal balance for Financial Alignment allocation', {
                    submissionHash,
                    tier,
                    requested: synthAllocation,
                    available: currentBalance
                })
                return
            }
            
            const newBalance = currentBalance - synthAllocation
            
            // Create allocation record
            const allocationId = crypto.randomUUID()
            await db.insert(allocationsTable).values({
                id: allocationId,
                submission_hash: submissionHash,
                contributor: contributorEmail,
                metal: tier.toLowerCase(),
                epoch: founderEpoch,
                tier: tier.toLowerCase(),
                reward: synthAllocation.toString(),
                tier_multiplier: '1.0', // No multiplier for Financial Alignment
                epoch_balance_before: currentBalance.toString(),
                epoch_balance_after: newBalance.toString(),
            })
            
            // Update Founder epoch metal pool balance
            await db
                .update(epochMetalBalancesTable)
                .set({
                    balance: newBalance.toString(),
                    updated_at: new Date()
                })
                .where(eq(epochMetalBalancesTable.id, pool.id))
            
            // Update tokenomics total_distributed (overall + per metal)
            const tokenomicsState = await db
                .select()
                .from(tokenomicsTable)
                .where(eq(tokenomicsTable.id, 'main'))
                .limit(1)
            
            if (tokenomicsState.length > 0) {
                const state: any = tokenomicsState[0]
                const newTotalDistributed = Number(state.total_distributed) + synthAllocation
                const metalKey =
                    tier === 'gold' ? 'total_distributed_gold' :
                    tier === 'silver' ? 'total_distributed_silver' :
                    'total_distributed_copper'
                const newMetalDistributed = Number(state[metalKey] || 0) + synthAllocation
                await db
                    .update(tokenomicsTable)
                    .set({
                        total_distributed: newTotalDistributed.toString(),
                        [metalKey]: newMetalDistributed.toString(),
                        updated_at: new Date()
                    } as any)
                    .where(eq(tokenomicsTable.id, 'main'))
            }
            
            debug('StripeWebhook', 'Financial Alignment tokens allocated successfully', {
                submissionHash,
                tier,
                synthAllocation,
                epoch: founderEpoch,
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
                allocationRecordId: allocationId
            })
            
            // Check and transition epoch if balance is exhausted
            // Transition happens when epoch balance reaches threshold (automatically opens next epoch)
            const FULLY_ALLOCATED_THRESHOLD = 1000 // Consider fully allocated if balance < 1000 tokens
            if (newBalance <= FULLY_ALLOCATED_THRESHOLD) {
                const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
                // This will check and transition epoch automatically (e.g., founder -> pioneer)
                await getOpenEpochInfo()
                
                debug('StripeWebhook', 'Founder epoch balance exhausted via Financial Alignment, triggering automatic epoch transition', {
                    epoch: founderEpoch,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    allocated: synthAllocation,
                    threshold: FULLY_ALLOCATED_THRESHOLD,
                    note: 'Automatically transitioning to next epoch when balance is exhausted'
                })
            }
            
            // Log allocation summary for debugging
            console.log('✅ Financial Alignment Allocation Complete:', {
                contributorEmail,
                amount: amount,
                tier,
                synthAllocation: synthAllocation.toLocaleString(),
                founderBalanceBefore: currentBalance.toLocaleString(),
                founderBalanceAfter: newBalance.toLocaleString(),
                submissionHash
            })
        } catch (allocationError) {
            // Log allocation error but don't fail the webhook (payment is complete)
            debugError('StripeWebhook', 'Financial Alignment allocation failed (non-fatal)', allocationError)
            console.error('StripeWebhook: Financial Alignment allocation error:', {
                submissionHash,
                tier,
                synthAllocation,
                error: allocationError instanceof Error ? allocationError.message : String(allocationError)
            })
        }
        
    } catch (error) {
        debugError('StripeWebhook', 'Error processing Financial Alignment payment', error)
        // Don't throw - payment is complete, we don't want to retry the webhook
    }
}