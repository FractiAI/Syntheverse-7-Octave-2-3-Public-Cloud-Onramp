'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { SalesTracking } from '../SalesTracking';

export function SalesTrackingNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buckystudio_sales_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('buckystudio_sales_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #00CED1',
      background: 'linear-gradient(135deg, rgba(0, 206, 209, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-[#00CED1] flex items-center justify-center bg-gradient-to-br from-[#00CED1]/20 to-transparent">
                <DollarSign className="h-5 w-5 text-[#00CED1]" />
              </div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#00CED1]">
                ECONOMIC EPHEMERALIZATION
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Doing More with Less - Revenue Synergetics
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#00CED1] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#00CED1]/5 border-l-2 border-[#00CED1] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "Wealth is the progressive mastery of energy... We must do away with the absolutely specious notion
              that everybody has to earn a living."
              <span className="block mt-2 text-xs text-[#00CED1]">— R. Buckminster Fuller</span>
            </p>
          </div>
          <SalesTracking />
        </div>
      )}
    </div>
  );
}

