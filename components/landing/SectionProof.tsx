'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

type Tab = 'examples' | 'papers' | 'onchain';

export function SectionProof() {
  const [activeTab, setActiveTab] = useState<Tab>('examples');

  return (
    <SectionWrapper
      id="proof-papers"
      eyebrow="PROOF LIBRARY"
      title="Validated Work & Research Papers"
      background="muted"
    >
      {/* Tab Bar */}
      <div className="mb-6 flex border-b border-[var(--keyline-primary)]">
        {[
          { id: 'examples', label: 'Examples' },
          { id: 'papers', label: 'Papers' },
          { id: 'onchain', label: 'On-Chain Proofs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[var(--hydrogen-amber)] text-[var(--hydrogen-amber)]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content - Examples */}
      {activeTab === 'examples' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <span className="cockpit-badge text-xs">GOLD</span>
              <span className="cockpit-label text-xs">Score: 8,343</span>
            </div>
            <h3 className="cockpit-title mb-2 text-base">Holographic Hydrogen Fractal Framework</h3>
            <p className="cockpit-text mb-4 text-sm opacity-80">
              Cross-domain coherence detection using hydrogen resonance patterns...
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="opacity-60">Novelty:</span> <strong>85%</strong>
              </div>
              <div>
                <span className="opacity-60">Density:</span> <strong>88%</strong>
              </div>
              <div>
                <span className="opacity-60">Coherence:</span> <strong>91%</strong>
              </div>
              <div>
                <span className="opacity-60">Alignment:</span> <strong>90%</strong>
              </div>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
            >
              View Full Evaluation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <span className="cockpit-badge text-xs">SILVER</span>
              <span className="cockpit-label text-xs">Score: 7,256</span>
            </div>
            <h3 className="cockpit-title mb-2 text-base">
              Fractal Pattern Detection in Biological Systems
            </h3>
            <p className="cockpit-text mb-4 text-sm opacity-80">
              Recursive self-similar structures across biological scales...
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="opacity-60">Novelty:</span> <strong>78%</strong>
              </div>
              <div>
                <span className="opacity-60">Density:</span> <strong>82%</strong>
              </div>
              <div>
                <span className="opacity-60">Coherence:</span> <strong>84%</strong>
              </div>
              <div>
                <span className="opacity-60">Alignment:</span> <strong>81%</strong>
              </div>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
            >
              View Full Evaluation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      )}

      {/* Tab Content - Papers */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="cockpit-badge mb-2 text-xs">VALIDATION REPORT</span>
                <h3 className="cockpit-title mb-2 text-base">
                  CERN Data Analysis: Advanced Test Report (ALICE)
                </h3>
                <p className="cockpit-text mb-2 text-sm opacity-80">
                  Multiple ≥3σ phenomena with cross-validation across detectors
                </p>
                <p className="text-xs opacity-60">FractiAI Research Team • January 2025</p>
              </div>
              <Link
                href="https://github.com/FractiAI"
                target="_blank"
                className="text-[var(--hydrogen-amber)] hover:opacity-80"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="cockpit-badge mb-2 text-xs">VALIDATION SUITE</span>
                <h3 className="cockpit-title mb-2 text-base">
                  HHF Validation: Cross-Domain Coherence Detection
                </h3>
                <p className="cockpit-text mb-2 text-sm opacity-80">
                  Biological proxy, isotopologue scaling, molecular validation
                </p>
                <p className="text-xs opacity-60">
                  AiwonA1 & FractiAI Contributors • December 2024
                </p>
              </div>
              <Link
                href="https://github.com/AiwonA1/FractalHydrogenHolography-Validation"
                target="_blank"
                className="text-[var(--hydrogen-amber)] hover:opacity-80"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content - On-Chain */}
      {activeTab === 'onchain' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="cockpit-badge mb-2 text-xs">REGISTERED</span>
                <h3 className="cockpit-title mb-2 font-mono text-sm">0xe9cb9587...</h3>
                <p className="cockpit-text mb-2 text-sm opacity-80">
                  Registered on Base Mainnet via hydrogen spin MRI-based PoC protocol • January 4,
                  2025
                </p>
                <p className="cockpit-text text-xs opacity-70">
                  Visible and demonstrable to all via HHF-AI MRI science and technology—no longer
                  gatekept
                </p>
              </div>
              <Link
                href="https://basescan.org"
                target="_blank"
                className="text-[var(--hydrogen-amber)] hover:opacity-80"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
            </div>
          </Card>

          <div className="cockpit-text text-center text-sm opacity-60">
            More registrations coming after MOTHERLODE VAULT opening
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link href="/signup" className="cockpit-lever inline-flex items-center gap-2">
          Browse Full Archive
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
