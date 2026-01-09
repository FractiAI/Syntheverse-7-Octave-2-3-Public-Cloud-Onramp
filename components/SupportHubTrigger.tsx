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
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-xl transition-all hover:scale-110 group animate-pulse-subtle"
          style={{
            backgroundColor: '#FFB84D',
            boxShadow: '0 4px 20px rgba(255, 184, 77, 0.6), 0 0 12px rgba(255, 184, 77, 0.4)',
            border: '2px solid rgba(255, 215, 0, 0.5)',
          }}
          aria-label="Plans & Support"
        >
          <div className="flex items-center gap-1.5 px-3 py-2">
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-slate-950">Plans</span>
          </div>
          <div 
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse" 
            style={{
              backgroundColor: '#FFD700',
              boxShadow: '0 0 8px #FFD700, 0 0 12px rgba(255, 215, 0, 0.5)'
            }} 
          />
        </button>
        <SupportHub isOpen={isOpen} onClose={() => setIsOpen(false)} />
        
        <style jsx>{`
          @keyframes pulse-subtle {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.02);
              opacity: 0.95;
            }
          }
          .animate-pulse-subtle {
            animation: pulse-subtle 3s ease-in-out infinite;
          }
        `}</style>
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

