import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }: {
                name: string;
                value: string;
                options: CookieOptions;
              }) => {
                // Merge with defaults to ensure proper cookie settings, preserving Supabase's expiration
                const mergedOptions = {
                  path: '/',
                  sameSite: 'lax' as const,
                  secure: process.env.NODE_ENV === 'production',
                  httpOnly: true,
                  // Preserve Supabase's expiration settings (maxAge or expires)
                  ...(options || {}),
                };
                cookieStore.set(name, value, mergedOptions);
              }
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
