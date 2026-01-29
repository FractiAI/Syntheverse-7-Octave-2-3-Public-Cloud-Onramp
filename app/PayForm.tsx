'use client';

import { useState } from 'react';

export default function PayForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const amount = Number((form.elements.namedItem('amount') as HTMLInputElement)?.value) || 10;
    if (amount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency: 'usd',
          method: 'paypal',
        }),
      });
      const data = await res.json();
      const url = data?.payment?.redirectUrl;
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-left text-sm text-neutral-400">
        Amount (USD)
        <input
          type="number"
          name="amount"
          min="1"
          step="1"
          defaultValue="10"
          disabled={loading}
          className="mt-1 w-full max-w-[12rem] rounded border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[#0070ba] px-6 py-2 font-medium text-white hover:bg-[#005ea6] disabled:opacity-50"
      >
        {loading ? 'Redirecting…' : 'Pay with PayPal'}
      </button>
    </form>
  );
}
