/**
 * NSPFRP: Single source of truth for BridgeSpec extraction
 * Prevents fractalized BridgeSpec parsing errors
 */

import { BridgeSpec } from '@/types/bridgespec';

/**
 * Extract BridgeSpec from submission data
 * 
 * @param data Submission or evaluation object
 * @returns BridgeSpec or null if not present
 */
export function extractBridgeSpec(data: any): BridgeSpec | null {
  // Try multiple locations where BridgeSpec might be stored
  const bridgeSpec = 
    data?.bridge_spec ??
    data?.bridgeSpec ??
    data?.metadata?.bridge_spec ??
    data?.metadata?.bridgeSpec ??
    data?.evaluation?.bridge_spec ??
    data?.evaluation?.bridgeSpec ??
    null;
  
  if (!bridgeSpec) {
    return null;
  }
  
  // Validate structure (basic check)
  if (!bridgeSpec.bridges || !Array.isArray(bridgeSpec.bridges)) {
    console.warn('[BridgeSpecExtractor] Invalid BridgeSpec structure: missing bridges array');
    return null;
  }
  
  // Return validated BridgeSpec
  return bridgeSpec as BridgeSpec;
}

/**
 * Extract BridgeSpec hash from atomic_score.trace
 * 
 * @param atomicScore Atomic score object
 * @returns BridgeSpec hash or null
 */
export function extractBridgeSpecHash(atomicScore: any): string | null {
  return atomicScore?.trace?.bridgespec_hash ?? null;
}

