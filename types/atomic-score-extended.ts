/**
 * NSPFRP: Extended AtomicScore Type Definitions
 * Extends existing AtomicScore with precision (n̂) and T-B checks
 * 
 * Based on Marcin's specification:
 * - n̂, epsilon, bubble_class in precision object
 * - T_B results in thalet object
 * - bridgespec_hash in trace
 */

import { AtomicScore } from '@/utils/scoring/AtomicScorer';
import { TBCheckResult } from '@/types/gates';
import { BMPPrecisionResult } from '@/types/gates';

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

