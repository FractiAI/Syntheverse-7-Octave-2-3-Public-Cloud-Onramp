/**
 * Payment Processor
 * Solitary pipe: PayPal only (NSPFRNP).
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import type { PaymentMethod } from './method-scoring';

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod['type'] | 'metamask';
  metadata?: Record<string, string>;
  nspfrpAutoMode?: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  method: string;
  amount: number;
  currency: string;
  transactionHash?: string;
  message: string;
  /** PayPal.Me redirect URL (solitary pipe) */
  redirectUrl?: string;
}

const SOLITARY_PIPE_PAYPAL_ME = 'PrudencioMendez924';

export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  if (request.nspfrpAutoMode) {
    request.method = 'paypal';
  }
  if (request.method !== 'paypal') {
    return processPayPalPayment({ ...request, method: 'paypal' });
  }
  return processPayPalPayment(request);
}

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
    redirectUrl: paypalMeUrl,
  };
}
