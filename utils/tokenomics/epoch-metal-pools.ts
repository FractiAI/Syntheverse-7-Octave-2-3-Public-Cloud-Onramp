import { db } from '@/utils/db/db'
import { allocationsTable, epochMetalBalancesTable, tokenomicsTable } from '@/utils/db/schema'
import { and, eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export type EpochType = 'founder' | 'pioneer' | 'community' | 'ecosystem'
export type MetalType = 'gold' | 'silver' | 'copper'

export const EPOCH_ORDER: EpochType[] = ['founder', 'pioneer', 'community', 'ecosystem']

export function getNextEpoch(epoch: EpochType): EpochType | null {
  const idx = EPOCH_ORDER.indexOf(epoch)
  if (idx < 0) return 'pioneer'
  const next = EPOCH_ORDER[idx + 1]
  return next || null
}

// Canonical per-epoch per-metal distribution amounts (should match migration seed).
const ORIGINAL_EPOCH_METAL_DISTRIBUTIONS: Record<EpochType, Record<MetalType, number>> = {
  founder: { gold: 22_500_000_000_000, silver: 11_250_000_000_000, copper: 11_250_000_000_000 },
  pioneer: { gold: 11_250_000_000_000, silver: 5_625_000_000_000, copper: 5_625_000_000_000 },
  community: { gold: 5_625_000_000_000, silver: 2_812_500_000_000, copper: 2_812_500_000_000 },
  ecosystem: { gold: 5_625_000_000_000, silver: 2_812_500_000_000, copper: 2_812_500_000_000 },
}

export async function reconcileEpochMetalPool(epoch: EpochType, metal: MetalType) {
  try {
    const rows = await db
      .select()
      .from(epochMetalBalancesTable)
      .where(and(eq(epochMetalBalancesTable.epoch, epoch), eq(epochMetalBalancesTable.metal, metal)))
      .limit(1)

    if (!rows.length) return null
    const row: any = rows[0]

    const distributionAmountDb = Number(row.distribution_amount || 0)
    const distributionAmount =
      distributionAmountDb > 0 ? distributionAmountDb : ORIGINAL_EPOCH_METAL_DISTRIBUTIONS[epoch][metal]

    // Sum allocations already made from this epoch+metal.
    const allocs = await db
      .select({ reward: allocationsTable.reward })
      .from(allocationsTable)
      .where(and(eq(allocationsTable.epoch, epoch), eq(allocationsTable.metal, metal)))

    const allocated = allocs.reduce((sum, a) => sum + Number(a.reward || 0), 0)
    const computedBalance = Math.max(0, distributionAmount - allocated)

    const currentBalance = Number(row.balance || 0)
    const needsRepair =
      currentBalance !== computedBalance ||
      distributionAmountDb !== distributionAmount

    if (needsRepair) {
      await db
        .update(epochMetalBalancesTable)
        .set({
          balance: computedBalance.toString(),
          distribution_amount: distributionAmount.toString(),
          updated_at: new Date(),
        } as any)
        .where(eq(epochMetalBalancesTable.id, row.id))

      debug('EpochMetalPools', 'Reconciled epoch metal pool', {
        epoch,
        metal,
        distributionAmountDb,
        distributionAmount,
        allocated,
        balanceBefore: currentBalance,
        balanceAfter: computedBalance,
      })
    }

    return {
      id: row.id as string,
      epoch,
      metal,
      balance: computedBalance,
      distribution_amount: distributionAmount,
    }
  } catch (err) {
    debugError('EpochMetalPools', 'Failed to reconcile epoch metal pool', { epoch, metal, err })
    return null
  }
}

export async function pickEpochForMetalWithBalance(
  metal: MetalType,
  required: number,
  startEpoch: EpochType = 'founder',
  fullyAllocatedThreshold = 1000
) {
  const startIdx = Math.max(0, EPOCH_ORDER.indexOf(startEpoch))

  for (let i = startIdx; i < EPOCH_ORDER.length; i++) {
    const epoch = EPOCH_ORDER[i]
    // Reconcile before using, so we don't falsely see 0 balances.
    const pool = await reconcileEpochMetalPool(epoch, metal)
    if (!pool) continue
    if (pool.balance <= fullyAllocatedThreshold) continue
    if (pool.balance >= required) return pool
  }

  // If none can satisfy, return best available after reconciliation (for logging).
  let best: any = null
  for (let i = startIdx; i < EPOCH_ORDER.length; i++) {
    const epoch = EPOCH_ORDER[i]
    const pool = await reconcileEpochMetalPool(epoch, metal)
    if (!pool) continue
    if (!best || pool.balance > best.balance) best = pool
  }
  return best
}

function epochIdx(epoch: EpochType) {
  const idx = EPOCH_ORDER.indexOf(epoch)
  return idx < 0 ? 0 : idx
}

/**
 * Advance global tokenomics.current_epoch forward (never backward).
 * This is used as an override for payment fulfillment: if we allocate from a later epoch,
 * we "open" it globally so the UI/epoch-info reflects the new active epoch.
 */
export async function advanceGlobalEpochTo(targetEpoch: EpochType) {
  try {
    const tokenomics = await db.select().from(tokenomicsTable).where(eq(tokenomicsTable.id, 'main')).limit(1)
    const current = (String(tokenomics[0]?.current_epoch || 'founder').toLowerCase().trim() || 'founder') as EpochType

    if (epochIdx(targetEpoch) <= epochIdx(current)) return { changed: false, from: current, to: current }

    await db
      .update(tokenomicsTable)
      .set({ current_epoch: targetEpoch, updated_at: new Date() })
      .where(eq(tokenomicsTable.id, 'main'))

    debug('EpochMetalPools', 'Advanced global epoch to fulfill allocation', { from: current, to: targetEpoch })
    return { changed: true, from: current, to: targetEpoch }
  } catch (err) {
    debugError('EpochMetalPools', 'Failed to advance global epoch', { targetEpoch, err })
    return { changed: false, from: null, to: null }
  }
}

/**
 * If an allocation fully depletes a metal pool for the currently-open epoch,
 * advance the GLOBAL epoch to the next one.
 *
 * This matches the product requirement: "open the next epoch globally if the current epoch's metal pool
 * is depleted for a specific allocation."
 */
export async function advanceGlobalEpochIfCurrentPoolDepleted(
  epochUsed: EpochType,
  balanceAfter: number,
  fullyAllocatedThreshold = 1000
) {
  try {
    // Only trigger when the pool is effectively depleted.
    if (balanceAfter > fullyAllocatedThreshold) return { changed: false, reason: 'not_depleted' as const }

    const tokenomics = await db.select().from(tokenomicsTable).where(eq(tokenomicsTable.id, 'main')).limit(1)
    const current = (String(tokenomics[0]?.current_epoch || 'founder').toLowerCase().trim() || 'founder') as EpochType

    // Only auto-advance when depleting the *current* epoch's pool.
    if (current !== epochUsed) return { changed: false, reason: 'not_current_epoch' as const, current, epochUsed }

    const next = getNextEpoch(epochUsed)
    if (!next) return { changed: false, reason: 'no_next_epoch' as const, current }

    return await advanceGlobalEpochTo(next)
  } catch (err) {
    debugError('EpochMetalPools', 'Failed to advance global epoch after pool depletion', { epochUsed, balanceAfter, err })
    return { changed: false, reason: 'error' as const }
  }
}


