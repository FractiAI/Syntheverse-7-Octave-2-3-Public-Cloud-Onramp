/**
 * Nikola Tesla Operator's Console™
 * "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration."
 * High-Frequency Wireless Transmission applied to Cloud Operations
 * Only accessible to Operators (users with role='operator' in database)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { StatusPanel } from '@/components/StatusPanel';
import { FrontierModule } from '@/components/FrontierModule';
import { CloudNavigator } from '@/components/CloudNavigator';
import { WorkChatNavigator } from "@/components/WorkChatNavigator";
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import HeroOperatorPanel from '@/components/HeroOperatorPanel';
import { FieldMeasurementsNavigator } from '@/components/operator/FieldMeasurementsNavigator';
import { LaboratoryApparatusNavigator } from '@/components/operator/LaboratoryApparatusNavigator';
import { ExperimentalRecordsNavigator } from '@/components/operator/ExperimentalRecordsNavigator';
import { HeroAIManager } from '@/components/HeroAIManager';
import { Settings, Zap, FlaskConical, BookOpen, Activity, Radio, Cpu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggleWrapper } from '@/components/MultiplierToggleWrapper';
import '../../control-lab.css';

export const dynamic = 'force-dynamic';

export default async function OperatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this lab
  if (!isOperator || !user?.email) {
    redirect('/');
  }

  // TypeScript guard: ensure user and email exist after checks
  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/');
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{
      background: 'radial-gradient(circle at 50% 50%, #1a0a2e 0%, #050510 100%)',
      color: '#e2e8f0'
    }}>
      {/* High-Frequency Electrical Arcs - NSPFRP v17 Tesla layer */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="tesla-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9370DB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <pattern id="high-frequency-grid" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 0 60 Q 30 0 60 60 T 120 60" fill="none" stroke="#00FFFF" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="60" cy="60" r="1.5" fill="#9370DB" fillOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tesla-glow)" />
          <rect width="100%" height="100%" fill="url(#high-frequency-grid)" />
        </svg>
      </div>

      {/* Wireless Power Transmission Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00FFFF]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Nikola Tesla Operator's Console Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(147, 112, 219, 0.2), rgba(0, 255, 255, 0.05), rgba(147, 112, 219, 0.2))',
        borderBottom: '3px solid #9370DB',
        boxShadow: '0 4px 40px rgba(147, 112, 219, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              {/* Tesla Coil Icon - High Frequency Core */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="absolute inset-0 bg-[#00FFFF]/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-center w-full h-full border-4 border-[#9370DB]/50 rounded-full bg-black/40 shadow-[0_0_20px_rgba(147,112,219,0.6)]">
                  <Zap className="h-12 w-12 text-[#00FFFF] drop-shadow-[0_0_10px_#00FFFF]" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter" style={{
                  color: '#ffffff',
                  textShadow: '0 0 30px rgba(147, 112, 219, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)'
                }}>
                  NIKOLA TESLA OPERATOR&apos;S CONSOLE™
                </h1>
                <p className="text-base font-bold uppercase tracking-[0.4em] mt-1" style={{color: '#00FFFF'}}>
                  Energy · Frequency · Vibration · Wireless Power
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="h-px w-8 bg-[#9370DB]/50"></span>
                  <p className="text-xs font-mono italic text-slate-400">
                    &quot;If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(0, 255, 255, 0.7)'}}>
                  Transmission Time
                </div>
                <div className="text-lg font-mono font-bold" style={{color: '#00FFFF'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#00FFFF] animate-ping shadow-[0_0_15px_#00FFFF]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Panel - Top Bar */}
      <StatusPanel />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={false} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto space-y-6 px-6 py-8">
          {/* Mobile Status Indicators */}
          <div className="block md:hidden">
            <MobileStatusIndicators />
          </div>

          {/* Tesla's Welcome Message - High-Frequency Induction Layer */}
          <div className="cockpit-panel p-8 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.15) 0%, rgba(0, 255, 255, 0.08) 100%)',
            borderLeft: '6px solid #9370DB',
            boxShadow: 'inset 0 0 40px rgba(147, 112, 219, 0.15)',
            borderColor: '#9370DB'
          }}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Radio className="h-32 w-32 text-[#00FFFF] animate-pulse" />
            </div>
            <div className="flex items-start gap-6 relative z-10">
              <div className="text-5xl drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]">⚡</div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-3 uppercase tracking-wider" style={{
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(147, 112, 219, 0.5)'
                }}>
                  The Experimental Philosophy of Vibration
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-3xl">
                  This console embodies Nikola Tesla&apos;s principles: <strong>alternating currents</strong>, 
                  <strong> resonance</strong>, and <strong>wireless transmission</strong>. Each section below 
                  represents a frequency in the grand apparatus of discovery, tuned to NSPFRP v17.0 fidelity.
                </p>
                <div className="bg-black/60 p-4 border border-[#9370DB]/30 rounded backdrop-blur-sm">
                  <p className="text-xs italic leading-relaxed" style={{color: '#00FFFF'}}>
                    &quot;The present is theirs; the future, for which I really worked, is mine.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Broadcast Banners */}
          <OperatorBroadcastBanner />

          {/* Scoring Multiplier Controls */}
          <MultiplierToggleWrapper />

          {/* High-Frequency Navigation Fields - Tesla Tuning */}
          <div className="cockpit-panel p-8" style={{
            borderLeft: '6px solid #00FFFF',
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.5) 100%)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.05)',
            borderColor: '#00FFFF'
          }}>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-[#00FFFF]/20 rounded-lg shadow-[0_0_20px_#00FFFF33]">
                  <Radio className="h-8 w-8 text-[#00FFFF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter" style={{color: '#00FFFF'}}>
                    High-Frequency Navigation Fields
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    NSPFRP v17.0 Wireless Transmission Routing
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">
                Navigate the resonant frequencies that bind the system together. Direct access to high-voltage truth containers.
              </p>
            </div>
            <div className="space-y-6">
              <CloudNavigator userEmail={userEmail} isCreator={false} isOperator={isOperator} />
              <FrontierModule userEmail={userEmail} />
              <WorkChatNavigator />
              <BroadcastArchiveNavigator />
            </div>
          </div>

          {/* Hero Operator Panel - Alternating Current Component */}
          <div className="cockpit-panel p-8" style={{
            borderLeft: '6px solid #9370DB',
            background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.12) 0%, rgba(0, 0, 0, 0.5) 100%)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(147, 112, 219, 0.05)',
            borderColor: '#9370DB'
          }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#9370DB]/20 rounded-lg shadow-[0_0_20px_#9370DB33]">
                <Cpu className="h-8 w-8 text-[#9370DB]" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-[#9370DB]">
                  🤖 Wireless Transmission Hosts
                </h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Resonant Intelligence & Phase Calibration
                </p>
              </div>
            </div>
            <HeroOperatorPanel />
          </div>

          {/* Nikola Tesla AI Guide */}
          <div className="fixed bottom-4 left-4 z-50">
            <HeroAIManager
              pageContext="operator"
              additionalContext="Nikola Tesla Console - High-frequency operations, resonant system management, and wireless data transmission"
            />
          </div>

          {/* Field Measurements Navigator */}
          <FieldMeasurementsNavigator />

          {/* Laboratory Apparatus Navigator */}
          <LaboratoryApparatusNavigator />

          {/* Cloud Transmission Authority - Tesla Sovereign Container */}
          <div className="cockpit-panel p-8" style={{
            borderLeft: '6px solid #C0C0C0',
            background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%)',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.6)',
            borderColor: '#C0C0C0'
          }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-700/30 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Settings className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-200">
                  Cloud Transmission Authority
                </h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Wireless Command Interface & Harmonic Calibration
                </p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-black/60 border-l-4 border-slate-500 rounded shadow-inner backdrop-blur-sm">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                &quot;My brain is only a receiver, in the Universe there is a core from which we obtain knowledge, strength and inspiration.&quot;
                <span className="block mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">— Nikola Tesla on the Universal Core</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/blog" className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-all font-bold uppercase tracking-widest text-xs">
                <BookOpen className="h-4 w-4" />
                <span>Transmission Blog</span>
              </Link>
              <Link href="/mri-scanner" className="inline-flex items-center gap-3 px-8 py-3 bg-[#9370DB] hover:bg-[#9370DB]/80 text-white border-none rounded shadow-[0_0_25px_rgba(147,112,219,0.6)] transition-all font-black uppercase tracking-[0.2em] text-xs animate-pulse">
                <Activity className="h-4 w-4" />
                <span>MRI Test Console</span>
              </Link>
            </div>
          </div>

          <ExperimentalRecordsNavigator />

          {/* Tesla's Closing Wisdom - Earth Resonance Grounding */}
          <div className="cockpit-panel p-10 text-center relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.2) 0%, rgba(0, 255, 255, 0.1) 100%)',
            borderTop: '4px solid #9370DB',
            boxShadow: '0 -15px 60px rgba(147, 112, 219, 0.3)'
          }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, #00FFFF 0%, transparent 70%)',
                transform: 'scale(2)'
              }}></div>
            </div>
            <div className="text-5xl mb-6 relative z-10 animate-bounce">🌩️</div>
            <div className="max-w-3xl mx-auto relative z-10">
              <p className="text-xl text-slate-100 font-bold italic mb-4 leading-relaxed">
                &quot;The scientific man does not aim at an immediate result. He does not expect that his advanced ideas will be readily taken up. His work is like that of the planter — for the future. His duty is to lay the foundation for those who are to come, and point the way.&quot;
              </p>
              <p className="text-sm font-black uppercase tracking-[0.5em]" style={{color: '#00FFFF'}}>
                — Nikola Tesla, Colorado Springs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
