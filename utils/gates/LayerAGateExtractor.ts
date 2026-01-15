/**
 * NSPFRP: Single source of truth for Layer A gate extraction
 * 
 * Layer A Gates:
 * - ΔNovelty gate: Δnovelty = 1 - overlap_max, gate: Δnovelty ≥ Δmin
 * - THALET checks: T-I/T-P/T-N/T-S/T-R/T-C
 * - n̂ gate: minimum n̂ for tier (handled separately)
 */

import { LayerAGateResult, ThaletCheckResult } from '@/types/gates';

/**
 * Extract Layer A gates from submission/evaluation data
 * 
 * @param data Submission or evaluation object
 * @param deltaMin Minimum Δnovelty threshold (default: 0.1)
 * @returns Layer A gate result
 */
export function extractLayerAGates(
  data: any,
  deltaMin: number = 0.1
): LayerAGateResult {
  // Extract overlap_percent from data
  // Priority: atomic_score.trace.overlap_percent > redundancy_overlap_percent > overlap_percent
  const overlapPercent = 
    data?.atomic_score?.trace?.overlap_percent ??
    data?.metadata?.redundancy_overlap_percent ??
    data?.redundancy_overlap_percent ??
    data?.overlap_percent ??
    0;
  
  // Calculate ΔNovelty
  // Δnovelty = 1 - overlap_max
  // Note: overlap_percent is 0-100, so overlap_max = overlap_percent / 100
  const overlapMax = overlapPercent / 100;
  const deltaNovelty = 1 - overlapMax;
  
  // Check if passes ΔNovelty gate
  const deltaNoveltyPasses = deltaNovelty >= deltaMin;
  
  // Extract THALET checks
  // TODO: Implement actual THALET check extraction
  // For now, return placeholder structure
  const thaletChecks: ThaletCheckResult = {
    T_I: data?.thalet?.T_I ?? 'not_checked',
    T_P: data?.thalet?.T_P ?? 'not_checked',
    T_N: data?.thalet?.T_N ?? 'not_checked',
    T_S: data?.thalet?.T_S ?? 'not_checked',
    T_R: data?.thalet?.T_R ?? 'not_checked',
    T_C: data?.thalet?.T_C ?? 'not_checked',
    T_B: data?.thalet?.T_B, // Will be filled by Layer B extractor
    overall: data?.thalet?.overall ?? 'not_checked',
  };
  
  // Determine if Layer A passes
  // Requires: ΔNovelty passes + THALET overall passes
  const layerAPasses = deltaNoveltyPasses && (thaletChecks.overall === 'passed');
  
  return {
    deltaNovelty,
    deltaNoveltyPasses,
    deltaMin,
    thaletChecks,
    layerAPasses,
  };
}

