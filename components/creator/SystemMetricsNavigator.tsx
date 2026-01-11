'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Database } from 'lucide-react';
import { CreatorCockpitStats } from './CreatorCockpitStats';

export function SystemMetricsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buckystudio_metrics_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('buckystudio_metrics_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #FFD700',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Geodesic dome icon representation */}
              <div className="w-10 h-10 rounded-full border-2 border-[#FFD700] flex items-center justify-center bg-gradient-to-br from-[#FFD700]/20 to-transparent">
                <TrendingUp className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFD700] animate-pulse"></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#FFD700]">
                SYSTEM SYNERGETICS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Comprehensive World Intelligence
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#FFD700] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 md:px-5 py-4 md:py-5">
          <div className="mb-4 p-3 bg-[#FFD700]/5 border-l-2 border-[#FFD700] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "Don't fight forces, use them. When I am working on a problem, I never think about beauty...
              but when I have finished, if the solution is not beautiful, I know it is wrong."
              <span className="block mt-2 text-xs text-[#FFD700]">— R. Buckminster Fuller</span>
            </p>
          </div>
          <CreatorCockpitStats />
        </div>
      )}
    </div>
  );
}

