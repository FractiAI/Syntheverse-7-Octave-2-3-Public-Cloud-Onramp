/**
 * IntegrityValidator - Frontend validation of atomic payloads
 * THALET Protocol Compliant
 * 
 * Validates bit-by-bit equality between received JSON and rendered object.
 * Throws exception on any mutation, recomputation, or divergence.
 * 
 * The UI's sole obligation is to validate and display.
 * NO calculation, correction, normalization, or interpretation permitted.
 */

import crypto from 'crypto';
import type { AtomicScore } from '@/utils/scoring/AtomicScorer';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  hash_match: boolean;
}

export class IntegrityValidator {
  /**
   * Validate atomic score payload integrity
   * Throws exception if validation fails (FAIL-HARD)
   * 
   * @param payload - Atomic score payload from backend
   * @returns Validation result (if valid)
   * @throws Error if validation fails
   */
  static validateAtomicScore(payload: any): ValidationResult {
    const errors: string[] = [];

    // 1. Check required fields
    if (typeof payload.final !== 'number') {
      errors.push('THALET_VIOLATION: Missing or invalid sovereign field "final" (must be number)');
    }

    if (!payload.execution_context) {
      errors.push('THALET_VIOLATION: Missing execution_context object');
    } else {
      // Validate execution context completeness
      const ctx = payload.execution_context;
      
      if (!ctx.toggles || typeof ctx.toggles !== 'object') {
        errors.push('THALET_VIOLATION: Missing or invalid toggles in execution_context');
      } else {
        // Validate toggle structure
        const requiredToggles = ['overlap_on', 'seed_on', 'edge_on', 'metal_policy_on'];
        for (const toggle of requiredToggles) {
          if (typeof ctx.toggles[toggle] !== 'boolean') {
            errors.push(`THALET_VIOLATION: Missing or invalid toggle "${toggle}" (must be boolean)`);
          }
        }
      }
      
      if (!ctx.seed || typeof ctx.seed !== 'string') {
        errors.push('THALET_VIOLATION: Missing or invalid seed in execution_context (must be string)');
      }
      
      if (!ctx.timestamp_utc || typeof ctx.timestamp_utc !== 'string') {
        errors.push('THALET_VIOLATION: Missing or invalid timestamp_utc in execution_context (must be string)');
      } else {
        // Validate ISO 8601 format
        const timestamp = new Date(ctx.timestamp_utc);
        if (isNaN(timestamp.getTime())) {
          errors.push('THALET_VIOLATION: Invalid timestamp_utc format (must be ISO 8601)');
        }
      }

      if (!ctx.pipeline_version) {
        errors.push('THALET_VIOLATION: Missing pipeline_version in execution_context');
      }

      if (!ctx.operator_id) {
        errors.push('THALET_VIOLATION: Missing operator_id in execution_context');
      }
    }

    if (!payload.integrity_hash || typeof payload.integrity_hash !== 'string') {
      errors.push('THALET_VIOLATION: Missing or invalid integrity_hash (must be string)');
    }

    if (!payload.trace || typeof payload.trace !== 'object') {
      errors.push('THALET_VIOLATION: Missing or invalid trace object');
    }

    // 2. Validate hash integrity (bit-by-bit equality)
    // CRITICAL: final_clamped is NOT part of the hash (it's for display only)
    // Backend excludes final_clamped when computing hash, so we must too
    let hashMatch = false;
    if (payload.integrity_hash && errors.length === 0) {
      try {
        // Exclude integrity_hash and final_clamped (final_clamped is display-only, not part of hash)
        const { integrity_hash, final_clamped, ...payloadForHash } = payload;
        const deterministicPayload = JSON.stringify(
          payloadForHash,
          Object.keys(payloadForHash).sort()
        );
        const computedHash = crypto
          .createHash('sha256')
          .update(deterministicPayload)
          .digest('hex');
        
        hashMatch = computedHash === integrity_hash;
        
        if (!hashMatch) {
          errors.push(
            `THALET_VIOLATION: Integrity hash mismatch (payload has been mutated). ` +
            `Expected: ${integrity_hash.substring(0, 12)}..., ` +
            `Computed: ${computedHash.substring(0, 12)}...`
          );
        }
      } catch (hashError) {
        errors.push(`THALET_VIOLATION: Failed to compute integrity hash: ${hashError}`);
      }
    }

    // 3. Validate score range [0, 10000]
    if (typeof payload.final === 'number') {
      if (payload.final < 0 || payload.final > 10000) {
        errors.push(
          `THALET_VIOLATION: Final score ${payload.final} outside authorized range [0, 10000]. ` +
          `This should have been blocked by Multi-Level Neutralization Gate.`
        );
      }

      if (!Number.isFinite(payload.final)) {
        errors.push(
          `THALET_VIOLATION: Final score ${payload.final} is not a finite number (NaN or Infinity)`
        );
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      // FAIL-HARD: Throw exception to block rendering
      const errorMessage = [
        '═══════════════════════════════════════════════════════',
        '  THALET PROTOCOL VALIDATION FAILED',
        '═══════════════════════════════════════════════════════',
        '',
        'Data Contract Breach Detected:',
        ...errors.map((e, i) => `  ${i + 1}. ${e}`),
        '',
        'Per THALET Protocol: Rendering blocked.',
        'The UI is prohibited from displaying invalid payloads.',
        '',
        'Action Required: Backend must emit valid atomic payload.',
        '═══════════════════════════════════════════════════════',
      ].join('\n');

      throw new Error(errorMessage);
    }

    return {
      valid: isValid,
      errors,
      hash_match: hashMatch,
    };
  }

  /**
   * Extract display value with validation
   * This is the ONLY method UI components should use to access scores
   * 
   * @param payload - Atomic score payload
   * @returns Validated final score
   * @throws Error if validation fails
   */
  static getValidatedScore(payload: any): number {
    this.validateAtomicScore(payload);
    return payload.final;
  }

  /**
   * Extract execution context with validation
   * 
   * @param payload - Atomic score payload
   * @returns Validated execution context
   * @throws Error if validation fails
   */
  static getExecutionContext(payload: any): AtomicScore['execution_context'] {
    this.validateAtomicScore(payload);
    return payload.execution_context;
  }

  /**
   * Extract trace with validation
   * 
   * @param payload - Atomic score payload
   * @returns Validated trace
   * @throws Error if validation fails
   */
  static getTrace(payload: any): AtomicScore['trace'] {
    this.validateAtomicScore(payload);
    return payload.trace;
  }

  /**
   * Silent validation (does not throw, returns result)
   * Use for non-critical validation or logging purposes
   * 
   * @param payload - Atomic score payload
   * @returns Validation result with errors
   */
  static validateSilent(payload: any): ValidationResult {
    try {
      return this.validateAtomicScore(payload);
    } catch (error) {
      return {
        valid: false,
        errors: [String(error)],
        hash_match: false,
      };
    }
  }

  /**
   * Check if payload is valid without throwing
   * 
   * @param payload - Atomic score payload
   * @returns True if valid, false otherwise
   */
  static isValid(payload: any): boolean {
    try {
      this.validateAtomicScore(payload);
      return true;
    } catch {
      return false;
    }
  }
}

