/**
 * Mobile Status Indicators
 * Shows system status indicators at the top of mobile dashboards
 * Green indicators are solid (no pulsing), red indicators pulse for attention
 */

'use client';

import { useState, useEffect } from 'react';

interface StatusIndicator {
  name: string;
  status: 'healthy' | 'attention' | 'warning';
}

export function MobileStatusIndicators() {
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime(); // Initial update
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  // All indicators are healthy by default (green, solid)
  // Red indicators would pulse for attention required
  const indicators: StatusIndicator[] = [
    { name: 'Awareness Bridge/Router', status: 'healthy' },
    { name: 'Whole Brain AI', status: 'healthy' },
    { name: 'SynthScan MRI', status: 'healthy' },
    { name: 'PoC Sandbox', status: 'healthy' },
    { name: 'ERC-20 MOTHERLODE VAULT', status: 'healthy' },
  ];

  return (
    <div className="cockpit-panel mb-4 p-4 bg-black/40 border-[#4169E1]/30">
      <div className="mb-3 flex items-center justify-between border-b border-[#4169E1]/20 pb-2">
        <div className="cockpit-label text-[9px] font-black tracking-[0.2em] text-[#4169E1]">
          SYSTEM_FLUX
        </div>
        {currentTime && (
          <div className="cockpit-text text-[9px] font-mono opacity-70 text-[#4169E1]">
            {currentTime}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {indicators.map((indicator) => {
          const isHealthy = indicator.status === 'healthy';
          const isAttention = indicator.status === 'attention';
          
          return (
            <div
              key={indicator.name}
              className="flex items-center gap-2"
              title={indicator.name}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isHealthy
                    ? 'bg-green-500'
                    : isAttention
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-yellow-500'
                }`}
                style={
                  isHealthy
                    ? { boxShadow: '0 0 8px #22c55e, 0 0 12px rgba(34, 197, 94, 0.3)' }
                    : isAttention
                      ? { boxShadow: '0 0 10px #ef4444, 0 0 15px rgba(239, 68, 68, 0.5)' }
                      : { boxShadow: '0 0 8px #eab308' }
                }
              />
              <span className="cockpit-text text-[8px] font-bold uppercase tracking-tighter text-slate-400">
                {indicator.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


