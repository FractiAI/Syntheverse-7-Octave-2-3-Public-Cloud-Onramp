import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateStripeBillingPortalLink } from '@/utils/stripe/api'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    const { origin } = new URL(request.url)
    
    debug('BillingPortal', 'Billing portal route accessed', { origin })
    
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        debug('BillingPortal', 'Auth check completed', { 
            hasUser: !!user, 
            hasEmail: !!user?.email,
            authError: authError?.message 
        })
        
        // If no user, redirect to login
        if (authError || !user || !user.email) {
            debug('BillingPortal', 'No user found, redirecting to login')
            return NextResponse.redirect(new URL('/login', origin))
        }
        
        debug('BillingPortal', 'Generating billing portal link', { email: user.email })
        
        // Generate billing portal link
        const portalUrl = await generateStripeBillingPortalLink(user.email)
        
        debug('BillingPortal', 'Portal URL generated', { 
            portalUrl, 
            isValid: portalUrl?.startsWith('http') 
        })
        
        // If we got a Stripe portal URL, redirect there
        if (portalUrl && portalUrl.startsWith('http')) {
            debug('BillingPortal', 'Redirecting to Stripe billing portal', { portalUrl })
            return NextResponse.redirect(portalUrl)
        }
        
        // Otherwise redirect to subscribe page
        debug('BillingPortal', 'Invalid portal URL, redirecting to subscribe', { portalUrl })
        return NextResponse.redirect(new URL('/subscribe', origin))
    } catch (error) {
        debugError('BillingPortal', 'Error generating billing portal', error)
        // On error, redirect to subscribe page
        return NextResponse.redirect(new URL('/subscribe', origin))
    }
}

