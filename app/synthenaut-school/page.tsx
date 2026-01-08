'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Atom, Compass, Crown, Sparkles, ChevronRight, Award, BookOpen, Zap } from 'lucide-react';

interface CertificationTrack {
  id: string;
  name: string;
  icon: typeof Atom;
  badgeClass: string;
  color: string;
  description: string;
  skills: string[];
  modules: string[];
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  cta: {
    label: string;
    href: string;
  };
}

export default function SynthonautSchool() {
  const [selectedTrack, setSelectedTrack] = useState<string>('hydrogen-observer');

  const tracks: Record<string, CertificationTrack> = {
    'hydrogen-observer': {
      id: 'hydrogen-observer',
      name: 'Hydrogen Observer',
      icon: Atom,
      badgeClass: 'badge-hydrogen-observer',
      color: 'hsl(var(--hydrogen-beta))',
      description: 'Master the fundamentals of Proof of Contribution and the Holographic Hydrogen Frontier',
      skills: [
        'Understanding PoC evaluation criteria',
        'Submitting your first contribution',
        'Reading SynthScan™ MRI scores',
        'Iterating based on feedback',
      ],
      modules: [
        'Introduction to Syntheverse',
        'The Holographic Hydrogen Frontier',
        'PoC Submission Basics',
        'Understanding Scoring (N, D, C, A)',
        'Your First Contribution',
      ],
      duration: '2-3 hours',
      difficulty: 'Beginner',
      cta: {
        label: 'Begin Observer Training',
        href: '/onboarding?track=hydrogen-observer',
      },
    },
    'frontier-scout': {
      id: 'frontier-scout',
      name: 'Frontier Scout',
      icon: Compass,
      badgeClass: 'badge-frontier-scout',
      color: 'hsl(var(--hydrogen-gamma))',
      description: 'Learn to identify seed and edge contributions at the boundary of knowledge',
      skills: [
        'Seed contribution identification (S₀-S₈)',
        'Edge operator detection (E₀-E₆)',
        'Sweet spot optimization (9.2%-19.2%)',
        'Redundancy analysis',
      ],
      modules: [
        'Seed Characteristics Deep Dive',
        'Edge Detection Techniques',
        'Overlap & Redundancy Strategy',
        'Advanced Scoring Mechanics',
        'Content-Based Multipliers',
      ],
      duration: '4-6 hours',
      difficulty: 'Intermediate',
      cta: {
        label: 'Begin Scout Training',
        href: '/onboarding?track=frontier-scout',
      },
    },
    'cloud-architect': {
      id: 'cloud-architect',
      name: 'Cloud Architect',
      icon: Crown,
      badgeClass: 'badge-cloud-architect',
      color: 'hsl(var(--metal-gold))',
      description: 'Design and operate enterprise cloud instances for maximum output and coherence',
      skills: [
        'Cloud instance configuration',
        'Scoring lens customization',
        'Team coordination',
        'Enterprise tokenomics',
      ],
      modules: [
        'Cloud Architecture Overview',
        'Operator Console Mastery',
        'Scoring Configuration',
        'Enterprise Coordination',
        'Metal Allocation Strategy',
        'SYNTH Token Management',
      ],
      duration: '8-10 hours',
      difficulty: 'Advanced',
      cta: {
        label: 'Begin Architect Training',
        href: '/onboarding?track=cloud-architect',
      },
    },
    'quantum-synthesist': {
      id: 'quantum-synthesist',
      name: 'Quantum Synthesist',
      icon: Sparkles,
      badgeClass: 'badge-quantum-synthesist',
      color: 'hsl(var(--hydrogen-alpha))',
      description: 'Master all aspects of Syntheverse creation, operation, and contribution synthesis',
      skills: [
        'Full system administration',
        'Creator dashboard control',
        'Advanced HHF-AI integration',
        'Community leadership',
      ],
      modules: [
        'System Administration',
        'Creator Control Panel',
        'Broadcast Management',
        'Audit & Compliance',
        'Advanced Tokenomics',
        'Community Governance',
        'HHF-AI Research Methods',
        'Contribution Synthesis Mastery',
      ],
      duration: '15-20 hours',
      difficulty: 'Master',
      cta: {
        label: 'Begin Synthesist Training',
        href: '/onboarding?track=quantum-synthesist',
      },
    },
  };

  const currentTrack = tracks[selectedTrack];
  const Icon = currentTrack.icon;

  return (
    <div className="holographic-grid min-h-screen relative">
      {/* Nebula Background */}
      <div className="nebula-background" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="hydrogen-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="holographic-badge badge-hydrogen-observer mb-4 inline-flex">
            <BookOpen className="w-4 h-4" />
            TRAINING & CERTIFICATION
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: 'hsl(var(--hydrogen-gamma))' }}
          >
            Synthenaut School
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'hsl(var(--text-secondary))' }}
          >
            Train to navigate the Holographic Hydrogen Frontier. Choose your certification track and
            begin your journey.
          </p>
        </div>

        {/* Track Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.values(tracks).map((track) => {
            const TrackIcon = track.icon;
            const isActive = selectedTrack === track.id;

            return (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`cloud-card p-6 text-left transition-all ${
                  isActive ? 'scale-105 ring-2' : 'hover:scale-102'
                }`}
                style={{
                  ringColor: isActive ? track.color : 'transparent',
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="mb-4 p-4 rounded-full"
                    style={{
                      backgroundColor: `${track.color} / 0.2`,
                    }}
                  >
                    <TrackIcon className="w-8 h-8" style={{ color: track.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: track.color }}>
                    {track.name}
                  </h3>
                  <span className={`holographic-badge ${track.badgeClass} text-xs`}>
                    {track.difficulty}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Track Details */}
        <div className="frontier-panel relative">
          <div className="scan-line" />
          <div className="frontier-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6" style={{ color: currentTrack.color }} />
              <span>{currentTrack.name} Certification Track</span>
            </div>
            <span className={`holographic-badge ${currentTrack.badgeClass}`}>
              {currentTrack.difficulty}
            </span>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Description & Skills */}
              <div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: currentTrack.color }}
                >
                  About This Track
                </h3>
                <p
                  className="text-base mb-6 leading-relaxed"
                  style={{ color: 'hsl(var(--text-secondary))' }}
                >
                  {currentTrack.description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="cloud-card p-3 flex-1">
                    <div
                      className="text-xs mb-1"
                      style={{ color: 'hsl(var(--text-tertiary))' }}
                    >
                      Duration
                    </div>
                    <div className="font-bold" style={{ color: currentTrack.color }}>
                      {currentTrack.duration}
                    </div>
                  </div>
                  <div className="cloud-card p-3 flex-1">
                    <div
                      className="text-xs mb-1"
                      style={{ color: 'hsl(var(--text-tertiary))' }}
                    >
                      Modules
                    </div>
                    <div className="font-bold" style={{ color: currentTrack.color }}>
                      {currentTrack.modules.length} Modules
                    </div>
                  </div>
                </div>

                <h4
                  className="text-lg font-bold mb-3 flex items-center gap-2"
                  style={{ color: currentTrack.color }}
                >
                  <Zap className="w-5 h-5" />
                  Skills You'll Master
                </h4>
                <ul className="space-y-2">
                  {currentTrack.skills.map((skill, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: 'hsl(var(--text-secondary))' }}
                    >
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: currentTrack.color }}
                      />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column - Modules */}
              <div>
                <h4
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ color: currentTrack.color }}
                >
                  <BookOpen className="w-5 h-5" />
                  Training Modules
                </h4>
                <div className="space-y-3">
                  {currentTrack.modules.map((module, idx) => (
                    <div
                      key={idx}
                      className="cloud-card p-4 flex items-center gap-3 hover:scale-102 transition-transform"
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 font-bold"
                        style={{
                          backgroundColor: `${currentTrack.color} / 0.2`,
                          color: currentTrack.color,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'hsl(var(--text-secondary))' }}
                      >
                        {module}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={currentTrack.cta.href}
                  className={`hydrogen-btn mt-6 w-full inline-flex items-center justify-center gap-2 ${
                    currentTrack.id === 'hydrogen-observer'
                      ? 'hydrogen-btn-beta'
                      : currentTrack.id === 'frontier-scout'
                      ? 'hydrogen-btn-gamma'
                      : currentTrack.id === 'cloud-architect'
                      ? 'hydrogen-btn-alpha'
                      : 'hydrogen-btn-alpha'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  {currentTrack.cta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Path */}
        <div className="mt-12 frontier-panel p-8">
          <h3
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'hsl(var(--hydrogen-beta))' }}
          >
            Your Certification Path
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {Object.values(tracks).map((track, idx) => {
              const TrackIcon = track.icon;
              return (
                <div key={track.id} className="flex items-center">
                  <button
                    onClick={() => setSelectedTrack(track.id)}
                    className={`cloud-card p-4 hover:scale-105 transition-transform ${
                      selectedTrack === track.id ? 'ring-2' : ''
                    }`}
                    style={{
                      ringColor: selectedTrack === track.id ? track.color : 'transparent',
                    }}
                  >
                    <TrackIcon className="w-6 h-6" style={{ color: track.color }} />
                  </button>
                  {idx < Object.values(tracks).length - 1 && (
                    <ChevronRight
                      className="w-6 h-6 mx-2 hidden md:block"
                      style={{ color: 'hsl(var(--text-tertiary))' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p
            className="text-center mt-6 text-sm"
            style={{ color: 'hsl(var(--text-tertiary))' }}
          >
            Progress through each certification track to unlock advanced capabilities in the
            Syntheverse Cloud
          </p>
        </div>
      </div>
    </div>
  );
}

