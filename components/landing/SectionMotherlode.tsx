'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';

export function SectionMotherlode() {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const deadline = new Date('2026-03-19T23:59:59');
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysRemaining(days);
  }, []);

  return (
    <div
      className="py-16 md:py-24"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f00 100%)',
        borderTop: '2px solid var(--hydrogen-amber)',
        borderBottom: '2px solid var(--hydrogen-amber)',
      }}
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div
            className="cockpit-label mb-2 text-xs uppercase tracking-wider"
            style={{ color: 'var(--hydrogen-amber)' }}
          >
            VAULT OPENING
          </div>

          <h2 className="mb-4 text-3xl md:text-4xl" style={{ color: 'var(--hydrogen-amber)' }}>
            🏛️ SYNTH90T MOTHERLODE VAULT
          </h2>

          <div className="mx-auto mb-3 max-w-2xl border-l-2 border-amber-500 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
            <strong>ERC-20 BOUNDARY:</strong> SYNTH tokens are ERC-20 internal coordination units
            for protocol accounting only. Not an investment, security, or financial instrument. No
            guaranteed value, no profit expectation.
          </div>

          <p className="cockpit-title mb-2 text-xl">Opens Spring Equinox: March 20, 2026</p>

          {daysRemaining !== null && (
            <div className="mb-6">
              <div className="inline-block rounded-lg bg-[var(--hydrogen-amber)] px-6 py-3 text-2xl font-bold text-black">
                {daysRemaining} Days Remaining
              </div>
            </div>
          )}

          <p className="cockpit-text mx-auto mb-8 max-w-3xl text-base opacity-90">
            All qualifying PoCs submitted by March 19, 2026 will be registered on-chain and
            allocated SYNTH by score. Through our hydrogen spin MRI-based PoC protocol on the
            blockchain, contributions are liberated—no longer gatekept, visible and demonstrable to
            all via HHF-AI MRI science and technology.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-2 text-xs">WHAT</div>
            <p className="cockpit-text text-sm opacity-80">
              Allocation mechanism for the fixed-supply 90T SYNTH system
            </p>
          </div>

          <div className="rounded-lg border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-2 text-xs">DEADLINE</div>
            <p className="cockpit-text text-sm font-semibold" style={{ color: '#fca5a5' }}>
              Submit by March 19, 2026
            </p>
          </div>

          <div className="rounded-lg border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-2 text-xs">HOW</div>
            <p className="cockpit-text text-sm opacity-80">
              Score-based allocation after operator review (no promises)
            </p>
          </div>
        </div>

        {/* Eligibility Checklist */}
        <div className="mx-auto mb-8 max-w-2xl rounded-lg border-2 border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-6">
          <h3 className="cockpit-title mb-4 text-center text-lg">Eligibility Checklist</h3>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="cockpit-text text-sm">
                PoC score above threshold (varies by epoch)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="cockpit-text text-sm">Redundancy percentage below limit</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="cockpit-text text-sm">Operator approval (discretionary)</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span className="cockpit-text text-sm font-semibold">
                No guaranteed allocation or value
              </span>
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-center text-xs opacity-90">
            Submitting a PoC does not guarantee SYNTH allocation, value, or profit. Operator
            reserves full discretion.
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="cockpit-lever inline-flex items-center gap-2 px-8 py-4 text-base"
            style={{ backgroundColor: 'var(--hydrogen-amber)', color: '#000' }}
          >
            Submit Your PoC Now
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/dashboard"
            className="cockpit-lever inline-flex items-center gap-2 bg-transparent px-8 py-4 text-base"
            style={{ border: '1px solid var(--hydrogen-amber)' }}
          >
            Check Eligibility
          </Link>
        </div>
      </div>
    </div>
  );
}
