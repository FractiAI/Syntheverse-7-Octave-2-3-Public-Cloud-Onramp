'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { StatusIndicators } from './StatusIndicators';
import { signInWithGoogle } from '@/app/auth/actions';

type FractiAILandingProps = {
  variant?: 'home' | 'fractiai';
  isAuthenticated?: boolean;
  isApprovedTester?: boolean;
  cta?: {
    primaryHref: string;
    primaryLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  systemNotice?: string;
};

export default function FractiAILanding({
  isAuthenticated = false,
  isApprovedTester = false,
  cta,
  systemNotice,
}: FractiAILandingProps) {
  return (
    <div className="cockpit-bg min-h-screen flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-2xl w-full space-y-8">
        {/* Minimal Header/Symbol */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-[#3399ff]/10 border border-[#3399ff]/30 animate-pulse">
            <Lock className="h-12 w-12 text-[#3399ff]" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Syntheverse <span className="text-[#3399ff]">Test Mode</span>
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3399ff]/50 to-transparent" />
        </div>

        {/* Announcement Card */}
        <div className="cockpit-panel p-10 border-l-4 border-[#ffcc33] bg-black/40 backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#ffcc33] tracking-[0.3em] uppercase">System Announcement</h2>
            <p className="text-2xl font-bold text-white leading-tight">
              WE ARE CURRENTLY IN TEST AND CALIBRATION
            </p>
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed">
            The Syntheverse protocol environment is undergoing scheduled instrumental-grade maintenance. 
            Public access is temporarily suspended while we stabilize the HHF-AI MRI Atomic Core.
          </p>

          {systemNotice && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-bold uppercase tracking-wider text-center">
              {systemNotice}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  href={cta?.primaryHref || '/login'} 
                  className="cockpit-lever w-full py-4 flex items-center justify-center gap-3 bg-[#3399ff] text-white hover:bg-[#3399ff]/80 transition-all font-black text-sm tracking-widest"
                >
                  {cta?.primaryLabel || 'TESTER LOGIN'}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
                    <span className="bg-[#050505] px-4 text-slate-600">Secure Cloud Shell Access</span>
                  </div>
                </div>

                <form action={signInWithGoogle} className="w-full">
                  <button 
                    type="submit"
                    className="cockpit-lever w-full py-4 flex items-center justify-center gap-3 bg-white text-black hover:bg-slate-200 transition-all font-black text-sm tracking-widest border-none"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    CONTINUE WITH GOOGLE
                  </button>
                </form>
              </>
            ) : isApprovedTester ? (
              <Link 
                href="/operator/dashboard" 
                className="cockpit-lever w-full py-4 flex items-center justify-center gap-3 bg-green-600 text-white hover:bg-green-600/80 transition-all font-black text-sm tracking-widest"
              >
                ENTER OPERATOR CONSOLE
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="text-center p-4 border border-slate-800 rounded bg-slate-900/50">
                <p className="text-xs text-slate-500 italic">
                  Authorization Required: Your account is not registered as an Approved Tester.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Core Calibration Active</span>
          </div>
          <StatusIndicators />
        </div>
      </div>
    </div>
  );
}
