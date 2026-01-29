/**
 * Minimal env validation for cloud + DB pass-through pipe + PayPal.
 * Skips during Next/Vercel build so deploy succeeds; vars required at runtime.
 */

export function requireEnvForDb(): void {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (process.env.VERCEL === '1' && !process.env.DATABASE_URL) return;
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for the DB pass-through pipe (user UI and API). Set it in Vercel or .env.');
  }
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}
