/**
 * Status Panel
 * Horizontal status panel across the top of the dashboard
 * Shows system status indicators
 */

'use client';

import { useState, useEffect } from 'react';
import { GenesisButton } from './GenesisButton';

interface TestSuiteScore {
  suiteId: string;
  name: string;
  passRate: number;
  passed: number;
  total: number;
  status: 'passed' | 'failed' | 'partial';
}

interface BootStatus {
  bridgeActive: boolean;
  verdict: 'ready' | 'conditional' | 'not_ready' | 'unknown';
  passRate: number;
  totalTests: number;
  timestamp?: string;
  suiteScores: {
    tokenomics?: TestSuiteScore;
    blockchain?: TestSuiteScore;
    calibration?: TestSuiteScore;
    sandbox?: TestSuiteScore;
    constants?: TestSuiteScore;
    scoring?: TestSuiteScore;
  };
}

export function StatusPanel() {
  const [bootStatus, setBootStatus] = useState<BootStatus>({
    bridgeActive: true,
    verdict: 'ready',
    passRate: 0,
    totalTests: 0,
    suiteScores: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/test-report/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data.report) {
          const report = data.report;
          const suites = report.suites || [];
          const suiteScores: BootStatus['suiteScores'] = {};

          const suiteMap: Record<string, keyof BootStatus['suiteScores']> = {
            'tokenomics-validation': 'tokenomics',
            'integration-registration': 'blockchain',
            'calibration-peer-reviewed': 'calibration',
            'sandbox-vector-mapping': 'sandbox',
            'constants-equations-validation': 'constants',
            'scoring-determinism': 'scoring',
          };

          suites.forEach((suite: any) => {
            const category = suiteMap[suite.suiteId];
            if (category) {
              suiteScores[category] = {
                suiteId: suite.suiteId,
                name: suite.name,
                passRate: suite.passRate || 0,
                passed: suite.passed || 0,
                total: suite.totalTests || 0,
                status: suite.status || 'unknown',
              };
            }
          });

          setBootStatus((prev) => ({
            ...prev,
            suiteScores,
          }));
        }
      })
      .catch((err) => {
        console.error('Error fetching test suite scores:', err);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'ready':
        return 'bg-green-500';
      case 'partial':
      case 'conditional':
        return 'bg-yellow-500';
      case 'failed':
      case 'not_ready':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'passed':
      case 'ready':
        return { boxShadow: '0 0 6px #22c55e' };
      case 'partial':
      case 'conditional':
        return { boxShadow: '0 0 6px #eab308' };
      case 'failed':
      case 'not_ready':
        return { boxShadow: '0 0 6px #ef4444' };
      default:
        return {};
    }
  };

  const statusItems = [
    {
      label: 'Tokenomics',
      status: bootStatus.suiteScores.tokenomics?.status || 'unknown',
      key: 'tokenomics',
    },
    {
      label: 'Blockchain',
      status: bootStatus.suiteScores.blockchain?.status || 'unknown',
      key: 'blockchain',
    },
    {
      label: 'Calibration',
      status: bootStatus.suiteScores.calibration?.status || 'unknown',
      key: 'calibration',
    },
    {
      label: 'Sandbox',
      status: bootStatus.suiteScores.sandbox?.status || 'unknown',
      key: 'sandbox',
    },
    {
      label: 'Constants',
      status: bootStatus.suiteScores.constants?.status || 'unknown',
      key: 'constants',
    },
    {
      label: 'Scoring',
      status: bootStatus.suiteScores.scoring?.status || 'unknown',
      key: 'scoring',
    },
  ];

  if (loading) {
    return (
      <div className="cockpit-panel px-4 py-2">
        <div className="cockpit-text text-xs opacity-70">Loading status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Status Indicators Row */}
      <div className="cockpit-panel px-4 py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="cockpit-label text-[10px] uppercase tracking-wider opacity-70 border-r border-[var(--keyline-primary)] pr-4">
            STATUS
          </div>
          {statusItems.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(item.status)}`}
                style={getStatusGlow(item.status)}
                title={`${item.label}: ${item.status.toUpperCase()}`}
              />
              <span className="cockpit-text text-[10px] uppercase tracking-wider opacity-80 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Info Row */}
      <div className="cockpit-panel px-4 py-2">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="cockpit-label text-[10px] uppercase tracking-wider opacity-70 border-r border-[var(--keyline-primary)] pr-4">
            PROTOCOL INFO
          </div>
          <div className="flex items-center gap-1.5">
            <span className="cockpit-text text-[10px] opacity-80">Status:</span>
            <span className="cockpit-text text-[10px] font-mono text-[var(--hydrogen-amber)] font-semibold">PUBLIC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="cockpit-text text-[10px] opacity-80">Client:</span>
            <span className="cockpit-text text-[10px] font-mono">FRACTIAI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="cockpit-text text-[10px] opacity-80">Network:</span>
            <span className="cockpit-text text-[10px] font-mono text-green-400 font-semibold">BASE MAINNET</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="cockpit-text text-[10px] opacity-80">Chain ID:</span>
            <span className="cockpit-text text-[10px] font-mono">8453</span>
          </div>
        </div>
      </div>

      {/* Genesis Status Row */}
      <div className="cockpit-panel px-4 py-2 border-t-2 border-[var(--hydrogen-amber)]/30">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 flex-wrap">
          <div className="cockpit-label text-[10px] uppercase tracking-wider opacity-70 border-r border-[var(--keyline-primary)] pr-4">
            GENESIS STATUS
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="cockpit-text text-[10px] leading-relaxed">
              <strong className="text-[var(--hydrogen-amber)]">SYNTH90T MOTHERLODE VAULT</strong> opens Spring Equinox, March 20, 2026.
            </div>
            <div className="cockpit-text text-[10px] leading-relaxed opacity-85">
              Submission deadline: March 19, 2026
            </div>
          </div>
          <div className="flex-shrink-0">
            <GenesisButton />
          </div>
        </div>
      </div>
    </div>
  );
}

