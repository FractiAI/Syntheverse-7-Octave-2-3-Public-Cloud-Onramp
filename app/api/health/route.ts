/**
 * Cloud connectivity — health check.
 * GET /api/health — other systems can call this to verify the gateway is up.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'cloud-connectivity',
    timestamp: new Date().toISOString(),
  });
}
