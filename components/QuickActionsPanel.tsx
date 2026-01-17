/**
 * Quick Actions Panel
 * Horizontal bar across the top for quick navigation
 */

'use client';

import Link from 'next/link';
import { BookOpen, Shield, Settings, FileText, LayoutDashboard } from 'lucide-react';
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
            {/* Active Interfaces */}
            {isOperator && (
              <Link 
                href="/operator/dashboard" 
                className="cockpit-lever inline-flex items-center border-[#4169E1] text-[#4169E1] whitespace-nowrap py-1.5 px-3 text-xs font-bold"
              >
                <Settings className="mr-1.5 h-3 w-3" />
                <span>Tesla Console</span>
              </Link>
            )}

            <Link 
              href="/onboarding" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <BookOpen className="mr-1.5 h-3 w-3" />
              Onboarding
            </Link>
            <Link 
              href="/submit" 
              className="cockpit-lever inline-flex items-center whitespace-nowrap py-1.5 px-3 text-xs"
            >
              <span className="mr-1.5">✎</span>
              Submit
            </Link>
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

