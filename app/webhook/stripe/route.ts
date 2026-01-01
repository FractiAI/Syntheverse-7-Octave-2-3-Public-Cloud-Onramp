import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable, contributionsTable, allocationsTable, epochMetalBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'
import { advanceGlobalEpochIfCurrentPoolDepleted, advanceGlobalEpochTo, pickEpochForMetalWithBalance, type MetalType, type EpochType } from '@/utils/tokenomics/epoch-metal-pools'

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
    
    // Check if this is a voluntary ecosystem support (Financial Alignment legacy naming)
    if (session.metadata?.type === 'financial_support' || session.metadata?.type === 'financial_alignment_poc') {
        await handleFinancialAlignmentPayment(session)
        return
    }
    
    // Check if this is a PoC submission payment (evaluation fee)
    if (session.metadata?.submission_type === 'poc_submission') {
        const submissionHash = session.metadata.submission_hash
        
        if (!submissionHash) {
            debugError('StripeWebhook', 'Missing submission_hash in metadata', { metadata: session.metadata })
            return
        }
        
        try {
            // Get contribution
            const contributions = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
            
            if (!contributions || contributions.length === 0) {
                debugError('StripeWebhook', 'Contribution not found for submission payment', { submissionHash })
                return
            }
            
            const contrib = contributions[0]
            
            // Update contribution: mark payment as complete and change status to evaluating
            await db
                .update(contributionsTable)
                .set({
                    status: 'evaluating',
                    metadata: {
                        ...(contrib.metadata as any || {}),
                        payment_status: 'completed',
                        payment_completed_at: new Date().toISOString(),
                        stripe_payment_id: session.payment_intent as string,
                        stripe_session_id: session.id
                    } as any,
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            debug('StripeWebhook', 'PoC submission payment completed, triggering evaluation', {
                submissionHash,
                sessionId: session.id
            })
            
            // Trigger evaluation by calling the evaluation endpoint
            // Use internal URL to avoid external network calls
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'
            const evaluateUrl = `${baseUrl}/api/evaluate/${submissionHash}`
            
            try {
                // Trigger evaluation asynchronously (don't await to avoid blocking webhook)
                // Add timeout to prevent hanging (Vercel functions have execution time limits)
                const controller = new AbortController()
                const timeoutId = setTimeout(() => {
                    controller.abort()
                    debug('StripeWebhook', 'Evaluation trigger timeout (60s)', { submissionHash })
                }, 60000) // 60 second timeout for trigger call
                
                fetch(evaluateUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                })
                .then((response) => {
                    clearTimeout(timeoutId)
                    if (!response.ok) {
                        debugError('StripeWebhook', 'Evaluation endpoint returned error', {
                            status: response.status,
                            statusText: response.statusText,
                            submissionHash
                        })
                    } else {
                        debug('StripeWebhook', 'Evaluation triggered successfully', { submissionHash })
                    }
                })
                .catch((fetchError) => {
                    clearTimeout(timeoutId)
                    if (fetchError.name === 'AbortError') {
                        debug('StripeWebhook', 'Evaluation trigger aborted due to timeout', { submissionHash })
                    } else {
                        debugError('StripeWebhook', 'Failed to trigger evaluation endpoint', {
                            error: fetchError.message,
                            submissionHash
                        })
                    }
                    // Don't fail the webhook - evaluation can be triggered manually if needed
                })
            } catch (evalTriggerError) {
                debugError('StripeWebhook', 'Error triggering evaluation', evalTriggerError)
                // Don't fail the webhook - evaluation can be triggered manually if needed
            }
            
        } catch (error) {
            debugError('StripeWebhook', 'Error processing PoC submission payment', error)
            // Don't throw - webhook should return success to Stripe
        }
        
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
            
            // Skip allocations for financial support contributions (they qualify but don't receive token allocations)
            const isFinancialSupport = metadata.type === 'financial_support' || metadata.type === 'financial_alignment_poc' || metadata.support_only === true
            
            debug('StripeWebhook', 'Allocation check', {
                submissionHash,
                existingAllocationsCount: existingAllocations.length,
                qualified_founder: metadata.qualified_founder,
                qualified: metadata.qualified,
                status: contrib.status,
                isQualified,
                isFinancialSupport,
                pod_score: metadata.pod_score
            })
            
            if (existingAllocations.length === 0 && isQualified && !isFinancialSupport) {
                try {
                    const podScore = metadata.pod_score || 0
                    const qualifiedEpoch = metadata.qualified_epoch || 'founder' // Use the epoch that was open when PoC qualified
                    
                    debug('StripeWebhook', 'Processing automatic token allocation for registered PoC', {
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

                    debug('StripeWebhook', 'Tokens auto-allocated successfully (per-metal epoch)', {
                        submissionHash,
                        qualifiedEpoch,
                        podScore,
                        totalAllocated,
                        assay,
                    })
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
            } else if (isFinancialSupport) {
                debug('StripeWebhook', 'Financial support contribution - skipping allocation (qualifies but no tokens)', {
                    submissionHash,
                    type: metadata.type
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
    debug('StripeWebhook', 'Processing ecosystem support payment (Financial Alignment)', {
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
        const productName = session.metadata?.product_name || 'Ecosystem Support'
        const amount = session.amount_total ? Number(session.amount_total) / 100 : 0 // Convert from cents
        const currency = (session.currency || 'usd').toLowerCase()
        
        // Map financial support amount to metal tier
        // Copper: $10,000 (1,000,000 cents), Silver: $50,000 (5,000,000 cents), Gold: $100,000 (10,000,000 cents)
        let metalTier: string
        if (amount >= 100000) {
            metalTier = 'gold'
        } else if (amount >= 50000) {
            metalTier = 'silver'
        } else if (amount >= 10000) {
            metalTier = 'copper'
        } else {
            // Default to copper for smaller amounts
            metalTier = 'copper'
        }
        
        // Get current open epoch to use epoch baseline score
        const { getOpenEpochInfo } = await import('@/utils/epochs/qualification')
        const epochInfo = await getOpenEpochInfo()
        const currentEpoch = epochInfo.current_epoch
        
        // Epoch baseline scores (thresholds)
        const EPOCH_BASELINE_SCORES: Record<string, number> = {
            founder: 8000,
            pioneer: 6000,
            community: 5000,
            ecosystem: 4000
        }
        
        // Use epoch baseline score as pod_score
        const podScore = EPOCH_BASELINE_SCORES[currentEpoch] || EPOCH_BASELINE_SCORES.founder
        
        // Distribute scores across dimensions (equal distribution)
        // For financial support, we use baseline epoch scores distributed equally
        const baseScore = Math.floor(podScore / 4) // Split equally across 4 dimensions
        const novelty = baseScore
        const density = baseScore
        const coherence = baseScore
        const alignment = podScore - (baseScore * 3) // Remaining goes to alignment
        
        // Create a PoC record describing the support contribution.
        // Use a hash based on session ID + timestamp for submission_hash
        // NOTE: Keep legacy prefix stable to avoid duplicates if Stripe retries old events.
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
        
        // Insert ecosystem support PoC record.
        // IMPORTANT COMPLIANCE: this is NOT a token purchase/sale/exchange. No token recognition is guaranteed.
        await db.insert(contributionsTable).values({
            submission_hash: submissionHash,
            title: productName,
            contributor: contributorEmail,
            content_hash: submissionHash, // Use same hash as submission_hash for financial alignment
            status: 'qualified', // Ecosystem support PoCs qualify immediately (no content evaluation required)
            category: 'alignment',
            metals: [metalTier], // Assign corresponding metal tier based on amount
            metadata: {
                type: 'financial_support',
                legacy_type: session.metadata?.type,
                product_id: productId,
                product_name: productName,
                amount: amount,
                currency,
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent,
                // Scoring based on epoch baseline
                pod_score: podScore,
                novelty: novelty,
                density: density,
                coherence: coherence,
                alignment: alignment,
                qualified: true,
                qualified_founder: currentEpoch === 'founder' && podScore >= 8000,
                qualified_epoch: currentEpoch,
                // Disclaimers for clarity and compliance (non-promissory, non-sale)
                support_only: true,
                not_a_purchase: true,
                not_a_token_sale: true,
                no_expectation_of_profit: true,
                no_ownership: true,
                non_custodial_experimental_sandbox: true,
                token_recognition_discretionary: true,
            },
            registered: false, // Registration is free and optional - user can register via UI
            registration_date: null,
            stripe_payment_id: session.payment_intent as string,
            registration_tx_hash: null,
            created_at: new Date(),
            updated_at: new Date()
        })
        
        debug('StripeWebhook', 'Financial support PoC recorded + qualified with epoch baseline scores', {
            submissionHash,
            sessionId: session.id,
            contributorEmail,
            productName,
            amount,
            currency,
            metalTier,
            currentEpoch,
            podScore,
            scores: { novelty, density, coherence, alignment },
            stripePaymentId: session.payment_intent
        })
        // IMPORTANT COMPLIANCE:
        // - Ecosystem support does NOT trigger SYNTH recognition automatically.
        // - Any internal coordination recognition (if ever enabled) is discretionary and handled separately from payment.
    } catch (error) {
        debugError('StripeWebhook', 'Error processing Financial Alignment payment', error)
        // Don't throw - payment is complete, we don't want to retry the webhook
    }
}