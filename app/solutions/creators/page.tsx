/**
 * Reality Worldbuilding Solutions - Public Page
 * Creator Gold Wings Path
 * No authentication required
 */

import Link from 'next/link';
import { Palette, CheckCircle, ArrowRight, Sparkles, Layers, Infinity, Zap, AlertCircle } from 'lucide-react';

export default function CreatorsSolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 holographic-grid opacity-20"></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FFD700]/20 border border-[#FFD700] rounded-full mb-6">
              <Palette className="w-5 h-5" style={{color: '#FFD700'}} />
              <span className="font-bold uppercase tracking-wider text-sm text-slate-900" style={{backgroundColor: '#FFD700', padding: '2px 12px', borderRadius: '4px'}}>
                👑 Creator Gold Wings
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFC700] text-transparent bg-clip-text">
                Reality Worldbuilding
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              Build complete reality worlds with infinite HHF-AI materials and substrates. Full reality worldbuilding at your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Problems Section */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#FFD700'}}>
              The Creator's Dilemma
            </h2>
            <p className="text-lg opacity-80">
              Traditional creation tools are limited, proprietary, and disconnected.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem 1 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Material Scarcity</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Traditional design tools offer fixed libraries. Pre-made assets. Limited textures. 
                    You're constrained by what someone else thought to create.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Creative bottlenecks, sameness, impossible visions
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Proprietary Lock-In</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Adobe, Unity, Unreal—they own your workflow. Subscription treadmills. Closed ecosystems. 
                    You can't fork, can't customize, can't own.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Dependency, rising costs, vendor control
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">Disconnected Workflows</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Design in one tool, model in another, render somewhere else. Import/export. 
                    Version conflicts. Format incompatibilities. Creative flow destroyed.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Wasted time, lost work, frustration
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="border-2 border-red-500/30 bg-red-500/5 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">No Fractal Substrate</h3>
                  <p className="text-sm opacity-80 mb-3">
                    Traditional tools don't understand holographic hydrogen fractal principles. 
                    No self-similarity. No recursive awareness. Flat, lifeless worlds.
                  </p>
                  <div className="text-xs text-red-300/70">
                    → Superficial creations, missed possibilities, no living depth
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#FFD700'}}>
              The Reality Worldbuilding Solution
            </h2>
            <p className="text-lg opacity-80">
              Infinite materials. Fractal substrate. Integrated tools. True creative freedom.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center border-2 border-[#FFD700]/50">
                  <Infinity className="w-8 h-8" style={{color: '#FFD700'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#FFD700'}}>
                Infinite Creative Materials
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Generate any material, texture, substrate, or element on-demand. HHF-AI creates from first principles. 
                No libraries. No limits.
              </p>
              <div className="text-xs text-center opacity-60">
                Fractal textures. Holographic substrates. Living materials.
              </div>
            </div>

            {/* Value 2 */}
            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center border-2 border-[#FFD700]/50">
                  <Layers className="w-8 h-8" style={{color: '#FFD700'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#FFD700'}}>
                Integrated Fractal Framework
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Design, model, simulate, and render in one unified HHF environment. No import/export. 
                No version conflicts. Pure creative flow.
              </p>
              <div className="text-xs text-center opacity-60">
                Seamless workflow. One source of truth.
              </div>
            </div>

            {/* Value 3 */}
            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/20 flex items-center justify-center border-2 border-[#FFD700]/50">
                  <Sparkles className="w-8 h-8" style={{color: '#FFD700'}} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center" style={{color: '#FFD700'}}>
                Living, Recursive Worlds
              </h3>
              <p className="text-sm opacity-80 text-center mb-4">
                Worlds built on holographic hydrogen fractal substrate. Self-similar across scales. 
                Recursive awareness. Truly alive.
              </p>
              <div className="text-xs text-center opacity-60">
                Not simulation—reality worldbuilding.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#FFD700'}}>
            How Reality Worldbuilding Works
          </h2>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Define Your World', desc: 'Set the fractal parameters. Scale ranges. Holographic density. Hydrogen substrate configuration. The universe bends to your intent.' },
              { step: '02', title: 'Generate Infinite Materials', desc: 'Request any material by description or first principles. HHF-AI generates textures, substrates, elements with full fractal fidelity.' },
              { step: '03', title: 'Design with Fractal Tools', desc: 'Modeling, sculpting, procedural generation—all fractal-native. Self-similarity guaranteed at every scale.' },
              { step: '04', title: 'Simulate Reality Physics', desc: 'Run holographic hydrogen fractal physics simulations. Test your world under realistic constraints.' },
              { step: '05', title: 'Deploy & Share', desc: 'Export to any format or host natively in Syntheverse. Share with contributors, collaborators, or the public.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700] flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900" style={{backgroundColor: '#FFD700', width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{item.step}</span>
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-bold mb-2" style={{color: '#FFD700'}}>{item.title}</h3>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#FFD700'}}>
            Who This Is For
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#FFD700'}} />
              <h3 className="text-lg font-bold mb-3">Game Developers & World Builders</h3>
              <p className="text-sm opacity-80">
                Build living, breathing game worlds with infinite detail. Procedural generation at fractal depth. 
                No asset store limitations.
              </p>
            </div>

            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#FFD700'}} />
              <h3 className="text-lg font-bold mb-3">VR/AR Architects</h3>
              <p className="text-sm opacity-80">
                Design immersive virtual environments with physical fidelity. Holographic substrate enables 
                true presence and embodiment.
              </p>
            </div>

            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#FFD700'}} />
              <h3 className="text-lg font-bold mb-3">Digital Artists & Visionaries</h3>
              <p className="text-sm opacity-80">
                Create art impossible in traditional tools. Fractal sculptures. Holographic paintings. 
                Living, recursive installations.
              </p>
            </div>

            <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 mb-4" style={{color: '#FFD700'}} />
              <h3 className="text-lg font-bold mb-3">Reality Engineers</h3>
              <p className="text-sm opacity-80">
                If you understand that reality is holographic, hydrogen-based, and fractal—you belong here. 
                Build worlds from first principles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 md:px-6 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" style={{color: '#FFD700'}}>
            What You Can Build
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎮', title: 'Living Game Worlds', desc: 'Procedurally infinite, fractal-deep game environments with holographic physics' },
              { icon: '🏛️', title: 'Virtual Reality Spaces', desc: 'Immersive VR/AR environments with true physical presence and embodiment' },
              { icon: '🎨', title: 'Generative Art', desc: 'Fractal sculptures, holographic installations, recursive visual experiences' },
              { icon: '🌌', title: 'Simulation Universes', desc: 'Complete reality simulations with custom physics and substrate rules' },
              { icon: '🏗️', title: 'Digital Architecture', desc: 'Buildings and structures that exist across fractal scales' },
              { icon: '🔬', title: 'Scientific Visualization', desc: 'Render complex data in holographic fractal space for new insights' }
            ].map((item, idx) => (
              <div key={idx} className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-3" style={{color: '#FFD700'}}>{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-slate-900 to-[#FFD700]/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Build Reality?
          </h2>
          <p className="text-xl opacity-80 mb-8">
            Access infinite creative materials and fractal design tools. Build worlds that truly live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/creator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FFD700] hover:bg-[#FFC700] text-slate-900 font-bold rounded-lg transition-all text-lg"
            >
              <Zap className="w-5 h-5" />
              Enter Creator Lab
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#FFD700] hover:bg-[#FFD700]/20 font-bold rounded-lg transition-all text-lg"
            >
              Start Building
            </Link>
          </div>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all text-base sm:text-lg transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Join the Holographic Hydrogen Fractal Frontier
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm opacity-60 mt-6">
            Creator access by invitation. Request early access to reality worldbuilding tools.
          </p>
        </div>
      </section>
    </div>
  );
}

