/**
 * Michael Faraday Operator's Console™
 * "Nothing is too wonderful to be true" - Electromagnetic Command Center
 * Victorian Experimental Science Applied to Cloud Operations
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
import { Settings, Zap, FlaskConical, BookOpen, Activity } from 'lucide-react';
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
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a1a 50%, #0a0a1a 100%)',
    }}>
      {/* Electromagnetic Field Lines Background */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div style={{
          backgroundImage: `
            radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(65, 105, 225, 0.03) 40%, transparent 40.5%),
            radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(147, 112, 219, 0.03) 60%, transparent 60.5%),
            radial-gradient(ellipse at center, transparent 0%, transparent 80%, rgba(123, 104, 238, 0.03) 80%, transparent 80.5%)
          `,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          width: '100%',
          height: '100%',
        }}></div>
      </div>
      
      {/* Michael Faraday Operator's Console Header */}
      <div className="relative z-10 flex-shrink-0" style={{
        background: 'linear-gradient(to right, rgba(65, 105, 225, 0.15), rgba(147, 112, 219, 0.08))',
        borderBottom: '3px solid #4169E1',
        boxShadow: '0 4px 20px rgba(65, 105, 225, 0.3)',
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Faraday Candle Icon */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image 
                  src="/faraday-candle.svg" 
                  alt="Faraday's Candle" 
                  width={64} 
                  height={64}
                  className="animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{
                  color: '#4169E1',
                  textShadow: '0 0 20px rgba(65, 105, 225, 0.5)',
                }}>
                  Michael Faraday Operator's Console™
                </h1>
                <p className="text-sm md:text-base mt-1" style={{color: 'rgba(65, 105, 225, 0.8)'}}>
                  Electromagnetic Discovery · Experimental Observation · Lines of Force
                </p>
                <p className="text-xs mt-1 italic" style={{color: 'rgba(147, 112, 219, 0.7)'}}>
                  "Nothing is too wonderful to be true, if it be consistent with the laws of nature."
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{color: 'rgba(65, 105, 225, 0.7)'}}>
                  Laboratory Time
                </div>
                <div className="text-lg font-mono font-bold" style={{color: '#4169E1'}}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#4169E1] animate-pulse shadow-lg" style={{
                boxShadow: '0 0 10px #4169E1',
              }}></div>
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

          {/* Faraday's Welcome Message */}
          <div className="cockpit-panel p-6" style={{
            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1) 0%, rgba(147, 112, 219, 0.05) 100%)',
            borderLeft: '4px solid #4169E1',
          }}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">🕯️</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2" style={{color: '#4169E1'}}>
                  The Experimental Philosophy of Operations
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  This console embodies Michael Faraday's principles: <strong>electromagnetic induction</strong>, 
                  <strong> experimental rigor</strong>, and <strong>lines of force</strong>. Each section below 
                  represents an instrument in the grand apparatus of discovery.
                </p>
                <p className="text-xs italic" style={{color: 'rgba(147, 112, 219, 0.8)'}}>
                  "The important thing is to know how to take all things quietly. I have been so electrically 
                  occupied of late that I feel as if hungry for a little chemistry."
                </p>
              </div>
            </div>
          </div>

          {/* System Broadcast Banners */}
          <OperatorBroadcastBanner />

          {/* Scoring Multiplier Controls */}
          <MultiplierToggleWrapper />

          {/* Electromagnetic Navigation Fields */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #7B68EE',
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-[#7B68EE]" />
                <h2 className="text-xl font-bold" style={{color: '#7B68EE'}}>
                  Electromagnetic Navigation Fields
                </h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Navigate the invisible forces that bind the system together
              </p>
            </div>
            <div className="space-y-4">
              <CloudNavigator userEmail={userEmail} isCreator={false} isOperator={isOperator} />
              <FrontierModule userEmail={userEmail} />
              <WorkChatNavigator />
              <BroadcastArchiveNavigator />
            </div>
          </div>

          {/* Hero Operator Panel */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #BA55D3',
            background: 'linear-gradient(135deg, rgba(186, 85, 211, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical className="h-6 w-6 text-[#BA55D3]" />
              <div>
                <h2 className="text-xl font-bold text-[#BA55D3]">🤖 Experimental Hosts & Operators</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  AI assistants configured for your cloud operations
                </p>
              </div>
            </div>
            <HeroOperatorPanel />
          </div>

          {/* Michael Faraday AI Guide */}
          <div className="fixed bottom-4 left-4 z-50">
            <HeroAIManager
              pageContext="operator"
              additionalContext="Operator Console - Cloud management, system monitoring, and experimental operations"
            />
          </div>

          {/* Field Measurements Navigator */}
          <FieldMeasurementsNavigator />

          {/* Laboratory Apparatus Navigator */}
          <LaboratoryApparatusNavigator />

          {/* Cloud Operations Authority */}
          <div className="cockpit-panel p-6" style={{
            borderLeft: '4px solid #4682B4',
            background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-[#4682B4]" />
              <div>
                <h2 className="text-xl font-bold text-[#4682B4]">Cloud Operations Authority</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Command interface for system administration
                </p>
              </div>
            </div>
            <div className="mb-4 p-3 bg-[#4682B4]/5 border-l-2 border-[#4682B4] rounded">
              <p className="text-sm text-[var(--text-secondary)] italic">
                "The five regular solids, the sphere, and the cylinder are the only perfect forms. All others are but approximations."
                <span className="block mt-2 text-xs text-[#4682B4]">— Michael Faraday on geometric perfection</span>
              </p>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-[#4682B4]/10 hover:bg-[#4682B4]/20 text-[#4682B4] border border-[#4682B4] rounded transition-colors mr-3">
              <BookOpen className="h-4 w-4" />
              <span>Laboratory Blog</span>
            </Link>
            <Link href="/mri-scanner" className="inline-flex items-center gap-2 px-4 py-2 bg-[#4169E1]/10 hover:bg-[#4169E1]/20 text-[#4169E1] border border-[#4169E1] rounded transition-colors font-bold">
              <Activity className="h-4 w-4" />
              <span>MRI Test Console</span>
            </Link>
          </div>

          {/* Experimental Records Navigator */}
          <ExperimentalRecordsNavigator />

          {/* Faraday's Closing Wisdom */}
          <div className="cockpit-panel p-6 text-center" style={{
            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1) 0%, rgba(147, 112, 219, 0.05) 100%)',
            borderTop: '2px solid #4169E1',
          }}>
            <div className="text-3xl mb-3">⚡</div>
            <p className="text-sm text-[var(--text-secondary)] italic mb-2">
              "Work. Finish. Publish. The lectures I shall deliver for the Royal Institution will be 
              of the most perfect experimental kind, and I am preparing all the necessary apparatus."
            </p>
            <p className="text-xs" style={{color: '#4169E1'}}>
              — Michael Faraday, Royal Institution Christmas Lectures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
