/**
 * Database pass-through pipe.
 * This repo does not own the DB or schema — it is a conduit for the user UI and API calls.
 * Queries and requests from the UI/API pass through here to the backing database.
 */

import postgres from 'postgres';
import { requireEnvForDb, getDatabaseUrl } from '@/utils/env-validation';

const isBuild =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  (process.env.VERCEL === '1' && !process.env.DATABASE_URL);

function createClient() {
  requireEnvForDb();
  const url = getDatabaseUrl();
  if (!url) throw new Error('DATABASE_URL is not set');
  return postgres(url, {
    max: 2,
    connect_timeout: 10,
    idle_timeout: 20,
  });
}

/** Lazy client: only created when used at runtime (not during build). */
let _sql: ReturnType<typeof postgres> | null = null;

function getSql(): ReturnType<typeof postgres> | null {
  if (isBuild) return null;
  if (!_sql) _sql = createClient();
  return _sql;
}

/** Run a simple query to verify DB connectivity. */
export async function checkDb(): Promise<{ ok: true }> {
  const sql = getSql();
  if (!sql) return { ok: true }; // build phase
  await sql`SELECT 1`;
  return { ok: true };
}

/** DB pipe: pass-through client for user UI and API calls. Use for queries; no schema ownership here. */
export function getDb(): ReturnType<typeof postgres> | null {
  return getSql();
}
