import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"

export async function GET(request: Request) {
    const { origin } = new URL(request.url)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${PUBLIC_URL}/auth/callback`,
        },
    })

    if (error) {
        console.error("Google OAuth error:", error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin))
    }

    if (data.url) {
        return NextResponse.redirect(data.url)
    }
    
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
}

