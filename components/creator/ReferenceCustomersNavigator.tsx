'use client';

import { useState, useEffect } from 'react';
import { Users, Building2 } from 'lucide-react';
import { ReferenceCustomersList } from '../ReferenceCustomersList';

export function ReferenceCustomersNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buckystudio_customers_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('buckystudio_customers_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #9370DB',
      background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-[#9370DB] flex items-center justify-center bg-gradient-to-br from-[#9370DB]/20 to-transparent">
                <Building2 className="h-5 w-5 text-[#9370DB]" />
              </div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#9370DB]">
                WORLD GAME PARTNERS
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Collaborative Advantage Network
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#9370DB] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#9370DB]/5 border-l-2 border-[#9370DB] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "We are called to be architects of the future, not its victims. The challenge is to make the world
              work for 100% of humanity in the shortest possible time."
              <span className="block mt-2 text-xs text-[#9370DB]">— R. Buckminster Fuller</span>
            </p>
          </div>
          <ReferenceCustomersList />
        </div>
      )}
    </div>
  );
}

