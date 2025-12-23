import { Stripe } from 'stripe';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { eq } from "drizzle-orm";
import { debug, debugError, debugWarn } from '@/utils/debug';


// Initialize Stripe - create function to get fresh instance
function getStripeClient(): Stripe | null {
    try {
        if (process.env.STRIPE_SECRET_KEY) {
            return new Stripe(process.env.STRIPE_SECRET_KEY)
        } else {
            debugWarn('StripeAPI', 'STRIPE_SECRET_KEY not found in environment');
            return null
        }
    } catch (error) {
        debugError('StripeAPI', 'Failed to initialize Stripe', error);
        return null
    }
}

// Initialize on module load
let stripe: Stripe | null = getStripeClient()
if (stripe) {
    debug('StripeAPI', 'Stripe initialized successfully');
} else {
    debugWarn('StripeAPI', 'Stripe not initialized');
}

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"

export async function getStripePlan(email: string): Promise<string> {
    debug('getStripePlan', 'Starting getStripePlan', { email });
    
    try {
        // Get fresh Stripe client instance
        const stripeClient = stripe || getStripeClient()
        if (!stripeClient) {
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
        const subscription = await stripeClient.subscriptions.retrieve(user[0].plan);
        const productId = subscription.items.data[0].plan.product as string
        
        debug('getStripePlan', 'Retrieving Stripe product', { productId });
        const product = await stripeClient.products.retrieve(productId)
        
        debug('getStripePlan', 'Stripe plan retrieved successfully', { planName: product.name });
        return product.name
    } catch (error) {
        debugError('getStripePlan', 'Error getting Stripe plan', error);
        // Return "Free" as default if anything fails
        return "Free"
    }
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    const stripeClient = stripe || getStripeClient()
    if (!stripeClient) {
        throw new Error("Stripe not initialized")
    }
    const customer = await stripeClient.customers.create({
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
        debug('createStripeCheckoutSession', 'Starting checkout session creation', { email })
        
        const stripeClient = stripe || getStripeClient()
        if (!stripeClient) {
            debugError('createStripeCheckoutSession', 'Stripe not initialized', new Error("STRIPE_SECRET_KEY not configured"))
            throw new Error("Stripe not initialized")
        }
        
        debug('createStripeCheckoutSession', 'Querying database for user', { email })
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        
        debug('createStripeCheckoutSession', 'Database query completed', {
            userFound: !!user && user.length > 0,
            hasStripeId: user?.[0]?.stripe_id ? true : false,
            stripeIdPrefix: user?.[0]?.stripe_id?.substring(0, 8) || 'none'
        })
        
        // If user doesn't exist or has no stripe_id, throw error
        if (!user || user.length === 0 || !user[0].stripe_id) {
            debugError('createStripeCheckoutSession', 'User not found or has no Stripe customer ID', new Error(`User: ${!!user && user.length > 0}, Stripe ID: ${user?.[0]?.stripe_id || 'missing'}`))
            throw new Error("User not found or has no Stripe customer ID")
        }

        debug('createStripeCheckoutSession', 'Creating Stripe customer session', {
            customerId: user[0].stripe_id
        })

        const customerSession = await stripeClient.customerSessions.create({
            customer: user[0].stripe_id,
            components: {
                pricing_table: {
                    enabled: true,
                },
            },
        });
        
        debug('createStripeCheckoutSession', 'Customer session created successfully', {
            hasSecret: !!customerSession.client_secret
        })
        
        return customerSession.client_secret
    } catch (error) {
        debugError('createStripeCheckoutSession', 'Error creating Stripe checkout session', error)
        throw error
    }
}

export async function generateStripeBillingPortalLink(email: string): Promise<string> {
    const { debug, debugError, debugWarn } = await import('@/utils/debug')
    
    try {
        debug('generateStripeBillingPortalLink', 'Starting billing portal link generation', { email })
        
        // Get fresh Stripe client instance to ensure we have latest keys
        const stripeClient = stripe || getStripeClient()
        if (!stripeClient) {
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

        // Validate customer ID format
        if (!user[0].stripe_id.startsWith('cus_')) {
            debugWarn('generateStripeBillingPortalLink', 'Invalid Stripe customer ID format', {
                stripeId: user[0].stripe_id
            })
            return "/subscribe"
        }

        const portalSession = await stripeClient.billingPortal.sessions.create({
            customer: user[0].stripe_id,
            return_url: `${PUBLIC_URL}/dashboard`,
        })
        
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