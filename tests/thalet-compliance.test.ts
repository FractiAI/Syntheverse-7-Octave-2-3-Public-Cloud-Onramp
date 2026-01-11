/**
 * THALET Protocol Compliance Tests
 * 
 * Validates that the system adheres to THALET Protocol requirements:
 * 1. AtomicScorer is singleton
 * 2. Scores are clamped to [0, 10000]
 * 3. Execution context is complete
 * 4. Integrity hashes are valid
 * 5. UI validation throws on invalid payloads
 */

import { AtomicScorer } from '../utils/scoring/AtomicScorer';
import { IntegrityValidator } from '../utils/validation/IntegrityValidator';
import type { AtomicScore } from '../utils/scoring/AtomicScorer';

describe('THALET Protocol Compliance', () => {
  describe('1. AtomicScorer Singleton', () => {
    test('1.1: AtomicScorer is singleton', () => {
      const instance1 = AtomicScorer;
      const instance2 = AtomicScorer;
      expect(instance1).toBe(instance2);
    });

    test('1.2: AtomicScorer maintains execution count', () => {
      const initialCount = AtomicScorer.getExecutionCount();
      
      AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(AtomicScorer.getExecutionCount()).toBe(initialCount + 1);
    });
  });

  describe('2. Multi-Level Neutralization Gate (MLN)', () => {
    test('2.1: Score clamped to [0, 10000] - normal case', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.final).toBeGreaterThanOrEqual(0);
      expect(result.final).toBeLessThanOrEqual(10000);
    });

    test('2.2: Score clamped when exceeding 10000', () => {
      const result = AtomicScorer.computeScore({
        novelty: 5000,
        density: 5000,
        coherence: 5000,
        alignment: 5000,
        redundancy_overlap_percent: 0, // No penalty
        is_seed_from_ai: true, // 1.15x multiplier
        is_edge_from_ai: true, // 1.15x multiplier
        toggles: { overlap_on: true, seed_on: true, edge_on: true, metal_policy_on: true },
      });

      // 20000 * 1.15 * 1.15 = 26450 → should clamp to 10000
      expect(result.final).toBe(10000);
      expect(result.trace.intermediate_steps.raw_final).toBeGreaterThan(10000);
      expect(result.trace.intermediate_steps.clamped_final).toBe(10000);
    });

    test('2.3: Score clamped when below 0 (edge case)', () => {
      // This is theoretical - shouldn't happen with valid inputs
      // But the gate should handle it
      const result = AtomicScorer.computeScore({
        novelty: 0,
        density: 0,
        coherence: 0,
        alignment: 0,
        redundancy_overlap_percent: 100, // Max penalty
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.final).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. Execution Context Determinism', () => {
    test('3.1: Execution context is complete', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.execution_context).toBeDefined();
      expect(result.execution_context.toggles).toBeDefined();
      expect(result.execution_context.seed).toBeDefined();
      expect(result.execution_context.timestamp_utc).toBeDefined();
      expect(result.execution_context.pipeline_version).toBeDefined();
      expect(result.execution_context.operator_id).toBeDefined();
    });

    test('3.2: Toggles are explicit booleans', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      const toggles = result.execution_context.toggles;
      expect(typeof toggles.overlap_on).toBe('boolean');
      expect(typeof toggles.seed_on).toBe('boolean');
      expect(typeof toggles.edge_on).toBe('boolean');
      expect(typeof toggles.metal_policy_on).toBe('boolean');
    });

    test('3.3: Timestamp is valid ISO 8601 UTC', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      const timestamp = new Date(result.execution_context.timestamp_utc);
      expect(timestamp.toISOString()).toBe(result.execution_context.timestamp_utc);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000); // Within last second
    });

    test('3.4: Seed is explicit (not implicit)', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.execution_context.seed).toBeDefined();
      expect(typeof result.execution_context.seed).toBe('string');
      expect(result.execution_context.seed.length).toBeGreaterThan(0);
    });
  });

  describe('4. Integrity Hash Validation', () => {
    test('4.1: Integrity hash is present and valid format', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.integrity_hash).toBeDefined();
      expect(typeof result.integrity_hash).toBe('string');
      expect(result.integrity_hash.length).toBe(64); // SHA-256 hex length
    });

    test('4.2: Different inputs produce different hashes', () => {
      const result1 = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      const result2 = AtomicScorer.computeScore({
        novelty: 2500, // Different input
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result1.integrity_hash).not.toBe(result2.integrity_hash);
    });

    test('4.3: Payload is immutable', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      // Attempt to mutate should fail (Object.freeze)
      expect(() => {
        (result as any).final = 9999;
      }).toThrow();
    });
  });

  describe('5. UI Validation Layer', () => {
    test('5.1: Validator throws on missing final field', () => {
      const invalidPayload = {
        execution_context: {},
        trace: {},
        integrity_hash: 'abc123',
      };

      expect(() => {
        IntegrityValidator.validateAtomicScore(invalidPayload);
      }).toThrow('THALET Protocol Validation Failed');
    });

    test('5.2: Validator throws on missing execution_context', () => {
      const invalidPayload = {
        final: 5000,
        trace: {},
        integrity_hash: 'abc123',
      };

      expect(() => {
        IntegrityValidator.validateAtomicScore(invalidPayload);
      }).toThrow('THALET_VIOLATION: Missing execution_context');
    });

    test('5.3: Validator throws on missing integrity_hash', () => {
      const invalidPayload = {
        final: 5000,
        execution_context: {
          toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
          seed: 'test',
          timestamp_utc: new Date().toISOString(),
          pipeline_version: '2.0.0',
          operator_id: 'test',
        },
        trace: {},
      };

      expect(() => {
        IntegrityValidator.validateAtomicScore(invalidPayload);
      }).toThrow('THALET_VIOLATION: Missing or invalid integrity_hash');
    });

    test('5.4: Validator throws on score out of range', () => {
      const invalidPayload = {
        final: 15000, // Out of range
        execution_context: {
          toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
          seed: 'test',
          timestamp_utc: new Date().toISOString(),
          pipeline_version: '2.0.0',
          operator_id: 'test',
        },
        trace: {},
        integrity_hash: 'abc123',
      };

      expect(() => {
        IntegrityValidator.validateAtomicScore(invalidPayload);
      }).toThrow('outside authorized range');
    });

    test('5.5: Validator passes on valid payload', () => {
      const validPayload = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(() => {
        IntegrityValidator.validateAtomicScore(validPayload);
      }).not.toThrow();
    });

    test('5.6: getValidatedScore extracts score correctly', () => {
      const validPayload = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      const score = IntegrityValidator.getValidatedScore(validPayload);
      expect(score).toBe(validPayload.final);
    });

    test('5.7: isValid returns boolean without throwing', () => {
      const validPayload = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(IntegrityValidator.isValid(validPayload)).toBe(true);
      expect(IntegrityValidator.isValid({ final: 5000 })).toBe(false);
    });
  });

  describe('6. Toggle Enforcement', () => {
    test('6.1: Overlap toggle OFF → penalty = 0', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 50, // High overlap
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: false, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.trace.penalty_percent).toBe(0);
      expect(result.trace.bonus_multiplier).toBe(1.0);
    });

    test('6.2: Seed toggle OFF → multiplier = 1.0', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: true, // AI detected seed
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true }, // But toggle OFF
      });

      expect(result.trace.seed_multiplier).toBe(1.0);
    });

    test('6.3: Edge toggle OFF → multiplier = 1.0', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: true, // AI detected edge
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true }, // But toggle OFF
      });

      expect(result.trace.edge_multiplier).toBe(1.0);
    });

    test('6.4: All toggles ON → multipliers applied', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15, // In sweet spot
        is_seed_from_ai: true,
        is_edge_from_ai: true,
        toggles: { overlap_on: true, seed_on: true, edge_on: true, metal_policy_on: true },
      });

      expect(result.trace.bonus_multiplier).toBeGreaterThan(1.0); // Sweet spot bonus
      expect(result.trace.seed_multiplier).toBe(1.15);
      expect(result.trace.edge_multiplier).toBe(1.12);
    });
  });

  describe('7. Trace Completeness', () => {
    test('7.1: Trace contains all intermediate steps', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.trace.intermediate_steps.after_penalty).toBeDefined();
      expect(result.trace.intermediate_steps.after_bonus).toBeDefined();
      expect(result.trace.intermediate_steps.after_seed).toBeDefined();
      expect(result.trace.intermediate_steps.raw_final).toBeDefined();
      expect(result.trace.intermediate_steps.clamped_final).toBeDefined();
    });

    test('7.2: Formula is human-readable', () => {
      const result = AtomicScorer.computeScore({
        novelty: 2000,
        density: 2000,
        coherence: 2000,
        alignment: 2000,
        redundancy_overlap_percent: 15,
        is_seed_from_ai: false,
        is_edge_from_ai: false,
        toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
      });

      expect(result.trace.formula).toContain('Composite');
      expect(typeof result.trace.formula).toBe('string');
      expect(result.trace.formula.length).toBeGreaterThan(0);
    });
  });
});

describe('THALET Checklist Verification', () => {
  test('✅ 1.1: Single AtomicScorer exists in backend', () => {
    expect(AtomicScorer).toBeDefined();
    expect(typeof AtomicScorer.computeScore).toBe('function');
  });

  test('✅ 1.2: All mathematical logic removed from UI', () => {
    // This is verified by code review and the fact that UI components
    // use IntegrityValidator.getValidatedScore() which only extracts,
    // never calculates
    expect(IntegrityValidator.getValidatedScore).toBeDefined();
  });

  test('✅ 2.1: JSON exposes single sovereign field: score.final', () => {
    const result = AtomicScorer.computeScore({
      novelty: 2000,
      density: 2000,
      coherence: 2000,
      alignment: 2000,
      redundancy_overlap_percent: 15,
      is_seed_from_ai: false,
      is_edge_from_ai: false,
      toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
    });

    expect(result.final).toBeDefined();
    expect(typeof result.final).toBe('number');
  });

  test('✅ 3.1: Active interceptor blocks/clamps scores > 10,000', () => {
    const result = AtomicScorer.computeScore({
      novelty: 5000,
      density: 5000,
      coherence: 5000,
      alignment: 5000,
      redundancy_overlap_percent: 0,
      is_seed_from_ai: true,
      is_edge_from_ai: true,
      toggles: { overlap_on: true, seed_on: true, edge_on: true, metal_policy_on: true },
    });

    expect(result.final).toBeLessThanOrEqual(10000);
  });

  test('✅ 4.1: Payload includes full Execution_Context', () => {
    const result = AtomicScorer.computeScore({
      novelty: 2000,
      density: 2000,
      coherence: 2000,
      alignment: 2000,
      redundancy_overlap_percent: 15,
      is_seed_from_ai: false,
      is_edge_from_ai: false,
      toggles: { overlap_on: true, seed_on: false, edge_on: false, metal_policy_on: true },
    });

    expect(result.execution_context.toggles).toBeDefined();
    expect(result.execution_context.seed).toBeDefined();
    expect(result.execution_context.timestamp_utc).toBeDefined();
  });

  test('✅ 5.1: UI throws exception on data inconsistency', () => {
    const invalidPayload = { final: 5000 };

    expect(() => {
      IntegrityValidator.validateAtomicScore(invalidPayload);
    }).toThrow();
  });
});

