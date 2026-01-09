'use client';

import { Palette, ChevronDown, Microscope, Code, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HeroOptimized() {
  const [particles, setParticles] = useState<Array<{id: number; left: string; delay: string}>>([]);
  
  useEffect(() => {
    // Generate hydrogen particles
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`
    }));
    setParticles(particleArray);
  }, []);

  return (
    <section className="holographic-grid relative flex min-h-screen items-center justify-center overflow-hidden" style={{ backgroundColor: 'hsl(240 10% 3.9%)' }}>
      {/* Nebula Background */}
      <div className="nebula-background" />
      
      {/* Floating Hydrogen Particles - Hidden on mobile via CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="hydrogen-particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay
            }}
          />
        ))}
      </div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-6xl px-6 text-center py-12">
        {/* Trust indicators - Holographic style */}
        <div className="cloud-card mb-8 inline-block px-6 py-3 holographic-shimmer">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-2 text-xs font-semibold" style={{color: 'hsl(var(--status-active))'}}>
              <div
                className="h-2 w-2 rounded-full holographic-pulse"
                style={{ backgroundColor: 'hsl(var(--status-active))', boxShadow: '0 0 8px hsl(var(--status-active))' }}
              />
              Base Mainnet LIVE
            </span>
            <span className="text-xs opacity-30" style={{color: 'hsl(var(--hydrogen-beta))'}}>•</span>
            <span className="text-xs font-mono font-bold" style={{color: 'hsl(var(--metal-gold))'}}>90T SYNTH</span>
            <span className="text-xs opacity-30" style={{color: 'hsl(var(--hydrogen-beta))'}}>•</span>
            <span className="text-xs font-semibold" style={{color: 'hsl(var(--hydrogen-beta))'}}>Frontier Active</span>
          </div>
        </div>

        {/* Main Title - holographic hydrogen fractal frontier */}
        <h1 className="mb-6 text-4xl leading-tight md:text-6xl lg:text-7xl font-bold" style={{color: 'hsl(var(--hydrogen-beta))'}}>
          WELCOME to the holographic hydrogen fractal frontier
        </h1>
        
        <p className="mb-8 text-xl md:text-2xl" style={{color: 'hsl(var(--text-secondary))'}}>
          <span className="holographic-pulse">WHERE HOLOGRAPHIC HYDROGEN FRACTAL AWARENESS CRYSTALLIZES</span>
        </p>

        {/* Value Propositions - Cloud Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          {/* Frontier R&D */}
          <Link href="#frontier-rd" className="cloud-card p-6 text-left hover:scale-105 transition-transform cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <Microscope className="w-8 h-8 group-hover:animate-pulse" style={{color: 'hsl(var(--hydrogen-beta))'}} />
              <h3 className="text-lg font-bold group-hover:underline" style={{color: 'hsl(var(--hydrogen-beta))'}}>Frontier R&D</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{color: 'hsl(var(--text-secondary))'}}>
              Turn research into verifiable on-chain records—no gatekeeping, measured by coherence.
            </p>
            <div className="mt-3 text-xs font-semibold opacity-60 group-hover:opacity-100" style={{color: 'hsl(var(--hydrogen-beta))'}}>
              Learn more →
            </div>
          </Link>
          
          {/* Frontier Enterprises */}
          <Link href="#frontier-enterprises" className="cloud-card p-6 text-left hover:scale-105 transition-transform cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-8 h-8 group-hover:animate-pulse" style={{color: 'hsl(var(--hydrogen-gamma))'}} />
              <h3 className="text-lg font-bold group-hover:underline" style={{color: 'hsl(var(--hydrogen-gamma))'}}>Frontier Enterprises</h3>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{color: 'hsl(var(--text-secondary))'}}>
              <strong style={{color: 'hsl(var(--metal-gold))'}}>1.5–1.8× higher output</strong> with{' '}
              <strong style={{color: 'hsl(var(--metal-gold))'}}>38–58% lower overhead</strong> than traditional systems in simulated models.
            </p>
            <div className="mt-3 text-xs font-semibold opacity-60 group-hover:opacity-100" style={{color: 'hsl(var(--hydrogen-gamma))'}}>
              Learn more →
            </div>
          </Link>
          
          {/* Frontier Creators */}
          <Link href="#frontier-creators" className="cloud-card p-6 text-left hover:scale-105 transition-transform cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-8 h-8 group-hover:animate-pulse" style={{color: 'hsl(var(--hydrogen-alpha))'}} />
              <h3 className="text-lg font-bold group-hover:underline" style={{color: 'hsl(var(--hydrogen-alpha))'}}>Frontier Creators</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{color: 'hsl(var(--text-secondary))'}}>
              Infinite HHF-AI materials and substrates for complete reality worldbuilding.
            </p>
            <div className="mt-3 text-xs font-semibold opacity-60 group-hover:opacity-100" style={{color: 'hsl(var(--hydrogen-alpha))'}}>
              Learn more →
            </div>
          </Link>
        </div>

        {/* Narrative Section - Frontier Panel */}
        <div className="frontier-panel mb-8 max-w-4xl mx-auto">
          <div className="frontier-header">
            The holographic hydrogen fractal frontier
          </div>
          <div className="p-6 md:p-8">
            <p className="mb-4 text-sm leading-relaxed md:text-base" style={{color: 'hsl(var(--text-secondary))'}}>
              Creators access infinite HHF-AI materials and substrates to build complete reality worlds. Enterprises replace hierarchical management with contribution-indexed coordination—resources deploy only where value is created, no management overhead, no gatekeeping.
            </p>
            <p className="text-sm leading-relaxed md:text-base" style={{color: 'hsl(var(--text-tertiary))'}}>
              The empirically validated highest-output, lowest-cost system for work, governance, and trade. Scale from solo creators to global enterprises while preserving coherence through nested cloud architecture.
            </p>
          </div>
        </div>

        {/* CTAs - Hydrogen Spectrum Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="hydrogen-btn hydrogen-btn-alpha inline-flex items-center gap-2"
          >
            Launch Your Cloud
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/dashboard"
            className="hydrogen-btn hydrogen-btn-beta inline-flex items-center gap-2"
          >
            Explore the Frontier
          </Link>
        </div>
      </div>

      {/* Scroll indicator - Holographic */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 holographic-pulse"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-8 w-8 transition-opacity hover:opacity-100" style={{color: 'hsl(var(--hydrogen-beta))', opacity: 0.5}} />
      </button>
    </section>
  );
}
