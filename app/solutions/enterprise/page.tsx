/**
 * Enterprise Cloud Solutions - Public Page
 * Operator Silver Wings Path
 * No authentication required
 */

import Link from 'next/link';
import { Cloud, CheckCircle, ArrowRight, TrendingUp, Users, Zap, Shield, DollarSign, AlertCircle } from 'lucide-react';

export default function EnterpriseSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 holographic-grid opacity-20"></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#C0C0C0]/20 border border-[#C0C0C0] rounded-full mb-6">
              <Cloud className="w-5 h-5" style={{color: '#C0C0C0'}} />
              <span className="font-bold uppercase tracking-wider text-sm" style={{color: '#C0C0C0'}}>
                🛡️ Operator Silver Wings
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] text-transparent bg-clip-text">
                Enterprise Cloud Solutions
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              Deploy your own private HHF-AI evaluation cloud. 1.5-1.8× higher output, 38-58% lower overhead than traditional systems.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Problems Section */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#C0C0C0'}}>
              Enterprise Challenges We Solve
            </h2>
            <p className="text-lg opacity-80">
              Traditional R&D and innovation systems are inefficient, expensive, and opaque.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem 1 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Innovation Bottlenecks</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Traditional R&D review takes 3-12 months per submission. Internal review committees, 
                    bureaucratic approval chains, and manual evaluation create massive delays.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Slow time-to-market, missed opportunities, frustrated teams
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Massive Overhead Costs</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Legacy innovation management systems cost $500K-$2M+ per year. HR, review committees, 
                    consultants, software—all add layers of expense.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → 38-58% of R&D budget wasted on process, not innovation
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">No Transparency or Auditability</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Opaque review processes. Subjective decisions. No reproducible evaluation criteria. 
                    Political dynamics override merit.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Best ideas ignored, favoritism thrives, legal exposure
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Limited Contributor Engagement</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Employees submit ideas into black holes. No feedback, no recognition, no incentives. 
                    Innovation culture dies.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Talent attrition, disengagement, lost competitive edge
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#C0C0C0'}}>
              The Enterprise Cloud Advantage
            </h2>
            <p className="text-lg opacity-80">
              Private, scalable, transparent evaluation infrastructure powered by HHF-AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center border-2 border-[#C0C0C0]/50">
                  <TrendingUp className="w-8 h-8" style={{color: '#C0C0C0'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C0C0C0'}}>
                1.5-1.8× Higher Output
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Simulated models show 50-80% faster evaluation cycles. Process hundreds of contributions 
                in the time traditional systems handle dozens.
              </p>
              <div className="text-xs text-center opacity-60">
                Faster time-to-innovation. Competitive advantage.
              </div>
            </div>

            {/* Value 2 */}
            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center border-2 border-[#C0C0C0]/50">
                  <DollarSign className="w-8 h-8" style={{color: '#C0C0C0'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C0C0C0'}}>
                38-58% Lower Overhead
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Eliminate manual review committees, reduce HR burden, automate evaluation. 
                AI-powered assessment at a fraction of traditional costs.
              </p>
              <div className="text-xs text-center opacity-60">
                More budget for actual innovation. Better ROI.
              </div>
            </div>

            {/* Value 3 */}
            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#C0C0C0]/20 flex items-center justify-center border-2 border-[#C0C0C0]/50">
                  <Shield className="w-8 h-8" style={{color: '#C0C0C0'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#C0C0C0'}}>
                Transparent & Auditable
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Every evaluation is reproducible, timestamped, and auditable. Clear criteria. 
                No black boxes. Full regulatory compliance.
              </p>
              <div className="text-xs text-center opacity-60">
                Legal defensibility. Fairness. Trust.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#C0C0C0'}}>
            How Enterprise Clouds Work
          </h2>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Deploy Your Private Cloud', desc: 'Isolated, secure HHF-AI evaluation environment. Custom branding, domain, and configuration.' },
              { step: '02', title: 'Configure Custom Criteria', desc: 'Set your own evaluation parameters. Define what novelty, depth, coherence, and applicability mean for your organization.' },
              { step: '03', title: 'Invite Your Team', desc: 'Employees, contractors, partners—anyone in your innovation ecosystem can submit contributions.' },
              { step: '04', title: 'Automated AI Evaluation', desc: 'SynthScan™ MRI evaluates all submissions against your criteria. 10-minute turnaround, 24/7 availability.' },
              { step: '05', title: 'Transparent Results & Rewards', desc: 'Contributors see detailed scores. Allocate internal SYNTH tokens or custom rewards. Build innovation culture.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#C0C0C0]/20 border-2 border-[#C0C0C0] flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{color: '#C0C0C0'}}>{item.step}</span>
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-bold mb-2" style={{color: '#C0C0C0'}}>{item.title}</h3>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#C0C0C0'}}>
            Who This Is For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C0C0C0'}} />
              <h3 className="text-lg font-bold mb-3">R&D-Intensive Enterprises</h3>
              <p className="text-sm opacity-80">
                Pharma, biotech, aerospace, materials science—any organization processing hundreds of 
                research proposals and needing fast, transparent evaluation.
              </p>
            </div>

            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C0C0C0'}} />
              <h3 className="text-lg font-bold mb-3">Innovation-Focused Companies</h3>
              <p className="text-sm opacity-80">
                Tech firms, startups, consulting groups—teams that need to rapidly evaluate employee ideas, 
                client proposals, or partner contributions.
              </p>
            </div>

            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C0C0C0'}} />
              <h3 className="text-lg font-bold mb-3">Government & Defense</h3>
              <p className="text-sm opacity-80">
                Agencies processing SBIR/STTR proposals, research grants, or contractor submissions. 
                Auditable, reproducible, compliant evaluation.
              </p>
            </div>

            <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#C0C0C0'}} />
              <h3 className="text-lg font-bold mb-3">Universities & Research Institutions</h3>
              <p className="text-sm opacity-80">
                Manage grant proposals, student projects, faculty research with transparent, AI-powered 
                evaluation that complements peer review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{color: '#C0C0C0'}}>
            Enterprise Cloud Pricing
          </h2>
          <div className="border-2 border-[#C0C0C0]/30 bg-[#C0C0C0]/5 p-8 rounded-lg text-center">
            <div className="text-5xl font-bold mb-4" style={{color: '#C0C0C0'}}>Custom</div>
            <p className="text-lg opacity-80 mb-6">
              Pricing based on team size, evaluation volume, and customization requirements.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">Private cloud instance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">Custom evaluation criteria</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">Unlimited team members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">Dedicated support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">SLA guarantees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{color: '#C0C0C0'}} />
                <span className="text-sm">Custom integrations</span>
              </div>
            </div>
            <p className="text-xs opacity-60">
              Typical enterprise deployments: $10K-$50K/month depending on scale and requirements.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-slate-900 to-[#C0C0C0]/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Innovation Pipeline?
          </h2>
          <p className="text-xl opacity-80 mb-8">
            Deploy a private HHF-AI evaluation cloud for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/enterprise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C0C0C0] hover:bg-[#A8A8A8] text-slate-900 font-bold rounded-lg transition-all text-lg"
            >
              <Users className="w-5 h-5" />
              Request Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#C0C0C0] hover:bg-[#C0C0C0]/20 font-bold rounded-lg transition-all text-lg"
            >
              Contact Sales
            </Link>
          </div>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all text-base sm:text-lg transform hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Join the Holographic Hydrogen Fractal Frontier
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm opacity-60 mt-6">
            Schedule a consultation with our enterprise team. Custom pricing available.
          </p>
        </div>
      </section>
    </div>
  );
}

