import { headers } from 'next/headers'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
            console.error(`Webhook signature verification failed:`, err.message)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                console.log(`${event.type}:`, event.data.object.id)
                await db.update(usersTable)
                    .set({ plan: event.data.object.id })
                    .where(eq(usersTable.stripe_id, (event.data.object as any).customer));
                break;
            case 'customer.subscription.deleted':
                console.log('Subscription deleted:', event.data.object.id)
                // Optionally handle subscription cancellation
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new Response('Success', { status: 200 })
    } catch (err) {
        console.error('Webhook error:', err)
        return new Response(`Webhook error: ${err instanceof Error ? err.message : "Unknown error"}`, {
            status: 400,
        })
    }
}