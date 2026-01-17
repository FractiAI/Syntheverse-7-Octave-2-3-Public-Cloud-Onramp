import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const origin = host ? `${protocol}://${host}` : new URL(request.url).origin;

  // Determine the correct callback URL using request origin (works for both local and production)
  const callbackUrl = `${origin}/auth/callback`;

  // Always use the dynamic origin for preview branches and local dev
  // to avoid PKCE code verifier mismatch
  const redirectTo = callbackUrl;

  console.log('Google OAuth redirect:', { origin, callbackUrl, redirectTo });

  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      );
    }

    if (data?.url) {
      return NextResponse.redirect(data.url);
    }

    console.error('Google OAuth: No redirect URL returned from Supabase');
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  } catch (err) {
    console.error('Google OAuth exception:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin)
    );
  }
}
