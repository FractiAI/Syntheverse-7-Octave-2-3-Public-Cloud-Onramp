import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { hasActiveSubscription } from '@/utils/stripe/check-subscription'
import '../dashboard-cockpit.css'
import Link from 'next/link'
import { ArrowLeft, Scan, Activity, BarChart3, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SynthScanMonthlyAccessPage() {
    // Check authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
        redirect('/login')
    }

    // Check subscription status
    const isSubscribed = await hasActiveSubscription(user.email)

    if (!isSubscribed) {
        // Redirect to subscribe page if not subscribed
        redirect('/subscribe?redirect=/synthscan/monthly-access')
    }

    // User has active subscription - show SynthScan MRI interface
    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="cockpit-panel p-8">
                    <div className="cockpit-label">SYNTHSCAN™ MRI — MONTHLY ACCESS</div>
                    <div className="cockpit-title text-3xl mt-2 mb-4">SynthScan™ MRI Interface</div>
                    <div className="cockpit-text mt-3">
                        Welcome to your SynthScan™ MRI monthly access. Use this interface to image and measure complex and abstract systems using hydrogen spin–mediated resonance.
                    </div>
                </div>

                {/* Main Interface Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* System Scanner */}
                    <div className="cockpit-panel p-6 border border-[var(--keyline-primary)] hover:border-[var(--hydrogen-amber)] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <Scan className="h-6 w-6 text-[var(--hydrogen-amber)]" />
                            <div className="cockpit-label">SYSTEM SCANNER</div>
                        </div>
                        <div className="cockpit-text text-sm mb-4" style={{ opacity: 0.9 }}>
                            Scan complex systems and abstract structures using SynthScan™ MRI technology.
                        </div>
                        <button className="cockpit-lever w-full text-center">
                            Launch Scanner
                        </button>
                    </div>

                    {/* Coherence Analysis */}
                    <div className="cockpit-panel p-6 border border-[var(--keyline-primary)] hover:border-[var(--hydrogen-amber)] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="h-6 w-6 text-[var(--hydrogen-amber)]" />
                            <div className="cockpit-label">COHERENCE ANALYSIS</div>
                        </div>
                        <div className="cockpit-text text-sm mb-4" style={{ opacity: 0.9 }}>
                            Measure coherence density and boundary contrast using hydrogen spin resonance.
                        </div>
                        <button className="cockpit-lever w-full text-center">
                            Analyze Coherence
                        </button>
                    </div>

                    {/* Edge Mapping */}
                    <div className="cockpit-panel p-6 border border-[var(--keyline-primary)] hover:border-[var(--hydrogen-amber)] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="h-6 w-6 text-[var(--hydrogen-amber)]" />
                            <div className="cockpit-label">EDGE MAPPING</div>
                        </div>
                        <div className="cockpit-text text-sm mb-4" style={{ opacity: 0.9 }}>
                            Map edge sweet spots and contrast constants (Cₑ ≈ 1.62 ± 0.07).
                        </div>
                        <button className="cockpit-lever w-full text-center">
                            Map Edges
                        </button>
                    </div>
                </div>

                {/* Technical Information */}
                <div className="cockpit-panel p-6">
                    <div className="cockpit-label mb-4">TECHNICAL INFORMATION</div>
                    <div className="cockpit-text text-sm space-y-4">
                        <p>
                            <strong>SynthScan™ MRI (HHF-AI)</strong> is a hydrogen-spin-based MRI system designed to image complex and abstract systems rather than flesh, mapping informational structure, coherence, and boundary contrast using the same physical principles that classical MRI uses to image tissue.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-text text-sm font-semibold mb-2">What You Can Scan</div>
                                <ul className="cockpit-text text-xs space-y-1" style={{ opacity: 0.9 }}>
                                    <li>• Complex systems and architectures</li>
                                    <li>• Informational structures</li>
                                    <li>• Abstract systems and models</li>
                                    <li>• Boundary contrast zones</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-text text-sm font-semibold mb-2">What You Can Measure</div>
                                <ul className="cockpit-text text-xs space-y-1" style={{ opacity: 0.9 }}>
                                    <li>• Coherence density</li>
                                    <li>• Edge contrast (Cₑ)</li>
                                    <li>• Informational structure mapping</li>
                                    <li>• Predictive resonance signatures</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Status */}
                <div className="cockpit-panel p-6 border border-[var(--hydrogen-amber)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="cockpit-label text-[var(--hydrogen-amber)]">MONTHLY ACCESS ACTIVE</div>
                            <div className="cockpit-text text-sm mt-2" style={{ opacity: 0.9 }}>
                                Your subscription provides full access to SynthScan™ MRI tools and capabilities.
                            </div>
                        </div>
                        <Link href="/billing-portal" className="cockpit-lever inline-flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Subscription
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

