/**
 * Creator-only endpoint to get blockchain statistics
 *
 * GET /api/creator/blockchain-stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    // Get registered PoCs count
    const registeredCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributionsTable)
      .where(eq(contributionsTable.registered, true));

    return NextResponse.json({
      network: 'Base Mainnet',
      chainId: 8453,
      registeredPocs: Number(registeredCount[0]?.count || 0),
      totalTransactions: Number(registeredCount[0]?.count || 0), // Each registration is a transaction
      contractAddresses: {
        lens:
          process.env.LENS_KERNEL_CONTRACT_ADDRESS || '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
        synth90t:
          process.env.SYNTH90T_CONTRACT_ADDRESS || '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
        vault: process.env.MOTHERLODE_VAULT_ADDRESS || '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
      },
    });
  } catch (error) {
    console.error('Get blockchain stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get blockchain stats',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
