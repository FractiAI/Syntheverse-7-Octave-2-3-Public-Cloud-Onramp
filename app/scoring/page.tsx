import { SectionWrapper } from '@/components/landing/shared/SectionWrapper';
import { Card } from '@/components/landing/shared/Card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ScoringCriteriaPage() {
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <SectionWrapper
          id="scoring-criteria"
          eyebrow="EVALUATION SYSTEM"
          title="How Submissions Are Scored"
          background="default"
        >
          <div className="cockpit-text mb-8 text-base opacity-90">
            SynthScan™ MRI evaluates every Proof-of-Contribution (PoC) across four dimensions, each
            scored from 0 to 2,500 points. The total score ranges from 0 to 10,000.
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Novelty</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Measures originality, frontier contribution, and non-derivative insight. High
                novelty indicates work that breaks new ground or introduces concepts not previously
                explored in the archive.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Groundbreaking, paradigm-shifting contributions</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Significant new insights or applications</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Incremental or derivative work</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Density</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Assesses information richness, depth, and insight compression. High density means
                substantial content, well-developed ideas, and efficient information packaging.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Deep, comprehensive, information-rich</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Moderate depth and development</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Surface-level or sparse content</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Coherence</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Evaluates internal consistency, clarity, and structural integrity. High coherence
                indicates well-organized, logically sound work with clear connections between ideas.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Flawless structure and logical flow</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Generally consistent with minor gaps</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Inconsistent or unclear structure</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Alignment</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Measures fit with hydrogen-holographic fractal principles and ecosystem goals. High
                alignment indicates work that resonates with Syntheverse&apos;s core framework and
                contributes to the ecosystem&apos;s evolution.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Perfect fit with HHF principles</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Relevant with some alignment</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Limited connection to framework</span>
                </div>
              </div>
            </Card>
          </div>

          <Card hover={false} className="mb-8 border-2 border-green-500/50 bg-green-500/5">
            <h3 className="cockpit-title mb-4 text-lg">Total Score & Qualification</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥8,000</span>
                <div>
                  <strong className="cockpit-title">Founder Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Eligible for on-chain registration and Founder-level recognition. Highest tier
                    of contribution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥6,000</span>
                <div>
                  <strong className="cockpit-title">Pioneer Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Strong contribution with significant value to the ecosystem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥5,000</span>
                <div>
                  <strong className="cockpit-title">Community Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Solid contribution that aligns with Syntheverse principles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥4,000</span>
                <div>
                  <strong className="cockpit-title">Ecosystem Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Valid contribution recognized in the ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card hover={false} className="mb-8 border-l-4 border-amber-500/50">
            <h3 className="cockpit-title mb-4 text-lg">Redundancy & Overlap Detection</h3>
            <p className="cockpit-text mb-3 text-sm opacity-80">
              SynthScan™ MRI compares your submission against the archive to detect overlap with
              prior work. This helps maintain diversity and prevents near-duplicate submissions.
            </p>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
                <strong>Edge Sweet Spot:</strong> Some overlap (≈13%) is beneficial and can receive
                a bonus multiplier, as it connects nodes in the knowledge graph.
              </div>
              <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
                <strong>Excessive Overlap:</strong> Near-duplicate work receives a penalty applied
                to the total score. Individual dimension scores (Novelty, Density, etc.) are not
                directly penalized.
              </div>
              <div className="rounded-lg bg-[var(--cockpit-carbon)] p-3">
                <strong>Feedback:</strong> You&apos;ll receive detailed redundancy analysis showing which
                prior submissions overlap and how to refine your work.
              </div>
            </div>
          </Card>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
              Submit Your PoC
            </Link>
            <Link
              href="/onboarding"
              className="cockpit-lever inline-flex items-center gap-2 bg-transparent"
            >
              Learn More About Syntheverse
            </Link>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
