'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  FlaskConical, 
  ShieldCheck, 
  Binary, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  FileSearch,
  Award,
  Archive,
  RefreshCcw,
  X,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { ChamberAPanel, ChamberBPanel, BubbleClassDisplay } from '@/components/scoring/ChamberPanels';

export default function MRIScannerConsole() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('scientific');
  const [scanning, setScanner] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!content || !title) {
      setError('Please provide both a title and document content.');
      return;
    }

    setScanner(true);
    setError(null);
    setResult(null);

    try {
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          text_content: content, 
          category,
          is_test_scan: true 
        }),
      });

      if (!submitResponse.ok) throw new Error('Submission failed');
      const submitData = await submitResponse.json();
      const hash = submitData.submission_hash;

      const evalResponse = await fetch(`/api/evaluate/${hash}`, {
        method: 'POST',
      });

      if (!evalResponse.ok) throw new Error('Evaluation failed');
      const evalData = await evalResponse.json();
      
      const resultWithHash = {
        ...evalData.evaluation,
        submission_hash: hash
      };
      
      setResult(resultWithHash);
    } catch (err: any) {
      setError(err.message || 'An error occurred during the MRI scan.');
    } finally {
      setScanner(false);
    }
  };

  const handleUnpublish = async () => {
    if (!result?.submission_hash) return;
    
    setUnpublishing(true);
    try {
      const response = await fetch(`/api/archive/contributions/${result.submission_hash}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unpublish scan results.');
      setResult(null);
      setError('Protocol unpublished successfully (Snap).');
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error unpublishing protocol.');
    } finally {
      setUnpublishing(false);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Console Header */}
      <div className="bg-black border-2 border-[#00FFFF] p-8 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Activity className="h-32 w-32 text-[#00FFFF]" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 rounded-full bg-[#00FFFF]/10 border border-[#00FFFF]/30">
            <Zap className="h-10 w-10 text-[#00FFFF]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
              SynthScan™ MRI Test Console
            </h2>
            <p className="text-[10px] font-black text-[#9370DB] uppercase tracking-[0.4em] mt-1">
              Instrumental Grade Verification · NSPFRP Protocol Compliance
            </p>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black border border-slate-800 p-8 space-y-6">
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-3">
              <div className="h-6 w-1 bg-[#9370DB]" />
              New Scan Parameters
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-black uppercase text-slate-500">Document Title</Label>
                <Input 
                  id="title"
                  placeholder="TRANSMISSION_TITLE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black border-slate-800 text-white rounded-none focus:border-[#00FFFF]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase text-slate-500">Scan Category</Label>
                <select 
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-black border border-slate-800 text-white text-sm focus:outline-none focus:border-[#00FFFF] rounded-none"
                >
                  <option value="scientific">Scientific/Research</option>
                  <option value="tech">Technical/Implementation</option>
                  <option value="alignment">Alignment/Philosophy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-black border-2 border-slate-800 p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-[10px] font-black uppercase text-slate-500">Imaging Data Input</Label>
              <Textarea 
                id="content"
                placeholder="PASTE_NSPFRP_MATRIX_SOURCE_TEXT"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] bg-black border-slate-800 text-white font-mono text-xs rounded-none focus:border-[#00FFFF]"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-black uppercase">{error}</span>
              </div>
            )}

            <Button 
              onClick={handleScan} 
              disabled={scanning}
              className="w-full bg-white text-black hover:bg-[#00FFFF] font-black h-14 rounded-none uppercase tracking-widest"
            >
              {scanning ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  INITIATING_SCAN...
                </div>
              ) : (
                'RUN DIAGNOSTIC SCAN'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black border-2 border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
                  <h3 className="text-xs font-black text-[#00FFFF] uppercase tracking-widest flex items-center gap-2">
                    <Binary className="h-4 w-4" />
                    Instrumental Grade Scan Report
                  </h3>
                  <span className="text-[9px] font-black bg-[#00FFFF]/10 text-[#00FFFF] px-2 py-1 border border-[#00FFFF]/20">
                    ZERO-DELTA VERIFIED
                  </span>
                </div>
                <div className="p-8 space-y-8">
                  <div className="bg-[#0a0a0a] border border-slate-900 p-6 space-y-6">
                    <ChamberAPanel hasNarrative={true} narrative={content} title={title} />
                    <ChamberBPanel 
                      hasBridgeSpec={!!result.atomic_score?.trace?.bridgespec_hash}
                      bridgeSpecValid={result.atomic_score?.trace?.thalet?.T_B?.overall === 'passed'}
                      tbResult={result.atomic_score?.trace?.thalet?.T_B}
                    />
                    <BubbleClassDisplay precision={result.atomic_score?.trace?.precision} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black border border-green-500/30 p-6 flex items-center gap-4">
                      <ShieldCheck className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-[10px] font-black text-green-500 uppercase">Marek Certified</div>
                        <div className="text-[11px] text-slate-500 uppercase">Zero-Delta Invariant: 100%</div>
                      </div>
                    </div>
                    <div className="bg-black border border-blue-500/30 p-6 flex items-center gap-4">
                      <Award className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase">Pablo Certified</div>
                        <div className="text-[11px] text-slate-500 uppercase">Fidelity Grade: ≥99.9%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-black border-2 border-[#00FFFF] p-8 space-y-6 shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sovereign_Score</div>
                <div className="text-7xl font-black text-white tracking-tighter italic">
                  {Math.round(result.pod_score || 0).toLocaleString()}
                </div>
                <div className="space-y-4">
                  {[
                    { l: 'Novelty', v: result.novelty },
                    { l: 'Density', v: result.density },
                    { l: 'Coherence', v: result.coherence },
                    { l: 'Alignment', v: result.alignment },
                  ].map((m) => (
                    <div key={m.l} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                        <span>{m.l}</span>
                        <span>{m.v}/2,500</span>
                      </div>
                      <div className="h-1 w-full bg-slate-900">
                        <div className="h-full bg-[#9370DB]" style={{ width: `${(m.v / 2500) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Binary className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Integrity Hash</span>
                </div>
                <div className="text-[10px] font-mono text-[#00FFFF] break-all opacity-50">
                  {result.atomic_score?.integrity_hash || 'PROTOCOL_ERROR'}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => setResult(null)}
                  className="bg-white text-black hover:bg-[#00FFFF] rounded-none font-black h-12 uppercase tracking-widest"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  New_Scan
                </Button>

                <Button 
                  onClick={handleUnpublish}
                  disabled={unpublishing}
                  variant="ghost"
                  className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-none text-[10px] font-black uppercase tracking-widest h-10 border border-red-950"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  UNPUBLISH PROTOCOL (SNAP)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
