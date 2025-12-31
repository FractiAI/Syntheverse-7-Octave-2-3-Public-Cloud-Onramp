import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createStripeCustomer } from '@/utils/stripe/api'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm"
import { sendWelcomeEmail } from '@/utils/email/send-welcome-email'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        console.error("OAuth callback: No code parameter found")
        return NextResponse.redirect(new URL('/login?error=no_code', origin))
    }

    // Determine redirect URL - use same logic as Google OAuth route
    const forwardedHost = request.headers.get('x-forwarded-host')
    // Sanitize environment variables - remove whitespace and newlines
    const fallbackUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL)?.trim()
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    let redirectUrl: string
    if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
    } else if (fallbackUrl) {
        redirectUrl = `${fallbackUrl}${next}`
    } else {
        redirectUrl = `${origin}${next}`
    }

    console.log('OAuth callback redirect:', { origin, forwardedHost, fallbackUrl, redirectUrl, next })

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
                    console.log('OAuth callback: Setting cookies', { count: cookiesToSet.length })
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
                        console.log('OAuth callback: Set cookie', { 
                            name, 
                            hasValue: !!value, 
                            valueLength: value?.length,
                            maxAge: options?.maxAge,
                            expires: options?.expires
                        })
                    })
                },
            },
        }
    )
    
    // Exchange the code for a session - this triggers setAll above to set cookies on redirectResponse
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
        console.error("OAuth callback error:", error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin))
    }

    // Verify we have a session and user
    if (!sessionData?.session) {
        console.error("No session after exchangeCodeForSession")
        return NextResponse.redirect(new URL('/login?error=no_session', origin))
    }

    // Verify session is valid by getting user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
        console.error("No user after exchangeCodeForSession:", userError)
        return NextResponse.redirect(new URL('/login?error=no_user', origin))
    }

    // Double-check: verify session exists in the response cookies
    // Supabase uses cookies like: sb-<project-ref>-auth-token
    const allSetCookies = redirectResponse.cookies.getAll()
    const authCookies = allSetCookies.filter(c => c.name.includes('auth-token'))
    console.log('OAuth callback: All cookies set on response', {
        total: allSetCookies.length,
        authCookies: authCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    })

    if (authCookies.length === 0) {
        console.error('OAuth callback: No auth cookies found on response!')
    }

    console.log('OAuth callback success:', { 
        userId: user.id, 
        email: user.email,
        hasSession: !!sessionData.session,
        sessionExpires: sessionData.session?.expires_at,
        authCookiesCount: authCookies.length
    })

    // Handle database operations
    try {
        const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        const isUserInDB = checkUserInDB.length > 0
        
        if (!isUserInDB) {
            // Stripe is only used when anchoring a qualified PoC on-chain (operator fee; default $500).
            // Use a placeholder value - Stripe customer will be created on-demand when user registers a PoC
            const stripeID = 'pending'
            const userName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.email?.split('@')[0] || 
                           'User'
            
            await db.insert(usersTable).values({ 
                id: user.id, 
                name: userName, 
                email: user.email!, 
                stripe_id: stripeID, 
                plan: 'none' 
            })
            console.log('OAuth callback: Created new user in database', { userId: user.id, email: user.email })
            
            // Send welcome email to new contributor (don't fail if email fails)
            try {
                await sendWelcomeEmail({
                    userEmail: user.email!,
                    userName: userName
                })
                debug('OAuthCallback', 'Welcome email sent to new contributor', { email: user.email })
            } catch (emailError) {
                debugError('OAuthCallback', 'Failed to send welcome email', emailError)
                // Continue - authentication should succeed even if email fails
            }
        } else {
            console.log('OAuth callback: User already exists in database', { userId: user.id, email: user.email })
        }
    } catch (dbError) {
        console.error("Database error in callback:", dbError)
        // Continue even if DB fails - session is still set
        // User can still access the app, but may need to complete setup later
    }

    // Return the redirect response with cookies already set
    // Note: If user has plan 'none', dashboard layout will redirect to /subscribe
    // This is expected behavior for new users
    console.log('OAuth callback: Redirecting to', redirectUrl)
    return redirectResponse
}
