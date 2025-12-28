import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable, contributionsTable, allocationsTable, epochBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'
import { calculateProjectedAllocation } from '@/utils/tokenomics/projected-allocation'
import { calculateMetalAmplification } from '@/utils/tokenomics/metal-amplification'
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
                    metals
                )
                
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
            
            // Automatically allocate tokens for registered PoC based on PoC submission, open epoch, and available SYNTH tokens
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
                    
                    // Get epoch balance for the qualified epoch
                    const epochBalances = await db
                        .select()
                        .from(epochBalancesTable)
                        .where(eq(epochBalancesTable.epoch, qualifiedEpoch))
                        .limit(1)
                    
                    if (epochBalances.length > 0) {
                        const epochBalance = epochBalances[0]
                        const currentBalance = Number(epochBalance.balance)
                        
                        // Calculate allocation: (pod_score / 10000) * (available_epoch_balance / 2)
                        // For 10,000 score = 50% of available tokens (half reserved for future founder-level contributions)
                        // This ensures room for further research, development, and alignment work throughout each epoch
                        const scorePercentage = podScore / 10000.0
                        const allocatableBalance = currentBalance / 2.0  // Only allocate from 50% of available tokens
                        const baseAllocation = scorePercentage * allocatableBalance
                        
                        // Calculate metal amplification
                        const amplification = calculateMetalAmplification(metals)
                        const metalMultiplier = amplification.multiplier
                        
                        // Apply metal amplification
                        const amplifiedAllocation = baseAllocation * metalMultiplier
                        
                        // Final allocation (ensure we don't exceed the allocatable 50% of balance)
                        // The other 50% remains reserved for future founder-level contributions
                        const finalAllocation = Math.min(Math.floor(amplifiedAllocation), allocatableBalance)
                        
                        debug('StripeWebhook', 'Allocation calculation', {
                            submissionHash,
                            podScore,
                            scorePercentage: scorePercentage * 100,
                            currentBalance,
                            allocatableBalance: allocatableBalance,
                            reservedBalance: currentBalance - allocatableBalance,
                            note: '50% of epoch balance reserved for future founder-level contributions',
                            baseAllocation,
                            metalMultiplier,
                            amplifiedAllocation,
                            finalAllocation,
                            epoch: qualifiedEpoch
                        })
                        
                        if (finalAllocation > 0) {
                            // Create allocation record
                            const allocationId = crypto.randomUUID()
                            const newBalance = currentBalance - finalAllocation
                            
                            // Use first metal or default
                            const primaryMetal = metals[0] || 'copper'
                            
                            await db.insert(allocationsTable).values({
                                id: allocationId,
                                submission_hash: submissionHash,
                                contributor: contrib.contributor,
                                metal: primaryMetal.toLowerCase(),
                                epoch: qualifiedEpoch,
                                tier: primaryMetal.toLowerCase(),
                                reward: finalAllocation.toString(),
                                tier_multiplier: metalMultiplier.toString(),
                                epoch_balance_before: currentBalance.toString(),
                                epoch_balance_after: newBalance.toString(),
                            })
                            
                            // Update epoch balance
                            await db
                                .update(epochBalancesTable)
                                .set({
                                    balance: newBalance.toString(),
                                    updated_at: new Date()
                                })
                                .where(eq(epochBalancesTable.epoch, qualifiedEpoch))
                            
                            // Update tokenomics total_distributed
                            const tokenomicsState = await db
                                .select()
                                .from(tokenomicsTable)
                                .where(eq(tokenomicsTable.id, 'main'))
                                .limit(1)
                            
                            if (tokenomicsState.length > 0) {
                                const newTotalDistributed = Number(tokenomicsState[0].total_distributed) + finalAllocation
                                await db
                                    .update(tokenomicsTable)
                                    .set({
                                        total_distributed: newTotalDistributed.toString(),
                                        updated_at: new Date()
                                    })
                                    .where(eq(tokenomicsTable.id, 'main'))
                            }
                            
                            // Check and transition epoch if allocatable portion (50%) is exhausted
                            // Note: Only 50% of epoch balance is allocatable, so transition happens
                            // when the allocatable portion is exhausted (leaving the reserved 50% untouched)
                            const reservedBalance = currentBalance - allocatableBalance  // The 50% reserved portion
                            if (newBalance <= (reservedBalance + 1000)) { // Threshold: when allocatable portion is exhausted
                                const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
                                // This will check and transition epoch automatically
                                await getOpenEpochInfo()
                                
                                debug('StripeWebhook', 'Allocatable portion (50%) of epoch balance exhausted, triggering epoch transition', {
                                    epoch: qualifiedEpoch,
                                    balanceBefore: currentBalance,
                                    allocatablePortion: allocatableBalance,
                                    reservedPortion: reservedBalance,
                                    balanceAfter: newBalance,
                                    allocated: finalAllocation,
                                    note: 'Reserved 50% remains untouched for future founder-level contributions'
                                })
                            }
                            
                            debug('StripeWebhook', 'Tokens auto-allocated successfully', {
                                submissionHash,
                                allocationAmount: finalAllocation,
                                epoch: qualifiedEpoch,
                                newBalance,
                                podScore,
                                metalMultiplier
                            })
                        } else {
                            debug('StripeWebhook', 'No tokens to allocate (zero allocation or insufficient balance)', {
                                submissionHash,
                                podScore,
                                currentBalance,
                                finalAllocation
                            })
                        }
                    } else {
                        debugError('StripeWebhook', 'Epoch balance not found for allocation', {
                            submissionHash,
                            epoch: qualifiedEpoch
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