import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables are not configured');
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Authentication service is not configured',
        },
        { status: 503 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    return NextResponse.json({
      authenticated: !authError && !!user && !!user.email,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
