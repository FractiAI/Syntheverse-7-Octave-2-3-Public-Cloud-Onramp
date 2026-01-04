import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import FieldScanPricingTiers from '@/components/FieldScanPricingTiers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default async function SynthScanFieldImagingPage() {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    redirect('/login?redirect=/fractiai/synthscan-field-imaging')
  }
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/fractiai" className="cockpit-lever inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FractiAI
          </Link>
          <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="cockpit-panel p-8">
          <div className="cockpit-label">FULL-SERVICE ENGAGEMENT</div>
          <div className="cockpit-title text-3xl mt-2">SynthScan Field Imaging</div>
          <div className="cockpit-text mt-3">
            Full-service complex systems imaging performed by the FractiAI team using SynthScan™ MRI.
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">SERVICE OVERVIEW</div>
          <div className="cockpit-text mt-3 text-sm space-y-4">
            <p>
              SynthScan Field Imaging is <strong>not a software license</strong>. This is a done-for-you imaging and analysis service performed by the FractiAI team using SynthScan™ MRI technology.
            </p>
            <p>
              Pricing is per node (system component or measurement target). Tier differences are based on deliverables and analysis depth, not time-based billing.
            </p>
            <p>
              Our team performs the imaging, analysis, and delivers structured technical reports based on your system requirements.
            </p>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">PRICING</div>
          <div className="cockpit-text mt-3 text-sm mb-6">
            Pricing is per session, with three tiers depending on the depth of analysis and deliverables.
          </div>
          <FieldScanPricingTiers />
        </div>
      </div>
    </div>
  )
}

