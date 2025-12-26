import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable, contributionsTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

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
    // Validate key format
    if (!sanitizedKey.match(/^sk_(test|live)_/)) {
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
        
        const body = await req.text()
        const sig = headers().get('stripe-signature')

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
        } catch (err: any) {
            debugError('StripeWebhook', 'Signature verification failed', err)
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
                    registration_date: new Date(),
                    stripe_payment_id: session.payment_intent as string,
                    registration_tx_hash: blockchainTxHash, // Hard Hat L1 transaction hash
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            debug('StripeWebhook', 'PoC registration completed', { 
                submissionHash, 
                sessionId: session.id,
                stripePaymentId: session.payment_intent,
                blockchainTxHash: blockchainTxHash || 'pending'
            })
        } catch (error) {
            debugError('StripeWebhook', 'Error updating PoC registration', error)
            throw error
        }
    }
}