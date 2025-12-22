import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateStripeBillingPortalLink } from '@/utils/stripe/api'

export async function GET(request: NextRequest) {
    const { origin } = new URL(request.url)
    
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        // If no user, redirect to login
        if (authError || !user || !user.email) {
            return NextResponse.redirect(new URL('/login', origin))
        }
        
        // Generate billing portal link
        const portalUrl = await generateStripeBillingPortalLink(user.email)
        
        // If we got a Stripe portal URL, redirect there
        if (portalUrl && portalUrl.startsWith('http')) {
            return NextResponse.redirect(portalUrl)
        }
        
        // Otherwise redirect to subscribe page
        return NextResponse.redirect(new URL('/subscribe', origin))
    } catch (error) {
        console.error('Error generating billing portal:', error)
        // On error, redirect to subscribe page
        return NextResponse.redirect(new URL('/subscribe', origin))
    }
}

