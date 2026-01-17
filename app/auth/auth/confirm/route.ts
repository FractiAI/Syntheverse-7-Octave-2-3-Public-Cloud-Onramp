import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendWelcomeEmail } from '@/utils/email/send-welcome-email';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Best-effort: send the welcome email after successful email confirmation.
      // This avoids emailing unconfirmed addresses and fixes the "no welcome email" report in production.
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          // Ensure user exists in our DB (some flows may not have inserted it yet).
          try {
            const existing = await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.email, user.email))
              .limit(1);
            if (existing.length === 0) {
              const userName =
                (user.user_metadata as any)?.full_name ||
                (user.user_metadata as any)?.name ||
                user.email.split('@')[0] ||
                'User';
              await db.insert(usersTable).values({
                id: user.id,
                name: userName,
                email: user.email,
                stripe_id: 'pending',
                plan: 'none',
              });
            }
          } catch (dbErr) {
            // Non-fatal: still attempt to send email even if DB insert fails.
            console.error('ConfirmRoute: failed ensuring user in DB', dbErr);
          }

          const userName =
            (user.user_metadata as any)?.full_name ||
            (user.user_metadata as any)?.name ||
            user.email.split('@')[0] ||
            'Explorer';
          const res = await sendWelcomeEmail({ userEmail: user.email, userName });
          if (!res.success) {
            console.warn('ConfirmRoute: welcome email not sent', res.error);
          }
        }
      } catch (emailErr) {
        console.error('ConfirmRoute: failed to send welcome email', emailErr);
      }
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error');
}
