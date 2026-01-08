import { FileText, BarChart3, Map, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

export function SectionWhat() {
  const features = [
    {
      icon: FileText,
      title: 'Submit PoC',
      description: 'Submit research, creative work, or enterprise solutions — abstract + equations + constants (4000 chars max)',
    },
    {
      icon: BarChart3,
      title: 'Get Evaluation',
      description:
        'Receive scores for novelty, density, coherence, alignment + redundancy analysis',
    },
    {
      icon: Map,
      title: 'Archive & Map',
      description: 'Your work becomes vector-searchable and comparable in the Syntheverse Cloud',
    },
    {
      icon: LinkIcon,
      title: 'Register On-Chain',
      description: 'Anchor proof on Base Mainnet for permanence (free after qualification)',
      optional: true,
    },
  ];

  return (
    <SectionWrapper
      id="what-syntheverse-is"
      eyebrow="OVERVIEW"
      title="WHAT IS SYNTHEVERSE PoC?"
      background="muted"
    >
      <p className="cockpit-text mb-8 text-lg">
        <strong>For Frontier R&D:</strong> Turn research into verifiable on-chain records—no gatekeeping, measured by coherence. Contributions are liberated, visible and demonstrable to all via HHF-AI MRI science. <strong>For Enterprises:</strong> Syntheverse delivers <strong>1.5–1.8× higher coherent output per node</strong> with <strong>38–58% reduction in overhead</strong> compared to hierarchical systems. Replace traditional employment and management structures with contribution-indexed coordination that scales from solo operators to global enterprises. <strong>For Creators:</strong> A new infinite medium and materials for full reality worldbuilding creations. Access unlimited HHF-AI materials and substrates to build complete reality worlds.
      </p>

      <div className="cockpit-panel bg-[var(--hydrogen-amber)]/5 mb-8 border-l-4 border-[var(--hydrogen-amber)] p-6">
        <p className="cockpit-text mb-3 text-sm opacity-90">
          <strong>For Frontier R&D—Liberated Contributions:</strong> Through our hydrogen spin MRI-based PoC protocol, contributions are no longer gatekept. Every submission becomes <strong>visible and demonstrable to all</strong> via HHF-AI MRI science, creating transparent verification while maximizing Total Benefits Output (TBO) per node.
        </p>
        <p className="cockpit-text mb-3 text-sm opacity-90">
          <strong>For Enterprises—The Cost Savings:</strong> Contribution-indexed allocation ensures resources deploy only where value is created. Operational cost per node is far lower than alternatives—a tremendous discount to traditional employment/governance systems. No management overhead; coherence emerges from HHF constraints.
        </p>
        <p className="cockpit-text text-sm opacity-90">
          <strong>For Creators—The Infinite Medium:</strong> Syntheverse provides a new infinite medium and materials for full reality worldbuilding. Access unlimited HHF-AI materials, substrates, and holographic hydrogen fractal resources to create complete reality worlds without constraints.
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {features.map((feature, idx) => (
          <Card key={idx} hover={true}>
            <div className="flex items-start gap-4">
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,184,77,0.1)' }}>
                <feature.icon className="h-6 w-6" style={{ color: 'var(--hydrogen-amber)' }} />
              </div>
              <div className="flex-1">
                <h3 className="cockpit-title mb-2 text-base">
                  {feature.title}
                  {feature.optional && <span className="ml-2 text-xs opacity-60">(optional)</span>}
                </h3>
                <p className="cockpit-text text-sm opacity-80">{feature.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
          Submit Your PoC
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
