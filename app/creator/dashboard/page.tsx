/**
 * Buckminster Fuller Creator Studio™
 * "Doing More with Less" - Comprehensive Design Science Command Center
 * Geodesic Principles Applied to Reality Worldbuilding
 * Only accessible to Creator (info@fractiai.com)
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { CreatorCockpitNavigation } from '@/components/creator/CreatorCockpitNavigation';
import { CreatorUserManagement } from '@/components/creator/CreatorUserManagement';
import { StatusPanel } from '@/components/StatusPanel';
import { FrontierModule } from '@/components/FrontierModule';
import { CreatorEnterpriseSandboxes } from '@/components/creator/CreatorEnterpriseSandboxes';
import { CloudNavigator } from '@/components/CloudNavigator';
import { WorkChatNavigator } from "@/components/WorkChatNavigator";
import { BroadcastArchiveNavigator } from '@/components/BroadcastArchiveNavigator';
import { QuickActionsPanel } from '@/components/QuickActionsPanel';
import { OperatorBroadcastBanner } from '@/components/OperatorBroadcastBanner';
import HeroCreatorConsole from '@/components/HeroCreatorConsole';
import { SystemMetricsNavigator } from '@/components/creator/SystemMetricsNavigator';
import { SalesTrackingNavigator } from '@/components/creator/SalesTrackingNavigator';
import { ReferenceCustomersNavigator } from '@/components/creator/ReferenceCustomersNavigator';
import { ActivityAnalyticsNavigator } from '@/components/creator/ActivityAnalyticsNavigator';
import { Shield, Settings, Users, Sparkles, Hexagon } from 'lucide-react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MobileStatusIndicators } from '@/components/MobileStatusIndicators';
import { MultiplierToggleWrapper } from '@/components/MultiplierToggleWrapper';
import { HeroPanel } from '@/components/HeroPanel';
import Image from 'next/image';
import '../../control-lab.css';

export const dynamic = 'force-dynamic';

export default async function CreatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

  // Allow Creator and Operators (enterprises) to access this dashboard
  // Operators can see their own enterprise sandboxes
  if ((!isCreator && !isOperator) || !user?.email) {
    redirect('/dashboard');
  }

  // TypeScript guard: ensure user and email exist after checks
  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)',
    }}>
      {/* Geodesic Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div style={{
          backgroundImage: `
            linear-gradient(60deg, #FFD700 1px, transparent 1px),
            linear-gradient(120deg, #FFD700 1px, transparent 1px),
            linear-gradient(180deg, #FFD700 1px, transparent 1px)
          `,
          backgroundSize: '50px 87px, 50px 87px, 50px 50px',
          backgroundPosition: '0 0, 25px 43.5px, 0 0',
          width: '100%',
          height: '100%',
        }}></div>
      </div>
      
      {/* Buckminster Fuller Creator Studio Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05))',
        borderBottom: '3px solid #FFD700',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Geodesic Dome Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/geodesic-dome.svg" 
                  alt="Geodesic Dome" 
                  width={64} 
                  height={64}
                  className="animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{
                  color: '#FFD700',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                }}>
                  Buckminster Fuller Creator Studio™
                </h1>
                <p className="text-sm md:text-base mt-1" style={{color: 'rgba(255, 215, 0, 0.7)'}}>
                  Comprehensive Anticipatory Design Science · Ephemeralization · Synergetic Geometry
                </p>
                <p className="text-xs mt-1 italic" style={{color: 'rgba(255, 215, 0, 0.5)'}}>
                  "We are called to be architects of the future, not its victims."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(255, 215, 0, 0.6)'}}>
                  Dymaxion Time
                </div>
                <div className="text-lg font-mono font-bold" style={{color: '#FFD700'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#FFD700] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #FFD700',
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Panel - Top Bar */}
      <StatusPanel />
      {/* Quick Actions Panel - Upper Right */}
      <QuickActionsPanel isCreator={isCreator} isOperator={isOperator} showContributorDashboard={true} />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto space-y-6 px-6 py-8">
          {/* Mobile Status Indicators */}
          <div className="block md:hidden">
            <MobileStatusIndicators />
          </div>

          {/* Bucky's Welcome Message */}
          <div className="cockpit-panel p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
            borderLeft: '4px solid #FFD700',
          }}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">🌐</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2" style={{color: '#FFD700'}}>
                  Comprehensive Anticipatory Design Science
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  This studio embodies Buckminster Fuller's principles: <strong>synergetic geometry</strong>, 
                  <strong> ephemeralization</strong> (doing more with less), and <strong>tensegrity</strong> 
                  (tension + integrity). Each section below represents a facet of the geodesic whole.
                </p>
                <p className="text-xs italic" style={{color: 'rgba(255, 215, 0, 0.7)'}}>
                  "You never change things by fighting the existing reality. To change something, 
                  build a new model that makes the existing model obsolete."
                </p>
              </div>
            </div>
          </div>

          {/* System Broadcast Banners */}
          <OperatorBroadcastBanner />

          {/* Scoring Multiplier Controls */}
          <MultiplierToggleWrapper />

          {/* World System Navigators - Bucky's Comprehensive View */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #FFD700',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Hexagon className="h-6 w-6 text-[#FFD700]" />
                <h2 className="text-xl font-bold" style={{color: '#FFD700'}}>
                  World System Navigation
                </h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Tensegrity structures for comprehensive world coordination
              </p>
            </div>
            <div className="space-y-4">
              <CloudNavigator userEmail={userEmail} isCreator={isCreator} isOperator={isOperator} />
              <FrontierModule userEmail={userEmail} />
              <WorkChatNavigator />
              <BroadcastArchiveNavigator />
            </div>
          </div>

          {/* Creator Control Panel */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #FF4444',
            background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-red-500">Creator Command Authority</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  System administration and operational control
                </p>
              </div>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500 rounded transition-colors">
              <Shield className="h-4 w-4" />
              <span>Blog Management</span>
            </Link>
          </div>

          {/* User Management */}
          {isCreator && (
            <div className="cockpit-panel p-6" style={{
              borderLeft: '4px solid #9370DB',
              background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-[#9370DB]" />
                <div>
                  <h2 className="text-xl font-bold text-[#9370DB]">Human Network Coordination</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Operator privileges and access control
                  </p>
                </div>
              </div>
              <CreatorUserManagement />
            </div>
          )}

          {/* System Synergetics - Metrics */}
          <SystemMetricsNavigator />

          {/* Hero Creator Console */}
          {isCreator && (
            <div className="cockpit-panel p-6" style={{
              borderLeft: '4px solid #00CED1',
              background: 'linear-gradient(135deg, rgba(0, 206, 209, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-[#00CED1]" />
                <div>
                  <h2 className="text-xl font-bold text-[#00CED1]">🤖 AI Persona Architect</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Hero catalog & story narrative management
                  </p>
                </div>
              </div>
              <HeroCreatorConsole />
            </div>
          )}

          {/* Configuration Controls */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #4169E1',
            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-[#4169E1]" />
              <div>
                <h2 className="text-xl font-bold text-[#4169E1]">System Configuration Matrix</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Database, archive, and operational controls
                </p>
              </div>
            </div>
            <CreatorCockpitNavigation />
          </div>

          {/* Enterprise Clouds */}
          {(isCreator || isOperator) && (
            <div className="cockpit-panel p-6" style={{
              borderLeft: '4px solid #32CD32',
              background: 'linear-gradient(135deg, rgba(50, 205, 50, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Hexagon className="h-6 w-6 text-[#32CD32]" />
                <div>
                  <h2 className="text-xl font-bold text-[#32CD32]">Enterprise Cloud Structures</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Nested reality configuration & management
                  </p>
                </div>
              </div>
              <div className="mb-4 p-3 bg-[#32CD32]/5 border-l-2 border-[#32CD32] rounded">
                <p className="text-sm text-[var(--text-secondary)] italic">
                  "A geodesic dome is a spherical space frame structure based on a network of great circles 
                  lying on the surface of a sphere. The interconnections provide structural integrity."
                  <span className="block mt-2 text-xs text-[#32CD32]">— R. Buckminster Fuller</span>
                </p>
              </div>
              <CreatorEnterpriseSandboxes />
            </div>
          )}

          {/* Economic Ephemeralization - Sales */}
          {isCreator && <SalesTrackingNavigator />}

          {/* World Game Partners - Reference Customers */}
          {isCreator && <ReferenceCustomersNavigator />}

          {/* Pattern Integrity - Activity Analytics */}
          <ActivityAnalyticsNavigator />

          {/* Bucky's Closing Wisdom */}
          <div className="cockpit-panel p-6 text-center" style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
            borderTop: '2px solid #FFD700',
          }}>
            <div className="text-3xl mb-3">⬡</div>
            <p className="text-sm text-[var(--text-secondary)] italic mb-2">
              "I'm not trying to counsel any of you to do anything really special except dare to think. 
              And to dare to go with the truth. And to dare to love completely."
            </p>
            <p className="text-xs" style={{color: '#FFD700'}}>
              — R. Buckminster Fuller, Operating Manual for Spaceship Earth
            </p>
          </div>
        </div>
      </div>
      
      {/* Hero Panel - Fixed Bottom Right - Buckminster Fuller himself! */}
      <HeroPanel pageContext="creator" pillarContext="creator" userEmail={userEmail} />
    </div>
  );
}

