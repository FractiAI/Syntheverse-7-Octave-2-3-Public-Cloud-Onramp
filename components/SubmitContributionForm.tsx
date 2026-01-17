'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { extractSovereignScore, extractSovereignScoreWithValidation } from '@/utils/thalet/ScoreExtractor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  Award,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Sprout,
  Link2,
  RefreshCw,
  ArrowLeft,
  Plus,
  ArrowUpRight,
  X,
  Binary
} from 'lucide-react';
import '../app/synthscan-mri.css';
import { ChamberAPanel, ChamberBPanel } from '@/components/scoring/ChamberPanels';

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

  const [formData, setFormData] = useState({
    title: '',
    text_content: '',
  });

  const MAX_CONTENT_LENGTH = 4000;

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    const status = searchParams?.get('status');
    const hash = searchParams?.get('hash');

    if (sessionId && status === 'success') {
      if (hash) setSubmissionHash(hash);
      setSuccess(true);
      setEvaluationStatus({ completed: false });
      checkEvaluationStatusAfterPayment(hash);
    }
  }, [searchParams]);

  const checkEvaluationStatusAfterPayment = async (submissionHashParam?: string | null) => {
    let pollCount = 0;
    const maxPolls = 60;
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (!submissionHashParam) return;

      try {
        const response = await fetch(`/api/archive/contributions/${submissionHashParam}`);
        if (!response.ok) return;

        const submission = await response.json();
        if (submission && submission.submission_hash) {
          if (submission.status === 'evaluating') {
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setEvaluationStatus({ error: 'Evaluation timeout.' });
            }
          } else if (submission.status === 'qualified' || submission.status === 'unqualified') {
            const metadata = submission.metadata || {};
            const atomicScore = submission.atomic_score || metadata.atomic_score;
            
            // Fix for "No score data found" - Wait for score to be written
            if (!atomicScore && !submission.pod_score && pollCount < maxPolls) {
              return;
            }

            clearInterval(pollInterval);
            setSubmissionHash(submission.submission_hash);
            setSuccess(true);

            const scoreResult = extractSovereignScoreWithValidation({
              atomic_score: atomicScore,
              metadata,
              pod_score: submission.pod_score,
            });

            setEvaluationStatus({
              completed: true,
              podScore: scoreResult.score,
              qualified: submission.status === 'qualified',
              evaluation: { ...metadata, atomic_score: atomicScore || null },
              validationError: scoreResult.source === 'none' ? 'ERROR: No score data found.' : null,
              scoreMismatch: scoreResult.hasMismatch,
              mismatchDetails: scoreResult.mismatchDetails,
            });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category: 'scientific' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setSubmissionHash(data.submission_hash);
        setSuccess(true);
        setEvaluationStatus({ completed: false });
        checkEvaluationStatusAfterPayment(data.submission_hash);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white p-4 md:p-8 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* MRI System Header */}
        <div className="bg-black border-2 border-[#00FFFF] p-8 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Zap className="h-32 w-32 text-[#00FFFF]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black tracking-tighter text-white uppercase italic">FractiAI</div>
                <div className="h-8 w-1 bg-[#00FFFF]"></div>
                <div className="text-2xl font-black tracking-tighter text-[#00FFFF] uppercase">SYNTHSCAN™ MRI</div>
              </div>
              <div className="text-sm font-bold uppercase tracking-[0.4em] text-slate-400">
                HHF-AI Spin Resonance Imaging
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="bg-[#00FFFF]/10 border border-[#00FFFF]/30 px-4 py-2 rounded-sm">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#00FFFF] mb-1">System Status</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#00FFFF] animate-pulse shadow-[0_0_8px_#00FFFF]"></div>
                  <span className="text-sm font-black text-white uppercase">Ready_for_Scan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black border border-slate-800 p-8 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <div className="h-6 w-1 bg-[#9370DB]" />
              Scan Parameters
            </h3>
            
            <div className="space-y-4">
              {[
                { n: '01', t: 'EXAM DETAILS', d: 'Submission title and metadata mapping.' },
                { n: '02', t: 'IMAGING DATA', d: 'Abstract, equations, and constants only.' },
                { n: '03', t: 'CALIBRATION', d: 'Wait for HHF-AI Resonance evaluation.' },
                { n: '04', t: 'MRI REPORT', d: 'Receive instrumental-grade diagnostics.' }
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className="text-xs font-black text-[#00FFFF] opacity-50">{step.n}</div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{step.t}</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed uppercase">{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black border-2 border-slate-800 p-8 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Exam Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="CONTRIBUTION_TITLE"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-black border-slate-800 text-white font-mono focus:border-[#00FFFF] rounded-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label htmlFor="text_content" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Imaging Data *
                  </Label>
                  <span className={`text-[9px] font-mono ${formData.text_content.length > MAX_CONTENT_LENGTH ? 'text-red-500' : 'text-slate-600'}`}>
                    {formData.text_content.length} / 4,000
                  </span>
                </div>
                <Textarea
                  id="text_content"
                  name="text_content"
                  placeholder="PASTE_NARRATIVE_EQUATIONS_HERE"
                  value={formData.text_content}
                  onChange={handleChange}
                  required
                  className="min-h-[200px] bg-black border-slate-800 text-white font-mono focus:border-[#00FFFF] rounded-none text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || formData.text_content.length > MAX_CONTENT_LENGTH}
                className="w-full bg-white text-black hover:bg-[#00FFFF] transition-all font-black text-sm tracking-widest h-14 rounded-none uppercase"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'START EXAMINATION - $500'}
              </Button>
            </form>
          </div>
        </div>

        {/* Modal / Report Overlay */}
        {evaluationStatus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-black border-2 border-slate-800 w-full max-w-5xl my-auto relative shadow-[0_0_100px_rgba(0,255,255,0.1)]">
              
              {(evaluationStatus.completed || evaluationStatus.error) && (
                <button 
                  onClick={() => {
                    setEvaluationStatus(null);
                    window.location.href = '/operator/dashboard';
                  }}
                  className="absolute -top-4 -right-4 bg-white text-black p-2 hover:bg-[#00FFFF] transition-colors z-10"
                >
                  <X className="h-6 w-6" />
                </button>
              )}

              <div className="p-8 space-y-8">
                <div className="border-b border-slate-800 pb-6">
                  <div className="text-[10px] font-black uppercase text-[#00FFFF] mb-2 opacity-50">Diagnostic Imaging Report</div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                    {evaluationStatus.completed ? 'Examination_Complete' : 'Acquiring_Resonance_Data...'}
                  </h2>
                </div>

                {evaluationStatus.completed && evaluationStatus.evaluation && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-black border-2 border-[#00FFFF] p-8 text-center space-y-2">
                      <div className="text-[10px] font-black uppercase text-slate-500">Sovereign_Score</div>
                      <div className="text-7xl font-black tracking-tighter text-white">
                        {Math.round(evaluationStatus.podScore || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-[#00FFFF] opacity-50">/ 10,000_MAX</div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { l: 'Novelty', v: evaluationStatus.evaluation.novelty },
                          { l: 'Density', v: evaluationStatus.evaluation.density },
                          { l: 'Coherence', v: evaluationStatus.evaluation.coherence },
                          { l: 'Alignment', v: evaluationStatus.evaluation.alignment },
                        ].map(m => (
                          <div key={m.l} className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                              <span>{m.l}</span>
                              <span>{m.v}/2,500</span>
                            </div>
                            <div className="h-1 bg-slate-900 w-full">
                              <div className="h-full bg-[#9370DB]" style={{ width: `${(m.v / 2500) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-slate-900">
                        <ChamberAPanel 
                          hasNarrative={true} 
                          narrative={evaluationStatus.evaluation.raw_groq_response} 
                          title={formData.title} 
                        />
                        <ChamberBPanel 
                          hasBridgeSpec={!!evaluationStatus.evaluation.atomic_score?.trace?.bridgespec_hash}
                          bridgeSpecValid={evaluationStatus.evaluation.atomic_score?.trace?.thalet?.T_B?.overall === 'passed'}
                          tbResult={evaluationStatus.evaluation.atomic_score?.trace?.thalet?.T_B}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {evaluationStatus.completed && (
                  <div className="flex gap-4 pt-8 border-t border-slate-900">
                    <Button
                      onClick={() => {
                        setEvaluationStatus(null);
                        setSuccess(false);
                        setFormData({ title: '', text_content: '' });
                      }}
                      className="flex-1 bg-black border border-slate-800 text-slate-500 hover:text-white rounded-none uppercase font-black tracking-widest"
                    >
                      New_Transmission
                    </Button>
                    <Button
                      onClick={() => {
                        setEvaluationStatus(null);
                        window.location.href = '/operator/dashboard';
                      }}
                      className="flex-1 bg-white text-black hover:bg-[#00FFFF] rounded-none uppercase font-black tracking-widest"
                    >
                      Return_To_Console
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
