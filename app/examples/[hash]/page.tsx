import { SectionWrapper } from '@/components/landing/shared/SectionWrapper';
import { Card } from '@/components/landing/shared/Card';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getExampleDetails(hash: string) {
  try {
    const contribution = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, hash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      return null;
    }

    const contrib = contribution[0];

    // Only allow public access to qualified submissions
    if (contrib.status !== 'qualified') {
      return null;
    }

    const md: any = (contrib.metadata as any) || {};

    return {
      submission_hash: contrib.submission_hash,
      title: contrib.title,
      contributor: contrib.contributor,
      category: contrib.category,
      metals: (contrib.metals as any) || null,
      status: contrib.status,
      created_at: contrib.created_at ? new Date(contrib.created_at).toISOString() : null,
      metadata: {
        pod_score: md.pod_score || null,
        novelty: md.novelty || null,
        density: md.density || null,
        coherence: md.coherence || null,
        alignment: md.alignment || null,
        qualified_epoch: md.qualified_epoch || null,
        classification: md.classification || null,
        redundancy_analysis: md.redundancy_analysis || null,
        metal_justification: md.metal_justification || null,
        grok_evaluation_details: md.grok_evaluation_details || null,
      },
    };
  } catch (error) {
    console.error('Error fetching example details:', error);
    return null;
  }
}

export default async function ExampleDetailPage({
  params,
}: {
  params: { hash: string };
}) {
  const example = await getExampleDetails(params.hash);

  if (!example) {
    notFound();
  }

  const metals = Array.isArray(example.metals) ? example.metals : [];
  const primaryMetal = metals[0] || 'N/A';
  const score = example.metadata.pod_score || 0;
  const novelty = example.metadata.novelty || 0;
  const density = example.metadata.density || 0;
  const coherence = example.metadata.coherence || 0;
  const alignment = example.metadata.alignment || 0;

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/examples"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Examples
        </Link>

        <SectionWrapper
          id="example-detail"
          eyebrow="EVALUATION REPORT"
          title={example.title || 'Untitled PoC'}
          background="default"
        >
          {/* Header Info */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="cockpit-label mb-1 text-xs">TOTAL SCORE</div>
              <div className="cockpit-title text-2xl">{score.toLocaleString()} / 10,000</div>
              <div className="cockpit-text mt-1 text-xs opacity-75">
                {score >= 8000
                  ? 'Founder Qualified'
                  : score >= 6000
                    ? 'Pioneer Qualified'
                    : score >= 5000
                      ? 'Community Qualified'
                      : score >= 4000
                        ? 'Ecosystem Qualified'
                        : 'Not Qualified'}
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="cockpit-label mb-1 text-xs">METAL ALIGNMENT</div>
              <div className="cockpit-title text-xl">{primaryMetal.toUpperCase()}</div>
              <div className="cockpit-text mt-1 text-xs opacity-75">
                {metals.length > 1 ? `${metals.length} metals` : 'Single metal'}
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="cockpit-label mb-1 text-xs">SUBMITTED</div>
              <div className="cockpit-title text-lg">
                {example.created_at
                  ? new Date(example.created_at).toLocaleDateString()
                  : 'Unknown'}
              </div>
              <div className="cockpit-text mt-1 text-xs opacity-75">
                {example.category || 'Research'}
              </div>
            </Card>
          </div>

          {/* Score Breakdown */}
          <Card hover={false} className="mb-8 border-2 border-[var(--hydrogen-amber)]/30">
            <h3 className="cockpit-title mb-4 text-lg">Score Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="cockpit-label mb-1 text-xs">Novelty</div>
                <div className="cockpit-title text-xl">{novelty.toLocaleString()} / 2,500</div>
                <div className="cockpit-text mt-1 text-xs opacity-75">
                  {((novelty / 2500) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="cockpit-label mb-1 text-xs">Density</div>
                <div className="cockpit-title text-xl">{density.toLocaleString()} / 2,500</div>
                <div className="cockpit-text mt-1 text-xs opacity-75">
                  {((density / 2500) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="cockpit-label mb-1 text-xs">Coherence</div>
                <div className="cockpit-title text-xl">{coherence.toLocaleString()} / 2,500</div>
                <div className="cockpit-text mt-1 text-xs opacity-75">
                  {((coherence / 2500) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="cockpit-label mb-1 text-xs">Alignment</div>
                <div className="cockpit-title text-xl">{alignment.toLocaleString()} / 2,500</div>
                <div className="cockpit-text mt-1 text-xs opacity-75">
                  {((alignment / 2500) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Classification */}
          {example.metadata.classification && (
            <Card hover={false} className="mb-8">
              <h3 className="cockpit-title mb-2 text-lg">Classification</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(example.metadata.classification) ? (
                  example.metadata.classification.map((cls: string, idx: number) => (
                    <span key={idx} className="cockpit-badge text-xs">
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="cockpit-badge text-xs">{example.metadata.classification}</span>
                )}
              </div>
            </Card>
          )}

          {/* Metal Justification */}
          {example.metadata.metal_justification && (
            <Card hover={false} className="mb-8">
              <h3 className="cockpit-title mb-2 text-lg">Metal Alignment Justification</h3>
              <p className="cockpit-text text-sm opacity-90 whitespace-pre-wrap">
                {example.metadata.metal_justification}
              </p>
            </Card>
          )}

          {/* Redundancy Analysis */}
          {example.metadata.redundancy_analysis && (
            <Card hover={false} className="mb-8 border-l-4 border-amber-500/50">
              <h3 className="cockpit-title mb-2 text-lg">Redundancy Analysis</h3>
              <p className="cockpit-text text-sm opacity-90 whitespace-pre-wrap">
                {example.metadata.redundancy_analysis}
              </p>
            </Card>
          )}

          {/* CTA */}
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
              Submit Your PoC
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scoring"
              className="cockpit-lever inline-flex items-center gap-2 bg-transparent"
            >
              Learn About Scoring
            </Link>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}

