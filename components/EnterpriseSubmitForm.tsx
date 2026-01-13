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
        )}
        <button
          onClick={() => {
            setSuccess(false);
            setSubmissionHash(null);
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
