import { Stripe } from 'stripe';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { eq } from "drizzle-orm";


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"

export async function getStripePlan(email: string): Promise<string> {
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        // If user doesn't exist or has no plan, return "Free"
        if (!user || user.length === 0 || !user[0].plan || user[0].plan === "none") {
            return "Free"
        }

        // If plan is not a valid Stripe subscription ID, return "Free"
        if (!user[0].plan.startsWith("sub_")) {
            return "Free"
        }

        const subscription = await stripe.subscriptions.retrieve(user[0].plan);
        const productId = subscription.items.data[0].plan.product as string
        const product = await stripe.products.retrieve(productId)
        return product.name
    } catch (error) {
        console.error("Error getting Stripe plan:", error)
        // Return "Free" as default if anything fails
        return "Free"
    }
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    const customer = await stripe.customers.create({
        name: name ? name : "",
        email: email,
        metadata: {
            supabase_id: id
        }
    });
    // Create a new customer in Stripe
    return customer.id
}

export async function createStripeCheckoutSession(email: string): Promise<string> {
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        // If user doesn't exist or has no stripe_id, throw error
        if (!user || user.length === 0 || !user[0].stripe_id) {
            throw new Error("User not found or has no Stripe customer ID")
        }

        const customerSession = await stripe.customerSessions.create({
            customer: user[0].stripe_id,
            components: {
                pricing_table: {
                    enabled: true,
                },
            },
        });
        return customerSession.client_secret
    } catch (error) {
        console.error("Error creating Stripe checkout session:", error)
        throw error
    }
}

export async function generateStripeBillingPortalLink(email: string): Promise<string> {
    try {
        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("STRIPE_SECRET_KEY not configured, returning subscribe page")
            return "/subscribe"
        }

        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        // If user doesn't exist or has no stripe_id, return subscribe page
        if (!user || user.length === 0 || !user[0].stripe_id) {
            return "/subscribe"
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user[0].stripe_id,
            return_url: `${PUBLIC_URL}/dashboard`,
        });
        
        // Validate the URL before returning
        if (portalSession.url && portalSession.url.startsWith("http")) {
            return portalSession.url
        }
        
        return "/subscribe"
    } catch (error) {
        console.error("Error generating billing portal link:", error)
        // Return subscribe page as fallback
        return "/subscribe"
    }
}