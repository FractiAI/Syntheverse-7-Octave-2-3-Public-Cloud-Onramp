import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SynthScanPricingTiers from '@/components/SynthScanPricingTiers'
import '../dashboard-cockpit.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SubscribePage({ searchParams }: { searchParams?: { redirect?: string } }) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Redirect to login if not authenticated
    if (authError || !user || !user.email) {
        redirect('/login')
    }

    const redirectPath = searchParams?.redirect || '/dashboard'

    return (
        <div className="cockpit-bg min-h-screen">
            <div className="container mx-auto px-6 py-10 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <Link href={redirectPath} className="cockpit-lever inline-flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </div>

                <div className="cockpit-panel p-8">
                    <div className="cockpit-label">SUBSCRIPTION PLANS</div>
                    <div className="cockpit-title text-3xl mt-2 mb-4">SynthScan™ MRI Monthly Access</div>
                    <div className="cockpit-text mt-3">
                        Choose a monthly subscription plan to access SynthScan™ MRI tools and capabilities for imaging complex and abstract systems.
                    </div>
                </div>

                <div className="cockpit-panel p-6">
                    <SynthScanPricingTiers />
                </div>

                <div className="cockpit-panel p-6">
                    <div className="cockpit-label mb-4">WHAT&apos;S INCLUDED</div>
                    <div className="cockpit-text text-sm space-y-3">
                        <p>
                            Monthly access to SynthScan™ MRI provides:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>• Full access to SynthScan™ MRI system</li>
                            <li>• System scanning and imaging capabilities</li>
                            <li>• Coherence analysis and measurement tools</li>
                            <li>• Edge mapping and contrast constant analysis</li>
                            <li>• Technical support and documentation</li>
                            <li>• System updates and improvements</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
