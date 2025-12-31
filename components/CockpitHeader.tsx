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
                        </div>
                    </div>

                    {/* Epoch Status & Profile */}
                    <div className="flex items-center gap-6">
                        {/* Current Epoch Status - Will be populated dynamically */}
                        <div className="hidden md:flex items-center gap-2">
                            <div className="cockpit-badge">
                                <span style={{ color: '#ffb84d' }}>◎</span>
                                <span className="ml-2">FOUNDER</span>
                            </div>
                        </div>
                        <DashboardHeaderProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    )
}

