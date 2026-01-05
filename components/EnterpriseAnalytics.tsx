'use client';

import { useEffect, useState } from 'react';
import { Card } from './landing/shared/Card';
import { TrendingUp, DollarSign, Activity, Award } from 'lucide-react';

type EnterpriseAnalyticsProps = {
  sandboxId: string;
};

type Analytics = {
  totalContributions: number;
  qualifiedContributions: number;
  evaluatingContributions: number;
  averageScore: number;
  totalCost: number;
  qualifiedRate: number;
  topContributors: Array<{
    contributor: string;
    count: number;
    qualified: number;
    avgScore: number;
  }>;
  scoreDistribution: {
    founder: number;
    pioneer: number;
    community: number;
    ecosystem: number;
    unqualified: number;
  };
};

export default function EnterpriseAnalytics({ sandboxId }: EnterpriseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAnalytics();
  }, [sandboxId]);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text text-sm opacity-75">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text text-sm opacity-75">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card hover={false} className="border-l-4 border-blue-500/50">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-400" />
            <div>
              <div className="cockpit-label mb-1 text-xs">TOTAL CONTRIBUTIONS</div>
              <div className="cockpit-title text-2xl">{analytics.totalContributions}</div>
            </div>
          </div>
        </Card>

        <Card hover={false} className="border-l-4 border-green-500/50">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-green-400" />
            <div>
              <div className="cockpit-label mb-1 text-xs">QUALIFIED</div>
              <div className="cockpit-title text-2xl">{analytics.qualifiedContributions}</div>
              <div className="cockpit-text text-xs opacity-75">
                {analytics.qualifiedRate.toFixed(1)}% rate
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[var(--hydrogen-amber)]" />
            <div>
              <div className="cockpit-label mb-1 text-xs">AVG SCORE</div>
              <div className="cockpit-title text-2xl">
                {analytics.averageScore > 0 ? Math.round(analytics.averageScore).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false} className="border-l-4 border-purple-500/50">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-purple-400" />
            <div>
              <div className="cockpit-label mb-1 text-xs">TOTAL COST</div>
              <div className="cockpit-title text-2xl">${analytics.totalCost.toLocaleString()}</div>
              <div className="cockpit-text text-xs opacity-75">
                ${analytics.totalContributions > 0
                  ? (analytics.totalCost / analytics.totalContributions).toFixed(0)
                  : '0'}{' '}
                per contribution
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
        <div className="cockpit-label mb-4">SCORE DISTRIBUTION</div>
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <div className="cockpit-label mb-1 text-xs">Founder (≥8,000)</div>
            <div className="cockpit-title text-xl">{analytics.scoreDistribution.founder}</div>
          </div>
          <div>
            <div className="cockpit-label mb-1 text-xs">Pioneer (≥6,000)</div>
            <div className="cockpit-title text-xl">{analytics.scoreDistribution.pioneer}</div>
          </div>
          <div>
            <div className="cockpit-label mb-1 text-xs">Community (≥5,000)</div>
            <div className="cockpit-title text-xl">{analytics.scoreDistribution.community}</div>
          </div>
          <div>
            <div className="cockpit-label mb-1 text-xs">Ecosystem (≥4,000)</div>
            <div className="cockpit-title text-xl">{analytics.scoreDistribution.ecosystem}</div>
          </div>
          <div>
            <div className="cockpit-label mb-1 text-xs">Unqualified</div>
            <div className="cockpit-title text-xl">{analytics.scoreDistribution.unqualified}</div>
          </div>
        </div>
      </Card>

      {/* Top Contributors */}
      {analytics.topContributors.length > 0 && (
        <Card hover={false}>
          <div className="cockpit-label mb-4">TOP CONTRIBUTORS</div>
          <div className="space-y-3">
            {analytics.topContributors.map((contributor, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3">
                <div>
                  <div className="cockpit-title text-base">
                    {contributor.contributor.substring(0, 20)}...
                  </div>
                  <div className="cockpit-text text-xs opacity-75">
                    {contributor.count} contributions ({contributor.qualified} qualified)
                  </div>
                </div>
                <div className="text-right">
                  <div className="cockpit-label text-xs">Avg Score</div>
                  <div className="cockpit-title text-lg">
                    {contributor.avgScore > 0 ? Math.round(contributor.avgScore).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

