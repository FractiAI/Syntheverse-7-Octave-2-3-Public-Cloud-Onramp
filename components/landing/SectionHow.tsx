'use client';

import { useState } from 'react';
import { SectionWrapper } from './shared/SectionWrapper';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Step {
  number: number;
  title: string;
  description: string;
  details: string[];
  cta?: { label: string; href: string };
}

export function SectionHow() {
  const [activeStep, setActiveStep] = useState(1);

  const steps: Step[] = [
    {
      number: 1,
      title: 'Prepare',
      description: 'Extract your abstract, equations, and constants',
      details: [
        'Extract abstract (key findings)',
        'Include equations (if applicable)',
        'Add constants/parameters',
        'Max 4000 characters (~1 page)',
      ],
      cta: { label: 'See Example PoC', href: '/examples' },
    },
    {
      number: 2,
      title: 'Submit',
      description: 'Create account and submit your PoC',
      details: [
        'Create account (email or OAuth)',
        'Pay $500 evaluation fee (below journal costs)',
        'Paste your prepared content',
        'Submit for evaluation',
      ],
      cta: { label: 'Start Submission', href: '/signup' },
    },
    {
      number: 3,
      title: 'Evaluate',
      description: 'Receive your SynthScan™ MRI scores',
      details: [
        'SynthScan™ scores in ~10 minutes',
        'Novelty, density, coherence, alignment',
        'Redundancy analysis vs archive',
        'Detailed breakdown with justification',
      ],
      cta: { label: 'See Example Evaluation', href: '/examples' },
    },
    {
      number: 4,
      title: 'Iterate',
      description: 'Review feedback and refine',
      details: [
        'Review redundancy feedback',
        'Identify overlapping concepts',
        'Refine your work to reduce overlap',
        'Resubmit for improved scores',
      ],
      cta: { label: 'Learn About Scoring', href: '/scoring' },
    },
    {
      number: 5,
      title: 'Register',
      description: 'Optional: Anchor proof on-chain',
      details: [
        'Qualifying PoCs: score threshold + approval',
        'Register on Base Mainnet',
        'Permanent proof of contribution',
        'Free after qualification',
      ],
      cta: { label: 'Check Eligibility', href: '/dashboard' },
    },
  ];

  return (
    <SectionWrapper
      id="how-it-works"
      eyebrow="YOUR JOURNEY"
      title="How It Works: 5 Steps"
      background="default"
    >
      {/* Timeline - horizontal on desktop, vertical on mobile */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        {steps.map((step, idx) => (
          <button
            key={step.number}
            onClick={() => setActiveStep(step.number)}
            className={`flex flex-1 items-center gap-3 border-l-4 p-4 text-left transition-colors md:flex-col md:border-b-4 md:border-l-0 md:text-center ${
              activeStep === step.number
                ? 'bg-[var(--hydrogen-amber)]/10 border-[var(--hydrogen-amber)]'
                : 'border-[var(--keyline-primary)] opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                activeStep === step.number
                  ? 'bg-[var(--hydrogen-amber)] text-black'
                  : 'bg-[var(--cockpit-carbon)] text-[var(--cockpit-text)]'
              }`}
            >
              {step.number}
            </div>
            <div className="md:mt-2">
              <div className="cockpit-title text-sm">{step.title}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Step Details */}
      <div className="cockpit-panel p-6">
        <div className="mb-4">
          <div className="cockpit-label mb-2 text-xs">STEP {steps[activeStep - 1].number} OF 5</div>
          <h3 className="cockpit-title mb-2 text-2xl">
            {steps[activeStep - 1].number}. {steps[activeStep - 1].title}
          </h3>
          <p className="cockpit-text opacity-80">{steps[activeStep - 1].description}</p>
        </div>

        <ul className="mb-6 space-y-2">
          {steps[activeStep - 1].details.map((detail, idx) => (
            <li key={idx} className="cockpit-text flex items-start gap-2 text-sm">
              <span className="text-[var(--hydrogen-amber)]">•</span>
              <span className="opacity-80">{detail}</span>
            </li>
          ))}
        </ul>

        {steps[activeStep - 1].cta && (
          <Link
            href={steps[activeStep - 1].cta!.href}
            className="cockpit-lever inline-flex items-center gap-2 text-sm"
          >
            {steps[activeStep - 1].cta!.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}
