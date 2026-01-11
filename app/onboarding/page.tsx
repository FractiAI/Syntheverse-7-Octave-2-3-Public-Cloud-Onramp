/**
 * Alexander von Humboldt Syntheverse Frontier Exploration Academy™
 * "The most dangerous worldview is the worldview of those who have not viewed the world"
 * Scientific Exploration & Natural Philosophy Applied to Syntheverse Discovery
 * Accessible to all users (public + authenticated)
 */

import { OnboardingNavigator } from '@/components/OnboardingNavigator';
import { HeroPanel } from '@/components/HeroPanel';
import Image from 'next/image';
import { Compass, Mountain, Globe2 } from 'lucide-react';
import '../academy.css';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #2C1810 0%, #1a0f0a 50%, #2C1810 100%)',
    }}>
      {/* Expedition Map Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(205, 133, 63, 0.05) 25%, rgba(205, 133, 63, 0.05) 26%, transparent 27%),
            linear-gradient(90deg, transparent 24%, rgba(205, 133, 63, 0.05) 25%, rgba(205, 133, 63, 0.05) 26%, transparent 27%)
          `,
          backgroundSize: '40px 40px',
          width: '100%',
          height: '100%',
        }}></div>
      </div>

      {/* Alexander von Humboldt Academy Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(139, 69, 19, 0.3), rgba(205, 133, 63, 0.2))',
        borderBottom: '3px solid #CD853F',
        boxShadow: '0 4px 20px rgba(205, 133, 63, 0.3)',
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Humboldt Compass Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/humboldt-compass.svg" 
                  alt="Explorer's Compass" 
                  width={64} 
                  height={64}
                  className="animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{
                  color: '#CD853F',
                  textShadow: '0 0 20px rgba(205, 133, 63, 0.5)',
                  fontFamily: 'Georgia, serif',
                }}>
                  Alexander von Humboldt Exploration Academy™
                </h1>
                <p className="text-sm md:text-base mt-1" style={{color: 'rgba(245, 222, 179, 0.9)'}}>
                  Scientific Exploration · Natural Philosophy · Interconnected Systems
                </p>
                <p className="text-xs mt-1 italic" style={{color: 'rgba(222, 184, 135, 0.8)', fontFamily: 'Georgia, serif'}}>
                  "The most dangerous worldview is the worldview of those who have not viewed the world."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(205, 133, 63, 0.8)', fontFamily: 'Georgia, serif'}}>
                  Expedition Time
                </div>
                <div className="text-lg font-serif font-bold" style={{color: '#CD853F'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#CD853F] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #CD853F',
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Humboldt's Welcome Message */}
      <div className="relative z-10 container mx-auto px-6 py-4">
        <div className="cockpit-panel p-4" style={{
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(205, 133, 63, 0.15) 100%)',
          borderLeft: '4px solid #CD853F',
        }}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧭</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-1" style={{color: '#CD853F', fontFamily: 'Georgia, serif'}}>
                The Interconnectedness of Nature: A Cosmos of Knowledge
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Welcome, explorer! Like my expeditions across the Americas, this academy guides you through 
                the <strong>interconnected systems</strong> of the Syntheverse. Observe, measure, document—
                discover the <strong>unity of nature</strong> in computational form.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expedition Stats */}
      <div className="relative z-10 container mx-auto px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mountains Climbed */}
          <div className="cockpit-panel p-3 text-center" style={{
            background: 'rgba(139, 69, 19, 0.2)',
            borderTop: '2px solid #8B4513',
          }}>
            <Mountain className="w-6 h-6 mx-auto mb-1" style={{color: '#CD853F'}} />
            <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(205, 133, 63, 0.7)'}}>
              Peaks Ascended
            </div>
            <div className="text-lg font-bold" style={{color: '#CD853F'}}>
              Chimborazo · Andes · Alps
            </div>
          </div>

          {/* Continents Explored */}
          <div className="cockpit-panel p-3 text-center" style={{
            background: 'rgba(139, 69, 19, 0.2)',
            borderTop: '2px solid #8B4513',
          }}>
            <Globe2 className="w-6 h-6 mx-auto mb-1" style={{color: '#CD853F'}} />
            <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(205, 133, 63, 0.7)'}}>
              Continents Mapped
            </div>
            <div className="text-lg font-bold" style={{color: '#CD853F'}}>
              Americas · Europe · Asia
            </div>
          </div>

          {/* Specimens Collected */}
          <div className="cockpit-panel p-3 text-center" style={{
            background: 'rgba(139, 69, 19, 0.2)',
            borderTop: '2px solid #8B4513',
          }}>
            <Compass className="w-6 h-6 mx-auto mb-1" style={{color: '#CD853F'}} />
            <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(205, 133, 63, 0.7)'}}>
              Observations Recorded
            </div>
            <div className="text-lg font-bold" style={{color: '#CD853F'}}>
              60,000+ Specimens
            </div>
          </div>
        </div>
      </div>

      {/* Main Onboarding Content */}
      <div className="relative z-10 academy-bg">
      <OnboardingNavigator />
      </div>

      {/* Humboldt's Closing Wisdom */}
      <div className="relative z-10 container mx-auto px-6 py-4">
        <div className="cockpit-panel p-4 text-center" style={{
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(205, 133, 63, 0.15) 100%)',
          borderTop: '2px solid #CD853F',
        }}>
          <div className="text-2xl mb-2">🌍</div>
          <p className="text-xs text-[var(--text-secondary)] italic mb-1" style={{fontFamily: 'Georgia, serif'}}>
            "In this great chain of causes and effects, no single fact can be considered in isolation."
          </p>
          <p className="text-xs" style={{color: '#CD853F'}}>
            — Alexander von Humboldt, Cosmos: A Sketch of a Physical Description of the Universe (1845)
          </p>
        </div>
      </div>

      {/* Hero Panel */}
      <HeroPanel pageContext="academy" pillarContext="contributor" userEmail="" />
    </div>
  );
}
