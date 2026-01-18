/**
 * NSPFRP: Scoring Type Definitions
 * Single source of truth for scoring types used by AtomicScorer
 */

import { BridgeSpec, BridgeSpecValidationResult } from './bridgespec';
import { BMPPrecisionResult } from './gates';

/**
 * Scoring Input Parameters
 */
export interface ScoringInput {
  novelty: number;
  density: number;
  coherence: number;
  alignment: number;
  overlap_percent?: number;
  is_seed?: boolean;
  is_edge?: boolean;
  toggles?: {
    seed_on?: boolean;
    seed_enabled?: boolean;
    edge_on?: boolean;
    edge_enabled?: boolean;
    overlap_on?: boolean;
    metal_policy_on?: boolean;
    [key: string]: any;
  };
  seed?: number | null;
  bridgeSpec?: BridgeSpec | null;
}

/**
 * Scoring Execution Context
 */
export interface ScoringExecutionContext {
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
}

/**
 * Atomic Score Type
 * INSTRUMENT GRADE RAW HHF-AI MRI ATOMIC SCORES
 */
export interface AtomicScore {
  final: number;
  execution_context: ScoringExecutionContext;
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

// Re-export types from other modules for convenience
export type { BridgeSpec, BridgeSpecValidationResult } from './bridgespec';
export type { BMPPrecisionResult } from './gates';
