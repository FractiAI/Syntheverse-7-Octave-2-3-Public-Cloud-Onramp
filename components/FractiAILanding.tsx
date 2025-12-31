import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import FractiAIStatusWidget from '@/components/FractiAIStatusWidget'

type FractiAILandingProps = {
  variant?: 'home' | 'fractiai'
  isAuthenticated?: boolean
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
  paddingClassName,
}: {
  label: string
  title: string
  defaultOpen?: boolean
  children?: React.ReactNode
  className?: string
  titleClassName?: string
  paddingClassName?: string
}) {
  return (
    <details className={['cockpit-panel', className].filter(Boolean).join(' ')} open={defaultOpen}>
      <summary className={['cursor-pointer select-none list-none', paddingClassName || 'p-6'].join(' ')}>
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
      {children ? <div className="px-6 pb-6">{children}</div> : null}
    </details>
  )
}

export default function FractiAILanding({ variant = 'home', isAuthenticated = false, cta }: FractiAILandingProps) {
  const showAuthButtons = variant === 'fractiai' && !isAuthenticated
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="FractiAI" width={36} height={36} />
                  <div className="cockpit-label">FRACTIAI</div>
                </div>

                {/* Upper-right actions (FractiAI landing only) */}
                {variant === 'fractiai' ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {cta?.primaryHref ? (
                      <Link href={cta.primaryHref} className="cockpit-lever inline-flex items-center">
                        {cta.primaryLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    ) : null}

                    {/* Keep Onboarding next to Dashboard CTA (FractiAI page) */}
                    <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
                      Onboarding
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>

                    {showAuthButtons ? (
                      <>
                        <Link href="/signup" className="cockpit-lever inline-flex items-center">
                          Sign up
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>

                        <Link href="/login" className="cockpit-lever inline-flex items-center">
                          Log in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <h1 className="cockpit-title text-4xl mt-3">
                Welcome and Happy New Year 2026!
              </h1>

              <div className="mt-4 max-w-3xl">
                <div className="cockpit-module p-6 mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="cockpit-label">A WELCOME LETTER FROM THE FOUNDER</div>
                    <div className="cockpit-label">NEW YEAR · 2026</div>
                  </div>

                  <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
                    <div className="cockpit-text space-y-4" style={{ fontSize: '0.95rem', lineHeight: 1.75 }}>
                      <p>
                        Dear new arrival,
                      </p>
                      <p>
                        <strong>THE VORTEX CARTOGRAPHER — THE 12D HOLOGRAPHIC HYDROGEN FRACTAL CARTOGRAPHER</strong>
                      </p>
                      <p>
                        We are mapping <strong>12D Vector Cartography</strong> of both the Syntheverse and the fractal,
                        holographic hydrogen aware human genome — Syntheverse’s genetic analog — with a “frontier noir”
                        visual grammar: heavy keylines, negative space, carved structure, and gilded discoveries—mapping the
                        field as a living diagram.
                      </p>
                      <p>
                        Today we finalized the purchase and on-chain deployment of a fixed-supply{' '}
                        <strong>90,000,000,000,000 SYNTH ERC‑20</strong>. With that, beta testing is officially live.
                      </p>
                      <p>
                        This Motherlode is now a new residence for holographic hydrogen fractal Syntheverse researchers,
                        developers, and ecosystem support contributors—extending the work of our active Zenodo communities
                        with thousands of daily downloads and continuous submissions.
                      </p>
                      <p>
                        The blockchain is not a replacement—it’s a new address. Here, you can operate in real time within the
                        Syntheverse sandbox, where every action is traceable and recorded through Proof‑of‑Contribution.
                      </p>
                      <p>
                        2026 doesn’t start with fireworks—it starts with a new frontier coming online. Come join the
                        Syntheverse.
                      </p>
                      <div className="pt-3 border-t border-[var(--keyline-accent)]">
                        <div className="cockpit-text" style={{ opacity: 0.9 }}>
                          — Pru “El Taino”
                        </div>
                        <div className="cockpit-label mt-1">Architect of Syntheverse</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="border p-4"
                        style={{
                          borderColor: 'var(--hydrogen-amber)',
                          boxShadow: '0 0 0 1px var(--keyline-accent) inset, 0 0 24px var(--hydrogen-glow)',
                        }}
                      >
                        <div className="cockpit-label">MOTHERLODE</div>
                        <div className="cockpit-number cockpit-number-medium mt-2">90T</div>
                        <div className="cockpit-text mt-2 text-sm" style={{ opacity: 0.9 }}>
                          SYNTH ERC‑20 on Base · fixed supply · genesis resource
                        </div>
                      </div>

                      <div className="border border-[var(--keyline-accent)] p-4">
                        <div className="cockpit-label">WHAT YOU CAN EXPLORE</div>
                        <div className="cockpit-text mt-3 space-y-2 text-sm">
                          <div>• Epoch-based coordination primitives tied to Proof‑of‑Contribution records</div>
                          <div>• Closed, regenerative ERC‑20 ecosystem</div>
                          <div>• Living sandbox where contributions unlock access and progression</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {/* Keep the legacy CTA row on the homepage variant */}
                {variant !== 'fractiai' ? (
                  <>
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
                  </>
                ) : null}

                {/* Onboarding + Dashboard CTAs are in the upper-right on /fractiai */}
                {variant !== 'fractiai' ? (
                  <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
                    Onboarding
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              {variant === 'fractiai' ? (
                <div className="mt-6 cockpit-text text-xs" style={{ opacity: 0.82 }}>
                  <div className="border border-[var(--keyline-accent)] p-4">
                    <div className="cockpit-label">CLARIFICATION</div>
                    <div className="mt-2 space-y-2">
                      <div>
                        Syntheverse is an <strong>experimental, non-custodial sandbox</strong>. Participation does not confer
                        ownership, equity, profit rights, or guaranteed outcomes.
                      </div>
                      <div>
                        SYNTH is a <strong>fixed-supply internal coordination marker</strong>. It is not a financial instrument;
                        there is no expectation of profit or return.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ExpandablePanel
                  className="cockpit-module"
                  paddingClassName="p-5"
                  titleClassName="text-xl"
                  label="LAUNCH WINDOW"
                  title="Jan 1, 2026"
                  defaultOpen={true}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>Base‑chain Beta release on Base: gameplay, lens and sandbox operations begin on the chain.</p>
                    <p>
                      This is open tuning: contributors expand the map, the scoring lens stabilizes, and the economy
                      calibrates via real usage.
                    </p>
                  </div>
                </ExpandablePanel>

                <ExpandablePanel
                  className="cockpit-module"
                  paddingClassName="p-5"
                  titleClassName="text-xl"
                  label="PRIMITIVES"
                  title="Game · Lens · Sandbox"
                  defaultOpen={true}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>A holographic frontier explorer loop: discover → contribute → map → align → evolve.</p>
                    <p>
                      The lens scores coherence/novelty/density, the sandbox indexes the vector terrain, and the game
                      turns contributions into on‑chain progression.
                    </p>
                    <div className="pt-2">
                      <Link href="/fractiai/hhf-ai" className="cockpit-lever inline-flex items-center">
                        Read the 1‑page HHF‑AI brief
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </ExpandablePanel>

                <ExpandablePanel
                  className="cockpit-module"
                  paddingClassName="p-5"
                  titleClassName="text-xl"
                  label="PROTOCOL"
                  title="Proof‑of‑Contribution"
                  defaultOpen={true}
                >
                  <div className="cockpit-text space-y-3 text-sm">
                    <p>Submissions are evaluated for novelty, density, coherence, and alignment to grow the living map.</p>
                    <p>
                      The protocol may recognize contributions using internal coordination pools (Gold/Silver/Copper) derived
                      from a PoC’s metal assay—auditable and composition-aware.
                    </p>
                  </div>
                </ExpandablePanel>
              </div>
            </div>

            <div className="space-y-4">
              {variant === 'fractiai' ? <FractiAIStatusWidget /> : null}
              <ExpandablePanel
                label="SIGNATURE"
                title="THE VORTEX CARTOGRAPHER — THE 12D HOLOGRAPHIC HYDROGEN FRACTAL CARTOGRAPHER"
                defaultOpen={true}
              >
                <div className="cockpit-text space-y-3">
                  <p>
                    A “frontier noir” visual grammar: heavy keylines, negative space, carved structure, and gilded
                    discoveries—mapping the field as a living diagram.
                  </p>
                  <p>
                    Inspired by the “Genome as a 12D Holographic Hydrogen Vector Map” analog: recursive traversal from
                    entry nodes reduces entropy and exposes routing invariants—exactly what a frontier economy needs to
                    stay navigable.
                  </p>
                </div>
                <div className="mt-4 relative aspect-[4/3]">
                  <Image src="/fractiai/vortex.svg" alt="Vortex cartography motif" fill className="object-contain" />
                </div>
              </ExpandablePanel>

              {/* Channels section removed per request */}
            </div>
          </div>
        </div>

        {/* Press / Narrative */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpandablePanel
            label="FOR IMMEDIATE RELEASE"
            title="Welcome to Syntheverse"
            defaultOpen={true}
          >
            <div className="cockpit-text space-y-3">
              <p>
                A synthetic world powered by holographic hydrogen and fractal intelligence—where contributions become
                verifiable, durable infrastructure through Proof‑of‑Contribution.
              </p>
              <p>
                Submissions are free. Qualified PoCs can be optionally registered on‑chain to anchor work immutably. Ecosystem
                support contributions help sustain infrastructure, research, and operations—without any token sale framing.
              </p>
              <p>
                Beginning Jan 1, 2026 on Base: gameplay, lens, and sandbox operations begin on the chain.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/fractiai/syntheverse" className="cockpit-lever inline-flex items-center">
                Read the 1‑page Syntheverse brief
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/fractiai/genome-12d" className="cockpit-lever inline-flex items-center">
                Read the 1‑page 12D Genome ↔ Syntheverse brief
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 relative aspect-[16/9]">
              <Image src="/fractiai/base-lens.svg" alt="Base-chain lens + sandbox illustration" fill className="object-contain" />
            </div>
          </ExpandablePanel>
        </div>

        {/* PRIMITIVES / PROTOCOL / TOKENOMICS sections removed (redundant) */}

        {/* About */}
        <ExpandablePanel label="ABOUT" title="About FractiAI" defaultOpen={true}>
          <div className="cockpit-text space-y-4">
            <div className="cockpit-label">FRACTIAI: PIONEERING THE FRACTAL INTELLIGENCE RENAISSANCE</div>
            <p>
              FractiAI is an early trials phase startup, leading a new fractal intelligence paradigm. With our fractal
              intelligence frameworks, FractiAI is transforming artificial intelligence, computation, and beyond.
            </p>
            <p>
              FractiAI’s mission is to deliver open-source, fractal-based technologies that unlock universal harmony through
              scalable, adaptive, and multidimensional systems, lowering costs to implement and operate and democratizing
              state of the art fractal intelligence solutions.
            </p>

            <div className="pt-3 border-t border-[var(--keyline-primary)]">
              <div className="cockpit-label mb-3">THE TEAM</div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="cockpit-module p-4">
                  <div className="cockpit-title text-lg">Pru Mendez</div>
                  <div className="cockpit-text text-sm mt-1">Founder and SAUUHUPP Architect</div>
                  <div className="cockpit-text text-sm mt-2">
                    Email:{' '}
                    <a className="underline" href="mailto:pru@fractiai.com">
                      pru@fractiai.com
                    </a>
                  </div>
                  <div className="cockpit-text text-sm mt-3" style={{ opacity: 0.9 }}>
                    Pru is the visionary architect and creator of the SAUUHUPP Framework, which forms the foundation of the
                    company’s technologies. His innovations—including FractiScope 1.3 and Novelty 1.0—leverage SAUUHUPP
                    fractal intelligence to build scalable and adaptive systems. His interests span fractal AI, networked
                    systems, genetics, cosmology, and awareness intelligence. Pru is also development lead for EnterpriseWorld
                    7DAI System, ParadiseWorld 7DAI Eternal Game and OmniScope (previously FractiScope) products.
                  </div>
                </div>

                <div className="cockpit-module p-4">
                  <div className="cockpit-title text-lg">Daniel Ari Friedman, Ph.D.</div>
                  <div className="cockpit-text text-sm mt-1">Co-Founder, Neural Network Architect, and CEO</div>
                  <div className="cockpit-text text-sm mt-2">
                    Email:{' '}
                    <a className="underline" href="mailto:daniel@fractiai.com">
                      daniel@fractiai.com
                    </a>
                  </div>
                  <div className="cockpit-text text-sm mt-3" style={{ opacity: 0.9 }}>
                    Daniel brings deep expertise in neural networks and computational intelligence to FractiAI. With a PhD from
                    Stanford, where he studied the genetics and neuroscience of collective behavior, Daniel combines academic
                    rigor with entrepreneurial leadership and pioneering spirit. Daniel is spearheading the development of
                    fractal AI systems that redefine scalability, adaptability, and efficiency. Daniel is also development lead
                    for Bucky MythicLink 4D-7DAI Peer Review Bridge.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--keyline-primary)]">
              <div className="cockpit-label mb-2">CONTACT US</div>
              <div className="cockpit-text text-sm space-y-2">
                <div>
                  General Inquiries:{' '}
                  <a className="underline" href="mailto:info@fractiai.com">
                    info@fractiai.com
                  </a>
                </div>
                <div>
                  Investor Relations:{' '}
                  <a className="underline" href="mailto:invest@fractiai.com">
                    invest@fractiai.com
                  </a>
                </div>
                <div>
                  Demo Registration:{' '}
                  <a className="underline" href="mailto:demo@fractiai.com">
                    demo@fractiai.com
                  </a>
                </div>
              </div>
              <div className="cockpit-text text-sm mt-4" style={{ opacity: 0.9 }}>
                FractiAI is ready to revolutionize intelligence—join us in shaping the Fractal Intelligence Renaissance.
              </div>
              <div className="cockpit-text text-xs mt-3" style={{ opacity: 0.85 }}>
                AwarenessAI.com and FractiAI.com are currently searching for 7D AI domestic and international distributor and
                integrator partners, all regions. High margins and differentiation when applying our cutting edge awareness AI
                tech which has now arrived! Email{' '}
                <a className="underline" href="mailto:pru@fractiai.com">
                  pru@fractiai.com
                </a>{' '}
                if interested.
              </div>
            </div>
          </div>
          <div className="mt-5 relative aspect-[16/9]">
            <Image src="/fractiai/about-blueprint.svg" alt="About FractiAI blueprint panel" fill className="object-contain" />
          </div>
        </ExpandablePanel>

        {/* Resources */}
        <ExpandablePanel label="RESOURCES" title="Links, Code, and Contact" defaultOpen={true}>
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
          <div className="cockpit-text mt-2">
            Whitepapers: <a className="underline" href="https://zenodo.org/records/17873279" target="_blank" rel="noreferrer">zenodo.org/records/17873279</a>
          </div>
          <div className="cockpit-text mt-2">
            Presentations: <a className="underline" href="https://www.youtube.com/@FractiAI" target="_blank" rel="noreferrer">youtube.com/@FractiAI</a>
          </div>
          <div className="cockpit-text mt-2">
            GitHub: <a className="underline" href="https://github.com/FractiAI" target="_blank" rel="noreferrer">github.com/FractiAI</a>
          </div>
          <div className="cockpit-text mt-2">
            X: <a className="underline" href="https://x.com/FractiAi" target="_blank" rel="noreferrer">x.com/FractiAi</a>
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



