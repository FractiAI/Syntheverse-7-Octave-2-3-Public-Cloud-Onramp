import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { origin } = new URL(request.url)
    
    // Determine the correct callback URL using request origin (works for both local and production)
    const callbackUrl = `${origin}/auth/callback`
    
    // Fallback to environment variable if needed (for edge cases)
    const fallbackUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL
    const redirectTo = fallbackUrl ? `${fallbackUrl}/auth/callback` : callbackUrl
    
    console.log('GitHub OAuth redirect:', { origin, callbackUrl, redirectTo, fallbackUrl })
    
    const supabase = createClient()
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectTo,
            },
        })

        if (error) {
            console.error("GitHub OAuth error:", error)
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin))
        }

        if (data?.url) {
            return NextResponse.redirect(data.url)
        }
        
        console.error("GitHub OAuth: No redirect URL returned from Supabase")
        return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
    } catch (err) {
        console.error("GitHub OAuth exception:", err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin))
    }
}

