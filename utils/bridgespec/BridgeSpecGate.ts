/**
 * NSPFRP: Single source of truth for BridgeSpec gate logic
 * 
 * Official requires: T-B-01..03 all pass (fail-closed)
 * Community can exist without BridgeSpec (Chamber A only)
 */

import { BridgeSpecValidationResult, ChamberClassification } from '@/types/bridgespec';

/**
 * Evaluate BridgeSpec gate (Chamber A vs Chamber B)
 * 
 * @param validation BridgeSpec validation result (null if BridgeSpec missing)
 * @returns Chamber classification and official status
 */
export function evaluateBridgeSpecGate(
  validation: BridgeSpecValidationResult | null
): {
  passes: boolean;
  reason: string;
  classification: ChamberClassification;
  official: boolean; // Requires Chamber B (T-B-01..03 pass)
  community: boolean; // Can exist without BridgeSpec (Chamber A only)
} {
  if (!validation) {
    // No BridgeSpec: Chamber A only (community)
    return {
      passes: false,
      reason: 'BridgeSpec is missing',
      classification: {
        chamberA: true, // PoC artifact exists (meaning/narrative)
        chamberB: false, // No BridgeSpec (no testability)
        official: false, // Official requires Chamber B
        type: 'A',
      },
      official: false,
      community: true, // Community scoring allowed
    };
  }
  
  // Check if T-B-01..03 all pass (fail-closed for official)
  const coreTestsPass = 
    validation.T_B_01 === 'passed' &&
    validation.T_B_02 === 'passed' &&
    validation.T_B_03 === 'passed';
  
  // Determine chamber classification
  const chamberA = true; // Always have Chamber A (PoC artifact)
  const chamberB = coreTestsPass; // Chamber B requires T-B-01..03 pass
  const official = chamberB; // Official requires Chamber B
  const type: ChamberClassification['type'] = chamberB ? 'Both' : 'A';
  
  // Determine reason
  let reason = '';
  if (!coreTestsPass) {
    const failures: string[] = [];
    if (validation.T_B_01 !== 'passed') failures.push('T-B-01 (regime/observables)');
    if (validation.T_B_02 !== 'passed') failures.push('T-B-02 (differential prediction)');
    if (validation.T_B_03 !== 'passed') failures.push('T-B-03 (failure condition)');
    reason = `T-B checks failed: ${failures.join(', ')}`;
  } else if (validation.T_B_04 === 'soft_failed') {
    reason = 'T-B-01..03 passed but T-B-04 soft-failed (degeneracy detected)';
  } else {
    reason = 'All T-B checks passed';
  }
  
  return {
    passes: official,
    reason,
    classification: {
      chamberA,
      chamberB,
      official,
      type,
    },
    official,
    community: true, // Community scoring always allowed
  };
}

