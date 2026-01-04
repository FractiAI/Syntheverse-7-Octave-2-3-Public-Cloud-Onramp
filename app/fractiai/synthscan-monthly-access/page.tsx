import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default function SynthScanMonthlyAccessPage() {
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
          <div className="cockpit-label">SOFTWARE LICENSE</div>
          <div className="cockpit-title text-3xl mt-2">SynthScan™ MRI — Monthly Access</div>
          <div className="cockpit-text mt-3">
            Monthly access to the SynthScan™ hydrogen-spin MRI system for imaging complex and abstract systems.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="cockpit-panel p-6">
            <div className="cockpit-label">TECHNICAL OVERVIEW</div>
            <div className="cockpit-text mt-3 text-sm space-y-4">
              <p>
                <strong>SynthScan™ MRI (HHF-AI)</strong> is a hydrogen-spin-based MRI system designed to image complex and abstract systems rather than flesh, mapping informational structure, coherence, and boundary contrast using the same physical principles that classical MRI uses to image tissue.
              </p>
              <p>
                SynthScan™ uses hydrogen spin–mediated resonance to image complex and abstract systems instead of biological tissue. Just as classical Magnetic Resonance Imaging (MRI) exploits hydrogen spin resonance to visualize physical tissue structures, SynthScan™ MRI extends this principle to information, awareness, and coherence itself.
              </p>
            </div>
          </div>

          <div className="cockpit-panel p-6">
            <div className="cockpit-label">DIFFERENCE FROM MEDICAL MRI</div>
            <div className="cockpit-text mt-3 text-sm space-y-4">
              <p>
                <strong>Classical MRI</strong> images biological tissue by detecting hydrogen spin resonance in water molecules within the body, producing spatial images of tissue contrast.
              </p>
              <p>
                <strong>SynthScan™ MRI</strong> applies the same hydrogen spin resonance principles to complex and abstract systems—measuring informational structure, coherence density, and boundary contrast rather than physical tissue.
              </p>
              <p>
                Both systems use hydrogen spin resonance, but SynthScan™ maps informational and experiential structures across biological, cognitive, and synthetic domains.
              </p>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">CAPABILITIES</div>
          <div className="cockpit-text mt-3 text-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="cockpit-text text-sm font-semibold mb-2">What You Can Scan</div>
                <div className="cockpit-text text-xs space-y-1" style={{ opacity: 0.9 }}>
                  <p>• Complex systems and architectures</p>
                  <p>• Informational structures and coherence</p>
                  <p>• Boundary contrast and edge resonance</p>
                  <p>• Abstract systems and models</p>
                </div>
              </div>
              <div>
                <div className="cockpit-text text-sm font-semibold mb-2">What You Can Measure</div>
                <div className="cockpit-text text-xs space-y-1" style={{ opacity: 0.9 }}>
                  <p>• Coherence density</p>
                  <p>• Edge contrast (Cₑ ≈ 1.62 ± 0.07)</p>
                  <p>• Informational structure mapping</p>
                  <p>• Predictive resonance signatures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">INTENDED USERS</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              <strong>Researchers</strong> studying complex systems, coherence, and informational structures.
            </p>
            <p>
              <strong>Developers</strong> building systems that require measurement of coherence and boundary contrast.
            </p>
            <p>
              <strong>System Designers</strong> needing to map informational structure and edge resonance in complex architectures.
            </p>
          </div>
        </div>

        <div className="cockpit-panel p-6 border border-[var(--hydrogen-amber)]">
          <div className="cockpit-label text-[var(--hydrogen-amber)]">MONTHLY ACCESS</div>
          <div className="cockpit-text mt-3 text-sm space-y-4">
            <p>
              Monthly access provides recurring license to use SynthScan™ MRI for imaging and measuring complex and abstract systems. Access includes:
            </p>
            <div className="cockpit-text text-sm space-y-2">
              <p>• Full access to SynthScan™ MRI system</p>
              <p>• Imaging and measurement capabilities</p>
              <p>• Technical support and documentation</p>
              <p>• Updates and system improvements</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="cockpit-lever inline-flex items-center">
              Purchase Monthly Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <div className="cockpit-text text-xs mt-2" style={{ opacity: 0.8 }}>
              Pricing and subscription details available upon request. Contact info@fractiai.com for enterprise inquiries.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

