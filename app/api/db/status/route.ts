/**
 * DB access status — cloud connectivity check.
 * GET /api/db/status — other systems can call this to verify DB access through this repo.
 */

import { NextResponse } from 'next/server';
import { checkDb } from '@/utils/db/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await checkDb();
    return NextResponse.json({ ok: true, db: 'connected', pipe: 'pass-through' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, db: 'disconnected', pipe: 'pass-through', error: message },
      { status: 503 }
    );
  }
}
