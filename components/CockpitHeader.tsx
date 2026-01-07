/**
 * Command Header Component
 * Syntheverse insignia and epoch status display
 * Holographic Hydrogen Fractal Frontier Noir styling
 */

import DashboardHeaderProfileDropdown from './DashboardHeaderProfileDropdown';
import { StatusIndicators } from './StatusIndicators';

export default function CockpitHeader() {
  return (
    <header className="cockpit-panel rounded-none border-b-0 border-l-0 border-r-0 border-t-0">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          {/* Syntheverse Insignia */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Symbol: Spiral / Origin / Hydrogen Lattice */}
              <div className="cockpit-symbol">🌀</div>
              <div
                className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: '#ffb84d', boxShadow: '0 0 10px #ffb84d' }}
              ></div>
            </div>
            <div>
              <div className="cockpit-title text-xl md:text-2xl">SYNTHEVERSE</div>
              <div className="cockpit-label mt-0.5">SYNTH 90T ERC-20 MOTHERLODE BLOCKMINE</div>
            </div>
          </div>

          {/* Status Panel & My Account Icon */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Status Indicators with Awareness Bridge/Router - Hidden on Mobile */}
            <div className="hidden lg:flex items-center gap-2 min-w-0">
              <StatusIndicators />
            </div>
            {/* My Account Icon - Always Visible */}
            <DashboardHeaderProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
