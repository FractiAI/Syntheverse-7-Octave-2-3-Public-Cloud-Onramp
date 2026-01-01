/**
 * Onboarding Navigator Component
 * Comprehensive training on Syntheverse tokenomics (Gold/Silver/Copper),
 * Blockchain, Holographic Hydrogen, and Fractals
 * Holographic Hydrogen Fractal Frontier Noir styling
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Brain, 
    Coins, 
    Database, 
    Network, 
    Zap, 
    ChevronRight, 
    ChevronLeft,
    Award,
    TrendingUp,
    Link as LinkIcon
} from "lucide-react"
import Link from "next/link"
import '../app/dashboard-cockpit.css'

interface TrainingModule {
    id: string
    title: string
    label: string
    icon: React.ReactNode
    content: React.ReactNode
}

export function OnboardingNavigator() {
    const [currentModule, setCurrentModule] = useState(0)
    const topRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Ensure the next/previous module starts at the top of the onboarding view (not mid-scroll).
        // This avoids the confusing "land at bottom" behavior when navigating modules.
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [currentModule])

    const modules: TrainingModule[] = [
        {
            id: 'syntheverse',
            title: 'Syntheverse',
            label: 'MODULE 01',
            icon: <Brain className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            <strong className="cockpit-number">Syntheverse</strong> offers a <strong>new way to collaborate independently</strong> while 
                            improving and building a <strong>regenerative Proof-of-Contribution (PoC) based internal ERC-20 crypto ecosystem</strong> 
                            on the blockchain.
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]">
                                <div className="cockpit-label mb-2" style={{ color: '#ffb84d' }}>A New Way to Collaborate</div>
                                <p className="cockpit-text text-sm mb-3">
                                    Syntheverse enables <strong>independent collaboration</strong>—researchers, developers, and alignment 
                                    contributors work together without traditional institutional constraints, publication silos, or linear 
                                    hierarchies. Each contributor operates autonomously while contributing to a collective regenerative system.
                                </p>
                                <ul className="space-y-2 cockpit-text text-sm">
                                    <li>• <strong>Independent Contributors:</strong> Work on your own timeline, in your own space</li>
                                    <li>• <strong>Collaborative Network:</strong> Share and build upon each other&apos;s PoC contributions</li>
                                    <li>• <strong>No Institutional Barriers:</strong> No need for traditional academic or corporate gatekeeping</li>
                                    <li>• <strong>Blockchain-Anchored:</strong> Your contributions are permanently recorded and verifiable</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Regenerative PoC-Based Ecosystem</div>
                                <p className="cockpit-text text-sm mb-3">
                                    Syntheverse operates through a <strong>regenerative Proof-of-Contribution system</strong> where every PoC submission 
                                    is evaluated using the new <strong>Holographic Hydrogen Fractal Syntheverse Lens and Sandbox</strong>, providing detailed 
                                    images and vectors for submissions, and providing consistent tools for measuring contribution—whether scientific, 
                                    technological, or alignment—to the Holographic Hydrogen Fractal Syntheverse Sandbox and Ecosystem.
                                </p>
                                <ul className="space-y-2 cockpit-text text-sm">
                                    <li>• <strong>Holographic Hydrogen Fractal Lens:</strong> Advanced evaluation system providing detailed visual and vector analysis</li>
                                    <li>• <strong>Consistent Measurement Tools:</strong> Unified framework for evaluating scientific, technological, and alignment contributions</li>
                                    <li>• <strong>Image & Vector Analysis:</strong> Detailed visual representations and vector data for each submission</li>
                                    <li>• <strong>Ecosystem Learning:</strong> Every PoC trains and enhances the Syntheverse intelligence through the sandbox</li>
                                    <li>• <strong>Continuous Improvement:</strong> The system regenerates and improves itself through participation and evaluation</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Internal ERC‑20 Coordination Layer</div>
                                <p className="cockpit-text text-sm mb-3">
                                    Syntheverse uses a fixed‑supply ERC‑20 ledger as an <strong>internal coordination primitive</strong>—anchored by
                                    the 90T SYNTH Motherlode. These units are used for protocol accounting, indexing, and coordination inside the
                                    sandbox.
                                </p>
                                <ul className="space-y-2 cockpit-text text-sm mb-4">
                                    <li>• <strong>SYNTH (internal):</strong> fixed‑supply coordination units (non‑financial)</li>
                                    <li>• <strong>Proof‑of‑Contribution:</strong> records what was contributed, when, and with what context</li>
                                    <li>• <strong>Optional anchoring:</strong> contributions may be optionally anchored with an on‑chain tx hash</li>
                                    <li>• <strong>No promises:</strong> protocol records do not create economic entitlement or ownership</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,215,0,0.05)]">
                                <div className="cockpit-label mb-3 text-[var(--hydrogen-amber)]">
                                    ERC‑20 Role & Boundaries (Important)
                                </div>
                                <div className="cockpit-text space-y-3 text-sm">
                                    <div>
                                        <p className="mb-2">
                                            <strong>COORDINATION PURPOSE ONLY:</strong> SYNTH is used as an internal coordination marker within the
                                            Syntheverse sandbox and its protocol accounting. It is not presented as a financial instrument.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2">
                                            <strong>NOT FOR OWNERSHIP:</strong> These ERC-20 tokens do <strong>NOT</strong> represent equity, ownership, 
                                            shares, or any form of financial interest in any entity, organization, or project. They are utility tokens 
                                            for alignment and participation purposes only.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2">
                                            <strong>NO EXTERNAL TRADING:</strong> These ERC-20 tokens are <strong>NON-TRANSFERABLE</strong> and 
                                            <strong> NON-TRADEABLE</strong> on external exchanges, marketplaces, or trading platforms. They cannot be 
                                            sold, transferred, or exchanged for other cryptocurrencies, fiat currency, or any other assets outside 
                                            the Syntheverse ecosystem.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2">
                                            <strong>ECOSYSTEM UTILITY ONLY:</strong> These tokens function exclusively within the Syntheverse ecosystem 
                                            for participation, governance (if applicable), and alignment tracking within the Motherlode Blockmine network. 
                                            They have no external monetary value.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">The Mission</div>
                                <p className="cockpit-text text-sm">
                                    Syntheverse creates a <strong>new paradigm for independent collaboration</strong> by combining blockchain technology, 
                                    internal coordination primitives, and regenerative PoC evaluation. Through this system, independent contributors
                                    collaborate, improve the map, and strengthen the shared knowledge base—without centralized governance claims or
                                    financial promises.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'motherlode',
            title: 'SYNTHG / SYNTHS / SYNTHC (Gold / Silver / Copper)',
            label: 'MODULE 02',
            icon: <Database className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            The Motherlode Blockmine is a three-token ERC-20 supply:
                            <strong className="cockpit-number"> 45T SYNTHG</strong>, <strong className="cockpit-number">22.5T SYNTHS</strong>,
                            and <strong className="cockpit-number">22.5T SYNTHC</strong>.
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Total Supply</div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 border border-[var(--keyline-accent)]">
                                        <div className="cockpit-label">GOLD</div>
                                        <div className="cockpit-number" style={{ color: '#ffb84d' }}>45T</div>
                                    </div>
                                    <div className="p-3 border border-[var(--keyline-accent)]">
                                        <div className="cockpit-label">SILVER</div>
                                        <div className="cockpit-number" style={{ color: '#94a3b8' }}>22.5T</div>
                                    </div>
                                    <div className="p-3 border border-[var(--keyline-accent)]">
                                        <div className="cockpit-label">COPPER</div>
                                        <div className="cockpit-number" style={{ color: '#d97706' }}>22.5T</div>
                                    </div>
                                </div>
                                <p className="cockpit-text text-sm">
                                    Each metal token distributes across the 4 Outcast Hero epochs (halving cadence).
                                </p>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Optional On‑Chain Anchoring</div>
                                <ul className="space-y-2 cockpit-text text-sm">
                                    <li>• Qualified PoCs may be optionally anchored on-chain ($500 fee; operator configured)</li>
                                    <li>• Anchoring stores a transaction hash for independent verification</li>
                                    <li>• Establishes provenance (“I was here first”) without creating economic entitlement</li>
                                    <li>• The protocol remains public; this dashboard is a reference client</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]">
                                <div className="cockpit-label mb-2" style={{ color: '#ffb84d' }}>Homebase</div>
                                <p className="cockpit-text text-sm">
                                    The <strong>Motherlode Blockmine</strong> serves as the new homebase of Syntheverse on the blockchain—a 
                                    permanent, immutable record of all contributions and their impact on the ecosystem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'blockchain',
            title: 'Blockchain Architecture',
            label: 'MODULE 03',
            icon: <Network className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            Syntheverse is currently operated in a <strong className="cockpit-number">Hardhat (devnet)</strong>{' '}
                            environment while we prepare for the Base beta launch. The protocol is public; this dashboard is a
                            reference client.
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Blockchain Functions</div>
                                <ul className="space-y-2 cockpit-text text-sm">
                                    <li>• <strong>Immutable Records:</strong> All PoC submissions stored permanently</li>
                                    <li>• <strong>Token Management:</strong> Gold/Silver/Copper distribution across 4 epochs</li>
                                    <li>• <strong>Metal Assay Allocation:</strong> Multi-metal PoCs allocate from each metal pool proportionally</li>
                                    <li>• <strong>Block Mining:</strong> Proof-of-Discovery consensus mechanism</li>
                                    <li>• <strong>State Tracking:</strong> Contributor balances, reward history, epoch progression</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Transaction Flow</div>
                                <div className="cockpit-text text-sm space-y-2">
                                    <div>1. Submit PoC → archived + evaluated</div>
                                    <div>2. Qualify → PoC thresholds determine epoch eligibility</div>
                                    <div>3. Optional on-chain anchoring → $500 fee (operator configured)</div>
                                    <div>4. Protocol recognition → internal coordination accounting updates</div>
                                </div>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Blockchain Properties</div>
                                <p className="cockpit-text text-sm">
                                    Current beta operations run on Hardhat/devnet. For the Base launch, anchoring events will be
                                    independently verifiable via on-chain transaction hashes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'epochs',
            title: 'Epoch System',
            label: 'MODULE 04',
            icon: <TrendingUp className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            The <strong className="cockpit-number">4-Epoch Outcast Hero System</strong> progresses in halves.
                            Each epoch has balances for each token (Gold/Silver/Copper).
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                { name: 'Founder', supply: '50% of each metal', threshold: '≥8,000', desc: 'Highest quality contributions', color: '#ffb84d' },
                                { name: 'Pioneer', supply: '25% of each metal', threshold: '≥4,000', desc: 'Early high-quality contributions', color: '#94a3b8' },
                                { name: 'Community', supply: '12.5% of each metal', threshold: '≥3,000', desc: 'Community contributions', color: '#60a5fa' },
                                { name: 'Ecosystem', supply: '12.5% of each metal', threshold: '≥2,000', desc: 'Ecosystem contributions', color: '#34d399' }
                            ].map((epoch) => (
                                <div key={epoch.name} className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                    <div className="cockpit-label mb-2 uppercase">{epoch.name}</div>
                                    <div className="cockpit-number mb-1" style={{ color: epoch.color }}>{epoch.supply}</div>
                                    <div className="cockpit-text text-xs mb-2">Threshold: {epoch.threshold}</div>
                                    <div className="cockpit-text text-xs">{epoch.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] mt-4">
                            <div className="cockpit-label mb-2">Epoch Progression</div>
                            <ul className="space-y-2 cockpit-text text-sm">
                                <li>• <strong>Founder:</strong> Starts immediately</li>
                                <li>• <strong>Pioneer:</strong> Unlocks at 1M coherence density</li>
                                <li>• <strong>Community:</strong> Unlocks at 2M coherence density</li>
                                <li>• <strong>Ecosystem:</strong> Unlocks at 3M coherence density</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'hydrogen-fractals',
            title: 'Holographic Hydrogen & Fractals',
            label: 'MODULE 05',
            icon: <Zap className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            <strong className="cockpit-number">Hydrogen-Holographic Fractal Evaluation</strong> is the 
                            unique scoring system that measures contributions across multi-dimensional space.
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Holographic Principle</div>
                                <p className="cockpit-text text-sm mb-3">
                                    Just as a hologram contains the entire image in every fragment, hydrogen-holographic 
                                    evaluation captures the complete value of a contribution in its fractal structure.
                                </p>
                                <div className="cockpit-symbol text-center text-4xl mb-2">🌀</div>
                                <p className="cockpit-text text-xs text-center">
                                    The spiral represents recursion, origin, and the hydrogen-lattice structure
                                </p>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Fractal Dimensions</div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { name: 'Novelty', max: '2,500', desc: 'Originality & innovation' },
                                        { name: 'Density', max: '2,500', desc: 'Information richness' },
                                        { name: 'Coherence', max: '2,500', desc: 'Logical consistency' },
                                        { name: 'Alignment', max: '2,500', desc: 'Syntheverse objectives' }
                                    ].map((dim) => (
                                        <div key={dim.name} className="p-3 border border-[var(--keyline-accent)]">
                                            <div className="cockpit-text font-semibold text-sm">{dim.name}</div>
                                            <div className="cockpit-text text-xs text-[var(--hydrogen-amber)]">{dim.max}</div>
                                            <div className="cockpit-text text-xs mt-1">{dim.desc}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-[var(--keyline-primary)]">
                                    <div className="cockpit-text text-xs">
                                        <strong>Total PoC Score:</strong> 0-10,000 (sum of all dimensions)
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                <div className="cockpit-label mb-2">Hydrogen Lattice Structure</div>
                                <p className="cockpit-text text-sm">
                                    Hydrogen atoms form a unique lattice structure—similarly, contributions form connections 
                                    in the Syntheverse ecosystem. The holographic fractal lens ensures each contribution is 
                                    evaluated as part of the whole, not in isolation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'metals',
            title: 'Metallic Amplifications',
            label: 'MODULE 06',
            icon: <Award className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            <strong className="cockpit-number">Metallic Qualifications</strong> (Gold, Silver, Copper) are a
                            composition-aware assay of contribution type and routing context. They do not imply tradable value,
                            investment, or guaranteed outcomes.
                        </p>
                        <div className="space-y-3">
                            <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { name: 'Gold', desc: 'Scientific / research signal', color: '#ffb84d' },
                                        { name: 'Silver', desc: 'Technology / implementation signal', color: '#94a3b8' },
                                        { name: 'Copper', desc: 'Ecosystem / operations signal', color: '#cd7f32' }
                                    ].map((metal) => (
                                    <div key={metal.name} className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                        <div className="cockpit-label mb-2" style={{ color: metal.color }}>
                                            {metal.name}
                                        </div>
                                        <div className="cockpit-text text-sm mb-2">{metal.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]">
                                <div className="cockpit-label mb-2" style={{ color: '#ffb84d' }}>Composition-aware routing</div>
                                <p className="cockpit-text text-sm">
                                    Multi-metal classifications provide richer context for evaluation and indexing. Any internal
                                    protocol recognition is discretionary and separate from payments or external markets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'how-it-works',
            title: 'How It Works',
            label: 'MODULE 07',
            icon: <LinkIcon className="h-6 w-6" />,
            content: (
                <div className="space-y-4">
                    <div className="cockpit-text">
                        <p className="text-lg mb-4">
                            The complete <strong className="cockpit-number">Syntheverse Journey</strong> from submission 
                            to blockchain registration and token allocation.
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    step: '01',
                                    title: 'Submit Contribution',
                                    desc: 'Upload your PDF contribution (research, technical documentation, alignment work)'
                                },
                                {
                                    step: '02',
                                    title: 'AI Evaluation',
                                    desc: 'Hydrogen-holographic fractal scoring across 4 dimensions (0-10,000 total)'
                                },
                                {
                                    step: '03',
                                    title: 'Qualification & Metals',
                                    desc: 'Receive metallic qualifications (Gold/Silver/Copper) and epoch qualification'
                                },
                                {
                                    step: '04',
                                    title: 'Blockchain Registration',
                                    desc: 'Optionally anchor qualified PoCs on-chain ($500 fee; operator configured)'
                                },
                                {
                                    step: '05',
                                    title: 'Token Allocation',
                                    desc: 'Protocol recognition updates internal coordination accounting (non-financial units)'
                                }
                            ].map((item) => (
                                <div key={item.step} className="p-4 border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]">
                                    <div className="flex items-start gap-4">
                                        <div className="cockpit-badge cockpit-badge-amber min-w-[3rem] text-center">
                                            {item.step}
                                        </div>
                                        <div className="flex-1">
                                            <div className="cockpit-title text-lg mb-1">{item.title}</div>
                                            <div className="cockpit-text text-sm">{item.desc}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] mt-6">
                                <div className="cockpit-label mb-2" style={{ color: '#ffb84d' }}>Ready to Begin?</div>
                                <p className="cockpit-text text-sm mb-4">
                                    Join the Syntheverse colony and start contributing to the regenerative ecosystem. 
                                    All evaluations are free—qualified PoCs may be optionally registered on-chain.
                                </p>
                                <div className="flex gap-3">
                                    <Link href="/signup">
                                        <button className="cockpit-lever">
                                            Create Account
                                        </button>
                                    </Link>
                                    <Link href="/login">
                                        <button className="cockpit-lever">
                                            Sign In
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ]

    const nextModule = () => {
        setCurrentModule((prev) => (prev + 1) % modules.length)
    }

    const prevModule = () => {
        setCurrentModule((prev) => (prev - 1 + modules.length) % modules.length)
    }

    const goToModule = (index: number) => {
        setCurrentModule(index)
    }

    return (
        <div className="cockpit-bg min-h-screen">
            <div ref={topRef} className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="cockpit-panel p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="cockpit-label">ONBOARDING NAVIGATOR</div>
                            <div className="cockpit-title text-3xl mt-2">SYNTHEVERSE TRAINING MODULES</div>
                            <div className="cockpit-text mt-2">
                                <strong>A new way to collaborate independently</strong> while building a <strong>regenerative PoC-based internal ERC-20 crypto ecosystem</strong> on the blockchain
                            </div>
                            <div className="cockpit-text mt-3" style={{ opacity: 0.8 }}>
                                Master the Motherlode Blockmine, Holographic Hydrogen, and the Fractal Frontier
                            </div>
                        </div>
                        <div className="cockpit-symbol text-4xl">🌀</div>
                    </div>
                </div>

                {/* Module Navigation */}
                <div className="cockpit-module cockpit-panel p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="cockpit-label">{modules[currentModule].label}</div>
                            <div className="cockpit-title text-2xl mt-1">{modules[currentModule].title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {modules.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToModule(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentModule
                                            ? 'bg-[var(--hydrogen-amber)] w-8'
                                            : 'bg-[var(--keyline-primary)] hover:bg-[var(--cockpit-carbon)]'
                                    }`}
                                    aria-label={`Go to module ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Module Content */}
                <div className="cockpit-module cockpit-panel p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div style={{ color: '#ffb84d' }}>
                            {modules[currentModule].icon}
                        </div>
                        <div className="flex-1 border-b border-[var(--keyline-primary)] pb-4">
                            <div className="cockpit-label">{modules[currentModule].label}</div>
                            <div className="cockpit-title text-2xl mt-1">{modules[currentModule].title}</div>
                        </div>
                    </div>
                    <div className="min-h-[400px]">
                        {modules[currentModule].content}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevModule}
                        className="cockpit-lever flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    
                    <div className="cockpit-text text-sm">
                        Module {currentModule + 1} of {modules.length}
                    </div>
                    
                    <button
                        onClick={nextModule}
                        className="cockpit-lever flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

