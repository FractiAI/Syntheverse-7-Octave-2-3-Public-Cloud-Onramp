/**
 * AtomicScorer - Single Source of Truth for PoC Scoring
 * THALET Protocol Compliant
 * 
 * This is the ONLY place where scoring computation occurs.
 * All UI components are prohibited from score calculation.
 * 
 * Implements:
 * - Atomic Data Sovereignty
 * - Multi-Level Neutralization Gating (MLN)
 * - Execution Context Determinism
 * - Immutable Payload Generation
 */

import crypto from 'crypto';

export interface ExecutionContext {
  toggles: {
    overlap_on: boolean;
    seed_on: boolean;
    edge_on: boolean;
    metal_policy_on: boolean;
  };
  seed: string; // Explicit entropy seed
  timestamp_utc: string; // ISO 8601 UTC
  pipeline_version: string;
  operator_id: string;
}

export interface AtomicScore {
  final: number; // [0, 10000] - SOVEREIGN FIELD (full precision)
  final_clamped?: number; // Optional: Integer clamped version for display (not part of integrity hash)
  execution_context: ExecutionContext;
  trace: {
    composite: number;
    penalty_percent: number; // Full precision
    penalty_percent_exact: number; // Exact value for recomputation (Marek/Simba audit requirement)
    bonus_multiplier: number; // Full precision
    bonus_multiplier_exact: number; // Exact value for recomputation
    seed_multiplier: number;
    edge_multiplier: number;
    formula: string;
    intermediate_steps: {
      after_penalty: number; // Full precision
      after_penalty_exact: number; // Exact value
      after_bonus: number; // Full precision
      after_bonus_exact: number; // Exact value
      after_seed: number;
      raw_final: number; // Full precision before clamp
      clamped_final: number; // Integer after clamp
    };
  };
  integrity_hash: string; // SHA-256 of deterministic payload
}

export interface ScoringInput {
  novelty: number;
  density: number;
  coherence: number;
  alignment: number;
  redundancy_overlap_percent: number;
  is_seed_from_ai: boolean;
  is_edge_from_ai: boolean;
  toggles: ExecutionContext['toggles'];
  seed?: string;
}

class AtomicScorerSingleton {
  private static instance: AtomicScorerSingleton;
  private executionCount: number = 0;

  private constructor() {
    // Enforce singleton pattern - private constructor
    console.log('[AtomicScorer] Singleton initialized - THALET Protocol Active');
  }

  public static getInstance(): AtomicScorerSingleton {
    if (!AtomicScorerSingleton.instance) {
      AtomicScorerSingleton.instance = new AtomicScorerSingleton();
    }
    return AtomicScorerSingleton.instance;
  }

  /**
   * Multi-Level Neutralization Gate (MLN)
   * Enforces [0, 10000] range with fail-hard option
   * 
   * @param score - Computed score to validate
   * @param failHard - If true, throws exception instead of clamping
   */
  private neutralizationGate(score: number, failHard: boolean = false): number {
    if (score < 0 || score > 10000) {
      const violation = `Score ${score} outside authorized range [0, 10000]`;

      if (failHard) {
        throw new Error(
          `THALET_VIOLATION: ${violation}. ` +
          `Emission blocked per Multi-Level Neutralization Gating.`
        );
      }

      // Hard clamp if fail-hard disabled
      console.error(`[THALET_WARNING] ${violation}. Applying hard clamp.`);
      return Math.max(0, Math.min(10000, score));
    }
    return score;
  }

  /**
   * Generate deterministic execution context
   */
  private generateExecutionContext(
    toggles: ExecutionContext['toggles'],
    seed?: string
  ): ExecutionContext {
    return {
      toggles,
      seed: seed || crypto.randomUUID(), // Explicit seed, never implicit
      timestamp_utc: new Date().toISOString(),
      pipeline_version: '2.0.0-thalet',
      operator_id: process.env.OPERATOR_ID || 'syntheverse-primary',
    };
  }

  /**
   * Generate integrity hash for payload validation
   * Uses SHA-256 for bit-by-bit equality verification
   */
  private generateIntegrityHash(payload: Omit<AtomicScore, 'integrity_hash'>): string {
    // Sort keys for deterministic serialization
    const deterministicPayload = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(deterministicPayload).digest('hex');
  }

  /**
   * Build human-readable formula string
   */
  private buildFormula(
    composite: number,
    penalty: number,
    bonus: number,
    seed: number,
    edge: number,
    final: number
  ): string {
    const parts: string[] = [`Composite=${composite}`];

    if (penalty > 0) {
      parts.push(`Penalty=${penalty.toFixed(2)}%`);
    }
    if (bonus !== 1.0) {
      parts.push(`Bonus=${bonus.toFixed(3)}×`);
    }
    if (seed !== 1.0) {
      parts.push(`Seed=${seed.toFixed(2)}×`);
    }
    if (edge !== 1.0) {
      parts.push(`Edge=${edge.toFixed(2)}×`);
    }

    return `${parts.join(' → ')} = ${final.toFixed(2)}`;
  }

  /**
   * ATOMIC SCORE COMPUTATION: INSTRUMENT GRADE RAW
   * 
   * Returns ONLY the raw HHF-AI MRI sum of novelty, density, coherence, and alignment.
   * NO bonuses, NO penalties, NO multipliers.
   */
  public computeScore(params: ScoringInput): AtomicScore {
    this.executionCount++;

    // Generate execution context
    const executionContext = this.generateExecutionContext(params.toggles, params.seed);

    // RAW SUMMATION (The "No Nothing" logic)
    const composite = params.novelty + params.density + params.coherence + params.alignment;
    const rawFinal = composite;

    // TRINARY NEUTRALIZATION GATE (Range protection only)
    const finalScore = this.neutralizationGate(rawFinal, false);

    // Build trace for auditability (Raw metrics only)
    const trace = {
      composite,
      penalty_percent: 0,
      penalty_percent_exact: 0,
      bonus_multiplier: 1.0,
      bonus_multiplier_exact: 1.0,
      seed_multiplier: 1.0,
      edge_multiplier: 1.0,
      formula: `(${params.novelty} + ${params.density} + ${params.coherence} + ${params.alignment}) = ${finalScore}`,
      intermediate_steps: {
        after_penalty: composite,
        after_penalty_exact: composite,
        after_bonus: composite,
        after_bonus_exact: composite,
        after_seed: composite,
        raw_final: rawFinal,
        clamped_final: finalScore,
      },
    };

    // Build atomic payload
    const payloadWithoutHash: Omit<AtomicScore, 'integrity_hash'> = {
      final: finalScore,
      execution_context: executionContext,
      trace,
    };

    // Generate integrity hash
    const integrityHash = this.generateIntegrityHash(payloadWithoutHash);

    // Construct final immutable atomic score
    const atomicScore: AtomicScore = {
      ...payloadWithoutHash,
      final_clamped: Math.round(finalScore),
      integrity_hash: integrityHash,
    };

    console.log(
      `[AtomicScorer] RAW Execution #${this.executionCount} | ` +
      `Final: ${finalScore} | ` +
      `Hash: ${integrityHash.substring(0, 8)}...`
    );

    return Object.freeze(atomicScore) as AtomicScore;
  }

  /**
   * Get execution count for monitoring
   */
  public getExecutionCount(): number {
    return this.executionCount;
  }

  /**
   * Reset execution count (for testing only)
   */
  public resetExecutionCount(): void {
    this.executionCount = 0;
  }
}

// Export singleton instance (not class)
export const AtomicScorer = AtomicScorerSingleton.getInstance();

