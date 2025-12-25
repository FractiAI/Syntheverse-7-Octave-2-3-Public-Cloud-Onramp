import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable, contributionsTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'
import { debug, debugError } from '@/utils/debug'

// Sanitize the Stripe key - remove whitespace and invalid characters
const sanitizedStripeKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/\s+/g, '') || '';
const stripe = new Stripe(sanitizedStripeKey, {
    apiVersion: '2024-06-20'
})

export async function POST(req: Request) {
    try {
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
            // Update contribution with registration info
            await db
                .update(contributionsTable)
                .set({
                    registered: true,
                    registration_date: new Date(),
                    stripe_payment_id: session.payment_intent as string,
                    // registration_tx_hash will be set when blockchain transaction is confirmed
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            debug('StripeWebhook', 'PoC registration updated', { submissionHash, sessionId: session.id })
        } catch (error) {
            debugError('StripeWebhook', 'Error updating PoC registration', error)
            throw error
        }
    }
}