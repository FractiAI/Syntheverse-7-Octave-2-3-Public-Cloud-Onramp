/**
 * NSPFRP: Extended AtomicScore Type Definitions
 * Extends existing AtomicScore with precision (n̂) and T-B checks
 * 
 * Based on Marcin's specification:
 * - n̂, epsilon, bubble_class in precision object
 * - T_B results in thalet object
 * - bridgespec_hash in trace
 */

import { TBCheckResult } from '@/types/gates';
import { BMPPrecisionResult } from '@/types/gates';

// AtomicScore type definition (extracted from AtomicScorer.computeScore return type)
// This matches the structure returned by AtomicScorer.getInstance().computeScore()
export interface AtomicScore {
  final: number;
  execution_context: {
    timestamp_utc: string;
    pipeline_version: string;
    execution_id: string;
    config_id: string;
    sandbox_id: string | null;
    toggles: {
      seed_enabled?: boolean;
      edge_enabled?: boolean;
      [key: string]: any;
    };
    seed: number | string | null;
  };
  trace: {
    composite: number;
    penalty_percent: number;
    penalty_percent_exact: number;
    bonus_multiplier: number;
    bonus_multiplier_exact: number;
    seed_multiplier: number;
    edge_multiplier: number;
    formula: string;
    intermediate_steps: {
      after_penalty: number;
      after_penalty_exact: number;
      after_bonus: number;
      after_bonus_exact: number;
      after_seed: number;
      raw_final: number;
      clamped_final: number;
    };
    precision?: {
      n_hat: number;
      bubble_class: string;
      epsilon: number;
      coherence: number;
      c: number;
      penalty_inconsistency: number;
      tier: 'Copper' | 'Silver' | 'Gold' | 'Community';
    };
    thalet?: {
      T_B?: {
        T_B_01: any;
        T_B_02: any;
        T_B_03: any;
        T_B_04: any;
        overall: any;
        testabilityScore: any;
        degeneracyPenalty: any;
      };
    };
    bridgespec_hash?: string;
  };
  integrity_hash: string;
}

/**
 * Extended AtomicScore
 * Adds precision and T-B checks to trace
 */
export interface ExtendedAtomicScore extends Omit<AtomicScore, 'trace'> {
  trace: AtomicScore['trace'] & {
    // Existing trace fields remain unchanged
    
    // NEW: Precision/BMP fields
    precision?: {
      n_hat: number; // BMP precision: clamp(-log10(ε), 0, 16)
      bubble_class: string; // f"B{round(n_hat,1)}" e.g., "B3.2"
      epsilon: number; // Inconsistency penalty: max(1 - c + penalty_inconsistency, ε_min)
      coherence: number; // Input coherence score
      c: number; // Normalized: coherence_score / 2500
      penalty_inconsistency: number; // From weak BridgeSpec/degeneracy
      tier: 'Copper' | 'Silver' | 'Gold' | 'Community';
    };
    
    // NEW: Extended THALET with T-B
    thalet?: {
      T_I?: 'passed' | 'failed' | 'not_checked';
      T_P?: 'passed' | 'failed' | 'not_checked';
      T_N?: 'passed' | 'failed' | 'not_checked';
      T_S?: 'passed' | 'failed' | 'not_checked';
      T_R?: 'passed' | 'failed' | 'not_checked';
      T_C?: 'passed' | 'failed' | 'not_checked';
      T_B?: TBCheckResult; // NEW: Testability checks
      overall?: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
    };
    
    // NEW: BridgeSpec hash pointer
    bridgespec_hash?: string; // SHA-256 hash of BridgeSpec JSON
  };
}

/**
 * ScanReport Extensions (for UI/API responses)
 */
export interface ScanReportExtensions {
  precision: {
    n_hat: number;
    bubble_class: string;
    epsilon: number;
  };
  thalet: {
    // ... existing THALET fields ...
    T_B: {
      passed: boolean;
      failed: boolean;
      soft_failed: boolean;
    };
  };
}

