/**
 * Support Hub Trigger - Beautiful floating button to access support options
 * Can be placed in navigation or as a prominent CTA
 */

'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SupportHub } from './SupportHub';

interface SupportHubTriggerProps {
  variant?: 'button' | 'nav' | 'floating';
  label?: string;
}

export function SupportHubTrigger({ variant = 'button', label = 'Support & Access' }: SupportHubTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 rounded-full shadow-2xl transition-all hover:scale-105 group"
          style={{
            backgroundColor: 'var(--hydrogen-amber)',
            boxShadow: '0 6px 30px rgba(255, 184, 77, 0.5)',
          }}
          aria-label="Plans & Support"
        >
          <div className="flex items-center gap-2 px-5 py-3">
            <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold text-slate-950">Plans & Support</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: 'var(--metal-gold)', boxShadow: '0 0 8px var(--metal-gold)'}} />
        </button>
        <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  // Default button variant (kept for potential future use)
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cockpit-lever inline-flex items-center gap-2 px-6 py-3 font-semibold"
        style={{
          backgroundColor: 'var(--hydrogen-amber)',
          color: '#000',
        }}
      >
        <Sparkles className="w-5 h-5" />
        {label}
      </button>
      <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

