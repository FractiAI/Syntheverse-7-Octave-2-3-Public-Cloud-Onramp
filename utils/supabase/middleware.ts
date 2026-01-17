import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Validate environment variables before use
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
    // Return response without authentication in case of missing env vars
    // This prevents the middleware from crashing but authentication will fail
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Create new response to set cookies on
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies on the response (request.cookies is read-only, so we skip that)
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
              // Merge with defaults to ensure proper cookie settings
              const mergedOptions = {
                path: '/',
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                // Preserve Supabase's expiration settings
                ...(options || {}),
              };
              supabaseResponse.cookies.set(name, value, mergedOptions);
            }
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Allow webhook, API routes, auth routes, and public landing pages without authentication
  if (
    request.nextUrl.pathname.startsWith('/webhook') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/fractiai') ||
    request.nextUrl.pathname.startsWith('/solutions')
  ) {
    return supabaseResponse;
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !(request.nextUrl.pathname === '/') &&
    !request.nextUrl.pathname.startsWith('/onboarding') &&
    !request.nextUrl.pathname.startsWith('/scoring') &&
    !request.nextUrl.pathname.startsWith('/examples') &&
    !request.nextUrl.pathname.startsWith('/fractiai/enterprise-dashboard')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  // // If user is logged in, redirect to submit or operator accordingly
  // if (user && request.nextUrl.pathname === '/') {
  //   url.pathname = '/submit';
  //   return NextResponse.redirect(url);
  // }
  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
