import { SectionWrapper } from '@/components/landing/shared/SectionWrapper';
import { Card } from '@/components/landing/shared/Card';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function getPublicExamples() {
  try {

    const rows = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        metals: contributionsTable.metals,
        metadata: contributionsTable.metadata,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .where(eq(contributionsTable.status, 'qualified'))
      .orderBy(desc(contributionsTable.created_at))
      .limit(6);

    return rows.map((r) => {
      const md: any = (r.metadata as any) || {};
      return {
        submission_hash: r.submission_hash,
        title: r.title,
        contributor: r.contributor,
        metals: (r.metals as any) || null,
        pod_score:
          typeof md.pod_score === 'number'
            ? md.pod_score
            : md.pod_score
              ? Number(md.pod_score)
              : null,
        qualified_epoch: md.qualified_epoch ? String(md.qualified_epoch) : null,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error fetching public examples:', error);
    return [];
  }
}

export default async function ExamplesPage() {
  const examples = await getPublicExamples();

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
          id="examples"
          eyebrow="PROOF LIBRARY"
          title="Example PoC Submissions"
          background="default"
        >
          <p className="cockpit-text mb-8 text-base opacity-90">
            Browse qualified Proof-of-Contribution submissions to see how SynthScan™ MRI evaluates
            research, engineering, and alignment work.
          </p>

          {examples.length === 0 ? (
            <Card hover={false} className="border-2 border-amber-500/50 bg-amber-500/5">
              <p className="cockpit-text text-center">
                No examples available yet. Be the first to submit a qualified PoC!
              </p>
              <div className="mt-4 flex justify-center">
                <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
                  Submit Your PoC
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {examples.map((example: any) => {
                const metals = Array.isArray(example.metals) ? example.metals : [];
                const primaryMetal = metals[0] || 'N/A';
                const score = example.pod_score || 0;

                return (
                  <Card key={example.submission_hash} hover={true}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="cockpit-badge text-xs">
                        {primaryMetal.toUpperCase()}
                      </span>
                      <span className="cockpit-label text-xs">Score: {score.toLocaleString()}</span>
                    </div>
                    <h3 className="cockpit-title mb-2 text-base">{example.title || 'Untitled'}</h3>
                    <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="opacity-60">Contributor:</span>{' '}
                        <strong className="font-mono text-xs">
                          {example.contributor
                            ? example.contributor.split('@')[0] + '@...'
                            : 'Anonymous'}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-60">Date:</span>{' '}
                        <strong>
                          {example.created_at
                            ? new Date(example.created_at).toLocaleDateString()
                            : 'N/A'}
                        </strong>
                      </div>
                    </div>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
                    >
                      View Full Evaluation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}

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

