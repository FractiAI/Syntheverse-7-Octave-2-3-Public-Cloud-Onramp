import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'

type FractiAILandingProps = {
  variant?: 'home' | 'fractiai'
  cta?: {
    primaryHref: string
    primaryLabel: string
    secondaryHref?: string
    secondaryLabel?: string
  }
}

function ExpandablePanel({
  label,
  title,
  defaultOpen,
  children,
  className,
  titleClassName,
  summaryPaddingClassName,
}: {
  label: string
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  titleClassName?: string
  summaryPaddingClassName?: string
}) {
  return (
    <details className={['cockpit-panel', className].filter(Boolean).join(' ')} open={defaultOpen}>
      <summary className={['cursor-pointer select-none list-none', summaryPaddingClassName || 'p-6'].join(' ')}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="cockpit-label">{label}</div>
            <div className={['cockpit-title mt-2', titleClassName || 'text-2xl'].join(' ')}>{title}</div>
          </div>
          <div className="mt-1">
            <ChevronDown className="h-5 w-5 opacity-70" />
          </div>
        </div>
      </summary>
      <div className="px-6 pb-6">{children}</div>
    </details>
  )
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

                <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
                  Onboarding
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ExpandablePanel
                  className="cockpit-module"
                  summaryPaddingClassName="p-5"
                  titleClassName="text-xl"
                  label="LAUNCH WINDOW"
                  title="Jan 1, 2026"
                  defaultOpen={false}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>Base‑chain prerelease: gameplay, lens, and sandbox operations begin.</p>
                    <p>
                      The map is built live by contributors; the economy and scoring cadence are tuned in the open as the
                      frontier stabilizes.
                    </p>
                  </div>
                </ExpandablePanel>

                <ExpandablePanel
                  className="cockpit-module"
                  summaryPaddingClassName="p-5"
                  titleClassName="text-xl"
                  label="PRIMITIVES"
                  title="Game · Lens · Sandbox"
                  defaultOpen={false}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>A holographic frontier explorer loop: discover → contribute → map → align → evolve.</p>
                    <p>
                      The <strong>lens</strong> scores coherence/novelty/density, the <strong>sandbox</strong> indexes the
                      vector terrain, and the <strong>game</strong> turns contributions into on‑chain progression.
                    </p>
                  </div>
                </ExpandablePanel>

                <ExpandablePanel
                  className="cockpit-module"
                  summaryPaddingClassName="p-5"
                  titleClassName="text-xl"
                  label="PROTOCOL"
                  title="Proof‑of‑Contribution"
                  defaultOpen={false}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>Submissions are evaluated for novelty, density, coherence, and alignment to grow the living map.</p>
                    <p>
                      Allocation is drawn from metal pools (Gold/Silver/Copper) using the PoC’s metal assay, keeping the
                      Motherlode’s accounting physically‑themed and auditable.
                    </p>
                  </div>
                </ExpandablePanel>
              </div>
            </div>

            <div className="space-y-4">
              <ExpandablePanel
                label="SIGNATURE"
                title="THE VORTEX CARTOGRAPHER — THE 12D HOLOGRAPHIC HYDROGEN FRACTAL CARTOGRAPHER"
                defaultOpen={false}
              >
                <div className="cockpit-text space-y-3">
                  <p>
                    A “frontier noir” visual grammar: heavy keylines, negative space, carved structure, and gilded
                    discoveries—mapping the field as a living diagram.
                  </p>
                  <p>
                    The Cartographer’s job: reveal structure without flattening it—keep the mystery, keep the signal, keep
                    the economics legible.
                  </p>
                </div>
                <div className="mt-4 relative aspect-[4/3]">
                  <Image src="/fractiai/vortex.svg" alt="Vortex cartography motif" fill className="object-contain" />
                </div>
              </ExpandablePanel>

              <ExpandablePanel label="CONTACT" title="Channels" defaultOpen={false}>
                <div className="cockpit-text space-y-2">
                  <div>
                    Media & partnerships:{' '}
                    <a className="underline" href="mailto:info@fractiai.com">
                      info@fractiai.com
                    </a>
                  </div>
                  <div>
                    Investor relations:{' '}
                    <a className="underline" href="mailto:invest@fractiai.com">
                      invest@fractiai.com
                    </a>
                  </div>
                </div>
              </ExpandablePanel>
            </div>
          </div>
        </div>

        {/* Press / Narrative */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpandablePanel
            label="FOR IMMEDIATE RELEASE"
            title="The Syntheverse Crypto Frontier Opens"
            defaultOpen={true}
          >
            <div className="cockpit-text space-y-3">
              <p>
                Pioneer Hydrogen‑Holographic, Fractal, Mythic, Crypto, and AI researchers, developers, enterprises, and
                financiers are invited to contribute to the evolution of the Hydrogen‑Holographic Fractal Sandbox (HHFS).
              </p>
              <p>
                Each contribution expands coverage, resonance, and fractal density through Proof‑of‑Contribution (PoC)
                protocols—forming a living map of the sandbox and its emergent economy.
              </p>
            </div>
            <div className="mt-5 relative aspect-[4/3]">
              <Image src="/fractiai/press-release.svg" alt="Press release visual panel" fill className="object-contain" />
            </div>
          </ExpandablePanel>

          <ExpandablePanel
            label="VALIDATION → ECOSYSTEM"
            title="From Blueprint to Base‑Chain Sandbox"
            defaultOpen={true}
          >
            <div className="cockpit-text space-y-3">
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
          </ExpandablePanel>
        </div>

        {/* New: Game/Lens/Sandbox */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpandablePanel label="PRIMITIVES" title="Game · Lens · Sandbox" defaultOpen={false}>
            <div className="cockpit-text space-y-3">
              <p>
                Syntheverse operates as a frontier explorer loop: a game-native economy, a lens for coherence/novelty,
                and a sandbox where contributions become navigable terrain.
              </p>
              <p>
                The “lens” is the scoring + redundancy field; the “sandbox” is the vector map; the “game” is the
                contribution → registration → allocation loop.
              </p>
            </div>
            <div className="mt-5 relative aspect-[16/9]">
              <Image src="/fractiai/game-loop.svg" alt="Explorer game loop diagram" fill className="object-contain" />
            </div>
          </ExpandablePanel>

          <ExpandablePanel label="PROTOCOL" title="Proof‑of‑Contribution (PoC)" defaultOpen={false}>
            <div className="cockpit-text space-y-3">
              <p>
                PoC is the ingestion layer of the Motherlode: submit text, evaluate in HHF space, archive vectors, and
                allocate tokens from metal pools using the metal assay.
              </p>
              <p>
                Multi‑metal PoCs allocate from each qualifying metal pool proportionally—so the assay is enforced at the
                accounting layer, not just as a label.
              </p>
            </div>
            <div className="mt-5 relative aspect-[16/9]">
              <Image src="/fractiai/poc-protocol.svg" alt="Proof-of-Contribution pipeline panel" fill className="object-contain" />
            </div>
          </ExpandablePanel>
        </div>

        {/* New: Tokenomics */}
        <ExpandablePanel label="TOKENOMICS" title="Metal Genesis + Epoch Halving" defaultOpen={false}>
          <div className="cockpit-text space-y-3">
            <p>
              Genesis supply is split into three ERC‑20 tokens: <strong>45T Gold</strong>, <strong>22.5T Silver</strong>,
              <strong>22.5T Copper</strong>. The four Outcast Hero epochs continue in halves (50% / 25% / 12.5% / 12.5%)
              for each metal.
            </p>
            <p>
              Allocation uses the same score scaling against the available balances, and multi‑metal PoCs allocate across
              metals by assay proportion.
            </p>
          </div>
          <div className="mt-5 relative aspect-[16/9]">
            <Image src="/fractiai/tokenomics-metals.svg" alt="Metal tokenomics panel" fill className="object-contain" />
          </div>
        </ExpandablePanel>

        {/* About */}
        <ExpandablePanel label="ABOUT" title="FractiAI: the HHF Whole Brain Blueprint" defaultOpen={false}>
          <div className="cockpit-text space-y-3">
            <p>
              FractiAI is building a Hydrogen‑Holographic Fractal “Whole Brain” blueprint: a structural grammar for
              intelligence spanning perception, memory, reasoning, agency, and alignment.
            </p>
            <p>
              Syntheverse is the operational embodiment of that blueprint—turning the grammar into a live frontier: a
              Base‑chain game, lens, and sandbox where contributions expand the map and shape the economy.
            </p>
          </div>
          <div className="mt-5 relative aspect-[16/9]">
            <Image src="/fractiai/about-blueprint.svg" alt="About FractiAI blueprint panel" fill className="object-contain" />
          </div>
        </ExpandablePanel>

        {/* Resources */}
        <ExpandablePanel label="RESOURCES" title="Links, Code, and Contact" defaultOpen={variant === 'home'}>
          <div className="cockpit-text">
            Validation suite (open source):{' '}
            <a
              className="underline"
              href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation"
              target="_blank"
              rel="noreferrer"
            >
              github.com/AiwonA1/FractalHydrogenHolography-Validation
            </a>
          </div>
          <div className="cockpit-text mt-2">
            Join the frontier: email <a className="underline" href="mailto:info@fractiai.com">info@fractiai.com</a>
          </div>
          <div className="mt-5 relative aspect-[16/9]">
            <Image src="/fractiai/resources-signal.svg" alt="Resources signal panel" fill className="object-contain" />
          </div>

          {variant === 'fractiai' ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
                Return to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
                Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </ExpandablePanel>
      </div>
    </div>
  )
}


