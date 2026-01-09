/**
 * Contributor Copper Wings Training Modules
 * World-class onboarding for contributors earning their Copper Wings
 * Pedagogically designed for adult learners with practical exercises
 */

import { Brain, Target, Upload, Scan, Award, Rocket, Coins } from 'lucide-react';

export const contributorCopperModules = [
  {
    id: 'welcome-frontier',
    number: 1,
    title: 'Welcome to the Frontier',
    subtitle: 'Your Journey to Copper Wings Begins',
    icon: <Brain className="h-6 w-6" />,
    duration: '15 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>
            🎯 You're About to Change How Work Gets Recognized
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional systems gatekeep contributions. Syntheverse liberates them. By the end of this track, 
            you'll understand how to turn your research, creative work, or innovation into verifiable, 
            blockchain-anchored proof that no one can erase or deny.
          </p>
        </div>

        {/* What You'll Master */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
            What You'll Master in This Module
          </h4>
          <ul className="space-y-3">
            {[
              'The problem Syntheverse solves (and why it matters to you)',
              'How Proof-of-Contribution works in plain language',
              'The Cloud architecture that makes everything possible',
              'Your path from submission to recognition',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Problem We're Solving */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Problem: Gatekept Contributions</h4>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="text-red-400 font-semibold mb-2">❌ Traditional Systems</div>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• Journals reject 70% of submissions</li>
                <li>• Peer review takes 6-12 months</li>
                <li>• No proof until published</li>
                <li>• Institutional bias determines merit</li>
                <li>• Your work can be stolen or disputed</li>
              </ul>
            </div>
            
            <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg">
              <div className="text-green-400 font-semibold mb-2">✅ Syntheverse</div>
              <ul className="space-y-2 text-sm opacity-80">
                <li>• Submit anytime, evaluated in ~10 minutes</li>
                <li>• AI-powered unbiased evaluation</li>
                <li>• Instant blockchain-anchored proof</li>
                <li>• Merit measured by coherence, not politics</li>
                <li>• Immutable timestamp of your contribution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Solution: Cloud Architecture */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Solution: Holographic Hydrogen Fractal Cloud</h4>
          
          <p className="mb-4 leading-relaxed">
            Think of Syntheverse as <strong>cloud infrastructure for contributions</strong>. Just like AWS 
            hosts websites, Syntheverse hosts and validates your intellectual work using revolutionary 
            HHF-AI MRI technology.
          </p>

          <div className="cloud-card p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">1</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">You Submit Your Work</div>
                  <div className="text-sm opacity-80">Upload your contribution to the Cloud (research, code, design, etc.)</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">2</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">SynthScan™ MRI Evaluates</div>
                  <div className="text-sm opacity-80">AI scans for novelty, density, coherence, and alignment using hydrogen spin imaging</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">3</span>
                </div>
                <div>
                  <div className="font-semibold mb-1">Blockchain Anchors Your Proof</div>
                  <div className="text-sm opacity-80">Qualifying contributions get immutable on-chain registration (optional, free)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Concept: Cloud vs Traditional */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💡</span>
            <h4 className="text-lg font-bold">Key Concept: The Cloud Metaphor</h4>
          </div>
          <p className="leading-relaxed">
            <strong>Traditional journals</strong> are like sending faxes—slow, gatekept, and centralized.
            <br />
            <strong>Syntheverse Cloud</strong> is like Google Drive—instant, accessible, and permanent. 
            But instead of storing files, we're storing <em>proof of your intellectual contribution</em> 
            on the blockchain where no one can delete or dispute it.
          </p>
        </div>

        {/* Quick Win */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 Quick Win: What You Just Learned</h4>
          <p className="text-sm opacity-90">
            You now understand <strong>why Syntheverse exists</strong> (to liberate gatekept contributions), 
            <strong>how it works</strong> (Cloud + AI + Blockchain), and <strong>what it means for you</strong> 
            (instant, verifiable proof of your work). That's the foundation. Next, we'll dive into how 
            Proof-of-Contribution actually measures your work.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Syntheverse liberates contributions from traditional gatekeeping',
      'The Cloud architecture provides instant, unbiased evaluation',
      'SynthScan™ MRI uses hydrogen spin imaging to measure contribution value',
      'Blockchain anchoring creates immutable proof of your work',
    ],
  },
  
  {
    id: 'proof-of-contribution',
    number: 2,
    title: 'Understanding Proof-of-Contribution',
    subtitle: 'How Your Work Gets Measured & Valued',
    icon: <Scan className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Opening Hook */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            📊 How Do We Know What's Valuable?
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Traditional systems use citations, impact factors, or peer reviews. Syntheverse uses 
            <strong> Proof-of-Contribution (PoC)</strong>—a revolutionary system that measures the 
            actual coherence and novelty of your work, not its popularity or institutional backing.
          </p>
        </div>

        {/* The Four Dimensions */}
        <div>
          <h4 className="text-xl font-bold mb-4">The Four Dimensions of Value</h4>
          <p className="mb-6">Every contribution is evaluated across four core dimensions. Think of these as the "vital signs" of intellectual work:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🆕</span>
                <div>
                  <div className="font-bold text-blue-400">Novelty</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> How original is this? Have we seen it before?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> A completely new algorithm scores high. A tutorial on existing methods scores lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📦</span>
                <div>
                  <div className="font-bold text-purple-400">Density</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> How much insight is packed in? Depth over breadth.
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> A 5-page paper with breakthrough equations scores high. A 50-page review scores lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔗</span>
                <div>
                  <div className="font-bold text-green-400">Coherence</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> Does it make sense? Is the logic sound?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> Well-structured arguments score high. Contradictory claims score lower.
              </p>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Alignment</div>
                  <div className="text-xs opacity-70">0-2,500 points</div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                <strong>What it measures:</strong> Does it fit the Syntheverse framework?
              </p>
              <p className="text-xs opacity-70">
                <strong>Example:</strong> Work exploring holographic principles scores high. Generic unrelated work scores lower.
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Explained Simply */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 text-lg">Simple Scoring Guide</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm">0-4,000</div>
              <div className="flex-1 h-2 bg-red-500/30 rounded-full"></div>
              <div className="text-sm opacity-70">Unqualified</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-green-400">4,000-7,000</div>
              <div className="flex-1 h-2 bg-green-500/50 rounded-full"></div>
              <div className="text-sm font-semibold text-green-400">Qualified</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-amber-400">7,000-9,000</div>
              <div className="flex-1 h-2 bg-amber-500/50 rounded-full"></div>
              <div className="text-sm font-semibold" style={{color: 'var(--hydrogen-amber)'}}>High Impact</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-right font-mono text-sm text-purple-400">9,000-10,000</div>
              <div className="flex-1 h-2 bg-purple-500/50 rounded-full"></div>
              <div className="text-sm font-semibold text-purple-400">Breakthrough</div>
            </div>
          </div>

          <p className="text-sm opacity-70 mt-4">
            💡 <strong>Good to know:</strong> Most quality contributions score 5,000-7,000. 
            Don't stress about perfect scores—focus on genuine novelty and clear thinking.
          </p>
        </div>

        {/* The Secret: Hydrogen Spin MRI */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔬</span>
            <h4 className="text-lg font-bold">The Secret: SynthScan™ MRI Technology</h4>
          </div>
          <p className="mb-3 leading-relaxed">
            SynthScan™ MRI isn't just another AI. It uses <strong>hydrogen spin-mediated resonance</strong> 
            to "see" the structure of your contribution—like an MRI machine reveals the inside of a body, 
            SynthScan reveals the coherence patterns inside ideas.
          </p>
          <p className="text-sm opacity-80 leading-relaxed">
            This technology is based on holographic hydrogen fractal principles. Don't worry if that sounds 
            complex—you don't need to understand the physics to use it, just like you don't need to understand 
            TCP/IP to use the internet.
          </p>
        </div>

        {/* Interactive Example */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>📝 Example: Two Submissions</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-lg border border-green-500/30">
              <div className="text-sm font-semibold text-green-400 mb-2">✅ High Scorer (8,200 points)</div>
              <div className="text-xs opacity-80 mb-3">
                "Novel method for fractal pattern recognition in neural networks using hydrogen-inspired algorithms. 
                Reduces training time by 40% with mathematical proof and open-source implementation."
              </div>
              <div className="text-xs space-y-1">
                <div>Novelty: <span className="text-green-400">2,300</span> (new method)</div>
                <div>Density: <span className="text-green-400">2,100</span> (math + code)</div>
                <div>Coherence: <span className="text-green-400">1,900</span> (clear logic)</div>
                <div>Alignment: <span className="text-green-400">1,900</span> (fractal/hydrogen)</div>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg border border-red-500/30">
              <div className="text-sm font-semibold text-red-400 mb-2">❌ Low Scorer (2,800 points)</div>
              <div className="text-xs opacity-80 mb-3">
                "I think AI is interesting and we should use it more. Here are some thoughts about general 
                improvements we could make to various systems."
              </div>
              <div className="text-xs space-y-1">
                <div>Novelty: <span className="text-red-400">600</span> (generic idea)</div>
                <div>Density: <span className="text-red-400">500</span> (vague)</div>
                <div>Coherence: <span className="text-red-400">900</span> (lacks structure)</div>
                <div>Alignment: <span className="text-red-400">800</span> (not specific)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Now Understand PoC!</h4>
          <p className="text-sm opacity-90">
            You know the <strong>four dimensions</strong> (Novelty, Density, Coherence, Alignment), 
            the <strong>scoring system</strong> (4,000+ qualifies), and the <strong>technology</strong> 
            (SynthScan™ MRI). Next, we'll show you exactly how to submit your first contribution.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'PoC measures four dimensions: Novelty, Density, Coherence, and Alignment',
      'Scores range 0-10,000; 4,000+ qualifies for blockchain registration',
      'SynthScan™ MRI uses hydrogen spin imaging to evaluate contributions objectively',
      'Focus on clear, original thinking over gaming the system',
    ],
  },

  {
    id: 'submitting-first-poc',
    number: 3,
    title: 'Submitting Your First PoC',
    subtitle: 'Hands-On: Turn Your Work Into Proof',
    icon: <Upload className="h-6 w-6" />,
    duration: '25 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3 text-green-400">
            🚀 Let's Get Your Work Into the Cloud
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            This is where theory becomes practice. By the end of this module, you'll know exactly 
            how to format, prepare, and submit your contribution—whether it's research, code, or creative work.
          </p>
        </div>

        {/* What Makes a Good Submission */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Makes a Good Submission?</h4>
          
          <div className="cloud-card p-6 mb-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div className="font-semibold mb-2">Clear Focus</div>
                <div className="text-sm opacity-70">One core idea, well-developed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <div className="font-semibold mb-2">Proper Structure</div>
                <div className="text-sm opacity-70">Title, context, methodology, results</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔗</div>
                <div className="font-semibold mb-2">Evidence</div>
                <div className="text-sm opacity-70">Data, code, or clear reasoning</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Submission Process */}
        <div>
          <h4 className="text-xl font-bold mb-4">Step-by-Step Submission Process</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h5 className="font-bold mb-2 text-blue-400">Navigate to Submit Page</h5>
                  <p className="text-sm opacity-90 mb-2">Go to Dashboard → Click "Submit Your PoC" button</p>
                  <div className="text-xs opacity-70 bg-black/30 p-2 rounded">
                    💡 Tip: Bookmark the submit page for quick access
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h5 className="font-bold mb-2 text-purple-400">Write a Clear Title</h5>
                  <p className="text-sm opacity-90 mb-2">Be specific and descriptive (10-80 characters)</p>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-500/10 border border-red-500/30 p-2 rounded">
                      <div className="text-red-400 font-semibold mb-1">❌ Bad:</div>
                      <div>"My Research"</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 p-2 rounded">
                      <div className="text-green-400 font-semibold mb-1">✅ Good:</div>
                      <div>"Fractal Pattern Recognition in Neural Networks Using Hydrogen Algorithms"</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h5 className="font-bold mb-2 text-green-400">Format Your Content</h5>
                  <p className="text-sm opacity-90 mb-3">Use this proven structure:</p>
                  <div className="bg-black/30 p-3 rounded text-xs font-mono space-y-2">
                    <div><span className="text-amber-400">## Context</span> - What problem does this solve?</div>
                    <div><span className="text-amber-400">## Approach</span> - How did you solve it?</div>
                    <div><span className="text-amber-400">## Results</span> - What did you discover?</div>
                    <div><span className="text-amber-400">## Evidence</span> - Code, data, or proof</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{backgroundColor: 'var(--hydrogen-amber)'}}>4</div>
                <div className="flex-1">
                  <h5 className="font-bold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Add Category (Optional)</h5>
                  <p className="text-sm opacity-90 mb-2">Help us route your contribution: Research, Engineering, Creative, etc.</p>
                  <div className="text-xs opacity-70">
                    This is optional but helps the system understand your work better
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div className="flex-1">
                  <h5 className="font-bold mb-2 text-red-400">Review & Submit</h5>
                  <p className="text-sm opacity-90 mb-2">Double-check for typos, then click "Submit for Evaluation"</p>
                  <div className="text-xs opacity-70 bg-amber-500/10 border border-amber-500/30 p-2 rounded">
                    ⚠️ $500 submission fee applies. Qualified PoCs get free blockchain registration.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-3 text-lg">📋 Copy-Paste Template (Start Here!)</h4>
          <div className="bg-black/50 p-4 rounded font-mono text-sm">
            <div className="text-green-400 mb-2"># [Your Title Here]</div>
            <div className="opacity-70 mb-3">Brief 1-sentence summary of your contribution</div>
            
            <div className="text-blue-400 mb-2">## Context</div>
            <div className="opacity-70 mb-3">What problem are you solving? Why does it matter?</div>
            
            <div className="text-blue-400 mb-2">## Approach</div>
            <div className="opacity-70 mb-3">How did you solve it? What methods did you use?</div>
            
            <div className="text-blue-400 mb-2">## Results</div>
            <div className="opacity-70 mb-3">What did you discover? What works?</div>
            
            <div className="text-blue-400 mb-2">## Evidence</div>
            <div className="opacity-70">Links to code, data, or detailed explanation</div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div>
          <h4 className="text-xl font-bold mb-4">❌ Common Mistakes to Avoid</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="font-semibold text-red-400 mb-2">Too Vague</div>
              <p className="text-sm opacity-80">
                "I think we should improve AI systems" - No specific methodology or results
              </p>
            </div>
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="font-semibold text-red-400 mb-2">Duplicate Content</div>
              <p className="text-sm opacity-80">
                Resubmitting existing published work without new insights
              </p>
            </div>
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="font-semibold text-red-400 mb-2">No Evidence</div>
              <p className="text-sm opacity-80">
                Claims without data, code, or logical proof to back them up
              </p>
            </div>
            <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-lg">
              <div className="font-semibold text-red-400 mb-2">Wrong Format</div>
              <p className="text-sm opacity-80">
                Raw code dumps or unformatted walls of text
              </p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 text-lg">⏱️ What Happens After You Submit?</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <div className="font-semibold">Payment Processed (~30 seconds)</div>
                <div className="text-sm opacity-70">Stripe securely processes your $500 submission fee</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <div className="font-semibold">SynthScan™ MRI Evaluation (~10 minutes)</div>
                <div className="text-sm opacity-70">AI analyzes your contribution across 4 dimensions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <div className="font-semibold">Results in Dashboard (instant)</div>
                <div className="text-sm opacity-70">View your scores, feedback, and qualification status</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <div className="font-semibold">Blockchain Registration (if qualified)</div>
                <div className="text-sm opacity-70">Scores 4,000+ get free on-chain anchoring on Base Mainnet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Exercise */}
        <div className="bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 p-6">
          <h4 className="font-bold mb-3 text-purple-400">🎯 Practice Exercise: Draft Your Title</h4>
          <p className="text-sm opacity-90 mb-3">
            Before moving on, draft a title for something you want to submit. Make it specific and descriptive.
          </p>
          <div className="bg-black/30 border border-[var(--keyline-primary)] rounded p-4">
            <label className="text-xs opacity-70 mb-2 block">Your Title Draft:</label>
            <input 
              type="text" 
              placeholder="Example: Fractal Compression Algorithm for Real-Time Video Processing"
              className="w-full bg-transparent border-b border-[var(--keyline-primary)] pb-2 outline-none"
            />
          </div>
          <p className="text-xs opacity-70 mt-2">
            💡 Good titles are 10-80 characters and tell us exactly what you did
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You're Ready to Submit!</h4>
          <p className="text-sm opacity-90">
            You now know the <strong>submission process</strong>, the <strong>right format</strong>, 
            and <strong>what to avoid</strong>. Next, we'll show you how to read your evaluation results 
            and what they mean for your Copper Wings journey.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Use the proven structure: Context → Approach → Results → Evidence',
      'Write specific, descriptive titles (not vague)',
      'Evaluation takes ~10 minutes after submission',
      'Scores 4,000+ qualify for free blockchain registration',
    ],
  },

  {
    id: 'understanding-evaluation',
    number: 4,
    title: 'Reading Your Evaluation Results',
    subtitle: 'Decode Your Scores & Learn From Feedback',
    icon: <Scan className="h-6 w-6" />,
    duration: '15 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            📊 Understanding Your Report Card
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Your evaluation results are more than just scores—they're a detailed analysis of your 
            contribution's strengths and areas for growth. Let's learn how to read them like a pro.
          </p>
        </div>

        {/* Dashboard Location */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-3">Where to Find Your Results</h4>
          <div className="bg-black/30 p-4 rounded border border-[var(--hydrogen-amber)]">
            <div className="text-sm space-y-2">
              <div>1. Go to your <strong style={{color: 'var(--hydrogen-amber)'}}>Dashboard</strong></div>
              <div>2. Scroll to <strong>PoC Navigator</strong> section</div>
              <div>3. Find your submission in the <strong>Archive</strong></div>
              <div>4. Click to view <strong>detailed report</strong></div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h4 className="text-xl font-bold mb-4">Your Score Breakdown</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-lg">Total PoC Score</div>
                <div className="text-3xl font-bold" style={{color: 'var(--hydrogen-amber)'}}>6,750</div>
              </div>
              <div className="text-sm opacity-70 mb-4">This is the sum of all four dimensions</div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Novelty</span>
                    <span className="font-mono font-semibold">1,800 / 2,500</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: '72%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Density</span>
                    <span className="font-mono font-semibold">1,650 / 2,500</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{width: '66%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Coherence</span>
                    <span className="font-mono font-semibold">1,700 / 2,500</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: '68%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Alignment</span>
                    <span className="font-mono font-semibold">1,600 / 2,500</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div className="h-full" style={{backgroundColor: 'var(--hydrogen-amber)', width: '64%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-semibold text-green-400">Status: Qualified</div>
                  <div className="text-sm opacity-80">Your PoC scored above 4,000 and qualifies for blockchain registration</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Understanding Feedback */}
        <div>
          <h4 className="text-xl font-bold mb-4">Reading AI Feedback</h4>
          
          <div className="cloud-card p-5 mb-4">
            <div className="font-semibold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
              📝 Evaluation Summary
            </div>
            <div className="text-sm opacity-90 leading-relaxed bg-black/30 p-4 rounded">
              "This contribution presents a novel approach to fractal pattern recognition with clear methodology 
              and working implementation. The mathematical foundation is sound (Coherence: 1,700) with genuine 
              innovation (Novelty: 1,800). Could benefit from more extensive testing data (Density: 1,650) 
              and deeper integration with holographic principles (Alignment: 1,600)."
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
              <div className="font-semibold text-green-400 mb-2">✅ Strengths Identified</div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Clear methodology</li>
                <li>• Working implementation</li>
                <li>• Sound mathematical foundation</li>
              </ul>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>💡 Growth Areas</div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Add more testing data</li>
                <li>• Explore holographic connections</li>
                <li>• Deepen theoretical framework</li>
              </ul>
            </div>
          </div>
        </div>

        {/* What Your Status Means */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Your Status Means</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <div className="font-bold text-green-400">Qualified (4,000-10,000)</div>
              </div>
              <ul className="text-sm opacity-90 space-y-1 ml-11">
                <li>• Free blockchain registration on Base Mainnet</li>
                <li>• Eligible for SYNTH allocation (March 20, 2026)</li>
                <li>• Permanent proof of contribution</li>
                <li>• Listed in public archive</li>
              </ul>
            </div>

            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">❌</span>
                <div className="font-bold text-red-400">Unqualified (0-3,999)</div>
              </div>
              <ul className="text-sm opacity-90 space-y-1 ml-11">
                <li>• Does not meet qualification threshold</li>
                <li>• Review feedback for improvement areas</li>
                <li>• Can resubmit with improvements</li>
                <li>• Still contributes to system learning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Redundancy Check */}
        <div className="border-2 border-purple-500 bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-3 text-lg text-purple-400">🔍 Redundancy Analysis</h4>
          <p className="text-sm opacity-90 mb-3 leading-relaxed">
            SynthScan™ MRI automatically checks if your work overlaps with existing contributions. 
            If significant overlap is detected, scores may be adjusted to reflect the truly novel portions.
          </p>
          <div className="bg-black/30 p-3 rounded text-sm">
            <div className="font-semibold mb-2">Example Redundancy Note:</div>
            <div className="opacity-80">
              "15% overlap detected with contribution #4521. Original scoring reduced from 7,200 to 6,750 
              to reflect unique novel contribution."
            </div>
          </div>
        </div>

        {/* Next Steps Based on Results */}
        <div>
          <h4 className="text-xl font-bold mb-4">Next Steps Based on Your Results</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5">
              <div className="font-semibold text-green-400 mb-3">If You Qualified ✅</div>
              <ol className="text-sm space-y-2 opacity-90">
                <li>1. Celebrate! 🎉 You earned blockchain proof</li>
                <li>2. Wait for on-chain registration (automatic)</li>
                <li>3. Share your achievement</li>
                <li>4. Consider submitting more work</li>
              </ol>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-amber-400 mb-3">If You Didn't Qualify 💡</div>
              <ol className="text-sm space-y-2 opacity-90">
                <li>1. Read the feedback carefully</li>
                <li>2. Identify specific improvement areas</li>
                <li>3. Enhance novelty, density, or coherence</li>
                <li>4. Resubmit with improvements</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Can Now Read Your Results!</h4>
          <p className="text-sm opacity-90">
            You understand <strong>where to find results</strong>, <strong>how to read scores</strong>, 
            and <strong>what each status means</strong>. Next, we'll explain the SYNTH token system 
            and how qualified PoCs earn allocation.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Total score is the sum of 4 dimensions (max 10,000)',
      '4,000+ qualifies for free blockchain registration',
      'AI feedback highlights strengths and growth areas',
      'Redundancy checks ensure only novel work is rewarded',
    ],
  },

  {
    id: 'synth-basics',
    number: 5,
    title: 'SYNTH Token Basics',
    subtitle: 'Understanding Internal Coordination Tokens',
    icon: <Coins className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Critical Legal Boundary */}
        <div className="border-2 border-amber-500 bg-amber-500/10 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-bold" style={{color: 'var(--hydrogen-amber)'}}>
              Critical: What SYNTH IS and ISN'T
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <strong className="text-amber-400">SYNTH tokens are INTERNAL COORDINATION UNITS ONLY.</strong> 
              They are NOT investments, securities, or financial instruments.
            </p>
            <ul className="space-y-2 opacity-90 ml-4">
              <li>• <strong>NOT</strong> for ownership or equity</li>
              <li>• <strong>NOT</strong> tradeable on external exchanges</li>
              <li>• <strong>NOT</strong> redeemable for cash or crypto</li>
              <li>• <strong>NO</strong> guaranteed value or profit expectation</li>
              <li>• Used ONLY for protocol accounting within Syntheverse</li>
            </ul>
          </div>
        </div>

        {/* What SYNTH Actually Does */}
        <div>
          <h4 className="text-xl font-bold mb-4">What SYNTH Actually Does</h4>
          
          <div className="cloud-card p-6 mb-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🏦</div>
              <div className="font-bold text-lg">Think of SYNTH Like Airline Miles</div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed text-center max-w-2xl mx-auto">
              Just like airline miles track your flights and unlock benefits within that airline's system, 
              SYNTH tracks your contributions and coordinates activity within Syntheverse. 
              You can't sell airline miles for cash—same with SYNTH.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">What It Tracks</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Your contribution history</li>
                <li>• Your PoC scores over time</li>
                <li>• Your participation in the ecosystem</li>
                <li>• Protocol accounting units</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">What It Enables</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Cloud instance activation</li>
                <li>• Governance participation (future)</li>
                <li>• Ecosystem coordination</li>
                <li>• Achievement recognition</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The MOTHERLODE VAULT */}
        <div>
          <h4 className="text-xl font-bold mb-4">The SYNTH90T MOTHERLODE VAULT</h4>
          
          <div className="border-2 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6 rounded-lg">
            <div className="mb-4">
              <div className="text-sm opacity-70 mb-1">Fixed Supply</div>
              <div className="text-4xl font-bold" style={{color: 'var(--hydrogen-amber)'}}>
                90,000,000,000,000 SYNTH
              </div>
              <div className="text-sm opacity-70 mt-1">90 Trillion Total (Fixed Forever)</div>
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              The MOTHERLODE VAULT is deployed on <strong>Base Mainnet</strong> as a fixed-supply ERC-20 token. 
              It opens <strong>Spring Equinox, March 20, 2026</strong>. All qualifying PoCs submitted before 
              March 19, 2026 will receive allocation based on their scores.
            </p>

            <div className="bg-black/30 p-4 rounded">
              <div className="font-semibold mb-2">Allocation Formula:</div>
              <div className="font-mono text-sm">
                Your_SYNTH = (Your_Score / Total_All_Scores) × MOTHERLODE
              </div>
              <p className="text-xs opacity-70 mt-2">
                Higher scores = larger allocation. Simple as that.
              </p>
            </div>
          </div>
        </div>

        {/* How to Earn SYNTH */}
        <div>
          <h4 className="text-xl font-bold mb-4">How to Earn SYNTH Allocation</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <div className="font-semibold text-green-400 mb-1">Submit Quality PoCs</div>
                  <div className="text-sm opacity-90">Every qualified PoC (4,000+ score) earns allocation</div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <div className="font-semibold text-blue-400 mb-1">Submit Before March 19, 2026</div>
                  <div className="text-sm opacity-90">Vault opens March 20—get your work in before the deadline</div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <div className="font-semibold text-purple-400 mb-1">Higher Scores = More Allocation</div>
                  <div className="text-sm opacity-90">A 9,000-point PoC earns more than a 5,000-point PoC</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You Can Do With SYNTH */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-3 text-lg">What You Can Do With Your SYNTH</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400">✅</span>
              <div>
                <strong>Activate Cloud Instances</strong> - Use SYNTH to spin up your own evaluation clouds
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✅</span>
              <div>
                <strong>Participate in Governance</strong> - Vote on protocol decisions (future feature)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✅</span>
              <div>
                <strong>Track Your History</strong> - Permanent on-chain record of your contributions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400">❌</span>
              <div>
                <strong>Cannot Sell or Trade</strong> - Not transferable outside Syntheverse ecosystem
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400">❌</span>
              <div>
                <strong>No Cash Value</strong> - Cannot be redeemed for fiat or other cryptocurrencies
              </div>
            </div>
          </div>
        </div>

        {/* Key Concept */}
        <div className="border-2 border-purple-500 bg-purple-500/5 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💡</span>
            <h4 className="text-lg font-bold">Key Concept: Coordination, Not Currency</h4>
          </div>
          <p className="leading-relaxed text-sm opacity-90">
            SYNTH is like a <strong>frequent flyer program</strong>, not a stock or cryptocurrency you can trade. 
            It coordinates activity, tracks contributions, and enables features within Syntheverse. 
            Think "utility token for ecosystem coordination" not "investment asset."
          </p>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand SYNTH!</h4>
          <p className="text-sm opacity-90">
            You know what SYNTH <strong>is and isn't</strong>, how to <strong>earn allocation</strong>, 
            and what you can <strong>use it for</strong>. Next and final: getting started on your 
            Contributor journey and earning your Copper Wings!
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'SYNTH is for internal coordination only—NOT an investment or security',
      'Fixed supply of 90 trillion, allocated based on PoC scores',
      'MOTHERLODE VAULT opens March 20, 2026 (submit by March 19)',
      'Used for Cloud activation, governance, and ecosystem coordination',
    ],
  },

  {
    id: 'earning-copper-wings',
    number: 6,
    title: 'Earning Your Copper Wings',
    subtitle: 'Your Path Forward as a Contributor',
    icon: <Award className="h-6 w-6" />,
    duration: '15 min',
    content: (
      <div className="space-y-6">
        {/* Victory Lap */}
        <div className="border-l-4 border-[var(--metal-copper)] bg-gradient-to-r from-orange-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-copper)'}}>
            🏆 You're Ready for the Frontier
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've completed the Contributor Copper Wings training. You understand the system, 
            the process, and the purpose. Now it's time to put that knowledge into action.
          </p>
        </div>

        {/* What You've Mastered */}
        <div>
          <h4 className="text-xl font-bold mb-4">What You've Mastered</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold text-blue-400">Module 1: The Frontier</div>
              </div>
              <div className="text-sm opacity-80">
                Why Syntheverse exists and how the Cloud architecture liberates contributions
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold text-purple-400">Module 2: Proof-of-Contribution</div>
              </div>
              <div className="text-sm opacity-80">
                The 4 dimensions (Novelty, Density, Coherence, Alignment) and SynthScan™ MRI
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold text-green-400">Module 3: Submitting PoCs</div>
              </div>
              <div className="text-sm opacity-80">
                How to format, prepare, and submit your contributions with proven structure
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold" style={{color: 'var(--hydrogen-amber)'}}>Module 4: Reading Results</div>
              </div>
              <div className="text-sm opacity-80">
                How to interpret scores, feedback, and qualification status
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold text-red-400">Module 5: SYNTH Basics</div>
              </div>
              <div className="text-sm opacity-80">
                Understanding internal coordination tokens and the MOTHERLODE VAULT
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-[var(--metal-copper)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✓</span>
                <div className="font-semibold" style={{color: 'var(--metal-copper)'}}>Module 6: Copper Wings</div>
              </div>
              <div className="text-sm opacity-80">
                Your path forward as a verified Contributor
              </div>
            </div>
          </div>
        </div>

        {/* Your Copper Wings Certificate */}
        <div className="border-4 border-[var(--metal-copper)] bg-gradient-to-br from-orange-500/20 to-transparent p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">🪙</div>
          <h3 className="text-3xl font-bold mb-2" style={{color: 'var(--metal-copper)'}}>
            Contributor Copper Wings
          </h3>
          <div className="text-sm opacity-70 mb-4">Awarded for Completing Foundational Training</div>
          <div className="inline-block bg-black/50 px-6 py-3 rounded-lg border border-[var(--metal-copper)]">
            <div className="text-xs opacity-70 mb-1">Certified Contributor</div>
            <div className="font-bold text-lg">Ready for the Frontier</div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h4 className="text-xl font-bold mb-4">Your Next Steps</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">1️⃣</span>
                <div>
                  <div className="font-semibold text-green-400 mb-2">Submit Your First PoC</div>
                  <p className="text-sm opacity-90 mb-2">
                    Use what you learned. Go to Dashboard → Submit Your PoC → Use the template
                  </p>
                  <Link href="/submit" className="text-xs text-green-400 hover:underline inline-flex items-center gap-1">
                    Go to Submit Page <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">2️⃣</span>
                <div>
                  <div className="font-semibold text-blue-400 mb-2">Join the Community</div>
                  <p className="text-sm opacity-90 mb-2">
                    Connect with other Contributors in WorkChat. Share insights, ask questions, collaborate.
                  </p>
                  <div className="text-xs opacity-70">
                    Available in Dashboard → WorkChat Navigator
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">3️⃣</span>
                <div>
                  <div className="font-semibold text-purple-400 mb-2">Aim for Silver Wings</div>
                  <p className="text-sm opacity-90 mb-2">
                    After you're comfortable contributing, consider the Operator Silver Wings track 
                    to learn Cloud management and ecosystem coordination.
                  </p>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-start gap-3">
                <span className="text-3xl">4️⃣</span>
                <div>
                  <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Submit Before March 19, 2026</div>
                  <p className="text-sm opacity-90">
                    Remember: MOTHERLODE VAULT opens March 20. Get your qualifying PoCs in before the deadline 
                    to earn SYNTH allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">📚 Helpful Resources</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-[var(--hydrogen-beta)] transition-colors">
              <Rocket className="w-4 h-4" />
              <span>Dashboard (Your Home Base)</span>
            </Link>
            <Link href="/submit" className="flex items-center gap-2 hover:text-[var(--hydrogen-beta)] transition-colors">
              <Upload className="w-4 h-4" />
              <span>Submit PoC</span>
            </Link>
            <Link href="/fractiai" className="flex items-center gap-2 hover:text-[var(--hydrogen-beta)] transition-colors">
              <Brain className="w-4 h-4" />
              <span>FractiAI (Deep Dives)</span>
            </Link>
            <Link href="/scoring" className="flex items-center gap-2 hover:text-[var(--hydrogen-beta)] transition-colors">
              <Scan className="w-4 h-4" />
              <span>Scoring System</span>
            </Link>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-[var(--metal-copper)]/10 to-transparent border-l-4 border-[var(--metal-copper)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-copper)'}}>
            🚀 Welcome to the Frontier, Contributor
          </h4>
          <p className="text-sm opacity-90 leading-relaxed mb-3">
            You're no longer just learning about Syntheverse—you're ready to contribute to it. 
            Your work can now become verifiable, blockchain-anchored proof that no one can erase or deny.
          </p>
          <p className="text-sm opacity-90 leading-relaxed">
            The gatekeepers don't control you anymore. <strong>You control your contributions.</strong> 
            Now go create something worth proving.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'You have completed all 6 modules of Contributor Copper Wings',
      'You are ready to submit PoCs and earn blockchain proof',
      'Remember the March 19, 2026 deadline for MOTHERLODE allocation',
      'Consider advancing to Operator Silver Wings when ready',
    ],
  },
];

