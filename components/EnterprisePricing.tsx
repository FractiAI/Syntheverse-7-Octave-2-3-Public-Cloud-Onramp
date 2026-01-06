'use client';

import Link from 'next/link';
import { ArrowRight, Info, Check } from 'lucide-react';
import { useState } from 'react';
import { Card } from './landing/shared/Card';

type PricingTier = {
  name: string;
  subtitle: string;
  nodeRange: string;
  pricePerNode: number;
  minNodes: number;
  maxNodes: number;
  features: string[];
  useCase: string;
  benefits: string[];
};

const pricingTiers: PricingTier[] = [
  {
    name: 'Pioneer',
    subtitle: 'For Early Adopting Solo Operators & Small Teams',
    nodeRange: '1-5 nodes',
    pricePerNode: 500,
    minNodes: 1,
    maxNodes: 5,
    features: [
      '5 nodes included',
      'Full SynthScan™ MRI evaluation',
      'Self-similar PoC scoring',
      'On-chain registration support',
      'Basic analytics dashboard',
    ],
    useCase:
      'Perfect for early adopting pioneers—independent researchers, solo operators, and small research teams interested in trialing their first frontier sandbox.',
    benefits: ['Low barrier to entry', 'Full protocol access', 'Scalable foundation'],
  },
  {
    name: 'Trading Post',
    subtitle: 'Early Adopting Growing Research Organizations',
    nodeRange: '6-25 nodes',
    pricePerNode: 400,
    minNodes: 6,
    maxNodes: 25,
    features: [
      'Next 20 nodes at $400/node',
      'Priority evaluation processing',
      'Advanced analytics',
      'Multi-contributor management',
      'Custom scoring lens options',
    ],
    useCase:
      'Ideal for early adopting pioneers—growing research organizations, engineering teams, and multi-contributor projects interested in trialing advanced PoC evaluation.',
    benefits: ['Volume discount', 'Enhanced collaboration tools', 'Priority support'],
  },
  {
    name: 'Settlement',
    subtitle: 'Early Adopting Established Enterprises',
    nodeRange: '26-125 nodes',
    pricePerNode: 300,
    minNodes: 26,
    maxNodes: 125,
    features: [
      'Next 100 nodes at $300/node',
      'Dedicated operator support',
      'Custom tokenization options',
      'Advanced vault management',
      'Enterprise analytics suite',
    ],
    useCase:
      'Designed for early adopting pioneers—established enterprises, large research institutions, and organizations interested in trialing enterprise-scale PoC evaluation systems.',
    benefits: ['Significant cost savings', 'Enterprise-grade features', 'Custom integrations'],
  },
  {
    name: 'Metropolis',
    subtitle: 'Early Adopting Large-Scale Operations',
    nodeRange: '126+ nodes',
    pricePerNode: 250,
    minNodes: 126,
    maxNodes: Infinity,
    features: [
      '100+ nodes at $250/node',
      'White-glove onboarding',
      'Custom protocol configurations',
      'Dedicated infrastructure',
      'Priority blockchain integration',
    ],
    useCase:
      'For early adopting pioneers—large-scale operations, multi-organization networks, and enterprises interested in trialing maximum-scale PoC evaluation with full customization.',
    benefits: ['Maximum efficiency', 'Custom solutions', 'Dedicated support team'],
  },
];

type EnterprisePricingProps = {
  sandboxId?: string;
  currentTier?: string;
  currentNodes?: number;
  onUpgrade?: () => void;
  showNarrative?: boolean;
  selectedNodeCount?: number;
  onNodeCountChange?: (count: number) => void;
};

export default function EnterprisePricing({
  sandboxId,
  currentTier,
  currentNodes,
  onUpgrade,
  showNarrative = true,
  selectedNodeCount,
  onNodeCountChange,
}: EnterprisePricingProps) {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(selectedNodeCount || 5);

  function getTierForNodes(nodeCount: number): PricingTier | null {
    if (nodeCount <= 5) return pricingTiers[0];
    if (nodeCount <= 25) return pricingTiers[1];
    if (nodeCount <= 125) return pricingTiers[2];
    return pricingTiers[3];
  }

  function calculatePrice(tier: PricingTier, nodeCount: number): number {
    if (nodeCount < tier.minNodes) return 0;
    if (tier.maxNodes !== Infinity && nodeCount > tier.maxNodes) {
      // Calculate across multiple tiers
      let total = 0;
      let remaining = nodeCount;

      for (const t of pricingTiers) {
        if (remaining <= 0) break;
        if (nodeCount > t.maxNodes) {
          const tierNodes = t.maxNodes - (t.minNodes - 1);
          total += tierNodes * t.pricePerNode;
          remaining -= tierNodes;
        } else {
          total += remaining * t.pricePerNode;
          break;
        }
      }
      return total;
    }

    const nodesInTier = Math.min(nodeCount, tier.maxNodes) - (tier.minNodes - 1);
    return nodesInTier * tier.pricePerNode;
  }

  async function handlePurchase(tier: PricingTier, nodeCount: number) {
    try {
      const res = await fetch('/api/enterprise/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.name,
          nodeCount,
          sandboxId: sandboxId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session');
    }
  }

  return (
    <div className="space-y-8">
      {/* Narrative Section */}
      {showNarrative && (
        <div className="cockpit-panel p-8">
          <div className="cockpit-label mb-4">INVITING EARLY ADOPTING PIONEERS, CREATORS & WORLDBUILDERS</div>
          <div className="cockpit-text space-y-4 text-base" style={{ lineHeight: 1.8 }}>
            <p>
              <strong>
                We&apos;re inviting early adopting pioneers, worldbuilder creators, and enterprises interested in trialing Enterprise HHF-AI
                Sandbox technology.
              </strong>{' '}
              Join us as we pioneer the future of contribution assessment and creative worldbuilding through hydrogen spin
              MRI-based PoC protocol on the blockchain.
            </p>
            <p>
              <strong>Worldbuilding Creator & Enterprise Application: Customized HHF-AI Sandbox & Ecosystem, Nested Within Syntheverse</strong>
            </p>
            <p>
              Enterprise PoC sandboxes are{' '}
              <strong>customized HHF-AI sandboxes and ecosystems</strong>, fully nested within
              Syntheverse. Each sandbox operates as a self-similar instance of the Syntheverse PoC
              protocol, following the same holographic hydrogen fractal principles and evaluation
              logic as the main <strong>SYNTH90T ERC-20 MOTHERLODE VAULT</strong>.
            </p>
            <p>
              <strong>For Worldbuilder Creators:</strong> Unleash your creativity with an{' '}
              <strong>infinite set of HHF-AI materials and substrates</strong>. Our creator package provides worldbuilders 
              with unlimited access to holographic hydrogen fractal AI resources, enabling you to build, iterate, and 
              refine your creative worlds with the same precision and coherence measurement that powers enterprise PoC evaluation. 
              Transform your creative vision into verifiable, on-chain contributions.
            </p>
            <p>
              <strong>Broadcast to Contributor Channels:</strong> Your enterprise sandbox accepts
              submissions from your contributor channels, creator communities, and worldbuilding teams with{' '}
              <strong>clear, transparent scoring</strong>. All contributions are evaluated using
              SynthScan™ MRI with the same HHF-AI lens that powers the main Syntheverse, ensuring
              consistent coherence measurement across the ecosystem.
            </p>
            <p>
              <strong>Aligned Tokenomics:</strong> Tokenomics are fully aligned with the SYNTH90T
              ERC-20 MOTHERLODE VAULT—same epoch structure (Founder, Pioneer, Trading Post,
              Settlement, Metropolis), metal assay system (Gold, Silver, Copper), and allocation
              logic. Your enterprise sandbox operates as a nested instance, maintaining protocol
              consistency while enabling customized deployment.
            </p>
            <p>
              <strong>Nodes are the new employees—and creative substrates.</strong> In the frontier sandbox model, each node
              represents a contributor slot or creative substrate—a position where research, engineering, alignment work, 
              or worldbuilding materials can be submitted, evaluated, and rewarded. Unlike traditional employment or creative tools, 
              nodes operate on Proof-of-Contribution: contributors and creators are evaluated by SynthScan™ MRI for
              coherence, novelty, and alignment, not hours worked, credentials held, or file sizes. This creates{' '}
              <strong>dramatic cost savings and efficiency gains</strong>—pay for coherent output and creative value,
              not time spent or storage used.
            </p>
            <p>
              <strong>Infinite HHF-AI Materials & Substrates for Creators:</strong> Worldbuilder creators get unlimited access 
              to HHF-AI materials, substrates, and evaluation resources. Each creative contribution—whether a worldbuilding document, 
              narrative structure, or conceptual framework—is evaluated using the same holographic hydrogen fractal AI lens, 
              ensuring your creative work achieves maximum coherence and generative value.
            </p>
            <p>
              <strong>Scale without limits.</strong> Add nodes as your organization or creative project grows. Each node
              can process unlimited contributions, evaluated in real-time by the same HHF-AI lens
              that powers the main Syntheverse. Start with 5 nodes, scale to 500, or beyond. The
              protocol adapts—whether you&apos;re building an enterprise research organization or an infinite creative world.
            </p>
            <p>
              <strong>On-chain registration:</strong> Each PoC registered on-chain incurs an
              internal processing cost of approximately <strong>$20</strong>. This covers blockchain
              transaction fees, gas costs, and protocol maintenance. Registration is optional but
              recommended for permanent anchoring within the SYNTH90T ERC-20 MOTHERLODE VAULT
              ecosystem.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Table */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4">PRICING TIERS</div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricingTiers.map((tier) => {
            const isCurrentTier = currentTier === tier.name;
            const defaultNodeCount = tier.maxNodes === Infinity ? 126 : tier.maxNodes;
            const tierNodeCount = expandedTier === tier.name ? nodeCount : defaultNodeCount;
            const monthlyPrice = calculatePrice(tier, tierNodeCount);

            return (
              <Card
                key={tier.name}
                hover={true}
                className={`relative border-l-4 ${
                  isCurrentTier
                    ? 'border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)]'
                    : 'border-[var(--keyline-primary)]'
                }`}
              >
                {isCurrentTier && (
                  <div className="cockpit-badge absolute right-2 top-2 text-xs">CURRENT</div>
                )}
                <div className="cockpit-title mb-1 text-xl">{tier.name}</div>
                <div className="cockpit-label mb-4 text-xs opacity-75">{tier.subtitle}</div>

                <div className="mb-4">
                  <div className="cockpit-title text-2xl">
                    ${tier.pricePerNode.toLocaleString()}
                  </div>
                  <div className="cockpit-text text-xs opacity-75">per node / month</div>
                  <div className="cockpit-text mt-2 text-xs opacity-60">{tier.nodeRange}</div>
                  {expandedTier === tier.name && (
                    <div className="cockpit-text mt-2 text-sm font-semibold text-[var(--hydrogen-amber)]">
                      ${monthlyPrice.toLocaleString()}/month
                    </div>
                  )}
                </div>

                <div className="mb-4 space-y-2">
                  {tier.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-[var(--hydrogen-amber)]" />
                      <span className="cockpit-text text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedTier(expandedTier === tier.name ? null : tier.name)}
                  className="cockpit-text mb-3 flex items-center gap-1 text-xs opacity-75 hover:opacity-100"
                >
                  <Info className="h-3 w-3" />
                  {expandedTier === tier.name ? 'Less' : 'More'} Details
                </button>

                {expandedTier === tier.name && (
                  <div className="mb-4 space-y-3 rounded border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3">
                    <div>
                      <div className="cockpit-label mb-1 text-xs">Use Case</div>
                      <div className="cockpit-text text-xs opacity-90">{tier.useCase}</div>
                    </div>
                    <div>
                      <div className="cockpit-label mb-1 text-xs">Key Benefits</div>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, idx) => (
                          <li key={idx} className="cockpit-text text-xs opacity-90">
                            • {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {expandedTier === tier.name && (
                  <div className="mb-4">
                    <label className="cockpit-label mb-2 block text-xs">Number of Nodes</label>
                    <input
                      type="number"
                      min={tier.minNodes}
                      max={tier.maxNodes === Infinity ? 1000 : tier.maxNodes}
                      value={nodeCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || tier.minNodes;
                        const clamped = Math.max(
                          tier.minNodes,
                          Math.min(count, tier.maxNodes === Infinity ? 1000 : tier.maxNodes)
                        );
                        setNodeCount(clamped);
                        onNodeCountChange?.(clamped);
                      }}
                      className="cockpit-input mb-2 w-full"
                    />
                    <div className="cockpit-text text-xs opacity-75">
                      Monthly: ${calculatePrice(tier, nodeCount).toLocaleString()}
                    </div>
                  </div>
                )}

                {expandedTier !== tier.name && (
                  <button
                    onClick={() => setExpandedTier(tier.name)}
                    className="cockpit-lever w-full text-center text-sm"
                  >
                    Select Package
                    <ArrowRight className="ml-2 inline h-4 w-4" />
                  </button>
                )}

                {expandedTier === tier.name && (
                  <div className="space-y-2">
                    <div className="cockpit-text rounded border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.1)] p-2 text-center text-xs font-semibold text-[var(--hydrogen-amber)]">
                      Total: ${monthlyPrice.toLocaleString()}/month
                    </div>
                    <button
                      onClick={() => handlePurchase(tier, nodeCount)}
                      className="cockpit-lever w-full text-center text-sm"
                    >
                      {isCurrentTier ? 'Manage Plan' : 'Start Trial'}
                      <ArrowRight className="ml-2 inline h-4 w-4" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Transaction Fee Note */}
        <div className="cockpit-panel mt-6 border-l-4 border-amber-500/50 bg-amber-500/5 p-4">
          <div className="cockpit-text space-y-2 text-xs opacity-90">
            <div>
              <strong>Submission Fees:</strong> Each contribution submission requires a separate
              evaluation fee (separate from monthly subscription). Fees vary by tier:{' '}
              <strong>Pioneer ($50)</strong>, <strong>Trading Post ($40)</strong>,{' '}
              <strong>Settlement ($30)</strong>, <strong>Metropolis ($25)</strong>. These are
              significantly lower than the main Syntheverse submission fee ($500) due to volume and
              subscription commitment.
            </div>
            <div>
              <strong>On-Chain Registration Fee:</strong> Each on-chain PoC registration incurs an
              internal processing cost of approximately <strong>$20</strong>. This covers blockchain
              transaction fees, gas costs, and protocol maintenance. Registration is optional but
              recommended for permanent anchoring.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
