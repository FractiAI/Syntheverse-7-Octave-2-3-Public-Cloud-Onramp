import StripePricingTable from "@/components/StripePricingTable";
import Image from "next/image"
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createStripeCheckoutSession, createStripeCustomer } from "@/utils/stripe/api";
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { debug, debugError } from '@/utils/debug'

export default async function Subscribe() {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !user.email) {
        debug('Subscribe', 'User not authenticated, redirecting to login')
        redirect('/login')
    }

    let checkoutSessionSecret: string | null = null

    try {
        debug('Subscribe', 'Checking user in database', { email: user.email })
        
        // Check if user exists in database
        const dbUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email))
        
        // If user doesn't exist in DB, create them with Stripe customer
        if (!dbUser || dbUser.length === 0) {
            debug('Subscribe', 'User not found in database, creating user and Stripe customer')
            
            try {
                const stripeId = await createStripeCustomer(
                    user.id,
                    user.email,
                    user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
                )
                
                await db.insert(usersTable).values({
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    stripe_id: stripeId,
                    plan: 'none'
                })
                
                debug('Subscribe', 'User created successfully', { stripeId })
            } catch (createError) {
                debugError('Subscribe', 'Error creating user or Stripe customer', createError)
                throw createError
            }
        } else if (!dbUser[0].stripe_id) {
            // User exists but has no Stripe customer ID - create one
            debug('Subscribe', 'User exists but has no Stripe customer ID, creating one')
            
            try {
                const stripeId = await createStripeCustomer(
                    dbUser[0].id,
                    dbUser[0].email,
                    dbUser[0].name
                )
                
                await db.update(usersTable)
                    .set({ stripe_id: stripeId })
                    .where(eq(usersTable.email, user.email))
                
                debug('Subscribe', 'Stripe customer ID created and updated', { stripeId })
            } catch (stripeError) {
                debugError('Subscribe', 'Error creating Stripe customer', stripeError)
                throw stripeError
            }
        }

        // Now create the checkout session
        debug('Subscribe', 'Creating Stripe checkout session')
        checkoutSessionSecret = await createStripeCheckoutSession(user.email)
        
    } catch (error) {
        debugError('Subscribe', 'Error setting up checkout session', error)
        // If we can't create the checkout session, we'll render the page without it
        // The StripePricingTable component should handle this gracefully
    }

    // If we couldn't get a checkout session secret, we still render the page
    // The Stripe pricing table might work without it or show an error
    if (!checkoutSessionSecret) {
        debugError('Subscribe', 'No checkout session secret available')
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <header className="px-4 lg:px-6 h-16 flex items-center  bg-white border-b fixed border-b-slate-200 w-full">
                <Image src="/logo.png" alt="logo" width={50} height={50} />
                <span className="sr-only">Acme Inc</span>
            </header>
            <div className="w-full py-20 lg:py-32 xl:py-40">
                <div className="text-center py-6 md:py-10 lg:py-12 ">
                    <h1 className="font-bold text-xl md:text-3xl lg:text-4xl ">Pricing</h1>
                    <h1 className="pt-4 text-muted-foreground text-sm md:text-md lg:text-lg">Choose the right plan for your team! Cancel anytime!</h1>
                </div>
                {checkoutSessionSecret ? (
                    <StripePricingTable checkoutSessionSecret={checkoutSessionSecret} />
                ) : (
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                            <p className="text-destructive font-medium">
                                Unable to load pricing table. Please try refreshing the page.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                If the problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}