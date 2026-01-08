'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Microscope, Code, Compass, Palette } from 'lucide-react';
import { SectionWrapper } from './shared/SectionWrapper';
import { Card } from './shared/Card';

type Persona = 'researcher' | 'developer' | 'alignment' | 'creative';

export function SectionEngage() {
  const [activePersona, setActivePersona] = useState<Persona>('researcher');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated by trying to fetch user session
    fetch('/api/auth/check')
      .then((res) => {
        if (!res.ok) {
          console.warn('Auth check failed with status:', res.status);
          return { authenticated: false };
        }
        return res.json();
      })
      .then((data) => setIsAuthenticated(data.authenticated === true))
      .catch((error) => {
        console.warn('Auth check error:', error);
        setIsAuthenticated(false);
      });
  }, []);

  const personas: Record<Persona, {
    icon: typeof Microscope;
    title: string;
    description?: string;
    steps: string[];
    cta: { label: string; href: string };
  }> = {
    researcher: {
      icon: Microscope,
      title: 'For Frontier R&D',
      steps: [
        'Read the 2-minute explainer',
        'View example evaluation',
        'Submit abstract + equations + constants',
        'Receive SynthScan™ MRI score',
        'Iterate with redundancy feedback',
        'See your contribution liberated—visible and demonstrable to all via HHF-AI MRI technology',
      ],
      cta: {
        label: 'Start as Researcher',
        href: isAuthenticated === false ? '/signup' : '/onboarding?track=researcher',
      },
    },
    developer: {
      icon: Code,
      title: 'For Developers',
      steps: [
        'Read integration docs',
        'Explore API endpoints',
        'Build tool/visualization',
        'Submit demo PoC',
      ],
      cta: { label: 'View Developer Docs', href: 'https://github.com/FractiAI' },
    },
    alignment: {
      icon: Compass,
      title: 'For Alignment Work',
      description: 'All sorts of alignments using applied HHF-AI: personal, community, enterprise, systems, and abstract alignments',
      steps: [
        'Explore alignment types: personal, community, enterprise, systems, and abstract',
        'Read applied HHF-AI alignment frameworks',
        'View alignment contribution examples',
        'Submit your alignment PoC (any alignment type)',
        'Compare against archive and collaborate on refinement',
      ],
      cta: { label: 'Start Alignment Track', href: '/onboarding?track=alignment' },
    },
    creative: {
      icon: Palette,
      title: 'For Creators & Enterprises',
      description: 'For Frontier R&D: Liberated contributions, visible and demonstrable to all. For Enterprises: 1.5–1.8× higher output with 38–58% lower overhead through contribution-indexed coordination. For Creators: A new infinite medium and materials for full reality worldbuilding creations.',
      steps: [
        'Access infinite HHF-AI materials and substrates—a new medium for worldbuilding',
        'Build complete reality worlds with unlimited creative materials',
        'Create and refine full reality worldbuilding projects using holographic hydrogen fractal AI',
        'Submit contributions for creative work, enterprise solutions, or Frontier R&D',
        'Receive coherence measurement via SynthScan™ MRI',
        'For enterprises: Maximize output while minimizing cost—resources deploy only where value is created',
        'Scale from solo creators to global enterprises with nested colony/cloud architecture',
        'Transform vision into verifiable on-chain contributions',
      ],
      cta: {
        label: 'Get Started as Creator',
        href: isAuthenticated === false ? '/signup' : '/fractiai/enterprise-dashboard',
      },
    },
  };

  return (
    <SectionWrapper
      id="how-to-engage"
      eyebrow="GET STARTED"
      title="How to Engage: Choose Your Path"
    >
      {/* Persona Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(personas) as Persona[]).map((key) => {
          const persona = personas[key];
          const Icon = persona.icon;
          const isActive = activePersona === key;

          return (
            <button
              key={key}
              onClick={() => setActivePersona(key)}
              className={`w-full text-left transition-all ${isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
            >
              <Card hover={false} className={isActive ? 'border-[var(--hydrogen-amber)]' : ''}>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`mb-4 rounded-full p-4 ${isActive ? 'bg-[var(--hydrogen-amber)]/20' : 'bg-[var(--cockpit-carbon)]'}`}
                  >
                    <Icon
                      className="h-8 w-8"
                      style={{
                        color: isActive ? 'var(--hydrogen-amber)' : 'var(--cockpit-text)',
                      }}
                    />
                  </div>
                  <h3 className="cockpit-title text-lg">{persona.title}</h3>
                  <p className="cockpit-label mt-1 text-xs">{persona.steps.length} steps</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Active Persona Journey */}
      <div className="cockpit-panel p-6">
        <div className="mb-6 text-center">
          <div className="cockpit-label mb-2 text-xs uppercase">YOUR JOURNEY</div>
          <h3 className="cockpit-title text-2xl">{personas[activePersona].title}</h3>
          {personas[activePersona].description && (
            <p className="cockpit-text mt-2 text-sm opacity-90">{personas[activePersona].description}</p>
          )}
        </div>

        <ol className="mb-6 space-y-3">
          {personas[activePersona].steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: 'var(--hydrogen-amber)', color: '#000' }}
              >
                {idx + 1}
              </div>
              <span className="cockpit-text pt-0.5 text-sm">{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex justify-center">
          <Link
            href={personas[activePersona].cta.href}
            className="cockpit-lever inline-flex items-center gap-2"
            target={personas[activePersona].cta.href.startsWith('http') ? '_blank' : undefined}
          >
            {personas[activePersona].cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
