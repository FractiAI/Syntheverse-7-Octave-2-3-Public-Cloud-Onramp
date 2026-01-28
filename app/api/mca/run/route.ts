/**
 * MCA Run API — Metabolize Crystallize Animate All
 *
 * GET /api/mca/run — Runs the full MCA cycle and returns phase results.
 * NSPFRNP protocol: protocols/METABOLIZE_CRYSTALIZE_ANIMATE_ALL.md
 */

import { NextResponse } from 'next/server';
import { runMCAAll } from '@/utils/mca/run-mca-all';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await runMCAAll();
    return NextResponse.json({
      success: result.success,
      ready: result.ready,
      message: result.message,
      timestamp: result.timestamp,
      phases: result.phases,
    });
  } catch (error) {
    console.error('[MCA Run] Error:', error);
    return NextResponse.json(
      {
        success: false,
        ready: false,
        message: 'MCA run failed.',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
