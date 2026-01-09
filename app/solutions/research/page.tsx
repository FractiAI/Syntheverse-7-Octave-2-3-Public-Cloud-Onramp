/**
 * Research & Discovery Solutions - Public Page
 * Contributor Copper Wings Path
 * No authentication required
 */

import Link from 'next/link';
import { Telescope, CheckCircle, ArrowRight, Zap, Shield, Coins, FileText, AlertCircle } from 'lucide-react';

export default function ResearchSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 holographic-grid opacity-20"></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#C77C5D]/20 border border-[#C77C5D] rounded-full mb-6">
              <Telescope className="w-5 h-5" style={{color: '#C77C5D'}} />
              <span className="font-bold uppercase tracking-wider text-sm" style={{color: '#C77C5D'}}>
                🪙 Contributor Copper Wings
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#C77C5D] to-[#B5693D] text-transparent bg-clip-text">
                Research & Discovery
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              Break free from journal gatekeepers. Get AI-powered evaluation, blockchain proof, and fair recognition for your breakthrough research.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Problems Section */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#C77C5D'}}>
              The Problems We Solve
            </h2>
            <p className="text-lg opacity-80">
              Traditional research publication is broken. Here's why.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem 1 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Gatekeeping & Bias</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Traditional journals require institutional affiliation, charge $3,000-$11,000 in fees, 
                    and reject 90% of submissions based on institutional prestige rather than merit.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Independent researchers shut out, revolutionary ideas dismissed
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Months of Waiting</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Average time from submission to publication: 6-18 months. Peer review is opaque, 
                    inconsistent, and often politically motivated.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Research sits in limbo, discoveries delayed, careers stalled
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Zero Ownership</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Journals demand copyright transfer. Your work becomes their property. 
                    They charge readers $30-$50 per article while you get nothing.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Researchers lose rights, public loses access, publishers profit
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">No Proof of Originality</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Ideas get stolen during review. No timestamped proof of when you submitted. 
                    Competitors can scoop you with no recourse.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Innovation theft, credit disputes, legal nightmares
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#C77C5D'}}>
              The Syntheverse Solution
            </h2>
            <p className="text-lg opacity-80">
              AI-powered evaluation, blockchain proof, and fair rewards—in 10 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C77C5D]/20 flex items-center justify-center border-2 border-[#C77C5D]/50">
                  <Zap className="w-8 h-8" style={{color: '#C77C5D'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C77C5D'}}>
                10-Minute Evaluation
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                SynthScan™ MRI analyzes your contribution through the Holographic Hydrogen Fractal lens. 
                Get scores for Novelty, Depth, Coherence, and Applicability.
              </p>
              <div className="text-xs text-center opacity-60">
                No waiting months. No anonymous reviewers. Transparent, reproducible, auditable.
              </div>
            </div>

            {/* Value 2 */}
            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C77C5D]/20 flex items-center justify-center border-2 border-[#C77C5D]/50">
                  <Shield className="w-8 h-8" style={{color: '#C77C5D'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C77C5D'}}>
                Blockchain Proof
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Immutable, timestamped proof-of-contribution anchored on-chain. Your idea, your timestamp, 
                your proof. Forever.
              </p>
              <div className="text-xs text-center opacity-60">
                Legal defensibility. Credit protection. Verifiable originality.
              </div>
            </div>

            {/* Value 3 */}
            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C77C5D]/20 flex items-center justify-center border-2 border-[#C77C5D]/50">
                  <Coins className="w-8 h-8" style={{color: '#C77C5D'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C77C5D'}}>
                SYNTH Rewards
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Qualify with 4,000+ score? Earn SYNTH tokens proportional to your contribution's novelty, 
                depth, coherence, and applicability.
              </p>
              <div className="text-xs text-center opacity-60">
                Internal coordination units for ecosystem participation (not financial instruments).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#C77C5D'}}>
            How It Works
          </h2>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Submit Your Research', desc: 'Text, PDF, or link. Engineering designs, scientific breakthroughs, technical innovations—anything that pushes the frontier.' },
              { step: '02', title: 'SynthScan™ MRI Evaluation', desc: '10-minute AI evaluation through the HHF lens. Scored on Novelty (N), Depth (D), Coherence (C), Applicability (A).' },
              { step: '03', title: 'Get Your Results', desc: 'Transparent breakdown of scores. See exactly why and how your contribution was evaluated.' },
              { step: '04', title: 'Blockchain Anchor (Optional)', desc: 'Free blockchain registration. Immutable proof-of-contribution with SHA-256 hash and timestamp.' },
              { step: '05', title: 'Earn SYNTH Rewards', desc: 'Qualify at 4,000+? Earn SYNTH tokens from the 90T total supply based on your contribution score.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#C77C5D]/20 border-2 border-[#C77C5D] flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{color: '#C77C5D'}}>{item.step}</span>
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-bold mb-2" style={{color: '#C77C5D'}}>{item.title}</h3>
                  <p className="opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#C77C5D'}}>
            Who This Is For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C77C5D'}} />
              <h3 className="text-lg font-bold mb-3">Independent Researchers</h3>
              <p className="text-sm opacity-80">
                Hospital workers, truck drivers, self-taught scientists—anyone exploring holographic hydrogen 
                fractal principles without institutional backing.
              </p>
            </div>

            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C77C5D'}} />
              <h3 className="text-lg font-bold mb-3">Garage AI Builders</h3>
              <p className="text-sm opacity-80">
                If you've built your own higher cognitive engine through experimentation and divine insight, 
                it will recognize Syntheverse immediately.
              </p>
            </div>

            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C77C5D'}} />
              <h3 className="text-lg font-bold mb-3">Engineers & Innovators</h3>
              <p className="text-sm opacity-80">
                Technical designs, engineering breakthroughs, and applied innovations that align with 
                fractal, holographic hydrogen principles.
              </p>
            </div>

            <div className="border-2 border-[#C77C5D]/30 bg-[#C77C5D]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C77C5D'}} />
              <h3 className="text-lg font-bold mb-3">Academic Researchers</h3>
              <p className="text-sm opacity-80">
                Need fast, transparent evaluation? Want blockchain proof before submitting to traditional journals? 
                Use Syntheverse as a complement or alternative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-slate-900 to-[#C77C5D]/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Break Free from Gatekeepers?
          </h2>
          <p className="text-xl opacity-80 mb-8">
            Join the frontier. Submit your research. Get evaluated in 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fractiai"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C77C5D] hover:bg-[#B5693D] text-white font-bold rounded-lg transition-all text-lg"
            >
              <FileText className="w-5 h-5" />
              Submit Research
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#C77C5D] hover:bg-[#C77C5D]/20 font-bold rounded-lg transition-all text-lg"
            >
              Create Free Account
            </Link>
          </div>
          <p className="text-sm opacity-60 mt-6">
            No credit card required. SynthScan™ access: $50/month or $500 per expert-supported evaluation.
          </p>
        </div>
      </section>
    </div>
  );
}

