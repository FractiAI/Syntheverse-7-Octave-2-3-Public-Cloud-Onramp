import DashboardHeaderProfileDropdown from './DashboardHeaderProfileDropdown'

export default function DashboardHeader() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-semibold">Syntheverse PoC</span>
                    </div>
                    <DashboardHeaderProfileDropdown />
                </div>
            </div>
        </header>
    )
}

