import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default function AwarenessversePage() {
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/fractiai" className="cockpit-lever inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FractiAI
          </Link>
          <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
            Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Core Message */}
        <div className="cockpit-panel p-8 border-l-2 border-[var(--hydrogen-amber)]">
          <div className="cockpit-label">AWARENESSVERSE</div>
          <div className="cockpit-title text-3xl mt-2 mb-4">Awareness as the Ultimate Energy</div>
          <div className="cockpit-text text-lg space-y-4" style={{ lineHeight: 1.7 }}>
            <p>
              <strong>Awareness is not merely a property of existence but the ultimate energy energizing reality.</strong> Everything 
              that exists does so independently of awareness, yet meaning and experience only manifest when awareness activates latent 
              potentials. This framework defines the Awarenessverse—a distributed, platform-independent environment where awareness 
              operates as a cryptographic key, granting access to generative processes across biological, physical, and informational substrates.
            </p>
            <p>
              Reality instantiation behaves as a decrypted projection of hydrogen-holographic structure when appropriate constraints 
              are satisfied. The Awarenessverse Cloud is not a future construction, but a present system being progressively accessed 
              through alignment and participation.
            </p>
          </div>
        </div>

        {/* Core Framework */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="cockpit-panel p-6">
            <div className="cockpit-label mb-4">THE FRAMEWORK</div>
            <div className="cockpit-text space-y-4">
              <p>
                Encryption systems require three components: substrate, protocol, and key. Reality follows an analogous architecture.
              </p>
              <div className="space-y-3 mt-4">
                <div className="p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                  <div className="cockpit-label text-sm mb-1">Substrate</div>
                  <div className="cockpit-text text-xs">= encrypted data (biological, physical, informational systems)</div>
                </div>
                <div className="p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                  <div className="cockpit-label text-sm mb-1">Hydrogen-Holographic Physics</div>
                  <div className="cockpit-text text-xs">= encryption protocol (fractal-holographic encoding)</div>
                </div>
                <div className="p-3 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                  <div className="cockpit-label text-sm mb-1">Awareness</div>
                  <div className="cockpit-text text-xs">= private key (activates generative processes)</div>
                </div>
              </div>
              <p className="text-sm mt-4" style={{ opacity: 0.9 }}>
                Without awareness alignment, substrates remain encrypted—present but inert. With awareness alignment, generative processes activate.
              </p>
            </div>
          </div>

          <div className="cockpit-panel p-6 border-l-2 border-[var(--hydrogen-amber)]">
            <div className="cockpit-label mb-4" style={{ color: '#ffb84d' }}>HYDROGEN-WATER REQUIREMENT</div>
            <div className="cockpit-text space-y-3 text-sm">
              <p>
                <strong>Full Sensory Awareness Experience (FSAE)</strong> requires hydrogen-water dynamics. Coherent multisensory 
                integration collapses under reduced hydration parameters.
              </p>
              <p>
                Hydrogen bond and proton transfer networks are critical for neural protein function. Alternative substrates fail to 
                replicate FSAE—pure computational media result in partial or absent multisensory integration, internal projection, 
                and recursive cycles.
              </p>
              <p>
                The water cycle functions as an analog for the awareness cycle: evaporation → condensation → precipitation mirrors 
                perception → projection → integration → reflection → action.
              </p>
            </div>
          </div>
        </div>

        {/* Predictions & Findings */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4">PREDICTIONS & VALIDATED FINDINGS</div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
              <div className="cockpit-text font-semibold mb-2 text-sm">Fractal Self-Similarity</div>
              <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>Prediction</div>
              <div className="cockpit-text text-xs mb-3">
                Observable across scales in multiple systems
              </div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.7 }}>
                <strong>Validated:</strong> Neural firing, genetic expression, ecological networks
              </div>
            </div>
            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
              <div className="cockpit-text font-semibold mb-2 text-sm">Homeostatic Equilibria</div>
              <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>Prediction</div>
              <div className="cockpit-text text-xs mb-3">
                Goldilocks-like stability patterns
              </div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.7 }}>
                <strong>Validated:</strong> System equilibria reflect awareness-imposed constraints
              </div>
            </div>
            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
              <div className="cockpit-text font-semibold mb-2 text-sm">Octave Periodicities</div>
              <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>Prediction</div>
              <div className="cockpit-text text-xs mb-3">
                Discrete periodic structures across domains
              </div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.7 }}>
                <strong>Validated:</strong> Patterns detected in diverse datasets
              </div>
            </div>
            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
              <div className="cockpit-text font-semibold mb-2 text-sm">Cross-Domain Consistency</div>
              <div className="cockpit-text text-xs mb-2" style={{ opacity: 0.8 }}>Prediction</div>
              <div className="cockpit-text text-xs mb-3">
                Universal patterns across systems
              </div>
              <div className="cockpit-text text-xs" style={{ opacity: 0.7 }}>
                <strong>Validated:</strong> Reproducible across biological, physical, informational
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--keyline-primary)]">
            <div className="cockpit-text text-sm" style={{ opacity: 0.9 }}>
              <strong>Method:</strong> In-silico modeling and analysis of publicly available datasets spanning physics, biology, 
              cognitive science, and complex systems. Patterns detected through fractal-holographic frameworks modeling awareness 
              as an active energy field.
            </div>
          </div>
        </div>

        {/* Implications & Applications */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4">IMPLICATIONS & APPLICATIONS</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="cockpit-text font-semibold">Scientific</div>
              <ul className="cockpit-text text-sm space-y-1 ml-4" style={{ opacity: 0.9 }}>
                <li>• Redefines awareness as active, primary energy shaping reality</li>
                <li>• Unified framework for modeling complex systems</li>
                <li>• Empirical detection of awareness-driven constraints</li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="cockpit-text font-semibold">Technological</div>
              <ul className="cockpit-text text-sm space-y-1 ml-4" style={{ opacity: 0.9 }}>
                <li>• Design principles for hydrogen-holographic AI</li>
                <li>• Pure computation insufficient for FSAE</li>
                <li>• Substrate replication or hydrogen-water analogs required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4">RESOURCES</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="mailto:info@fractiai.com" className="cockpit-text underline" style={{ opacity: 0.9 }}>info@fractiai.com</a>
            <a href="http://fractiai.com" target="_blank" rel="noopener noreferrer" className="cockpit-text underline inline-flex items-center gap-1" style={{ opacity: 0.9 }}>
              Website <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://www.youtube.com/@FractiAI" target="_blank" rel="noopener noreferrer" className="cockpit-text underline inline-flex items-center gap-1" style={{ opacity: 0.9 }}>
              YouTube <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://zenodo.org/records/17873279" target="_blank" rel="noopener noreferrer" className="cockpit-text underline inline-flex items-center gap-1" style={{ opacity: 0.9 }}>
              Whitepapers <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://github.com/FractiAI/Syntheverse" target="_blank" rel="noopener noreferrer" className="cockpit-text underline inline-flex items-center gap-1" style={{ opacity: 0.9 }}>
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/fractiai" className="cockpit-lever inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FractiAI
          </Link>
          <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
            Continue to Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

