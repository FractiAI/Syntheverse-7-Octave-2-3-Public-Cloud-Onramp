'use client';

import { useState, useEffect } from 'react';
import { Settings, Cpu, Sparkles, Zap } from 'lucide-react';

export function LaboratoryApparatusNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tesla_apparatus_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('tesla_apparatus_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '6px solid #9370DB',
      background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.12) 0%, rgba(0, 0, 0, 0.4) 100%)',
      borderColor: '#9370DB'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-5 border-b border-[#9370DB]/20 hover:bg-black/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Tesla Coil icon */}
              <div className="w-12 h-12 rounded-full border-2 border-[#9370DB] flex items-center justify-center bg-gradient-to-br from-[#9370DB]/30 to-transparent relative shadow-[0_0_15px_rgba(147,112,219,0.2)]">
                <Zap className="h-6 w-6 text-[#9370DB]" />
                {/* Rotating magnetic field effect */}
                <div className="absolute inset-0 rounded-full border border-[#00FFFF] opacity-30 animate-[spin_3s_linear_infinite]"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00FFFF] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #00FFFF',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-base font-black uppercase tracking-widest text-[#9370DB]">
                TESLA COIL APPARATUS
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                Wireless Induction & High-Voltage Controls
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#9370DB] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-4 bg-[#9370DB]/5 border-l-2 border-[#9370DB] rounded backdrop-blur-sm">
            <p className="text-sm text-slate-300 italic">
              &quot;My brain is only a receiver, in the Universe there is a core from which we obtain knowledge, strength and inspiration.&quot;
              <span className="block mt-2 text-xs font-bold text-[#9370DB] uppercase tracking-widest">— Nikola Tesla</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
