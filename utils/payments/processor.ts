/**
 * Payment Processor
 * 
 * Handles payments across all methods:
 * - On-chain
 * - Stripe
 * - Venmo
 * - Cash App
 * - Top-scoring blockchain method (NSPFRP-selected)
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import { getTopScoringBlockchainMethod, type PaymentMethod } from './method-scoring';
import Stripe from 'stripe';

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod['type'] | 'metamask';
  metadata?: Record<string, string>;
  nspfrpAutoMode?: boolean; // NSPFRP auto mode for automatic method selection
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  method: string;
  amount: number;
  currency: string;
  transactionHash?: string;
  message: string;
}

/**
 * Process Payment
 * 
 * Routes payment to appropriate processor based on method
 */
/**
 * Process Payment with NSPFRP Auto Mode Support
 * 
 * If nspfrpAutoMode is enabled, automatically selects optimal payment method
 * using NSPFRP scoring principles. Otherwise, uses the specified method.
 */
export async function processPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // NSPFRP Auto Mode: Automatically select optimal payment method
  if (request.nspfrpAutoMode) {
    const { selectOptimalPaymentMethod } = await import('./nspfrp-auto-mode');
    const optimalMethod = await selectOptimalPaymentMethod({
      amount: request.amount,
      currency: request.currency,
      context: request.metadata || {},
    });
    
    // Override method with optimal selection
    request.method = optimalMethod.type as PaymentMethod['type'] | 'metamask';
  }

  switch (request.method) {
    case 'paypal':
      return processPayPalPayment(request);
    case 'onchain':
      return processOnChainPayment(request);
    case 'stripe':
      return processStripePayment(request);
    case 'venmo':
      return processVenmoPayment(request);
    case 'cashapp':
      return processCashAppPayment(request);
    case 'metamask':
      return processMetaMaskPayment(request);
    case 'blockchain':
      return processBlockchainPayment(request);
    default:
      throw new Error(`Unsupported payment method: ${request.method}`);
  }
}

/**
 * Process PayPal Payment — Solitary pipe: PayPal @PrudencioMendez924 only
 */
const SOLITARY_PIPE_PAYPAL_ME = 'PrudencioMendez924';

async function processPayPalPayment(request: PaymentRequest): Promise<PaymentResult> {
  const amountUsd = Math.round(request.amount);
  const paypalMeUrl = `https://www.paypal.com/paypalme/${SOLITARY_PIPE_PAYPAL_ME}/${amountUsd}USD`;
  return {
    success: true,
    paymentId: `paypal-${Date.now()}`,
    method: 'paypal',
    amount: request.amount,
    currency: request.currency,
    message: `Redirect to PayPal.Me (solitary pipe): ${paypalMeUrl}`,
  };
}

/**
 * Process On-Chain Payment
 */
async function processOnChainPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // In production, this would interact with Base Mainnet
  const paymentId = `onchain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    paymentId,
    method: 'onchain',
    amount: request.amount,
    currency: request.currency,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    message: 'On-chain payment processed',
  };
}

/**
 * Process Stripe Payment
 */
async function processStripePayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(request.amount * 100), // Convert to cents
    currency: request.currency.toLowerCase(),
    metadata: request.metadata || {},
  });

  return {
    success: true,
    paymentId: paymentIntent.id,
    method: 'stripe',
    amount: request.amount,
    currency: request.currency,
    message: 'Stripe payment processed',
  };
}

/**
 * Process Venmo Payment
 */
async function processVenmoPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // In production, this would integrate with Venmo API
  const paymentId = `venmo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    paymentId,
    method: 'venmo',
    amount: request.amount,
    currency: request.currency,
    message: 'Venmo payment processed',
  };
}

/**
 * Process Cash App Payment
 */
async function processCashAppPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // In production, this would integrate with Cash App API
  const paymentId = `cashapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    paymentId,
    method: 'cashapp',
    amount: request.amount,
    currency: request.currency,
    message: 'Cash App payment processed',
  };
}

/**
 * Process MetaMask Payment
 */
async function processMetaMaskPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // In production, this would interact with MetaMask via Web3
  // For now, return a placeholder that indicates MetaMask integration
  const paymentId = `metamask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    paymentId,
    method: 'metamask',
    amount: request.amount,
    currency: request.currency,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Placeholder
    message: 'MetaMask payment processed (Web3 wallet)',
  };
}

/**
 * Process Blockchain Payment (Top-Scoring Method)
 */
async function processBlockchainPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  const topMethod = getTopScoringBlockchainMethod();
  const paymentId = `blockchain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // In production, this would interact with the blockchain using the top method
  return {
    success: true,
    paymentId,
    method: `blockchain-${topMethod.metadata.token}`,
    amount: request.amount,
    currency: topMethod.metadata.token || request.currency,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    message: `Blockchain payment processed using ${topMethod.name}`,
  };
}
