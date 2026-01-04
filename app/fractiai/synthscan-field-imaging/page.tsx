import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default function SynthScanFieldImagingPage() {
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

        <div className="grid gap-6">
          {/* Core Tier */}
          <div className="cockpit-panel p-6 border border-[var(--keyline-primary)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="cockpit-label">TIER 1</div>
                <div className="cockpit-title text-2xl mt-1">SynthScan Field Imaging — Core</div>
                <div className="cockpit-text text-lg mt-2">$500 per node</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Inputs Required</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• System specification or description</p>
                  <p>• Target nodes for imaging</p>
                  <p>• Measurement objectives</p>
                </div>
              </div>
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Outputs Delivered</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• Targeted system imaging results</p>
                  <p>• Edge contrast and coherence mapping</p>
                  <p>• Structured technical report</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[var(--keyline-primary)]">
              <div className="cockpit-text text-sm font-semibold mb-2">Ideal Use Cases</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.9 }}>
                Single-system imaging, boundary analysis, coherence measurement for research or development projects requiring structured measurement and reporting.
              </div>
            </div>

            <div className="mt-6">
              <button className="cockpit-lever inline-flex items-center">
                Request Core Engagement
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advanced Tier */}
          <div className="cockpit-panel p-6 border border-[var(--hydrogen-amber)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="cockpit-label text-[var(--hydrogen-amber)]">TIER 2</div>
                <div className="cockpit-title text-2xl mt-1">SynthScan Field Imaging — Advanced</div>
                <div className="cockpit-text text-lg mt-2">$1,500 per node</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Inputs Required</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• System specification or description</p>
                  <p>• Target nodes for imaging</p>
                  <p>• Measurement objectives</p>
                  <p>• Integration requirements</p>
                </div>
              </div>
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Outputs Delivered</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• Nested-layer imaging results</p>
                  <p>• Predictive resonance scoring</p>
                  <p>• Integration with Syntheverse Sandbox outputs</p>
                  <p>• Structured technical report with analysis</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[var(--hydrogen-amber)]">
              <div className="cockpit-text text-sm font-semibold mb-2">Ideal Use Cases</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.9 }}>
                Multi-layer system analysis, predictive modeling, research projects requiring integration with Syntheverse evaluation systems, and development workflows needing resonance scoring.
              </div>
            </div>

            <div className="mt-6">
              <button className="cockpit-lever inline-flex items-center">
                Request Advanced Engagement
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="cockpit-panel p-6 border-2 border-[var(--hydrogen-amber)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="cockpit-label text-[var(--hydrogen-amber)]">TIER 3</div>
                <div className="cockpit-title text-2xl mt-1">SynthScan Field Imaging — Enterprise</div>
                <div className="cockpit-text text-lg mt-2">$5,000 per node</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Inputs Required</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• System specification or description</p>
                  <p>• Multiple target nodes for imaging</p>
                  <p>• Measurement objectives</p>
                  <p>• Integration requirements</p>
                  <p>• Vault integration preferences (optional)</p>
                </div>
              </div>
              <div>
                <div className="cockpit-text text-sm font-semibold mb-3">Outputs Delivered</div>
                <div className="cockpit-text text-xs space-y-2" style={{ opacity: 0.9 }}>
                  <p>• Multi-node system imaging results</p>
                  <p>• Cross-node coherence analysis</p>
                  <p>• Comprehensive technical report</p>
                  <p>• Optional Proof-of-Contribution vault integration</p>
                  <p>• Enterprise support and consultation</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[var(--hydrogen-amber)]">
              <div className="cockpit-text text-sm font-semibold mb-2">Ideal Use Cases</div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.9 }}>
                Large-scale system analysis, enterprise architecture evaluation, multi-system coherence studies, and organizations requiring comprehensive imaging with optional blockchain anchoring and enterprise-grade support.
              </div>
            </div>

            <div className="mt-6">
              <button className="cockpit-lever inline-flex items-center">
                Request Enterprise Engagement
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">PRICING & ENGAGEMENT</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              All pricing is <strong>per node</strong> (system component or measurement target). Tier differences reflect deliverables and analysis depth, not time-based billing.
            </p>
            <p>
              To request an engagement, contact <a href="mailto:info@fractiai.com" className="underline">info@fractiai.com</a> with your system specifications and measurement objectives.
            </p>
            <p>
              Enterprise engagements may include custom pricing for multi-node systems. Contact us for volume pricing and custom engagement terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

