'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Gauge, Radio } from 'lucide-react';

export function FieldMeasurementsNavigator() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tesla_field_measurements_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('tesla_field_measurements_open', String(isOpen));
  }, [isOpen]);

  return (
    <div className="cockpit-panel" style={{
      borderLeft: '6px solid #00FFFF',
      background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.4) 100%)',
      borderColor: '#00FFFF'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer select-none list-none p-5 border-b border-[#00FFFF]/20 hover:bg-black/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* High-Frequency field icon */}
              <div className="w-12 h-12 rounded-full border-2 border-[#00FFFF] flex items-center justify-center bg-gradient-to-br from-[#00FFFF]/30 to-transparent relative shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <Radio className="h-6 w-6 text-[#00FFFF]" />
                {/* Electric pulse effect */}
                <div className="absolute inset-0 rounded-full border border-[#00FFFF] animate-ping opacity-20"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00FFFF] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #00FFFF',
              }}></div>
            </div>
            <div className="text-left">
              <div className="cockpit-label text-base font-black uppercase tracking-widest text-[#00FFFF]">
                HIGH-FREQUENCY OBSERVATIONS
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                Resonant Field Flux & Harmonic Measurements
              </div>
            </div>
          </div>
          <svg
            className={`h-5 w-5 text-[#00FFFF] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="mb-4 p-4 bg-[#00FFFF]/5 border-l-2 border-[#00FFFF] rounded backdrop-blur-sm">
            <p className="text-sm text-slate-300 italic">
              &quot;If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.&quot;
              <span className="block mt-2 text-xs font-bold text-[#00FFFF] uppercase tracking-widest">— Nikola Tesla</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
