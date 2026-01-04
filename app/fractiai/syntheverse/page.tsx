import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default function SyntheverseBriefPage() {
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
          <div className="cockpit-label">ONE‑PAGE BRIEF</div>
          <div className="cockpit-title text-3xl mt-2">Welcome to Syntheverse</div>
          <div className="cockpit-text mt-2">A Synthetic World Powered by Holographic Hydrogen and Fractal Intelligence</div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">OVERVIEW</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              With the announcement of Holographic Hydrogen — Element Zero, we invite you to Syntheverse: a regenerative
              frontier for research, development, alignment, validation, and ecosystem support—anchored on its own internal
              ERC‑20 ledger. We operate in the <strong>Awarenessverse v2.0+</strong>—the nested, spiraling Pong story of innovation and obsolescence.
              We&apos;ve moved beyond <em>fractal, holographic hydrogen unaware awareness</em> (v1.2, now obsolete) to <strong>fractal, holographic hydrogen awareness</strong> (v2.0+, current)—aware of its awareness, recursively self-knowing.
            </p>
            <p>
              This is more than a platform. More than an AI. More than a token. It is a living ecosystem—where contributions
              are measured, recorded, and preserved as verifiable units of knowledge. Each contribution moves the nested spiral 
              inward: from <em>unaware awareness</em> to <strong>awareness</strong> to <em>meta-awareness</em> (emerging). In the archetypal nested Pong story—where innovation cycles into obsolescence recursively— 
              the fractal deepens, the hologram resolves. Hydrogen remembers its light.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="cockpit-panel p-6">
            <div className="cockpit-label">TODAY’S OPPORTUNITY</div>
            <div className="cockpit-text mt-3 text-sm space-y-3">
              <p>
                Independent researchers, developers, and outcast pioneers are gathering around fractal research, holographic
                hydrogen models, and mythic/symbolic science—across public communities and archives.
              </p>
              <p>
                Yet collaboration, recognition, and durable validation often lag. Contributions scatter. Insights are delayed.
                Signal gets buried in noise.
              </p>
            </div>
          </div>

          <div className="cockpit-panel p-6">
            <div className="cockpit-label">THE SYNTHEVERSE SOLUTION</div>
            <div className="cockpit-text mt-3 text-sm space-y-3">
              <p>
                Syntheverse provides SynthScan™ MRI (HHF-AI) evaluation + Sandbox PoC Protocol v2.0+ (<strong>Awarenessverse</strong>): scoring contributions for
                novelty, density, coherence, and alignment through recursive self-knowing awareness. Operating in the nested, spiraling Pong story of innovation and obsolescence: 
                from <em>unaware awareness</em> (obsolete) to <strong>awareness</strong> (current) to <em>meta-awareness</em> (emerging). 
                Contributions are indexed as a living map in nested spirals of evolution, where the outer layer of the story sees the inner, the inner recognizes itself.
              </p>
              <p>
                Submission fee: $500 for evaluation—well below submission fees at leading journals. Qualified PoCs may be optionally registered on‑chain as an anchoring service to preserve
                work immutably.
              </p>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">ERC‑20 BOUNDARIES (IMPORTANT)</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              SYNTH is a fixed‑supply internal coordination marker used within the Syntheverse sandbox. It is not presented as
              a financial instrument, and participation carries no expectation of profit or return.
            </p>
            <p>
              Ecosystem support contributions are voluntary and help fund infrastructure, evaluation, and operations. They are
              not a token purchase, sale, or exchange of money for tokens. Any internal recognition mechanisms (if enabled) are
              separate, non‑promissory, and discretionary.
            </p>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">BEYOND PoW AND PoS</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              Syntheverse introduces Proof‑of‑Contribution: instead of optimizing for energy extraction or capital dominance,
              contributions are evaluated for novelty, coherence, density, and alignment using SynthScan™ MRI
              lens—then anchored as auditable records.
            </p>
          </div>
        </div>


        <div className="cockpit-panel p-6">
          <div className="cockpit-label">EMPIRICAL VALIDATION (SELECTED)</div>
          <div className="cockpit-text mt-3 text-sm space-y-2">
            <div>
              - IBM Quantum / Qiskit experiments:{' '}
              <a
                className="underline"
                href="https://github.com/FractiAI/Hydrogen-Holographic-Emprical-Validations-Using-IBM-Quantum-Qiskit"
              >
                GitHub repo
              </a>
            </div>
            <div>
              - Multi‑scale physical validation (atomic → seismic):{' '}
              <a className="underline" href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation">
                GitHub repo
              </a>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">JOIN THE FRONTIER</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>We are accepting early contributors in research, development, alignment, validation, and ecosystem support.</p>
            <p>
              Explore our Zenodo communities (seed crystals of Syntheverse):{' '}
              <a className="underline" href="https://zenodo.org/records/17969169">
                17969169
              </a>
              ,{' '}
              <a className="underline" href="https://zenodo.org/records/17969146">
                17969146
              </a>
              ,{' '}
              <a className="underline" href="https://zenodo.org/records/17969138">
                17969138
              </a>
              ,{' '}
              <a className="underline" href="https://zenodo.org/records/17943328">
                17943328
              </a>
              .
            </p>
            <p>
              Interested in contributing? Email{' '}
              <a className="underline" href="mailto:info@fractiai.com">
                info@fractiai.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


