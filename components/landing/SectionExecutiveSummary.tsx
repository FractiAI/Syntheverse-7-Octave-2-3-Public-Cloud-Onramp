import { SectionWrapper } from './shared/SectionWrapper';
import { AlertCircle, CheckCircle, TrendingUp, Microscope, Code, Palette } from 'lucide-react';

export function SectionExecutiveSummary() {
  return (
    <SectionWrapper
      id="executive-summary"
      title="EXECUTIVE SUMMARY"
      eyebrow="VALUE PROPOSITIONS"
      background="default"
    >
      {/* Frontier R&D */}
      <div id="frontier-rd" className="scroll-mt-20 mb-16">
        <div className="cloud-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Microscope className="w-10 h-10" style={{color: 'hsl(var(--hydrogen-beta))'}} />
            <h2 className="text-3xl font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
              Frontier R&D
            </h2>
          </div>

          {/* Problem */}
          <div className="mb-6 p-6 border-l-4 border-red-500/50 bg-red-500/5">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <h3 className="text-xl font-bold text-red-500">The Problem</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Gatekeeping:</strong> Research contributions are controlled by institutional hierarchies, academic journals, and grant committees who decide what gets recognized and funded.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Invisible Work:</strong> Groundbreaking research often goes unrecognized because it doesn't fit traditional publication models or lacks institutional backing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Verification Barriers:</strong> No universal, transparent system to verify and compare research contributions objectively without bias or politics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Limited Coherence Measurement:</strong> Traditional peer review focuses on novelty and impact but lacks precise quantification of coherence and density—key indicators of research quality.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="p-6 border-l-4 border-[var(--status-active)] bg-[var(--status-active)]/5">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{color: 'hsl(var(--status-active))'}} />
              <h3 className="text-xl font-bold" style={{color: 'hsl(var(--status-active))'}}>The Solution</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm mb-4">
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Liberated Contributions:</strong> Submit research directly to Syntheverse. No gatekeepers, no institutional approval required. Your work is evaluated by HHF-AI MRI science—objective, transparent, and based on coherence.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Visible & Demonstrable:</strong> Every contribution becomes verifiable on-chain. Your PoC is permanently recorded on Base Mainnet with transparent scoring (novelty, density, coherence, alignment).</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Coherence-First Measurement:</strong> HHF-AI MRI technology measures what matters—novelty, density, coherence, and alignment—not political influence or institutional prestige.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>SYNTH Allocation:</strong> Qualifying research contributions (pod_score ≥ 6000) earn SYNTH token allocation from the 90T MOTHERLODE VAULT based on coherence scores.</span>
              </li>
            </ul>
            <div className="p-4 bg-[var(--hydrogen-beta)]/10 rounded-lg">
              <p className="text-sm font-semibold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
                Result: Research is liberated from gatekeeping. Contributions are visible, verifiable, and rewarded based on coherence—not politics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frontier Enterprises */}
      <div id="frontier-enterprises" className="scroll-mt-20 mb-16">
        <div className="cloud-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-10 h-10" style={{color: 'hsl(var(--hydrogen-gamma))'}} />
            <h2 className="text-3xl font-bold" style={{color: 'hsl(var(--hydrogen-gamma))'}}>
              Frontier Enterprises
            </h2>
          </div>

          {/* Problem */}
          <div className="mb-6 p-6 border-l-4 border-red-500/50 bg-red-500/5">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <h3 className="text-xl font-bold text-red-500">The Problem</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Management Overhead:</strong> Traditional enterprises waste 30-50% of resources on hierarchical management, bureaucracy, and coordination inefficiencies.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Low Output per Node:</strong> Employees spend more time in meetings, emails, and approval workflows than creating actual value. Coherent output per person is minimized by organizational friction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Resource Misallocation:</strong> Resources deploy based on politics, seniority, and budgets—not where value is actually created. Massive waste is baked into the system.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Can't Scale Efficiently:</strong> Adding more people adds exponentially more coordination costs. Growth is expensive and often counterproductive.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="p-6 border-l-4 border-[var(--status-active)] bg-[var(--status-active)]/5">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{color: 'hsl(var(--status-active))'}} />
              <h3 className="text-xl font-bold" style={{color: 'hsl(var(--status-active))'}}>The Solution</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm mb-4">
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Contribution-Indexed Coordination:</strong> Replace management hierarchies with PoC-based allocation. Resources automatically deploy where value is created—no managers, no bureaucracy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>1.5–1.8× Higher Output:</strong> In simulated models, contribution-indexed systems achieve 50-80% more coherent output per node compared to traditional employment structures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>38–58% Lower Overhead:</strong> Eliminate management layers, approval workflows, and coordination friction. Operational cost per node drops dramatically in simulated models.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Enterprise Sandboxes:</strong> Deploy private Syntheverse instances for your organization. Run PoC evaluation internally with your own rules, then optionally anchor to mainnet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Scales Infinitely:</strong> Adding contributors adds value linearly—no exponential coordination costs. Scale from solo operator to global enterprise without structural collapse.</span>
              </li>
            </ul>
            <div className="p-4 bg-[var(--metal-gold)]/10 rounded-lg">
              <p className="text-sm font-semibold" style={{color: 'hsl(var(--metal-gold))'}}>
                Result: <strong>1.5–1.8× higher output</strong> with <strong>38–58% lower overhead</strong> than traditional systems in simulated models. Resource allocation follows contribution, not politics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frontier Creators */}
      <div id="frontier-creators" className="scroll-mt-20">
        <div className="cloud-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-10 h-10" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
            <h2 className="text-3xl font-bold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
              Frontier Creators
            </h2>
          </div>

          {/* Problem */}
          <div className="mb-6 p-6 border-l-4 border-red-500/50 bg-red-500/5">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <h3 className="text-xl font-bold text-red-500">The Problem</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Limited Creative Materials:</strong> Traditional media (video, audio, 2D graphics) are constrained by physical reality. You can't build complete reality worlds—only representations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>No Infinite Medium:</strong> Current creative tools are finite. You run out of canvas, pixels, polygons, or compute. True worldbuilding requires infinite substrate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Platform Dependency:</strong> Creators are locked into proprietary platforms (game engines, 3D tools, editing software) that own your work and limit portability.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span><strong>Verification Gap:</strong> Creative work lacks objective measurement. Quality is subjective, making it hard to prove value or compare contributions.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="p-6 border-l-4 border-[var(--status-active)] bg-[var(--status-active)]/5">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{color: 'hsl(var(--status-active))'}} />
              <h3 className="text-xl font-bold" style={{color: 'hsl(var(--status-active))'}}>The Solution</h3>
            </div>
            <ul className="space-y-2 cockpit-text text-sm mb-4">
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Infinite HHF-AI Materials:</strong> Access unlimited holographic hydrogen fractal substrates. Build complete reality worlds, not just representations. Your canvas is infinite.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Full Reality Worldbuilding:</strong> Go beyond game engines and 3D modeling. Create entire universes with consistent physics, emergent properties, and infinite detail using HHF-AI MRI technology.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>Verifiable Creative Contributions:</strong> Submit creative work as PoCs. Get coherence scores that prove novelty, density, and alignment—objective metrics for subjective art.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>On-Chain Provenance:</strong> Your creative work is anchored on Base Mainnet with permanent provenance. No platform can take it away or claim ownership.</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{color: 'hsl(var(--status-active))'}} className="font-bold mt-1">✓</span>
                <span><strong>SYNTH Allocation:</strong> High-coherence creative work qualifies for SYNTH allocation from the MOTHERLODE VAULT. Art becomes economically viable through coherence measurement.</span>
              </li>
            </ul>
            <div className="p-4 bg-[var(--hydrogen-alpha)]/10 rounded-lg">
              <p className="text-sm font-semibold" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
                Result: Creators access infinite HHF-AI materials and substrates for complete reality worldbuilding. Creative work is verifiable, permanent, and economically rewarded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

