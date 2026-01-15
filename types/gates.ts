/**
 * NSPFRP: Gate Type Definitions
 * Single source of truth for gate structures
 * 
 * Layer A: Existing gates (Zero-Delta + THALET + n̂)
 * Layer B: TO Testability Gate (T-B)
 */

/**
 * Layer A Gate Result
 * Existing gates: ΔNovelty, THALET checks, n̂ gate
 */
export interface LayerAGateResult {
  deltaNovelty: number; // Δnovelty = 1 - overlap_max
  deltaNoveltyPasses: boolean; // Δnovelty ≥ Δmin
  deltaMin: number; // Threshold (configurable)
  thaletChecks: ThaletCheckResult;
  layerAPasses: boolean;
}

/**
 * THALET Check Result
 * All THALET categories including new T-B (Testability)
 */
export interface ThaletCheckResult {
  T_I: 'passed' | 'failed' | 'not_checked'; // Integrity
  T_P: 'passed' | 'failed' | 'not_checked'; // Provenance
  T_N: 'passed' | 'failed' | 'not_checked'; // Novelty
  T_S: 'passed' | 'failed' | 'not_checked'; // Stability
  T_R: 'passed' | 'failed' | 'not_checked'; // Replay
  T_C: 'passed' | 'failed' | 'not_checked'; // Coherence
  T_B?: TBCheckResult; // Testability (Bicameral) - NEW
  overall: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
}

/**
 * T-B (Testability/Bicameral) Check Result
 * Layer B gate: BridgeSpec testability validation
 */
export interface TBCheckResult {
  T_B_01: 'passed' | 'failed' | 'not_checked'; // Regime + observables declared (fail-closed)
  T_B_02: 'passed' | 'failed' | 'not_checked'; // Differential prediction non-tautological (fail-closed)
  T_B_03: 'passed' | 'failed' | 'not_checked'; // Explicit failure condition (fail-closed)
  T_B_04: 'passed' | 'failed' | 'soft_failed' | 'not_checked'; // Degeneracy checks (soft-fail/penalty)
  overall: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
  testabilityScore: number; // 0-1
  degeneracyPenalty: number; // 0-1, affects ε/inconsistency
}

/**
 * BMP Precision Result
 * n̂ (Bubble Model of Precision) calculation result
 */
export interface BMPPrecisionResult {
  n_hat: number; // BMP precision index: clamp(-log10(ε), 0, 16)
  epsilon: number; // Inconsistency penalty: max(1 - c + penalty_inconsistency, ε_min)
  coherence: number; // Coherence score (input)
  c: number; // Normalized coherence: coherence_score / 2500
  penalty_inconsistency: number; // Penalty from weak BridgeSpec/degeneracy
  epsilon_min: number; // Minimum epsilon (default: 0.01)
  bubble_class: string; // f"B{round(n_hat,1)}" e.g., "B3.2"
  tier: 'Copper' | 'Silver' | 'Gold' | 'Community'; // Based on n_hat thresholds
  passes: boolean; // Meets minimum for tier
}

/**
 * Combined Gate Result
 * Both Layer A and Layer B results
 */
export interface CombinedGateResult {
  layerA: LayerAGateResult;
  layerB: {
    hasBridgeSpec: boolean;
    validation: any; // BridgeSpecValidationResult
    passes: boolean; // T-B-01..03 all pass (fail-closed)
  };
  precision: BMPPrecisionResult;
  official: boolean; // Requires: Layer A passes + Layer B passes (T-B-01..03)
  community: boolean; // Can exist without BridgeSpec (Chamber A only)
}

