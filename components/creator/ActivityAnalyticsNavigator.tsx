'use client';

import { useState, useEffect } from 'react';
import { Activity, BarChart3 } from 'lucide-react';
import { ActivityAnalytics } from '../activity/ActivityAnalytics';

export function ActivityAnalyticsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buckystudio_analytics_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('buckystudio_analytics_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '4px solid #FF6B6B',
      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-4 md:p-5 border-b border-[var(--keyline-primary)] hover:bg-[var(--space-deep)] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF6B6B] flex items-center justify-center bg-gradient-to-br from-[#FF6B6B]/20 to-transparent">
                <BarChart3 className="h-5 w-5 text-[#FF6B6B]" />
              </div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-sm md:text-base uppercase tracking-wider text-[#FF6B6B]">
                PATTERN INTEGRITY
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                System Behavior & Emergence Tracking
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#FF6B6B] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-3 bg-[#FF6B6B]/5 border-l-2 border-[#FF6B6B] rounded">
            <p className="text-sm text-[var(--text-secondary)] italic">
              "You never change things by fighting the existing reality. To change something, build a new model
              that makes the existing model obsolete."
              <span className="block mt-2 text-xs text-[#FF6B6B]">— R. Buckminster Fuller</span>
            </p>
          </div>
          <ActivityAnalytics />
        </div>
      )}
    </div>
  );
}

