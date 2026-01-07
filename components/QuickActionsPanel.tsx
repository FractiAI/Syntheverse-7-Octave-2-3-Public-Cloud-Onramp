/**
 * Quick Actions Panel
 * Horizontal bar across the top for quick navigation
 */

import Link from 'next/link';
import { BookOpen, Shield, Settings, FileText } from 'lucide-react';
import { GenesisButtonQuickAction } from './GenesisButtonQuickAction';

interface QuickActionsPanelProps {
  isCreator?: boolean;
  isOperator?: boolean;
  showContributorDashboard?: boolean;
}

export function QuickActionsPanel({
  isCreator = false,
  isOperator = false,
  showContributorDashboard = false,
}: QuickActionsPanelProps) {
  return (
    <div className="cockpit-quick-actions-panel">
      <div className="cockpit-panel px-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* System Status Indicators */}
          <div className="flex items-center gap-3 border-r border-[var(--keyline-primary)] pr-3 mr-1">
            <div className="flex items-center gap-1.5">
              <span className="cockpit-text text-[10px] uppercase tracking-wider opacity-60">Protocol</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="cockpit-text text-[10px] uppercase tracking-wider opacity-60">Blockchain</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="cockpit-text text-[10px] uppercase tracking-wider opacity-60">HHF-AI</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="cockpit-text text-[10px] uppercase tracking-wider opacity-60">SynthScan™</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }}></div>
            </div>
          </div>

          {/* Quick Actions Links */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              href="/dashboard" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <span className="mr-1.5">◎</span>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
            <Link 
              href="/fractiai" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <span className="mr-1.5">◎</span>
              FractiAI
            </Link>
            <Link 
              href="/onboarding" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <BookOpen className="mr-1.5 h-3 w-3" />
              <span className="hidden sm:inline">Onboarding</span>
              <span className="sm:hidden">Learn</span>
            </Link>
            <Link 
              href="/submit" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <span className="mr-1.5">✎</span>
              <span className="hidden sm:inline">Submit</span>
              <span className="sm:hidden">Submit</span>
            </Link>
            <Link 
              href="/blog" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <FileText className="mr-1.5 h-3 w-3" />
              Blog
            </Link>
            <div className="inline-flex items-center">
              <GenesisButtonQuickAction />
            </div>
            {isCreator && (
              <Link 
                href="/creator/dashboard" 
                className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
              >
                <Shield className="mr-1.5 h-3 w-3" />
                <span className="hidden sm:inline">Creator</span>
                <span className="sm:hidden">Creator</span>
              </Link>
            )}
            {isOperator && !isCreator && (
              <Link 
                href="/operator/dashboard" 
                className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
              >
                <Settings className="mr-1.5 h-3 w-3" />
                <span className="hidden sm:inline">Operator</span>
                <span className="sm:hidden">Ops</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

