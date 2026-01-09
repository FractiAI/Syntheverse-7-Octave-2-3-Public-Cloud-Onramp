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
  Ticket,
  Map,
  Users,
  TrendingUp,
  Atom
} from 'lucide-react';

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
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          {/* Grand Title Portal */}
          <div className="text-center mb-16 relative">
            {/* Holographic Portal Effect */}
            <div className="absolute inset-0 -m-20 pointer-events-none">
              <div className="w-full h-full rounded-full border-4 border-blue-500/30 animate-pulse-slow"></div>
              <div className="absolute inset-8 w-full h-full rounded-full border-4 border-purple-500/20 animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute inset-16 w-full h-full rounded-full border-4 border-amber-500/10 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Main Title */}
            <div className="relative">
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
                Where awareness crystallizes from the pre-Planck womb into verifiable, 
                blockchain-anchored proof of contribution
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
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
            </div>
          </div>

          {/* THEME PARK MAP - THREE LANDS */}
          <div className="max-w-7xl mx-auto w-full mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-[var(--keyline-primary)] rounded-full backdrop-blur-md">
                <Map className="w-5 h-5" style={{color: 'var(--hydrogen-beta)'}} />
                <span className="font-bold uppercase tracking-wider">Choose Your Adventure</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* FRONTIER R&D LAND */}
              <Link 
                href="/fractiai"
                onMouseEnter={() => setHoveredLand('rd')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-8 h-full
                  border-l-4 border-[var(--hydrogen-beta)]
                  transition-all duration-500
                  ${hoveredLand === 'rd' ? 'scale-105 shadow-2xl shadow-blue-500/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-4 left-6 right-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                    <div className="text-center font-bold text-white uppercase tracking-wider text-sm">
                      🧪 Frontier R&D
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6 mt-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border-2 border-blue-500/50 group-hover:animate-pulse">
                      <Atom className="w-12 h-12" style={{color: 'var(--hydrogen-beta)'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-2xl font-bold mb-4 text-center" style={{color: 'var(--hydrogen-beta)'}}>
                    Research Laboratory
                  </h3>
                  <p className="text-center opacity-80 mb-6 leading-relaxed">
                    Submit breakthrough research. Get AI evaluation. Earn blockchain-anchored proof. 
                    No gatekeepers, no journals, pure science.
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-beta)'}} />
                      <span>SynthScan™ MRI Evaluation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-beta)'}} />
                      <span>Blockchain Registration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-beta)'}} />
                      <span>SYNTH Allocation</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-4 mt-4">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs">
                        Scientists
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs">
                        Researchers
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs">
                        Innovators
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-6 pt-4 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                      <span>Enter Land</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* FRONTIER ENTERPRISES LAND */}
              <Link 
                href="/enterprise"
                onMouseEnter={() => setHoveredLand('enterprises')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-8 h-full
                  border-l-4 border-[var(--hydrogen-gamma)]
                  transition-all duration-500
                  ${hoveredLand === 'enterprises' ? 'scale-105 shadow-2xl shadow-purple-500/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-4 left-6 right-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                    <div className="text-center font-bold text-white uppercase tracking-wider text-sm">
                      ⚡ Frontier Enterprises
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6 mt-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border-2 border-purple-500/50 group-hover:animate-pulse">
                      <Sparkles className="w-12 h-12" style={{color: 'var(--hydrogen-gamma)'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-2xl font-bold mb-4 text-center" style={{color: 'var(--hydrogen-gamma)'}}>
                    Enterprise Clouds
                  </h3>
                  <p className="text-center opacity-80 mb-6 leading-relaxed">
                    Run your own evaluation Cloud. 1.5-1.8× higher output, 38-58% lower overhead 
                    than traditional systems (simulated models).
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-gamma)'}} />
                      <span>Private Cloud Instances</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-gamma)'}} />
                      <span>Team Collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-gamma)'}} />
                      <span>Custom Evaluation Criteria</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-4 mt-4">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs">
                        Companies
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs">
                        Teams
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs">
                        Organizations
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-6 pt-4 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                      <span>Enter Land</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* FRONTIER CREATORS LAND */}
              <Link 
                href="/creator"
                onMouseEnter={() => setHoveredLand('creators')}
                onMouseLeave={() => setHoveredLand(null)}
                className="group relative"
              >
                <div className={`
                  cloud-card p-8 h-full
                  border-l-4 border-[var(--hydrogen-alpha)]
                  transition-all duration-500
                  ${hoveredLand === 'creators' ? 'scale-105 shadow-2xl shadow-amber-500/50' : 'scale-100'}
                `}>
                  {/* Land Banner */}
                  <div className="absolute -top-4 left-6 right-6 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg">
                    <div className="text-center font-bold text-white uppercase tracking-wider text-sm">
                      🎨 Frontier Creators
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6 mt-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border-2 border-amber-500/50 group-hover:animate-pulse">
                      <Palette className="w-12 h-12" style={{color: 'var(--hydrogen-alpha)'}} />
                    </div>
                  </div>

                  {/* Description */}
                  <h3 className="text-2xl font-bold mb-4 text-center" style={{color: 'var(--hydrogen-alpha)'}}>
                    Reality Worldbuilding
                  </h3>
                  <p className="text-center opacity-80 mb-6 leading-relaxed">
                    Build complete reality worlds with infinite HHF-AI materials and substrates. 
                    Full reality worldbuilding at your fingertips.
                  </p>

                  {/* Attractions List */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-alpha)'}} />
                      <span>Infinite Creative Materials</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-alpha)'}} />
                      <span>Fractal Design Tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Star className="w-4 h-4" style={{color: 'var(--hydrogen-alpha)'}} />
                      <span>Reality World Frameworks</span>
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="border-t border-[var(--keyline-primary)] pt-4 mt-4">
                    <div className="text-xs uppercase tracking-wider opacity-50 mb-2">Best For:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs">
                        Artists
                      </span>
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs">
                        Builders
                      </span>
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs">
                        Visionaries
                      </span>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <div className="mt-6 pt-4 border-t border-[var(--keyline-primary)]">
                    <div className="flex items-center justify-between font-semibold group-hover:text-amber-300 transition-colors" style={{color: 'var(--hydrogen-alpha)'}}>
                      <span>Enter Land</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* TICKET BOOTH & FAST PASS */}
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Get Your Tickets (Sign Up) */}
              <div className="cloud-card p-8 border-2 border-[var(--metal-gold)] bg-gradient-to-br from-amber-500/10 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <Ticket className="w-8 h-8" style={{color: 'var(--metal-gold)'}} />
                  <h3 className="text-2xl font-bold" style={{color: 'var(--metal-gold)'}}>
                    Get Your Tickets
                  </h3>
                </div>
                <p className="opacity-80 mb-6 leading-relaxed">
                  New to Syntheverse? Start your journey with free account creation. 
                  Choose your path: Contributor, Operator, or Creator.
                </p>
                <Link 
                  href="/signup"
                  className="cockpit-lever inline-flex items-center gap-3 px-8 py-4 text-lg font-bold w-full justify-center"
                  style={{backgroundColor: 'var(--metal-gold)', color: '#000'}}
                >
                  <Rocket className="w-5 h-5" />
                  <span>Enter the Frontier</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Fast Pass (Already Have Account) */}
              <div className="cloud-card p-8 border-2 border-green-500 bg-gradient-to-br from-green-500/10 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                  <h3 className="text-2xl font-bold text-green-400">
                    Fast Pass Entry
                  </h3>
                </div>
                <p className="opacity-80 mb-6 leading-relaxed">
                  Already have an account? Skip the line and head straight 
                  to your dashboard or choose your destination.
                </p>
                <Link 
                  href="/login"
                  className="cockpit-lever inline-flex items-center gap-3 px-8 py-4 text-lg font-bold w-full justify-center bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Login & Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDE CHARACTERS (Wings Personas) */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-[var(--keyline-primary)] rounded-full backdrop-blur-md mb-4">
                <Users className="w-5 h-5" style={{color: 'var(--hydrogen-gamma)'}} />
                <span className="font-bold uppercase tracking-wider">Meet Your Guides</span>
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
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/10 flex items-center justify-center border-4 border-[var(--metal-copper)] group-hover:animate-pulse">
                    <div className="text-6xl">🪙</div>
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
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-400/30 to-gray-500/10 flex items-center justify-center border-4 border-[var(--metal-silver)] group-hover:animate-pulse">
                    <div className="text-6xl">🛡️</div>
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
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 flex items-center justify-center border-4 border-[var(--metal-gold)] group-hover:animate-pulse">
                    <div className="text-6xl">👑</div>
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

        {/* MOTHERLODE TEASER */}
        <section className="py-20 px-6 bg-gradient-to-b from-black/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <div className="cloud-card p-12 border-4 border-[var(--hydrogen-amber)] bg-gradient-to-br from-amber-500/20 to-transparent holographic-pulse">
              <div className="text-6xl mb-6">💎</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 holographic-text" style={{color: 'var(--hydrogen-amber)'}}>
                SYNTH90T MOTHERLODE VAULT
              </h2>
              <div className="text-5xl font-bold mb-4" style={{color: 'var(--hydrogen-amber)'}}>
                90,000,000,000,000 SYNTH
              </div>
              <p className="text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Fixed-supply ERC-20 token on Base Mainnet. Opens <strong>Spring Equinox, March 20, 2026</strong>. 
                All qualifying PoCs submitted before March 19 will receive allocation based on scores.
              </p>
              <Link 
                href="/fractiai/syntheverse"
                className="cockpit-lever inline-flex items-center gap-3 px-10 py-5 text-lg font-bold"
                style={{backgroundColor: 'var(--hydrogen-amber)', color: '#000'}}
              >
                <Crown className="w-6 h-6" />
                <span>Learn About the Vault</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA - PERFORMANCE STATS */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="cloud-card p-12 text-center border-2 border-green-500">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-full backdrop-blur-md">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400 uppercase tracking-wider">Proven Performance</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                1.5–1.8× Higher Output<br />
                38–58% Lower Overhead
              </h2>

              <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
                Than traditional systems in simulated models. Experience contribution-indexed 
                coordination that actually works.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/signup"
                  className="cockpit-lever inline-flex items-center gap-3 px-10 py-5 text-lg font-bold bg-green-600 hover:bg-green-500 transition-colors text-white"
                >
                  <Rocket className="w-6 h-6" />
                  <span>Start Your Journey Now</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>

                <Link 
                  href="/fractiai"
                  className="cockpit-lever inline-flex items-center gap-3 px-10 py-5 text-lg font-bold border-2 border-[var(--keyline-primary)] hover:border-[var(--hydrogen-beta)] transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
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

