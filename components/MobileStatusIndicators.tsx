/**
 * Mobile Status Indicators
 * Shows system status indicators at the top of mobile dashboards
 * Green indicators are solid (no pulsing), red indicators pulse for attention
 */

'use client';

interface StatusIndicator {
  name: string;
  status: 'healthy' | 'attention' | 'warning';
}

export function MobileStatusIndicators() {
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
    <div className="cockpit-panel mb-4 p-3 md:p-4">
      <div className="mb-3 flex items-center border-b border-[var(--keyline-primary)] pb-2">
        <div className="cockpit-label text-[10px] md:text-xs uppercase tracking-wider">
          STATUS
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {indicators.map((indicator) => {
          const isHealthy = indicator.status === 'healthy';
          const isAttention = indicator.status === 'attention';
          
          return (
            <div
              key={indicator.name}
              className="flex items-center gap-1.5"
              title={indicator.name}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isHealthy
                    ? 'bg-green-500'
                    : isAttention
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-yellow-500'
                }`}
                style={
                  isHealthy
                    ? { boxShadow: '0 0 6px #22c55e' }
                    : isAttention
                      ? { boxShadow: '0 0 8px #ef4444, 0 0 12px rgba(239, 68, 68, 0.5)' }
                      : { boxShadow: '0 0 6px #eab308' }
                }
              />
              <span className="cockpit-text text-[10px] md:text-xs opacity-80 whitespace-nowrap">
                {indicator.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


