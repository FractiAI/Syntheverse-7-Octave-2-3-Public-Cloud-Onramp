/**
 * NSPFRP: BridgeSpec Type Definitions
 * Single source of truth for BridgeSpec structure
 * 
 * Based on Marcin's TO (Objective Theory) specification:
 * BridgeSpec = list of "bridges" from Chamber A (meaning) → Chamber B (testability)
 */

/**
 * BridgeSpec: Optional artifact for PoC submissions
 * Required for "official" status, optional for "community" scoring
 */
export interface BridgeSpec {
  bridges: Bridge[];
}

/**
 * Bridge: Single claim's translation from Chamber A to Chamber B
 */
export interface Bridge {
  claim_id: string;
  regime: string; // e.g., "EM/Maxwell", "plasma/MHD", "EFT/QFT", "GR", "cosmology/CMB/BAO"
  observables: string[]; // What is measured
  differential_prediction: string; // What changes vs baseline (must be non-tautological)
  failure_condition: string; // What would falsify it (must be falsifiable)
  floor_constraints: string[]; // Non-negotiable baseline constraints
}

/**
 * BridgeSpec Validation Result
 * T-B-01..03 are fail-closed for "official" status
 * T-B-04 is soft-fail/penalty (degeneracy detection)
 */
export interface BridgeSpecValidationResult {
  valid: boolean;
  errors: string[];
  T_B_01: 'passed' | 'failed' | 'not_checked'; // Regime + observables declared (PTB minimum)
  T_B_02: 'passed' | 'failed' | 'not_checked'; // Differential prediction non-tautological
  T_B_03: 'passed' | 'failed' | 'not_checked'; // Explicit failure condition (falsifiable)
  T_B_04: 'passed' | 'failed' | 'soft_failed' | 'not_checked'; // Degeneracy checks (penalty)
  overall: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
  testabilityScore: number; // 0-1, how testable is this spec?
  degeneracyPenalty: number; // 0-1, penalty from T-B-04 (affects ε/inconsistency)
}

/**
 * Chamber Classification
 */
export type ChamberType = 'A' | 'B' | 'Both';

export interface ChamberClassification {
  chamberA: boolean; // Meaning/narrative present
  chamberB: boolean; // Testability/physics present (PTB-compliant)
  official: boolean; // Requires Chamber B (T-B-01..03 pass)
  type: ChamberType;
}

