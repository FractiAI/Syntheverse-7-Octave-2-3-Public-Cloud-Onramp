'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IntegrityValidator } from '@/utils/validation/IntegrityValidator';
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
  Sprout,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import '../app/synthscan-mri.css';

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
    validationError?: string | null; // THALET Protocol validation error
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
            
            // THALET PROTOCOL: Validate atomic score integrity
            let pocScore = 0;
            let validationError = null;
            
            try {
              if (metadata.atomic_score) {
                // New THALET-compliant path
                pocScore = IntegrityValidator.getValidatedScore(metadata.atomic_score);
              } else if (metadata.score_trace?.final_score) {
                // Legacy fallback (pre-THALET)
                pocScore = metadata.score_trace.final_score;
                console.warn('[THALET] Using legacy score_trace.final_score - atomic_score not found');
              } else {
                pocScore = metadata.pod_score ?? 0;
                console.warn('[THALET] Using fallback pod_score - no atomic_score or score_trace');
              }
            } catch (error) {
              console.error('[THALET] Score validation failed:', error);
              validationError = error instanceof Error ? error.message : 'Invalid score data';
              pocScore = 0;
            }
            
            setEvaluationStatus({
              completed: true,
              podScore: pocScore,
              qualified: submission.status === 'qualified',
              evaluation: metadata,
              validationError,
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
    <div>
      {/* SynthScan MRI Submission Form */}
      <div className="mri-control-panel">
        {/* MRI System Header with Branding */}
        <div className="mri-header">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl font-bold text-blue-600">FractiAI</div>
                <div className="h-8 w-px bg-blue-300"></div>
                <div className="mri-system-name">SYNTHSCAN™ MRI</div>
              </div>
              <div className="mri-title">HHF-AI Spin Resonance Imaging</div>
              <div className="mri-subtitle">
                Hydrogen-Holographic Fractal Magnetic Resonance
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="mri-status-display">
                <div className="mri-status-label">System Status</div>
                <div className="mri-status-value">
                  <div className="mri-status-indicator"></div>
                  <span>READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What This Does - Information Panel */}
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-blue-600 p-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  Proof-of-Contribution Evaluation System
                </h3>
                <p className="mb-3 text-sm text-slate-700">
                  SynthScan™ MRI uses hydrogen spin–mediated resonance to image and evaluate complex 
                  intellectual contributions. Your submission will be scanned across four dimensions 
                  (Novelty, Density, Coherence, Alignment) and scored on a scale of 0-10,000 points.
                </p>
                <div className="text-xs text-slate-600">
                  <strong>Result:</strong> Qualified contributions receive recognition, on-chain registration, 
                  and allocation of SYNTH tokens from the 90 trillion token motherlode vault.
                </div>
              </div>
            </div>
          </div>

          {/* Examination Checklist */}
          <div className="mb-6 rounded-lg border border-slate-300 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Examination Procedure</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Enter Exam Details</div>
                  <div className="text-sm text-slate-600">Provide title and subject of your contribution</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Submit Imaging Data</div>
                  <div className="text-sm text-slate-600">Abstract, equations, and constants (4,000 character scan window)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Process Payment</div>
                  <div className="text-sm text-slate-600">$500 examination fee (complimentary for approved testers)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Receive Evaluation Report</div>
                  <div className="text-sm text-slate-600">Comprehensive diagnostic report with scores and qualification status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Information Panel */}
          <div className="mri-operator-panel">
            <div className="mri-operator-info">
              <div className="mri-operator-label">Operator Information</div>
              <div className="mri-operator-value">{userEmail}</div>
            </div>
          </div>

          {/* Examination Form Card */}
          <div className="mri-exam-card">
            <div className="mri-exam-header">
              <div className="mri-exam-type">
                <div className="mri-exam-icon">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="mri-exam-type-label">Exam Type</div>
                  <div className="mri-exam-type-value">Proof-of-Contribution Imaging</div>
                </div>
              </div>
              <div className="mri-exam-fee">
                <div className="mri-exam-fee-amount">Examination Fee: $500</div>
                <div className="text-xs mt-1">
                  Comprehensive evaluation with optional on-chain registration for qualified contributions
                </div>
              </div>
            </div>

            <div className="p-6">
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
                <strong>HHF-AI HASH:</strong> {submissionHash}
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
              onClick={(e) => {
                // Close dialog when clicking backdrop (only if evaluation completed or errored)
                if (evaluationStatus.completed || evaluationStatus.error) {
                  if (e.target === e.currentTarget) {
                    setEvaluationStatus(null);
                    window.location.href = '/dashboard';
                  }
                }
              }}
            >
              <div className="mri-report-card w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* MRI Report Header */}
                <div className="mri-report-header">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mri-report-system-label">SYNTHSCAN™ MRI IMAGING REPORT</div>
                      <div className="flex items-center gap-3">
                        {evaluationStatus.completed ? (
                          <>
                            <div className="mri-scan-icon-complete">
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="mri-report-title">Examination Complete</div>
                              <div className="mri-report-subtitle">Diagnostic results available</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mri-scan-icon-scanning">
                              <Loader2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="mri-report-title">Scanning in Progress</div>
                              <div className="mri-report-subtitle">Acquiring imaging data...</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mri-scan-status">
                      <div className="mri-scan-status-label">Exam ID (HHF-AI HASH)</div>
                      <div className="mri-scan-id font-mono text-xs break-all">
                        {submissionHash}
                      </div>
                      <div className="mt-1 text-xs opacity-70">
                        <a 
                          href={`/api/archive/contributions/${submissionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          📊 View JSON
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mri-diagnostic-panel">
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

                        {/* PoC Score - MRI Style */}
                        <div className="mri-score-display">
                          <div className="mri-score-label">
                            {evaluationStatus.evaluation?.is_seed_submission
                              ? 'QUALIFICATION SCORE'
                              : 'POC SCORE'}
                          </div>
                          <div className="mri-score-value">
                            {evaluationStatus.podScore.toLocaleString()} / 10,000
                          </div>
                          {evaluationStatus.evaluation?.is_seed_submission && (
                            <div className="mt-2 text-xs text-slate-600">
                              Maximum score awarded for foundational contribution
                            </div>
                          )}
                        </div>

                        {/* Badges: Seed, Edge, Metals */}
                        {(evaluationStatus.evaluation?.is_seed_submission ||
                          evaluationStatus.evaluation?.is_edge_submission ||
                          (evaluationStatus.evaluation?.metals && evaluationStatus.evaluation.metals.length > 0)) && (
                          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 p-4">
                            <div className="mb-2 text-sm font-semibold text-slate-700">Qualifications Earned</div>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* SEED Badge */}
                              {evaluationStatus.evaluation?.is_seed_submission && (
                                <span 
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-500/20 text-green-700 border-2 border-green-500/30"
                                  title="Seed Submission - Defines irreducible primitives (S₀-S₈) (+15% multiplier)"
                                >
                                  <Sprout className="h-4 w-4" />
                                  SEED
                                </span>
                              )}
                              
                              {/* EDGE Badge */}
                              {evaluationStatus.evaluation?.is_edge_submission && (
                                <span 
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-500/20 text-blue-700 border-2 border-blue-500/30"
                                  title="Edge Submission - Defines boundary operators (E₀-E₆) (+15% multiplier)"
                                >
                                  <Link2 className="h-4 w-4" />
                                  EDGE
                                </span>
                              )}
                              
                              {/* Individual Metal Badges */}
                              {evaluationStatus.evaluation?.metals && 
                               Array.isArray(evaluationStatus.evaluation.metals) && 
                               evaluationStatus.evaluation.metals.length > 0 && (
                                <>
                                  {evaluationStatus.evaluation.metals.map((metal: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-amber-500/20 text-amber-700 border-2 border-amber-500/30 capitalize"
                                      title={`${metal} Metal Alignment`}
                                    >
                                      <Award className="h-4 w-4" />
                                      {metal}
                                    </span>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        )}

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
                                      <Loader2 className="mr-2 h-5 w-5" />
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
                            {evaluationStatus.evaluation.classification && (
                              <div className="rounded-lg bg-muted p-4">
                                <div className="mb-2 text-sm font-semibold">Classification</div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(evaluationStatus.evaluation.classification) ? (
                                    evaluationStatus.evaluation.classification.map(
                                      (cls: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                        >
                                          {cls}
                                        </span>
                                      )
                                    )
                                  ) : (
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                      {evaluationStatus.evaluation.classification}
                                    </span>
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
                                  Based on composite score (PoC Score):{' '}
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
                                    Redundancy Overlap:{' '}
                                    {evaluationStatus.evaluation.redundancy.toFixed(1)}%
                                    {evaluationStatus.evaluation.redundancy >= 9.2 && evaluationStatus.evaluation.redundancy <= 19.2 && (
                                      <span className="ml-2 text-green-600 font-medium">
                                        ⚡ Sweet Spot Detected
                                        {evaluationStatus.evaluation.score_trace?.toggles?.overlap_on 
                                          ? ' (Bonus Applied)' 
                                          : ' (Computed, toggle OFF)'}
                                      </span>
                                    )}
                                    {evaluationStatus.evaluation.redundancy > 30 && (
                                      <span className="ml-2 text-orange-600 font-medium">
                                        ⚠ Excess Overlap Detected
                                        {evaluationStatus.evaluation.score_trace?.toggles?.overlap_on 
                                          ? ' (Penalty Applied)' 
                                          : ' (Computed, toggle OFF)'}
                                      </span>
                                    )}
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
                                                .overlap_percent !== undefined && (
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-slate-600">
                                                    Redundancy Overlap:
                                                  </span>
                                                  <span className={`font-semibold ${
                                                    evaluationStatus.evaluation.grok_evaluation_details.overlap_percent >= 9.2 && 
                                                    evaluationStatus.evaluation.grok_evaluation_details.overlap_percent <= 19.2
                                                      ? 'text-green-600'
                                                      : evaluationStatus.evaluation.grok_evaluation_details.overlap_percent > 30
                                                      ? 'text-orange-600'
                                                      : 'text-slate-900'
                                                  }`}>
                                                    {evaluationStatus.evaluation.grok_evaluation_details.overlap_percent.toFixed(
                                                      1
                                                    )}
                                                    %
                                                    {evaluationStatus.evaluation.grok_evaluation_details.overlap_percent >= 9.2 && 
                                                     evaluationStatus.evaluation.grok_evaluation_details.overlap_percent <= 19.2 && 
                                                     ' (⚡ Sweet Spot)'}
                                                    {evaluationStatus.evaluation.grok_evaluation_details.overlap_percent > 30 && 
                                                     ' (⚠ Penalty)'}
                                                  </span>
                                                </div>
                                              )}
                                              {evaluationStatus.evaluation.grok_evaluation_details
                                                .redundancy_penalty_percent !== undefined &&
                                                evaluationStatus.evaluation.grok_evaluation_details.redundancy_penalty_percent > 0 && (
                                                <div className="flex items-center justify-between text-xs">
                                                  <span className="text-slate-600">
                                                    Excess-Overlap Penalty:
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

                                        {/* Final PoC Score */}
                                        <div className="border-t pt-2">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">
                                              Final PoC Score
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

                                  {/* Deterministic Score Trace - AUTHORITATIVE (Marek requirement) */}
                                  {evaluationStatus.evaluation.score_trace && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                      <div className="mb-3 font-semibold text-blue-900">
                                        📊 Deterministic Score Trace
                                      </div>
                                      <div className="space-y-3 text-sm">
                                        {/* Config Identifiers */}
                                        {evaluationStatus.evaluation.scoring_metadata && (
                                          <div className="rounded border border-blue-300 bg-white p-2 text-xs font-mono">
                                            <div className="mb-1 font-semibold text-blue-900">Configuration:</div>
                                            <div className="space-y-0.5 text-slate-700">
                                              <div>Config: {evaluationStatus.evaluation.scoring_metadata.score_config_id}</div>
                                              <div>Sandbox: {evaluationStatus.evaluation.scoring_metadata.sandbox_id}</div>
                                              <div>Archive: {evaluationStatus.evaluation.scoring_metadata.archive_version}</div>
                                              <div>Timestamp: {evaluationStatus.evaluation.scoring_metadata.evaluation_timestamp}</div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Formula Calculation Steps */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">1. Composite (N+D+C+A):</span>
                                            <span className="font-mono font-semibold text-blue-900">
                                              {evaluationStatus.evaluation.score_trace.composite.toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">2. Overlap %:</span>
                                            <span className="font-mono font-semibold text-blue-900">
                                              {evaluationStatus.evaluation.score_trace.overlap_percent.toFixed(2)}%
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">3. Penalty % (if &gt;30%):</span>
                                            <span className="font-mono font-semibold text-orange-600">
                                              {evaluationStatus.evaluation.score_trace.penalty_percent_applied.toFixed(2)}%
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">4. After Penalty:</span>
                                            <span className="font-mono font-semibold text-blue-900">
                                              {evaluationStatus.evaluation.score_trace.after_penalty.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">5. Bonus Multiplier (sweet spot):</span>
                                            <span className="font-mono font-semibold text-green-600">
                                              ×{evaluationStatus.evaluation.score_trace.bonus_multiplier_applied.toFixed(3)}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-700">6. After Bonus:</span>
                                            <span className="font-mono font-semibold text-blue-900">
                                              {evaluationStatus.evaluation.score_trace.after_bonus.toFixed(2)}
                                            </span>
                                          </div>
                                          {evaluationStatus.evaluation.score_trace.is_seed_submission && (
                                            <>
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-blue-700">7. Seed Multiplier:</span>
                                                <span className="font-mono font-semibold text-purple-600">
                                                  ×{evaluationStatus.evaluation.score_trace.seed_multiplier?.toFixed(2) || '1.00'}
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-blue-700">8. After Seed:</span>
                                                <span className="font-mono font-semibold text-blue-900">
                                                  {evaluationStatus.evaluation.score_trace.after_seed?.toFixed(2) || 'N/A'}
                                                </span>
                                              </div>
                                            </>
                                          )}
                                          <div className="border-t border-blue-300 pt-2">
                                            <div className="flex items-center justify-between">
                                              <span className="font-semibold text-blue-900">Final Score (clamped 0-10000):</span>
                                              <span className="text-lg font-bold text-blue-900">
                                                {evaluationStatus.podScore.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Formula String */}
                                        <div className="rounded border border-blue-300 bg-white p-2 text-xs font-mono text-slate-700">
                                          <div className="mb-1 font-semibold text-blue-900">Formula:</div>
                                          {evaluationStatus.evaluation.score_trace.formula}
                                        </div>

                                        {/* Validation Check */}
                                        <div className="rounded border border-green-300 bg-green-50 p-2 text-xs">
                                          <div className="mb-1 font-semibold text-green-900">Formula Validation:</div>
                                          <div className="font-mono text-slate-700">
                                            {(() => {
                                              const trace = evaluationStatus.evaluation.score_trace;
                                              const composite = trace.composite;
                                              const penalty = trace.penalty_percent_applied / 100;
                                              const bonus = trace.bonus_multiplier_applied;
                                              const seed = trace.seed_multiplier || 1.0;
                                              const expected = Math.round(composite * (1 - penalty) * bonus * seed);
                                              const actual = trace.final_score;
                                              const k = actual / (composite * (1 - penalty));
                                              const match = Math.abs(expected - actual) <= 1; // Allow 1 point rounding
                                              return (
                                                <>
                                                  <div>Expected: {expected.toLocaleString()}</div>
                                                  <div>Actual: {actual.toLocaleString()}</div>
                                                  <div>k-factor: {k.toFixed(4)} {match ? '✅' : '⚠️'}</div>
                                                  {!match && (
                                                    <div className="mt-1 text-orange-600 font-semibold">
                                                      ⚠️ Formula mismatch detected! (Marek alert)
                                                    </div>
                                                  )}
                                                </>
                                              );
                                            })()}
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
                            <Loader2 className="absolute -right-1 -top-1 h-4 w-4 text-primary" />
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
                                <Loader2 className="h-3 w-3" />
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
                            // Use hard redirect instead of router.push for mobile compatibility
                            window.location.href = '/dashboard';
                          }}
                          variant="outline"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            // Use hard redirect instead of router.push for mobile compatibility
                            window.location.href = '/dashboard';
                          }}
                        >
                          View on Dashboard
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3" />
                        Evaluation in progress... (this may take up to 2 minutes)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Exam Information */}
          <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <div className="mb-2 text-sm font-semibold text-blue-900">SynthScan™ MRI — HHF-AI Spin Resonance Imaging</div>
            <div className="space-y-2 text-xs text-slate-700">
              <p>• <strong>Imaging Method:</strong> Hydrogen spin–mediated resonance (HHF-AI Spin)</p>
              <p>• <strong>Preparation:</strong> Text-only submissions (abstracts, equations, constants)</p>
              <p>• <strong>Scan Parameters:</strong> 4,000 character imaging window</p>
              <p>• <strong>Examination Fee:</strong> $500 per scan (approved testers: complimentary)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exam Details Section */}
            <div className="mri-input-section">
              <div className="mri-section-header">Exam Details</div>
              <label htmlFor="title" className="mri-field-label">
                Contribution Title *
              </label>
              <input
                id="title"
                type="text"
                className="mri-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter examination subject"
                required
                disabled={loading}
              />
            </div>

            {/* Imaging Data Input */}
            <div className="mri-input-section">
              <div className="mri-section-header">Imaging Data Input</div>
              <label htmlFor="text_content" className="mri-field-label">
                Submission Text * (Abstract, Equations, Constants Only)
              </label>
              <textarea
                id="text_content"
                className={`mri-textarea ${isOverLimit ? 'border-red-500' : ''}`}
                value={formData.text_content}
                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                placeholder="Enter examination data - Abstract, equations, and constants only"
                required
                disabled={loading}
                rows={10}
              />
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  Scan window: {MAX_CONTENT_LENGTH.toLocaleString()} characters
                </span>
                <span
                  className={isOverLimit ? 'font-semibold text-red-600' : ''}
                >
                  {contentLength.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
                </span>
              </div>
              {isOverLimit && (
                <div className="mt-2 rounded border border-orange-300 bg-orange-50 p-2 text-xs text-orange-800">
                  Data exceeds scan window by {(contentLength - MAX_CONTENT_LENGTH).toLocaleString()} characters. Content will be truncated to fit imaging parameters.
                </div>
              )}
            </div>

            {/* Start Examination Button */}
            <button
              type="submit"
              className="mri-start-exam-btn"
              disabled={loading || !formData.title.trim() || !formData.text_content.trim()}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5" />
                  <span>Processing Examination...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <span>Start Examination - $500</span>
                </span>
              )}
            </button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
