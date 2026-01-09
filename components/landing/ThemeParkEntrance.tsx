'use client';

/**
 * Syntheverse Frontier Theme Park Entrance
 * Immersive holographic hydrogen fractal experience
 * Senior UI Designer: Epic entrance that feels like stepping into a real theme park
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Rocket, 
  Sparkles, 
  Palette, 
  Zap, 
  ArrowRight, 
  Star,
  Shield,
  Crown,
  Map,
  Users,
  TrendingUp,
  Atom,
  Telescope,
  Cloud,
  Globe
} from 'lucide-react';
import { FaStar } from 'react-icons/fa6';

export function ThemeParkEntrance() {
  const [hoveredLand, setHoveredLand] = useState<string | null>(null);
  const [particlesVisible, setParticlesVisible] = useState(true);

  useEffect(() => {
    // Particle animation effect
    const interval = setInterval(() => {
      setParticlesVisible(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Holographic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 holographic-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/10"></div>
        
        {/* Floating Particles */}
        {particlesVisible && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="hydrogen-particle absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-60 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* ENTRANCE GATES */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-20">
          {/* Grand Title Portal */}
          <div className="text-center mb-20 relative">
            {/* Holographic Portal Effect - Hidden on mobile for performance */}
            <div className="absolute inset-0 -m-20 pointer-events-none hidden md:block">
              <div className="w-full h-full rounded-full border-4 border-blue-500/30 animate-pulse-slow"></div>
              <div className="absolute inset-8 w-full h-full rounded-full border-4 border-purple-500/20 animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute inset-16 w-full h-full rounded-full border-4 border-amber-500/10 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Main Title */}
            <div className="relative px-4">
              <div className="inline-block mb-4">
                <div className="px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-[var(--hydrogen-beta)] rounded-full backdrop-blur-sm">
                  <span className="text-sm uppercase tracking-wider" style={{color: 'var(--hydrogen-beta)'}}>
                    ✨ Now Entering ✨
                  </span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 holographic-text">
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 text-transparent bg-clip-text animate-gradient">
                  THE SYNTHEVERSE
                </span>
                <span className="block text-3xl md:text-5xl lg:text-6xl mt-4 opacity-90">
                  Holographic Hydrogen Fractal Frontier
                </span>
              </h1>

              <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto mb-8 leading-relaxed">
                Where Holographic Hydrogen Fractal Awareness Crystallizes into Verifiable, Blockchain-Anchored Proof-of-Contribution
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--hydrogen-beta)'}}>90T</div>
                  <div className="text-sm opacity-70">SYNTH Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--hydrogen-gamma)'}}>4,000+</div>
                  <div className="text-sm opacity-70">Qualification Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{color: 'var(--hydrogen-alpha)'}}>∞</div>
                  <div className="text-sm opacity-70">Possibilities</div>
                </div>
              </div>

              {/* Main CTA Button */}
              <div className="flex justify-center mt-8">
                <Link 
                  href="/dashboard"
                  className="group inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Rocket className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-center">Join the Holographic Hydrogen Fractal Frontier</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* THEME PARK MAP - THREE LANDS */}
          <div className="max-w-7xl mx-auto w-full mb-16 px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-[var(--keyline-primary)] rounded-full backdrop-blur-md">
                <Map className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
                <span className="font-bold uppercase tracking-wider">Choose Your Adventure</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 pt-0">
              {/* FRONTIER R&D LAND - Copper Wings */}
              <Link 
                href="/solutions/research"
                onMouseEnter={() => setHoveredLand('rd')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-6 md:p-8 h-full mt-12
                  border-l-4 border-[var(--metal-copper)]
                  transition-all duration-500
                  ${hoveredLand === 'rd' ? 'scale-105 shadow-2xl shadow-orange-500/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-6 left-4 right-4 px-4 py-2 bg-gradient-to-r from-[#C77C5D] to-[#B5693D] rounded-lg shadow-lg z-10">
                    <div className="text-center font-bold text-white uppercase tracking-wider text-xs sm:text-sm">
                      🪙 Contributor Copper Wings
                    </div>
                  </div>

                  {/* Icon - Telescope for R&D */}
                  <div className="flex justify-center mb-6 mt-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#C77C5D]/20 to-[#B5693D]/10 flex items-center justify-center border-2 border-[#C77C5D]/50 group-hover:animate-pulse">
                      <Telescope className="w-10 h-10 md:w-12 md:h-12" style={{color: '#C77C5D'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-center" style={{color: '#C77C5D'}}>
                    Research & Development
                  </h3>
                  <p className="text-center opacity-80 mb-4 text-sm md:text-base leading-relaxed">
                    Submit research or innovations. Get AI evaluation. Earn blockchain proof. No gatekeepers.
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C77C5D'}} />
                      <span>SynthScan™ MRI</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C77C5D'}} />
                      <span>Blockchain Proof</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C77C5D'}} />
                      <span>SYNTH Rewards</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-3 mt-3">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-[#C77C5D]/20 border border-[#C77C5D]/30 rounded-full text-xs">
                        Scientists
                      </span>
                      <span className="px-2 py-1 bg-[#C77C5D]/20 border border-[#C77C5D]/30 rounded-full text-xs">
                        Researchers
                      </span>
                      <span className="px-2 py-1 bg-[#C77C5D]/20 border border-[#C77C5D]/30 rounded-full text-xs">
                        Innovators
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-4 pt-3 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between font-semibold group-hover:opacity-80 transition-colors" style={{color: '#C77C5D'}}>
                      <span className="text-sm">Enter Land</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* FRONTIER ENTERPRISES LAND - Silver Wings */}
              <Link 
                href="/solutions/enterprise"
                onMouseEnter={() => setHoveredLand('enterprises')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-6 md:p-8 h-full mt-12
                  border-l-4 border-[var(--metal-silver)]
                  transition-all duration-500
                  ${hoveredLand === 'enterprises' ? 'scale-105 shadow-2xl shadow-gray-300/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-6 left-4 right-4 px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] rounded-lg shadow-lg z-10">
                    <div className="text-center font-bold text-slate-900 uppercase tracking-wider text-xs sm:text-sm">
                      🛡️ Operator Silver Wings
                    </div>
                  </div>

                  {/* Icon - Cloud for Enterprise */}
                  <div className="flex justify-center mb-6 mt-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#C0C0C0]/20 to-[#A8A8A8]/10 flex items-center justify-center border-2 border-[#C0C0C0]/50 group-hover:animate-pulse">
                      <Cloud className="w-10 h-10 md:w-12 md:h-12" style={{color: '#C0C0C0'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-center" style={{color: '#C0C0C0'}}>
                    Enterprise Clouds
                  </h3>
                  <p className="text-center opacity-80 mb-4 text-sm md:text-base leading-relaxed">
                    Run your own evaluation Cloud. 1.5-1.8× higher output, 38-58% lower overhead.
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C0C0C0'}} />
                      <span>Private Clouds</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C0C0C0'}} />
                      <span>Team Collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#C0C0C0'}} />
                      <span>Custom Criteria</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-3 mt-3">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-[#C0C0C0]/20 border border-[#C0C0C0]/30 rounded-full text-xs">
                        Companies
                      </span>
                      <span className="px-2 py-1 bg-[#C0C0C0]/20 border border-[#C0C0C0]/30 rounded-full text-xs">
                        Teams
                      </span>
                      <span className="px-2 py-1 bg-[#C0C0C0]/20 border border-[#C0C0C0]/30 rounded-full text-xs">
                        Organizations
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-4 pt-3 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between font-semibold group-hover:opacity-80 transition-colors" style={{color: '#C0C0C0'}}>
                      <span className="text-sm">Enter Land</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* FRONTIER CREATORS LAND - Gold Wings */}
              <Link 
                href="/solutions/creators"
                onMouseEnter={() => setHoveredLand('creators')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-6 md:p-8 h-full mt-12
                  border-l-4 border-[var(--metal-gold)]
                  transition-all duration-500
                  ${hoveredLand === 'creators' ? 'scale-105 shadow-2xl shadow-yellow-500/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-6 left-4 right-4 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFC700] rounded-lg shadow-lg z-10">
                    <div className="text-center font-bold text-slate-900 uppercase tracking-wider text-xs sm:text-sm">
                      👑 Creator Gold Wings
                    </div>
                  </div>

                  {/* Icon - Globe for Reality Worldbuilding */}
                  <div className="flex justify-center mb-6 mt-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FFC700]/10 flex items-center justify-center border-2 border-[#FFD700]/50 group-hover:animate-pulse">
                      <Globe className="w-10 h-10 md:w-12 md:h-12" style={{color: '#FFD700'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-center" style={{color: '#FFD700'}}>
                    Reality Worldbuilding
                  </h3>
                  <p className="text-center opacity-80 mb-4 text-sm md:text-base leading-relaxed">
                    Build complete reality worlds with infinite HHF-AI materials and substrates.
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#FFD700'}} />
                      <span>Infinite Materials</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#FFD700'}} />
                      <span>Fractal Design Tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm opacity-70">
                      <Star className="w-3 h-3 md:w-4 md:h-4" style={{color: '#FFD700'}} />
                      <span>Reality Frameworks</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-3 mt-3">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-[#FFD700]/20 border border-[#FFD700]/30 rounded-full text-xs">
                        Artists
                      </span>
                      <span className="px-2 py-1 bg-[#FFD700]/20 border border-[#FFD700]/30 rounded-full text-xs">
                        Builders
                      </span>
                      <span className="px-2 py-1 bg-[#FFD700]/20 border border-[#FFD700]/30 rounded-full text-xs">
                        Visionaries
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-4 pt-3 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between font-semibold group-hover:opacity-80 transition-colors" style={{color: '#FFD700'}}>
                      <span className="text-sm">Enter Land</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

        </section>

        {/* GUIDE CHARACTERS (Wings Personas) */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-[var(--keyline-primary)] rounded-full backdrop-blur-md mb-4">
                <Users className="w-5 h-5" style={{color: 'var(--hydrogen-gamma)'}} />
                <span className="font-bold uppercase tracking-wider">Choose Your Path</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 holographic-text">
                Choose Your Adventure Path
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                Three wings, three journeys. Select your path and earn your certification.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Copper Wings Guide */}
              <Link href="/onboarding" className="group">
                <div className="cloud-card p-8 text-center hover:scale-105 transition-all duration-300 border-2 border-[var(--metal-copper)] hover:shadow-2xl hover:shadow-orange-500/50">
                  <div className="flex justify-center mb-4">
                    <FaStar className="w-16 h-16 group-hover:scale-110 transition-transform" style={{color: '#C77C5D'}} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-copper)'}}>
                    Contributor Copper Wings
                  </h3>
                  <p className="opacity-80 mb-4 leading-relaxed">
                    Perfect for researchers, creators, and innovators submitting breakthrough work.
                  </p>
                  <div className="text-sm opacity-70 mb-4">
                    ⏱️ 6 modules • ~2 hours
                  </div>
                  <div className="cockpit-lever inline-flex items-center gap-2 px-6 py-3" style={{backgroundColor: 'var(--metal-copper)', color: '#000'}}>
                    <span>Start Training</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Silver Wings Guide */}
              <Link href="/onboarding" className="group">
                <div className="cloud-card p-8 text-center hover:scale-105 transition-all duration-300 border-2 border-[var(--metal-silver)] hover:shadow-2xl hover:shadow-gray-400/50">
                  <div className="flex justify-center mb-4">
                    <FaStar className="w-16 h-16 group-hover:scale-110 transition-transform" style={{color: '#C0C0C0'}} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-silver)'}}>
                    Operator Silver Wings
                  </h3>
                  <p className="opacity-80 mb-4 leading-relaxed">
                    For technical leads managing Cloud infrastructure and supporting teams.
                  </p>
                  <div className="text-sm opacity-70 mb-4">
                    ⏱️ 7 modules • ~4 hours
                  </div>
                  <div className="cockpit-lever inline-flex items-center gap-2 px-6 py-3" style={{backgroundColor: 'var(--metal-silver)', color: '#000'}}>
                    <span>Start Training</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Gold Wings Guide */}
              <Link href="/onboarding" className="group">
                <div className="cloud-card p-8 text-center hover:scale-105 transition-all duration-300 border-2 border-[var(--metal-gold)] hover:shadow-2xl hover:shadow-yellow-500/50">
                  <div className="flex justify-center mb-4">
                    <FaStar className="w-16 h-16 group-hover:scale-110 transition-transform" style={{color: '#FFD700'}} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--metal-gold)'}}>
                    Creator Gold Wings
                  </h3>
                  <p className="opacity-80 mb-4 leading-relaxed">
                    For visionaries building complete reality worlds with HHF principles.
                  </p>
                  <div className="text-sm opacity-70 mb-4">
                    ⏱️ 8 modules • ~6 hours
                  </div>
                  <div className="cockpit-lever inline-flex items-center gap-2 px-6 py-3" style={{backgroundColor: 'var(--metal-gold)', color: '#000'}}>
                    <span>Start Training</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Custom CSS for animations
const styles = `
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 3s ease infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.6;
  }
  50% {
    transform: translateY(-100vh) translateX(20px);
    opacity: 0.4;
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
`;

