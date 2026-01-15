/**
 * NSPFRP: Single source of truth for n̂ (BMP) calculation and BridgeSpec coupling
 * 
 * Based on Marcin's specification:
 * - c = coherence_score / 2500
 * - ε = max(1 - c + penalty_inconsistency, ε_min)
 * - n_hat = clamp(-log10(ε), 0, 16)
 * - bubble_class = f"B{round(n_hat,1)}"
 * 
 * Mechanism:
 * - Weak BridgeSpec → increases penalty_inconsistency → raises ε → lowers n̂
 * - Strong BridgeSpec → decreases penalty_inconsistency → lowers ε → raises n̂
 * - n̂ becomes "number of stable digits" / "does it hold under pressure?"
 */

import { BridgeSpecValidationResult } from '@/types/bridgespec';
import { BMPPrecisionResult } from '@/types/gates';

/**
 * Calculate BMP Precision (n̂)
 * 
 * @param coherence Coherence score (0-10000)
 * @param penaltyInconsistency Penalty from weak BridgeSpec/degeneracy (0-1)
 * @param epsilonMin Minimum epsilon (default: 0.01)
 * @returns BMP Precision Result
 */
export function calculateBMPPrecision(
  coherence: number,
  penaltyInconsistency: number = 0,
  epsilonMin: number = 0.01
): BMPPrecisionResult {
  // Step 1: Normalize coherence
  // c = coherence_score / 2500
  const c = coherence / 2500;
  
  // Step 2: Calculate epsilon (inconsistency penalty)
  // ε = max(1 - c + penalty_inconsistency, ε_min)
  const epsilon = Math.max(1 - c + penaltyInconsistency, epsilonMin);
  
  // Step 3: Calculate n̂ (BMP precision index)
  // n_hat = clamp(-log10(ε), 0, 16)
  const n_hat = Math.max(0, Math.min(16, -Math.log10(epsilon)));
  
  // Step 4: Calculate bubble_class
  // bubble_class = f"B{round(n_hat,1)}"
  const bubble_class = `B${n_hat.toFixed(1)}`;
  
  // Step 5: Determine tier based on n̂
  // Thresholds (can be adjusted):
  // - Community: n̂ < 3
  // - Copper: 3 ≤ n̂ < 6
  // - Silver: 6 ≤ n̂ < 10
  // - Gold: n̂ ≥ 10
  let tier: 'Copper' | 'Silver' | 'Gold' | 'Community';
  if (n_hat < 3) {
    tier = 'Community';
  } else if (n_hat < 6) {
    tier = 'Copper';
  } else if (n_hat < 10) {
    tier = 'Silver';
  } else {
    tier = 'Gold';
  }
  
  // Step 6: Determine if passes (meets minimum for tier)
  // For official: requires at least Copper tier (n̂ ≥ 3)
  const passes = n_hat >= 3;
  
  return {
    n_hat,
    epsilon,
    coherence,
    c,
    penalty_inconsistency: penaltyInconsistency,
    epsilon_min: epsilonMin,
    bubble_class,
    tier,
    passes,
  };
}

/**
 * Calculate penalty_inconsistency from BridgeSpec validation
 * 
 * @param bridgeSpecValidation BridgeSpec validation result
 * @returns penalty_inconsistency (0-1)
 */
export function calculateInconsistencyPenalty(
  bridgeSpecValidation: BridgeSpecValidationResult | null
): number {
  if (!bridgeSpecValidation) {
    // Missing BridgeSpec: maximum penalty
    return 1.0;
  }
  
  // Base penalty from degeneracy (T-B-04)
  let penalty = bridgeSpecValidation.degeneracyPenalty || 0;
  
  // Additional penalty if T-B-01..03 fail (shouldn't happen for official, but penalize anyway)
  if (bridgeSpecValidation.T_B_01 === 'failed') penalty += 0.3;
  if (bridgeSpecValidation.T_B_02 === 'failed') penalty += 0.3;
  if (bridgeSpecValidation.T_B_03 === 'failed') penalty += 0.3;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, penalty));
}

/**
 * Calculate n̂ with BridgeSpec coupling
 * 
 * @param coherence Coherence score
 * @param bridgeSpecValidation BridgeSpec validation result (null if missing)
 * @param epsilonMin Minimum epsilon
 * @returns BMP Precision Result with coupling applied
 */
export function calculateBMPPrecisionWithBridgeSpec(
  coherence: number,
  bridgeSpecValidation: BridgeSpecValidationResult | null,
  epsilonMin: number = 0.01
): BMPPrecisionResult {
  // Calculate inconsistency penalty from BridgeSpec
  const penaltyInconsistency = calculateInconsistencyPenalty(bridgeSpecValidation);
  
  // Calculate n̂ with penalty applied
  return calculateBMPPrecision(coherence, penaltyInconsistency, epsilonMin);
}

