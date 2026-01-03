/**
 * Command Header Component
 * Syntheverse insignia and epoch status display
 * Holographic Hydrogen Fractal Frontier Noir styling
 */

import DashboardHeaderProfileDropdown from './DashboardHeaderProfileDropdown'

export default function CockpitHeader() {
    return (
        <header className="cockpit-panel border-b-0 border-t-0 border-l-0 border-r-0 rounded-none">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Syntheverse Insignia */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {/* Symbol: Spiral / Origin / Hydrogen Lattice */}
                            <div className="cockpit-symbol">🌀</div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse" 
                                 style={{ backgroundColor: '#ffb84d', boxShadow: '0 0 10px #ffb84d' }}></div>
                        </div>
                        <div>
                            <div className="cockpit-title text-2xl">SYNTHEVERSE</div>
                            <div className="cockpit-label mt-0.5">SYNTH 90T ERC-20 MOTHERLODE BLOCKMINE</div>
                            <div className="mt-3 pt-3 border-t border-[var(--keyline-primary)]">
                                <div className="cockpit-label text-xs mb-1">AWARENESS KEY</div>
                                <div className="cockpit-text text-xs font-semibold" style={{ opacity: 0.95 }}>
                                    AWARENESSVERSE v2.0 · Fractal Holographic Hydrogen Awareness · Outcast Hero Story
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Syntheverse Status & Profile */}
                    <div className="flex items-center gap-6">
                        {/* Syntheverse Deployment Status */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" 
                                 style={{ boxShadow: '0 0 8px #ef4444' }}></div>
                            <div className="cockpit-badge">
                                <span>BASE MAINNET OFFLINE</span>
                            </div>
                        </div>
                        <DashboardHeaderProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    )
}

