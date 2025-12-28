import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Debug endpoint to check OAuth configuration
 * GET /api/debug/oauth
 */
export async function GET(request: NextRequest) {
    const { origin } = new URL(request.url)
    
    const supabase = createClient()
    
    // Get Supabase project URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'
    const supabaseProjectId = supabaseUrl.includes('supabase.co') 
        ? supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown'
        : 'unknown'
    
    const supabaseCallbackUrl = `https://${supabaseProjectId}.supabase.co/auth/v1/callback`
    
    // Get environment variables
    const envVars = {
        NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'Not set',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        SUPABASE_PROJECT_ID: supabaseProjectId,
    }
    
    // Calculate expected URLs
    const appCallbackUrl = `${origin}/auth/callback`
    const fallbackCallbackUrl = envVars.NEXT_PUBLIC_WEBSITE_URL !== 'Not set' 
        ? `${envVars.NEXT_PUBLIC_WEBSITE_URL}/auth/callback`
        : appCallbackUrl
    
    // Check if Supabase is configured
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
        message: 'OAuth Configuration Debug Info',
        timestamp: new Date().toISOString(),
        environment: {
            ...envVars,
            origin,
        },
        urls: {
            appCallbackUrl,
            fallbackCallbackUrl,
            supabaseCallbackUrl,
            githubOAuthAppShouldUse: supabaseCallbackUrl,
            appCallbackForSupabase: fallbackCallbackUrl,
        },
        supabaseConfigured,
        instructions: {
            githubOAuthApp: {
                step1: 'Go to: https://github.com/settings/developers',
                step2: 'Find your OAuth App (or create one)',
                step3: `Set "Authorization callback URL" to: ${supabaseCallbackUrl}`,
                note: 'This is Supabase\'s callback URL, NOT your app\'s URL!',
            },
            supabase: {
                step1: 'Go to: https://app.supabase.io/project/[your-project]/authentication/providers',
                step2: 'Enable GitHub OAuth and add Client ID/Secret',
                step3: 'Go to: Authentication → URL Configuration',
                step4: `Add redirect URL: ${origin}/**`,
            },
        },
    }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
    })
}

