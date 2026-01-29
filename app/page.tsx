/**
 * Irreducible minimum: Solitary pipe to PayPal only.
 * One landing page — pay via PayPal.Me (PrudencioMendez924).
 */

import PayForm from './PayForm';

export const metadata = {
  title: 'Pay via PayPal — Solitary Pipe',
  description: 'Solitary pipe: PayPal only. Pay via PayPal.Me.',
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-white">
        Pay via PayPal
      </h1>
      <p className="mb-6 text-neutral-400">
        Solitary pipe: PayPal only — @PrudencioMendez924
      </p>
      <PayForm />
      <p className="mt-8 text-sm text-neutral-500">
        <a
          href="https://www.paypal.com/paypalme/PrudencioMendez924"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-400"
        >
          Open PayPal.Me directly
        </a>
      </p>
    </div>
  );
}
