/**
 * Off-Process On-Chain Anchoring
 * 
 * Intentional separation of octaves:
 * - Main process: Octave 5 (Protocol Catalog, Natural Systems Protocol)
 * - On-chain anchoring: Octave 2 (Base Mainnet Shell)
 * 
 * On-chain anchoring is done OFF-PROCESS to maintain octave separation
 * This ensures clean architectural boundaries and proper shell nesting
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

export interface OffProcessAnchoringRequest {
  submissionHash: string;
  contributor: string;
  metadata: {
    novelty?: number;
    density?: number;
    coherence?: number;
    alignment?: number;
    pod_score?: number;
    qualified_epoch?: string;
    state_image_id?: string;
    state_image_hash?: string;
    encryption_key_hash?: string;
  };
  metals: string[];
  submissionText?: string | null;
  sourceOctave: number; // Octave of source process (typically 5)
  targetOctave: number; // Octave of on-chain anchoring (2 - Base Mainnet)
}

export interface OffProcessAnchoringResult {
  success: boolean;
  anchoringId: string;
  sourceOctave: number;
  targetOctave: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  timestamp: string;
}

/**
 * Queue Off-Process On-Chain Anchoring
 * 
 * Queues on-chain anchoring as an off-process operation
 * Maintains intentional octave separation
 */
export function queueOffProcessAnchoring(
  request: OffProcessAnchoringRequest
): OffProcessAnchoringResult {
  const anchoringId = `anchor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Validate octave separation
  if (request.sourceOctave === request.targetOctave) {
    return {
      success: false,
      anchoringId,
      sourceOctave: request.sourceOctave,
      targetOctave: request.targetOctave,
      status: 'failed',
      error: 'Octave separation required: source and target octaves must be different',
      timestamp,
    };
  }

  // Ensure target octave is 2 (Base Mainnet Shell)
  if (request.targetOctave !== 2) {
    return {
      success: false,
      anchoringId,
      sourceOctave: request.sourceOctave,
      targetOctave: request.targetOctave,
      status: 'failed',
      error: 'On-chain anchoring must target Octave 2 (Base Mainnet Shell)',
      timestamp,
    };
  }

  // Queue for off-process execution
  // In production, this would add to a queue (e.g., Redis, database queue, etc.)
  return {
    success: true,
    anchoringId,
    sourceOctave: request.sourceOctave,
    targetOctave: request.targetOctave,
    status: 'queued',
    timestamp,
  };
}

/**
 * Process Off-Process On-Chain Anchoring
 * 
 * Processes queued anchoring requests off-process
 * Maintains octave separation during execution
 */
export async function processOffProcessAnchoring(
  anchoringId: string,
  request: OffProcessAnchoringRequest
): Promise<OffProcessAnchoringResult> {
  const timestamp = new Date().toISOString();

  try {
    // Import blockchain registration (off-process, different octave)
    const { registerPoCOnBlockchain } = await import('./register-poc');

    // Execute on-chain anchoring (Octave 2 - Base Mainnet)
    const blockchainResult = await registerPoCOnBlockchain(
      request.submissionHash,
      request.contributor,
      request.metadata,
      request.metals,
      request.submissionText
    );

    if (blockchainResult.success && blockchainResult.transaction_hash) {
      return {
        success: true,
        anchoringId,
        sourceOctave: request.sourceOctave,
        targetOctave: request.targetOctave,
        status: 'completed',
        transactionHash: blockchainResult.transaction_hash,
        blockNumber: blockchainResult.block_number,
        timestamp,
      };
    } else {
      return {
        success: false,
        anchoringId,
        sourceOctave: request.sourceOctave,
        targetOctave: request.targetOctave,
        status: 'failed',
        error: blockchainResult.error || 'Blockchain registration failed',
        timestamp,
      };
    }
  } catch (error) {
    return {
      success: false,
      anchoringId,
      sourceOctave: request.sourceOctave,
      targetOctave: request.targetOctave,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

/**
 * Get Octave Separation Info
 * 
 * Returns information about octave separation for on-chain anchoring
 */
export function getOctaveSeparationInfo(): {
  sourceOctave: number;
  targetOctave: number;
  separation: number;
  description: string;
} {
  return {
    sourceOctave: 5, // Protocol Catalog, Natural Systems Protocol
    targetOctave: 2, // Base Mainnet Shell
    separation: 3, // Octaves apart
    description: 'On-chain anchoring is done off-process with intentional separation of 3 octaves: from Octave 5 (Protocol Catalog) to Octave 2 (Base Mainnet Shell). This maintains clean architectural boundaries and proper shell nesting.',
  };
}
