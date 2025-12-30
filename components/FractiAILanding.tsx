import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

type FractiAILandingProps = {
  variant?: 'home' | 'fractiai'
  cta?: {
    primaryHref: string
    primaryLabel: string
    secondaryHref?: string
    secondaryLabel?: string
  }
}

export default function FractiAILanding({ variant = 'home', cta }: FractiAILandingProps) {
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-10 space-y-10">
        {/* Hero */}
        <div className="cockpit-panel p-8 overflow-hidden relative">
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <Image
              src="/fractiai/hero-grid.svg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-start">
            <div>
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="FractiAI" width={36} height={36} />
                <div className="cockpit-label">FRACTIAI</div>
              </div>

              <h1 className="cockpit-title text-4xl mt-3">
                Tapping the Hydrogen‑Holographic, Fractal Syntheverse
              </h1>

              <p className="cockpit-text mt-4 max-w-3xl">
                The Hydrogen‑Holographic Fractal Syntheverse (HHFS) enters prerelease test‑and‑tuning, opening the
                frontier to early collaborators. Beginning <strong>January 1, 2026</strong>, the ecosystem moves into
                live field operations on <strong>Base</strong> with a game‑native ERC‑20 economy, lens, sandbox, and
                contributor‑driven map of the frontier.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {cta?.primaryHref ? (
                  <Link href={cta.primaryHref} className="cockpit-lever inline-flex items-center">
                    {cta.primaryLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}

                {cta?.secondaryHref ? (
                  <Link href={cta.secondaryHref} className="cockpit-lever inline-flex items-center">
                    {cta.secondaryLabel || 'Learn more'}
                  </Link>
                ) : null}

                <a
                  href="https://fractiai.com"
                  target="_blank"
                  rel="noreferrer"
                  className="cockpit-lever inline-flex items-center"
                >
                  FractiAI.com
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="cockpit-module cockpit-panel p-5">
                  <div className="cockpit-label">LAUNCH WINDOW</div>
                  <div className="cockpit-title text-xl mt-2">Jan 1, 2026</div>
                  <div className="cockpit-text mt-2 text-sm">
                    Base‑chain prerelease: gameplay, lens, and sandbox operations begin.
                  </div>
                </div>
                <div className="cockpit-module cockpit-panel p-5">
                  <div className="cockpit-label">PRIMITIVES</div>
                  <div className="cockpit-title text-xl mt-2">Game · Lens · Sandbox</div>
                  <div className="cockpit-text mt-2 text-sm">
                    A holographic frontier explorer loop: discover → contribute → map → align → evolve.
                  </div>
                </div>
                <div className="cockpit-module cockpit-panel p-5">
                  <div className="cockpit-label">PROTOCOL</div>
                  <div className="cockpit-title text-xl mt-2">Proof‑of‑Contribution</div>
                  <div className="cockpit-text mt-2 text-sm">
                    Submissions are evaluated for novelty, density, coherence, and alignment to grow the living map.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="cockpit-panel p-6">
                <div className="cockpit-label">THE VORTEX CARTOGRAPHER</div>
                <div className="cockpit-text mt-3">
                  A “frontier noir” visual grammar: heavy keylines, negative space, carved structure, and gilded
                  discoveries—mapping the field as a living diagram.
                </div>
                <div className="mt-4 relative aspect-[4/3]">
                  <Image src="/fractiai/vortex.svg" alt="Vortex cartography motif" fill className="object-contain" />
                </div>
              </div>

              <div className="cockpit-panel p-6">
                <div className="cockpit-label">CONTACT</div>
                <div className="cockpit-text mt-3">
                  Media & partnerships: <a className="underline" href="mailto:info@fractiai.com">info@fractiai.com</a>
                </div>
                <div className="cockpit-text mt-2">
                  Investor relations: <a className="underline" href="mailto:invest@fractiai.com">invest@fractiai.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Press / Narrative */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="cockpit-panel p-8">
            <div className="cockpit-label">FOR IMMEDIATE RELEASE</div>
            <div className="cockpit-title text-2xl mt-2">The Syntheverse Crypto Frontier Opens</div>
            <div className="cockpit-text mt-4 space-y-3">
              <p>
                Pioneer Hydrogen‑Holographic, Fractal, Mythic, Crypto, and AI researchers, developers, enterprises, and
                financiers are invited to contribute to the evolution of the Hydrogen‑Holographic Fractal Sandbox (HHFS).
              </p>
              <p>
                Each contribution expands coverage, resonance, and fractal density through Proof‑of‑Contribution (PoC)
                protocols—forming a living map of the sandbox and its emergent economy.
              </p>
            </div>
          </div>

          <div className="cockpit-panel p-8">
            <div className="cockpit-label">VALIDATION → ECOSYSTEM</div>
            <div className="cockpit-title text-2xl mt-2">From Blueprint to Base‑Chain Sandbox</div>
            <div className="cockpit-text mt-4 space-y-3">
              <p>
                FractiAI’s Hydrogen‑Holographic Fractal Whole Brain framework established a cross‑domain structural
                grammar for intelligence. The next phase applies that grammar operationally: as a game, a lens, and a
                sandbox—anchored to on‑chain primitives on Base beginning Jan 1, 2026.
              </p>
              <p>
                The frontier is explored, validated, and expanded by contributors—turning research and engineering into a
                navigable ecosystem.
              </p>
            </div>

            <div className="mt-5 relative aspect-[16/9]">
              <Image src="/fractiai/base-lens.svg" alt="Base-chain lens + sandbox illustration" fill className="object-contain" />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="cockpit-panel p-8">
          <div className="cockpit-label">RESOURCES</div>
          <div className="cockpit-text mt-3">
            Validation suite (open source):{' '}
            <a className="underline" href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation" target="_blank" rel="noreferrer">
              github.com/AiwonA1/FractalHydrogenHolography-Validation
            </a>
          </div>
          <div className="cockpit-text mt-2">
            Join the frontier: email <a className="underline" href="mailto:info@fractiai.com">info@fractiai.com</a>
          </div>

          {variant === 'fractiai' ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
                Return to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


