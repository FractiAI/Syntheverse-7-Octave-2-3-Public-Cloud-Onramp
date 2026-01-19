'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Card } from './landing/shared/Card';

type EnterpriseSubmitFormProps = {
  sandboxId: string;
  sandboxName: string;
  onSuccess?: () => void;
};

export default function EnterpriseSubmitForm({
  sandboxId,
  sandboxName,
  onSuccess,
}: EnterpriseSubmitFormProps) {
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState('scientific');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submissionHash, setSubmissionHash] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [fetchingResult, setFetchingResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enterprise/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandbox_id: sandboxId,
          title: title.trim(),
          text_content: textContent.trim(),
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // Check if payment is required
      if (data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
        return; // Don't set loading to false - we're redirecting
      }

      setSubmissionHash(data.submission_hash);
      setSuccess(true);
      setTitle('');
      setTextContent('');
      
      // Fetch full evaluation results after a short delay
      setTimeout(async () => {
        setFetchingResult(true);
        try {
          const resultRes = await fetch(`/api/enterprise/contributions/${data.submission_hash}`);
          if (resultRes.ok) {
            const resultData = await resultRes.json();
            setEvaluationResult(resultData.contribution);
          }
        } catch (err) {
          console.error('Failed to fetch evaluation results:', err);
        } finally {
          setFetchingResult(false);
        }
      }, 2000); // 2 second delay to allow evaluation to complete
      
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card hover={false} className="border-l-4 border-green-500/50 bg-green-500/5">
        <div className="cockpit-title mb-2 text-lg">Contribution Submitted</div>
        <div className="cockpit-text mb-4 text-sm opacity-90">
          Your contribution has been submitted to <strong>{sandboxName}</strong> and is being
          evaluated by SynthScan™ MRI. Results will be available shortly.
        </div>
        {submissionHash && (
          <div className="space-y-4">
            <div className="cockpit-text text-xs opacity-75">
              <div className="mb-2">
                <strong>Submission Hash (HHF-AI):</strong>
                <div className="font-mono mt-1 break-all">{submissionHash}</div>
              </div>
              <div className="flex gap-3">
                <a 
                  href={`/api/archive/contributions/${submissionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  📊 View JSON Record
                </a>
                <a 
                  href={`/enterprise/contribution/${submissionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  🔍 View Full Report
                </a>
              </div>
            </div>

            {/* Evaluation Results Display */}
            {fetchingResult ? (
              <div className="mt-4 p-4 border border-blue-500/30 rounded bg-blue-500/10 animate-pulse">
                <div className="text-sm text-blue-400">⏳ Loading evaluation results...</div>
              </div>
            ) : evaluationResult ? (
              <div className="mt-4 p-4 border border-green-500/30 rounded bg-green-500/5 space-y-3">
                <div className="text-sm font-semibold text-green-400 mb-2">📊 SynthScan™ MRI Evaluation Report</div>
                
                {/* Score Display */}
                {evaluationResult.metadata?.pod_score !== undefined && (
                  <div className="bg-black/30 rounded p-3 border border-green-500/20">
                    <div className="text-xs text-green-300 mb-1">PoC Score</div>
                    <div className="text-2xl font-bold text-green-400">
                      {evaluationResult.metadata.pod_score.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Qualification Status */}
                {evaluationResult.metadata?.qualified && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                    <div className="text-sm font-semibold text-green-400">
                      ✅ Qualified for {evaluationResult.metadata.qualified_epoch || 'Open'} Epoch
                    </div>
                  </div>
                )}

                {/* Metals */}
                {evaluationResult.metals && evaluationResult.metals.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {evaluationResult.metals.map((metal: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 text-xs rounded border bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      >
                        {metal}
                      </span>
                    ))}
                  </div>
                )}

                {/* Classification */}
                {evaluationResult.metadata?.classification && evaluationResult.metadata.classification.length > 0 && (
                  <div className="text-xs">
                    <span className="text-slate-400">Categories: </span>
                    <span className="text-cyan-400">{evaluationResult.metadata.classification.join(', ')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-700">
                  <a 
                    href={`/enterprise/contribution/${submissionHash}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 underline"
                  >
                    → View Complete Detailed Report
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}
        <button
          onClick={() => {
            setSuccess(false);
            setSubmissionHash(null);
            setEvaluationResult(null);
          }}
          className="cockpit-lever mt-4 inline-flex items-center text-sm"
        >
          Submit Another
        </button>
      </Card>
    );
  }

  return (
    <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
      <div className="cockpit-label mb-4">SUBMIT CONTRIBUTION</div>
      <div className="cockpit-title mb-2 text-xl">Submit to {sandboxName}</div>
      <div className="cockpit-text mb-4 text-sm opacity-90">
        Submit your research, engineering, or alignment contribution. It will be evaluated by
        SynthScan™ MRI using the same HHF-AI lens as the main Syntheverse.
      </div>
      <div className="cockpit-panel mb-6 border-l-4 border-amber-500/50 bg-amber-500/5 p-3">
        <div className="cockpit-text text-xs opacity-90">
          <strong>Submission Fee:</strong> Enterprise submission fees are lower than main
          Syntheverse ($500). Fees vary by subscription tier: <strong>Pioneer ($50)</strong>,{' '}
          <strong>Trading Post ($40)</strong>, <strong>Settlement ($30)</strong>,{' '}
          <strong>Metropolis ($25)</strong>. This fee is separate from your monthly sandbox
          subscription.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="cockpit-label mb-2 block text-xs">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter contribution title"
            className="cockpit-input w-full"
            disabled={loading}
          />
        </div>

        <div>
          <label className="cockpit-label mb-2 block text-xs">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="cockpit-input w-full"
            disabled={loading}
          >
            <option value="scientific">Scientific</option>
            <option value="tech">Technical</option>
            <option value="alignment">Alignment</option>
            <option value="experience">Experience</option>
          </select>
        </div>

        <div>
          <label className="cockpit-label mb-2 block text-xs">Content</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            required
            rows={12}
            placeholder="Enter your contribution content (abstract, equations, constants, etc.)"
            className="cockpit-input w-full"
            disabled={loading}
          />
          <div className="cockpit-text mt-1 text-xs opacity-75">
            Include abstract, formulas, constants, and any relevant technical details.
          </div>
        </div>

        {error && (
          <div className="cockpit-panel border-l-4 border-red-500/50 bg-red-500/5 p-3">
            <div className="cockpit-text text-sm text-red-400">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !title.trim() || !textContent.trim()}
          className="cockpit-lever inline-flex items-center text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4" />
              Submitting...
            </>
          ) : (
            <>
              Submit Contribution
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </Card>
  );
}
