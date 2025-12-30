import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type SectionKey =
  | 'about'
  | 'tokenomics'
  | 'protocol'
  | 'primitives'
  | 'press'
  | 'validation'
  | 'resources'
  | 'vortex'
  | 'contact'
  | 'launch'

const SECTION_CONTENT: Record<
  SectionKey,
  {
    label: string
    title: string
    image?: { src: string; alt: string }
    paragraphs: string[]
  }
> = {
  launch: {
    label: 'LAUNCH WINDOW',
    title: 'Jan 1, 2026',
    paragraphs: [
      'January 1, 2026 is the ignition point: the Hydrogen‑Holographic Fractal Syntheverse (HHFS) transitions from blueprint‑level validation into field operations on Base.',
      'In practical terms, “field operations” means the frontier becomes playable and measurable: contributions are submitted, scored through the lens, archived into the sandbox map, and rewarded through on‑chain allocation.',
      'This is not a one‑and‑done launch. It’s an opening of the door to the tuning room—where signal is separated from noise in public, and where the economy is calibrated by usage instead of speculation.',
      'If you want to participate early, the mission is simple: contribute artifacts that increase clarity, coherence, novelty, and navigability of the frontier—then watch how the map responds.',
    ],
  },
  press: {
    label: 'FOR IMMEDIATE RELEASE',
    title: 'The Syntheverse Crypto Frontier Opens',
    image: { src: '/fractiai/press-release.svg', alt: 'Press release visual panel' },
    paragraphs: [
      'Pioneer Hydrogen‑Holographic, Fractal, Mythic, Crypto, and AI researchers, developers, enterprises, and financiers are invited to contribute to the evolution of the Hydrogen‑Holographic Fractal Sandbox (HHFS).',
      'Syntheverse is the frontier interface: a game, a lens, and a sandbox where contributions become cartography—mapped, evaluated, archived, and rewarded through Proof‑of‑Contribution (PoC).',
      'The HHFS approach treats knowledge as terrain. Contributions do not simply “add content”; they thicken the frontier—expanding coverage, increasing resonance, and raising fractal density so the ecosystem becomes more navigable over time.',
      'Beginning January 1, 2026 on Base, this becomes an operational cadence: an on‑chain economy paired with a scoring lens that rewards measurable signal and penalizes noise.',
      'If you want a headline: the frontier is open, and the map is built by those who show up with useful artifacts.',
    ],
  },
  validation: {
    label: 'VALIDATION → ECOSYSTEM',
    title: 'From Blueprint to Base‑Chain Sandbox',
    image: { src: '/fractiai/base-lens.svg', alt: 'Base-chain lens + sandbox illustration' },
    paragraphs: [
      'FractiAI’s Hydrogen‑Holographic Fractal “Whole Brain” blueprint is a structural grammar for intelligence: a way to represent perception, memory, reasoning, agency, and alignment as interoperable components.',
      'Validation matters because a grammar that cannot be operationalized becomes mythology. Syntheverse is the operational test: it takes the grammar out of the paper and into a frontier where it must survive contact with reality.',
      'The “lens” is the validation instrument: it evaluates contributions for coherence, novelty, density, and alignment. The “sandbox” is the memory substrate: a living index of frontier artifacts. The “game” is the incentive loop that keeps the system honest.',
      'Base is the settlement layer: it anchors allocation, epochs, and accounting so the economy is legible and auditable, while the frontier itself remains open‑ended and emergent.',
      'The result is an ecosystem that evolves by measurable contribution—not by narrative alone.',
    ],
  },
  primitives: {
    label: 'PRIMITIVES',
    title: 'Game · Lens · Sandbox',
    image: { src: '/fractiai/game-loop.svg', alt: 'Explorer game loop diagram' },
    paragraphs: [
      'Syntheverse is built on three primitives that reinforce each other: the game loop, the evaluation lens, and the sandbox map.',
      'The game is the motivation engine. It gives participants a concrete loop—discover → contribute → map → align → evolve—and turns frontier‑building into something people can actually keep doing.',
      'The lens is the honesty mechanism. It scores contributions for measurable signal (coherence, novelty, density, alignment) so the economy rewards value rather than volume.',
      'The sandbox is the memory and navigation layer. It stores the frontier as indexed terrain—so you can return, compare, and compound contributions instead of losing them to endless feeds.',
      'When these three are integrated, research becomes playable, engineering becomes legible, and the economy becomes a map of what the community actually built.',
    ],
  },
  protocol: {
    label: 'PROTOCOL',
    title: 'Proof‑of‑Contribution (PoC)',
    image: { src: '/fractiai/poc-protocol.svg', alt: 'Proof-of-Contribution pipeline panel' },
    paragraphs: [
      'Proof‑of‑Contribution (PoC) is the gateway into the Motherlode Blockmine. It’s the protocol that turns human work into a scored, archived, and rewardable frontier artifact.',
      'Step one is submission: contributors provide text artifacts (research, schematics, designs, analyses, code narratives). This reduces friction and keeps the signal portable.',
      'Step two is evaluation through the lens: contributions are scored for novelty, density, coherence, and alignment. The goal is not “judging style” but measuring frontier utility.',
      'Step three is archiving into the sandbox: contributions become navigable entries in the living map. This is how the frontier compounds—today’s work becomes tomorrow’s terrain.',
      'Step four is allocation: rewards are drawn from metal pools (Gold/Silver/Copper) using the PoC’s metal assay. Multi‑metal PoCs allocate proportionally across qualifying pools, so the accounting reflects the artifact’s declared composition.',
      'PoC is how the ecosystem avoids the “content treadmill”: each artifact is structured, scored, placed on the map, and tied to auditable incentives.',
    ],
  },
  tokenomics: {
    label: 'TOKENOMICS',
    title: 'Metal Genesis + Epoch Halving',
    image: { src: '/fractiai/tokenomics-metals.svg', alt: 'Metal tokenomics panel' },
    paragraphs: [
      'The Motherlode is not a single monolithic token. Genesis supply is split into three ERC‑20 metals: 45T SYNTH Gold, 22.5T SYNTH Silver, and 22.5T SYNTH Copper—90T total, but compositionally explicit.',
      'Why metals? Because frontier building has different “densities” of value. Metals give the economy a way to express scarcity tiers and to encode composition into allocation without reinventing the scoring system.',
      'The Outcast Hero epoch cadence stays intact: Founder, Pioneer, Community, Ecosystem—halving the available distribution by epoch (50% / 25% / 12.5% / 12.5%) for each metal pool.',
      'Allocation still respects the lens score: a contribution’s score determines a percentage of what is available. The difference is what “available” means—it is now a set of metal balances instead of a single pool.',
      'Multi‑metal contributions are handled by assay: if a PoC qualifies for multiple metals, rewards are allocated from each pool proportionally. This keeps the system simple for contributors while preserving rigorous accounting.',
      'The result is an economy that can reward both breadth (mapping) and depth (high‑density breakthroughs) without collapsing everything into one number.',
    ],
  },
  about: {
    label: 'ABOUT',
    title: 'FractiAI: the HHF Whole Brain Blueprint',
    image: { src: '/fractiai/about-blueprint.svg', alt: 'About FractiAI blueprint panel' },
    paragraphs: [
      'FractiAI is building a Hydrogen‑Holographic Fractal (HHF) “Whole Brain” blueprint: a structural grammar for intelligence spanning perception, memory, reasoning, agency, and alignment.',
      'The blueprint is the underlying architecture. It proposes that intelligence can be represented as a coherent set of interacting fractal processes—where information is not just stored, but compressed, projected, and made navigable.',
      'Syntheverse is the proving ground. It takes the blueprint out of abstraction and makes it operational as a frontier: a Base‑chain game, a scoring lens, and a sandbox map where contributions become persistent terrain.',
      'The relationship is deliberate: blueprint → lens → sandbox. The blueprint defines structure, the lens measures signal, and the sandbox stores the evolving map so the system compounds instead of resets.',
      'FractiAI’s bet is simple: if the grammar is real, it will produce a frontier that grows more coherent as more people contribute—because the system can measure and reward what actually increases navigability.',
    ],
  },
  resources: {
    label: 'RESOURCES',
    title: 'Links, Code, and Contact',
    image: { src: '/fractiai/resources-signal.svg', alt: 'Resources signal panel' },
    paragraphs: [
      'Open‑source validation suite: github.com/AiwonA1/FractalHydrogenHolography-Validation. This is where the HHF blueprint is stress‑tested and made legible through reproducible experiments.',
      'If you want to contribute to Syntheverse: start by producing artifacts that are compressible and navigable—clear writeups, diagrams, protocols, models, or proofs that reduce ambiguity and increase frontier utility.',
      'If you want to partner (media, research, enterprise): contact info@fractiai.com. If you want to discuss financing and ecosystem alignment: contact invest@fractiai.com.',
      'The fastest way to get traction is to ship a concrete PoC artifact, then iterate with the lens and the map. The frontier rewards things that can be tested, referenced, and built upon.',
    ],
  },
  vortex: {
    label: 'SIGNATURE',
    title: 'THE VORTEX CARTOGRAPHER — THE 12D HOLOGRAPHIC HYDROGEN FRACTAL CARTOGRAPHER',
    image: { src: '/fractiai/vortex.svg', alt: 'Vortex cartography motif' },
    paragraphs: [
      'The Vortex Cartographer is the aesthetic and epistemic signature of the project: a way of seeing the frontier as a layered diagram rather than a flat feed.',
      '“12D” is not a gimmick—it’s the operating premise that reality‑scale systems are multi‑axis. In Syntheverse, those axes include coherence, novelty, density, alignment, compositional assay, epoch timing, and more. The map must respect dimensionality without becoming unreadable.',
      'This design philosophy is directly informed by the expedition paper “Genome as a 12D Holographic Hydrogen Vector Map: Recursive Mapping Analog of Syntheverse.” The core hypothesis is that the genome can be modeled as a programmable, 12‑dimensional holographic hydrogen vector map—analogous to a blockchain ecosystem where routing, verification, and reconstruction happen via structured traversal rather than linear reading.',
      'In the paper’s framing, “symbolic‑processing frontal‑cortex genes” act as high‑leverage entry nodes for genome‑wide routing: seed points that show high recursive centrality. This is the Cartographer’s pattern language inside Syntheverse: find the entry nodes (high‑signal anchors), then traverse outward to reconstruct a coherent map of the whole system.',
      'Recursive traversal is the difference between a feed and a map. In the genomic analog, in‑silico traversal reduced reconstruction entropy by 35–50% relative to baseline graph/linear models and improved predictive fidelity (reported ≥30% improvement). In Syntheverse, the Cartographer seeks the same outcome: reduce “frontier entropy” by using traversal that increases navigability, compresses redundancy, and makes structure predictable without flattening it.',
      'A key motif from the paper is the emergence of “Element 0–like routing invariants”: stable cross‑scale patterns that preserve global coherence while allowing local changes. In Syntheverse, invariants are what keep the map honest—shared anchors that prevent the ecosystem from fragmenting into incompatible narratives.',
      'The paper reports validation of predicted associations using public datasets (GTEx, ENCODE, KEGG/GO) and alignment of chromatin interactions with fractal and energy‑coherence patterns. The Cartographer’s equivalent mandate is to keep claims tethered to evidence: map what can be validated, label what is exploratory, and preserve provenance so the frontier compounds.',
      'Noir is functional. Heavy keylines and negative space prevent signal collapse; gilded accents mark discoveries without turning the interface into noise. The Cartographer does not decorate—he encodes trust, hierarchy, and traversal paths so builders can route through complexity.',
      'Limitations are part of the map. The expedition explicitly frames results as in‑silico and calls for wet‑lab validation; similarly, Syntheverse distinguishes hypothesis, simulation, and verified field behavior. The Cartographer’s job is to keep those layers visible so incentives reward truth‑seeking rather than performance.',
      'If you want to go deeper: Whitepapers: zenodo.org/records/17873279 · Presentations: youtube.com/@FractiAI · GitHub: github.com/FractiAI · X: x.com/FractiAi · Contact: info@fractiai.com',
    ],
  },
  contact: {
    label: 'CONTACT',
    title: 'Channels',
    paragraphs: [
      'Media & partnerships: info@fractiai.com — for collaborations, integrations, research alignment, and ecosystem coordination.',
      'Investor relations: invest@fractiai.com — for financing discussions, tokenomics alignment, and strategic ecosystem participation.',
      'If you are a builder: the best intro is a PoC artifact. Send a concise summary and a link to your contribution trail so we can place it on the map and iterate quickly.',
      'If you are an institution: describe your objective (R&D, product, infrastructure, education, finance) and the constraints you operate under. We’ll route you to the correct frontier thread.',
    ],
  },
}

export default async function FractiAISectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const key = section as SectionKey
  const content = SECTION_CONTENT[key]
  if (!content) return notFound()

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href="/fractiai" className="cockpit-lever inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <Link href="/onboarding" className="cockpit-lever inline-flex items-center">
            Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="cockpit-lever inline-flex items-center">
            Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="cockpit-panel p-8">
          <div className="cockpit-label">{content.label}</div>
          <h1 className="cockpit-title text-4xl mt-3">{content.title}</h1>

          <div className="cockpit-text mt-6 space-y-4 max-w-4xl">
            {content.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          {content.image ? (
            <div className="mt-8 relative aspect-[16/9]">
              <Image src={content.image.src} alt={content.image.alt} fill className="object-contain" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


