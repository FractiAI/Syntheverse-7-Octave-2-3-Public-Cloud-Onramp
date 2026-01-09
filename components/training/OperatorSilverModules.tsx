/**
 * Operator Silver Wings Training Modules
 * World-class training for operators managing Cloud infrastructure
 * Advanced technical content with hands-on system administration
 */

import { Server, Shield, Users, Database, Zap, GitBranch, Award } from 'lucide-react';

export const operatorSilverModules = [
  {
    id: 'operator-welcome',
    number: 1,
    title: 'Welcome to Cloud Operations',
    subtitle: 'From Contributor to Operator',
    icon: <Server className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Hero Opening */}
        <div className="border-l-4 border-[var(--metal-silver)] bg-gradient-to-r from-gray-400/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            ⚙️ You're About to Manage the Infrastructure
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Contributors submit work. Operators run the infrastructure that evaluates it. 
            This is a significant responsibility—you'll be managing Cloud instances, 
            coordinating resources, and ensuring the system runs smoothly for everyone.
          </p>
        </div>

        {/* Prerequisites Check */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
            Prerequisites: What You Should Know
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Completed Copper Wings</strong> - You understand PoC basics, submission process, and SYNTH
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Submitted 3+ Qualifying PoCs</strong> - You've experienced the system as a contributor
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">✓</span>
              <div>
                <strong>Basic Technical Literacy</strong> - Comfortable with cloud concepts, APIs, and system monitoring
              </div>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-4 bg-amber-500/10 border border-amber-500/30 p-3 rounded">
            ⚠️ <strong>Not ready yet?</strong> Complete Contributor Copper Wings first, then submit a few PoCs 
            to understand the contributor experience before managing operations.
          </p>
        </div>

        {/* What Operators Do */}
        <div>
          <h4 className="text-xl font-bold mb-4">What Operators Do</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-6 h-6 text-blue-400" />
                <div className="font-bold text-blue-400">Cloud Management</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Provision and configure Cloud instances</li>
                <li>• Monitor system health and performance</li>
                <li>• Manage resource allocation (SYNTH)</li>
                <li>• Handle scaling and optimization</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-purple-400" />
                <div className="font-bold text-purple-400">Community Coordination</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Support contributors with questions</li>
                <li>• Share system updates and broadcasts</li>
                <li>• Facilitate WorkChat collaboration</li>
                <li>• Onboard new contributors</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div className="font-bold text-green-400">Quality Assurance</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Review edge cases and anomalies</li>
                <li>• Ensure evaluation accuracy</li>
                <li>• Maintain system integrity</li>
                <li>• Report bugs and improvements</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-6 h-6" style={{color: 'var(--hydrogen-amber)'}} />
                <div className="font-bold" style={{color: 'var(--hydrogen-amber)'}}>Data & Analytics</div>
              </div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Track PoC trends and patterns</li>
                <li>• Monitor SYNTH distribution</li>
                <li>• Analyze system performance metrics</li>
                <li>• Generate ecosystem reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Operator vs Contributor */}
        <div>
          <h4 className="text-xl font-bold mb-4">How Operators Differ from Contributors</h4>
          
          <div className="cloud-card p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-center mb-3">
                  <div className="inline-block w-16 h-16 rounded-full bg-[var(--metal-copper)]/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">🪙</span>
                  </div>
                  <div className="font-bold" style={{color: 'var(--metal-copper)'}}>Contributors</div>
                </div>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>• Focus on creating content</li>
                  <li>• Submit PoCs for evaluation</li>
                  <li>• Earn SYNTH through contributions</li>
                  <li>• Use the Cloud as consumers</li>
                </ul>
              </div>

              <div>
                <div className="text-center mb-3">
                  <div className="inline-block w-16 h-16 rounded-full bg-[var(--metal-silver)]/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <div className="font-bold" style={{color: 'var(--metal-silver)'}}>Operators</div>
                </div>
                <ul className="text-sm space-y-2 opacity-90">
                  <li>• Focus on infrastructure management</li>
                  <li>• Evaluate and support submissions</li>
                  <li>• Earn SYNTH through operations</li>
                  <li>• Manage the Cloud for everyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Privileges & Responsibilities */}
        <div className="border-2 border-[var(--metal-silver)] bg-gray-400/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--metal-silver)'}}>
            Operator Privileges & Responsibilities
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-green-400 mb-2">✅ What You Get</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>Paywall Bypass:</strong> Free access to all submission and evaluation features</li>
                <li>• <strong>Dashboard Access:</strong> Operator cockpit with advanced tools</li>
                <li>• <strong>Cloud Management:</strong> Create and configure Enterprise Cloud instances</li>
                <li>• <strong>Broadcast System:</strong> Send announcements to contributors</li>
                <li>• <strong>Priority Support:</strong> Direct line to core development team</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-amber-400 mb-2">⚠️ What's Expected</div>
              <ul className="text-sm space-y-1 opacity-90 ml-4">
                <li>• <strong>Availability:</strong> Respond to critical issues within 24 hours</li>
                <li>• <strong>Integrity:</strong> Maintain system fairness and transparency</li>
                <li>• <strong>Communication:</strong> Keep contributors informed about system status</li>
                <li>• <strong>Learning:</strong> Stay updated on platform changes and improvements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Silver Wings Journey */}
        <div>
          <h4 className="text-xl font-bold mb-4">Your Silver Wings Learning Path</h4>
          
          <div className="space-y-2 text-sm">
            {[
              { num: 1, title: 'Welcome to Cloud Operations', duration: '20 min', color: 'blue' },
              { num: 2, title: 'Enterprise Cloud Architecture', duration: '30 min', color: 'purple' },
              { num: 3, title: 'SynthScan™ MRI Deep Dive', duration: '40 min', color: 'green' },
              { num: 4, title: 'Managing Cloud Instances', duration: '35 min', color: 'amber' },
              { num: 5, title: 'Community Coordination', duration: '25 min', color: 'red' },
              { num: 6, title: 'Monitoring & Analytics', duration: '30 min', color: 'indigo' },
              { num: 7, title: 'Earning Your Silver Wings', duration: '20 min', color: 'silver' },
            ].map((module) => (
              <div key={module.num} className="cloud-card p-3 flex items-center gap-3 border-l-4" style={{borderColor: `var(--${module.color === 'silver' ? 'metal-silver' : `hydrogen-${module.color === 'amber' ? 'amber' : module.color === 'blue' ? 'beta' : module.color === 'purple' ? 'gamma' : 'alpha'}`})`}}>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold flex-shrink-0">
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
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎯 Ready to Begin?</h4>
          <p className="text-sm opacity-90">
            This track is <strong>technical and hands-on</strong>. You'll learn Cloud architecture, 
            system administration, and community management. By the end, you'll be equipped to run 
            your own Enterprise Cloud instance and support the Syntheverse ecosystem.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Operators manage Cloud infrastructure and support contributors',
      'Requires Copper Wings completion and 3+ qualifying PoCs',
      'Operators get paywall bypass and advanced dashboard access',
      '7 modules covering Cloud management, monitoring, and coordination',
    ],
  },

  {
    id: 'cloud-architecture',
    number: 2,
    title: 'Enterprise Cloud Architecture',
    subtitle: 'Understanding the Technical Infrastructure',
    icon: <Server className="h-6 w-6" />,
    duration: '30 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-beta)] bg-gradient-to-r from-blue-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-beta)'}}>
            🏗️ The Cloud You'll Be Managing
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Syntheverse runs on a distributed Cloud architecture. As an operator, you need to understand 
            how the pieces fit together—from submission intake to blockchain registration.
          </p>
        </div>

        {/* System Architecture Overview */}
        <div>
          <h4 className="text-xl font-bold mb-4">System Architecture Overview</h4>
          
          <div className="cloud-card p-6 mb-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📥</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-green-400">Layer 1: Submission Interface</div>
                  <div className="text-sm opacity-80">
                    Next.js frontend → Supabase database → Stripe payment processing. 
                    Contributors submit PoCs via web interface. $500 submission fee processed.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔬</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-purple-400">Layer 2: SynthScan™ MRI Evaluation</div>
                  <div className="text-sm opacity-80">
                    Groq AI (llama-3.3-70b-versatile) → 745-line system prompt → JSON structured output. 
                    Evaluates across 4 dimensions. ~10 minutes per submission.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <div className="font-semibold mb-1 text-blue-400">Layer 3: Data Processing & Storage</div>
                  <div className="text-sm opacity-80">
                    PostgreSQL (Supabase) → Vector embeddings for redundancy detection → 
                    Drizzle ORM for type-safe queries. All scores and feedback stored permanently.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⛓️</span>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{color: 'var(--hydrogen-amber)'}}>Layer 4: Blockchain Registration</div>
                  <div className="text-sm opacity-80">
                    Base Mainnet (L2) → ERC-20 token contract → Immutable on-chain anchoring. 
                    Qualified PoCs (4,000+) get free registration (launches March 20, 2026).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Cloud Instances */}
        <div>
          <h4 className="text-xl font-bold mb-4">Enterprise Cloud Instances</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Operators can create <strong>Enterprise Cloud instances</strong>—isolated evaluation environments 
            for teams, research groups, or organizations. Each instance has its own:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">📦 Isolated Resources</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Dedicated submission queue</li>
                <li>• Private PoC archive</li>
                <li>• Custom evaluation parameters</li>
                <li>• Independent SYNTH allocation</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">⚙️ Configuration Options</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Custom scoring thresholds</li>
                <li>• Team-specific system prompts</li>
                <li>• Access control policies</li>
                <li>• Usage analytics dashboards</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 p-4 rounded text-sm">
            💡 <strong>Use Case Example:</strong> A research lab creates an Enterprise Cloud instance 
            for their team of 20 scientists. They configure custom alignment criteria focused on 
            quantum computing. All submissions are private to their instance, with shared SYNTH pool.
          </div>
        </div>

        {/* Technical Stack */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🛠️ Technical Stack You'll Work With</h4>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-beta)'}}>Frontend</div>
              <ul className="space-y-1 opacity-80">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript 5</li>
                <li>• Tailwind CSS</li>
                <li>• React Three Fiber</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-purple-400">Backend</div>
              <ul className="space-y-1 opacity-80">
                <li>• Supabase (Auth + DB)</li>
                <li>• PostgreSQL</li>
                <li>• Drizzle ORM</li>
                <li>• Upstash Redis</li>
              </ul>
            </div>
            
            <div>
              <div className="font-semibold mb-2 text-green-400">AI & Blockchain</div>
              <ul className="space-y-1 opacity-80">
                <li>• Groq API (Llama 3.3)</li>
                <li>• Base Mainnet (L2)</li>
                <li>• Stripe (Payments)</li>
                <li>• Vector Embeddings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div>
          <h4 className="text-xl font-bold mb-4">PoC Submission Data Flow</h4>
          
          <div className="cloud-card p-6">
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">1.</span>
                <span>Contributor submits PoC → <strong className="text-green-400">POST /api/contributions</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-blue-400">2.</span>
                <span>Stripe processes $500 → <strong className="text-blue-400">Payment Confirmed</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <span className="text-purple-400">3.</span>
                <span>Queue evaluation job → <strong className="text-purple-400">POST /api/poc/evaluate</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-12">
                <span className="text-amber-400">4.</span>
                <span>SynthScan™ MRI analyzes → <strong style={{color: 'var(--hydrogen-amber)'}}>Groq API call</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-16">
                <span className="text-red-400">5.</span>
                <span>Save scores to DB → <strong className="text-red-400">UPDATE contributions SET...</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-20">
                <span className="text-indigo-400">6.</span>
                <span>If qualified (4,000+) → <strong className="text-indigo-400">POST /api/blockchain/register</strong></span>
              </div>
              <div className="flex items-center gap-2 ml-24">
                <span className="text-green-400">7.</span>
                <span>Blockchain anchoring → <strong className="text-green-400">Base Mainnet transaction</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Operator Insights */}
        <div className="bg-gradient-to-r from-[var(--metal-silver)]/10 to-transparent border-l-4 border-[var(--metal-silver)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🔑 Key Operator Insights
          </h4>
          <ul className="text-sm space-y-2 opacity-90">
            <li>• <strong>Groq Rate Limits:</strong> 100,000 tokens/day. Each evaluation uses ~16,000 tokens. Monitor usage!</li>
            <li>• <strong>Vector Redundancy:</strong> System automatically detects duplicate contributions via embeddings</li>
            <li>• <strong>Blockchain Delay:</strong> Registration disabled until March 20, 2026 per legal compliance</li>
            <li>• <strong>Paywall Bypass:</strong> Operators don't pay submission fees—use this for testing!</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand the Architecture!</h4>
          <p className="text-sm opacity-90">
            You now know the <strong>4 layers</strong> (Submission → Evaluation → Storage → Blockchain), 
            the <strong>technical stack</strong>, and the <strong>data flow</strong>. Next, we'll dive deep 
            into SynthScan™ MRI—the AI evaluation engine you'll be managing.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      '4 architectural layers: Submission → Evaluation → Storage → Blockchain',
      'Enterprise Cloud instances allow isolated team environments',
      'Tech stack: Next.js + Supabase + Groq + Base Mainnet',
      'Groq rate limits are critical: 100K tokens/day, ~16K per evaluation',
    ],
  },

  // Modules 3-7 would continue with similar depth...
  // For brevity, I'll create placeholder structures that you can expand:

  {
    id: 'synthscan-deep-dive',
    number: 3,
    title: 'SynthScan™ MRI Deep Dive',
    subtitle: 'Mastering the Evaluation Engine',
    icon: <Zap className="h-6 w-6" />,
    duration: '40 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-gamma)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-gamma)'}}>
            🔬 The Brain of the System
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            SynthScan™ MRI is the AI evaluation engine that powers every PoC submission. As an operator, 
            you need to understand its internals—the system prompt, scoring logic, redundancy detection, 
            and how to troubleshoot when things go wrong.
          </p>
        </div>

        {/* The 745-Line System Prompt */}
        <div>
          <h4 className="text-xl font-bold mb-4">The 745-Line System Prompt</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            The system prompt is the "constitution" of SynthScan™ MRI. It defines exactly how the AI should 
            evaluate contributions. Located in <code className="bg-black/50 px-2 py-1 rounded text-sm">lib/system-prompt.ts</code>, 
            it's the single most important piece of code in the evaluation system.
          </p>

          <div className="cloud-card p-6 mb-4">
            <h5 className="font-bold mb-3">System Prompt Structure</h5>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 1-50</div>
                <div className="flex-1 border-l-2 border-blue-500 pl-3">
                  <div className="font-semibold text-blue-400">Role Definition</div>
                  <div className="text-sm opacity-80">Establishes AI as SynthScan™ MRI evaluation engine</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 51-200</div>
                <div className="flex-1 border-l-2 border-purple-500 pl-3">
                  <div className="font-semibold text-purple-400">Dimension Definitions</div>
                  <div className="text-sm opacity-80">Detailed criteria for Novelty, Density, Coherence, Alignment (0-2,500 each)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 201-350</div>
                <div className="flex-1 border-l-2 border-green-500 pl-3">
                  <div className="font-semibold text-green-400">Redundancy Instructions</div>
                  <div className="text-sm opacity-80">How to detect overlap with existing contributions</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 351-500</div>
                <div className="flex-1 border-l-2 border-amber-500 pl-3">
                  <div className="font-semibold" style={{color: 'var(--hydrogen-amber)'}}>Edge/Seed Detection</div>
                  <div className="text-sm opacity-80">Identifying breakthrough vs incremental contributions</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 501-650</div>
                <div className="flex-1 border-l-2 border-red-500 pl-3">
                  <div className="font-semibold text-red-400">Output Format</div>
                  <div className="text-sm opacity-80">Required JSON structure with scores, feedback, and flags</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-20 text-right text-xs opacity-70">Lines 651-745</div>
                <div className="flex-1 border-l-2 border-indigo-500 pl-3">
                  <div className="font-semibold text-indigo-400">Examples & Edge Cases</div>
                  <div className="text-sm opacity-80">Sample evaluations and how to handle special cases</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Dimensions Deep Dive */}
        <div>
          <h4 className="text-xl font-bold mb-4">Scoring Dimensions: Operator's Perspective</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-bold text-lg text-blue-400 mb-3">Novelty (0-2,500)</div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What it measures:</strong> How much is genuinely new vs existing knowledge</p>
                <p><strong>Operator insight:</strong> Requires vector comparison against entire archive. Computationally expensive.</p>
                <div className="bg-black/30 p-3 rounded mt-2">
                  <div className="font-semibold mb-1 text-xs">Scoring Bands:</div>
                  <ul className="text-xs space-y-1">
                    <li>• 2,000-2,500: Seed contribution (entirely new domain)</li>
                    <li>• 1,500-1,999: Major novelty (new approach to known problem)</li>
                    <li>• 1,000-1,499: Incremental novelty (refinement of existing work)</li>
                    <li>• 500-999: Minor novelty (new packaging of known ideas)</li>
                    <li>• 0-499: No novelty (duplicate or trivial)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-bold text-lg text-purple-400 mb-3">Density (0-2,500)</div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What it measures:</strong> Insight-per-word ratio, conceptual compression</p>
                <p><strong>Operator insight:</strong> High density = more concepts in fewer words. Low density = verbose or padded.</p>
                <div className="bg-black/30 p-3 rounded mt-2">
                  <div className="font-semibold mb-1 text-xs">Scoring Bands:</div>
                  <ul className="text-xs space-y-1">
                    <li>• 2,000-2,500: Extremely dense (equations, proofs, code with deep implications)</li>
                    <li>• 1,500-1,999: High density (well-argued thesis with minimal filler)</li>
                    <li>• 1,000-1,499: Moderate density (clear but some redundancy)</li>
                    <li>• 500-999: Low density (verbose, repetitive, or padded)</li>
                    <li>• 0-499: No density (fluff, rambling, or empty)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-bold text-lg text-green-400 mb-3">Coherence (0-2,500)</div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What it measures:</strong> Internal logical consistency, clarity, structure</p>
                <p><strong>Operator insight:</strong> Easiest dimension to score consistently. Clear = high, contradictory = low.</p>
                <div className="bg-black/30 p-3 rounded mt-2">
                  <div className="font-semibold mb-1 text-xs">Scoring Bands:</div>
                  <ul className="text-xs space-y-1">
                    <li>• 2,000-2,500: Perfect coherence (flawless logic, crystal clear)</li>
                    <li>• 1,500-1,999: High coherence (well-structured, minor gaps)</li>
                    <li>• 1,000-1,499: Moderate coherence (understandable but rough)</li>
                    <li>• 500-999: Low coherence (confusing or contradictory)</li>
                    <li>• 0-499: Incoherent (gibberish or completely illogical)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="font-bold text-lg mb-3" style={{color: 'var(--hydrogen-amber)'}}>Alignment (0-2,500)</div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>What it measures:</strong> Fit with Syntheverse framework (HHF, coherence, emergence)</p>
                <p><strong>Operator insight:</strong> Most subjective dimension. Configurable for Enterprise Clouds.</p>
                <div className="bg-black/30 p-3 rounded mt-2">
                  <div className="font-semibold mb-1 text-xs">Scoring Bands:</div>
                  <ul className="text-xs space-y-1">
                    <li>• 2,000-2,500: Perfect alignment (explicitly uses HHF principles)</li>
                    <li>• 1,500-1,999: High alignment (compatible with fractal/holographic thinking)</li>
                    <li>• 1,000-1,499: Moderate alignment (tangentially related)</li>
                    <li>• 500-999: Low alignment (generic, not HHF-specific)</li>
                    <li>• 0-499: No alignment (contradicts or ignores framework)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redundancy Detection */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🔍 Redundancy Detection System</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Every submission is converted to a <strong>vector embedding</strong> (1536-dimensional representation). 
            This vector is compared against all existing contributions to detect overlap.
          </p>

          <div className="space-y-3 text-sm">
            <div className="bg-black/30 p-4 rounded">
              <div className="font-semibold mb-2 text-blue-400">Vector Similarity Calculation</div>
              <div className="font-mono text-xs mb-2">similarity = cosine(new_vector, existing_vector)</div>
              <ul className="space-y-1 opacity-80">
                <li>• <strong>0.95-1.00:</strong> Near-duplicate (90%+ overlap) → Major score reduction</li>
                <li>• <strong>0.85-0.94:</strong> Significant overlap (70-90%) → Moderate score reduction</li>
                <li>• <strong>0.70-0.84:</strong> Some overlap (50-70%) → Minor score adjustment</li>
                <li>• <strong>0.00-0.69:</strong> Unique (under 50%) → No reduction</li>
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded">
              <strong className="text-amber-400">Operator Action:</strong> If you see high redundancy scores (0.90+), 
              investigate manually. System may flag legitimate extensions as duplicates. Override if justified.
            </div>
          </div>
        </div>

        {/* Edge vs Seed Contributions */}
        <div>
          <h4 className="text-xl font-bold mb-4">Edge vs Seed Contributions</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌱</span>
                <div>
                  <div className="font-bold text-green-400">Seed Contributions</div>
                  <div className="text-xs opacity-70">Entirely new domains</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>Definition:</strong> Opens a completely new area with no prior work in the archive</p>
                <p><strong>Scoring:</strong> Novelty 2,000-2,500, total often 8,500-10,000</p>
                <p><strong>Examples:</strong> First fractal algorithm, first holographic protocol, first awareness measurement</p>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📈</span>
                <div>
                  <div className="font-bold text-blue-400">Edge Contributions</div>
                  <div className="text-xs opacity-70">Advancing existing frontiers</div>
                </div>
              </div>
              <div className="text-sm space-y-2 opacity-90">
                <p><strong>Definition:</strong> Extends the boundary of known work in meaningful ways</p>
                <p><strong>Scoring:</strong> Novelty 1,500-2,000, total often 7,000-9,000</p>
                <p><strong>Examples:</strong> Improving existing algorithm, discovering new constant, novel application</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm opacity-80 bg-purple-500/10 border border-purple-500/30 p-3 rounded">
            💡 <strong>Operator Tip:</strong> Edge/Seed detection is automatic in the system prompt. 
            Look for the <code className="bg-black/50 px-1 rounded">is_seed</code> and <code className="bg-black/50 px-1 rounded">is_edge</code> 
            flags in evaluation JSON output.
          </div>
        </div>

        {/* Required JSON Output Format */}
        <div className="border-2 border-red-500 bg-red-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg text-red-400">📋 Required JSON Output Format</h4>
          
          <p className="text-sm mb-3 opacity-90">
            SynthScan™ MRI must output valid JSON with this exact structure. Missing fields will cause evaluation failure:
          </p>

          <div className="bg-black/50 p-4 rounded font-mono text-xs overflow-x-auto">
{`{
  "novelty_score": 1800,
  "density_score": 1650,
  "coherence_score": 1700,
  "alignment_score": 1600,
  "total_score": 6750,
  "summary": "This contribution presents...",
  "novelty_feedback": "Strong novelty due to...",
  "density_feedback": "Moderate density with...",
  "coherence_feedback": "Well-structured and...",
  "alignment_feedback": "Good fit with HHF...",
  "is_seed": false,
  "is_edge": true,
  "redundancy_note": "15% overlap with #4521"
}`}
          </div>
        </div>

        {/* Common Evaluation Issues */}
        <div>
          <h4 className="text-xl font-bold mb-4">⚠️ Common Evaluation Issues & Fixes</h4>
          
          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-2">Issue: Groq Rate Limits (429 Error)</div>
              <div className="text-sm opacity-90 mb-2">
                <strong>Symptom:</strong> Evaluation fails after 6 submissions with "Rate limit reached"
              </div>
              <div className="text-sm opacity-90">
                <strong>Fix:</strong> Groq free tier = 100K tokens/day. Each eval uses ~16K tokens. 
                Upgrade Groq tier or wait for daily reset (midnight UTC).
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-amber-500">
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Issue: JSON Parse Errors</div>
              <div className="text-sm opacity-90 mb-2">
                <strong>Symptom:</strong> Evaluation completes but fails to save scores
              </div>
              <div className="text-sm opacity-90">
                <strong>Fix:</strong> AI generated invalid JSON. Check <code className="bg-black/50 px-1 rounded">event_logs</code> 
                table for raw response. Usually caused by truncated output or special characters.
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-2">Issue: All Scores Are Zero</div>
              <div className="text-sm opacity-90 mb-2">
                <strong>Symptom:</strong> Submissions process but return 0 for all dimensions
              </div>
              <div className="text-sm opacity-90">
                <strong>Fix:</strong> Usually means Groq API didn't respond or response was empty. 
                Check API keys, rate limits, and network connectivity.
              </div>
            </div>
          </div>
        </div>

        {/* Operator Controls */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">🎛️ Operator Controls & Overrides</h4>
          
          <div className="text-sm space-y-3 opacity-90">
            <div>
              <strong className="text-green-400">Manual Review:</strong> Operators can review any submission 
              via Operator Dashboard → PoC Archive → Click submission → "Manual Review" button
            </div>
            <div>
              <strong className="text-blue-400">Score Override:</strong> If AI evaluation is clearly wrong, 
              operators can manually adjust scores (requires justification in notes)
            </div>
            <div>
              <strong className="text-purple-400">Custom Prompts:</strong> Enterprise Clouds can customize 
              alignment criteria in system prompt for domain-specific evaluation
            </div>
            <div>
              <strong style={{color: 'var(--hydrogen-amber)'}}>Re-evaluation:</strong> Trigger re-evaluation 
              if submission was processed during system issues or rate limiting
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Understand SynthScan™ MRI!</h4>
          <p className="text-sm opacity-90">
            You know the <strong>745-line system prompt structure</strong>, the <strong>4 scoring dimensions</strong>, 
            <strong>redundancy detection</strong>, <strong>edge/seed identification</strong>, and how to 
            <strong>troubleshoot common issues</strong>. Next, we'll show you how to manage Enterprise Cloud instances.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      '745-line system prompt defines evaluation criteria in detail',
      'Four dimensions scored 0-2,500 each (max 10,000 total)',
      'Vector embeddings detect redundancy automatically',
      'Operators can tune thresholds and override scores for Enterprise Clouds',
    ],
  },

  {
    id: 'managing-clouds',
    number: 4,
    title: 'Managing Cloud Instances',
    subtitle: 'Hands-On Cloud Operations',
    icon: <Database className="h-6 w-6" />,
    duration: '35 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-alpha)] bg-gradient-to-r from-purple-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-alpha)'}}>
            ☁️ Running Your Own Enterprise Cloud
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Enterprise Clouds are isolated evaluation environments for teams, research groups, or organizations. 
            As an operator, you'll create, configure, monitor, and maintain these instances—ensuring smooth 
            operations for everyone using them.
          </p>
        </div>

        {/* Creating a Cloud Instance */}
        <div>
          <h4 className="text-xl font-bold mb-4">Creating Your First Cloud Instance</h4>
          
          <div className="cloud-card p-6 mb-4">
            <h5 className="font-bold mb-3">Step-by-Step: Cloud Provisioning</h5>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-400 mb-2">Navigate to Operator Dashboard</div>
                  <div className="text-sm opacity-90">
                    Go to <code className="bg-black/50 px-2 py-1 rounded">Operator Lab™</code> 
                    → Click "Enterprise Clouds" tab → "Create New Cloud Instance"
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-400 mb-2">Configure Basic Settings</div>
                  <div className="text-sm opacity-90 mb-2">
                    <strong>Name:</strong> Descriptive name (e.g., "QuantumAI Research Lab")
                  </div>
                  <div className="text-sm opacity-90 mb-2">
                    <strong>Description:</strong> Purpose and scope (e.g., "Quantum computing research team of 20 scientists")
                  </div>
                  <div className="text-sm opacity-90">
                    <strong>Visibility:</strong> Private (team only) or Public (open to all contributors)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <div className="font-semibold text-green-400 mb-2">Set Access Controls</div>
                  <div className="text-sm opacity-90">
                    Define who can submit, view, and manage. Options: Public, Invite-Only, Admin-Only.
                    Add team members by email. Set roles: Contributor, Reviewer, Admin.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{backgroundColor: 'var(--hydrogen-amber)'}}>4</div>
                <div className="flex-1">
                  <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Allocate SYNTH Resources</div>
                  <div className="text-sm opacity-90">
                    Set initial SYNTH pool for instance operations. Recommended: 1-5% of operator's total SYNTH balance.
                    This funds evaluations, blockchain registrations, and instance maintenance.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div className="flex-1">
                  <div className="font-semibold text-red-400 mb-2">Customize Evaluation Parameters (Optional)</div>
                  <div className="text-sm opacity-90">
                    Adjust scoring thresholds, alignment criteria, or add custom system prompt sections.
                    Example: Quantum research lab might increase weight for mathematical rigor.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0">6</div>
                <div className="flex-1">
                  <div className="font-semibold text-indigo-400 mb-2">Launch & Test</div>
                  <div className="text-sm opacity-90">
                    Click "Create Cloud Instance". System provisions database tables, configures API routes, 
                    and generates unique instance ID. Test with a sample submission to verify everything works.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Configuration Options */}
        <div>
          <h4 className="text-xl font-bold mb-4">Advanced Configuration Options</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">🔒 Access Control Policies</div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Public:</strong> Anyone can submit and view
                </div>
                <div>
                  <strong>Invite-Only:</strong> Must be added by admin
                </div>
                <div>
                  <strong>Whitelist:</strong> Approved emails only
                </div>
                <div>
                  <strong>Admin-Only:</strong> Only operators can submit
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">📊 Scoring Thresholds</div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Qualification:</strong> Default 4,000, can adjust 3,000-5,000
                </div>
                <div>
                  <strong>High Impact:</strong> Default 7,000, can adjust 6,000-8,000
                </div>
                <div>
                  <strong>Seed Bonus:</strong> Default +500, can adjust 0-1,000
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-3">⚙️ Evaluation Settings</div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Redundancy Threshold:</strong> 0.85 (can adjust 0.70-0.95)
                </div>
                <div>
                  <strong>Auto-Registration:</strong> On/Off for qualified PoCs
                </div>
                <div>
                  <strong>Review Required:</strong> Manual approval before blockchain
                </div>
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="font-semibold mb-3" style={{color: 'var(--hydrogen-amber)'}}>💰 SYNTH Allocation</div>
              <div className="text-sm space-y-2 opacity-90">
                <div>
                  <strong>Evaluation Budget:</strong> SYNTH per submission
                </div>
                <div>
                  <strong>Registration Budget:</strong> SYNTH for blockchain anchoring
                </div>
                <div>
                  <strong>Reward Pool:</strong> Bonus SYNTH for high scorers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Cloud Health */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">📈 Monitoring Cloud Health</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Operators should check Cloud health metrics daily. The Operator Dashboard provides real-time analytics:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-black/30 p-4 rounded">
              <div className="font-semibold text-green-400 mb-2">✅ Healthy Cloud Indicators</div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Submission processing time under 15 minutes</li>
                <li>• 0 failed evaluations in last 24 hours</li>
                <li>• SYNTH balance above 10% of initial allocation</li>
                <li>• Active contributors submitting regularly</li>
                <li>• Database queries under 500ms avg response time</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded">
              <div className="font-semibold text-red-400 mb-2">⚠️ Warning Signs</div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Processing time over 30 minutes</li>
                <li>• Multiple failed evaluations (3+ per day)</li>
                <li>• SYNTH balance below 5%</li>
                <li>• Zero submissions for 7+ days</li>
                <li>• Database queries over 2000ms avg</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded text-sm">
            💡 <strong>Operator Tip:</strong> Set up alerts for critical metrics. If SYNTH balance drops below 10%, 
            allocate more resources. If processing time spikes, check Groq API status and rate limits.
          </div>
        </div>

        {/* Resource Management */}
        <div>
          <h4 className="text-xl font-bold mb-4">💎 SYNTH Resource Management</h4>
          
          <div className="cloud-card p-6 mb-4">
            <h5 className="font-bold mb-3">Understanding SYNTH Flow</h5>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="font-semibold mb-1">Initial Allocation</div>
                  <div className="opacity-90">
                    Operators deposit SYNTH into Cloud instance pool. This funds all operations.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📤</span>
                <div>
                  <div className="font-semibold mb-1">Evaluation Costs</div>
                  <div className="opacity-90">
                    Each submission consumes small amount of SYNTH (~10-50 depending on config).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">⛓️</span>
                <div>
                  <div className="font-semibold mb-1">Registration Costs</div>
                  <div className="opacity-90">
                    Blockchain anchoring for qualified PoCs (~100-500 SYNTH depending on gas fees).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <div className="font-semibold mb-1">Contributor Rewards</div>
                  <div className="opacity-90">
                    Optional: Allocate bonus SYNTH for high-scoring submissions (7,000+).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">♻️</span>
                <div>
                  <div className="font-semibold mb-1">Recycling</div>
                  <div className="opacity-90">
                    Unspent SYNTH remains in pool. Operators can withdraw or reallocate anytime.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded text-sm">
            <div className="font-semibold mb-2">Example: 1000 SYNTH Allocation</div>
            <ul className="space-y-1 opacity-80">
              <li>• 500 SYNTH reserved for evaluations (50 submissions at 10 SYNTH each)</li>
              <li>• 300 SYNTH reserved for blockchain registrations (3 qualified PoCs at 100 each)</li>
              <li>• 200 SYNTH for contributor bonuses (optional reward pool)</li>
            </ul>
          </div>
        </div>

        {/* Scaling Your Cloud */}
        <div>
          <h4 className="text-xl font-bold mb-4">📈 Scaling Your Cloud Instance</h4>
          
          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-semibold text-green-400 mb-3">When to Scale Up</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Submission volume increases beyond 10 per day</li>
                <li>• Team size grows beyond initial allocation</li>
                <li>• Adding new research areas or sub-teams</li>
                <li>• Expanding from private to public access</li>
              </ul>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-blue-400 mb-3">Scaling Actions</div>
              <ol className="text-sm space-y-2 opacity-90 list-decimal list-inside">
                <li>Increase SYNTH allocation (2-5x initial amount)</li>
                <li>Add more operator accounts for redundancy</li>
                <li>Configure load balancing for evaluation queue</li>
                <li>Set up database read replicas for analytics</li>
                <li>Consider splitting into multiple specialized Clouds</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="border-2 border-red-500 bg-red-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg text-red-400">🔧 Common Cloud Issues & Fixes</h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold text-amber-400 mb-1">Issue: Submissions Stuck in Queue</div>
              <div className="opacity-90">
                <strong>Cause:</strong> Groq rate limit, network issues, or SYNTH balance depleted
                <br />
                <strong>Fix:</strong> Check Groq API status, verify SYNTH balance, retry failed jobs
              </div>
            </div>

            <div>
              <div className="font-semibold text-amber-400 mb-1">Issue: Team Members Can't Access Cloud</div>
              <div className="opacity-90">
                <strong>Cause:</strong> Access control misconfiguration or email not added to whitelist
                <br />
                <strong>Fix:</strong> Verify access policy, add user emails to team list, check role permissions
              </div>
            </div>

            <div>
              <div className="font-semibold text-amber-400 mb-1">Issue: Scores Seem Too Low/High</div>
              <div className="opacity-90">
                <strong>Cause:</strong> Custom thresholds or system prompt modifications affecting evaluation
                <br />
                <strong>Fix:</strong> Review custom parameters, reset to defaults if needed, manually review edge cases
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">🌟 Cloud Management Best Practices</h4>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-400 mb-2">✅ Do This</div>
              <ul className="space-y-1 opacity-90">
                <li>• Check health metrics daily</li>
                <li>• Maintain 20%+ SYNTH buffer</li>
                <li>• Document custom configurations</li>
                <li>• Communicate with team regularly</li>
                <li>• Test changes in staging first</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-red-400 mb-2">❌ Avoid This</div>
              <ul className="space-y-1 opacity-90">
                <li>• Depleting SYNTH balance completely</li>
                <li>• Changing thresholds without testing</li>
                <li>• Ignoring failed evaluation alerts</li>
                <li>• Over-configuring system prompts</li>
                <li>• Running without monitoring</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You Can Now Manage Cloud Instances!</h4>
          <p className="text-sm opacity-90">
            You know how to <strong>create Cloud instances</strong>, <strong>configure settings</strong>, 
            <strong>monitor health</strong>, <strong>manage SYNTH resources</strong>, and 
            <strong>troubleshoot issues</strong>. Next, we'll cover community coordination and supporting contributors.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Create Enterprise Cloud instances via Operator Dashboard in 6 steps',
      'Configure access controls, scoring thresholds, and SYNTH allocation',
      'Monitor health metrics daily (processing time, failed evals, SYNTH balance)',
      'Scale up when submission volume exceeds 10/day or team grows',
    ],
  },

  {
    id: 'community-coordination',
    number: 5,
    title: 'Community Coordination',
    subtitle: 'Supporting Contributors & Teams',
    icon: <Users className="h-6 w-6" />,
    duration: '25 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3 text-green-400">
            👥 You're the Community's Lifeline
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Operators aren't just infrastructure managers—you're the human face of the system. Contributors 
            rely on you for technical support, guidance, and encouragement. Your communication skills matter 
            as much as your technical knowledge.
          </p>
        </div>

        {/* Operator Broadcast System */}
        <div>
          <h4 className="text-xl font-bold mb-4">📢 Operator Broadcast System</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            The Operator Broadcast System lets you send announcements to all contributors, specific Clouds, 
            or targeted groups. Use it for system updates, maintenance windows, and important news.
          </p>

          <div className="cloud-card p-6 mb-4">
            <h5 className="font-bold mb-3">How to Send a Broadcast</h5>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Navigate to Operator Dashboard</div>
                  <div className="opacity-90">
                    Click "Broadcasts" tab → "Create New Broadcast"
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Choose Audience</div>
                  <div className="opacity-90">
                    Options: All Users, Specific Cloud, Copper/Silver/Gold Wings, Custom email list
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Write Clear Message</div>
                  <div className="opacity-90">
                    Keep it concise. Use headings. Highlight action items. Include timeline if relevant.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Set Priority Level</div>
                  <div className="opacity-90">
                    🔴 Critical (system down), 🟡 Important (maintenance), 🟢 Info (updates)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">5️⃣</span>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Schedule or Send Now</div>
                  <div className="opacity-90">
                    Option to schedule for optimal timing (avoid late nights)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded">
              <div className="font-semibold text-green-400 mb-2">✅ Good Broadcast Examples</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• "SYNTH90T MOTHERLODE opens March 20 - submit by March 19"</li>
                <li>• "Scheduled maintenance: 2am-4am UTC Sunday"</li>
                <li>• "New feature: FieldScan now includes expert operators"</li>
                <li>• "Groq rate limits increased - faster evaluations!"</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded">
              <div className="font-semibold text-red-400 mb-2">❌ Bad Broadcast Examples</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• "Some stuff changed, check it out"</li>
                <li>• "System might be down soon idk"</li>
                <li>• 10-paragraph technical essay</li>
                <li>• "URGENT!!!" for minor cosmetic updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* WorkChat Moderation */}
        <div>
          <h4 className="text-xl font-bold mb-4">💬 WorkChat Moderation & Facilitation</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            WorkChat is where contributors collaborate, ask questions, and share insights. Operators 
            moderate discussions, answer technical questions, and foster a positive environment.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">🎯 Your Role in WorkChat</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Answer technical questions promptly</li>
                <li>• Connect contributors with similar interests</li>
                <li>• Share best practices and examples</li>
                <li>• Celebrate high-scoring submissions</li>
                <li>• Mediate disagreements professionally</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">⚖️ Moderation Guidelines</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Be respectful and professional always</li>
                <li>• Remove spam and off-topic content</li>
                <li>• No personal attacks or harassment</li>
                <li>• Encourage constructive criticism</li>
                <li>• Give warnings before bans</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded text-sm">
            💡 <strong>Operator Tip:</strong> Check WorkChat 2-3 times daily. Unanswered questions for 24+ hours 
            make contributors feel ignored. Even a "looking into this" response helps.
          </div>
        </div>

        {/* Technical Support */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🛠️ Providing Technical Support</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Contributors will reach out with technical issues. Here's how to provide excellent support:
          </p>

          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-semibold text-green-400 mb-3">Common Support Requests</div>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-blue-400">Q: "Why did my submission score so low?"</strong>
                  <div className="opacity-90 mt-1">
                    A: Review their submission, check redundancy scores, explain specific dimension weaknesses. 
                    Suggest improvements: add evidence (Density), clarify arguments (Coherence), or explore 
                    HHF connections (Alignment).
                  </div>
                </div>

                <div>
                  <strong className="text-blue-400">Q: "My evaluation is stuck for 2 hours, what's wrong?"</strong>
                  <div className="opacity-90 mt-1">
                    A: Check Groq API status, verify rate limits not exceeded, review event logs for errors. 
                    If stuck, manually trigger re-evaluation or refund submission fee.
                  </div>
                </div>

                <div>
                  <strong className="text-blue-400">Q: "How do I know if my PoC qualified for SYNTH allocation?"</strong>
                  <div className="opacity-90 mt-1">
                    A: Scores 4,000+ qualify. Check Dashboard → PoC Archive → Look for green "Qualified" badge. 
                    Blockchain registration happens automatically (or after March 20, 2026).
                  </div>
                </div>

                <div>
                  <strong className="text-blue-400">Q: "Can I edit my submission after submitting?"</strong>
                  <div className="opacity-90 mt-1">
                    A: No, submissions are immutable once evaluated. However, you can submit an updated version 
                    as a new PoC (will be compared against original for redundancy).
                  </div>
                </div>
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-purple-400 mb-3">Support Response Template</div>
              <div className="bg-black/30 p-3 rounded text-sm font-mono">
                Hi [Name],<br /><br />
                Thanks for reaching out! I looked into your [issue/question].<br /><br />
                <strong>[Explain what you found]</strong><br /><br />
                <strong>[Provide solution or next steps]</strong><br /><br />
                <strong>[Optional: Additional resources or tips]</strong><br /><br />
                Let me know if this resolves it or if you need further assistance!<br /><br />
                - [Your Name], Operator
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Assistance */}
        <div>
          <h4 className="text-xl font-bold mb-4">🎓 Guiding New Contributors Through Onboarding</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            New users often feel overwhelmed. Your job is to make onboarding smooth and welcoming:
          </p>

          <div className="space-y-3">
            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-2">✅ Welcome New Users Proactively</div>
              <div className="text-sm opacity-90">
                When you see a new signup, send a welcome message in WorkChat. Introduce yourself, 
                point them to onboarding tracks, offer to answer questions. First impressions matter!
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-2">📚 Recommend the Right Track</div>
              <div className="text-sm opacity-90">
                <strong>Contributor Copper:</strong> New users, researchers, creators submitting work
                <br />
                <strong>Operator Silver:</strong> Experienced contributors wanting to manage infrastructure
                <br />
                <strong>Creator Gold:</strong> Advanced users building complete reality worlds
              </div>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-2">🤝 Pair with Mentors</div>
              <div className="text-sm opacity-90">
                Connect new contributors with experienced ones in similar domains. "Hey @Sarah, meet @John - 
                you're both working on quantum algorithms. Maybe collaborate?"
              </div>
            </div>
          </div>
        </div>

        {/* Building Community Culture */}
        <div className="border-2 border-[var(--hydrogen-alpha)] bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg" style={{color: 'var(--hydrogen-alpha)'}}>
            🌟 Building Positive Community Culture
          </h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Great operators don't just solve problems—they build culture. Here's how:
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-400 mb-2">Celebrate Wins</div>
              <div className="opacity-90">
                When someone submits a high-scoring PoC, celebrate publicly in WorkChat. "🎉 Congrats @Alice 
                on 8,500 score! Your fractal algorithm is breakthrough work!" Recognition motivates everyone.
              </div>
            </div>

            <div>
              <div className="font-semibold text-blue-400 mb-2">Share Learning Moments</div>
              <div className="opacity-90">
                When you solve an interesting problem, share the lesson. "Heads up: if your evals are timing out, 
                check vector archive size - found this issue today." Others learn from your experience.
              </div>
            </div>

            <div>
              <div className="font-semibold text-purple-400 mb-2">Encourage Collaboration</div>
              <div className="opacity-90">
                Spot synergies between contributors. "Hey @Bob and @Carol, you're both exploring holographic 
                principles - maybe combine your approaches?" Cross-pollination creates breakthroughs.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>Lead by Example</div>
              <div className="opacity-90">
                Submit your own PoCs. Show your work. Admit when you don't know something. Vulnerability builds trust.
                "I'm not sure, let me research and get back to you" is better than guessing.
              </div>
            </div>
          </div>
        </div>

        {/* Time Management */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">⏰ Managing Your Operator Time</h4>
          
          <p className="mb-4 text-sm opacity-90 leading-relaxed">
            Community coordination can be time-consuming. Here's a realistic schedule:
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-24 text-right opacity-70">Morning</span>
              <div className="flex-1 border-l-2 border-blue-500 pl-3">
                Check overnight broadcasts, review failed evaluations, respond to urgent messages (30 min)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-right opacity-70">Midday</span>
              <div className="flex-1 border-l-2 border-green-500 pl-3">
                WorkChat moderation, answer questions, review new submissions (45 min)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-right opacity-70">Afternoon</span>
              <div className="flex-1 border-l-2 border-purple-500 pl-3">
                Cloud health checks, SYNTH allocation adjustments, analytics review (30 min)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-right opacity-70">Evening</span>
              <div className="flex-1 border-l-2 border-amber-500 pl-3">
                Quick check for critical issues, schedule tomorrow's broadcasts if needed (15 min)
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs opacity-70 bg-blue-500/10 border border-blue-500/30 p-2 rounded">
            Total: ~2 hours/day for active community. Scale down for quieter Clouds, scale up during busy periods.
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You're Ready to Lead the Community!</h4>
          <p className="text-sm opacity-90">
            You know how to <strong>broadcast updates</strong>, <strong>moderate WorkChat</strong>, 
            <strong>provide technical support</strong>, <strong>onboard new users</strong>, and 
            <strong>build positive culture</strong>. Next, we'll cover monitoring and analytics for data-driven operations.
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Use Operator Broadcast System for system updates and announcements',
      'Moderate WorkChat actively - respond to questions within 24 hours',
      'Provide clear technical support with templates and examples',
      'Guide new users through onboarding and pair with mentors',
    ],
  },

  {
    id: 'monitoring-analytics',
    number: 6,
    title: 'Monitoring & Analytics',
    subtitle: 'Data-Driven Operations',
    icon: <GitBranch className="h-6 w-6" />,
    duration: '30 min',
    content: (
      <div className="space-y-6">
        {/* Opening */}
        <div className="border-l-4 border-[var(--hydrogen-amber)] bg-gradient-to-r from-amber-500/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--hydrogen-amber)'}}>
            📊 Let Data Guide Your Decisions
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            Great operators don't just react to problems—they anticipate them using data. The Operator Dashboard 
            provides powerful analytics, and you can run custom SQL queries for deeper insights. Let's master 
            data-driven operations.
          </p>
        </div>

        {/* Operator Dashboard Analytics */}
        <div>
          <h4 className="text-xl font-bold mb-4">📈 Operator Dashboard Analytics</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            The Operator Lab™ (<code className="bg-black/50 px-2 py-1 rounded text-sm">/operator/dashboard</code>) 
            provides real-time metrics for all Clouds you manage. Here's what to monitor:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5 border-l-4 border-blue-500">
              <div className="font-semibold text-blue-400 mb-3">📥 Submission Metrics</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Total Submissions:</strong> Cumulative count per Cloud</li>
                <li>• <strong>Daily Rate:</strong> Submissions per day (7-day average)</li>
                <li>• <strong>Qualified %:</strong> Percentage scoring 4,000+</li>
                <li>• <strong>Avg Score:</strong> Mean PoC score across all submissions</li>
                <li>• <strong>Peak Times:</strong> Hour-by-hour submission heatmap</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-3">⚡ Performance Metrics</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Avg Eval Time:</strong> Mean time from submit to complete</li>
                <li>• <strong>Failed Evals:</strong> Count of errors in last 24h/7d/30d</li>
                <li>• <strong>Queue Depth:</strong> Submissions waiting for evaluation</li>
                <li>• <strong>DB Query Time:</strong> Average database response time</li>
                <li>• <strong>API Latency:</strong> Groq API average response time</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-3">💰 SYNTH Metrics</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Current Balance:</strong> SYNTH remaining in Cloud pool</li>
                <li>• <strong>Burn Rate:</strong> SYNTH spent per day (7-day average)</li>
                <li>• <strong>Days Remaining:</strong> Estimated runway at current rate</li>
                <li>• <strong>Total Distributed:</strong> SYNTH allocated to contributors</li>
                <li>• <strong>Allocation History:</strong> Chart of SYNTH flow over time</li>
              </ul>
            </div>

            <div className="cloud-card p-5 border-l-4 border-amber-500">
              <div className="font-semibold mb-3" style={{color: 'var(--hydrogen-amber)'}}>👥 User Metrics</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Active Contributors:</strong> Users who submitted in last 30 days</li>
                <li>• <strong>Top Contributors:</strong> Highest scoring users</li>
                <li>• <strong>New Signups:</strong> New users in last 7d/30d</li>
                <li>• <strong>Retention Rate:</strong> % of users who return after first submission</li>
                <li>• <strong>WorkChat Activity:</strong> Messages per day</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Custom SQL Queries */}
        <div className="border-2 border-[var(--hydrogen-beta)] bg-blue-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg">🗄️ Custom SQL Queries via Supabase</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            For deeper analysis, operators can run custom SQL queries directly in Supabase SQL Editor. 
            Here are essential queries every operator should know:
          </p>

          <div className="space-y-4">
            <div className="cloud-card p-5">
              <div className="font-semibold text-green-400 mb-2">📊 Top 10 Contributors by Total Score</div>
              <div className="bg-black/50 p-3 rounded font-mono text-xs overflow-x-auto">
{`SELECT 
  contributor,
  COUNT(*) as submission_count,
  AVG(pod_score) as avg_score,
  SUM(pod_score) as total_score
FROM contributions
WHERE status = 'qualified'
GROUP BY contributor
ORDER BY total_score DESC
LIMIT 10;`}
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-blue-400 mb-2">⏱️ Evaluation Performance Over Time</div>
              <div className="bg-black/50 p-3 rounded font-mono text-xs overflow-x-auto">
{`SELECT 
  DATE(created_at) as submission_date,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
  AVG(pod_score) as avg_score,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_minutes
FROM contributions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY submission_date DESC;`}
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-purple-400 mb-2">🚨 Failed Evaluations Analysis</div>
              <div className="bg-black/50 p-3 rounded font-mono text-xs overflow-x-auto">
{`SELECT 
  event_type,
  COUNT(*) as error_count,
  LEFT(error_details, 100) as sample_error,
  MAX(timestamp) as last_occurrence
FROM event_logs
WHERE event_type = 'evaluation_error'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY event_type, LEFT(error_details, 100)
ORDER BY error_count DESC;`}
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>🎯 Scoring Dimension Breakdown</div>
              <div className="bg-black/50 p-3 rounded font-mono text-xs overflow-x-auto">
{`SELECT 
  AVG(novelty_score) as avg_novelty,
  AVG(density_score) as avg_density,
  AVG(coherence_score) as avg_coherence,
  AVG(alignment_score) as avg_alignment,
  AVG(pod_score) as avg_total
FROM contributions
WHERE status = 'qualified'
  AND created_at >= NOW() - INTERVAL '30 days';`}
              </div>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-red-400 mb-2">💎 SYNTH Distribution by User</div>
              <div className="bg-black/50 p-3 rounded font-mono text-xs overflow-x-auto">
{`SELECT 
  contributor,
  COUNT(*) as qualified_pocs,
  SUM(pod_score) as total_score,
  -- Estimated SYNTH allocation (proportional to score)
  ROUND(SUM(pod_score) / 
    (SELECT SUM(pod_score) FROM contributions WHERE status = 'qualified') 
    * 90000000000000, 2) as estimated_synth
FROM contributions
WHERE status = 'qualified'
GROUP BY contributor
ORDER BY estimated_synth DESC
LIMIT 20;`}
              </div>
            </div>
          </div>
        </div>

        {/* Groq API Monitoring */}
        <div>
          <h4 className="text-xl font-bold mb-4">🤖 Monitoring Groq API Usage</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Groq rate limits are the most common cause of evaluation failures. Proactive monitoring prevents downtime:
          </p>

          <div className="cloud-card p-6 mb-4">
            <h5 className="font-bold mb-3">Groq API Limits (Free Tier)</h5>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-black/30 p-3 rounded text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">100,000</div>
                <div className="opacity-70">Tokens per Day</div>
              </div>
              <div className="bg-black/30 p-3 rounded text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">~16,000</div>
                <div className="opacity-70">Tokens per Eval</div>
              </div>
              <div className="bg-black/30 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">~6</div>
                <div className="opacity-70">Evals per Day</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="cloud-card p-4 border-l-4 border-green-500">
              <div className="font-semibold text-green-400 mb-2">✅ How to Monitor Usage</div>
              <div className="text-sm opacity-90">
                Run this SQL query daily to track Groq token consumption:
              </div>
              <div className="bg-black/50 p-2 rounded font-mono text-xs mt-2 overflow-x-auto">
{`SELECT 
  COUNT(*) as evals_today,
  COUNT(*) * 16000 as estimated_tokens
FROM contributions
WHERE DATE(created_at) = CURRENT_DATE
  AND status IN ('qualified', 'unqualified');`}
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-amber-500">
              <div className="font-semibold mb-2" style={{color: 'var(--hydrogen-amber)'}}>⚠️ Warning Thresholds</div>
              <div className="text-sm opacity-90">
                • <strong>4 evals in a day:</strong> 64K tokens used (64% of limit) - slow down
                <br />
                • <strong>5 evals in a day:</strong> 80K tokens used (80% of limit) - stop submissions
                <br />
                • <strong>6 evals in a day:</strong> 96K tokens used (96% of limit) - at risk of hitting limit
              </div>
            </div>

            <div className="cloud-card p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-2">🚨 If You Hit the Limit</div>
              <div className="text-sm opacity-90">
                1. Groq returns 429 error ("Rate limit reached")
                <br />
                2. Submissions will fail until midnight UTC (daily reset)
                <br />
                3. Send broadcast to contributors explaining delay
                <br />
                4. Consider upgrading Groq tier (Dev Tier = 300K TPD)
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div>
          <h4 className="text-xl font-bold mb-4">📉 Trend Analysis & Pattern Recognition</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Look beyond daily metrics—spot trends over weeks and months:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="cloud-card p-5">
              <div className="font-semibold text-green-400 mb-3">🟢 Positive Trends</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Rising Avg Scores:</strong> Contributors improving over time</li>
                <li>• <strong>Increasing Submissions:</strong> Growing user engagement</li>
                <li>• <strong>Higher Qualified %:</strong> Better understanding of system</li>
                <li>• <strong>More Edge/Seed PoCs:</strong> Advancing the frontier</li>
              </ul>
            </div>

            <div className="cloud-card p-5">
              <div className="font-semibold text-red-400 mb-3">🔴 Warning Trends</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• <strong>Declining Avg Scores:</strong> Lower quality or harder criteria</li>
                <li>• <strong>Decreasing Submissions:</strong> Losing contributors</li>
                <li>• <strong>Increasing Failed Evals:</strong> Technical issues</li>
                <li>• <strong>SYNTH Burn Accelerating:</strong> Unsustainable spending</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 text-sm opacity-90 bg-blue-500/10 border border-blue-500/30 p-3 rounded">
            💡 <strong>Operator Tip:</strong> Create a weekly report for yourself tracking key trends. Share 
            monthly summaries with contributors to celebrate progress and address concerns transparently.
          </div>
        </div>

        {/* Alerting & Automation */}
        <div className="border-2 border-purple-500 bg-purple-500/5 p-6 rounded-lg">
          <h4 className="font-bold mb-4 text-lg text-purple-400">🔔 Setting Up Alerts & Automation</h4>
          
          <p className="mb-4 opacity-90 leading-relaxed">
            Don't rely on manual checks—automate monitoring with alerts:
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-green-400">Recommended Alerts:</strong>
              <ul className="mt-2 space-y-1 ml-4 opacity-90">
                <li>• Email/Slack alert when SYNTH balance drops below 10%</li>
                <li>• Email alert for 3+ failed evaluations in 1 hour</li>
                <li>• Daily digest at 9am with submission counts and avg scores</li>
                <li>• Weekly summary on Sundays with trend analysis</li>
                <li>• Critical alert if evaluation queue exceeds 10 submissions</li>
              </ul>
            </div>

            <div className="mt-3">
              <strong className="text-blue-400">Tools for Alerting:</strong>
              <div className="mt-2 space-y-1 opacity-90">
                • <strong>Supabase Webhooks:</strong> Trigger on database events
                <br />
                • <strong>Cron Jobs:</strong> Scheduled SQL queries via Vercel cron
                <br />
                • <strong>Upstash Redis:</strong> Real-time counters and rate limiting
                <br />
                • <strong>Zapier/Make:</strong> No-code automation for notifications
              </div>
            </div>
          </div>
        </div>

        {/* Example Operator Report */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">📄 Example Weekly Operator Report</h4>
          
          <div className="bg-black/30 p-4 rounded text-sm space-y-3">
            <div>
              <div className="font-semibold mb-1" style={{color: 'var(--hydrogen-amber)'}}>
                Week of January 6-12, 2026
              </div>
              <div className="opacity-70 text-xs">QuantumAI Research Lab Cloud Instance</div>
            </div>

            <div className="border-t border-[var(--keyline-primary)] pt-3">
              <div className="font-semibold text-blue-400 mb-1">📊 Key Metrics</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Total Submissions: <strong>47</strong> (+12 vs last week)</div>
                <div>• Qualified: <strong>34</strong> (72.3%)</div>
                <div>• Avg Score: <strong>6,850</strong> (+250 vs last week)</div>
                <div>• Avg Eval Time: <strong>9.2 min</strong></div>
              </div>
            </div>

            <div className="border-t border-[var(--keyline-primary)] pt-3">
              <div className="font-semibold text-green-400 mb-1">✅ Highlights</div>
              <div className="text-xs opacity-90">
                • @DrAlice submitted breakthrough quantum entanglement PoC (9,200 score!)
                <br />
                • Zero failed evaluations all week (excellent stability)
                <br />
                • 5 new contributors joined and completed onboarding
              </div>
            </div>

            <div className="border-t border-[var(--keyline-primary)] pt-3">
              <div className="font-semibold text-amber-400 mb-1">⚠️ Concerns</div>
              <div className="text-xs opacity-90">
                • SYNTH balance at 15% (need to allocate more soon)
                <br />
                • Approaching Groq daily limit on Monday (6 evals in one day)
                <br />
                • WorkChat activity down 30% (need to engage more)
              </div>
            </div>

            <div className="border-t border-[var(--keyline-primary)] pt-3">
              <div className="font-semibold text-purple-400 mb-1">📅 Next Week Plans</div>
              <div className="text-xs opacity-90">
                • Allocate 500 more SYNTH to Cloud pool
                <br />
                • Schedule AMA session in WorkChat to boost engagement
                <br />
                • Upgrade Groq tier to Dev (300K TPD) if submissions keep growing
              </div>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-6">
          <h4 className="font-bold mb-2 text-green-400">🎉 You're a Data-Driven Operator!</h4>
          <p className="text-sm opacity-90">
            You know how to <strong>read Dashboard analytics</strong>, <strong>run custom SQL queries</strong>, 
            <strong>monitor Groq API usage</strong>, <strong>spot trends</strong>, and <strong>set up alerts</strong>. 
            You're now equipped with all the technical and operational skills to earn your Silver Wings!
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Use Operator Dashboard for real-time submission, performance, SYNTH, and user metrics',
      'Run custom SQL queries in Supabase for deeper analysis',
      'Monitor Groq API usage closely—free tier limit is ~6 evals/day',
      'Create weekly reports tracking trends and addressing concerns proactively',
    ],
  },

  {
    id: 'earning-silver-wings',
    number: 7,
    title: 'Earning Your Silver Wings',
    subtitle: 'Certified Cloud Operator',
    icon: <Award className="h-6 w-6" />,
    duration: '20 min',
    content: (
      <div className="space-y-6">
        {/* Victory */}
        <div className="border-l-4 border-[var(--metal-silver)] bg-gradient-to-r from-gray-400/10 to-transparent p-6">
          <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🛡️ You're Ready to Operate the Cloud
          </h3>
          <p className="text-lg opacity-90 leading-relaxed">
            You've mastered the architecture, the evaluation engine, Cloud management, community coordination, 
            and analytics. You're now equipped to run Enterprise Cloud instances and support the ecosystem.
          </p>
        </div>

        {/* Silver Wings Certificate */}
        <div className="border-4 border-[var(--metal-silver)] bg-gradient-to-br from-gray-400/20 to-transparent p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-3xl font-bold mb-2" style={{color: 'var(--metal-silver)'}}>
            Operator Silver Wings
          </h3>
          <div className="text-sm opacity-70 mb-4">Certified Enterprise Cloud Operator</div>
          <div className="inline-block bg-black/50 px-6 py-3 rounded-lg border border-[var(--metal-silver)]">
            <div className="text-xs opacity-70 mb-1">Authorized to Manage Infrastructure</div>
            <div className="font-bold text-lg">Ready to Operate</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="cloud-card p-6">
          <h4 className="font-bold mb-4">Your Next Steps as an Operator</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Request Operator Status</strong> - Contact the core team to activate your operator permissions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Create Your First Cloud Instance</strong> - Practice with a test environment
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Support Contributors</strong> - Answer questions in WorkChat and help onboard new users
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Consider Gold Wings</strong> - Explore the Creator track to learn full reality worldbuilding
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-[var(--metal-silver)]/10 to-transparent border-l-4 border-[var(--metal-silver)] p-6">
          <h4 className="font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
            🚀 Welcome to Operations, Operator
          </h4>
          <p className="text-sm opacity-90 leading-relaxed">
            You're no longer just contributing—you're managing the infrastructure that makes 
            contributions possible. Your work enables others to succeed. <strong>Welcome to the Silver tier.</strong>
          </p>
        </div>
      </div>
    ),
    keyTakeaways: [
      'Completed all 7 modules of Operator Silver Wings',
      'Ready to manage Enterprise Cloud instances',
      'Equipped to support contributors and coordinate community',
      'Can advance to Creator Gold Wings when ready',
    ],
  },
];

