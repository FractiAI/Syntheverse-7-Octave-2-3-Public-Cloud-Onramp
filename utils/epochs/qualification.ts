/**
 * Epoch-based qualification logic
 *
 * Determines PoC qualification based on pod_score thresholds.
 * Submissions can be qualified for epochs regardless of whether the epoch is open.
 * Epoch openings determine when qualified submissions can go on-chain and receive SYNTH allocations.
 */

import { db } from '@/utils/db/db';
import { tokenomicsTable, epochBalancesTable, epochMetalBalancesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { debug } from '@/utils/debug';

// Epoch qualification thresholds based on composite/pod_score
// Adjusted upward to account for overlap-aware scoring (bonuses/penalties)
export const EPOCH_THRESHOLDS = {
  founder: 8000, // Pod Score >= 8000
  pioneer: 6000, // Pod Score >= 6000
  community: 5000, // Pod Score >= 5000
  ecosystem: 4000, // Pod Score >= 4000
} as const;

// Epoch unlock thresholds (coherence density required to unlock)
export const EPOCH_UNLOCK_THRESHOLDS = {
  founder: 0, // Founder epoch starts immediately
  pioneer: 1_000_000, // 1M coherence density units
  community: 2_000_000, // 2M coherence density units
  ecosystem: 3_000_000, // 3M coherence density units
} as const;

export type EpochType = 'founder' | 'pioneer' | 'community' | 'ecosystem';

export interface OpenEpochInfo {
  current_epoch: EpochType;
  open_epochs: EpochType[];
  qualification_threshold: number;
  total_coherence_density: number;
}

/**
 * Check if an epoch is fully allocated and transition to next epoch if needed
 * Returns the current epoch (may have been updated)
 */
async function checkAndTransitionEpoch(): Promise<EpochType> {
  try {
    // Get tokenomics state
    const tokenomics = await db
      .select()
      .from(tokenomicsTable)
      .where(eq(tokenomicsTable.id, 'main'))
      .limit(1);

    if (!tokenomics || tokenomics.length === 0) {
      return 'founder';
    }

    const currentEpoch = (tokenomics[0]?.current_epoch || 'founder') as EpochType;

    // Prefer per-metal epoch balances if available; fallback to legacy epoch_balances
    let currentEpochBalance = 0;
    try {
      const metalBalances = await db
        .select()
        .from(epochMetalBalancesTable)
        .where(eq(epochMetalBalancesTable.epoch, currentEpoch));
      currentEpochBalance = metalBalances.reduce((sum, b) => sum + Number(b.balance || 0), 0);
    } catch (err) {
      debug(
        'CheckAndTransitionEpoch',
        'epoch_metal_balances not available, falling back to epoch_balances',
        err
      );
      const epochBalances = await db.select().from(epochBalancesTable);
      const epochBalancesMap = new Map<string, number>();
      epochBalances.forEach((eb) => {
        epochBalancesMap.set(eb.epoch, Number(eb.balance || 0));
      });
      currentEpochBalance = epochBalancesMap.get(currentEpoch) || 0;
    }

    // Check if current epoch is fully allocated (sum of metal balances <= threshold)
    const FULLY_ALLOCATED_THRESHOLD = 1000; // Consider fully allocated if balance < 1000 tokens

    if (currentEpoch === 'founder' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
      // Founder epoch is fully allocated, transition to pioneer
      debug('CheckAndTransitionEpoch', 'Founder epoch fully allocated, transitioning to pioneer', {
        founder_balance: currentEpochBalance,
      });

      await db
        .update(tokenomicsTable)
        .set({
          current_epoch: 'pioneer',
          updated_at: new Date(),
        })
        .where(eq(tokenomicsTable.id, 'main'));

      return 'pioneer';
    } else if (currentEpoch === 'pioneer' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
      // Pioneer epoch is fully allocated, transition to community
      debug(
        'CheckAndTransitionEpoch',
        'Pioneer epoch fully allocated, transitioning to community',
        {
          pioneer_balance: currentEpochBalance,
        }
      );

      await db
        .update(tokenomicsTable)
        .set({
          current_epoch: 'community',
          updated_at: new Date(),
        })
        .where(eq(tokenomicsTable.id, 'main'));

      return 'community';
    } else if (currentEpoch === 'community' && currentEpochBalance <= FULLY_ALLOCATED_THRESHOLD) {
      // Community epoch is fully allocated, transition to ecosystem
      debug(
        'CheckAndTransitionEpoch',
        'Community epoch fully allocated, transitioning to ecosystem',
        {
          community_balance: currentEpochBalance,
        }
      );

      await db
        .update(tokenomicsTable)
        .set({
          current_epoch: 'ecosystem',
          updated_at: new Date(),
        })
        .where(eq(tokenomicsTable.id, 'main'));

      return 'ecosystem';
    }

    return currentEpoch;
  } catch (error) {
    debug('CheckAndTransitionEpoch', 'Error checking epoch transition', error);
    return 'founder';
  }
}

/**
 * Get current open epochs and qualification threshold
 */
export async function getOpenEpochInfo(): Promise<OpenEpochInfo> {
  try {
    // Check and transition epoch if needed (e.g., founder fully allocated)
    const currentEpoch = await checkAndTransitionEpoch();

    // Calculate total coherence density (sum of all coherence + density from contributions)
    // For now, we'll use a placeholder - in production this should be calculated from contributions
    const totalCoherenceDensity = 0; // TODO: Calculate from contributions metadata

    // Determine which epochs are open based on current epoch
    // All epochs up to and including current epoch are open
    const openEpochs: EpochType[] = ['founder'];

    if (
      currentEpoch === 'pioneer' ||
      currentEpoch === 'community' ||
      currentEpoch === 'ecosystem'
    ) {
      openEpochs.push('pioneer');
    }
    if (currentEpoch === 'community' || currentEpoch === 'ecosystem') {
      openEpochs.push('community');
    }
    if (currentEpoch === 'ecosystem') {
      openEpochs.push('ecosystem');
    }

    // Get qualification threshold based on current epoch
    const qualificationThreshold = EPOCH_THRESHOLDS[currentEpoch];

    debug('GetOpenEpochInfo', 'Open epoch info retrieved', {
      current_epoch: currentEpoch,
      open_epochs: openEpochs,
      qualification_threshold: qualificationThreshold,
      total_coherence_density: totalCoherenceDensity,
    });

    return {
      current_epoch: currentEpoch,
      open_epochs: openEpochs,
      qualification_threshold: qualificationThreshold,
      total_coherence_density: totalCoherenceDensity,
    };
  } catch (error) {
    debug('GetOpenEpochInfo', 'Error getting epoch info, using defaults', error);
    // Return default (founder epoch)
    return {
      current_epoch: 'founder',
      open_epochs: ['founder'],
      qualification_threshold: EPOCH_THRESHOLDS.founder,
      total_coherence_density: 0,
    };
  }
}

/**
 * Determine which epoch a PoC qualifies for based on composite/pod_score
 */
export function qualifyEpoch(pod_score: number): EpochType {
  if (pod_score >= EPOCH_THRESHOLDS.founder) {
    return 'founder';
  } else if (pod_score >= EPOCH_THRESHOLDS.pioneer) {
    return 'pioneer';
  } else if (pod_score >= EPOCH_THRESHOLDS.community) {
    return 'community';
  } else if (pod_score >= EPOCH_THRESHOLDS.ecosystem) {
    return 'ecosystem';
  } else {
    // Below ecosystem threshold - return ecosystem as fallback
    return 'ecosystem';
  }
}

/**
 * Check if a PoC qualifies for any epoch based on pod_score
 *
 * Qualification is based on pod_score thresholds (regardless of epoch open status):
 * - Founder: pod_score >= 8000
 * - Pioneer: pod_score >= 6000
 * - Community: pod_score >= 5000
 * - Ecosystem: pod_score >= 4000
 *
 * Note: Submissions can be qualified for epochs even when closed.
 * Epoch openings determine when qualified submissions can go on-chain and receive SYNTH allocations.
 *
 * @param pod_score - Total PoC score (0-10000) - used for epoch qualification
 * @param density - Density score (0-2500) - not used for qualification, kept for backward compatibility
 * @returns true if PoC qualifies for any epoch based on pod_score
 */
export async function isQualifiedForEpoch(
  pod_score: number,
  density: number
): Promise<boolean> {
  // Check if pod_score meets the minimum threshold (ecosystem)
  const meetsMinimumThreshold = pod_score >= EPOCH_THRESHOLDS.ecosystem;

  debug('IsQualifiedForEpoch', 'Qualification check (epoch open status not required)', {
    pod_score,
    density,
    minimum_threshold: EPOCH_THRESHOLDS.ecosystem,
    meets_minimum_threshold: meetsMinimumThreshold,
    qualified_epoch: qualifyEpoch(pod_score),
  });

  return meetsMinimumThreshold;
}

/**
 * Check if a qualified epoch is currently open
 *
 * @param qualifiedEpoch - The epoch the submission qualifies for
 * @returns true if the qualified epoch is currently open
 */
export async function isEpochOpen(qualifiedEpoch: EpochType): Promise<boolean> {
  const epochInfo = await getOpenEpochInfo();
  const isOpen = epochInfo.open_epochs.includes(qualifiedEpoch);

  debug('IsEpochOpen', `Checking if ${qualifiedEpoch} epoch is open`, {
    qualified_epoch: qualifiedEpoch,
    open_epochs: epochInfo.open_epochs,
    is_open: isOpen,
  });

  return isOpen;
}

/**
 * @deprecated Use isQualifiedForEpoch() instead. This function is kept for backward compatibility.
 * Check if a PoC qualifies for the current open epoch
 */
export async function isQualifiedForOpenEpoch(
  pod_score: number,
  density: number
): Promise<boolean> {
  // Delegate to new function - qualification no longer depends on epoch being open
  return isQualifiedForEpoch(pod_score, density);
}
