'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function HeroOptimized() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Subtle fractal background - static for now, can be animated later */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(255,184,77,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,184,77,0.2) 0%, transparent 50%)',
          backgroundSize: '150% 150%',
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl px-6 text-center">
        {/* Trust indicators - moved to top */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm opacity-75">
          <span className="flex items-center gap-2">
            <div
              className="h-2 w-2 animate-pulse rounded-full bg-green-500"
              style={{ boxShadow: '0 0 8px #22c55e' }}
            />
            Base Mainnet LIVE
          </span>
          <span>•</span>
          <span>90T SYNTH</span>
          <span>•</span>
          <span>Beta Active</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Syntheverse: Proof-of-Contribution for Frontier R&D, Creators & Enterprises
        </h1>

        <p className="cockpit-text mb-8 text-lg opacity-90 md:text-xl">
          <strong>For Frontier R&D:</strong> Turn research into verifiable on-chain records—no gatekeeping, measured by coherence. <strong>For Enterprises:</strong> <strong>1.5–1.8× higher output</strong> with <strong>38–58% lower overhead</strong> than traditional systems. <strong>For Creators:</strong> A new infinite medium and materials for full reality worldbuilding creations.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="cockpit-lever inline-flex items-center gap-2 px-8 py-4 text-base"
          >
            Submit Your PoC
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/dashboard"
            className="cockpit-lever inline-flex items-center gap-2 bg-transparent px-8 py-4 text-base"
            style={{ border: '1px solid var(--keyline-primary)' }}
          >
            Join the Frontier
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-8 w-8 opacity-50" />
      </button>
    </section>
  );
}
