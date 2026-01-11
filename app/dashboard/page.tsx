/**
 * Leonardo da Vinci Contributors Lab™
 * "Learning never exhausts the mind" - Renaissance Workshop for Universal Creators
 * Human-Centered Design Applied to Contribution & Discovery
 * Accessible to all authenticated contributors
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CloudChannel } from '@/components/CloudChannel';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { HeroPanel } from '@/components/HeroPanel';
import { ObservationalStudiesNavigator } from '@/components/contributor/ObservationalStudiesNavigator';
import { WorkshopToolsNavigator } from '@/components/contributor/WorkshopToolsNavigator';
import { InventionNotebooksNavigator } from '@/components/contributor/InventionNotebooksNavigator';
import { Eye, Palette, ScrollText, Settings, Database } from 'lucide-react';
import Image from 'next/image';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { StabilityMonitor } from '@/components/tsrc';
import '../dashboard-cockpit.css';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const user = data.user;

  // Get user data from database
  let dbUser = null;

  try {
    const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email!));
    if (userResult.length > 0) {
      dbUser = userResult[0];
    }
  } catch (dbError) {
    console.error('Error fetching user data:', dbError);
  }

  // Get display name: prefer database name, fallback to email username, then full email
  const displayName = dbUser?.name || user.email?.split('@')[0] || user.email || 'User';

  // Check user role
  const { isCreator, isOperator } = await getAuthenticatedUserWithRole();

  return (
    <div className="min-h-screen relative flex flex-col" style={{
      background: 'linear-gradient(135deg, #1a1410 0%, #2a1810 50%, #1a1410 100%)',
    }}>
      {/* Parchment/Sketch Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(205, 133, 63, 0.05) 25%, rgba(205, 133, 63, 0.05) 26%, transparent 27%, transparent 74%, rgba(205, 133, 63, 0.05) 75%, rgba(205, 133, 63, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(205, 133, 63, 0.05) 25%, rgba(205, 133, 63, 0.05) 26%, transparent 27%, transparent 74%, rgba(205, 133, 63, 0.05) 75%, rgba(205, 133, 63, 0.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
          width: '100%',
          height: '100%',
        }}></div>
      </div>
      
      {/* Leonardo da Vinci Contributors Lab Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(205, 133, 63, 0.15), rgba(218, 165, 32, 0.08))',
        borderBottom: '3px solid #CD853F',
        boxShadow: '0 4px 20px rgba(205, 133, 63, 0.3)',
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Vitruvian Man Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/vitruvian-man.svg" 
                  alt="Vitruvian Man" 
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
                  Leonardo da Vinci Contributors Lab™
                </h1>
                <p className="text-sm md:text-base mt-1" style={{color: 'rgba(205, 133, 63, 0.8)'}}>
                  Renaissance Workshop · Universal Curiosity · Human-Centered Design
                </p>
                <p className="text-xs mt-1 italic" style={{color: 'rgba(218, 165, 32, 0.7)', fontFamily: 'Georgia, serif'}}>
                  "Learning never exhausts the mind."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(205, 133, 63, 0.7)'}}>
                  Workshop Time
                </div>
                <div className="text-lg font-mono font-bold" style={{color: '#CD853F'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
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

      {/* Quick Actions Panel - Top Bar with Account Icon */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={false} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-[1400px]">
          {/* Mobile Status Indicators */}
          <div className="block md:hidden mb-6">
            <MobileStatusIndicators />
          </div>

          {/* SYNTH 90T ERC-20 MOTHERLODE - Compact Display at Top */}
          <div className="cockpit-panel p-4 mb-6" style={{
            borderLeft: '4px solid #B8860B',
            background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-[#B8860B]" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#B8860B] font-bold">
                    SYNTH 90T ERC-20 MOTHERLODE BLOCKMINE
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    <span className="font-semibold">AWARENESS KEY:</span> AWARENESSVERSE v2.0 · Fractal Holographic Hydrogen Awareness · Outcast Hero Story
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-[var(--text-secondary)]">Total Supply</div>
                  <div className="text-lg font-bold text-[#B8860B]">90T</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--text-secondary)]">Remaining</div>
                  <div className="text-lg font-bold text-[#FFD700]">90.00T</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--text-secondary)]">Status</div>
                  <div className="text-sm font-bold text-green-500">ACTIVE</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-[var(--text-secondary)] p-2 bg-amber-900/10 border border-amber-900/30 rounded">
              <strong>ERC-20 BOUNDARY:</strong> SYNTH tokens are internal coordination units for protocol accounting only. Not an investment, security, or financial instrument. No guaranteed value, no profit expectation, no external exchange planned.
            </div>
          </div>

          {/* Renaissance Navigation Paths - Moved to Top */}
          {(isCreator || isOperator) && (
            <div className="cockpit-panel p-4 mb-6" style={{
              borderLeft: '4px solid #D2691E',
              background: 'linear-gradient(135deg, rgba(210, 105, 30, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            }}>
              <div className="flex items-center gap-3 mb-3">
                <ScrollText className="h-5 w-5 text-[#D2691E]" />
                <div>
                  <h2 className="text-base font-bold text-[#D2691E]" style={{fontFamily: 'Georgia, serif'}}>
                    Master's Studio Access
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Advanced workshops for system architects and operators
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {isCreator && (
                  <Link 
                    href="/creator/dashboard" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700] rounded transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Fuller Creator Studio</span>
                  </Link>
                )}
                {(isCreator || isOperator) && (
                  <Link 
                    href="/operator/dashboard" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4169E1]/10 hover:bg-[#4169E1]/20 text-[#4169E1] border border-[#4169E1] rounded transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Faraday Operator Console</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Cloud Channel - Collapsible Top Panel */}
          <div className="mb-6">
            <CloudChannel />
          </div>

          {/* System Broadcast Banners */}
          <div className="mb-6">
            <OperatorBroadcastBanner />
          </div>

          {/* Observational Studies Navigator */}
          <ObservationalStudiesNavigator />

          {/* Workshop Tools Navigator */}
          <WorkshopToolsNavigator 
            userEmail={user.email!} 
            isCreator={isCreator} 
            isOperator={isOperator} 
          />

          {/* Invention Notebooks Navigator */}
          <InventionNotebooksNavigator userEmail={user.email!} />

          {/* TSRC Stability Monitor - Moved to Bottom */}
          <div className="cockpit-panel mb-6" style={{
            borderLeft: '4px solid #B8860B',
            background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="p-4 md:p-5 border-b border-[var(--keyline-primary)]">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-[#B8860B]" />
                <div>
                  <div className="cockpit-label text-xs md:text-sm uppercase tracking-wider text-[#B8860B]">
                    TSRC STABILITY MONITOR
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    System Harmony & Proportional Balance
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <StabilityMonitor
                modeState="growth"
                stabilitySignals={{
                  clamp_rate: 0.12,
                  overlap_drift: 0.08,
                  pressure: 0.45,
                  stability_margin: 0.73
                }}
                variant="full"
              />
            </div>
          </div>

          {/* Leonardo's Closing Wisdom */}
          <div className="cockpit-panel p-6 text-center" style={{
            background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.1) 0%, rgba(218, 165, 32, 0.05) 100%)',
            borderTop: '2px solid #CD853F',
          }}>
            <div className="text-3xl mb-3">✒️</div>
            <p className="text-sm text-[var(--text-secondary)] italic mb-2" style={{fontFamily: 'Georgia, serif'}}>
              "I have been impressed with the urgency of doing. Knowing is not enough; we must apply. 
              Being willing is not enough; we must do."
            </p>
            <p className="text-xs" style={{color: '#CD853F'}}>
              — Leonardo da Vinci, Codex Atlanticus
            </p>
          </div>
        </div>
      </div>

      {/* Hero Panel - Fixed Bottom Right */}
      <HeroPanel pageContext="dashboard" pillarContext="contributor" userEmail={user.email!} />
    </div>
  );
}
