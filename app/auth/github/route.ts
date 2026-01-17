import { NextResponse } from 'next/server';

/**
 * GitHub OAuth route - DISABLED
 * GitHub authentication has been removed from this application.
 * This route returns a 404 to prevent any accidental access.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(new URL('/login?error=github_oauth_disabled', origin), {
    status: 404,
  });
}
