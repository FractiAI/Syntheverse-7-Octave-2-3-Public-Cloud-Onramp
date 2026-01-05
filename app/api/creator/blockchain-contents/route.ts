/**
 * Creator-only endpoint to view Base Mainnet blockchain contents
 *
 * GET /api/creator/blockchain-contents
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

    // Get all on-chain PoCs
    const onChainPocs = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        registration_tx_hash: contributionsTable.registration_tx_hash,
        registration_date: contributionsTable.registration_date,
        metadata: contributionsTable.metadata,
      })
      .from(contributionsTable)
      .where(eq(contributionsTable.registered, true))
      .orderBy(sql`${contributionsTable.registration_date} DESC`);

    // Get contract addresses
    const contractAddresses = {
      lens:
        process.env.LENS_KERNEL_CONTRACT_ADDRESS || '0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8',
      synth90t:
        process.env.SYNTH90T_CONTRACT_ADDRESS || '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
      vault: process.env.MOTHERLODE_VAULT_ADDRESS || '0x3563388d0e1c2d66a004e5e57717dc6d7e568be3',
    };

    // Count total transactions (approximation based on registered PoCs)
    const totalTransactions = onChainPocs.length;

    return NextResponse.json({
      network: 'Base Mainnet',
      chainId: 8453,
      contractAddresses,
      onChainPocs: onChainPocs.map((poc) => ({
        submission_hash: poc.submission_hash,
        title: poc.title,
        contributor: poc.contributor,
        registration_tx_hash: poc.registration_tx_hash,
        registration_date: poc.registration_date?.toISOString(),
        metadata: poc.metadata,
      })),
      totalTransactions,
      registeredPocs: onChainPocs.length,
    });
  } catch (error) {
    console.error('Get blockchain contents error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get blockchain contents',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
