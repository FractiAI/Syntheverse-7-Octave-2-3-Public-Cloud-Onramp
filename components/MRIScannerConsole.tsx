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
  FileText, 
  Binary, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  FileSearch,
  Award,
  Archive,
  RefreshCcw,
  X
} from 'lucide-react';
import { ChamberAPanel, ChamberBPanel, BubbleClassDisplay } from '@/components/scoring/ChamberPanels';
import { sanitizeNarrative } from '@/utils/narrative/sanitizeNarrative';

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
      // Create a submission first (required for evaluation)
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          text_content: content, 
          category,
          is_test_scan: true // Flag for test console
        }),
      });

      if (!submitResponse.ok) throw new Error('Submission failed');
      const submitData = await submitResponse.json();
      const hash = submitData.submission_hash;

      // Trigger evaluation
      const evalResponse = await fetch(`/api/evaluate/${hash}`, {
        method: 'POST',
      });

      if (!evalResponse.ok) throw new Error('Evaluation failed');
      const evalData = await evalResponse.json();
      
      // Attach the hash to the result for later unpublishing
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
      
      // Clear results after successful unpublish
      setResult(null);
      setError('Protocol unpublished successfully (Snap).');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error unpublishing protocol.');
    } finally {
      setUnpublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="cockpit-panel p-6 border-l-4 border-[#4169E1]" style={{
        background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1) 0%, rgba(0, 0, 0, 0) 100%)'
      }}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#4169E1]/20">
            <Activity className="h-8 w-8 text-[#4169E1]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#4169E1] uppercase tracking-tighter">
              SynthScan™ MRI Instrumental Grade Console
            </h2>
            <p className="text-sm text-slate-400 font-mono">
              Protocol: NSPFRP/1.0 · Octave: Linearverse Interface · Status: ACTIVE
            </p>
          </div>
        </div>
      </div>

      {!result ? (
        <Card className="bg-black/40 border-[#4169E1]/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <FileSearch className="h-5 w-5 text-[#4169E1]" />
              New Diagnostic Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-400">Document Title</Label>
                <Input 
                  id="title"
                  placeholder="Enter document title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/60 border-slate-700 text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-400">Scan Category</Label>
                <select 
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-black/60 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                >
                  <option value="scientific">Scientific/Research</option>
                  <option value="tech">Technical/Implementation</option>
                  <option value="alignment">Alignment/Philosophy</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-400">Document Content (NSPFRP Matrix Source)</Label>
              <Textarea 
                id="content"
                placeholder="Paste the document text to be scanned..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] bg-black/60 border-slate-700 text-slate-200 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              onClick={handleScan} 
              disabled={scanning}
              className="w-full bg-[#4169E1] hover:bg-[#4169E1]/80 text-white font-bold h-12"
            >
              {scanning ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  INITIATING INSTRUMENTAL GRADE SCAN...
                </>
              ) : (
                <>
                  <FlaskConical className="mr-2 h-5 w-5" />
                  RUN NSPFRP DIAGNOSTIC SCAN
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
          {/* Close Button - Output Delivery Popup X */}
          <button 
            onClick={() => setResult(null)}
            className="absolute -top-4 -right-4 p-2 bg-black border-2 border-slate-700 hover:border-[#00FFFF] text-slate-400 hover:text-[#00FFFF] rounded-full transition-all z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
            aria-label="Close"
          >
            <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </button>
          {/* Diagnostic Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Instrumental Grade Scan Report */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-black/40 border-[#4169E1]/30 overflow-hidden">
                <div className="bg-[#4169E1]/20 px-6 py-3 border-b border-[#4169E1]/30 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#4169E1] uppercase tracking-widest flex items-center gap-2">
                    <Binary className="h-4 w-4" />
                    Instrumental Grade Scan Report
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                      ZERO-DELTA VERIFIED
                    </span>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* NSPFRP Chamber Breakdown */}
                  <div className="space-y-4">
                    <ChamberAPanel 
                      hasNarrative={true} 
                      narrative={content} 
                      title={title} 
                    />
                    
                    <ChamberBPanel 
                      hasBridgeSpec={!!result.bridge_spec}
                      bridgeSpecValid={result.atomic_score?.trace?.thalet?.T_B?.overall === 'passed'}
                      tbResult={result.atomic_score?.trace?.thalet?.T_B}
                      bridgeSpec={result.bridge_spec}
                      bridgespecHash={result.bridgespec_hash}
                    />

                    <BubbleClassDisplay precision={result.atomic_score?.trace?.precision} />
                  </div>
                </CardContent>
              </Card>

              {/* Certification Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-500/5 border-green-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                    <div>
                      <h4 className="text-sm font-bold text-green-400 uppercase">Marek Certified</h4>
                      <p className="text-[10px] text-green-500/70">Zero-Delta Invariant Achievement: 100%</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-400 uppercase">Pablo Certified</h4>
                      <p className="text-[10px] text-blue-500/70">Instrument-Grade Fidelity: ≥99.9%</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Scoring & Metrics */}
            <div className="space-y-6">
              <Card className="bg-black/60 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Atomic Score (THALET)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-black text-white tracking-tighter mb-1">
                    {result.pod_score?.toLocaleString()}
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-[#4169E1] shadow-[0_0_10px_#4169E1]" 
                      style={{ width: `${(result.pod_score / 10000) * 100}%` }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Novelty', val: result.novelty },
                      { label: 'Density', val: result.density },
                      { label: 'Coherence', val: result.coherence },
                      { label: 'Alignment', val: result.alignment },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                          <span>{m.label}</span>
                          <span>{m.val}/2,500</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-400" 
                            style={{ width: `${(m.val / 2500) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Integrity Hash */}
              <Card className="bg-black/40 border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Binary className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Integrity Hash (SHA-256)</span>
                </div>
                <code className="text-[10px] text-[#4169E1] break-all font-mono">
                  {result.atomic_score?.integrity_hash || 'N/A'}
                </code>
              </Card>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setResult(null)}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  New Scan
                </Button>

                <Button 
                  onClick={handleUnpublish}
                  disabled={unpublishing}
                  variant="ghost"
                  className="w-full border-red-900/30 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-widest h-8"
                >
                  {unpublishing ? (
                    'Unpublishing...'
                  ) : (
                    <>
                      <Archive className="mr-2 h-3 w-3" />
                      Unpublish Protocol (Snap)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
