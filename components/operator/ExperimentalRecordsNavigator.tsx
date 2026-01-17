'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FlaskConical, FileText, Radio } from 'lucide-react';
import { ActivityAnalytics } from '../activity/ActivityAnalytics';

export function ExperimentalRecordsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tesla_transmission_records_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('tesla_transmission_records_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '6px solid #C0C0C0',
      background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(0, 0, 0, 0.4) 100%)',
      borderColor: '#C0C0C0'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-5 border-b border-[#C0C0C0]/20 hover:bg-black/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Wireless log icon */}
              <div className="w-12 h-12 rounded-full border-2 border-[#C0C0C0] flex items-center justify-center bg-gradient-to-br from-[#C0C0C0]/30 to-transparent shadow-[0_0_15px_rgba(192,192,192,0.2)]">
                <Radio className="h-6 w-6 text-[#C0C0C0]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C0C0C0] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #C0C0C0',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-base font-black uppercase tracking-widest text-[#C0C0C0]">
                TRANSMISSION RECORDS
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                Wardenclyffe Logs & Wireless Discovery Journals
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#C0C0C0] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-5 py-5">
          <div className="mb-4 p-4 bg-[#C0C0C0]/5 border-l-2 border-[#C0C0C0] rounded backdrop-blur-sm">
            <p className="text-sm text-slate-300 italic">
              &quot;The scientific man does not aim at an immediate result. He does not expect that his advanced ideas will be readily taken up. His work is like that of the planter — for the future.&quot;
              <span className="block mt-2 text-xs font-bold text-[#C0C0C0] uppercase tracking-widest">— Nikola Tesla</span>
            </p>
          </div>
          <ActivityAnalytics />
        </div>
      )}
    </div>
  );
}
