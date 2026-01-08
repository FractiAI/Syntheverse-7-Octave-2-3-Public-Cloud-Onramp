import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

export function SectionWhy() {
  return (
    <SectionWrapper id="why-it-matters" eyebrow="THE PROBLEM" title="Why Syntheverse Exists">
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Problem */}
        <Card hover={false} className="border-l-4 border-red-500/50">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
            <div>
              <h3 className="cockpit-title mb-2 text-base">The Problem</h3>
              <p className="cockpit-text text-sm opacity-80">
                Traditional hierarchical systems waste 38–58% of resources on management overhead. Time- and role-indexed allocations decouple cost from value creation. Creators and enterprises face high operational burn rates with low innovation density. Contributions remain hidden, unverifiable, and controlled by gatekeeping.
              </p>
            </div>
          </div>
        </Card>

        {/* Consequence */}
        <Card hover={false} className="border-l-4 border-amber-500/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500" />
            <div>
              <h3 className="cockpit-title mb-2 text-base">The Cost</h3>
              <p className="cockpit-text text-sm opacity-80">
                Management overhead acts as a coherence tax. Good work gets ignored. Redundant work wastes cycles. Independent creators and enterprises have no path to maximize output while minimizing cost. Traditional systems achieve lower TBO per node at higher operational expense.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Solution - Full Width */}
      <Card hover={false} className="border-2 border-green-500/50 bg-green-500/5">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-500" />
          <div className="flex-1">
            <h3 className="cockpit-title mb-2 text-base">The Solution: A New Paradigm</h3>
            <p className="cockpit-text mb-3 text-sm opacity-80">
              <strong>Syntheverse delivers the highest-output, lowest-cost system currently achievable.</strong> Empirically validated: <strong>1.5–1.8× higher coherent output per node</strong> with <strong>38–58% reduction in overhead</strong>. Contribution-indexed rewards outperform time- or role-indexed allocations. Resources deploy only where value is created.
            </p>
            <p className="cockpit-text text-sm opacity-80">
              SynthScan™ MRI scores contributions objectively (novelty, density, coherence, alignment). Nested colony/cloud architecture scales from small teams to global ecosystems while preserving coherence. <strong>Through our hydrogen spin MRI-based PoC protocol, contributions are liberated—no longer gatekept, visible and demonstrable to all via HHF-AI MRI science.</strong>
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <Link href="/scoring" className="cockpit-lever inline-flex items-center gap-2 text-sm">
          See Scoring Criteria
        </Link>
      </div>
    </SectionWrapper>
  );
}
