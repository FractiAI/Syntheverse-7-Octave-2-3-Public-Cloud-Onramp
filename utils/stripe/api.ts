import { Stripe } from 'stripe';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { eq } from "drizzle-orm";
import { debug, debugError, debugWarn } from '@/utils/debug';


// Initialize Stripe - create function to get fresh instance
function getStripeClient(): Stripe | null {
    try {
        if (process.env.STRIPE_SECRET_KEY) {
            // Sanitize the Stripe key - remove whitespace and invalid characters
            const sanitizedKey = process.env.STRIPE_SECRET_KEY.trim().replace(/\s+/g, '');
            
            // Validate key format (supports standard sk_ keys and restricted ssk_/rk_ keys)
            if (!sanitizedKey.match(/^(sk|ssk|rk)_(test|live)_/)) {
                debugError('StripeAPI', 'Invalid Stripe key format', new Error('Stripe key must start with sk_test_, sk_live_, ssk_test_, ssk_live_, rk_test_, or rk_live_'));
                return null;
            }
            
            return new Stripe(sanitizedKey, {
                apiVersion: '2024-06-20'
            });
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
        
        // If user doesn't exist, throw error
        if (!user || user.length === 0) {
            debugError('createStripeCheckoutSession', 'User not found', new Error('User not found'))
            throw new Error("User not found")
        }

        let stripeCustomerId = user[0].stripe_id

        // If user has placeholder stripe_id, create Stripe customer on-demand (when registering PoC)
        if (!stripeCustomerId || stripeCustomerId === 'pending' || stripeCustomerId.startsWith('free_') || stripeCustomerId.startsWith('placeholder_')) {
            debug('createStripeCheckoutSession', 'Creating Stripe customer on-demand for PoC registration', {
                userId: user[0].id,
                email: user[0].email,
                currentStripeId: stripeCustomerId
            })
            
            try {
                stripeCustomerId = await createStripeCustomer(
                    user[0].id,
                    user[0].email,
                    user[0].name
                )
                
                // Update user record with real Stripe customer ID
                await db.update(usersTable)
                    .set({ stripe_id: stripeCustomerId })
                    .where(eq(usersTable.id, user[0].id))
                
                debug('createStripeCheckoutSession', 'Stripe customer created and saved', {
                    stripeCustomerId: stripeCustomerId.substring(0, 20)
                })
            } catch (createError) {
                debugError('createStripeCheckoutSession', 'Failed to create Stripe customer', createError)
                throw new Error("Failed to create Stripe customer for payment")
            }
        }

        debug('createStripeCheckoutSession', 'Creating Stripe customer session', {
            customerId: stripeCustomerId.substring(0, 20)
        })

        const customerSession = await stripeClient.customerSessions.create({
            customer: stripeCustomerId,
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