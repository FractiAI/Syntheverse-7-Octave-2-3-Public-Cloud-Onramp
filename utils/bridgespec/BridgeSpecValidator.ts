/**
 * NSPFRP: Single source of truth for BridgeSpec validation
 * 
 * T-B-01..03 are fail-closed for "official" status
 * T-B-04 is soft-fail/penalty (degeneracy detection)
 */

import { BridgeSpec, BridgeSpecValidationResult } from '@/types/bridgespec';

/**
 * Validate BridgeSpec against T-B checks
 * 
 * @param spec BridgeSpec to validate
 * @returns Validation result with T-B-01..04 checks
 */
export function validateBridgeSpec(
  spec: BridgeSpec | null
): BridgeSpecValidationResult {
  if (!spec || !spec.bridges || spec.bridges.length === 0) {
    return {
      valid: false,
      errors: ['BridgeSpec is missing or empty'],
      T_B_01: 'failed',
      T_B_02: 'failed',
      T_B_03: 'failed',
      T_B_04: 'not_checked',
      overall: 'failed',
      testabilityScore: 0,
      degeneracyPenalty: 1.0, // Maximum penalty for missing BridgeSpec
    };
  }
  
  const errors: string[] = [];
  let t_b_01_passed = true;
  let t_b_02_passed = true;
  let t_b_03_passed = true;
  let t_b_04_passed = true;
  let degeneracyPenalty = 0;
  
  // Validate each bridge
  for (const bridge of spec.bridges) {
    // T-B-01: Regime + observables declared (PTB minimum)
    if (!bridge.regime || bridge.regime.trim() === '') {
      t_b_01_passed = false;
      errors.push(`T-B-01 failed: Bridge ${bridge.claim_id || 'unknown'} missing regime`);
    }
    if (!bridge.observables || bridge.observables.length === 0) {
      t_b_01_passed = false;
      errors.push(`T-B-01 failed: Bridge ${bridge.claim_id || 'unknown'} missing observables`);
    }
    
    // T-B-02: Differential prediction is non-tautological
    if (!bridge.differential_prediction || bridge.differential_prediction.trim() === '') {
      t_b_02_passed = false;
      errors.push(`T-B-02 failed: Bridge ${bridge.claim_id || 'unknown'} missing differential_prediction`);
    } else {
      // Check for tautology patterns (basic check)
      const dp = bridge.differential_prediction.toLowerCase();
      if (
        dp.includes('may vary') ||
        dp.includes('could change') ||
        dp.includes('possibly') ||
        dp.length < 10 // Too short to be meaningful
      ) {
        t_b_02_passed = false;
        errors.push(`T-B-02 failed: Bridge ${bridge.claim_id || 'unknown'} differential_prediction appears tautological`);
      }
    }
    
    // T-B-03: Explicit failure condition (falsifiable)
    if (!bridge.failure_condition || bridge.failure_condition.trim() === '') {
      t_b_03_passed = false;
      errors.push(`T-B-03 failed: Bridge ${bridge.claim_id || 'unknown'} missing failure_condition`);
    } else {
      // Check for falsifiability patterns (basic check)
      const fc = bridge.failure_condition.toLowerCase();
      if (
        fc.includes('cannot be falsified') ||
        fc.includes('unfalsifiable') ||
        fc.length < 10 // Too short to be meaningful
      ) {
        t_b_03_passed = false;
        errors.push(`T-B-03 failed: Bridge ${bridge.claim_id || 'unknown'} failure_condition appears unfalsifiable`);
      }
    }
    
    // T-B-04: Degeneracy checks (soft-fail/penalty)
    // Check for moving goalposts, too many free parameters, semantic slack
    let bridgeDegeneracy = 0;
    
    // Too many free parameters (floor_constraints should limit them)
    if (!bridge.floor_constraints || bridge.floor_constraints.length === 0) {
      bridgeDegeneracy += 0.2; // Penalty for no floor constraints
    }
    
    // Semantic slack (check for vague terms)
    const vagueTerms = ['some', 'many', 'various', 'several', 'often', 'usually'];
    const allText = `${bridge.differential_prediction} ${bridge.failure_condition}`.toLowerCase();
    const vagueCount = vagueTerms.filter(term => allText.includes(term)).length;
    if (vagueCount > 2) {
      bridgeDegeneracy += 0.1 * vagueCount;
    }
    
    // Moving goalposts (check for conditional falsifiers)
    if (bridge.failure_condition.includes('unless') || bridge.failure_condition.includes('except')) {
      bridgeDegeneracy += 0.3;
    }
    
    degeneracyPenalty = Math.max(degeneracyPenalty, bridgeDegeneracy);
    if (bridgeDegeneracy > 0.3) {
      t_b_04_passed = false;
      errors.push(`T-B-04 soft-fail: Bridge ${bridge.claim_id || 'unknown'} shows degeneracy indicators`);
    }
  }
  
  // Determine overall status
  // T-B-01..03 must all pass for overall "passed"
  // T-B-04 failure is soft-fail (doesn't block passing, but adds penalty)
  let overall: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
  if (t_b_01_passed && t_b_02_passed && t_b_03_passed) {
    if (t_b_04_passed) {
      overall = 'passed';
    } else {
      overall = 'soft_failed'; // Passes core tests but has degeneracy
    }
  } else {
    overall = 'failed';
  }
  
  // Calculate testability score (0-1)
  // Based on how many checks pass
  let testabilityScore = 0;
  if (t_b_01_passed) testabilityScore += 0.3;
  if (t_b_02_passed) testabilityScore += 0.3;
  if (t_b_03_passed) testabilityScore += 0.3;
  if (t_b_04_passed) testabilityScore += 0.1;
  testabilityScore = Math.max(0, Math.min(1, testabilityScore - degeneracyPenalty));
  
  return {
    valid: overall !== 'failed',
    errors,
    T_B_01: t_b_01_passed ? 'passed' : 'failed',
    T_B_02: t_b_02_passed ? 'passed' : 'failed',
    T_B_03: t_b_03_passed ? 'passed' : 'failed',
    T_B_04: t_b_04_passed ? 'passed' : degeneracyPenalty > 0.3 ? 'soft_failed' : 'passed',
    overall,
    testabilityScore,
    degeneracyPenalty: Math.max(0, Math.min(1, degeneracyPenalty)),
  };
}

