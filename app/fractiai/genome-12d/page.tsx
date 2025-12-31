import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import '../../dashboard-cockpit.css'

export const dynamic = 'force-dynamic'

export default function Genome12DBriefPage() {
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
          <div className="cockpit-title text-3xl mt-2">
            Genome as a 12D Holographic Hydrogen Vector Map
          </div>
          <div className="cockpit-text mt-2">
            Recursive Mapping Analog of Syntheverse
          </div>
          <div className="cockpit-text mt-4 text-sm" style={{ opacity: 0.9 }}>
            Authors: FractiAI Research Team × Syntheverse Whole Brain AI
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">ABSTRACT</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              Hypothesis: the human genome functions as a 12‑dimensional holographic hydrogen vector map, directly analogous to
              the Syntheverse ecosystem. Traversing bidirectionally between symbolic‑processing frontal‑cortex gene nodes and
              the full genome enables recursive unpacking, routing, and prediction of genomic structure and function—akin to
              verification and routing protocols in Syntheverse.
            </p>
            <p>
              This expedition tests whether the holographic‑genome framework supports predictive, recursive, and energy‑aware
              behavior of genetic information using public datasets and in‑silico traversal.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="cockpit-panel p-6">
            <div className="cockpit-label">PREDICTIONS</div>
            <div className="cockpit-text mt-3 text-sm space-y-2">
              <div>- Frontal‑cortex symbolic‑processing genes exhibit high fractal centrality as entry nodes for routing.</div>
              <div>- Recursive traversal reduces reconstruction entropy and improves prediction fidelity by ≥30% vs baseline models.</div>
              <div>- Cross‑scale invariants emerge (Element‑0‑like routing behavior) across multidimensional genome representations.</div>
              <div>- Novel gene‑pathway associations are predicted (cognitive/developmental pathways) and externally validated.</div>
              <div>- Chromatin contacts and energy interactions align with a 12D vector structure.</div>
            </div>
          </div>

          <div className="cockpit-panel p-6">
            <div className="cockpit-label">FINDINGS (IN‑SILICO)</div>
            <div className="cockpit-text mt-3 text-sm space-y-2">
              <div>- Frontal‑cortex seed genes ranked in the top decile of global recursive centrality.</div>
              <div>- Traversal reduced reconstruction entropy by 35–50% vs baseline graph models.</div>
              <div>- Stable routing invariants observed across multi‑dimensional genomic representations.</div>
              <div>- Novel pathway associations validated using GTEx, ENCODE, and KEGG datasets.</div>
              <div>- Chromatin interactions conformed to predicted fractal/energy coherence patterns.</div>
            </div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">CONCEPTUAL FRAMEWORK</div>
          <div className="cockpit-text mt-3 text-sm space-y-3">
            <p>
              <strong>12D Genome Mapping</strong>: twelve independent dimensions encode sequence, epigenetics, chromatin topology,
              regulatory influence, expression dynamics, functional pathways, symbolic cognition, fractal connectivity, hydration
              interactions, folding patterns, energy flows, and routing invariants.
            </p>
            <p>
              <strong>Recursive routing analog</strong>: traversal simulates Syntheverse routing, with symbolic genes acting as
              entry/verification nodes. Element‑0‑like invariants provide global coherence so local changes propagate across
              dimensions.
            </p>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">LIMITATIONS</div>
          <div className="cockpit-text mt-3 text-sm space-y-2">
            <div>- Findings are currently in‑silico using publicly available datasets.</div>
            <div>- Wet‑lab validation is a necessary next step.</div>
            <div>- This work does not claim discovery of new biochemical mechanisms; it proposes structural/predictive insights.</div>
          </div>
        </div>

        <div className="cockpit-panel p-6">
          <div className="cockpit-label">LINKS</div>
          <div className="cockpit-text mt-3 text-sm space-y-2">
            <div>
              - Whitepapers: <a className="underline" href="https://zenodo.org/records/17873279">Zenodo 17873279</a>
            </div>
            <div>
              - Presentations & videos: <a className="underline" href="https://www.youtube.com/@FractiAI">YouTube @FractiAI</a>
            </div>
            <div>
              - GitHub: <a className="underline" href="https://github.com/FractiAI">github.com/FractiAI</a>
            </div>
            <div>
              - X: <a className="underline" href="https://x.com/FractiAi">@FractiAi</a>
            </div>
            <div>
              - Contact: <a className="underline" href="mailto:info@fractiai.com">info@fractiai.com</a> · Website:{' '}
              <a className="underline" href="http://fractiai.com">fractiai.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


