export type Metal = 'gold' | 'silver' | 'copper'

const VALID_METALS: Metal[] = ['gold', 'silver', 'copper']

function normalizeMetal(value: unknown): Metal | null {
  const v = String(value || '').toLowerCase().trim()
  if (v === 'gold' || v === 'silver' || v === 'copper') return v
  return null
}

/**
 * Compute a deterministic "metal assay" (weights) from a metals array.
 *
 * Rules:
 * - Only gold/silver/copper are considered
 * - If duplicates exist, weights are proportional to frequency
 * - If only unique metals are provided, weights are equal
 * - If nothing valid is provided, defaults to { copper: 1 }
 */
export function computeMetalAssay(metals: unknown): Record<Metal, number> {
  const counts: Record<Metal, number> = { gold: 0, silver: 0, copper: 0 }

  const arr = Array.isArray(metals) ? metals : []
  for (const m of arr) {
    const nm = normalizeMetal(m)
    if (nm) counts[nm] += 1
  }

  const total = counts.gold + counts.silver + counts.copper
  if (total <= 0) return { gold: 0, silver: 0, copper: 1 }

  // If all metals are unique (each count is 0 or 1), make weights equal among present metals.
  const present = VALID_METALS.filter((m) => counts[m] > 0)
  const allUnique = present.every((m) => counts[m] === 1)
  if (present.length > 0 && allUnique) {
    const w = 1 / present.length
    return {
      gold: present.includes('gold') ? w : 0,
      silver: present.includes('silver') ? w : 0,
      copper: present.includes('copper') ? w : 0,
    }
  }

  return {
    gold: counts.gold / total,
    silver: counts.silver / total,
    copper: counts.copper / total,
  }
}


