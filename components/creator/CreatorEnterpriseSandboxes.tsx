'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Pause, Coins, Activity, Users, Zap, AlertCircle } from 'lucide-react';
import { Card } from '../landing/shared/Card';
import { formatSynthAmount, getLowBalanceWarning } from '@/utils/enterprise/synth-pricing';

type EnterpriseSandbox = {
  id: string;
  name: string;
  description: string | null;
  operator: string;
  vault_status: string;
  synth_balance: string | null;
  synth_activated: boolean | null;
  synth_activated_at: string | null;
  testing_mode: boolean | null;
  current_reach_tier: string | null;
  created_at: string;
  contribution_count?: number;
  qualified_count?: number;
};

type SandboxMetrics = {
  unique_contributors: number;
  total_submissions: number;
  total_evaluations: number;
  total_registrations: number;
  total_allocations: number;
};

type SandboxWithMetrics = EnterpriseSandbox & {
  metrics?: SandboxMetrics;
  pricing?: {
    reach_tier: string;
    monthly_rent: number;
    projected_monthly_cost: number;
  };
  warning?: 'none' | 'warning' | 'critical';
};

export function CreatorEnterpriseSandboxes() {
  const [sandboxes, setSandboxes] = useState<SandboxWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSandboxes();
    const interval = setInterval(fetchSandboxes, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchSandboxes() {
    try {
      // Fetch sandboxes (API already filters by operator email)
      const res = await fetch('/api/enterprise/sandboxes');
      if (res.ok) {
        const data = await res.json();
        const sandboxList: EnterpriseSandbox[] = data.sandboxes || [];

        // Fetch metrics and pricing for each sandbox
        const sandboxesWithMetrics = await Promise.all(
          sandboxList.map(async (sandbox) => {
            try {
              // Fetch balance and metrics
              const balanceRes = await fetch(`/api/enterprise/sandboxes/${sandbox.id}/synth-balance`);
              if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                return {
                  ...sandbox,
                  metrics: balanceData.metrics,
                  pricing: balanceData.pricing,
                  warning: balanceData.warning,
                  synth_balance: balanceData.balance,
                  synth_activated: balanceData.activated,
                  synth_activated_at: balanceData.activated_at,
                  testing_mode: balanceData.testing_mode,
                  current_reach_tier: balanceData.current_reach_tier,
                };
              }
            } catch (error) {
              console.error(`Error fetching metrics for sandbox ${sandbox.id}:`, error);
            }
            return sandbox;
          })
        );

        setSandboxes(sandboxesWithMetrics);
      }
    } catch (error) {
      console.error('Error fetching sandboxes:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(sandbox: SandboxWithMetrics) {
    if (sandbox.testing_mode) {
      return (
        <span className="cockpit-badge bg-blue-500/20 text-blue-400 border-blue-500/50">
          Testing
        </span>
      );
    }
    if (sandbox.synth_activated) {
      return (
        <span className="cockpit-badge bg-green-500/20 text-green-400 border-green-500/50">
          Activated
        </span>
      );
    }
    return (
      <span className="cockpit-badge bg-amber-500/20 text-amber-400 border-amber-500/50">
        Inactive
      </span>
    );
  }

  function getWarningBadge(warning: 'none' | 'warning' | 'critical' | undefined) {
    if (!warning || warning === 'none') return null;

    if (warning === 'critical') {
      return (
        <div className="mt-2 flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 p-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="cockpit-text text-xs text-red-400">Critical: Low SYNTH balance</span>
        </div>
      );
    }

    return (
      <div className="mt-2 flex items-center gap-2 rounded border border-amber-500/50 bg-amber-500/10 p-2">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <span className="cockpit-text text-xs text-amber-400">Warning: Low SYNTH balance</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4">MY ENTERPRISE SANDBOXES</div>
        <div className="cockpit-text opacity-60">Loading sandboxes...</div>
      </div>
    );
  }

  if (sandboxes.length === 0) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4">MY ENTERPRISE SANDBOXES</div>
        <div className="cockpit-text mb-4 opacity-60">
          You don&apos;t have any enterprise sandboxes yet. Create one to get started.
        </div>
        <Link
          href="/fractiai/enterprise-dashboard"
          className="cockpit-lever inline-flex items-center gap-2"
        >
          Create Sandbox
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="cockpit-panel p-6">
      <div className="cockpit-label mb-4 flex items-center justify-between">
        <span>MY ENTERPRISE SANDBOXES</span>
        <Link
          href="/fractiai/enterprise-dashboard"
          className="cockpit-lever inline-flex items-center gap-2 text-sm"
        >
          Manage Sandboxes
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sandboxes.map((sandbox) => (
          <Card key={sandbox.id} hover={true} className="border-l-4 border-[var(--hydrogen-amber)]">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="cockpit-title mb-1 text-lg">{sandbox.name}</div>
                {sandbox.description && (
                  <div className="cockpit-text mb-2 text-xs opacity-75">{sandbox.description}</div>
                )}
              </div>
              {getStatusBadge(sandbox)}
            </div>

            {/* SYNTH Balance */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[var(--hydrogen-amber)]" />
                <div className="cockpit-text text-sm">
                  <strong>Balance:</strong>{' '}
                  {formatSynthAmount(Number(sandbox.synth_balance || 0))}
                </div>
              </div>

              {sandbox.pricing && (
                <div className="cockpit-text text-xs opacity-75">
                  <strong>Reach Tier:</strong> {sandbox.pricing.reach_tier} ·{' '}
                  <strong>Rent:</strong> {formatSynthAmount(sandbox.pricing.monthly_rent)}/month
                </div>
              )}

              {getWarningBadge(sandbox.warning)}
            </div>

            {/* Metrics */}
            {sandbox.metrics && (
              <div className="mb-3 space-y-1 border-t border-[var(--keyline-primary)] pt-3">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                  <span className="cockpit-text text-xs">
                    {sandbox.metrics.unique_contributors} contributors
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                  <span className="cockpit-text text-xs">
                    {sandbox.metrics.total_submissions} submissions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                  <span className="cockpit-text text-xs">
                    {sandbox.metrics.total_evaluations} evaluations
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Link
                href={`/enterprise/sandbox/${sandbox.id}`}
                className="cockpit-lever flex-1 text-center text-sm"
              >
                View Details
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

