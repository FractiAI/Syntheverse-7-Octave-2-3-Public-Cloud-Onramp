/**
 * Payment Method Scoring Using NSPFRP
 * 
 * Scores blockchain payment methods using NSPFRP principles
 * Selects top-scoring blockchain equivalent payment method
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'paypal' | 'onchain' | 'venmo' | 'cashapp' | 'blockchain' | 'metamask';
  enabled: boolean;
  score?: number;
  metadata: {
    paypalMe?: string;
    network?: string;
    token?: string;
    contractAddress?: string;
    fees?: number;
    speed?: string;
    reliability?: number;
    walletType?: string;
  };
}

export interface PaymentMethodScore {
  method: PaymentMethod;
  score: number;
  factors: {
    naturalSystemCompliance: number;
    protocolFirst: number;
    recursiveApplication: number;
    infiniteOctaveFidelity: number;
    total: number;
  };
}

/**
 * Score Blockchain Payment Methods Using NSPFRP
 * 
 * Scores blockchain payment methods based on NSPFRP principles:
 * - Natural System Compliance
 * - Protocol First
 * - Recursive Application
 * - Infinite Octave Fidelity
 */
export function scoreBlockchainPaymentMethods(): PaymentMethodScore[] {
  const methods: PaymentMethod[] = [
    {
      id: 'usdc-base',
      name: 'USDC on Base',
      type: 'blockchain',
      enabled: true,
      metadata: {
        network: 'Base Mainnet',
        token: 'USDC',
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        fees: 0.001,
        speed: 'instant',
        reliability: 0.99,
      },
    },
    {
      id: 'eth-base',
      name: 'ETH on Base',
      type: 'blockchain',
      enabled: true,
      metadata: {
        network: 'Base Mainnet',
        token: 'ETH',
        contractAddress: 'native',
        fees: 0.0001,
        speed: 'instant',
        reliability: 0.99,
      },
    },
    {
      id: 'synth-base',
      name: 'SYNTH Token',
      type: 'blockchain',
      enabled: true,
      metadata: {
        network: 'Base Mainnet',
        token: 'SYNTH',
        contractAddress: '0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3',
        fees: 0.0001,
        speed: 'instant',
        reliability: 0.99,
      },
    },
    {
      id: 'weth-base',
      name: 'WETH on Base',
      type: 'blockchain',
      enabled: true,
      metadata: {
        network: 'Base Mainnet',
        token: 'WETH',
        contractAddress: '0x4200000000000000000000000000000000000006',
        fees: 0.0001,
        speed: 'instant',
        reliability: 0.99,
      },
    },
  ];

  return methods.map((method) => {
    // Score based on NSPFRP principles
    const naturalSystemCompliance = calculateNaturalSystemCompliance(method);
    const protocolFirst = calculateProtocolFirst(method);
    const recursiveApplication = calculateRecursiveApplication(method);
    const infiniteOctaveFidelity = calculateInfiniteOctaveFidelity(method);

    const total = (
      naturalSystemCompliance * 0.3 +
      protocolFirst * 0.3 +
      recursiveApplication * 0.2 +
      infiniteOctaveFidelity * 0.2
    );

    return {
      method: {
        ...method,
        score: total,
      },
      score: total,
      factors: {
        naturalSystemCompliance,
        protocolFirst,
        recursiveApplication,
        infiniteOctaveFidelity,
        total,
      },
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Get Top-Scoring Blockchain Payment Method
 * Solitary pipe: returns PayPal (only method). Legacy blockchain scoring kept for type compatibility.
 */
export function getTopScoringBlockchainMethod(): PaymentMethod {
  const methods = getAllPaymentMethods();
  return methods[0] ?? {
    id: 'paypal',
    name: `PayPal @${SOLITARY_PIPE_PAYPAL_ME}`,
    type: 'paypal',
    enabled: true,
    metadata: { paypalMe: SOLITARY_PIPE_PAYPAL_ME, speed: 'instant', reliability: 0.99 },
  };
}

// Scoring functions

function calculateNaturalSystemCompliance(method: PaymentMethod): number {
  // Higher score for methods that align with natural system principles
  let score = 0.5; // Base score

  // SYNTH token gets highest score (native to system)
  if (method.metadata.token === 'SYNTH') {
    score = 1.0;
  }
  // USDC gets high score (stable, widely accepted)
  else if (method.metadata.token === 'USDC') {
    score = 0.9;
  }
  // ETH gets good score (native gas token)
  else if (method.metadata.token === 'ETH') {
    score = 0.8;
  }
  // WETH gets decent score (wrapped version)
  else if (method.metadata.token === 'WETH') {
    score = 0.7;
  }

  // Bonus for Base Mainnet (our network)
  if (method.metadata.network === 'Base Mainnet') {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

function calculateProtocolFirst(method: PaymentMethod): number {
  // Higher score for methods that follow protocol-first principles
  let score = 0.5;

  // SYNTH token is protocol-native
  if (method.metadata.token === 'SYNTH') {
    score = 1.0;
  }
  // USDC follows established protocols
  else if (method.metadata.token === 'USDC') {
    score = 0.9;
  }
  // ETH is protocol-native
  else if (method.metadata.token === 'ETH') {
    score = 0.85;
  }
  // WETH follows wrapping protocol
  else if (method.metadata.token === 'WETH') {
    score = 0.75;
  }

  return Math.min(1.0, score);
}

function calculateRecursiveApplication(method: PaymentMethod): number {
  // Higher score for methods that support recursive application
  let score = 0.5;

  // SYNTH token supports recursive tokenomics
  if (method.metadata.token === 'SYNTH') {
    score = 1.0;
  }
  // USDC supports recursive DeFi operations
  else if (method.metadata.token === 'USDC') {
    score = 0.85;
  }
  // ETH supports recursive smart contracts
  else if (method.metadata.token === 'ETH') {
    score = 0.8;
  }
  // WETH supports recursive wrapping
  else if (method.metadata.token === 'WETH') {
    score = 0.75;
  }

  return Math.min(1.0, score);
}

function calculateInfiniteOctaveFidelity(method: PaymentMethod): number {
  // Higher score for methods that achieve infinite octave fidelity
  let score = 0.5;

  // Reliability factor
  if (method.metadata.reliability) {
    score = method.metadata.reliability;
  }

  // SYNTH token achieves full fidelity (native to system)
  if (method.metadata.token === 'SYNTH') {
    score = 1.0;
  }
  // USDC achieves high fidelity (stable)
  else if (method.metadata.token === 'USDC') {
    score = 0.95;
  }
  // ETH achieves good fidelity (native)
  else if (method.metadata.token === 'ETH') {
    score = 0.9;
  }
  // WETH achieves decent fidelity
  else if (method.metadata.token === 'WETH') {
    score = 0.85;
  }

  return Math.min(1.0, score);
}

/**
 * Solitary Pipe: PayPal @PrudencioMendez924 only. All other payment methods removed.
 * SEED = psw.vibelandia.sing4. Full operational.
 */
export const SOLITARY_PIPE_PAYPAL_ME = 'PrudencioMendez924';

/**
 * Get All Payment Methods
 *
 * Returns solitary pipe only: PayPal @PrudencioMendez924. No Stripe, Venmo, Cash App, on-chain, or others.
 */
export function getAllPaymentMethods(): PaymentMethod[] {
  return [
    {
      id: 'paypal',
      name: `PayPal @${SOLITARY_PIPE_PAYPAL_ME}`,
      type: 'paypal',
      enabled: true,
      metadata: {
        paypalMe: SOLITARY_PIPE_PAYPAL_ME,
        speed: 'instant',
        reliability: 0.99,
      },
    },
  ];
}
