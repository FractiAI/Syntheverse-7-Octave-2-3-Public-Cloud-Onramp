/**
 * Quick Actions Panel
 * Upper right floating panel for quick navigation
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
      <div className="cockpit-panel p-3">
        <div className="mb-2 border-b border-[var(--keyline-primary)] pb-2">
          <div className="cockpit-label text-[10px] uppercase tracking-wider">
            QUICK ACTIONS
          </div>
        </div>
        <div className="space-y-1">
          <Link 
            href="/dashboard" 
            className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
          >
            <span className="mr-2">◎</span>
            <span className="hidden sm:inline">Contributor Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
          <Link 
            href="/fractiai" 
            className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
          >
            <span className="mr-2">◎</span>
            FractiAI
          </Link>
          <Link 
            href="/onboarding" 
            className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
          >
            <BookOpen className="mr-2 inline h-3 w-3" />
            <span className="hidden sm:inline">Onboarding Navigator</span>
            <span className="sm:hidden">Onboarding</span>
          </Link>
          <Link 
            href="/submit" 
            className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
          >
            <span className="mr-2">✎</span>
            <span className="hidden sm:inline">Submit Contribution</span>
            <span className="sm:hidden">Submit</span>
          </Link>
          <Link 
            href="/blog" 
            className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
          >
            <FileText className="mr-2 inline h-3 w-3" />
            Blog
          </Link>
          <div className="py-1.5 px-2">
            <GenesisButtonQuickAction />
          </div>
          {isCreator && (
            <Link 
              href="/creator/dashboard" 
              className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
            >
              <Shield className="mr-2 inline h-3 w-3" />
              <span className="hidden sm:inline">Creator Dashboard</span>
              <span className="sm:hidden">Creator</span>
            </Link>
          )}
          {isOperator && !isCreator && (
            <Link 
              href="/operator/dashboard" 
              className="cockpit-lever block w-full text-left py-1.5 px-2 text-xs"
            >
              <Settings className="mr-2 inline h-3 w-3" />
              <span className="hidden sm:inline">Operator Dashboard</span>
              <span className="sm:hidden">Operator</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

