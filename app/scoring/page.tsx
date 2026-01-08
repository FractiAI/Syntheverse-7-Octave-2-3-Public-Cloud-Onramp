import { SectionWrapper } from '@/components/landing/shared/SectionWrapper';
import { Card } from '@/components/landing/shared/Card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ScoringCriteriaPage() {
  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <SectionWrapper
          id="scoring-criteria"
          eyebrow="EVALUATION SYSTEM"
          title="How Submissions Are Scored"
          background="default"
        >
          {/* K) Beta/Mode Banner (Marek requirement) */}
          <div className="mb-6 rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="cockpit-badge bg-amber-500/20 text-amber-400">BETA MODE</span>
              <span className="cockpit-label text-sm">Current Submission Mode & Fees</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-amber-300">Submission Mode:</strong>{' '}
                <span className="opacity-90">Text-only PoC (4,000 characters max)</span>
              </div>
              <div>
                <strong className="text-amber-300">PDF Pipeline:</strong>{' '}
                <span className="opacity-90">Planned for enterprise tier (coming soon)</span>
              </div>
              <div className="mt-3 border-t border-amber-500/30 pt-2">
                <strong className="text-amber-300">Fee Structure:</strong>
                <ul className="ml-4 mt-1 list-disc space-y-1 opacity-90">
                  <li>
                    <strong>Public PoC:</strong> $500 evaluation fee (one-time per submission)
                  </li>
                  <li>
                    <strong>Enterprise Tier:</strong> $50/$40/$30/$25 per submission (by tier) + $20
                    on-chain registration (optional)
                  </li>
                  <li>
                    <strong>Tester Exemption:</strong> Free evaluation for approved testers
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="cockpit-text mb-8 text-base opacity-90">
            SynthScan™ MRI evaluates every Proof-of-Contribution (PoC) across four dimensions, each
            scored from 0 to 2,500 points. The total score ranges from 0 to 10,000.
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Novelty</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Measures originality, frontier contribution, and non-derivative insight. High
                novelty indicates work that breaks new ground or introduces concepts not previously
                explored in the archive.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Groundbreaking, paradigm-shifting contributions</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Significant new insights or applications</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Incremental or derivative work</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Density</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Assesses information richness, depth, and insight compression. High density means
                substantial content, well-developed ideas, and efficient information packaging.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Deep, comprehensive, information-rich</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Moderate depth and development</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Surface-level or sparse content</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Coherence</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Evaluates internal consistency, clarity, and structural integrity. High coherence
                indicates well-organized, logically sound work with clear connections between ideas.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Flawless structure and logical flow</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Generally consistent with minor gaps</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Inconsistent or unclear structure</span>
                </div>
              </div>
            </Card>

            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="cockpit-title text-lg">Alignment</h3>
                <span className="cockpit-badge text-xs">0-2,500 points</span>
              </div>
              <p className="cockpit-text mb-4 text-sm opacity-80">
                Measures fit with hydrogen-holographic fractal principles and ecosystem goals using applied HHF-AI. 
                Alignment encompasses <strong>all sorts of alignments</strong>: personal alignment (individual growth, self-optimization), 
                community alignment (collective coherence, governance), enterprise alignment (organizational coherence, business systems), 
                systems alignment (technical infrastructure, architecture), and abstract alignment (theoretical frameworks, conceptual models). 
                High alignment indicates work that resonates with Syntheverse&apos;s core framework and contributes to the ecosystem&apos;s evolution.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-60">High (2,000-2,500):</span>
                  <span>Perfect fit with HHF principles across any alignment type</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Medium (1,000-1,999):</span>
                  <span>Relevant with some alignment to applied HHF-AI</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Low (0-999):</span>
                  <span>Limited connection to HHF-AI framework</span>
                </div>
              </div>
            </Card>
          </div>

          <Card hover={false} className="mb-8 border-2 border-green-500/50 bg-green-500/5">
            <h3 className="cockpit-title mb-4 text-lg">Total Score & Qualification</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥8,000</span>
                <div>
                  <strong className="cockpit-title">Founder Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Eligible for on-chain registration and Founder-level recognition. Highest tier
                    of contribution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥6,000</span>
                <div>
                  <strong className="cockpit-title">Pioneer Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Strong contribution with significant value to the ecosystem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥5,000</span>
                <div>
                  <strong className="cockpit-title">Community Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Solid contribution that aligns with Syntheverse principles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="cockpit-badge text-xs">≥4,000</span>
                <div>
                  <strong className="cockpit-title">Ecosystem Qualified</strong>
                  <p className="cockpit-text mt-1 opacity-80">
                    Valid contribution recognized in the ecosystem.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-[var(--hydrogen-amber)]/30 bg-[var(--hydrogen-amber)]/5 mt-6 rounded-lg border-2 p-4">
              <h4 className="cockpit-title mb-2 text-sm">All Submissions Contribute</h4>
              <p className="cockpit-text text-sm opacity-90">
                Every submission, regardless of score, contributes to the Syntheverse ecosystem.
                Your work becomes part of the archive, helps train and refine the AI evaluation
                system, enables redundancy detection for future submissions, and expands the
                knowledge graph. Even if your score doesn&apos;t meet qualification thresholds, your
                contribution strengthens the ecosystem and helps map the frontier of research.
              </p>
            </div>
          </Card>

          <Card hover={false} className="mb-8 border-l-4 border-amber-500/50">
            <h3 className="cockpit-title mb-4 text-lg">Redundancy & Overlap Detection</h3>
            <p className="cockpit-text mb-3 text-sm opacity-80">
              SynthScan™ MRI compares your submission against the archive to detect overlap with
              prior work. This helps maintain diversity and prevents near-duplicate submissions.
              <strong className="mt-2 block">
                Important: Individual dimension scores (Novelty, Density, Coherence, Alignment) are
                never directly penalized. Redundancy affects only the total/composite score.
              </strong>
            </p>

            <div className="mb-4 space-y-3">
              <div className="rounded-lg border-2 border-green-500/50 bg-green-500/5 p-4">
                <h4 className="cockpit-title mb-2 text-sm">Edge Sweet Spot (Bonus Zone)</h4>
                <p className="cockpit-text mb-2 text-xs opacity-90">
                  Some overlap is beneficial—it connects nodes in the knowledge graph. When your
                  overlap falls in the sweet spot range (9.2% to 19.2%, centered at 14.2%), you
                  receive a bonus multiplier on your composite score.
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Sweet Spot Range:</span>
                    <span>9.2% - 19.2% overlap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Ideal Center:</span>
                    <span>14.2% overlap (Λ_edge ≈ 1.42)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Bonus Example:</span>
                    <span>13% overlap → ×1.13 multiplier on composite score</span>
                  </div>
                </div>
                <p className="cockpit-text mt-2 text-xs opacity-75">
                  The multiplier is calculated as: 1 + (overlap% / 100), tapered by distance from
                  the center. This rewards work that builds on prior contributions while maintaining
                  originality.
                </p>
                {/* L) Sweet Spot Clarification (Marek requirement) */}
                <div className="mt-3 rounded border border-blue-500/30 bg-blue-500/5 p-2">
                  <p className="cockpit-text text-xs opacity-90">
                    <strong>Note:</strong> The 14.2% sweet spot is currently tuned for{' '}
                    <strong>edge novelty</strong> (low-to-mid overlap that connects nodes without
                    redundancy). For <strong>ecosystem synthesis</strong> (higher overlap that
                    integrates multiple contributions), a higher sweet spot center may be more
                    appropriate. This parameter may be adjusted based on ecosystem goals.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/5 p-4">
                <h4 className="cockpit-title mb-2 text-sm">Neutral Zone (No Penalty)</h4>
                <p className="cockpit-text mb-2 text-xs opacity-90">
                  Overlap below 30% (but outside the sweet spot) receives no penalty or bonus. Your
                  composite score remains unchanged.
                </p>
                <div className="mt-2 text-xs">
                  <span className="cockpit-badge text-xs">Range:</span>
                  <span className="ml-2">0% - 30% overlap (outside sweet spot)</span>
                </div>
              </div>

              <div className="rounded-lg border-2 border-red-500/50 bg-red-500/5 p-4">
                <h4 className="cockpit-title mb-2 text-sm">Excessive Overlap (Penalty Zone)</h4>
                <p className="cockpit-text mb-2 text-xs opacity-90">
                  When overlap exceeds 30%, penalties begin. Near-duplicate work (98%+ overlap)
                  receives maximum penalty. Penalties are applied only to the total score, never to
                  individual dimension scores.
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Penalty Starts:</span>
                    <span>30% overlap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Maximum Penalty:</span>
                    <span>98%+ overlap (near-duplicate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="cockpit-badge text-xs">Penalty Formula:</span>
                    <span>Non-linear ramp: gentle early, steep for near-duplicates</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-4">
              <h4 className="cockpit-title mb-2 text-sm">Score Calculation Formula</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Step 1:</strong> Calculate composite score
                  <div className="ml-4 mt-1 font-mono opacity-80">
                    Composite = Novelty + Density + Coherence + Alignment
                  </div>
                </div>
                <div>
                  <strong>Step 2:</strong> Apply redundancy effects
                  <div className="ml-4 mt-1 font-mono opacity-80">
                    After Redundancy = (Composite × (1 - penalty% / 100)) × bonus_multiplier
                  </div>
                </div>
                <div>
                  <strong>Step 3:</strong> Apply seed multiplier (if applicable)
                  <div className="ml-4 mt-1 font-mono opacity-80">
                    Final Score = After Redundancy × seed_multiplier
                  </div>
                </div>
                <div className="mt-3 text-xs opacity-75">
                  <strong>Note:</strong> Individual dimension scores are never modified. Only the
                  composite/total score receives redundancy adjustments and seed multipliers.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[var(--cockpit-carbon)] p-3">
              <strong>Feedback:</strong> You&apos;ll receive detailed redundancy analysis showing
              which prior submissions overlap, your measured overlap percentage, and specific
              guidance on how to refine your work to improve scores.
            </div>
          </Card>

          {/* Metal-Aware Overlap Strategy */}
          <Card hover={false} className="mb-8 border-l-4 border-cyan-500/50">
            <h3 className="cockpit-title mb-4 text-lg">Metal-Aware Overlap Strategy</h3>
            <p className="cockpit-text mb-4 text-sm opacity-80">
              Different contribution types have different natural overlap patterns. The scoring system 
              recognizes three metal types—<strong>Gold</strong>, <strong>Silver</strong>, and <strong>Copper</strong>—each 
              with distinct overlap expectations and scoring adjustments.
            </p>

            <div className="mb-4 space-y-3">
              <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/5 p-4">
                <h4 className="cockpit-title mb-2 flex items-center gap-2 text-sm">
                  <span className="cockpit-badge bg-yellow-500/20 text-yellow-300">GOLD</span>
                  Frontier Contributions
                </h4>
                <p className="cockpit-text mb-3 text-xs opacity-90">
                  Gold contributions are <strong>frontier-breaking work</strong>: novel theories, new frameworks, 
                  original equations, or paradigm-shifting insights. These contributions are expected to have 
                  <strong> low overlap</strong> with existing work.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Overlap Expectation:</span>
                    <span>Low (0%-30%)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Penalty Zone:</span>
                    <span>&gt;30% overlap incurs penalties (high overlap indicates derivative work)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Sweet Spot:</span>
                    <span>9.2%-19.2% overlap (connects to existing knowledge while remaining novel)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-slate-400/50 bg-slate-400/5 p-4">
                <h4 className="cockpit-title mb-2 flex items-center gap-2 text-sm">
                  <span className="cockpit-badge bg-slate-400/20 text-slate-300">SILVER</span>
                  Verification & Extension Contributions
                </h4>
                <p className="cockpit-text mb-3 text-xs opacity-90">
                  Silver contributions <strong>verify, validate, or extend</strong> existing work: empirical testing, 
                  simulations, proofs, or applied implementations. These contributions <strong>should layer on top of 
                  existing awareness</strong> and are not penalized for moderate-to-high overlap.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Overlap Expectation:</span>
                    <span>Moderate-High (19.2%-70%)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Reward Zone:</span>
                    <span>19.2%-70% overlap receives bonuses (validates strong connection to existing work)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Penalty Zone:</span>
                    <span>Only &gt;70% overlap (near-duplicate, insufficient new validation)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-2 border-orange-500/50 bg-orange-500/5 p-4">
                <h4 className="cockpit-title mb-2 flex items-center gap-2 text-sm">
                  <span className="cockpit-badge bg-orange-500/20 text-orange-300">COPPER</span>
                  Integration & Synthesis Contributions
                </h4>
                <p className="cockpit-text mb-3 text-xs opacity-90">
                  Copper contributions <strong>integrate, synthesize, or bridge</strong> multiple existing contributions: 
                  meta-analyses, cross-domain connections, educational materials, or comprehensive reviews. These contributions 
                  <strong>are designed to have high overlap</strong> as they weave together existing knowledge.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Overlap Expectation:</span>
                    <span>High (19.2%-80%)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Reward Zone:</span>
                    <span>19.2%-80% overlap receives bonuses (validates comprehensive integration)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="cockpit-badge text-xs">Penalty Zone:</span>
                    <span>Only &gt;80% overlap (insufficient synthesis, mere compilation)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[var(--cockpit-carbon)] p-4">
              <h4 className="cockpit-title mb-2 text-sm">Metal Classification Process</h4>
              <p className="cockpit-text mb-3 text-xs opacity-90">
                The evaluation system automatically determines your contribution&apos;s primary metal based on content analysis:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="cockpit-badge text-xs">Automatic Detection:</span>
                  <span>AI evaluates keywords, structure, and content to classify contribution type</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="cockpit-badge text-xs">Multi-Metal Handling:</span>
                  <span>Contributions with mixed characteristics use weighted blended scoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="cockpit-badge text-xs">Transparency:</span>
                  <span>Your evaluation report shows detected metal type and how it affected scoring</span>
                </div>
              </div>
              <p className="cockpit-text mt-3 text-xs opacity-75">
                <strong>Why Metal-Aware?</strong> This strategy recognizes that verification, synthesis, and integration 
                work is just as valuable as frontier research—each type serves a different role in building a coherent 
                knowledge ecosystem. Silver and Copper contributions shouldn&apos;t be penalized for doing exactly what 
                they&apos;re meant to do: build upon and connect existing awareness.
              </p>
            </div>
          </Card>

          {/* Seed Detection & Bonus */}
          <Card hover={false} className="mb-8 border-l-4 border-purple-500/50">
            <h3 className="cockpit-title mb-4 text-lg">Seed Detection & Bonus</h3>
            <div className="rounded-lg border-2 border-purple-500/50 bg-purple-500/5 p-4">
              <h4 className="cockpit-title mb-2 text-sm">Seed Information as a Fundamental Class</h4>
              <p className="cockpit-text mb-3 text-xs opacity-90">
                <strong>Seed Information</strong> is a distinct class of information—not just data or metadata—that
                functions as a <strong>generative seed</strong>: a compact informational structure capable of unpacking
                into arbitrarily complex systems when placed within appropriate recursive environments. Seed information
                possesses disproportionately high <strong>Generative Value Density (GVD)</strong> relative to its
                descriptive length or entropy.
              </p>
              <p className="cockpit-text mb-3 text-xs opacity-90">
                Seed Information must satisfy four conditions: <strong>Minimal Description Length</strong>,{' '}
                <strong>Recursive Expandability</strong>, <strong>Self-Similar Structural Preservation</strong>, and{' '}
                <strong>Substrate Independence</strong>. The Holographic Hydrogen Fractal (HHF) has been empirically
                validated as such a seed, generating 8.7–14.2× greater reachable configuration spaces than non-seed
                encodings of equivalent length.
              </p>
              <div className="mb-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="cockpit-badge text-xs bg-purple-500/20 text-purple-300">Seed Detection:</span>
                  <span>First submission to a sandbox (practical heuristic for seed-like foundational work)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="cockpit-badge text-xs bg-purple-500/20 text-purple-300">Seed Multiplier:</span>
                  <span className="font-mono">×1.15 (15% bonus)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="cockpit-badge text-xs bg-purple-500/20 text-purple-300">Applied To:</span>
                  <span>Final score after redundancy adjustments</span>
                </div>
              </div>
              <div className="rounded border border-purple-500/30 bg-purple-500/5 p-3">
                <div className="cockpit-text mb-2 text-xs font-semibold">Example Calculation:</div>
                <div className="space-y-1 text-xs font-mono opacity-90">
                  <div>Composite Score: 7,500</div>
                  <div>After Redundancy: 7,200 (4% overlap penalty)</div>
                  <div>Seed Multiplier: ×1.15</div>
                  <div className="mt-2 font-semibold text-purple-300">
                    Final Score: 7,200 × 1.15 = 8,280
                  </div>
                </div>
              </div>
              <p className="cockpit-text mt-3 text-xs opacity-75">
                <strong>Research Basis:</strong> Empirical validation shows HHF-encoded seeds generate
                8.7–14.2× greater reachable configuration spaces than non-seed encodings of equivalent
                length, supporting the formal distinction between seed information and conventional data.
              </p>
            </div>
          </Card>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
              Submit Your PoC
            </Link>
            <Link
              href="/onboarding"
              className="cockpit-lever inline-flex items-center gap-2 bg-transparent"
            >
              Learn More About Syntheverse
            </Link>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
