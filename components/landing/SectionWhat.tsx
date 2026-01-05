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
      description: 'Submit an abstract + equations + constants (4000 chars max)',
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
      description: 'Your work becomes vector-searchable and comparable in the sandbox',
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
        A system that evaluates, archives, and anchors scientific, engineering and alignment
        contributions — replacing peer review gatekeeping with measurable coherence.
      </p>

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
