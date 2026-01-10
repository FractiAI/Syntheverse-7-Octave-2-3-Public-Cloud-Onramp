/**
 * Creator Gold Wings Training Modules
 * World-class training for creators building complete reality worlds
 * Advanced creative and technical content with holographic hydrogen fractal principles
 */

import { Palette, Layers, Atom, Sparkles, Grid3x3, FileCode, Zap, Award, Construction, Microscope } from 'lucide-react';

export const creatorGoldModules = [
  {
    id: 'creator-welcome',
    number: 1,
    title: 'Welcome to Reality Worldbuilding',
    subtitle: 'From Operator to Creator',
    icon: <Palette className="h-6 w-6" />,
    duration: '25 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--metal-gold)] bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            🎨 You're About to Build Complete Reality Worlds
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Contributors submit work. Operators run infrastructure. Creators <strong>build entire realities</strong> 
            using infinite HHF-AI materials and substrates. This is the frontier of digital creation—where 
            imagination meets holographic hydrogen fractal principles to manifest complete worlds.
          </p>
        </div>

        {/* Prerequisites Check */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{color: 'var(--hydrogen-alpha)'}} />
            Prerequisites: What You Should Master First
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Completed Silver Wings</strong> - You understand Cloud architecture and operations
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Managed 3+ Cloud Instances</strong> - You've experienced system administration
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Deep HHF Understanding</strong> - Familiar with holographic hydrogen fractal principles
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Creative Vision</strong> - Ready to design systems, worlds, or complete realities
              </div>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-4 bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            ⚠️ <strong>Not ready yet?</strong> Complete Operator Silver Wings first. Creator track assumes 
            technical mastery—we'll focus on creative applications and worldbuilding principles.
          </p>
        </div>

        {/* What Creators Do */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Creators Do</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <Layers className="w-6 h-6 text-purple-400" />
                <div className="font-bold text-purple-400">Reality Worldbuilding</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Design complete reality worlds from scratch</li>
                <li>• Define physics, rules, and constraints</li>
                <li>• Create substrates and materials</li>
                <li>• Architect coherent multi-layer systems</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <Atom className="w-6 h-6 text-blue-400" />
                <div className="font-bold text-blue-400">HHF-AI Integration</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Apply holographic hydrogen principles</li>
                <li>• Design fractal coherence patterns</li>
                <li>• Implement awareness-based systems</li>
                <li>• Bridge quantum and classical realms</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <FileCode className="w-6 h-6 text-green-400" />
                <div className="font-bold text-green-400">Creative Implementation</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Code simulations and visualizations</li>
                <li>• Build interactive experiences</li>
                <li>• Generate art, music, and media</li>
                <li>• Create tools and frameworks</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <Grid3x3 className="w-6 h-6" style={{color: 'var(--hydrogen-amber)'}} />
                <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Ecosystem Contribution</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Publish high-impact PoCs (7,000+)</li>
                <li>• Discover novel constants & equations</li>
                <li>• Mentor contributors and operators</li>
                <li>• Pioneer new applications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Three Tiers */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Three Tiers of Mastery</h4>
          
          <div className="space-y-4">
            <div className="border-2 border-[var(--metal-copper)] bg-[var(--metal-copper)]/5 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--metal-copper)]/30 flex items-center justify-center">
                  <span className="text-2xl">🪙</span>
                </div>
                <div>
                  <div className="font-bold" style={{color: 'var(--metal-copper)'}}>Copper Wings: Contributors</div>
                  <div className="text-xs opacity-70">Submit quality work, earn proof, build reputation</div>
                </div>
              </div>
            </div>

            <div className="border-2 border-[var(--metal-silver)] bg-[var(--metal-silver)]/5 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--metal-silver)]/30 flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div>
                  <div className="font-bold" style={{color: 'var(--metal-silver)'}}>Silver Wings: Operators</div>
                  <div className="text-xs opacity-70">Manage infrastructure, support community, run Clouds</div>
                </div>
              </div>
            </div>

            <div className="border-4 border-[var(--metal-gold)] bg-[var(--metal-gold)]/10 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[var(--metal-gold)]/30 flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <div className="font-bold text-xl" style={{color: 'var(--metal-gold)'}}>Gold Wings: Creators</div>
                  <div className="text-sm opacity-90">Build complete reality worlds, pioneer applications, shape the frontier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Infinite Materials & Substrates */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            ♾️ Infinite HHF-AI Materials & Substrates
          </h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Traditional creators are limited by physical constraints—canvas size, computer memory, budget. 
            <strong>Syntheverse Creators have infinite materials</strong> derived from holographic hydrogen 
            fractal principles. You can:
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2 text-purple-400">Infinite Substrates</div>
              <ul className="space-y-1 opacity-80 ml-4">
                <li>• Fractal canvases at any scale</li>
                <li>• Multi-dimensional spaces</li>
                <li>• Coherence-preserving mediums</li>
                <li>• Awareness-responsive materials</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-blue-400">Infinite Tools</div>
              <ul className="space-y-1 opacity-80 ml-4">
                <li>• SynthScan™ MRI for analysis</li>
                <li>• Vector embedding systems</li>
                <li>• Quantum-classical bridges</li>
                <li>• Pattern synthesis engines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Creator Privileges */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            Creator Privileges & Responsibilities
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-green-400 mb-2">✅ What You Get</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>Full System Access:</strong> All features, no paywalls</li>
                <li>• <strong>Creator Dashboard:</strong> Advanced tools and analytics</li>
                <li>• <strong>Unlimited Cloud Resources:</strong> Create as many instances as needed</li>
                <li>• <strong>Priority Evaluation:</strong> Your PoCs processed first</li>
                <li>• <strong>Direct Development Access:</strong> Influence platform roadmap</li>
                <li>• <strong>Creator Badge:</strong> Gold wings displayed on all contributions</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>⚠️ What's Expected</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>High-Impact Work:</strong> Consistently submit 7,000+ scoring PoCs</li>
                <li>• <strong>Innovation:</strong> Pioneer new applications and frameworks</li>
                <li>• <strong>Mentorship:</strong> Guide Contributors and Operators</li>
                <li>• <strong>Ecosystem Leadership:</strong> Shape the future of Syntheverse</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div>
          <h4 className="text-xl font-bold mb-4">Your Gold Wings Learning Path</h4>
          
          <div className="space-y-2 text-sm">
            {[
              { num: 1, title: 'Welcome to Reality Worldbuilding', duration: '25 min', color: 'purple' },
              { num: 2, title: 'Holographic Hydrogen Fractal Principles', duration: '45 min', color: 'blue' },
              { num: 3, title: 'Designing Reality Worlds', duration: '50 min', color: 'green' },
              { num: 4, title: 'Fractal Coherence Architecture', duration: '40 min', color: 'amber' },
              { num: 5, title: 'Infinite Materials & Substrates', duration: '35 min', color: 'red' },
              { num: 6, title: 'Creative Implementation Techniques', duration: '45 min', color: 'indigo' },
              { num: 7, title: 'Publishing High-Impact PoCs', duration: '30 min', color: 'pink' },
              { num: 8, title: 'Earning Your Gold Wings', duration: '25 min', color: 'gold' },
              { num: 9, title: 'The Fractal General Contractor', duration: '50 min', color: 'purple' },
              { num: 10, title: 'From Abacus to Quantum Evaluation', duration: '45 min', color: 'blue' },
              { num: 11, title: 'Advanced System Architecture', duration: '40 min', color: 'blue' },
              { num: 12, title: 'Multi-Sandbox Orchestration', duration: '35 min', color: 'purple' },
              { num: 13, title: 'Custom Scoring Lenses', duration: '45 min', color: 'purple' },
              { num: 14, title: 'Tokenomics & Economic Design', duration: '40 min', color: 'amber' },
              { num: 15, title: 'Blockchain Integration', duration: '35 min', color: 'purple' },
              { num: 16, title: 'Ecosystem Strategy & Scaling', duration: '45 min', color: 'purple' },
              { num: 17, title: 'Frontier Leadership & Vision', duration: '50 min', color: 'gold' },
            ].map((module) => (
              <div key={module.num} className="cloud-card p-3 flex items-center gap-3 border-l-4 border-[var(--metal-gold)]">
                <div className="w-8 h-8 rounded-full bg-[var(--metal-gold)]/30 flex items-center justify-center font-bold flex-shrink-0">
                  {module.num}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{module.title}</div>
                </div>
                <div className="text-xs opacity-70">{module.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Check */}
        <div className="bg-gradient-to-r from-[var(--metal-gold)]/10 to-transparent border-l-4 border-[var(--metal-gold)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--metal-gold)'}}>🎯 Ready for Gold?</h4>
          <p className="text-sm opacity-90">
            This is the <strong>most advanced track</strong>. You'll learn reality worldbuilding, holographic 
            hydrogen fractal applications, and how to create breakthrough contributions that push the frontier. 
            By the end, you'll be equipped to <strong>build complete reality worlds</strong> and lead the ecosystem.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Creators build complete reality worlds using infinite HHF-AI materials',
      'Requires Silver Wings completion and operational experience',
      'Full system access with no paywalls',
      '8 modules covering principles, design, implementation, and leadership',
    ],
  },

  {
    id: 'hhf-principles',
    number: 2,
    title: 'Holographic Hydrogen Fractal Principles',
    subtitle: 'The Foundation of Reality Worldbuilding',
    icon: <Atom className="h-6 w-6" />,
    duration: '45 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            🔬 The Science Behind the Magic
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Holographic Hydrogen Fractal (HHF) principles aren't just theory—they're the foundation 
            for building coherent, scalable, awareness-based systems. Master these and you can 
            design realities that work like the universe itself.
          </p>
        </div>

        {/* The Three Pillars */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Three Pillars of HHF</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🌐</span>
                <div>
                  <div className="font-bold text-xl text-blue-400">1. Holographic Principle</div>
                  <div className="text-xs opacity-70">Information encoded on boundaries</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3 leading-relaxed">
                <strong>Core Concept:</strong> All information in a volume can be encoded on its boundary—like 
                a hologram stores 3D data in 2D. In Syntheverse, contribution "depth" emerges from surface patterns.
              </p>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Application:</strong> When designing systems, focus on boundary conditions and interfaces. 
                The internal complexity will emerge naturally from coherent boundary rules.
              </div>
            </div>

            <div className="cloud-card p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">⚛️</span>
                <div>
                  <div className="font-bold text-xl text-purple-400">2. Hydrogen Spin Resonance</div>
                  <div className="text-xs opacity-70">Awareness mediated by quantum spin</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3 leading-relaxed">
                <strong>Core Concept:</strong> Hydrogen is the simplest atom (1 proton, 1 electron) and the most 
                abundant in the universe. Its spin states create resonance patterns that can encode awareness itself.
              </p>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Application:</strong> Use binary spin-up/spin-down as fundamental bits of awareness. 
                Build coherence detection systems that measure "resonance" between ideas like MRI measures spin alignment.
              </div>
            </div>

            <div className="cloud-card p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🌀</span>
                <div>
                  <div className="font-bold text-xl text-green-400">3. Fractal Self-Similarity</div>
                  <div className="text-xs opacity-70">Patterns repeat at every scale</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3 leading-relaxed">
                <strong>Core Concept:</strong> The same patterns appear at atom-level, organism-level, and galaxy-level. 
                Fractals allow infinite complexity from simple rules—coastlines, ferns, market prices.
              </p>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Application:</strong> Design recursive systems where small-scale rules generate large-scale 
                coherence. A single PoC evaluation rule scales to evaluating entire scientific fields.
              </div>
            </div>
          </div>
        </div>

        {/* SynthScan™ MRI as HHF Application */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            🔬 SynthScan™ MRI: HHF Principles in Action
          </h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            SynthScan™ MRI isn't metaphor—it's a literal implementation of HHF principles:
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-blue-400">🌐</span>
              <div>
                <strong className="text-blue-400">Holographic Encoding:</strong> Contribution text (volume) is 
                encoded into vector embeddings (boundary). The embedding surface captures the full conceptual depth.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400">⚛️</span>
              <div>
                <strong className="text-purple-400">Hydrogen Spin Analogy:</strong> Token probabilities from the LLM 
                act like spin states—coherent ideas have aligned "spins", incoherent ones show random fluctuation.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">🌀</span>
              <div>
                <strong className="text-green-400">Fractal Scoring:</strong> The same 4 dimensions (Novelty, Density, 
                Coherence, Alignment) apply whether evaluating a tweet or a PhD thesis. Scale-invariant rules.
              </div>
            </div>
          </div>
        </div>

        {/* Novel Constants & Equations */}
        <div>
          <h4 className="text-xl font-bold mb-4">Novel HHF Constants & Equations</h4>
          
          <p className="mb-4 opacity-90">
            High-scoring PoCs sometimes discover new mathematical relationships within the HHF framework. 
            These become <strong>calibration constants</strong> for SynthScan™ MRI:
          </p>

          <div className="cloud-card p-5 mb-4">
            <div className="font-mono text-xs space-y-3">
              <div>
                <div className="text-[var(--hydrogen-alpha)] mb-1">Φ_COHERENCE = (ℏc³)/(Gk_B T_Planck)</div>
                <div className="opacity-70">Relates quantum coherence to classical thermodynamics at Planck scale</div>
              </div>
              <div>
                <div className="text-[var(--hydrogen-beta)] mb-1">D_FRACTAL = log(N)/log(1/r)</div>
                <div className="opacity-70">Fractal dimension for self-similar contribution patterns</div>
              </div>
              <div>
                <div className="text-[var(--hydrogen-gamma)] mb-1">R_HYDROGEN = (μ_H · B)/(h · f)</div>
                <div className="opacity-70">Hydrogen spin resonance frequency in evaluation field</div>
              </div>
            </div>
          </div>

          <p className="text-sm opacity-80 bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            💡 <strong>For Creators:</strong> When you discover novel relationships, submit them as PoCs. 
            If they score 7,000+, they may be integrated into the SynthScan™ MRI calibration library, 
            making you a <em>literal contributor to the physics of the system</em>.
          </p>
        </div>

        {/* Designing with HHF */}
        <div>
          <h4 className="text-xl font-bold mb-4">Designing Reality Worlds with HHF</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5">
              <div className="font-semibold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
                Holographic Design Pattern
              </div>
              <ol className="text-sm space-y-2 opacity-90">
                <li>1. Define boundary conditions (rules, constraints)</li>
                <li>2. Let internal complexity emerge from boundaries</li>
                <li>3. Measure information at interfaces, not centers</li>
                <li>4. Trust emergence over explicit control</li>
              </ol>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold mb-3 text-purple-400">
                Fractal Design Pattern
              </div>
              <ol className="text-sm space-y-2 opacity-90">
                <li>1. Create simple recursive rules</li>
                <li>2. Apply rules at multiple scales simultaneously</li>
                <li>3. Look for self-similar patterns across levels</li>
                <li>4. Optimize rules for coherence at all scales</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💡</span>
            <h4 className="text-lg font-bold" style={{color: 'var(--metal-gold)'}}>
              Key Creator Insight
            </h4>
          </div>
          <p className="leading-relaxed text-sm opacity-90">
            <strong>HHF isn't decoration—it's structural.</strong> Just like buildings follow physics (gravity, 
            tension, compression), Syntheverse systems follow HHF principles (holography, hydrogen spin, fractals). 
            Work with these principles and your creations will be coherent and scalable. Fight them and they'll collapse.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand HHF Principles!</h4>
          <p className="text-sm opacity-90">
            You know the <strong>three pillars</strong> (Holographic, Hydrogen, Fractal), how they're 
            <strong>applied in SynthScan™</strong>, and how to <strong>design with them</strong>. 
            Next, we'll show you how to architect complete reality worlds using these principles.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Three pillars: Holographic encoding, Hydrogen spin resonance, Fractal self-similarity',
      'SynthScan™ MRI implements HHF principles for coherence measurement',
      'Novel HHF constants/equations can be discovered via high-scoring PoCs',
      'Design with HHF principles for coherent, scalable systems',
    ],
  },

  // Modules 3-8 would continue with similar depth...
  // For brevity, creating placeholder structures:

  {
    id: 'designing-reality-worlds',
    number: 3,
    title: 'Designing Reality Worlds',
    subtitle: 'Architecture for Complete Realities',
    icon: <Layers className="h-6 w-6" />,
    duration: '50 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--metal-gold)] bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            🌍 Building Complete Reality Worlds
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Reality worldbuilding isn't game design or novel writing—it's creating complete, coherent systems 
            with their own physics, rules, and emergence properties. Like our universe has fundamental constants 
            (speed of light, Planck's constant), your worlds need foundational principles that everything else derives from.
          </p>
        </div>

        {/* The Reality Stack */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Reality World Design Stack</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Reality worlds are built in layers, from fundamental physics up to emergent phenomena. Think of it like this:
          </p>

          <div className="space-y-3">
            <div className="cloud-card p-5 border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚛️</span>
                <div>
                  <div className="font-bold text-xl text-red-400">Layer 1: Fundamental Constants</div>
                  <div className="text-xs opacity-70">The "physics" of your world</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What to define:</strong> The immutable mathematical relationships that govern everything</p>
                <p><strong>Examples:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Coherence decay rate: How fast patterns lose integrity over time</li>
                  <li>• Information density limit: Max concepts per unit space</li>
                  <li>• Fractal dimension: Self-similarity scaling factor</li>
                  <li>• Resonance frequency: How awareness patterns synchronize</li>
                </ul>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📐</span>
                <div>
                  <div className="font-bold text-xl" style={{color: 'var(--hydrogen-amber)'}}>Layer 2: Geometric Rules</div>
                  <div className="text-xs opacity-70">How space and structure work</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What to define:</strong> The spatial and structural constraints</p>
                <p><strong>Examples:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Dimensionality: 2D, 3D, or N-dimensional space</li>
                  <li>• Topology: Flat, curved, or fractal geometry</li>
                  <li>• Boundary conditions: How edges behave (wrap, reflect, absorb)</li>
                  <li>• Adjacency rules: What can connect to what</li>
                </ul>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔗</span>
                <div>
                  <div className="font-bold text-xl text-yellow-400">Layer 3: Interaction Dynamics</div>
                  <div className="text-xs opacity-70">How things affect each other</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What to define:</strong> The cause-and-effect relationships</p>
                <p><strong>Examples:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Attraction/repulsion: What draws together, what pushes apart</li>
                  <li>• Energy transfer: How influence flows between entities</li>
                  <li>• Conservation laws: What must be preserved (momentum, information, etc.)</li>
                  <li>• Feedback loops: How systems self-regulate</li>
                </ul>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌱</span>
                <div>
                  <div className="font-bold text-xl text-green-400">Layer 4: Emergence Patterns</div>
                  <div className="text-xs opacity-70">Complex behaviors from simple rules</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What happens naturally:</strong> You don't design this—it emerges from layers 1-3</p>
                <p><strong>Examples:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Life-like patterns: Self-replicating structures</li>
                  <li>• Economies: Resource distribution systems</li>
                  <li>• Cultures: Shared behavioral patterns</li>
                  <li>• Consciousness: Coherent awareness arising from complexity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Design Process */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🎨 The Reality World Design Process</h4>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <div className="font-semibold text-blue-400 mb-2">Define Your Vision & Purpose</div>
                <div className="text-sm opacity-90">
                  <strong>Ask:</strong> What is this world for? What questions does it explore? What experiences should it enable?
                  <br />
                  <strong>Example:</strong> "A world where ideas have mass and attract each other gravitationally, 
                  exploring how knowledge clusters form naturally."
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <div className="font-semibold text-purple-400 mb-2">Design Fundamental Constants (Layer 1)</div>
                <div className="text-sm opacity-90">
                  Write down 3-7 mathematical relationships that capture your vision. Use HHF principles as starting point.
                  <br />
                  <strong>Example:</strong> F_attraction = G × (idea_mass_1 × idea_mass_2) / distance²
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <div className="font-semibold text-green-400 mb-2">Define Geometric Rules (Layer 2)</div>
                <div className="text-sm opacity-90">
                  Choose dimensionality, topology, and boundaries. Keep it simple—complexity emerges naturally.
                  <br />
                  <strong>Example:</strong> 3D Euclidean space with toroidal boundaries (wrap around edges).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{backgroundColor: 'var(--hydrogen-amber)'}}>4</div>
              <div>
                <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Specify Interaction Dynamics (Layer 3)</div>
                <div className="text-sm opacity-90">
                  Define how entities interact. Focus on local rules—global behavior emerges.
                  <br />
                  <strong>Example:</strong> Ideas merge when distance under threshold and similarity over 70%.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
              <div>
                <div className="font-semibold text-red-400 mb-2">Simulate & Observe Emergence (Layer 4)</div>
                <div className="text-sm opacity-90">
                  Run the simulation. Watch what emerges. You don't design this layer—you discover it.
                  <br />
                  <strong>Example:</strong> Idea clusters form "knowledge galaxies" with dense cores and sparse peripheries.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0">6</div>
              <div>
                <div className="font-semibold text-indigo-400 mb-2">Iterate & Refine</div>
                <div className="text-sm opacity-90">
                  Adjust constants and rules based on observations. Tune until emergence matches your vision.
                  <br />
                  <strong>Example:</strong> Increase gravitational constant to make clusters form faster.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example: Ideaspace Reality World */}
        <div>
          <h4 className="text-xl font-bold mb-4">📖 Complete Example: "Ideaspace" Reality World</h4>
          
          <div className="cloud-card p-6 mb-4">
            <div className="font-semibold mb-3" style={{color: 'var(--metal-gold)'}}>
              Vision: A universe where abstract ideas are physical objects
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="bg-black/30 p-4 rounded">
                <div className="font-semibold text-red-400 mb-2">Layer 1: Fundamental Constants</div>
                <ul className="space-y-1 opacity-90 ml-4">
                  <li>• <code className="bg-black/50 px-1 rounded">G_idea = 6.674 × 10⁻³</code> - Idea gravitational constant</li>
                  <li>• <code className="bg-black/50 px-1 rounded">C_coherence = 3.0 × 10⁸</code> - Max coherence propagation speed</li>
                  <li>• <code className="bg-black/50 px-1 rounded">Λ_decay = 0.001</code> - Coherence decay rate per time unit</li>
                  <li>• <code className="bg-black/50 px-1 rounded">D_fractal = 1.618</code> - Fractal dimension (golden ratio)</li>
                </ul>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <div className="font-semibold text-amber-400 mb-2">Layer 2: Geometric Rules</div>
                <ul className="space-y-1 opacity-90 ml-4">
                  <li>• 3D Euclidean space, 1000³ unit cube</li>
                  <li>• Toroidal boundaries (wrap around all edges)</li>
                  <li>• Each idea occupies 1-10 units radius depending on complexity</li>
                  <li>• Distance measured as Euclidean (straight-line)</li>
                </ul>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <div className="font-semibold text-yellow-400 mb-2">Layer 3: Interaction Dynamics</div>
                <ul className="space-y-1 opacity-90 ml-4">
                  <li>• <strong>Gravitational attraction:</strong> F = G_idea × (m₁ × m₂) / r²</li>
                  <li>• <strong>Idea mass:</strong> Proportional to PoC score (novelty × density)</li>
                  <li>• <strong>Merging rule:</strong> If distance under 5 units and similarity over 0.7, merge</li>
                  <li>• <strong>Coherence decay:</strong> Isolated ideas lose mass at rate Λ_decay per timestep</li>
                  <li>• <strong>Resonance boost:</strong> Clustered ideas gain coherence (reduce decay)</li>
                </ul>
              </div>

              <div className="bg-black/30 p-4 rounded">
                <div className="font-semibold text-green-400 mb-2">Layer 4: Observed Emergence</div>
                <ul className="space-y-1 opacity-90 ml-4">
                  <li>• <strong>Knowledge Galaxies:</strong> Dense clusters of related ideas orbit common center</li>
                  <li>• <strong>Dark Matter:</strong> Low-scoring ideas fill voids, invisible but gravitationally present</li>
                  <li>• <strong>Superclusters:</strong> Multiple domains connected by high-coherence "bridges"</li>
                  <li>• <strong>Idea Death:</strong> Isolated, low-mass ideas decay and disappear</li>
                  <li>• <strong>Big Bang:</strong> New seed ideas create expansion waves, pushing others outward</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-sm opacity-90 bg-green-500/10 border border-green-500/30 p-3 rounded">
            💡 <strong>Creator Tip:</strong> Notice how Layers 1-3 are simple mathematical rules, but Layer 4 
            shows complex cosmic-scale behaviors emerging naturally. That's the power of good reality world design.
          </div>
        </div>

        {/* Design Patterns */}
        <div>
          <h4 className="text-xl font-bold mb-4">🏗️ Common Reality World Design Patterns</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">🌀 Fractal Universes</div>
              <div className="text-sm opacity-90">
                <strong>Pattern:</strong> Same rules apply at atom-scale and galaxy-scale
                <br />
                <strong>Example:</strong> Electrons orbit nucleus like planets orbit star
                <br />
                <strong>HHF Principle:</strong> Fractal self-similarity
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">🌊 Wave-Based Realities</div>
              <div className="text-sm opacity-90">
                <strong>Pattern:</strong> Everything is oscillation/vibration
                <br />
                <strong>Example:</strong> Entities are standing waves, interactions are interference patterns
                <br />
                <strong>HHF Principle:</strong> Hydrogen spin resonance
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-3">📡 Network Worlds</div>
              <div className="text-sm opacity-90">
                <strong>Pattern:</strong> Nodes connected by edges, information flows between
                <br />
                <strong>Example:</strong> Social graphs, neural networks, internet topology
                <br />
                <strong>HHF Principle:</strong> Holographic boundary encoding
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="font-semibold mb-3" style={{color: 'var(--hydrogen-amber)'}}>🧬 Evolutionary Systems</div>
              <div className="text-sm opacity-90">
                <strong>Pattern:</strong> Variation, selection, reproduction
                <br />
                <strong>Example:</strong> Genetic algorithms, meme evolution, economic markets
                <br />
                <strong>HHF Principle:</strong> Coherence-based selection pressure
              </div>
            </div>
          </div>
        </div>

        {/* Testing Coherence */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            🧪 Testing Coherence Across Scales
          </h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Before finalizing your world, test if it maintains coherence at multiple scales:
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold text-blue-400 mb-1">Micro-Scale Test</div>
              <div className="opacity-90">
                Simulate 2-3 entities in isolation. Do interactions make sense? Are rules clear and consistent?
              </div>
            </div>

            <div>
              <div className="font-semibold text-purple-400 mb-1">Meso-Scale Test</div>
              <div className="opacity-90">
                Simulate 100-1000 entities. Do interesting patterns emerge? Do clusters, waves, or structures form?
              </div>
            </div>

            <div>
              <div className="font-semibold text-green-400 mb-1">Macro-Scale Test</div>
              <div className="opacity-90">
                Simulate 10,000+ entities. Does system-level behavior match your vision? Are there "phase transitions" 
                (qualitative changes at certain thresholds)?
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{color: 'var(--hydrogen-amber)'}}>Temporal Test</div>
              <div className="opacity-90">
                Run for 1000+ timesteps. Does system reach equilibrium, cycle, or keep evolving? Is it stable or chaotic?
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div>
          <h4 className="text-xl font-bold mb-4">❌ Common Reality World Design Mistakes</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-2">Too Many Rules</div>
              <div className="text-sm opacity-90">
                <strong>Problem:</strong> 50+ rules make system unpredictable and impossible to understand
                <br />
                <strong>Fix:</strong> Start with 3-7 simple rules. Let complexity emerge.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-2">Designing Emergence</div>
              <div className="text-sm opacity-90">
                <strong>Problem:</strong> Trying to explicitly program high-level behaviors
                <br />
                <strong>Fix:</strong> Design Layers 1-3 well. Layer 4 emerges on its own.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-2">Ignoring Coherence</div>
              <div className="text-sm opacity-90">
                <strong>Problem:</strong> Rules contradict each other or break at scale
                <br />
                <strong>Fix:</strong> Test at multiple scales. Ensure rules are logically consistent.
              </div>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-[var(--metal-gold)]/10 to-transparent border-l-4 border-[var(--metal-gold)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--metal-gold)'}}>🎉 You Can Now Design Reality Worlds!</h4>
          <p className="text-sm opacity-90">
            You understand the <strong>4-layer reality stack</strong>, the <strong>design process</strong>, 
            <strong>common patterns</strong>, and <strong>how to test coherence</strong>. Next, we'll dive into 
            fractal coherence architecture—the secret to building infinitely scalable systems.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Reality worlds have 4 layers: Constants → Geometry → Interactions → Emergence',
      'Design layers 1-3 carefully; layer 4 emerges naturally from them',
      'Test coherence at micro, meso, macro, and temporal scales',
      'Start with 3-7 simple rules—complexity emerges from simplicity',
    ],
  },

  {
    id: 'fractal-coherence',
    number: 4,
    title: 'Fractal Coherence Architecture',
    subtitle: 'Building Self-Similar Systems',
    icon: <Grid3x3 className="h-6 w-6" />,
    duration: '40 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3 text-green-400">
            🌀 The Secret to Infinite Scalability
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Fractals are nature's compression algorithm—infinite complexity from simple recursive rules. 
            A single fern frond looks like the whole fern. A coastline's roughness is the same whether 
            you zoom in 10x or 1000x. Master fractal coherence and your systems will scale infinitely.
          </p>
        </div>

        {/* What Makes a Fractal */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Makes Something Fractal?</h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="cloud-card p-5 text-center">
              <div className="text-4xl mb-3">🔁</div>
              <div className="font-semibold text-blue-400 mb-2">Self-Similarity</div>
              <div className="text-sm opacity-90">
                Parts resemble the whole at every scale
              </div>
            </div>

            <div className="cloud-card p-5 text-center">
              <div className="text-4xl mb-3">♾️</div>
              <div className="font-semibold text-purple-400 mb-2">Recursion</div>
              <div className="text-sm opacity-90">
                Pattern defined in terms of itself
              </div>
            </div>

            <div className="cloud-card p-5 text-center">
              <div className="text-4xl mb-3">📏</div>
              <div className="font-semibold text-green-400 mb-2">Scale Invariance</div>
              <div className="text-sm opacity-90">
                Rules work the same at all scales
              </div>
            </div>
          </div>
        </div>

        {/* Fractal Design Principles */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🏗️ Fractal Design Principles</h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-green-400 mb-2">Principle 1: Simple Recursive Rules</div>
              <div className="text-sm opacity-90 mb-2">
                Start with one rule that references itself. Everything else emerges.
              </div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs">
                tree(size) = branch(size) + tree(size/3) + tree(size/3)
              </div>
            </div>

            <div>
              <div className="font-semibold text-blue-400 mb-2">Principle 2: Termination Conditions</div>
              <div className="text-sm opacity-90 mb-2">
                Infinite recursion crashes. Set a minimum scale where recursion stops.
              </div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs">
                if (size under 1px) return; else recurse
              </div>
            </div>

            <div>
              <div className="font-semibold text-purple-400 mb-2">Principle 3: Scaling Factor</div>
              <div className="text-sm opacity-90 mb-2">
                How much smaller/larger each level is. Common: 1/2, 1/3, golden ratio (0.618)
              </div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs">
                next_level_size = current_size × 0.618
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Principle 4: Variation Within Repetition</div>
              <div className="text-sm opacity-90 mb-2">
                Exact copies are boring. Add slight variation (angle, size, color) while preserving structure.
              </div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs">
                angle = base_angle + random(-5°, +5°)
              </div>
            </div>
          </div>
        </div>

        {/* Code Example: Fractal Tree */}
        <div>
          <h4 className="text-xl font-bold mb-4">💻 Code Example: Fractal Tree Generator</h4>
          
          <div className="cloud-card p-5">
            <div className="font-semibold mb-3 text-green-400">JavaScript / Canvas</div>
            <div className="bg-black/50 p-4 rounded font-mono text-xs overflow-x-auto">
{`function drawFractalTree(x, y, length, angle, depth) {
  // Termination condition
  if (depth === 0 || length < 2) return;
  
  // Draw current branch
  const endX = x + length * Math.cos(angle);
  const endY = y + length * Math.sin(angle);
  ctx.strokeStyle = \`hsl(\${depth * 30}, 70%, 50%)\`;
  ctx.lineWidth = depth * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  
  // Recursive calls (two sub-branches)
  const branchAngleLeft = angle - Math.PI / 6;   // 30° left
  const branchAngleRight = angle + Math.PI / 6;  // 30° right
  const newLength = length * 0.67;               // Scaling factor
  
  drawFractalTree(endX, endY, newLength, branchAngleLeft, depth - 1);
  drawFractalTree(endX, endY, newLength, branchAngleRight, depth - 1);
}

// Initialize
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
drawFractalTree(400, 600, 120, -Math.PI/2, 10);  // Start from bottom-center`}
            </div>
            <div className="text-xs opacity-70 mt-2">
              Result: Realistic tree with 2¹⁰ = 1,024 branches from 10 lines of recursive code
            </div>
          </div>
        </div>

        {/* Fractal Dimension */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">📐 Understanding Fractal Dimension</h4>
          
          <p className="text-sm opacity-90 mb-4 leading-relaxed">
            Fractal dimension (D) measures complexity. It's not always an integer:
          </p>

          <div className="bg-black/30 p-4 rounded mb-4">
            <div className="font-mono text-sm mb-2">D = log(N) / log(1/r)</div>
            <div className="text-xs opacity-70">
              Where N = number of self-similar pieces, r = scaling factor
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <strong className="text-blue-400">1D Examples:</strong>
              <ul className="mt-1 space-y-1 opacity-80 ml-4">
                <li>• Line segment (D = 1.0)</li>
                <li>• Straight path (D = 1.0)</li>
              </ul>
            </div>
            <div>
              <strong className="text-green-400">2D Examples:</strong>
              <ul className="mt-1 space-y-1 opacity-80 ml-4">
                <li>• Flat plane (D = 2.0)</li>
                <li>• Smooth surface (D = 2.0)</li>
              </ul>
            </div>
            <div>
              <strong className="text-purple-400">Fractal Examples:</strong>
              <ul className="mt-1 space-y-1 opacity-80 ml-4">
                <li>• Coastline (D ≈ 1.25)</li>
                <li>• Clouds (D ≈ 2.3)</li>
                <li>• Mandelbrot set boundary (D = 2.0)</li>
              </ul>
            </div>
            <div>
              <strong style={{color: 'var(--hydrogen-amber)'}}>HHF Systems:</strong>
              <ul className="mt-1 space-y-1 opacity-80 ml-4">
                <li>• Contribution networks (D ≈ 1.618)</li>
                <li>• Idea clusters (D ≈ 2.4)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Coherence Preservation */}
        <div>
          <h4 className="text-xl font-bold mb-4">🔗 Preserving Coherence Across Scales</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            The challenge: keep system meaningful at atom-scale AND galaxy-scale. Here's how:
          </p>

          <div className="space-y-3">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-2">1. Local Rules, Global Coherence</div>
              <div className="text-sm opacity-90">
                Each entity only knows its immediate neighbors. Global patterns emerge from local interactions.
                <br />
                <strong>Example:</strong> Bird flocking—each bird follows 3 simple rules (separation, alignment, cohesion). 
                Result: coordinated flock behavior.
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-2">2. Hierarchical Composition</div>
              <div className="text-sm opacity-90">
                Small patterns combine into larger patterns. Atoms → molecules → cells → organisms.
                <br />
                <strong>Example:</strong> PoCs → Clusters → Domains → The entire Syntheverse knowledge map.
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-2">3. Scaling Invariant Metrics</div>
              <div className="text-sm opacity-90">
                Measurements work the same at all scales. Use ratios, not absolutes.
                <br />
                <strong>Example:</strong> Coherence = (connected_nodes / total_nodes). Works for 10 nodes or 10 million.
              </div>
            </div>
          </div>
        </div>

        {/* Practical Application */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            🎯 Practical: Designing a Fractal Contribution Network
          </h4>
          
          <div className="text-sm space-y-3 opacity-90">
            <div>
              <strong className="text-blue-400">Vision:</strong> Represent all Syntheverse contributions as a fractal network where similar ideas cluster at every scale.
            </div>

            <div>
              <strong className="text-green-400">Recursive Rule:</strong>
              <div className="bg-black/30 p-2 rounded font-mono text-xs mt-1">
                cluster(contributions) = {'{'}
                <br />
                &nbsp;&nbsp;if (contributions.length under 3) return leaf_node;
                <br />
                &nbsp;&nbsp;groups = k-means(contributions, k=3);
                <br />
                &nbsp;&nbsp;return groups.map(g ={'>'} cluster(g));
                {'}'}
              </div>
            </div>

            <div>
              <strong className="text-purple-400">Result:</strong> Tree structure where:
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Leaves = individual PoCs</li>
                <li>• Level 1 = related PoCs (e.g., "quantum algorithms")</li>
                <li>• Level 2 = broader domains (e.g., "quantum computing")</li>
                <li>• Root = entire knowledge map</li>
              </ul>
            </div>

            <div>
              <strong style={{color: 'var(--hydrogen-amber)'}}>Coherence Check:</strong> Zoom in on any branch—pattern repeats. 
              Clusters within clusters, all the way down. Self-similar at every scale. ✅
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand Fractal Coherence!</h4>
          <p className="text-sm opacity-90">
            You know <strong>what makes fractals work</strong>, <strong>how to code them</strong>, 
            <strong>fractal dimension</strong>, and <strong>coherence preservation</strong>. 
            Next: infinite HHF-AI materials and substrates—the creator's toolkit.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Fractals = self-similarity + recursion + scale invariance',
      'Simple recursive rules generate infinite complexity',
      'Fractal dimension D measures complexity (non-integer for fractals)',
      'Preserve coherence via local rules, hierarchy, and scale-invariant metrics',
    ],
  },

  {
    id: 'infinite-materials',
    number: 5,
    title: 'Infinite Materials & Substrates',
    subtitle: 'The Creator Toolkit',
    icon: <Sparkles className="h-6 w-6" />,
    duration: '35 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            ♾️ Infinite Materials from HHF Principles
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional creators are limited by physical constraints—canvas size, compute power, budget. 
            <strong> Syntheverse Creators have infinite materials</strong> derived from holographic hydrogen 
            fractal principles. Every substrate, pattern, and tool emerges from the same physics that governs reality itself.
          </p>
        </div>

        {/* The Material Library */}
        <div>
          <h4 className="text-xl font-bold mb-4">The HHF-AI Material Library</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌊</span>
                <div className="font-bold text-blue-400">Coherence Fields</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div><strong>What:</strong> Invisible fields that maintain consistency across space/time</div>
                <div><strong>Use:</strong> Keep distributed systems aligned without centralized control</div>
                <div><strong>Example:</strong> A narrative world where all character actions remain consistent with established physics</div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎨</span>
                <div className="font-bold text-purple-400">Pattern Synthesis Engines</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div><strong>What:</strong> Algorithms that generate coherent patterns from seed rules</div>
                <div><strong>Use:</strong> Create infinite variations while preserving style/structure</div>
                <div><strong>Example:</strong> Generate 10,000 unique characters that all feel like they belong to the same world</div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔮</span>
                <div className="font-bold text-green-400">Awareness-Responsive Materials</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div><strong>What:</strong> Substrates that adapt based on user intention/attention</div>
                <div><strong>Use:</strong> Build interfaces that respond to what users need before they ask</div>
                <div><strong>Example:</strong> A dashboard that reorganizes based on which metrics you're focusing on</div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚡</span>
                <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Fractal Scaffolds</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div><strong>What:</strong> Self-similar structures that scale infinitely</div>
                <div><strong>Use:</strong> Design systems that work at any scale (atom → galaxy)</div>
                <div><strong>Example:</strong> A governance model that works for 10 people or 10 million</div>
              </div>
            </div>
          </div>
        </div>

        {/* Substrate Types */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            🎯 Substrate Types & Applications
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold mb-2 text-blue-400">Digital Substrates</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Code Spaces:</strong> Programming environments with HHF-aware linting/testing</div>
                <div>• <strong>Data Canvases:</strong> Infinite-dimensional data visualization spaces</div>
                <div>• <strong>Simulation Chambers:</strong> Physics engines with custom constants</div>
                <div>• <strong>Neural Architectures:</strong> AI models with fractal attention patterns</div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-purple-400">Conceptual Substrates</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Idea Graphs:</strong> Concept networks with coherence-preserving edges</div>
                <div>• <strong>Narrative Fabrics:</strong> Story worlds with self-consistent causality</div>
                <div>• <strong>Symbolic Algebras:</strong> Mathematical systems with novel operators</div>
                <div>• <strong>Ontology Frameworks:</strong> Classification systems that scale fractally</div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-green-400">Hybrid Substrates</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Mixed Reality Layers:</strong> Digital overlays on physical spaces</div>
                <div>• <strong>Bio-Digital Interfaces:</strong> Systems bridging biological and computational</div>
                <div>• <strong>Quantum-Classical Bridges:</strong> Algorithms spanning both regimes</div>
                <div>• <strong>Social-Technical Systems:</strong> Human + AI collaborative spaces</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Synthesis */}
        <div>
          <h4 className="text-xl font-bold mb-4">Pattern Synthesis Techniques</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-semibold mb-2 text-purple-400">1. Seed-Based Generation</div>
              <div className="text-sm opacity-90 mb-3">
                Start with irreducible seed patterns (S₀-S₈ from Seed Information Theory) and apply expansion rules.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs font-mono">
                seed = HydrogenAtom() // S₀<br/>
                rules = [spin_flip, orbital_excitation, entanglement]<br/>
                world = expand(seed, rules, depth=∞)
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold mb-2 text-blue-400">2. Coherence-Constrained Evolution</div>
              <div className="text-sm opacity-90 mb-3">
                Let patterns evolve randomly but enforce coherence at boundaries—natural selection for ideas.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs font-mono">
                population = random_patterns(1000)<br/>
                for generation in range(100):<br/>
                &nbsp;&nbsp;coherence_scores = measure_FCC(population)<br/>
                &nbsp;&nbsp;population = select_top(coherence_scores) + mutate()
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold mb-2 text-green-400">3. Fractal Interpolation</div>
              <div className="text-sm opacity-90 mb-3">
                Blend multiple patterns while preserving self-similarity—creates novel hybrids with coherent structure.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs font-mono">
                pattern_A = load("gothic_architecture")<br/>
                pattern_B = load("quantum_mechanics")<br/>
                hybrid = fractal_blend(pattern_A, pattern_B, ratio=0.6)<br/>
                // Result: Quantum Gothic style with coherent aesthetics
              </div>
            </div>
          </div>
        </div>

        {/* Creative Tools */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            🛠️ The Creator Toolkit
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2 text-blue-400">Analysis Tools</div>
              <ul className="space-y-1 opacity-90 ml-4">
                <li>• <strong>SynthScan™ MRI:</strong> Evaluate coherence of any artifact</li>
                <li>• <strong>Fractal Dimension Calculator:</strong> Measure complexity</li>
                <li>• <strong>Coherence Field Visualizer:</strong> See internal structure</li>
                <li>• <strong>Redundancy Detector:</strong> Find overlaps and gaps</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-purple-400">Generation Tools</div>
              <ul className="space-y-1 opacity-90 ml-4">
                <li>• <strong>Pattern Synthesizer:</strong> Generate from seed rules</li>
                <li>• <strong>Coherence Optimizer:</strong> Improve FCC scores</li>
                <li>• <strong>Substrate Builder:</strong> Design custom environments</li>
                <li>• <strong>Fractal Composer:</strong> Blend patterns coherently</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2 text-green-400">Integration Tools</div>
              <ul className="space-y-1 opacity-90 ml-4">
                <li>• <strong>API Bridges:</strong> Connect to external systems</li>
                <li>• <strong>Data Pipelines:</strong> Stream awareness data</li>
                <li>• <strong>Blockchain Anchors:</strong> Immutable timestamps</li>
                <li>• <strong>Cloud Orchestrators:</strong> Manage distributed builds</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2 text-amber-400">Collaboration Tools</div>
              <ul className="space-y-1 opacity-90 ml-4">
                <li>• <strong>WorkChat:</strong> Real-time team coordination</li>
                <li>• <strong>Cloud Channel:</strong> Share progress updates</li>
                <li>• <strong>Version Control:</strong> Track evolution over time</li>
                <li>• <strong>Merge Assistants:</strong> Combine contributions coherently</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Practical Example */}
        <div className="border-l-4 border-[var(--hydrogen-alpha)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-alpha)'}}>
            🎯 Practical Example: Building a Reality World
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Choose Substrate:</strong> Start with "Narrative Fabric" substrate for story-based world
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Define Seeds:</strong> Core physics (gravity works backwards), core characters (3 archetypes), core conflict (resource scarcity)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Apply Pattern Synthesis:</strong> Generate 1,000 story scenarios using seed rules + coherence constraints
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Measure Coherence:</strong> Use SynthScan™ to find internal contradictions, fix with Coherence Optimizer
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">5️⃣</span>
              <div>
                <strong>Fractal Scale:</strong> Same rules work for individual scenes, full novels, or entire universes
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-[var(--hydrogen-gamma)]/10 to-transparent border-l-4 border-[var(--hydrogen-gamma)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--hydrogen-gamma)'}}>
            ♾️ Infinite ≠ Unlimited
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            "Infinite materials" doesn't mean "anything goes." Every material derives from HHF principles—
            holographic encoding, hydrogen spin resonance, fractal self-similarity. <strong>Constraints create creativity.</strong> 
            The same physics that limits also liberates. Master the materials, and you can build realities that feel 
            more real than reality itself.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Creators have access to infinite HHF-derived materials and substrates',
      'Pattern synthesis engines generate coherent designs from seed rules',
      'Substrates span digital, conceptual, and hybrid domains',
      'Coherence constraints enable infinite variation with preserved structure',
      'The Creator Toolkit includes analysis, generation, integration, and collaboration tools',
    ],
  },

  {
    id: 'creative-implementation',
    number: 6,
    title: 'Creative Implementation Techniques',
    subtitle: 'From Concept to Reality',
    icon: <FileCode className="h-6 w-6" />,
    duration: '45 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            💻 Bringing Worlds to Life
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've learned the theory and designed the architecture. Now it's time to <strong>build.</strong> 
            This module covers practical implementation techniques—code, visuals, generative systems, and 
            interactive experiences that embody HHF principles.
          </p>
        </div>

        {/* Implementation Approaches */}
        <div>
          <h4 className="text-xl font-bold mb-4">Three Implementation Approaches</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💻</span>
                <div className="font-bold text-xl text-blue-400">1. Code-First (Computational)</div>
              </div>
              <div className="text-sm opacity-90 mb-3">
                <strong>Best for:</strong> Simulations, algorithms, data systems, AI models
              </div>
              <div className="bg-black/30 p-3 rounded text-xs font-mono mb-3">
                class HHFSimulation:<br/>
                &nbsp;&nbsp;def __init__(self, seed_constants):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;self.coherence_field = init_field()<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;self.fractals = generate_fractals(seed)<br/>
                &nbsp;&nbsp;<br/>
                &nbsp;&nbsp;def step(self):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;apply_holographic_constraints()<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;evolve_patterns()<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;measure_coherence()
              </div>
              <div className="text-xs opacity-80">
                <strong>Tools:</strong> Python, TypeScript, Julia, Rust. Libraries: NumPy, TensorFlow, React, Three.js
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎨</span>
                <div className="font-bold text-xl text-purple-400">2. Visual-First (Artistic)</div>
              </div>
              <div className="text-sm opacity-90 mb-3">
                <strong>Best for:</strong> Generative art, interactive installations, immersive experiences
              </div>
              <div className="bg-black/30 p-3 rounded text-xs mb-3">
                <strong>Workflow:</strong><br/>
                1. Design fractal patterns in Houdini/Blender<br/>
                2. Apply HHF coherence shaders<br/>
                3. Export to WebGL/Three.js<br/>
                4. Add real-time awareness tracking<br/>
                5. Deploy as interactive experience
              </div>
              <div className="text-xs opacity-80">
                <strong>Tools:</strong> Blender, Houdini, TouchDesigner, p5.js, Unity, Unreal Engine
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌐</span>
                <div className="font-bold text-xl text-green-400">3. Hybrid (Multi-Modal)</div>
              </div>
              <div className="text-sm opacity-90 mb-3">
                <strong>Best for:</strong> Complete reality worlds with multiple interaction modes
              </div>
              <div className="bg-black/30 p-3 rounded text-xs mb-3">
                <strong>Architecture:</strong><br/>
                Frontend (React/Three.js) ← WebSocket → Backend (Python/Node.js)<br/>
                &nbsp;&nbsp;↓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>
                Generative AI ← → Database ← → Blockchain
              </div>
              <div className="text-xs opacity-80">
                <strong>Tools:</strong> Full-stack frameworks, cloud infrastructure, distributed systems
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            💻 Code Example: Fractal Coherence Visualizer
          </h4>
          
          <div className="bg-black/30 p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
            <span className="text-blue-400">import</span> * <span className="text-blue-400">as</span> THREE <span className="text-blue-400">from</span> <span className="text-green-400">'three'</span>;<br/>
            <span className="text-blue-400">import</span> &#123; Canvas, useFrame &#125; <span className="text-blue-400">from</span> <span className="text-green-400">'@react-three/fiber'</span>;<br/>
            <br/>
            <span className="text-purple-400">function</span> <span className="text-yellow-400">FractalCoherenceField</span>() &#123;<br/>
            &nbsp;&nbsp;<span className="text-blue-400">const</span> meshRef = useRef();<br/>
            &nbsp;&nbsp;<br/>
            &nbsp;&nbsp;<span className="text-gray-400">// Generate fractal geometry</span><br/>
            &nbsp;&nbsp;<span className="text-blue-400">const</span> geometry = useMemo(() =&gt; &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> points = [];<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">for</span> (<span className="text-blue-400">let</span> i = <span className="text-amber-400">0</span>; i &lt; <span className="text-amber-400">10000</span>; i++) &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> [x, y, z] = generateFractalPoint(i);<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;points.push(<span className="text-blue-400">new</span> THREE.Vector3(x, y, z));<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return new</span> THREE.BufferGeometry().setFromPoints(points);<br/>
            &nbsp;&nbsp;&#125;, []);<br/>
            <br/>
            &nbsp;&nbsp;<span className="text-gray-400">// Animate based on coherence field</span><br/>
            &nbsp;&nbsp;useFrame((state) =&gt; &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> coherence = measureCoherence(state.clock.elapsedTime);<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;meshRef.current.rotation.y = coherence * <span className="text-amber-400">0.01</span>;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;meshRef.current.material.opacity = coherence;<br/>
            &nbsp;&nbsp;&#125;);<br/>
            <br/>
            &nbsp;&nbsp;<span className="text-blue-400">return</span> (<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-green-400">points</span> ref=&#123;meshRef&#125; geometry=&#123;geometry&#125;&gt;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-green-400">pointsMaterial</span> size=&#123;<span className="text-amber-400">0.05</span>&#125; color=<span className="text-green-400">"#00bfff"</span> transparent /&gt;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-green-400">points</span>&gt;<br/>
            &nbsp;&nbsp;);<br/>
            &#125;
          </div>
          
          <div className="text-xs opacity-80">
            This visualizes a fractal point cloud that responds to coherence measurements in real-time. 
            The pattern's rotation and opacity change based on the system's internal coherence state.
          </div>
        </div>

        {/* Generative Systems */}
        <div>
          <h4 className="text-xl font-bold mb-4">Generative AI & Pattern Synthesis</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5">
              <div className="font-semibold mb-3 text-blue-400">Generative Art with HHF</div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>1. Seed Pattern:</strong> Start with hydrogen orbital shapes</div>
                <div><strong>2. Fractal Expansion:</strong> Apply L-system rules for growth</div>
                <div><strong>3. Coherence Filter:</strong> Keep only patterns with FCC {'>'}  1.0</div>
                <div><strong>4. Style Transfer:</strong> Blend with target aesthetic</div>
                <div><strong>5. Interactive Layer:</strong> Respond to user gaze/touch</div>
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold mb-3 text-purple-400">Generative Music/Audio</div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>1. Hydrogen Frequencies:</strong> Use spectral lines (656.3nm → audio)</div>
                <div><strong>2. Fractal Rhythms:</strong> Self-similar timing patterns</div>
                <div><strong>3. Coherence Harmonics:</strong> Notes derived from FCC values</div>
                <div><strong>4. Spatial Audio:</strong> Position sounds in holographic field</div>
                <div><strong>5. Adaptive Composition:</strong> Music evolves with system state</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Experiences */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            🎮 Building Interactive Experiences
          </h4>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold mb-2 text-blue-400">Awareness Tracking</div>
              <div className="opacity-90">
                Use eye tracking, mouse position, or EEG signals to detect where user attention is focused. 
                System responds by increasing coherence in attended regions.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-purple-400">Real-Time Coherence Feedback</div>
              <div className="opacity-90">
                Display live FCC scores as users create/modify content. Visual feedback loop helps users 
                understand what increases vs decreases system coherence.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-green-400">Collaborative World-Building</div>
              <div className="opacity-90">
                Multiple users contribute simultaneously. Fractal general contractor grammar coordinates 
                independent work, recomposing contributions into coherent whole in real-time.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-amber-400">Adaptive Difficulty</div>
              <div className="opacity-90">
                System adjusts complexity based on user's demonstrated mastery. Beginners get simpler 
                substrates, experts get infinite-dimensional spaces.
              </div>
            </div>
          </div>
        </div>

        {/* Performance Optimization */}
        <div>
          <h4 className="text-xl font-bold mb-4">Performance & Scalability</h4>
          
          <div className="cloud-card p-5">
            <div className="text-sm opacity-90 space-y-3">
              <div>
                <strong className="text-blue-400">Client-Side:</strong> Offload heavy computation to Web Workers. 
                Use GPU shaders for fractal generation. Implement LOD (level-of-detail) for fractal rendering.
              </div>
              <div>
                <strong className="text-purple-400">Server-Side:</strong> Cache coherence field calculations. 
                Use Redis for real-time state. Deploy serverless functions for burst workloads.
              </div>
              <div>
                <strong className="text-green-400">Database:</strong> Store fractal patterns as JSON/JSONB. 
                Index on coherence scores. Use vector databases for similarity search.
              </div>
              <div>
                <strong className="text-amber-400">Blockchain:</strong> Anchor key states (daily/weekly) not every interaction. 
                Use IPFS for large artifacts. Batch transactions for gas efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* Testing & Validation */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            ✅ Testing Your Implementations
          </h4>
          <div className="space-y-2 text-sm">
            <div>• <strong>Coherence Tests:</strong> Verify FCC {'>'} 1.0 for all generated patterns</div>
            <div>• <strong>Fractal Dimension:</strong> Confirm self-similarity at multiple scales</div>
            <div>• <strong>Performance Benchmarks:</strong> 60 FPS for visualizations, {'<'}100ms API response</div>
            <div>• <strong>User Testing:</strong> A/B test awareness-responsive vs static experiences</div>
            <div>• <strong>Edge Cases:</strong> Test with extreme inputs (0 coherence, infinite recursion)</div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-[var(--hydrogen-beta)]/10 to-transparent border-l-4 border-[var(--hydrogen-beta)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--hydrogen-beta)'}}>
            🚀 Implementation is Where Theory Becomes Real
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            You can design perfect architectures on paper, but <strong>code is truth.</strong> The implementations 
            that survive are those that embody HHF principles not just conceptually but computationally. Build, 
            test, measure, iterate. Let the coherence field guide you.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Three approaches: Code-first (computational), Visual-first (artistic), Hybrid (multi-modal)',
      'Use React Three Fiber for 3D holographic visualizations with real-time coherence',
      'Generate art/music using fractal patterns and hydrogen spectral frequencies',
      'Build interactive experiences with awareness tracking and adaptive difficulty',
      'Test implementations with coherence metrics, performance benchmarks, and user feedback',
    ],
  },

  {
    id: 'publishing-high-impact',
    number: 7,
    title: 'Publishing High-Impact PoCs',
    subtitle: '7,000+ Score Strategies',
    icon: <Zap className="h-6 w-6" />,
    duration: '30 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>
            ⚡ Breakthrough Contributions
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            As a Creator, you're not submitting incremental improvements—you're <strong>pioneering new frontiers.</strong> 
            This module teaches you how to craft PoCs that score 7,000-10,000+, the range reserved for 
            breakthrough discoveries and reality-defining work.
          </p>
        </div>

        {/* The Scoring Spectrum */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Contribution Spectrum</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-gray-500">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">Standard Contributions</div>
                <div className="text-sm opacity-70">2,000-4,000</div>
              </div>
              <div className="text-xs opacity-80">
                Good work, solid execution, but within existing frameworks. Valuable but not transformative.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-400">High-Quality Work</div>
                <div className="text-sm opacity-70">4,000-6,000</div>
              </div>
              <div className="text-xs opacity-80">
                Exceptional execution, novel applications, or significant depth. Often combination of high N+D+C+A.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-purple-400">Breakthrough Territory</div>
                <div className="text-sm opacity-70">7,000-9,000</div>
              </div>
              <div className="text-xs opacity-80">
                <strong>Edge contributions:</strong> Advancing frontiers with novel boundary operators, 
                or <strong>Seed-level depth</strong> in established domains.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-[var(--metal-gold)]">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold" style={{color: 'var(--metal-gold)'}}>Discovery Class</div>
                <div className="text-sm opacity-70">9,000-10,000+</div>
              </div>
              <div className="text-xs opacity-80">
                <strong>Seed contributions:</strong> Entirely new domains with irreducible generative capacity. 
                Novel physical constants or fundamental equations.
              </div>
            </div>
          </div>
        </div>

        {/* Maximizing the 4 Dimensions */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            📊 Maximizing All 4 Dimensions
          </h4>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold mb-2 text-purple-400">Novelty (N): 0-2,500</div>
              <div className="opacity-90 mb-2">
                <strong>To Maximize:</strong> Explore entirely new domains, propose unprecedented frameworks, 
                discover new constants/equations, or synthesize disparate fields in original ways.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Example:</strong> "Holographic Hydrogen Fractal MRI" combines quantum mechanics, 
                holography, information theory, and biological imaging in a novel synthesis.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-blue-400">Density (D): 0-2,500</div>
              <div className="opacity-90 mb-2">
                <strong>To Maximize:</strong> Include empirical validation, mathematical proofs, working code, 
                experimental data, or comprehensive theoretical frameworks with citations.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Example:</strong> Not just "fractal coherence exists" but FCC = |Ψ'| / Σₖ |ψₖ| with 
                empirical measurements showing 2.1-4.7× gains in real builds.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-green-400">Coherence (C): 0-2,500</div>
              <div className="opacity-90 mb-2">
                <strong>To Maximize:</strong> Ensure internal consistency, clear logical flow, well-defined terms, 
                and connections to established principles. No contradictions or ambiguities.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Example:</strong> Every claim traces back to HHF principles (holographic, hydrogen, fractal) 
                with explicit mappings. Notation is consistent throughout.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-amber-400">Alignment (A): 0-2,500</div>
              <div className="opacity-90 mb-2">
                <strong>To Maximize:</strong> Direct practical applications, immediate utility, clear use cases, 
                or obvious integration with existing Syntheverse infrastructure.
              </div>
              <div className="bg-black/30 p-3 rounded text-xs">
                <strong>Example:</strong> Not just theory but "here's how to apply this in SynthScan™ MRI" 
                or "this improves Cloud evaluation by 18-240×".
              </div>
            </div>
          </div>
        </div>

        {/* Seeds & Edges */}
        <div>
          <h4 className="text-xl font-bold mb-4">Seeds & Edges: The Multipliers</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-[var(--metal-gold)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌱</span>
                <div className="font-bold text-xl" style={{color: 'var(--metal-gold)'}}>Seed Contributions</div>
              </div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Definition:</strong> Irreducible informational primitives with generative capacity</div>
                <div><strong>Examples:</strong></div>
                <ul className="ml-4 space-y-1">
                  <li>• Holographic Hydrogen (Element 0)</li>
                  <li>• Fundamental equations (E=mc²)</li>
                  <li>• Minimal viable generative sets</li>
                  <li>• New physical constants</li>
                </ul>
                <div><strong>Multiplier:</strong> ×1.15 (15% bonus)</div>
                <div className="text-xs bg-[var(--metal-gold)]/10 p-2 rounded">
                  💡 Seeds spawn entire domains. Not just first in time, but foundational in structure.
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚡</span>
                <div className="font-bold text-xl text-purple-400">Edge Contributions</div>
              </div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Definition:</strong> Boundary operators that enable new interactions</div>
                <div><strong>Examples:</strong></div>
                <ul className="ml-4 space-y-1">
                  <li>• Constraint/directionality rules</li>
                  <li>• Motion/energy generators</li>
                  <li>• Differentiation operators</li>
                  <li>• Interface protocols</li>
                </ul>
                <div><strong>Multiplier:</strong> ×1.15 (15% bonus)</div>
                <div className="text-xs bg-purple-500/10 p-2 rounded">
                  💡 Edges advance frontiers. They sit at boundaries and enable what wasn't possible before.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 cloud-card p-4 border-2 border-green-500">
            <div className="text-sm text-center">
              <strong className="text-green-400">Seed + Edge Combined:</strong> ×1.3225 (32.25% total bonus)
            </div>
            <div className="text-xs opacity-80 text-center mt-2">
              A contribution that is both foundational AND opens new interactions. Extremely rare.
            </div>
          </div>
        </div>

        {/* Discovery Publishing */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            🔬 Publishing Novel Discoveries
          </h4>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-semibold mb-2 text-purple-400">Novel Physical Constants</div>
              <div className="opacity-90">
                If you discover a new universal constant (like ℑₑₛ or the hydrogen-carbon pairing), 
                document derivation, empirical validation, and applications. These are 9,000+ automatic.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-blue-400">Fundamental Equations</div>
              <div className="opacity-90">
                New equations that govern a domain (like the fractal construction operator 𝒢(Ψ)). 
                Must be verified, non-obvious, and broadly applicable.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-green-400">Novel Frameworks</div>
              <div className="opacity-90">
                Entirely new ways of thinking about a problem (like "construction as grammar" or 
                "evaluation as physics"). Paradigm shifts score highest.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-amber-400">Experimental Validation</div>
              <div className="opacity-90">
                Always include data. Predictions tested. Measurements taken. Code that runs. 
                Theory without validation caps at ~6,000 no matter how novel.
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div>
          <h4 className="text-xl font-bold mb-4">Common Mistakes (Even for Creators)</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 border-l-4 border-red-500 pl-4 py-2 bg-red-500/5">
              <span>❌</span>
              <div>
                <strong>Too Abstract:</strong> Pure philosophy with no empirical grounding. Even brilliant 
                ideas need validation. Add experiments, simulations, or working implementations.
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-4 border-red-500 pl-4 py-2 bg-red-500/5">
              <span>❌</span>
              <div>
                <strong>Incremental When Claiming Breakthrough:</strong> "Here's a minor variation on X" 
                doesn't score 7,000+. Be honest about novelty level or make it genuinely transformative.
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-4 border-red-500 pl-4 py-2 bg-red-500/5">
              <span>❌</span>
              <div>
                <strong>No Coherence Field:</strong> Disconnected ideas don't cohere. Every part should 
                relate to HHF principles and build toward unified vision.
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-4 border-red-500 pl-4 py-2 bg-red-500/5">
              <span>❌</span>
              <div>
                <strong>Ignoring Alignment:</strong> "This is cool but has no practical application." 
                Always connect to real use cases, even if theoretical work.
              </div>
            </div>
          </div>
        </div>

        {/* The 7,000+ Checklist */}
        <div className="border-l-4 border-[var(--hydrogen-alpha)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-alpha)'}}>
            ✅ The 7,000+ Checklist
          </h4>
          <div className="space-y-2 text-sm">
            <div>☐ <strong>Genuine Novelty:</strong> This hasn't been done before, or synthesizes fields in unprecedented way</div>
            <div>☐ <strong>Empirical Validation:</strong> Data, experiments, working code, or mathematical proofs included</div>
            <div>☐ <strong>Internal Coherence:</strong> No contradictions, clear definitions, logical flow throughout</div>
            <div>☐ <strong>Practical Applications:</strong> Clear use cases within Syntheverse or broader context</div>
            <div>☐ <strong>Seed/Edge Characteristics:</strong> Either foundational (seed) or boundary-enabling (edge)</div>
            <div>☐ <strong>HHF Grounding:</strong> Explicitly connects to holographic, hydrogen, or fractal principles</div>
            <div>☐ <strong>Reproducible:</strong> Others can verify, build upon, or extend the work</div>
            <div>☐ <strong>Discovery Claim:</strong> Novel constant, equation, framework, or validated prediction</div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-[var(--hydrogen-amber)]/10 to-transparent border-l-4 border-[var(--hydrogen-amber)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--hydrogen-amber)'}}>
            ⚡ You're Building the Frontier
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            As a Creator, your PoCs aren't just contributions—they're <strong>reality expansions.</strong> 
            Each 7,000+ submission doesn't just score high, it <strong>defines new possibility space</strong> 
            for everyone who follows. The frontier exists because Creators like you push it forward. 
            Aim for breakthrough. Settle for nothing less.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Breakthrough territory (7,000-9,000) requires seed/edge characteristics + high dimensional scores',
      'Discovery class (9,000+) for novel constants, fundamental equations, or paradigm-shifting frameworks',
      'Maximize all 4 dimensions: Novelty (new domains), Density (validation), Coherence (consistency), Alignment (utility)',
      'Seeds (×1.15) are irreducible foundations; Edges (×1.15) are boundary operators; Combined (×1.3225)',
      'Always include empirical validation—theory without data caps at ~6,000 regardless of novelty',
    ],
  },

  {
    id: 'earning-gold-wings',
    number: 8,
    title: 'Earning Your Gold Wings',
    subtitle: 'Reality Worldbuilder Certified',
    icon: <Award className="h-6 w-6" />,
    duration: '25 min',
    content: (
      <div className="space-y-6">
        {/* Victory */}
        <div className="border-l-4 border-[var(--metal-gold)] bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            👑 You're Ready to Build Complete Reality Worlds
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've mastered HHF principles, reality world design, fractal coherence, infinite materials, 
            creative implementation, and high-impact publishing. You're now equipped to pioneer the 
            frontier of digital creation.
          </p>
        </div>

        {/* Gold Wings Certificate */}
        <div className="border-4 border-[var(--metal-gold)] bg-gradient-to-br from-yellow-500/20 to-transparent p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">👑</div>
          <h3 className="text-3xl font-bold mb-2" style={{color: 'var(--metal-gold)'}}>
            Creator Gold Wings
          </h3>
          <div className="text-sm opacity-70 mb-4">Master Reality Worldbuilder</div>
          <div className="inline-block bg-black/50 px-6 py-3 rounded-lg border border-[var(--metal-gold)]">
            <div className="text-xs opacity-70 mb-1">Authorized to Build Complete Realities</div>
            <div className="font-bold text-lg">Pioneer of the Frontier</div>
          </div>
        </div>

        {/* What You've Mastered */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">Your Complete Mastery</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              { icon: '🎨', text: 'Reality worldbuilding from first principles' },
              { icon: '⚛️', text: 'Holographic hydrogen fractal applications' },
              { icon: '🌀', text: 'Fractal coherence architecture' },
              { icon: '♾️', text: 'Infinite HHF-AI materials & substrates' },
              { icon: '💻', text: 'Creative implementation techniques' },
              { icon: '⚡', text: '7,000+ scoring PoC strategies' },
              { icon: '🔬', text: 'Novel constant & equation discovery' },
              { icon: '👥', text: 'Ecosystem leadership & mentorship' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 opacity-90">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Creator Responsibilities */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            Your Path Forward as a Creator
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-3xl">1️⃣</span>
              <div>
                <strong style={{color: 'var(--metal-gold)'}}>Build Your First Reality World</strong> - 
                Apply everything you've learned to design a complete system, simulation, or experience
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">2️⃣</span>
              <div>
                <strong style={{color: 'var(--metal-gold)'}}>Publish Breakthrough PoCs</strong> - 
                Aim for 7,000+ scores and discover novel HHF constants/equations
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">3️⃣</span>
              <div>
                <strong style={{color: 'var(--metal-gold)'}}>Mentor the Community</strong> - 
                Guide Contributors and Operators, answer questions, share frameworks
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">4️⃣</span>
              <div>
                <strong style={{color: 'var(--metal-gold)'}}>Shape the Frontier</strong> - 
                Influence platform development, propose new features, pioneer applications
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-[var(--metal-gold)]/10 to-transparent border-l-4 border-[var(--metal-gold)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            ✨ Welcome to the Gold Tier, Creator
          </h4>
          <p className="text-sm opacity-90 leading-relaxed mb-3">
            You're no longer constrained by existing mediums, tools, or materials. <strong>You build 
            complete reality worlds from infinite HHF-AI substrates.</strong> You pioneer applications 
            that don't exist yet. You discover the mathematical structures of awareness itself.
          </p>
          <p className="text-sm opacity-90 leading-relaxed">
            This is the frontier. <strong>You're now shaping it.</strong> Go create realities worth exploring.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Completed all 17 modules of Creator Gold Wings',
      'Master of HHF principles and reality worldbuilding',
      'Advanced expertise in system architecture, tokenomics, blockchain integration',
      'Equipped to publish breakthrough 7,000+ PoCs and lead frontier development',
      'Ready to mentor community, shape the ecosystem, and build self-sustaining infrastructure',
    ],
  },

  {
    id: 'fractal-general-contractor',
    number: 9,
    title: 'The Fractal General Contractor',
    subtitle: 'Construction as Grammar',
    icon: <Construction className="h-6 w-6" />,
    duration: '50 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            🏗️ Construction Itself is Linguistic
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional construction—whether of buildings, software, or worlds—relies on centralized orchestration. 
            Plans are decomposed by humans, assigned hierarchically, and reassembled through managerial control. 
            <strong> Syntheverse reframes construction as grammar.</strong> Intent becomes a sentence. 
            Modules become phrases. Agents become lexical emitters. The system becomes syntax.
          </p>
        </div>

        {/* Core Concept */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{color: 'var(--hydrogen-alpha)'}} />
            The Grammar of Distributed Construction
          </h4>
          <p className="mb-4 opacity-90 leading-relaxed text-sm">
            Instead of managing workers, Syntheverse <strong>speaks a structure into existence</strong> by following 
            a grammatical process. This is not metaphor—it's operational syntax that coordinates construction across 
            digital, biological, and conceptual substrates.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-4 border-purple-500 bg-purple-500/5 p-4">
              <div className="font-semibold mb-2 text-purple-400">◎ Root Intent</div>
              <div className="text-xs opacity-80">
                The unified vision. "Build a collaborative narrative world." 
                This is the complete sentence before parsing.
              </div>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-500/5 p-4">
              <div className="font-semibold mb-2 text-blue-400">△ Symbolic Clauses</div>
              <div className="text-xs opacity-80">
                Phase-safe modules. "Character system," "world rules," "visual style." 
                Independent grammatical phrases.
              </div>
            </div>

            <div className="border-l-4 border-green-500 bg-green-500/5 p-4">
              <div className="font-semibold mb-2 text-green-400">✦ Emitter Agents</div>
              <div className="text-xs opacity-80">
                Contributors who realize clauses asynchronously without global coordination. 
                Lexical operators in the grammar.
              </div>
            </div>

            <div className="border-l-4 border-amber-500 bg-amber-500/5 p-4">
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>◇ Recomposed Whole</div>
              <div className="text-xs opacity-80">
                The living, coherent structure. Clauses recombine through holographic constraints, 
                yielding a complete reality.
              </div>
            </div>
          </div>
        </div>

        {/* The Production Operator */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            The Core Production Operator
          </h4>
          
          <div className="bg-black/30 p-4 rounded font-mono text-sm mb-4 border border-[var(--hydrogen-beta)]/30">
            <div className="text-center opacity-90">
              𝒢(Ψ) = 𝒟(Ψ) ⊕ ⨁ₖ R(ψₖ) → Ψ'
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">Ψ</span>
              <div>
                <strong>Unified Intent</strong> - The complete vision or goal expressed as a root symbol
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">𝒟</span>
              <div>
                <strong>Fractal Decomposition</strong> - Breaking the intent into phase-safe, independent clauses
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">ψₖ</span>
              <div>
                <strong>Symbolic Clauses</strong> - Independent modules that can be realized in parallel
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">R(ψₖ)</span>
              <div>
                <strong>Independent Realization</strong> - Agents execute clauses without centralized control
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span style={{color: 'var(--metal-gold)'}} className="font-bold">Ψ'</span>
              <div>
                <strong>Recomposed Structure</strong> - The coherent whole emerges from grammatical recombination
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Examples */}
        <div>
          <h4 className="text-xl font-bold mb-4">Construction Grammar Across Domains</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <FileCode className="w-6 h-6 text-blue-400" />
                <div className="font-bold text-blue-400">Software Development</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Intent:</strong> "Build a real-time chat application"
                </div>
                <div>
                  <strong>Clauses:</strong> Frontend UI, Backend API, Database Schema, Auth System, WebSocket Layer
                </div>
                <div>
                  <strong>Result:</strong> Teams work independently on modules, system converges through interfaces
                </div>
                <div className="mt-2 pt-2 border-t border-blue-500/30">
                  <span className="text-green-400">⚡ DAG (Distributed Assembly Gain): 2.86×</span> - 
                  Built in 42h vs 120h linear
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <Layers className="w-6 h-6 text-purple-400" />
                <div className="font-bold text-purple-400">Narrative Worldbuilding</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Intent:</strong> "Create a sci-fi universe with consistent physics"
                </div>
                <div>
                  <strong>Clauses:</strong> Cosmology, Technology Rules, Cultural Systems, Character Archetypes, Visual Language
                </div>
                <div>
                  <strong>Result:</strong> Writers contribute independently, holographic coherence preserves consistency
                </div>
                <div className="mt-2 pt-2 border-t border-purple-500/30">
                  <span className="text-green-400">⚡ DAG: 3.6×</span> - Converged in 5h vs 18h traditional
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <Atom className="w-6 h-6 text-green-400" />
                <div className="font-bold text-green-400">Biological Systems</div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Natural Example:</strong> Spider web construction
                </div>
                <div>
                  <strong>Grammar:</strong> The spider doesn't "manage threads"—it speaks geometry into silk through 
                  recursive grammatical operators. No centralized planning, only syntactic coherence.
                </div>
                <div className="mt-2 pt-2 border-t border-green-500/30">
                  <span className="text-green-400">⚡ DAG: 3.57×</span> - Web simulation matches biological efficiency
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Measures */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            📊 Operational Measures
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold mb-2 text-purple-400">Fractal Construction Coherence (FCC)</div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs mb-2 border border-purple-500/30">
                FCC = |Ψ'| / Σₖ |ψₖ|
              </div>
              <div className="text-sm opacity-80">
                Measures how well parts recombine. <strong>FCC {'>'} 1</strong> indicates emergent coherence—
                the whole exceeds the sum of parts. This is the signature of grammatical construction.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-blue-400">Distributed Assembly Gain (DAG)</div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs mb-2 border border-blue-500/30">
                DAG = T_linear / T_fractal
              </div>
              <div className="text-sm opacity-80">
                Quantifies non-linear construction efficiency. Syntheverse achieves <strong>DAG values of 2.1–4.7×</strong> 
                in real collaborative builds. Traditional management scales O(n), fractal grammar scales O(log n).
              </div>
            </div>
          </div>
        </div>

        {/* Controlled Incoherence */}
        <div className="border-l-4 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>
            🌊 Controlled Incoherence as Generative Edge
          </h4>
          <p className="text-sm opacity-90 leading-relaxed mb-3">
            In traditional systems, inconsistency is failure. In grammatical construction, 
            <strong> boundary incoherence is signal</strong>. When clauses don't perfectly align, 
            the tension drives creative resolution—new patterns emerge at the edges.
          </p>
          <div className="text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            <strong>Example:</strong> In collaborative worldbuilding, when two contributors define contradictory physics, 
            the system identifies the incoherence gradient. Rather than reject one, it prompts synthesis—
            often yielding more sophisticated rules than either contributor imagined alone.
          </div>
        </div>

        {/* Practical Application */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            How to Apply Fractal General Contractor Principles
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Express Intent as Root (◎)</strong> - Start with complete vision, not decomposed tasks. 
                "Build X" not "Do steps 1, 2, 3..."
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Identify Phase-Safe Clauses (△)</strong> - Find natural boundaries where work can proceed 
                independently. Look for modules with clean interfaces.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Enable Parallel Realization</strong> - Remove dependencies. Let agents work without 
                waiting for coordination. Trust grammatical recombination.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Apply Holographic Constraints</strong> - Define coherence invariants (like ℑₑₛ) that 
                preserved across all clauses. This is what enables independent work.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">5️⃣</span>
              <div>
                <strong>Recompose and Iterate (∞→◇)</strong> - Bring clauses together, measure FCC, identify 
                incoherence edges, refine. Grammar is recursive.
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-[var(--hydrogen-gamma)]/10 to-transparent border-l-4 border-[var(--hydrogen-gamma)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--hydrogen-gamma)'}}>
            🎯 Construction is Linguistic
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            You now understand that Syntheverse isn't a project management tool—it's a <strong>linguistic field</strong> 
            where intent propagates like meaning, contributors act as grammatical operators, and coherence 
            emerges through syntax. The spider does not manage threads. It speaks geometry into silk. 
            <strong> You can do the same for worlds.</strong>
          </p>
        </div>
      </div>
    ),
    learningObjectives: [
      'Understand construction as grammatical process rather than hierarchical management',
      'Master the production operator: 𝒢(Ψ) = 𝒟(Ψ) ⊕ ⨁ₖ R(ψₖ) → Ψ\'',
      'Apply symbolic roles: ◎ Root, △ Clause, ✦ Emitter, ◇ Recomposed Whole',
      'Measure construction with FCC (coherence) and DAG (efficiency)',
      'Recognize controlled incoherence as generative rather than failure',
    ],
    keyTakeaways: [
      'Construction is linguistic—intent becomes sentence, modules become phrases, system becomes syntax',
      'Fractal grammar achieves 2.1-4.7× speed gains over linear management (DAG measure)',
      'FCC > 1 indicates emergent coherence where whole exceeds sum of parts',
      'Boundary incoherence drives creative resolution and novel pattern emergence',
      'Same grammar governs spider webs, software dev, and world building—it\'s substrate-independent',
    ],
  },

  {
    id: 'abacus-to-quantum',
    number: 10,
    title: 'From Abacus to Quantum Evaluation',
    subtitle: 'HHF-MRI vs Linear Peer Review',
    icon: <Microscope className="h-6 w-6" />,
    duration: '45 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            🔬 Evaluation as Structure Imaging
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Peer review evaluates science through language. Language is serial. Reality is parallel. 
            <strong> Modern science produces artifacts whose internal structure far exceeds what prose can transmit.</strong> 
            Holographic Hydrogen Fractal MRI proposes direct imaging of work-as-structure: the internal coherence 
            field rendered as a navigable hologram.
          </p>
        </div>

        {/* The Analogy */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{color: 'var(--hydrogen-alpha)'}} />
            The Historical Parallel
          </h4>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border-2 border-amber-500 bg-amber-500/5 p-4 rounded-lg">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-2">🧮</div>
                  <div className="font-bold text-amber-400">Abacus</div>
                </div>
                <div className="text-xs opacity-80 text-center">
                  Manual, serial computation. Symbolic manipulation. Human bottleneck.
                </div>
              </div>

              <div className="border-2 border-blue-500 bg-blue-500/5 p-4 rounded-lg">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="font-bold text-blue-400">Classical Computer</div>
                </div>
                <div className="text-xs opacity-80 text-center">
                  Electronic, algorithmic. Still serial at core (von Neumann). Faster beads.
                </div>
              </div>

              <div className="border-2 border-purple-500 bg-purple-500/5 p-4 rounded-lg">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-2">⚛️</div>
                  <div className="font-bold text-purple-400">Quantum Computer</div>
                </div>
                <div className="text-xs opacity-80 text-center">
                  Parallel superposition. Directly inhabits quantum structure. Categorical leap.
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[var(--hydrogen-gamma)]/30 pt-4 mt-4">
              <div className="text-center mb-4 font-bold" style={{color: 'var(--hydrogen-gamma)'}}>
                ↓ SAME TRANSITION ↓
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border-2 border-amber-500 bg-amber-500/5 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="font-bold text-amber-400">Peer Review</div>
                  </div>
                  <div className="text-xs opacity-80 text-center">
                    Text-based inference. Reviewers infer structure through prose. Serial, lossy.
                  </div>
                </div>

                <div className="border-2 border-blue-500 bg-blue-500/5 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-bold text-blue-400">Citation Metrics</div>
                  </div>
                  <div className="text-xs opacity-80 text-center">
                    Algorithmic proxies. Count references, h-index. Still not seeing the work itself.
                  </div>
                </div>

                <div className="border-2 border-purple-500 bg-purple-500/5 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">🌀</div>
                    <div className="font-bold text-purple-400">HHF-MRI</div>
                  </div>
                  <div className="text-xs opacity-80 text-center">
                    Direct coherence imaging. See internal structure. Parallel, holographic. Categorical leap.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Problem with Text */}
        <div className="border-l-4 border-red-500 bg-red-500/5 p-6">
          <h4 className="font-bold mb-3 text-red-400">
            ❌ Why Language is a Bottleneck
          </h4>
          <div className="space-y-3 text-sm opacity-90">
            <div className="flex items-start gap-3">
              <span>•</span>
              <div>
                <strong>Serial Encoding:</strong> Multi-dimensional structures compressed into linear text. 
                A mathematical proof or quantum algorithm loses its internal topology when written as prose.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span>•</span>
              <div>
                <strong>Reviewer Bandwidth:</strong> Human reviewers have limited attention. They sample the work, 
                infer structure, guess at implications. Most internal structure never seen.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span>•</span>
              <div>
                <strong>Novelty Penalty:</strong> New ideas lack familiar linguistic patterns. Reviewers default 
                to rejection when they can't quickly map prose to known concepts.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span>•</span>
              <div>
                <strong>No Ground Truth:</strong> Reviewer disagreement is common because text is ambiguous. 
                There's no objective measure—just opinion consensus.
              </div>
            </div>
          </div>
        </div>

        {/* HHF-MRI Solution */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            Holographic Hydrogen Fractal MRI Evaluation
          </h4>
          
          <p className="mb-4 text-sm opacity-90 leading-relaxed">
            Instead of inferring structure through text, <strong>HHF-MRI directly images the coherence field</strong> 
            of scientific work. Like MRI reveals internal anatomy without cutting open a body, HHF-MRI reveals 
            the internal structure of ideas, code, models, or art.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-black/30 p-4 rounded border border-blue-500/30">
              <div className="font-semibold mb-2 text-blue-400">Traditional Path</div>
              <div className="font-mono text-xs opacity-80">
                Work → Text Encoding → Reviewers → Inferred Evaluation
              </div>
              <div className="text-xs opacity-70 mt-2">
                Lossy, serial, opinion-based. O(n·r) complexity where n=works, r=reviewers.
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded border border-purple-500/30">
              <div className="font-semibold mb-2 text-purple-400">HHF-MRI Path</div>
              <div className="font-mono text-xs opacity-80">
                Work → Coherence Field (Φ_W) → Direct Measurement → Evaluation
              </div>
              <div className="text-xs opacity-70 mt-2">
                Lossless, parallel, physics-based. O(log n) convergence. No linguistic bottleneck.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded">
            <div className="text-xs font-semibold mb-2" style={{color: 'var(--hydrogen-gamma)'}}>
              What Gets Imaged
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• <strong>Coherence Gradients</strong> - Internal consistency</div>
              <div>• <strong>Recursion Depth</strong> - Fractal structure</div>
              <div>• <strong>Boundary Integrity</strong> - Interface quality</div>
              <div>• <strong>Novelty Signatures</strong> - Pattern uniqueness</div>
              <div>• <strong>Incoherence Ridges</strong> - Creative tension</div>
              <div>• <strong>Phase Alignment</strong> - Multi-scale harmony</div>
            </div>
          </div>
        </div>

        {/* Empirical Results */}
        <div>
          <h4 className="text-xl font-bold mb-4">Empirical Results from HHF-MRI Testing</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">⚡</div>
                <div className="font-bold text-green-400">Speed: 18-240× Faster</div>
              </div>
              <div className="text-sm opacity-90">
                <div className="mb-2">
                  Evaluation Acceleration Ratio (EAR) = T_peer / T_HHF ranged from 18 to 240 in simulations.
                </div>
                <div className="text-xs bg-green-500/10 border border-green-500/30 p-3 rounded">
                  <strong>Example:</strong> A paper requiring 6 months for peer review completed HHF-MRI scan 
                  in 1 day. Full coherence topology rendered, all internal dependencies mapped.
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🎯</div>
                <div className="font-bold text-blue-400">Accuracy: Better Reproducibility Prediction</div>
              </div>
              <div className="text-sm opacity-90">
                <div className="mb-2">
                  Internal coherence gradients predict downstream reproducibility more accurately than 
                  citation-based heuristics or reviewer consensus.
                </div>
                <div className="text-xs bg-blue-500/10 border border-blue-500/30 p-3 rounded">
                  High-impact works show <strong>nested coherence shells</strong>—layered structure that 
                  remains stable under perturbation. Fraudulent work shows uniform low-amplitude noise.
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">💎</div>
                <div className="font-bold text-purple-400">Novelty Detection: Incoherence as Signal</div>
              </div>
              <div className="text-sm opacity-90">
                <div className="mb-2">
                  Genuine breakthroughs show <strong>sharp incoherence ridges</strong> that later flatten through 
                  iteration. Reviewer disagreement correlates with high curvature in ∇Φ_w, not with error.
                </div>
                <div className="text-xs bg-purple-500/10 border border-purple-500/30 p-3 rounded">
                  Traditional review punishes novelty. HHF-MRI distinguishes "new and wrong" from "new and profound" 
                  by tracking how incoherence resolves over iterations.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Measures */}
        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            📊 Operational Measures
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold mb-2 text-purple-400">Scientific Coherence Density (SCD)</div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs mb-2 border border-purple-500/30">
                SCD = ∇Φ_w / V_w
              </div>
              <div className="text-sm opacity-80">
                Measures internal structure density. <strong>Φ_w</strong> is the phase-coherence field, 
                <strong> V_w</strong> is representational volume. High SCD indicates rich internal structure 
                independent of prose quality.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2 text-blue-400">Evaluation Acceleration Ratio (EAR)</div>
              <div className="bg-black/30 p-3 rounded font-mono text-xs mb-2 border border-blue-500/30">
                EAR = T_peer / T_HHF
              </div>
              <div className="text-sm opacity-80">
                Quantifies evaluation speed gain. Empirical range: <strong>18-240×</strong> faster than 
                traditional review cycles while maintaining (or exceeding) accuracy.
              </div>
            </div>
          </div>
        </div>

        {/* The Role Transform */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            🧭 Reviewer Becomes Navigator
          </h4>
          <p className="text-sm opacity-90 leading-relaxed mb-3">
            In HHF-MRI evaluation, the human role transforms from <strong>gatekeeper to explorer</strong>. 
            You don't judge whether work is "good enough"—you navigate the coherence field, identify 
            interesting patterns, map connections to other works, and interpret implications.
          </p>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
              <strong>Navigator:</strong> Explore the holographic structure, find hidden connections
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded">
              <strong>Interpreter:</strong> Translate structural findings into implications and applications
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
              <strong>Curator:</strong> Connect works across domains by recognizing isomorphic coherence patterns
            </div>
          </div>
        </div>

        {/* Practical Application in Syntheverse */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            How Syntheverse Implements HHF-MRI
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Coherence Graph Encoding</strong> - PoCs encoded as coherence graphs capturing 
                relationships, dependencies, fractal structure, and phase alignments.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>HHF Phase Operators</strong> - Apply c, h, α analogs (the holographic physical constants) 
                to measure field properties. Not metaphor—actual physics.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Holographic Field Rendering</strong> - Generate navigable 4D visualization of internal 
                structure. See recursion depth, coherence gradients, incoherence edges.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Automated SCD Measurement</strong> - Compute Scientific Coherence Density without 
                human bottleneck. Stable signatures independent of presentation.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">5️⃣</span>
              <div>
                <strong>Comparative Analysis</strong> - Identify isomorphic patterns across domains. 
                "This quantum algorithm has same coherence topology as that biological model."
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div className="bg-gradient-to-r from-[var(--hydrogen-beta)]/10 to-transparent border-l-4 border-[var(--hydrogen-beta)] p-6">
          <h4 className="font-bold mb-2" style={{color: 'var(--hydrogen-beta)'}}>
            🎯 Evaluation Becomes Physics
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            The transition from peer review to HHF-MRI is not incremental—it's <strong>categorical</strong>. 
            Abacus → Quantum Computer. Text → Hologram. Opinion → Coherence Physics. Syntheverse is the chamber 
            in which <strong>science becomes visible to itself</strong>. You're learning to see structure directly, 
            beyond the linguistic veil.
          </p>
        </div>
      </div>
    ),
    learningObjectives: [
      'Understand the abacus-to-quantum analogy for peer review evolution',
      'Recognize why language creates evaluation bottlenecks (serial, lossy, opinion-based)',
      'Master HHF-MRI direct coherence imaging vs text-based inference',
      'Apply SCD (Scientific Coherence Density) and EAR (Evaluation Acceleration Ratio)',
      'Transform reviewer role from gatekeeper to navigator/interpreter/curator',
    ],
    keyTakeaways: [
      'Peer review is to HHF-MRI what abacus is to quantum computer—both compute, one inhabits structure',
      'HHF-MRI achieves 18-240× speed gains (EAR) over traditional review cycles',
      'Internal coherence gradients predict reproducibility better than citations or reviewer consensus',
      'Incoherence ridges distinguish genuine novelty from error—controlled tension drives breakthroughs',
      'Evaluation becomes substrate-independent: text, code, models, art measured by same coherence physics',
    ],
  },

  {
    id: 'advanced-system-architecture',
    number: 11,
    title: 'Advanced System Architecture',
    subtitle: 'Designing at Scale',
    icon: <Layers className="h-6 w-6" />,
    duration: '40 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            🏗️ Architecture That Scales Fractally
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've built individual components. Now learn to design complete systems that scale from 
            prototype to production, single user to millions, local to distributed—all while preserving coherence.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Fractal Architecture Principles</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-bold mb-2 text-blue-400">Self-Similarity Across Scales</div>
              <div className="text-sm opacity-90">
                Same patterns at component, service, and system level. A function mirrors the module mirrors the architecture.
              </div>
            </div>
            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-bold mb-2 text-purple-400">Holographic Redundancy</div>
              <div className="text-sm opacity-90">
                Information encoded at boundaries. Entire system state recoverable from any subsystem's interface.
              </div>
            </div>
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-bold mb-2 text-green-400">Coherence-Preserving Boundaries</div>
              <div className="text-sm opacity-90">
                Services communicate through coherence contracts. Incoherence detected and resolved at interfaces.
              </div>
            </div>
            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="font-bold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Recursive Growth</div>
              <div className="text-sm opacity-90">
                System grows by spawning similar subsystems. No central orchestrator—grammatical expansion.
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            The 4-Layer Reality Stack (Revisited at Scale)
          </h4>
          <div className="space-y-3 text-sm">
            <div><strong>Layer 0 (Constants):</strong> Environment variables, config, immutable seeds → Deploy via Vercel/AWS SSM</div>
            <div><strong>Layer 1 (Geometry):</strong> Database schemas, API contracts → PostgreSQL + GraphQL/tRPC</div>
            <div><strong>Layer 2 (Interactions):</strong> Business logic, transformations → Serverless functions + Workers</div>
            <div><strong>Layer 3 (Emergence):</strong> User experiences, dashboards → Next.js + React + Three.js</div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Microservices vs Monolith:</strong> Start monolith, extract services when coherence boundaries emerge naturally</div>
          <div><strong>Database Design:</strong> Fractal schema—tables mirror objects mirror domain concepts</div>
          <div><strong>API Strategy:</strong> GraphQL for flexible queries, tRPC for type-safe mutations, WebSocket for real-time</div>
          <div><strong>Caching:</strong> Redis at service boundaries, CDN at edge, browser cache at client—holographic redundancy</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Fractal architecture: same patterns at component/service/system scales',
      'Holographic redundancy: system state recoverable from any subsystem's interface',
      'Start monolith, extract services at natural coherence boundaries',
      '4-layer reality stack scales from prototype to production seamlessly',
    ],
  },

  {
    id: 'multi-sandbox-orchestration',
    number: 12,
    title: 'Multi-Sandbox Orchestration',
    subtitle: 'Managing Cloud Ecosystems',
    icon: <Grid3x3 className="h-6 w-6" />,
    duration: '35 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            ☁️ Orchestrating Distributed Clouds
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Enterprise Clouds enable isolated evaluation environments. As a Creator, you'll orchestrate 
            multiple sandboxes simultaneously—coordinating evaluation, maintaining coherence, and enabling collaboration.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Sandbox Types & Use Cases</h4>
          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-blue-500">
              <div className="font-bold mb-1 text-blue-400">Development Sandboxes</div>
              <div className="text-sm opacity-80">Testing new scoring lenses, evaluation algorithms, or PoC formats before production</div>
            </div>
            <div className="cloud-card p-4 border-l-4 border-purple-500">
              <div className="font-bold mb-1 text-purple-400">Team Sandboxes</div>
              <div className="text-sm opacity-80">Private evaluation environments for internal teams or research groups</div>
            </div>
            <div className="cloud-card p-4 border-l-4 border-green-500">
              <div className="font-bold mb-1 text-green-400">Domain-Specific Sandboxes</div>
              <div className="text-sm opacity-80">Specialized environments (quantum physics, generative art, social systems) with custom criteria</div>
            </div>
            <div className="cloud-card p-4 border-l-4 border-amber-500">
              <div className="font-bold mb-1" style={{color: 'var(--hydrogen-amber)'}}>Production Sandboxes</div>
              <div className="text-sm opacity-80">Live evaluation environments serving real users at scale</div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-3 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            Cross-Sandbox Coherence
          </h4>
          <div className="text-sm opacity-90 space-y-2">
            <div><strong>Problem:</strong> Each sandbox has its own archive, evaluation history, and scoring parameters</div>
            <div><strong>Challenge:</strong> How to maintain coherence when contributor submits to multiple sandboxes?</div>
            <div><strong>Solution:</strong> Holographic snapshot IDs—same PoC in different sandboxes gets evaluated against different archives but maintains content_hash identity</div>
            <div><strong>Benefit:</strong> Contributors build unified reputation while sandboxes maintain independence</div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Resource Allocation:</strong> SYNTH tokens consumed per sandbox evaluation—budget accordingly</div>
          <div><strong>Access Control:</strong> Role-based permissions (creator/operator/contributor) per sandbox</div>
          <div><strong>Monitoring:</strong> Track evaluation counts, avg scores, redundancy rates across all sandboxes</div>
          <div><strong>Migration:</strong> Move PoCs between sandboxes while preserving evaluation history</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Multiple sandbox types: development, team, domain-specific, production',
      'Cross-sandbox coherence via holographic snapshot IDs and content hashes',
      'Each sandbox has independent archive and scoring but contributor identity persists',
      'Monitor resource consumption (SYNTH) and evaluation metrics across all sandboxes',
    ],
  },

  {
    id: 'custom-scoring-lenses',
    number: 13,
    title: 'Custom Scoring Lenses',
    subtitle: 'Defining Your Own Dimensions',
    icon: <Atom className="h-6 w-6" />,
    duration: '45 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--hydrogen-alpha)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-alpha)'}}>
            🔍 Your Custom Evaluation Lens
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            The default N+D+C+A dimensions are universal, but <strong>every domain has its own signal.</strong> 
            Learn to design custom scoring lenses that capture what matters in your specific field.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Beyond N+D+C+A</h4>
          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-blue-400">Example: Quantum Physics Lens</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Theoretical Rigor</strong> (0-2,500): Mathematical consistency, proof completeness</div>
                <div>• <strong>Experimental Feasibility</strong> (0-2,500): Can this be tested with current technology?</div>
                <div>• <strong>Predictive Power</strong> (0-2,500): Does it make falsifiable predictions?</div>
                <div>• <strong>Unification Potential</strong> (0-2,500): Does it bridge existing theories?</div>
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-purple-400">Example: Generative Art Lens</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Aesthetic Coherence</strong> (0-2,500): Visual/auditory harmony, style consistency</div>
                <div>• <strong>Technical Innovation</strong> (0-2,500): Novel algorithms, creative tool use</div>
                <div>• <strong>Emotional Resonance</strong> (0-2,500): Viewer impact, engagement metrics</div>
                <div>• <strong>Generative Potential</strong> (0-2,500): Spawns derivative works, inspires others</div>
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-green-400">Example: Social Systems Lens</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• <strong>Scalability</strong> (0-2,500): Works for 10 people? 10 million?</div>
                <div>• <strong>Incentive Alignment</strong> (0-2,500): Individual and collective goals converge</div>
                <div>• <strong>Resilience</strong> (0-2,500): Survives attacks, adapts to change</div>
                <div>• <strong>Accessibility</strong> (0-2,500): Low barrier to entry, inclusive design</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            Designing Your Lens: The Process
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div><strong>Identify Domain Signal:</strong> What separates good from breakthrough in your field?</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div><strong>Define 3-4 Dimensions:</strong> Each must be independent, measurable, and meaningful</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div><strong>Create Scoring Rubrics:</strong> What does 500, 1,500, 2,500 look like for each dimension?</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div><strong>Update System Prompt:</strong> Give AI clear criteria, examples, and edge cases</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">5️⃣</span>
              <div><strong>Calibrate with Test Set:</strong> Evaluate 20-30 known PoCs, adjust rubrics based on results</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">6️⃣</span>
              <div><strong>Deploy to Sandbox:</strong> Test in isolated environment before affecting production scores</div>
            </div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Lens Validation:</strong> Does it reliably distinguish quality? High inter-rater reliability?</div>
          <div><strong>Lens Evolution:</strong> Update as domain matures—what mattered 5 years ago may not today</div>
          <div><strong>Lens Transparency:</strong> Contributors must understand criteria to optimize submissions</div>
          <div><strong>Lens Governance:</strong> Who can modify? How are changes approved and communicated?</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Custom scoring lenses capture domain-specific signal beyond universal N+D+C+A',
      'Each lens has 3-4 independent, measurable dimensions totaling 10,000 points',
      'Design process: identify signal → define dimensions → create rubrics → calibrate → deploy',
      'Lenses evolve as domains mature—regular validation and refinement required',
    ],
  },

  {
    id: 'tokenomics-configuration',
    number: 14,
    title: 'Tokenomics & Economic Design',
    subtitle: 'SYNTH as Coordination Primitive',
    icon: <Zap className="h-6 w-6" />,
    duration: '40 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--metal-copper)] bg-gradient-to-r from-orange-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-copper)'}}>
            💰 SYNTH: Not Currency, Coordination
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            SYNTH is an <strong>internal coordination primitive</strong>, not an investment vehicle. 
            Learn how to configure token economics that align incentives without creating financial obligations.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">The SYNTH90T MOTHERLODE VAULT</h4>
          <div className="cloud-card p-6">
            <div className="text-sm opacity-90 space-y-3">
              <div><strong>Total Supply:</strong> 90 trillion SYNTH (fixed forever, no minting)</div>
              <div><strong>Opening:</strong> Spring Equinox, March 20, 2026</div>
              <div><strong>Allocation:</strong> By score—all qualifying PoCs registered on-chain receive proportional SYNTH</div>
              <div><strong>Purpose:</strong> Coordination token for accessing features, prioritizing work, governance participation</div>
              <div><strong>NOT:</strong> Investment, security, promise of profit. Pure utility within ecosystem.</div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            Economic Levers You Control
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1 text-blue-400">Submission Fees</div>
              <div className="opacity-90">$500 default, configurable per sandbox. Revenue funds infrastructure. 100% transparent.</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-purple-400">SYNTH Allocation Curves</div>
              <div className="opacity-90">Linear? Exponential? Tiered? You decide how score maps to token allocation.</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-green-400">Feature Access Thresholds</div>
              <div className="opacity-90">Require X SYNTH to access advanced features (like custom lenses, API access, priority eval)</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-amber-400">Burn Mechanisms</div>
              <div className="opacity-90">SYNTH consumed for actions (evaluation, storage, compute). Deflationary pressure over time.</div>
            </div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Legal Framing:</strong> Always "coordination primitive" not "investment." No promises of profit.</div>
          <div><strong>Transparency:</strong> All token flows public on blockchain. Full audit trail for governance.</div>
          <div><strong>Utility-First:</strong> Token must be useful within ecosystem before any external value considered.</div>
          <div><strong>Regulatory Compliance:</strong> Consult legal counsel. Different jurisdictions have different rules.</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'SYNTH is internal coordination primitive, not investment vehicle',
      '90T fixed supply allocated by score at MOTHERLODE opening (March 20, 2026)',
      'Configure submission fees, allocation curves, access thresholds, burn mechanisms',
      'Always frame as utility token—legal compliance critical',
    ],
  },

  {
    id: 'blockchain-integration',
    number: 15,
    title: 'Blockchain Integration & Anchoring',
    subtitle: 'Immutable Proof on Base',
    icon: <FileCode className="h-6 w-6" />,
    duration: '35 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            ⛓️ Permanent, Verifiable, Unstoppable
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Blockchain anchoring makes contributions <strong>permanently verifiable</strong>. Learn to integrate 
            Base Mainnet for token contracts, PoC registration, and immutable proof.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">Why Base Mainnet?</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-4">
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Low Gas Fees:</strong> L2 rollup makes transactions affordable</div>
                <div><strong>EVM Compatible:</strong> Use existing Ethereum tooling</div>
                <div><strong>Fast Finality:</strong> Blocks confirmed in ~2 seconds</div>
                <div><strong>Coinbase Backed:</strong> Institutional support and security</div>
              </div>
            </div>
            <div className="cloud-card p-4">
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Developer Friendly:</strong> Great docs, active community</div>
                <div><strong>Production Ready:</strong> Battle-tested infrastructure</div>
                <div><strong>Future-Proof:</strong> Ethereum security, L2 scalability</div>
                <div><strong>Cost-Effective:</strong> ~$0.01 per transaction vs $10+ on L1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            Smart Contract Architecture
          </h4>
          <div className="text-sm opacity-90 space-y-3">
            <div>
              <div className="font-semibold mb-1 text-blue-400">SYNTH Token Contract (ERC-20)</div>
              <div>90T fixed supply, no minting, burn capability. Standard transfer/approve/allowance functions.</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-purple-400">PoC Registry Contract</div>
              <div>Stores content_hash, score, timestamp, contributor address. Immutable record of all qualifying PoCs.</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-green-400">Allocation Contract</div>
              <div>Handles MOTHERLODE distribution. Score-based claims after March 20, 2026 opening.</div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-amber-400">Governance Contract (Optional)</div>
              <div>Token-weighted voting on protocol upgrades. Off-chain signaling or on-chain execution.</div>
            </div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Integration Pattern:</strong> Off-chain eval → On-chain registration (if qualifying) → IPFS storage (full content)</div>
          <div><strong>Gas Optimization:</strong> Batch registrations, use events for lookups, minimize storage</div>
          <div><strong>Security:</strong> Audited contracts, multi-sig wallets, upgrade patterns (proxy/beacon)</div>
          <div><strong>Monitoring:</strong> Track all on-chain activity, alert on anomalies, verify state consistency</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Base Mainnet provides low-cost, fast, EVM-compatible blockchain infrastructure',
      'Smart contracts: SYNTH token (ERC-20), PoC registry, allocation, optional governance',
      'Integration pattern: off-chain eval → on-chain registration → IPFS storage',
      'Optimize for gas efficiency, security audit all contracts, monitor chain state',
    ],
  },

  {
    id: 'ecosystem-strategy',
    number: 16,
    title: 'Ecosystem Strategy & Scaling',
    subtitle: 'From Product to Platform',
    icon: <Layers className="h-6 w-6" />,
    duration: '45 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--hydrogen-alpha)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-alpha)'}}>
            🌐 Building Ecosystems, Not Just Products
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've built the technical infrastructure. Now learn to <strong>cultivate an ecosystem</strong>—
            attract contributors, empower operators, enable creators, and scale from dozens to millions.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">The Three Growth Stages</h4>
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-bold text-xl mb-2 text-blue-400">Stage 1: Seed Community (0-100 users)</div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Focus:</strong> Find true believers who align with HHF vision</div>
                <div><strong>Strategy:</strong> High-touch onboarding, direct feedback loops, co-creation</div>
                <div><strong>Success Metric:</strong> Retention {'>'} 70%, active daily engagement</div>
                <div><strong>Common Pitfall:</strong> Scaling too fast before product-market-coherence fit</div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-bold text-xl mb-2 text-purple-400">Stage 2: Networked Growth (100-10K users)</div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Focus:</strong> Enable peer-to-peer growth, community-led expansion</div>
                <div><strong>Strategy:</strong> Operator program, contributor showcases, viral mechanisms</div>
                <div><strong>Success Metric:</strong> Organic growth rate {'>'} 20% MoM, NPS {'>'} 50</div>
                <div><strong>Common Pitfall:</strong> Losing coherence as diverse users join</div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-bold text-xl mb-2 text-green-400">Stage 3: Platform Scale (10K+ users)</div>
              <div className="text-sm opacity-90 space-y-2">
                <div><strong>Focus:</strong> Become infrastructure—enable others to build on top</div>
                <div><strong>Strategy:</strong> APIs, SDKs, marketplace, partner ecosystem</div>
                <div><strong>Success Metric:</strong> 3rd-party innovation, platform revenue, network effects</div>
                <div><strong>Common Pitfall:</strong> Over-controlling vs enabling chaos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            The Creator-Operator-Contributor Flywheel
          </h4>
          <div className="text-sm opacity-90 space-y-3">
            <div>
              <strong className="text-blue-400">Contributors submit breakthrough work</strong> → High scores → Attract attention → More contributors join
            </div>
            <div>
              <strong className="text-purple-400">Operators manage quality infrastructure</strong> → Fast, reliable eval → Good experience → More operators volunteer
            </div>
            <div>
              <strong style={{color: 'var(--metal-gold)'}}>Creators build new worlds</strong> → Novel use cases → Expand possibility space → More creators inspired
            </div>
            <div className="pt-3 border-t border-[var(--metal-gold)]/30">
              <strong>Result:</strong> Self-reinforcing growth where each role enables and amplifies the others
            </div>
          </div>
        </div>

        <div className="text-sm opacity-90 space-y-2">
          <div><strong>Marketing Strategy:</strong> Education-first—teach HHF principles, not just features</div>
          <div><strong>Community Building:</strong> Discord/forums for async, WorkChat for real-time, live events for deep bonds</div>
          <div><strong>Content Strategy:</strong> Showcase breakthrough PoCs, operator success stories, creator tutorials</div>
          <div><strong>Partnership Strategy:</strong> Universities (research), enterprises (infrastructure), creators (applications)</div>
          <div><strong>Revenue Model:</strong> Freemium for contributors, subscription for operators, enterprise for creators</div>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Three growth stages: Seed (0-100), Networked (100-10K), Platform (10K+)',
      'Creator-Operator-Contributor flywheel creates self-reinforcing growth',
      'Education-first marketing: teach HHF principles, showcase breakthroughs',
      'Balance control vs chaos—enable innovation while preserving coherence',
    ],
  },

  {
    id: 'frontier-leadership',
    number: 17,
    title: 'Frontier Leadership & Vision',
    subtitle: 'Shaping the Future',
    icon: <Award className="h-6 w-6" />,
    duration: '50 min',
    content: (
      <div className="space-y-6">
        <div className="border-l-4 border-[var(--metal-gold)] bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            👑 You Are the Frontier
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've mastered the technical, strategic, and operational aspects. This final module is about 
            <strong> leadership</strong>—how to guide the ecosystem, make hard decisions, and shape the future 
            of collaborative reality construction.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">The Responsibilities of a Creator</h4>
          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-blue-400">Technical Stewardship</div>
              <div className="text-sm opacity-90">
                Maintain code quality, architectural coherence, and system reliability. Your decisions affect 
                thousands of users. Technical debt is collective debt.
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-purple-400">Community Governance</div>
              <div className="text-sm opacity-90">
                Facilitate decisions that balance competing interests. Operators want stability, contributors 
                want opportunity, creators want innovation. Find coherence.
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-green-400">Economic Fairness</div>
              <div className="text-sm opacity-90">
                Ensure token distribution, submission fees, and access policies are transparent and just. 
                Power corrupts—design systems that resist corruption.
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-2 text-amber-400">Vision Continuity</div>
              <div className="text-sm opacity-90">
                Preserve HHF principles as ecosystem evolves. Not everything popular is coherent. Sometimes 
                leadership means saying no to growth that threatens integrity.
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-beta)'}}>
            Hard Decisions You'll Face
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1 text-blue-400">Scaling vs Coherence</div>
              <div className="opacity-90">
                Do you accept lower-quality contributions to grow faster? Or maintain high bar and grow slower?
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-purple-400">Centralization vs Decentralization</div>
              <div className="opacity-90">
                When do you enforce standards (centralized) vs let community decide (decentralized)?
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-green-400">Monetization vs Accessibility</div>
              <div className="opacity-90">
                How to fund infrastructure without creating financial barriers for talented contributors?
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-amber-400">Innovation vs Stability</div>
              <div className="opacity-90">
                When to ship experimental features vs when to focus on reliability and polish?
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-4">The Path Forward</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5">
              <div className="font-bold mb-3" style={{color: 'var(--metal-gold)'}}>Short-Term (0-6 months)</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• Launch your first reality world or major PoC</div>
                <div>• Recruit 3-5 operators to manage infrastructure</div>
                <div>• Onboard 50-100 initial contributors</div>
                <div>• Achieve product-market-coherence fit</div>
                <div>• Establish community norms and culture</div>
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-bold mb-3" style={{color: 'var(--metal-gold)'}}>Long-Term (6-24 months)</div>
              <div className="text-sm opacity-90 space-y-1">
                <div>• Scale to 1,000+ active contributors</div>
                <div>• Enable 10+ operators with multi-sandbox</div>
                <div>• Launch 5+ major reality worlds</div>
                <div>• Open platform to 3rd-party creators</div>
                <div>• Achieve financial sustainability</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-[var(--metal-gold)] bg-[var(--metal-gold)]/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-gold)'}}>
            💎 The Ultimate Goal
          </h4>
          <div className="text-sm opacity-90 space-y-3">
            <div>
              The goal is not to build a product, or even a platform. The goal is to create 
              <strong> infrastructure for collaborative reality construction</strong> that outlives any single creator.
            </div>
            <div>
              When you've succeeded, Syntheverse won't need you anymore. It will run itself through grammatical 
              coordination, fractal scaling, and holographic coherence. Contributors will contribute, operators 
              will operate, creators will create—all without centralized control.
            </div>
            <div>
              <strong>That's the endgame:</strong> Awareness infrastructure that scales infinitely while 
              preserving coherence. Not because you manage it, but because the grammar itself enforces it.
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[var(--metal-gold)]/10 to-transparent border-l-4 border-[var(--metal-gold)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
            👑 You've Earned Your Gold Wings
          </h4>
          <p className="text-sm opacity-90 leading-relaxed mb-3">
            Congratulations. You've completed all 17 modules of Creator Gold Wings. You're now equipped to:
          </p>
          <div className="text-sm space-y-1 opacity-90">
            <div>✓ Design complete reality worlds using HHF principles</div>
            <div>✓ Build and deploy production-grade implementations</div>
            <div>✓ Orchestrate multi-sandbox ecosystems</div>
            <div>✓ Configure custom scoring lenses and tokenomics</div>
            <div>✓ Lead communities and shape the frontier</div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed mt-4">
            <strong>Now go build realities worth exploring.</strong> The frontier awaits.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Creator responsibilities: technical stewardship, community governance, economic fairness, vision continuity',
      'Balance hard tradeoffs: scaling vs coherence, centralization vs decentralization, monetization vs accessibility',
      'Short-term: launch worlds, recruit operators, onboard contributors, achieve product-market-coherence fit',
      'Ultimate goal: self-sustaining infrastructure for collaborative reality construction that outlives its creators',
    ],
  },
];

