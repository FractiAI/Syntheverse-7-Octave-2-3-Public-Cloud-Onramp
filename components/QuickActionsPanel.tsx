/**
 * Quick Actions Panel
 * Horizontal bar across the top for quick navigation
 */

'use client';

import Link from 'next/link';
import { BookOpen, Shield, Settings, FileText } from 'lucide-react';
import { ClientProfileDropdown } from './ClientProfileDropdown';

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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Quick Actions Links */}
          <div className="flex items-center gap-2 flex-wrap">
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
          
          {/* Account Icon - Top Right (hidden on mobile, shown in CockpitHeader) */}
          <div className="hidden lg:flex items-center">
            <ClientProfileDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}

