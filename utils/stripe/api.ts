import { Stripe } from 'stripe';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { eq } from "drizzle-orm";
import { debug, debugError, debugWarn } from '@/utils/debug';


// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        debug('StripeAPI', 'Stripe initialized successfully');
    } else {
        debugWarn('StripeAPI', 'STRIPE_SECRET_KEY not found in environment');
    }
} catch (error) {
    debugError('StripeAPI', 'Failed to initialize Stripe', error);
}
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"

export async function getStripePlan(email: string): Promise<string> {
    debug('getStripePlan', 'Starting getStripePlan', { email });
    
    try {
        // Check if Stripe is initialized
        if (!stripe) {
            debugWarn('getStripePlan', 'Stripe not initialized, returning Free plan');
            return "Free"
        }
        
        debug('getStripePlan', 'Querying database for user', { email });
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        debug('getStripePlan', 'Database query completed', { 
            found: user?.length > 0,
            plan: user?.[0]?.plan 
        });
        
        // If user doesn't exist or has no plan, return "Free"
        if (!user || user.length === 0 || !user[0].plan || user[0].plan === "none") {
            debug('getStripePlan', 'User has no plan, returning Free');
            return "Free"
        }

        // If plan is not a valid Stripe subscription ID, return "Free"
        if (!user[0].plan.startsWith("sub_")) {
            debugWarn('getStripePlan', 'Plan is not a valid Stripe subscription ID', { plan: user[0].plan });
            return "Free"
        }

        debug('getStripePlan', 'Retrieving Stripe subscription', { subscriptionId: user[0].plan });
        const subscription = await stripe.subscriptions.retrieve(user[0].plan);
        const productId = subscription.items.data[0].plan.product as string
        
        debug('getStripePlan', 'Retrieving Stripe product', { productId });
        const product = await stripe.products.retrieve(productId)
        
        debug('getStripePlan', 'Stripe plan retrieved successfully', { planName: product.name });
        return product.name
    } catch (error) {
        debugError('getStripePlan', 'Error getting Stripe plan', error);
        // Return "Free" as default if anything fails
        return "Free"
    }
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    if (!stripe) {
        throw new Error("Stripe not initialized")
    }
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
        if (!stripe) {
            throw new Error("Stripe not initialized")
        }
        
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
    const { debug, debugError, debugWarn } = await import('@/utils/debug')
    
    try {
        debug('generateStripeBillingPortalLink', 'Starting billing portal link generation', { email })
        
        // Check if Stripe is initialized
        if (!stripe) {
            debugWarn('generateStripeBillingPortalLink', 'Stripe not initialized, returning subscribe page')
            return "/subscribe"
        }

        debug('generateStripeBillingPortalLink', 'Querying database for user', { email })
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        debug('generateStripeBillingPortalLink', 'Database query completed', { 
            found: user?.length > 0,
            hasStripeId: user?.[0]?.stripe_id ? true : false,
            stripeId: user?.[0]?.stripe_id ? `${user[0].stripe_id.slice(0, 8)}...` : 'none'
        })
        
        // If user doesn't exist or has no stripe_id, return subscribe page
        if (!user || user.length === 0 || !user[0].stripe_id) {
            debugWarn('generateStripeBillingPortalLink', 'User not found or has no stripe_id', {
                userExists: !!user && user.length > 0,
                hasStripeId: user?.[0]?.stripe_id ? true : false
            })
            return "/subscribe"
        }

        debug('generateStripeBillingPortalLink', 'Creating Stripe billing portal session', {
            customerId: user[0].stripe_id,
            returnUrl: `${PUBLIC_URL}/dashboard`
        })

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user[0].stripe_id,
            return_url: `${PUBLIC_URL}/dashboard`,
        });
        
        debug('generateStripeBillingPortalLink', 'Stripe portal session created', {
            hasUrl: !!portalSession.url,
            url: portalSession.url ? `${portalSession.url.slice(0, 50)}...` : 'none'
        })
        
        // Validate the URL before returning
        if (portalSession.url && portalSession.url.startsWith("http")) {
            debug('generateStripeBillingPortalLink', 'Valid portal URL generated', { url: portalSession.url })
            return portalSession.url
        }
        
        debugWarn('generateStripeBillingPortalLink', 'Invalid portal URL format', { url: portalSession.url })
        return "/subscribe"
    } catch (error) {
        debugError('generateStripeBillingPortalLink', 'Error generating billing portal link', error)
        // Return subscribe page as fallback
        return "/subscribe"
    }
}