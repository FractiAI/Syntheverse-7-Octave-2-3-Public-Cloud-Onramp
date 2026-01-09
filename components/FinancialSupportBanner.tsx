/**
 * Financial Support Banner Component
 * Elegant, prominent display of support options integrated throughout the app
 */

'use client';

import { useState } from 'react';
import { Heart, Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface FinancialSupportBannerProps {
  variant?: 'compact' | 'full';
  dismissible?: boolean;
}

export function FinancialSupportBanner({ variant = 'full', dismissible = false }: FinancialSupportBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === 'compact') {
    return (
      <div className="cloud-card relative p-4 border-l-4 border-[var(--hydrogen-alpha)]">
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            <div className="text-sm">
              <span className="font-semibold" style={{color: 'hsl(var(--text-primary))'}}>
                Support the Frontier
              </span>
              <span className="ml-2 opacity-70">
                Help us maintain & evolve this protocol
              </span>
            </div>
          </div>
          
          <Link
            href="/support"
            className="cockpit-lever text-xs px-3 py-1.5 inline-flex items-center gap-2 whitespace-nowrap"
            style={{ backgroundColor: 'hsl(var(--hydrogen-alpha))', color: '#fff' }}
          >
            Contribute
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cloud-card p-6 md:p-8 border-l-4 border-[var(--hydrogen-alpha)] relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--hydrogen-alpha)] opacity-5 rounded-full blur-3xl pointer-events-none" />
      
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--hydrogen-alpha) / 0.1)'}}>
            <Heart className="w-8 h-8" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{color: 'hsl(var(--text-primary))'}}>
              Support the Holographic Hydrogen Fractal Frontier
            </h3>
            <p className="text-sm md:text-base opacity-80 leading-relaxed" style={{color: 'hsl(var(--text-secondary))'}}>
              Your support helps us maintain infrastructure, advance research, and keep the protocol open & accessible to all. Choose a contribution level that aligns with your appreciation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Copper Tier */}
          <Link
            href="/support?tier=copper"
            className="group p-4 rounded-lg border border-[var(--keyline-primary)] hover:border-[var(--metal-copper)] transition-all hover:scale-105"
            style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5" style={{color: 'hsl(var(--metal-copper))'}} />
              <span className="font-semibold" style={{color: 'hsl(var(--metal-copper))'}}>Copper</span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{color: 'hsl(var(--text-primary))'}}>$25</div>
            <p className="text-xs opacity-70">Foundation support</p>
          </Link>

          {/* Silver Tier */}
          <Link
            href="/support?tier=silver"
            className="group p-4 rounded-lg border-2 border-[var(--metal-silver)] hover:shadow-lg hover:shadow-[var(--metal-silver)]/20 transition-all hover:scale-105"
            style={{backgroundColor: 'hsl(var(--cockpit-carbon))'}}
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5" style={{color: 'hsl(var(--metal-silver))'}} />
              <span className="font-semibold" style={{color: 'hsl(var(--metal-silver))'}}>Silver</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: 'hsl(var(--metal-silver) / 0.2)', color: 'hsl(var(--metal-silver))'}}>
                Popular
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{color: 'hsl(var(--text-primary))'}}>$100</div>
            <p className="text-xs opacity-70">Accelerated alignment</p>
          </Link>

          {/* Gold Tier */}
          <Link
            href="/support?tier=gold"
            className="group p-4 rounded-lg border-2 border-[var(--metal-gold)] hover:shadow-lg hover:shadow-[var(--metal-gold)]/20 transition-all hover:scale-105"
            style={{backgroundColor: 'hsl(var(--metal-gold) / 0.05)'}}
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5" style={{color: 'hsl(var(--metal-gold))'}} />
              <span className="font-semibold" style={{color: 'hsl(var(--metal-gold))'}}>Gold</span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{color: 'hsl(var(--text-primary))'}}>$500</div>
            <p className="text-xs opacity-70">Frontier champion</p>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--keyline-primary)]">
          <p className="text-xs opacity-60 text-center sm:text-left">
            All contributions are voluntary. SYNTH recognition is optional, post-hoc, and discretionary.
          </p>
          <Link
            href="/support"
            className="cockpit-lever px-6 py-2 inline-flex items-center gap-2 font-semibold"
            style={{ backgroundColor: 'hsl(var(--hydrogen-alpha))', color: '#fff' }}
          >
            View All Options
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

