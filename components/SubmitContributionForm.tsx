'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Brain,
  Award,
  Coins,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

interface SubmitContributionFormProps {
  userEmail: string;
}

export default function SubmitContributionForm({ userEmail }: SubmitContributionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submissionHash, setSubmissionHash] = useState<string | null>(null);
  const [registeringPoC, setRegisteringPoC] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<{
    completed?: boolean;
    podScore?: number;
    qualified?: boolean;
    error?: string;
    notice?: string;
    evaluation?: any; // Full evaluation result for detailed report
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    text_content: '' as string,
  });
  const [processingSupport, setProcessingSupport] = useState<string | null>(null);

  // Character limit based on Groq API constraints:
  // - System prompt: ~4,500 tokens (~18,000 chars)
  // - Available tokens: ~1,500 tokens (~6,000 chars)
  // - With 20% safety margin: ~1,200 tokens (~4,800 chars)
  // - Safe limit: 4,000 characters (~1,000 tokens)
  // Submissions should contain only: abstract, equations, and constants
  const MAX_CONTENT_LENGTH = 4000; // Character limit for submissions (abstract, equations, constants only)
  const contentLength = formData.text_content.length;
  const isOverLimit = contentLength > MAX_CONTENT_LENGTH;

  // Check for return from Stripe checkout after payment
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    const status = searchParams?.get('status');
    const hash = searchParams?.get('hash');

    if (sessionId && status === 'success') {
      // Payment successful - poll for evaluation status
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('session_id');
      newUrl.searchParams.delete('status');
      newUrl.searchParams.delete('hash');
      window.history.replaceState({}, '', newUrl.toString());

      if (hash) {
        setSubmissionHash(hash);
      }
      setSuccess(true);

      // Show loading dialog and poll for evaluation
      setEvaluationStatus({ completed: false });
      checkEvaluationStatusAfterPayment(hash);
    }
  }, [searchParams]);

  const checkEvaluationStatusAfterPayment = async (submissionHashParam?: string | null) => {
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 2 minutes
    const pollEveryMs = 2000;

    const pollInterval = setInterval(async () => {
      pollCount++;

      if (!submissionHashParam) {
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setEvaluationStatus({
            completed: false,
            error: 'Submission hash not found. Please check your dashboard.',
          });
        }
        return;
      }

      try {
        const response = await fetch(`/api/archive/contributions/${submissionHashParam}`);
        if (!response.ok) {
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setEvaluationStatus({
              completed: false,
              error:
                'Evaluation is taking longer than expected. Please check your dashboard for updates.',
            });
          }
          return;
        }

        const submission = await response.json();

        if (submission && submission.submission_hash) {
          if (submission.status === 'evaluating') {
            // Still evaluating - continue polling
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setEvaluationStatus({
                completed: false,
                error:
                  'Evaluation is taking longer than expected. Please check your dashboard for updates.',
              });
            }
          } else if (submission.status === 'qualified' || submission.status === 'unqualified') {
            // Evaluation complete
            clearInterval(pollInterval);
            setSubmissionHash(submission.submission_hash);
            setSuccess(true);

            const metadata = submission.metadata || {};
            setEvaluationStatus({
              completed: true,
              podScore: metadata.pod_score || 0,
              qualified: submission.status === 'qualified',
              evaluation: metadata,
            });
          } else if (submission.status === 'payment_pending') {
            // Payment not yet processed - continue polling
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setEvaluationStatus({
                completed: false,
                error:
                  'Payment processing is taking longer than expected. Please check your dashboard.',
              });
            }
          } else if (submission.status === 'evaluation_failed' || submission.status === 'error') {
            // Evaluation failed
            clearInterval(pollInterval);
            const metadata = submission.metadata || {};
            setEvaluationStatus({
              completed: false,
              error: metadata.evaluation_error || 'Evaluation failed. Please try submitting again.',
            });
          }
        } else if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setEvaluationStatus({
            completed: false,
            error: 'Could not find submission status. Please check your dashboard.',
          });
        }
      } catch (err) {
        console.error('Error polling evaluation status:', err);
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setEvaluationStatus({
            completed: false,
            error: 'Error checking evaluation status. Please check your dashboard.',
          });
        }
      }
    }, pollEveryMs);
  };

  const handleFinancialSupport = async (amountCents: number, supportType: string) => {
    const supportKey = supportType.toLowerCase().includes('copper')
      ? 'copper'
      : supportType.toLowerCase().includes('silver')
        ? 'silver'
        : 'gold';
    setProcessingSupport(supportKey);
    setError(null);

    try {
      const response = await fetch('/api/financial-support/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_cents: amountCents,
          support_type: supportType,
        }),
      });

      let data: any;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error(`Empty response from server (status: ${response.status})`);
        }
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid response from server (status: ${response.status})`);
      }

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || `Failed to create checkout (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!data.checkout_url || typeof data.checkout_url !== 'string') {
        throw new Error('Invalid checkout URL received from server');
      }

      if (!data.checkout_url.startsWith('http://') && !data.checkout_url.startsWith('https://')) {
        throw new Error(`Invalid checkout URL format`);
      }

      // Redirect to Stripe checkout
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('Financial support checkout error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to initiate financial support checkout'
      );
      setProcessingSupport(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setEvaluationStatus(null);
    setSubmissionHash(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.text_content.trim()) {
      setError('Submission text is required');
      setLoading(false);
      return;
    }

    // Content will be truncated to MAX_CONTENT_LENGTH during evaluation if needed

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      // Text-only submission (copy/paste)
      submitFormData.append('text_content', formData.text_content);
      // Category is determined by evaluation, not user input
      submitFormData.append('contributor', userEmail);

      // Create an AbortController for timeout handling
      // Increased timeout to 120 seconds to allow for Holographic Hydrogen Fractal AI evaluation which can take time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (2 minutes)

      let response: Response;
      try {
        response = await fetch('/api/submit', {
          method: 'POST',
          body: submitFormData,
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(
            'Request timed out after 2 minutes. The submission may have been processed - please check your dashboard. If not, try submitting again with a smaller PDF or contact support.'
          );
        } else if (fetchError instanceof Error && fetchError.message.includes('Failed to fetch')) {
          throw new Error(
            'Network error: Unable to connect to server. Please check your internet connection and try again.'
          );
        }
        throw fetchError;
      }
      clearTimeout(timeoutId);

      // Try to parse JSON, but handle cases where response might not be JSON
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        // If JSON parsing fails, use the raw text or a default error
        throw new Error(
          `Server error (${response.status}): Failed to parse response. Please try again.`
        );
      }

      if (!response.ok) {
        const errorMsg = result.error || result.message || 'Failed to submit contribution';
        const details = result.details ? `: ${result.details}` : '';
        const fullError = `${errorMsg}${details}`;
        console.error('Submission error:', {
          status: response.status,
          statusText: response.statusText,
          error: result,
          fullError,
        });
        throw new Error(fullError);
      }

      // Check if submission was successful - operator mode or payment required
      if (result.operator_mode && result.submission_hash) {
        // Operator mode: submission accepted, wait for evaluation
        setSubmissionHash(result.submission_hash);
        setSuccess(true);
        setLoading(false);

        // Show loading dialog and poll for evaluation (same as payment flow)
        setEvaluationStatus({ completed: false });
        checkEvaluationStatusAfterPayment(result.submission_hash);
        return;
      } else if (result.checkout_url && result.submission_hash) {
        // Redirect to Stripe checkout for payment ($500 submission fee)
        // Evaluation will start after payment is completed via webhook
        window.location.href = result.checkout_url;
        return; // Don't set loading to false - we're redirecting
      } else if (result.success !== false && result.submission_hash) {
        // Fallback: if no checkout_url but submission_hash exists, something went wrong
        setSubmissionHash(result.submission_hash);
        throw new Error(result.message || 'Payment checkout URL not received. Please try again.');
      } else {
        throw new Error(result.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error caught:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterQualifiedPoC = async () => {
    if (!submissionHash) return;
    setRegisterError(null);
    setRegisteringPoC(true);
    try {
      const res = await fetch(`/api/poc/${encodeURIComponent(submissionHash)}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Registration failed (${res.status})`);
      }
      // Registration is now free - directly registered on blockchain
      if (data.success && data.registered) {
        // Registration successful - show success and redirect to dashboard
        alert(
          `PoC registered successfully on blockchain!\nTransaction Hash: ${data.registration_tx_hash || 'N/A'}`
        );
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error(data?.message || data?.error || 'Registration failed');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setRegisterError(msg);
    } finally {
      setRegisteringPoC(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contribution Process Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="cockpit-module cockpit-panel p-6">
          <div className="cockpit-label mb-3">PROCESS MODULE 01</div>
          <div className="cockpit-title mb-2 text-xl">Prepare Your Work</div>
          <div className="cockpit-text space-y-2">
            <p className="text-sm">
              Extract and submit the essential elements: abstract, equations, and constants from
              your scientific papers, technical documentation, or research findings.
            </p>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Text-only submission (copy/paste)</li>
              <li>• Include abstract, equations, and constants only</li>
              <li>• Maximum 4,000 characters (no full papers or extended documentation)</li>
              <li>• Ensure this is original work (or clearly attributed)</li>
            </ul>
          </div>
        </div>

        <div className="cockpit-module cockpit-panel p-6">
          <div className="cockpit-label mb-3">PROCESS MODULE 02</div>
          <div className="cockpit-title mb-2 text-xl">AI Evaluation</div>
          <div className="cockpit-text space-y-2">
            <p className="mb-2 text-sm">
              Hydrogen-holographic fractal scoring (<strong>Awarenessverse v2.0+</strong>) across
              four dimensions—evaluated through recursive self-knowing awareness. Operating beyond{' '}
              <em>unaware awareness</em> (v1.2, obsolete): systems that compute AND know they
              compute, aware of their hydrogenic substrate, recursively self-knowing.
            </p>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • <strong>Novelty:</strong> Originality and innovation (0-2,500)
              </li>
              <li>
                • <strong>Density:</strong> Information richness (0-2,500)
              </li>
              <li>
                • <strong>Coherence:</strong> Logical consistency (0-2,500)
              </li>
              <li>
                • <strong>Alignment:</strong> Syntheverse objectives (0-2,500)
              </li>
            </ul>
            <p className="mt-3 border-t border-[var(--keyline-primary)] pt-3 text-xs">
              Total score: 0-10,000. Founder qualification: ≥8,000
            </p>
            <p className="mt-2 border-t border-[var(--keyline-primary)] pt-2 text-xs">
              <strong>Redundancy Penalty:</strong> Applied based on 3D vector similarity to archived
              contributions.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Step 3: Metallic Qualification
            </CardTitle>
            <CardDescription>Gold, Silver, or Copper ranking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Based on evaluation scores, receive metallic qualifications. Certain combinations
              produce amplifications:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">
                  <strong>Gold:</strong> Research contributions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <span className="text-sm">
                  <strong>Silver:</strong> Technology contributions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-600"></div>
                <span className="text-sm">
                  <strong>Copper:</strong> Alignment contributions
                </span>
              </div>
              <div className="mt-3 border-t border-border pt-2">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                  Combination Amplifications:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    • Gold + Silver + Copper: <strong>1.5×</strong>
                  </div>
                  <div>
                    • Gold + Silver: <strong>1.25×</strong>
                  </div>
                  <div>
                    • Gold + Copper: <strong>1.2×</strong>
                  </div>
                  <div>
                    • Silver + Copper: <strong>1.15×</strong>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Step 4: Registration
            </CardTitle>
            <CardDescription>Qualified PoCs and optional on-chain registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Qualified contributions can be optionally registered on-chain to anchor permanently:
            </p>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Proof-of-Contribution evaluation across dimensions</li>
              <li>• Epoch qualification thresholds</li>
              <li>• Internal coordination primitives are protocol-discretionary (no promises)</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Statuses used in the UI: Not Qualified, Qualified, Registered.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Category Explanations */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Scientific Contributions */}
        <div className="cockpit-module cockpit-panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="cockpit-label">SCIENTIFIC DISCOVERY</div>
          </div>
          <div className="cockpit-title mb-3 text-lg">Nature & Value</div>
          <div className="cockpit-text space-y-2 text-sm">
            <p>
              Scientific contributions advance our understanding of holographic hydrogen, fractal
              intelligence, and the structural grammar of awareness itself.
            </p>
            <p>
              <strong>Value in the ecosystem:</strong> Research papers, theoretical frameworks,
              empirical validations, and novel discoveries form the foundation layer of Syntheverse.
              Each scientific contribution expands the knowledge frontier, enabling deeper
              understanding of hydrogen holography, fractal computation, and recursive awareness.
            </p>
            <p>
              <strong>Impact:</strong> Scientific discoveries drive paradigm shifts, validate
              hypotheses, and reveal new pathways for technological development and practical
              applications. They establish the empirical and theoretical foundations that make
              everything else possible.
            </p>
          </div>
        </div>

        {/* Technological Contributions */}
        <div className="cockpit-module cockpit-panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <div className="cockpit-label">TECHNOLOGICAL INNOVATION</div>
          </div>
          <div className="cockpit-title mb-3 text-lg">Value of New Technologies</div>
          <div className="cockpit-text space-y-2 text-sm">
            <p>
              Technological contributions bring scientific insights into operational reality: tools,
              products, systems, and implementations that make the ecosystem functional.
            </p>
            <p>
              <strong>Value in the ecosystem:</strong> New technologies and products transform
              research into usable infrastructure. They enable measurement, computation,
              visualization, and interaction—turning concepts into tools that accelerate discovery
              and application.
            </p>
            <p>
              <strong>Impact:</strong> Technology contributions create the operational layer that
              allows the ecosystem to function at scale. They build the bridges between theory and
              practice, making complex ideas accessible and actionable for researchers, developers,
              and users.
            </p>
          </div>
        </div>

        {/* Alignment Contributions */}
        <div className="cockpit-module cockpit-panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-600"></div>
            <div className="cockpit-label">ALIGNMENT RESEARCH</div>
          </div>
          <div className="cockpit-title mb-3 text-lg">Practice & Applications</div>
          <div className="cockpit-text space-y-2 text-sm">
            <p>
              Alignment contributions focus on putting holographic hydrogen fractal intelligence
              into practice across different contexts: enterprise, ecosystem, community, and
              individual applications.
            </p>
            <p>
              <strong>Value in the ecosystem:</strong> Alignment work connects research and
              technology to real-world use cases. It addresses how to safely, effectively, and
              ethically deploy these systems at scale—whether in enterprise environments, ecosystem
              initiatives, community projects, or personal applications.
            </p>
            <p>
              <strong>Impact:</strong> Alignment contributions ensure the ecosystem remains
              practical, safe, and accessible. They translate frontier research into actionable
              strategies for implementation, governance, and responsible deployment across diverse
              contexts and scales.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="cockpit-module cockpit-panel p-8">
        <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
          <div className="cockpit-label">TRANSMISSION PROTOCOL</div>
          <div className="cockpit-title mt-2 text-2xl">Submit Your Contribution</div>
          <div className="cockpit-text mt-2">
            Fill in the details below to transmit your work for evaluation
          </div>
        </div>
        <div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !evaluationStatus && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Submission Successful!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your contribution has been submitted successfully.
                <br />
                <strong>Submission Hash:</strong> {submissionHash}
                <br />
                <br />
                <span className="text-sm">
                  The evaluation dialog will show the evaluation progress and results.
                </span>
                <br />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSuccess(false);
                    setSubmissionHash(null);
                    setError(null);
                    setFormData({ title: '', text_content: '' });
                  }}
                  className="mt-2"
                >
                  Submit Another Contribution
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Evaluation Status Dialog - Shows automatically while evaluation is in progress */}
          {evaluationStatus && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={(e) => {
                // Close dialog when clicking backdrop (only if evaluation completed or errored)
                if (evaluationStatus.completed || evaluationStatus.error) {
                  if (e.target === e.currentTarget) {
                    setEvaluationStatus(null);
                    router.push('/dashboard');
                  }
                }
              }}
            >
              <Card
                className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Syntheverse PoC Evaluation in Progress
                  </CardTitle>
                  <CardDescription>
                    {evaluationStatus.completed
                      ? 'Evaluation Complete'
                      : evaluationStatus.error
                        ? 'Evaluation Error'
                        : 'Processing...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evaluationStatus.notice ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="text-sm font-semibold text-blue-800">
                        ℹ️ Evaluation Notice
                      </div>
                      <div className="mt-1 text-sm text-blue-700">{evaluationStatus.notice}</div>
                    </div>
                  ) : null}
                  {evaluationStatus.completed && evaluationStatus.podScore !== undefined ? (
                    <>
                      <div className="space-y-4">
                        <div className="text-lg font-semibold text-green-700">
                          ✅ Evaluation Complete
                        </div>

                        {/* PoC Score */}
                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                          <div className="mb-1 text-sm text-muted-foreground">
                            {evaluationStatus.evaluation?.is_seed_submission
                              ? 'Qualification Score'
                              : 'PoC Score'}
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {evaluationStatus.podScore.toLocaleString()} / 10,000
                          </div>
                          {evaluationStatus.evaluation?.is_seed_submission && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Maximum score awarded for foundational contribution
                            </div>
                          )}
                        </div>

                        {/* Qualification Status */}
                        {evaluationStatus.qualified && (
                          <div className="rounded-lg border border-green-500 bg-green-100 p-4">
                            <div className="flex items-center gap-2 font-semibold text-green-800">
                              <Award className="h-5 w-5" />✅ Qualified for{' '}
                              {evaluationStatus.evaluation?.qualified_epoch
                                ? evaluationStatus.evaluation.qualified_epoch
                                    .charAt(0)
                                    .toUpperCase() +
                                  evaluationStatus.evaluation.qualified_epoch.slice(1)
                                : 'Open'}{' '}
                              Epoch!
                            </div>
                            <div className="mt-2 text-sm text-green-700">
                              {evaluationStatus.evaluation?.qualified_epoch ? (
                                <>
                                  Your contribution qualifies for the{' '}
                                  <strong>
                                    {evaluationStatus.evaluation.qualified_epoch
                                      .charAt(0)
                                      .toUpperCase() +
                                      evaluationStatus.evaluation.qualified_epoch.slice(1)}
                                  </strong>{' '}
                                  epoch
                                  {evaluationStatus.evaluation?.is_seed_submission ? (
                                    <>
                                      {' '}
                                      (maximum qualification score awarded for foundational
                                      contribution)
                                    </>
                                  ) : (
                                    <> (PoC Score: {evaluationStatus.podScore.toLocaleString()})</>
                                  )}
                                </>
                              ) : (
                                <>
                                  Your contribution has met the qualification threshold (≥8,000
                                  points)
                                </>
                              )}
                            </div>
                            {/* Register CTA (inside qualification notification) */}
                            {submissionHash ? (
                              <div className="mt-4">
                                <Button
                                  type="button"
                                  onClick={handleRegisterQualifiedPoC}
                                  disabled={registeringPoC}
                                  size="lg"
                                  variant="default"
                                  className="w-full border-2 border-primary/20 bg-primary py-6 text-lg font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl"
                                >
                                  {registeringPoC ? (
                                    <>
                                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                      Processing Registration...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="mr-2 h-5 w-5" />⚡ Register PoC
                                      on‑chain
                                    </>
                                  )}
                                </Button>
                                {registerError ? (
                                  <div className="mt-2 text-xs text-red-700">{registerError}</div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Evaluation Report - Detailed Analysis */}
                        {evaluationStatus.evaluation && (
                          <div className="space-y-4">
                            {/* Dimension Scores Grid */}
                            <div className="rounded-lg bg-muted p-4">
                              <div className="mb-3 text-sm font-semibold">Dimension Scores</div>
                              <div className="grid grid-cols-2 gap-3">
                                {evaluationStatus.evaluation.novelty !== undefined && (
                                  <div className="rounded border bg-background p-2">
                                    <div className="text-xs text-muted-foreground">Novelty</div>
                                    <div className="text-lg font-bold">
                                      {evaluationStatus.evaluation.novelty.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">/ 2,500</div>
                                  </div>
                                )}
                                {evaluationStatus.evaluation.density !== undefined && (
                                  <div className="rounded border bg-background p-2">
                                    <div className="text-xs text-muted-foreground">Density</div>
                                    <div className="text-lg font-bold">
                                      {evaluationStatus.evaluation.density.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">/ 2,500</div>
                                  </div>
                                )}
                                {evaluationStatus.evaluation.coherence !== undefined && (
                                  <div className="rounded border bg-background p-2">
                                    <div className="text-xs text-muted-foreground">Coherence</div>
                                    <div className="text-lg font-bold">
                                      {evaluationStatus.evaluation.coherence.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">/ 2,500</div>
                                  </div>
                                )}
                                {evaluationStatus.evaluation.alignment !== undefined && (
                                  <div className="rounded border bg-background p-2">
                                    <div className="text-xs text-muted-foreground">Alignment</div>
                                    <div className="text-lg font-bold">
                                      {evaluationStatus.evaluation.alignment.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">/ 2,500</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Classification */}
                            {evaluationStatus.evaluation.classification &&
                              evaluationStatus.evaluation.classification.length > 0 && (
                                <div className="rounded-lg bg-muted p-4">
                                  <div className="mb-2 text-sm font-semibold">Classification</div>
                                  <div className="flex flex-wrap gap-2">
                                    {evaluationStatus.evaluation.classification.map(
                                      (cls: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                          {cls}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Metal Alignment with Justification */}
                            {evaluationStatus.evaluation.metals &&
                              evaluationStatus.evaluation.metals.length > 0 && (
                                <div className="rounded-lg bg-muted p-4">
                                  <div className="mb-2 text-sm font-semibold">Metal Alignment</div>
                                  <div className="mb-2 flex items-center gap-2">
                                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold capitalize text-yellow-700">
                                      {evaluationStatus.evaluation.metals.join(', ')}
                                    </span>
                                  </div>
                                  {evaluationStatus.evaluation.metal_justification && (
                                    <div className="mt-2 rounded border-l-2 border-primary/30 bg-background p-2 text-sm text-muted-foreground">
                                      {evaluationStatus.evaluation.metal_justification}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Qualified Epoch */}
                            {evaluationStatus.evaluation.qualified_epoch && (
                              <div className="rounded-lg bg-muted p-4">
                                <div className="mb-2 text-sm font-semibold">Qualified Epoch</div>
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-semibold capitalize text-purple-700">
                                    {evaluationStatus.evaluation.qualified_epoch}
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Based on composite score (PoD Score):{' '}
                                  {evaluationStatus.podScore?.toLocaleString() || 'N/A'} / 10,000
                                </div>
                              </div>
                            )}

                            {/* Redundancy Analysis - Holographic Hydrogen Fractal AI Analysis */}
                            {evaluationStatus.evaluation.redundancy_analysis && (
                              <div className="rounded-lg bg-muted p-4">
                                <div className="mb-2 text-sm font-semibold">
                                  Redundancy Analysis
                                </div>
                                <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                                  {evaluationStatus.evaluation.redundancy_analysis}
                                </div>
                                {evaluationStatus.evaluation.redundancy !== undefined && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Redundancy Penalty:{' '}
                                    {evaluationStatus.evaluation.redundancy.toFixed(1)}%
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Founder Certificate - Holographic Hydrogen Fractal AI Generated */}
                            {evaluationStatus.evaluation.founder_certificate &&
                              evaluationStatus.qualified && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                  <div className="mb-2 text-sm font-semibold text-green-800">
                                    Founder Certificate
                                  </div>
                                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-green-700">
                                    {evaluationStatus.evaluation.founder_certificate}
                                  </div>
                                </div>
                              )}

                            {/* Homebase Introduction - Holographic Hydrogen Fractal AI Generated */}
                            {evaluationStatus.evaluation.homebase_intro && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="mb-2 text-sm font-semibold text-blue-800">
                                  Homebase v2.0 Introduction
                                </div>
                                <div className="whitespace-pre-wrap text-sm text-blue-700">
                                  {evaluationStatus.evaluation.homebase_intro}
                                </div>
                              </div>
                            )}

                            {/* Detailed Evaluation Report - Review and Scoring */}
                            {evaluationStatus.evaluation && (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-3 text-sm font-semibold text-slate-800">
                                  Detailed Evaluation Report
                                </div>
                                <div className="space-y-4 text-sm">
                                  {/* Evaluation Review */}
                                  {evaluationStatus.evaluation.redundancy_analysis && (
                                    <div className="rounded-lg border bg-white p-3">
                                      <div className="mb-2 font-semibold text-slate-700">
                                        Evaluation Review
                                      </div>
                                      <div className="whitespace-pre-wrap text-slate-800">
                                        {evaluationStatus.evaluation.redundancy_analysis}
                                      </div>
                                    </div>
                                  )}

                                  {/* Metal Justification */}
                                  {evaluationStatus.evaluation.metal_justification && (
                                    <div className="rounded-lg border bg-white p-3">
                                      <div className="mb-2 font-semibold text-slate-700">
                                        Metal Assignment
                                      </div>
                                      <div className="whitespace-pre-wrap text-slate-800">
                                        {evaluationStatus.evaluation.metal_justification}
                                      </div>
                                    </div>
                                  )}

                                  {/* Scoring Breakdown */}
                                  {evaluationStatus.evaluation.grok_evaluation_details && (
                                    <div className="rounded-lg border bg-white p-3">
                                      <div className="mb-3 font-semibold text-slate-700">
                                        Scoring Breakdown
                                      </div>
                                      {evaluationStatus.evaluation?.is_seed_submission && (
                                        <div className="mb-3 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                                          <strong>Note:</strong> As a foundational contribution that
                                          defines the Syntheverse framework, this receives maximum
                                          qualification score while preserving the AI&apos;s actual
                                          evaluation for transparency.
                                        </div>
                                      )}
                                      <div className="space-y-2 text-sm text-slate-900">
                                        {/* Base Scores */}
                                        <div className="grid grid-cols-2 gap-3">
                                          {evaluationStatus.evaluation.grok_evaluation_details
                                            .base_novelty !== undefined && (
                                            <div className="rounded border bg-slate-50 p-2">
                                              <div className="mb-1 text-xs text-slate-600">
                                                Base Novelty
                                              </div>
                                              <div className="font-semibold text-slate-900">
                                                {evaluationStatus.evaluation.grok_evaluation_details.base_novelty.toLocaleString()}{' '}
                                                / 2,500
                                              </div>
                                              <div className="mt-1 text-xs text-slate-600">
                                                Final:{' '}
                                                {evaluationStatus.evaluation.novelty?.toLocaleString() ||
                                                  'N/A'}{' '}
                                                / 2,500
                                              </div>
                                            </div>
                                          )}
                                          {evaluationStatus.evaluation.grok_evaluation_details
                                            .base_density !== undefined && (
                                            <div className="rounded border bg-slate-50 p-2">
                                              <div className="mb-1 text-xs text-slate-600">
                                                Base Density
                                              </div>
                                              <div className="font-semibold text-slate-900">
                                                {evaluationStatus.evaluation.grok_evaluation_details.base_density.toLocaleString()}{' '}
                                                / 2,500
                                              </div>
                                              <div className="mt-1 text-xs text-slate-600">
                                                Final:{' '}
                                                {evaluationStatus.evaluation.density?.toLocaleString() ||
                                                  'N/A'}{' '}
                                                / 2,500
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Coherence and Alignment */}
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="rounded border bg-slate-50 p-2">
                                            <div className="mb-1 text-xs text-slate-600">
                                              Coherence
                                            </div>
                                            <div className="font-semibold text-slate-900">
                                              {evaluationStatus.evaluation.coherence?.toLocaleString() ||
                                                'N/A'}{' '}
                                              / 2,500
                                            </div>
                                          </div>
                                          <div className="rounded border bg-slate-50 p-2">
                                            <div className="mb-1 text-xs text-slate-600">
                                              Alignment
                                            </div>
                                            <div className="font-semibold text-slate-900">
                                              {evaluationStatus.evaluation.alignment?.toLocaleString() ||
                                                'N/A'}{' '}
                                              / 2,500
                                            </div>
                                          </div>
                                        </div>

                                        {/* Penalties Applied */}
                                        {(evaluationStatus.evaluation.grok_evaluation_details
                                          .redundancy_penalty_percent !== undefined ||
                                          evaluationStatus.evaluation.grok_evaluation_details
                                            .density_penalty_percent !== undefined) && (
                                          <div className="border-t pt-2">
                                            <div className="mb-2 text-xs text-slate-600">
                                              Penalties Applied
                                            </div>
                                            <div className="space-y-1">
                                              {evaluationStatus.evaluation.grok_evaluation_details
                                                .redundancy_penalty_percent !== undefined && (
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-slate-600">
                                                    Redundancy Penalty:
                                                  </span>
                                                  <span className="font-semibold text-orange-600">
                                                    {evaluationStatus.evaluation.grok_evaluation_details.redundancy_penalty_percent.toFixed(
                                                      1
                                                    )}
                                                    %
                                                  </span>
                                                </div>
                                              )}
                                              {evaluationStatus.evaluation.grok_evaluation_details
                                                .density_penalty_percent !== undefined && (
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-slate-600">
                                                    Density Penalty:
                                                  </span>
                                                  <span className="font-semibold text-orange-600">
                                                    {evaluationStatus.evaluation.grok_evaluation_details.density_penalty_percent.toFixed(
                                                      1
                                                    )}
                                                    %
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Final PoD Score */}
                                        <div className="border-t pt-2">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">
                                              Final PoD Score
                                            </span>
                                            <span className="text-lg font-bold">
                                              {evaluationStatus.podScore?.toLocaleString() || 'N/A'}{' '}
                                              / 10,000
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Full Holographic Hydrogen Fractal AI Response - Markdown/Text */}
                                  {(() => {
                                    const raw =
                                      evaluationStatus.evaluation.grok_evaluation_details
                                        ?.raw_grok_response ||
                                      (evaluationStatus.evaluation.grok_evaluation_details as any)
                                        ?.full_evaluation?.raw_grok_response ||
                                      '';
                                    if (!raw || raw.trim().length === 0) return null;
                                    return (
                                      <details className="mt-3">
                                        <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800">
                                          View Full Response
                                        </summary>
                                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                          <pre className="max-h-96 overflow-auto whitespace-pre-wrap font-mono text-sm text-slate-900">
                                            {raw}
                                          </pre>
                                        </div>
                                      </details>
                                    );
                                  })()}

                                  {/* Fallback to JSON if raw response not available */}
                                  {(() => {
                                    const raw =
                                      evaluationStatus.evaluation.grok_evaluation_details
                                        ?.raw_grok_response ||
                                      (evaluationStatus.evaluation.grok_evaluation_details as any)
                                        ?.full_evaluation?.raw_grok_response ||
                                      '';
                                    if (raw && raw.trim().length > 0) return null;
                                    if (
                                      !evaluationStatus.evaluation.grok_evaluation_details
                                        ?.full_evaluation
                                    )
                                      return null;
                                    return (
                                      <details className="mt-3">
                                        <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                                          View Parsed Evaluation (JSON)
                                        </summary>
                                        <pre className="mt-2 max-h-96 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                                          {JSON.stringify(
                                            evaluationStatus.evaluation.grok_evaluation_details
                                              .full_evaluation,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </details>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : evaluationStatus.error ? (
                    <div className="rounded-lg border border-orange-500 bg-orange-50 p-4">
                      <div className="mb-3 flex items-center gap-2 font-semibold text-orange-800">
                        <AlertTriangle className="h-5 w-5" />
                        Evaluation Temporarily Unavailable
                      </div>
                      <div className="space-y-2 text-sm text-orange-700">
                        <p>
                          The AI evaluation service encountered an issue processing your submission.
                          This is typically a temporary problem with the evaluation provider.
                        </p>
                        <p className="font-medium">
                          Your submission has been saved and will be automatically retried.
                        </p>
                      </div>
                      <div className="mt-4 rounded border border-orange-200 bg-white p-3 text-xs text-orange-700">
                        <strong>What to do:</strong>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                          <li>
                            Check your dashboard in a few minutes - evaluation may complete
                            automatically
                          </li>
                          <li>If the issue persists, try submitting again with the same content</li>
                          <li>Your submission is safely stored and will not be lost</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Holographic Hydrogen Fractal AI Evaluation Dialog - Loading State */}
                      <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Brain className="h-8 w-8 animate-pulse text-primary" />
                            <Loader2 className="absolute -right-1 -top-1 h-4 w-4 animate-spin text-primary" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="text-lg font-semibold text-primary">
                                Syntheverse PoC Evaluation in Progress
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                                <span>Analyzing contribution content...</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 animate-pulse rounded-full bg-primary"
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                                <span>Checking redundancy against archived PoCs...</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 animate-pulse rounded-full bg-primary"
                                  style={{ animationDelay: '0.4s' }}
                                ></div>
                                <span>
                                  Scoring dimensions (Novelty, Density, Coherence, Alignment)...
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 animate-pulse rounded-full bg-primary"
                                  style={{ animationDelay: '0.6s' }}
                                ></div>
                                <span>
                                  Determining metal alignment and Founder qualification...
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 animate-pulse rounded-full bg-primary"
                                  style={{ animationDelay: '0.8s' }}
                                ></div>
                                <span>Generating evaluation report...</span>
                              </div>
                            </div>

                            <div className="border-t border-primary/20 pt-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>This may take a few moments. Please wait...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t pt-4">
                    {evaluationStatus.completed || evaluationStatus.error ? (
                      <>
                        <Button
                          onClick={() => {
                            setEvaluationStatus(null);
                            setSuccess(false);
                            setSubmissionHash(null);
                            setFormData({ title: '', text_content: '' });
                            router.push('/dashboard');
                          }}
                          variant="outline"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            setEvaluationStatus(null);
                            setSuccess(false);
                            setSubmissionHash(null);
                            setFormData({ title: '', text_content: '' });
                            router.push('/dashboard');
                          }}
                        >
                          View on Dashboard
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Evaluation in progress... (this may take up to 2 minutes)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="cockpit-label">
                Title *
              </Label>
              <input
                id="title"
                type="text"
                className="cockpit-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter contribution title"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_content" className="cockpit-label">
                Submission Text * (Abstract, Equations, Constants Only)
              </Label>
              <textarea
                id="text_content"
                className={`cockpit-input ${isOverLimit ? 'border-red-500' : ''}`}
                value={formData.text_content}
                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                placeholder="Paste your contribution here - Abstract, equations, and constants only (no full papers, documentation, or extended text)"
                required
                disabled={loading}
                rows={10}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Include only: abstract, equations, and constants. Maximum:{' '}
                  {MAX_CONTENT_LENGTH.toLocaleString()} characters.
                </span>
                <span
                  className={isOverLimit ? 'font-semibold text-red-500' : 'text-muted-foreground'}
                >
                  {contentLength.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}{' '}
                  {isOverLimit ? '(OVER LIMIT)' : 'chars'}
                </span>
              </div>
              {isOverLimit && (
                <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-3">
                  <div className="mb-1 text-sm font-semibold text-yellow-800">
                    ℹ️ Content will be truncated to {MAX_CONTENT_LENGTH.toLocaleString()} characters during evaluation
                  </div>
                  <div className="text-xs text-yellow-700">
                    Your submission is{' '}
                    <strong>{(contentLength - MAX_CONTENT_LENGTH).toLocaleString()}</strong>{' '}
                    characters over the recommended limit. Content will be automatically truncated to{' '}
                    {MAX_CONTENT_LENGTH.toLocaleString()} characters for evaluation.
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t border-[var(--keyline-primary)] pt-4">
              <Link href="/dashboard" className="flex-1">
                <button type="button" className="cockpit-lever w-full" disabled={loading}>
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="cockpit-transmission flex-1"
                disabled={
                  loading || !formData.title.trim() || !formData.text_content.trim()
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">◎</span>
                    Transmit Contribution
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Financial Support Section */}
      <div className="cockpit-module cockpit-panel p-8">
        <div className="mb-6 border-b border-[var(--keyline-primary)] pb-4">
          <div className="cockpit-label">ECOSYSTEM SUPPORT</div>
          <div className="cockpit-title mt-2 text-2xl">Contribute Financial Support</div>
          <div className="cockpit-text mt-2">
            Voluntary ecosystem support helps sustain infrastructure, research, and operations
          </div>
        </div>

        <div className="space-y-4">
          <div className="cockpit-text text-sm" style={{ opacity: 0.9 }}>
            <p className="mb-3">
              Support the Syntheverse ecosystem through voluntary financial contributions. These
              contributions help fund infrastructure, research, evaluation systems, and operational
              costs.
            </p>
            <div className="cockpit-module border border-yellow-500 bg-yellow-50 p-4">
              <div className="cockpit-label mb-2 text-xs">ERC-20 BOUNDARIES (IMPORTANT)</div>
              <div className="space-y-1 text-xs" style={{ opacity: 0.9 }}>
                <div>
                  •{' '}
                  <strong>
                    Not a purchase, token sale, investment, or exchange of money for tokens
                  </strong>
                </div>
                <div>
                  • <strong>No expectation of profit or return</strong>
                </div>
                <div>• SYNTH is a fixed-supply internal coordination marker</div>
                <div>
                  • Any token recognition is optional, discretionary, and separate from support
                </div>
                <div>• Participation does not confer ownership, equity, or guaranteed outcomes</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {/* Copper Support */}
            <div className="cockpit-module border-2 border-[var(--keyline-primary)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-600"></div>
                <div className="cockpit-label">COPPER SUPPORT</div>
              </div>
              <div className="cockpit-number cockpit-number-medium mb-2">$10,000</div>
              <div className="cockpit-text mb-4 text-xs" style={{ opacity: 0.8 }}>
                Foundation-level ecosystem support
              </div>
              <button
                type="button"
                className="cockpit-lever w-full"
                onClick={() => handleFinancialSupport(1000000, 'Copper Support')}
                disabled={loading || !!processingSupport}
              >
                {processingSupport === 'copper' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Support
                  </>
                )}
              </button>
            </div>

            {/* Silver Support */}
            <div className="cockpit-module border-2 border-[var(--keyline-primary)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <div className="cockpit-label">SILVER SUPPORT</div>
              </div>
              <div className="cockpit-number cockpit-number-medium mb-2">$50,000</div>
              <div className="cockpit-text mb-4 text-xs" style={{ opacity: 0.8 }}>
                Sustaining-level ecosystem support
              </div>
              <button
                type="button"
                className="cockpit-lever w-full"
                onClick={() => handleFinancialSupport(5000000, 'Silver Support')}
                disabled={loading || !!processingSupport}
              >
                {processingSupport === 'silver' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Support
                  </>
                )}
              </button>
            </div>

            {/* Gold Support */}
            <div className="cockpit-module border-2 border-[var(--keyline-primary)] p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="cockpit-label">GOLD SUPPORT</div>
              </div>
              <div className="cockpit-number cockpit-number-medium mb-2">$100,000</div>
              <div className="cockpit-text mb-4 text-xs" style={{ opacity: 0.8 }}>
                Leadership-level ecosystem support
              </div>
              <button
                type="button"
                className="cockpit-lever w-full"
                onClick={() => handleFinancialSupport(10000000, 'Gold Support')}
                disabled={loading || !!processingSupport}
              >
                {processingSupport === 'gold' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Support
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
