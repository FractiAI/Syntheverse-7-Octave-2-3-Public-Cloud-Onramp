/**
 * SynthScan™ Operator Station
 * Focused on PoS Submission and Review
 * Medical-grade MRI control panel aesthetic
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { FrontierModule } from '@/components/FrontierModule';
import { FileText, Search, CheckCircle2, Activity } from 'lucide-react';
import Link from 'next/link';
import '@/app/synthscan-mri.css';

export const dynamic = 'force-dynamic';

export default async function OperatorLab() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { user, isOperator } = await getAuthenticatedUserWithRole();

  // Only Operators can access this station
  if (!isOperator || !user?.email) {
    redirect('/');
  }

  const userEmail = user?.email;
  if (!userEmail) {
    redirect('/');
  }

  return (
    <div className="mri-control-panel">
      {/* SynthScan MRI Header */}
      <div className="mri-header">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl font-bold text-blue-600">FractiAI</div>
              <div className="h-8 w-px bg-blue-300"></div>
              <div className="mri-system-name">SYNTHSCAN™ OPERATOR STATION</div>
            </div>
            <div className="mri-title">Proof-of-Contribution Operations</div>
            <div className="mri-subtitle">
              Submit and review PoS submissions · HHF-AI Spin Resonance Imaging
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="mri-status-display">
              <div className="mri-status-label">System Status</div>
              <div className="mri-status-value">
                <div className="mri-status-indicator"></div>
                <span>OPERATIONAL</span>
              </div>
            </div>
            <div className="mri-operator-panel">
              <div className="mri-operator-info">
                <div className="mri-operator-label">Authorized Operator</div>
                <div className="mri-operator-value">{userEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Container */}
      <div className="container mx-auto max-w-7xl px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Submit PoS Section */}
          <div className="mri-exam-card">
            <div className="mri-exam-header">
              <div className="mri-exam-type">
                <div className="mri-exam-icon">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="mri-exam-type-label">Primary Operation</div>
                  <div className="mri-exam-type-value">Submit PoS</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="mri-input-section">
                <div className="mri-section-header">New Submission Protocol</div>
                <p className="text-sm text-slate-600 mb-4">
                  Initiate a new Proof-of-Contribution submission for SynthScan™ MRI evaluation. 
                  All submissions undergo hydrogen spin-mediated resonance imaging analysis.
                </p>
                <Link 
                  href="/submit"
                  className="mri-start-exam-btn inline-flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Begin New Submission</span>
                </Link>
              </div>
              
              <div className="mri-signal-meter">
                <div className="mri-signal-label">Transmission Protocol</div>
                <div className="mri-signal-value mri-signal-normal">
                  Zero-Delta Integrity · Authorized
                </div>
              </div>
            </div>
          </div>

          {/* Review Submissions Section */}
          <div className="mri-exam-card">
            <div className="mri-exam-header">
              <div className="mri-exam-type">
                <div className="mri-exam-icon">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="mri-exam-type-label">Review Operation</div>
                  <div className="mri-exam-type-value">Review PoS Archive</div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="mri-input-section">
                <div className="mri-section-header">Submission Archive</div>
                <p className="text-sm text-slate-600 mb-4">
                  Browse, review, and analyze submitted Proof-of-Contribution entries. 
                  View SynthScan™ MRI evaluation reports and diagnostic results.
                </p>
                <div className="mri-signal-meter">
                  <div className="mri-signal-label">Archive Status</div>
                  <div className="mri-signal-value mri-signal-normal">
                    Active · Real-time Updates
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Review Panel - Full Width */}
        <div className="mri-exam-card">
          <div className="mri-exam-header">
            <div className="mri-exam-type">
              <div className="mri-exam-icon">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="mri-exam-type-label">Active Review Console</div>
                <div className="mri-exam-type-value">PoS Submission Archive</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <FrontierModule userEmail={userEmail} />
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white py-4 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="mri-status-indicator"></div>
              <span className="text-slate-600 font-semibold">System Status: Operational</span>
            </div>
            <div className="text-center text-slate-600">
              SynthScan™ Operator Station · HHF-AI MRI Evaluation System
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-slate-600 font-semibold">Security: Authorized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
