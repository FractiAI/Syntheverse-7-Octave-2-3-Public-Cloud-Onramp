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
  final_clamped: number; // Integer clamped version for display
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
   * ATOMIC SCORE COMPUTATION
   * This is the ONLY method that produces scores.
   * 
   * All scoring logic is centralized here. UI components are prohibited
   * from performing any calculation, normalization, or interpretation.
   * 
   * @param params - Scoring input parameters
   * @returns Immutable atomic score with integrity hash
   */
  public computeScore(params: ScoringInput): AtomicScore {
    this.executionCount++;

    // Generate execution context FIRST
    const executionContext = this.generateExecutionContext(params.toggles, params.seed);

    // 1. Composite score (immutable sum of dimensions)
    const composite = params.novelty + params.density + params.coherence + params.alignment;

    // 2. Penalty calculation (only if overlap toggle ON)
    let penaltyPercent = 0;
    if (params.toggles.overlap_on && params.redundancy_overlap_percent > 30) {
      const excessOverlap = params.redundancy_overlap_percent - 30;
      const penaltyRange = 98 - 30; // 68%
      penaltyPercent = (excessOverlap / penaltyRange) * 20; // Max 20% penalty
      penaltyPercent = Math.max(0, Math.min(20, penaltyPercent));
    }

    // 3. Bonus calculation (only if overlap toggle ON and in sweet spot)
    let bonusMultiplier = 1.0;
    if (params.toggles.overlap_on) {
      const sweetSpotCenter = 14.2;
      const sweetSpotTolerance = 5.0;
      const distanceFromSweet = Math.abs(params.redundancy_overlap_percent - sweetSpotCenter);
      if (distanceFromSweet <= sweetSpotTolerance) {
        const bonus = (sweetSpotTolerance - distanceFromSweet) / sweetSpotTolerance;
        bonusMultiplier = 1.0 + (bonus * 0.10); // Max 10% bonus
      }
    }

    // 4. Seed multiplier (only if seed toggle ON AND AI detected seed)
    const seedMultiplier = (params.toggles.seed_on && params.is_seed_from_ai) ? 1.15 : 1.0;

    // 5. Edge multiplier (only if edge toggle ON AND AI detected edge)
    const edgeMultiplier = (params.toggles.edge_on && params.is_edge_from_ai) ? 1.12 : 1.0;

    // 6. Compute intermediate scores (step by step)
    const afterPenalty = composite * (1 - penaltyPercent / 100);
    const afterBonus = afterPenalty * bonusMultiplier;
    const afterSeed = afterBonus * seedMultiplier;
    const rawFinal = afterSeed * edgeMultiplier;

    // 7. MULTI-LEVEL NEUTRALIZATION GATE
    // Set failHard=true to block emission instead of clamping
    const finalScore = this.neutralizationGate(rawFinal, false);

    // 8. Build trace for auditability (with full precision for Marek/Simba audit)
    const trace = {
      composite,
      penalty_percent: penaltyPercent,
      penalty_percent_exact: penaltyPercent, // Store exact value for recomputation
      bonus_multiplier: bonusMultiplier,
      bonus_multiplier_exact: bonusMultiplier, // Store exact value for recomputation
      seed_multiplier: seedMultiplier,
      edge_multiplier: edgeMultiplier,
      formula: this.buildFormula(composite, penaltyPercent, bonusMultiplier, seedMultiplier, edgeMultiplier, finalScore),
      intermediate_steps: {
        after_penalty: afterPenalty,
        after_penalty_exact: afterPenalty, // Exact value before any display rounding
        after_bonus: afterBonus,
        after_bonus_exact: afterBonus, // Exact value before any display rounding
        after_seed: afterSeed,
        raw_final: rawFinal,
        clamped_final: finalScore,
      },
    };

    // 9. Build atomic payload (without hash)
    const payloadWithoutHash: Omit<AtomicScore, 'integrity_hash'> = {
      final: finalScore,
      execution_context: executionContext,
      trace,
    };

    // 10. Generate integrity hash for validation
    const integrityHash = this.generateIntegrityHash(payloadWithoutHash);

    // 11. Construct final immutable atomic score
    const atomicScore: AtomicScore = {
      ...payloadWithoutHash,
      final_clamped: Math.round(finalScore), // Integer version for display
      integrity_hash: integrityHash,
    };

    console.log(
      `[AtomicScorer] Execution #${this.executionCount} | ` +
      `Final: ${finalScore} | ` +
      `Hash: ${integrityHash.substring(0, 8)}... | ` +
      `Toggles: O=${params.toggles.overlap_on} S=${params.toggles.seed_on} E=${params.toggles.edge_on}`
    );

    // Return frozen (immutable) object
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

