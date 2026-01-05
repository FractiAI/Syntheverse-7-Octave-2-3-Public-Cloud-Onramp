'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionWrapper } from './landing/shared/SectionWrapper';
import { Card } from './landing/shared/Card';

type EnterpriseContributionDetailProps = {
  submissionHash: string;
  isAuthenticated?: boolean;
  userEmail?: string | null;
};

type Contribution = {
  submission_hash: string;
  sandbox_id: string;
  title: string;
  contributor: string;
  text_content: string | null;
  status: string;
  category: string | null;
  metals: string[] | null;
  metadata: {
    pod_score?: number;
    novelty?: number;
    density?: number;
    coherence?: number;
    alignment?: number;
    qualified?: boolean;
    qualified_epoch?: string;
    classification?: string[];
    redundancy_analysis?: string;
    metal_justification?: string;
    grok_evaluation_details?: any;
    raw_grok_response?: string;
  };
  created_at: string;
  updated_at: string;
};

type Sandbox = {
  id: string;
  name: string;
};

export default function EnterpriseContributionDetail({
  submissionHash,
  isAuthenticated = false,
  userEmail = null,
}: EnterpriseContributionDetailProps) {
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchContribution();
  }, [submissionHash]);

  async function fetchContribution() {
    try {
      const res = await fetch(`/api/enterprise/contributions/${submissionHash}`);
      if (res.ok) {
        const data = await res.json();
        setContribution(data.contribution);
        if (data.contribution?.sandbox_id) {
          fetchSandbox(data.contribution.sandbox_id);
        }
      }
    } catch (error) {
      console.error('Error fetching contribution:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSandbox(sandboxId: string) {
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}`);
      if (res.ok) {
        const data = await res.json();
        setSandbox(data.sandbox);
      }
    } catch (error) {
      console.error('Error fetching sandbox:', error);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-bg min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="cockpit-panel p-6">
            <div className="cockpit-text text-sm opacity-75">Loading contribution...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="cockpit-bg min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <Card hover={false} className="border-l-4 border-red-500/50">
            <div className="cockpit-title mb-2 text-lg">Contribution Not Found</div>
            <div className="cockpit-text text-sm opacity-90">
              The requested contribution could not be found.
            </div>
            <Link
              href="/fractiai/enterprise-dashboard"
              className="cockpit-lever mt-4 inline-flex items-center text-sm"
            >
              Back to Dashboard
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const score = contribution.metadata?.pod_score || 0;
  const novelty = contribution.metadata?.novelty || 0;
  const density = contribution.metadata?.density || 0;
  const coherence = contribution.metadata?.coherence || 0;
  const alignment = contribution.metadata?.alignment || 0;
  const qualified = contribution.status === 'qualified';
  const metals = Array.isArray(contribution.metals) ? contribution.metals : [];

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href={sandbox ? `/enterprise/sandbox/${contribution.sandbox_id}` : '/fractiai/enterprise-dashboard'}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {sandbox ? `Back to ${sandbox.name}` : 'Back to Dashboard'}
        </Link>

        <SectionWrapper
          id="contribution-detail"
          eyebrow="CONTRIBUTION EVALUATION"
          title={contribution.title}
          background="default"
        >
          {/* Status Header */}
          <div className="cockpit-panel mb-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {qualified ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : contribution.status === 'evaluating' ? (
                  <Clock className="h-6 w-6 text-yellow-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className="cockpit-title text-xl">
                    {qualified ? 'QUALIFIED' : contribution.status === 'evaluating' ? 'EVALUATING' : 'NOT QUALIFIED'}
                  </div>
                  <div className="cockpit-label mt-1 text-xs">
                    {sandbox?.name || 'Enterprise Sandbox'} · {contribution.category || 'Research'}
                  </div>
                </div>
              </div>
              {score > 0 && (
                <div className="text-right">
                  <div className="cockpit-label mb-1 text-xs">TOTAL SCORE</div>
                  <div className="cockpit-title text-2xl">{Math.round(score).toLocaleString()} / 10,000</div>
                </div>
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          {score > 0 && (
            <Card hover={false} className="mb-8 border-2 border-[var(--hydrogen-amber)]/30">
              <h3 className="cockpit-title mb-4 text-lg">Score Breakdown</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="cockpit-label mb-1 text-xs">Novelty</div>
                  <div className="cockpit-title text-xl">{Math.round(novelty).toLocaleString()} / 2,500</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">
                    {((novelty / 2500) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">Density</div>
                  <div className="cockpit-title text-xl">{Math.round(density).toLocaleString()} / 2,500</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">
                    {((density / 2500) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">Coherence</div>
                  <div className="cockpit-title text-xl">{Math.round(coherence).toLocaleString()} / 2,500</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">
                    {((coherence / 2500) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="cockpit-label mb-1 text-xs">Alignment</div>
                  <div className="cockpit-title text-xl">{Math.round(alignment).toLocaleString()} / 2,500</div>
                  <div className="cockpit-text mt-1 text-xs opacity-75">
                    {((alignment / 2500) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Metals */}
          {metals.length > 0 && (
            <Card hover={false} className="mb-8">
              <h3 className="cockpit-title mb-2 text-lg">Metal Alignment</h3>
              <div className="flex flex-wrap gap-2">
                {metals.map((metal, idx) => (
                  <span key={idx} className="cockpit-badge text-xs">
                    {metal.toUpperCase()}
                  </span>
                ))}
              </div>
              {contribution.metadata?.metal_justification && (
                <div className="cockpit-text mt-4 text-sm opacity-90 whitespace-pre-wrap">
                  {contribution.metadata.metal_justification}
                </div>
              )}
            </Card>
          )}

          {/* Classification */}
          {contribution.metadata?.classification && (
            <Card hover={false} className="mb-8">
              <h3 className="cockpit-title mb-2 text-lg">Classification</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(contribution.metadata.classification) ? (
                  contribution.metadata.classification.map((cls: string, idx: number) => (
                    <span key={idx} className="cockpit-badge text-xs">
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="cockpit-badge text-xs">{contribution.metadata.classification}</span>
                )}
              </div>
            </Card>
          )}

          {/* Redundancy Analysis */}
          {contribution.metadata?.redundancy_analysis && (
            <Card hover={false} className="mb-8 border-l-4 border-amber-500/50">
              <h3 className="cockpit-title mb-2 text-lg">Redundancy Analysis</h3>
              <p className="cockpit-text text-sm opacity-90 whitespace-pre-wrap">
                {contribution.metadata.redundancy_analysis}
              </p>
            </Card>
          )}

          {/* Full Submission Content */}
          {contribution.text_content && (
            <Card hover={false} className="mb-8 border-l-4 border-blue-500/50">
              <h3 className="cockpit-title mb-2 text-lg">Full Submission</h3>
              <div className="cockpit-panel max-h-96 overflow-y-auto p-4">
                <p className="cockpit-text whitespace-pre-wrap text-sm opacity-90">
                  {contribution.text_content}
                </p>
              </div>
            </Card>
          )}

          {/* Full Evaluation Response */}
          {contribution.metadata?.raw_grok_response && (
            <Card hover={false} className="mb-8 border-l-4 border-green-500/50">
              <h3 className="cockpit-title mb-2 text-lg">Full Evaluation Response</h3>
              <div className="cockpit-panel max-h-96 overflow-y-auto p-4">
                <pre className="cockpit-text whitespace-pre-wrap text-xs opacity-90 font-mono">
                  {contribution.metadata.raw_grok_response}
                </pre>
              </div>
            </Card>
          )}
        </SectionWrapper>
      </div>
    </div>
  );
}

