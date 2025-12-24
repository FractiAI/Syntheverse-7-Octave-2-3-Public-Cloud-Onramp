import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createStripeCustomer } from '@/utils/stripe/api'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
    }

    // Determine redirect URL
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectUrl = isLocalEnv 
        ? `${origin}${next}`
        : forwardedHost 
            ? `https://${forwardedHost}${next}`
            : `${origin}${next}`

    // Create the redirect response FIRST - we'll set cookies on it
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl))
    
    // Create Supabase client with cookie handlers that write directly to redirectResponse
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Set cookies directly on the redirect response
                    // Preserve Supabase's options (especially maxAge/expires) and merge with defaults
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Merge Supabase options with our defaults, preserving expiration settings
                        const mergedOptions = {
                            path: '/',
                            sameSite: 'lax' as const,
                            secure: process.env.NODE_ENV === 'production',
                            httpOnly: true,
                            // Preserve Supabase's expiration settings (maxAge or expires)
                            ...(options || {}),
                        }
                        redirectResponse.cookies.set(name, value, mergedOptions)
                    })
                },
            },
        }
    )
    
    // Exchange the code for a session - this triggers setAll above to set cookies on redirectResponse
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
        console.error("OAuth callback error:", error)
        return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
    }

    // Verify we have a user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        console.error("No user after exchangeCodeForSession")
        return NextResponse.redirect(new URL('/auth/auth-code-error', origin))
    }

    // Handle database operations
    try {
        const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        const isUserInDB = checkUserInDB.length > 0
        
        if (!isUserInDB) {
            // Stripe is only used when registering a PoC (paying the $200 registration fee)
            // Use a placeholder value - Stripe customer will be created on-demand when user registers a PoC
            const stripeID = 'pending'
            await db.insert(usersTable).values({ 
                id: user.id, 
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', 
                email: user.email!, 
                stripe_id: stripeID, 
                plan: 'none' 
            })
        }
    } catch (dbError) {
        console.error("Database error in callback:", dbError)
        // Continue even if DB fails - session is still set
    }

    // Return the redirect response with cookies already set
    return redirectResponse
}
