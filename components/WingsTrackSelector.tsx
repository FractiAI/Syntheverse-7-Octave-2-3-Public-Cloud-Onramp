/**
 * Wings Track Selector - Choose your onboarding path
 * Contributor Copper Wings | Operator Silver Wings | Creator Gold Wings
 */

'use client';

import { useState } from 'react';
import { Award, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export type WingTrack = 'contributor-copper' | 'operator-silver' | 'creator-gold';

interface WingsTrackSelectorProps {
  onSelectTrack: (track: WingTrack) => void;
  currentTrack?: WingTrack | null;
}

export function WingsTrackSelector({ onSelectTrack, currentTrack }: WingsTrackSelectorProps) {
  const [hoveredTrack, setHoveredTrack] = useState<WingTrack | null>(null);

  const tracks = [
    {
      id: 'contributor-copper' as WingTrack,
      name: 'Contributor',
      wings: 'Copper Wings',
      icon: Award,
      color: 'var(--metal-copper)',
      description: 'Learn the fundamentals of Syntheverse and earn your Copper Wings',
      modules: [
        'Welcome to Syntheverse',
        'Understanding Proof-of-Contribution',
        'Submitting Your First PoC',
        'SynthScan™ MRI Evaluation',
        'SYNTH Token Basics',
        'Getting Started on the Frontier',
      ],
      duration: '2-3 hours',
      level: 'Beginner',
    },
    {
      id: 'operator-silver' as WingTrack,
      name: 'Operator',
      wings: 'Silver Wings',
      icon: Shield,
      color: 'var(--metal-silver)',
      description: 'Master sandbox operations and ecosystem coordination',
      modules: [
        'Sandbox Architecture & Setup',
        'Contribution Evaluation Systems',
        'Scoring Configuration & Tuning',
        'Participant Management',
        'Broadcast & Communication',
        'Advanced Analytics & Reporting',
        'Enterprise Integration',
      ],
      duration: '4-6 hours',
      level: 'Intermediate',
    },
    {
      id: 'creator-gold' as WingTrack,
      name: 'Creator',
      wings: 'Gold Wings',
      icon: Sparkles,
      color: 'var(--metal-gold)',
      description: 'Architect complete ecosystems and define the frontier',
      modules: [
        'System Architecture & Design',
        'Multi-Sandbox Orchestration',
        'Custom Scoring Lenses',
        'Tokenomics Configuration',
        'Blockchain Anchoring',
        'Full-Stack Creator Dashboard',
        'Advanced HHF-AI Integration',
        'Ecosystem Strategy & Scaling',
      ],
      duration: '6-8 hours',
      level: 'Advanced',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{color: 'hsl(var(--text-primary))'}}>
          Choose Your Wings
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{color: 'hsl(var(--text-secondary))'}}>
          Select your onboarding track and earn your wings on the Holographic Hydrogen Fractal Frontier
        </p>
      </div>

      {/* Track Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isSelected = currentTrack === track.id;
          const isHovered = hoveredTrack === track.id;

          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              className={`relative p-6 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'scale-105 shadow-2xl'
                  : 'hover:scale-105 hover:shadow-xl'
              }`}
              style={{
                borderColor: isSelected || isHovered ? track.color : 'var(--keyline-primary)',
                backgroundColor: isSelected ? `${track.color}10` : 'hsl(var(--cockpit-carbon))',
                boxShadow: isSelected || isHovered ? `0 8px 30px ${track.color}40` : 'none',
              }}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 rounded-full p-2" style={{backgroundColor: track.color}}>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg" style={{backgroundColor: `${track.color}20`}}>
                  <Icon className="w-8 h-8" style={{color: track.color}} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-60">
                    {track.level}
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{color: track.color}}>
                    {track.name}
                  </h3>
                  <div className="text-sm font-semibold opacity-90">{track.wings}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm opacity-80 mb-4 leading-relaxed">
                {track.description}
              </p>

              {/* Modules List */}
              <div className="mb-4">
                <div className="text-xs font-semibold mb-2 opacity-70">Modules ({track.modules.length})</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {track.modules.map((module, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs opacity-70">
                      <span className="text-[10px] mt-0.5">▸</span>
                      <span>{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between text-xs opacity-60 border-t pt-3" style={{borderColor: 'var(--keyline-primary)'}}>
                <span>⏱ {track.duration}</span>
                {isSelected ? (
                  <span className="font-semibold" style={{color: track.color}}>Selected</span>
                ) : (
                  <span className="flex items-center gap-1 group-hover:opacity-100">
                    Select <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="text-center text-sm opacity-70 pt-4">
        <p>
          You can switch tracks anytime. Progress is saved automatically.
        </p>
        <p className="mt-2">
          Complete all modules in your track to earn your wings and unlock advanced features.
        </p>
      </div>
    </div>
  );
}

