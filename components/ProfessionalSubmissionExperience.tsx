/**
 * Professional Submission Experience
 * 
 * Senior Designer & Story Talent: Professional branded and narrated submission experience
 * with clean testing flow from landing → submission → console → output
 * 
 * Features:
 * - Professional branding and narration
 * - Animated progress panels
 * - Clean, intuitive interface
 * - Smooth animations using Vibing Animating Protocol
 * - Integration with payment methods
 * - Professional output delivery
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IntegrityValidator } from '@/utils/validation/IntegrityValidator';
import { extractSovereignScore, extractSovereignScoreWithValidation, formatSovereignScore } from '@/utils/thalet/ScoreExtractor';
import { sanitizeNarrative } from '@/utils/narrative/sanitizeNarrative';
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
  X,
  ArrowRight,
  FileText,
  Sparkles,
  Zap,
  Star,
  Rocket,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { PaymentMethodSelector, type PaymentMethod } from '@/components/PaymentMethodSelector';
import { ChamberAPanel, ChamberBPanel, BubbleClassDisplay } from '@/components/scoring/ChamberPanels';

interface ProfessionalSubmissionExperienceProps {
  userEmail: string;
}

type SubmissionStep = 'form' | 'payment' | 'processing' | 'evaluation' | 'complete';

export default function ProfessionalSubmissionExperience({ userEmail }: ProfessionalSubmissionExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<SubmissionStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submissionHash, setSubmissionHash] = useState<string | null>(null);
  const [registeringPoC, setRegisteringPoC] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [narrationText, setNarrationText] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    text_content: '' as string,
  });
  const [stateImage, setStateImage] = useState<File | null>(null);
  const [stateImagePreview, setStateImagePreview] = useState<string | null>(null);
  const [useStateImageEncryption, setUseStateImageEncryption] = useState(false);

  const [evaluationStatus, setEvaluationStatus] = useState<{
    completed?: boolean;
    podScore?: number | null;
    qualified?: boolean;
    error?: string;
    notice?: string;
    evaluation?: any;
    validationError?: string | null;
    scoreMismatch?: boolean;
    mismatchDetails?: string | null;
  } | null>(null);

  const MAX_CONTENT_LENGTH = 4000;
  const contentLength = formData.text_content.length;
  const isOverLimit = contentLength > MAX_CONTENT_LENGTH;

  // Professional narration system
  const narrations = {
    form: "Welcome to the Syntheverse Proof-of-Contribution system. Your journey begins here, where innovation meets verification.",
    payment: "Select your preferred payment method. Every contribution is valued and processed with care.",
    processing: "Your contribution is being prepared for evaluation. The HHF-AI system is initializing...",
    evaluation: "The holographic hydrogen fractal AI is analyzing your contribution across four dimensions: Novelty, Density, Coherence, and Alignment.",
    complete: "Evaluation complete. Your contribution has been processed and scored. Review your results below."
  };

  useEffect(() => {
    setNarrationText(narrations[currentStep]);
  }, [currentStep]);

  // Check for return from payment
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    const status = searchParams?.get('status');
    const hash = searchParams?.get('hash');

    if (sessionId && status === 'success' && hash) {
      setSubmissionHash(hash);
      setCurrentStep('evaluation');
      setSuccess(true);
      checkEvaluationStatusAfterPayment(hash);
    }
  }, [searchParams]);

  const checkEvaluationStatusAfterPayment = async (submissionHashParam?: string | null) => {
    if (!submissionHashParam) return;

    let pollCount = 0;
    const maxPolls = 60;
    const pollEveryMs = 2000;

    const pollInterval = setInterval(async () => {
      pollCount++;

      try {
        const response = await fetch(`/api/archive/contributions/${submissionHashParam}`);
        if (!response.ok) {
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setEvaluationStatus({
              completed: false,
              error: 'Evaluation is taking longer than expected. Please check your dashboard.',
            });
          }
          return;
        }

        const submission = await response.json();

        if (submission && submission.submission_hash) {
          if (submission.status === 'evaluating') {
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setEvaluationStatus({
                completed: false,
                error: 'Evaluation is taking longer than expected. Please check your dashboard.',
              });
            }
            return;
          } else if (submission.status === 'qualified' || submission.status === 'unqualified') {
            clearInterval(pollInterval);
            setSubmissionHash(submission.submission_hash);
            setSuccess(true);
            setCurrentStep('complete');

            const metadata = submission.metadata || {};
            const atomicScore = submission.atomic_score || metadata.atomic_score;

            let scoreResult;
            let pocScore: number | null = null;
            let scoreMismatch = false;
            let mismatchDetails: string | null = null;
            let validationError: string | null = null;

            try {
              scoreResult = extractSovereignScoreWithValidation({
                atomic_score: atomicScore,
                metadata,
                pod_score: submission.pod_score,
                evaluation: metadata,
              });

              pocScore = scoreResult.score;
              scoreMismatch = scoreResult.hasMismatch;
              mismatchDetails = scoreResult.mismatchDetails;

              if (scoreResult.source === 'score_trace') {
                validationError = 'WARNING: Legacy evaluation format (atomic_score missing). Please re-evaluate.';
              } else if (scoreResult.source === 'pod_score') {
                validationError = 'ERROR: No atomic_score found. Evaluation may be incomplete or corrupted.';
              } else if (scoreResult.source === 'none') {
                validationError = 'ERROR: No score data found. Evaluation may be incomplete.';
              }

              if (scoreMismatch) {
                console.error('[THALET_ZERO_DELTA_VIOLATION]', mismatchDetails);
              }
            } catch (validationErr) {
              console.error('[THALET] atomic_score validation failed:', validationErr);
              validationError = validationErr instanceof Error
                ? validationErr.message
                : 'Integrity hash validation failed. Score may be corrupted.';

              if (atomicScore && typeof atomicScore.final === 'number') {
                pocScore = atomicScore.final;
                scoreMismatch = true;
                mismatchDetails = 'Integrity hash mismatch detected. Score displayed but registration blocked.';
              } else {
                pocScore = submission.pod_score ?? null;
                if (pocScore !== null) {
                  scoreMismatch = true;
                  mismatchDetails = 'atomic_score validation failed. Using pod_score fallback (registration blocked).';
                }
              }
            }

            const qualifiedScore = pocScore ?? 0;
            const shouldBeQualified = qualifiedScore >= 8000;
            const actualQualified = submission.status === 'qualified';

            if (actualQualified && pocScore !== null && pocScore < 8000) {
              scoreMismatch = true;
              mismatchDetails = `Founder qualification mismatch: Status is 'qualified' but atomic_score.final (${pocScore}) < 8000 threshold. This violates Zero-Delta protocol.`;
            }

            setEvaluationStatus({
              completed: true,
              podScore: pocScore,
              qualified: actualQualified,
              evaluation: {
                ...metadata,
                atomic_score: atomicScore || null,
              },
              validationError: validationError || (scoreMismatch ? mismatchDetails : null),
              scoreMismatch,
              mismatchDetails,
            });
          }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPaymentMethod && !showPaymentSelector) {
      setShowPaymentSelector(true);
      setCurrentStep('payment');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setCurrentStep('processing');

    if (!formData.title.trim() || !formData.text_content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      setCurrentStep('form');
      return;
    }

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('text_content', formData.text_content);
      submitFormData.append('contributor', userEmail);
      if (selectedPaymentMethod) {
        submitFormData.append('payment_method', selectedPaymentMethod.type);
      }
      if (useStateImageEncryption && stateImage) {
        submitFormData.append('state_image', stateImage);
        submitFormData.append('use_state_image_encryption', 'true');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
      clearTimeout(timeoutId);

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error(`Server error: Failed to parse response. Please try again.`);
      }

      if (!response.ok) {
        const errorMsg = result.error || result.message || 'Failed to submit contribution';
        throw new Error(errorMsg);
      }

      if (result.operator_mode && result.submission_hash) {
        setSubmissionHash(result.submission_hash);
        setSuccess(true);
        setLoading(false);
        setCurrentStep('evaluation');
        setEvaluationStatus({ completed: false });
        checkEvaluationStatusAfterPayment(result.submission_hash);
        return;
      } else if (result.checkout_url && result.submission_hash) {
        if (selectedPaymentMethod?.type === 'stripe') {
          window.location.href = result.checkout_url;
          return;
        } else if (selectedPaymentMethod?.type === 'onchain' || selectedPaymentMethod?.type === 'blockchain') {
          try {
            const paymentResponse = await fetch('/api/payments/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: 500.00,
                currency: 'usd',
                method: selectedPaymentMethod.type,
                metadata: {
                  submission_hash: result.submission_hash,
                  user_email: userEmail,
                },
              }),
            });

            const paymentData = await paymentResponse.json();
            if (paymentData.success && paymentData.payment) {
              setSubmissionHash(result.submission_hash);
              setSuccess(true);
              setLoading(false);
              setCurrentStep('evaluation');
              setEvaluationStatus({ completed: false });
              checkEvaluationStatusAfterPayment(result.submission_hash);
              return;
            } else {
              throw new Error(paymentData.message || 'Payment processing failed');
            }
          } catch (paymentError) {
            throw new Error(
              paymentError instanceof Error
                ? paymentError.message
                : 'Payment processing failed. Please try again.'
            );
          }
        } else if (selectedPaymentMethod?.type === 'venmo' || selectedPaymentMethod?.type === 'cashapp') {
          try {
            const paymentResponse = await fetch('/api/payments/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: 500.00,
                currency: 'usd',
                method: selectedPaymentMethod.type,
                metadata: {
                  submission_hash: result.submission_hash,
                  user_email: userEmail,
                },
              }),
            });

            const paymentData = await paymentResponse.json();
            if (paymentData.success && paymentData.payment) {
              setSubmissionHash(result.submission_hash);
              setSuccess(true);
              setLoading(false);
              setCurrentStep('evaluation');
              setEvaluationStatus({ completed: false });
              checkEvaluationStatusAfterPayment(result.submission_hash);
              return;
            } else {
              throw new Error(paymentData.message || 'Payment processing failed');
            }
          } catch (paymentError) {
            throw new Error(
              paymentError instanceof Error
                ? paymentError.message
                : 'Payment processing failed. Please try again.'
            );
          }
        } else {
          window.location.href = result.checkout_url;
          return;
        }
      } else {
        throw new Error(result.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting. Please try again.';
      setError(errorMessage);
      setCurrentStep('form');
    } finally {
      setLoading(false);
    }
  };

  const getSovereignScore = (): number | null => {
    if (!evaluationStatus) return null;
    return extractSovereignScore({
      atomic_score: evaluationStatus.evaluation?.atomic_score,
      metadata: evaluationStatus.evaluation,
      pod_score: evaluationStatus.podScore,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070a] via-[#0a0d12] to-[#05070a] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 holographic-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/10"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="hydrogen-particle absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-12">
        {/* Professional Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 text-transparent bg-clip-text">
                Syntheverse
              </h1>
              <p className="text-sm text-slate-400 uppercase tracking-widest mt-1">
                Proof-of-Contribution System
              </p>
            </div>
          </div>

          {/* Professional Narration */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-slate-200 leading-relaxed">
                    {narrationText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {(['form', 'payment', 'processing', 'evaluation', 'complete'] as SubmissionStep[]).map((step, index) => {
              const stepNames = {
                form: 'Details',
                payment: 'Payment',
                processing: 'Processing',
                evaluation: 'Evaluation',
                complete: 'Complete'
              };
              const isActive = currentStep === step;
              const isCompleted = ['form', 'payment', 'processing', 'evaluation', 'complete'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                        : isActive
                        ? 'bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse'
                        : 'bg-slate-800 border-slate-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <span className="text-slate-400 font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                      isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {stepNames[step]}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Step */}
          {currentStep === 'form' && (
            <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Contribution Details
                </CardTitle>
                <CardDescription>
                  Provide the title and content of your contribution (abstract, equations, and constants only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Contribution Title *</Label>
                    <input
                      id="title"
                      type="text"
                      className="w-full mt-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter your contribution title"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text_content">Contribution Content *</Label>
                    <textarea
                      id="text_content"
                      className={`w-full mt-2 px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[200px] ${
                        isOverLimit ? 'border-red-500' : 'border-slate-700'
                      }`}
                      value={formData.text_content}
                      onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                      placeholder="Enter your contribution content (abstract, equations, and constants only - 4,000 character limit)"
                      required
                      disabled={loading}
                    />
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-slate-500">
                        Maximum: {MAX_CONTENT_LENGTH.toLocaleString()} characters
                      </span>
                      <span className={isOverLimit ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                        {contentLength.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
                      </span>
                    </div>
                    {isOverLimit && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                        Content exceeds limit by {(contentLength - MAX_CONTENT_LENGTH).toLocaleString()} characters. Content will be truncated.
                      </div>
                    )}
                  </div>

                  {/* Omnibeam 9x7 Fiberoptic State Image Encryption Option */}
                  <div className="space-y-4 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id="use_state_image_encryption"
                            checked={useStateImageEncryption}
                            onChange={(e) => setUseStateImageEncryption(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            disabled={loading}
                          />
                          <Label htmlFor="use_state_image_encryption" className="text-base font-semibold text-white cursor-pointer">
                            Ultimate Encryption: Omnibeam 9x7 Fiberoptic State Image
                          </Label>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                          Use your image's unique 9x7 fiberoptic state as the ultimate encryption key. 
                          The state image ID will accompany your scores for maximum protection within the Syntheverse PoC natural protocol shell on-chain.
                        </p>
                        
                        {useStateImageEncryption && (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="state_image" className="text-sm text-slate-300">
                                State Image (JPG, PNG, WebP - Max 10MB)
                              </Label>
                              <input
                                id="state_image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                      setError('Image must be less than 10MB');
                                      return;
                                    }
                                    setStateImage(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setStateImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
                                disabled={loading}
                              />
                            </div>
                            
                            {stateImagePreview && (
                              <div className="relative">
                                <img
                                  src={stateImagePreview}
                                  alt="State image preview"
                                  className="w-full max-w-md mx-auto rounded-lg border border-blue-500/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStateImage(null);
                                    setStateImagePreview(null);
                                  }}
                                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            
                            <div className="text-xs text-slate-500 bg-slate-900/50 p-3 rounded border border-slate-700">
                              <p className="font-semibold mb-1">NSPFRP State Imaging Protocol:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>9x7 (63-point) fiberoptic grid extraction</li>
                                <li>Encryption key derived from unique state</li>
                                <li>State image ID generated from core output</li>
                                <li>On-chain anchoring for ultimate protection</li>
                              </ul>
                            </div>
                            
                            {/* Max Encryption Plans Include Certifications */}
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                                Max Encryption Plans Include Certifications
                              </p>
                              <p className="text-xs text-slate-400 mb-2">
                                All maximum encryption plans include SynthScan™ and Omnibeam certifications at the end,
                                ensuring ultimate protection and verification.
                              </p>
                              <div className="flex gap-2">
                                <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  SynthScan™
                                </span>
                                <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-[10px] font-bold text-purple-400 flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  Omnibeam
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={loading || !formData.title.trim() || !formData.text_content.trim() || (useStateImageEncryption && !stateImage)}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Rocket className="h-5 w-5" />
                        Continue to Payment
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {(currentStep === 'payment' || showPaymentSelector) && (
            <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-in fade-in slide-in-from-right">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Select your preferred payment method for the $500 evaluation fee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  amount={500.00}
                  currency="usd"
                  onMethodSelect={(method) => {
                    setSelectedPaymentMethod(method);
                    setShowPaymentSelector(false);
                    setCurrentStep('form');
                  }}
                  selectedMethod={selectedPaymentMethod}
                />
                {selectedPaymentMethod && (
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="font-semibold text-green-400">Payment Method Selected</div>
                        <div className="text-sm text-slate-400">{selectedPaymentMethod.name}</div>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setShowPaymentSelector(false);
                    setCurrentStep('form');
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Back to Form
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 mb-6">
                    <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Processing Your Submission</h3>
                  <p className="text-slate-400">Preparing your contribution for evaluation...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Step */}
          {currentStep === 'evaluation' && (
            <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 mb-6">
                    <Brain className="h-10 w-10 text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Evaluation in Progress</h3>
                  <p className="text-slate-400">The HHF-AI system is analyzing your contribution...</p>
                  {submissionHash && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Submission Hash</div>
                      <div className="font-mono text-sm text-blue-400 break-all">{submissionHash}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Step - Evaluation Results */}
          {currentStep === 'complete' && evaluationStatus && (
            <div className="space-y-6">
              <Card className="border-green-500/30 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Evaluation Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluationStatus.completed && evaluationStatus.podScore !== undefined && evaluationStatus.podScore !== null && (
                    <div className="text-center mb-6">
                      <div className="text-6xl font-black mb-2 bg-gradient-to-r from-green-400 to-blue-400 text-transparent bg-clip-text">
                        {evaluationStatus.podScore.toLocaleString()}
                      </div>
                      <div className="text-slate-400 mb-4">PoC Score / 10,000</div>
                      {evaluationStatus.qualified && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                          <Award className="h-5 w-5 text-green-400" />
                          <span className="font-semibold text-green-400">QUALIFIED</span>
                        </div>
                      )}
                    </div>
                  )}

                  {evaluationStatus.scoreMismatch && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Zero-Delta Protocol Violation</AlertTitle>
                      <AlertDescription>{evaluationStatus.mismatchDetails}</AlertDescription>
                    </Alert>
                  )}

                  {evaluationStatus.qualified && !evaluationStatus.scoreMismatch && (
                    <div className="mt-6">
                      <Button
                        onClick={async () => {
                          if (!submissionHash) return;
                          setRegisteringPoC(true);
                          setRegisterError(null);
                          try {
                            const res = await fetch(`/api/poc/${encodeURIComponent(submissionHash)}/register`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              throw new Error(data?.error || data?.message || 'Registration failed');
                            }
                            if (data.success && data.registered) {
                              alert(`PoC registered successfully on blockchain!\nTransaction Hash: ${data.registration_tx_hash || 'N/A'}`);
                              router.push('/dashboard');
                            } else {
                              throw new Error(data?.message || data?.error || 'Registration failed');
                            }
                          } catch (e) {
                            setRegisterError(e instanceof Error ? e.message : 'Registration failed');
                          } finally {
                            setRegisteringPoC(false);
                          }
                        }}
                        disabled={registeringPoC}
                        className="w-full py-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        {registeringPoC ? (
                          <span className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Registering on Blockchain...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <Link2 className="h-5 w-5" />
                            Register on Blockchain
                          </span>
                        )}
                      </Button>
                      {registerError && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertDescription>{registerError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="outline"
                      className="w-full"
                    >
                      View Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
