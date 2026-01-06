'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, FileText, Award, Globe, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

interface ActivityAnalytics {
  realtime: {
    pageActivity: number;
    activeUsers: number;
    submissionsToday: number;
    qualificationsToday: number;
  };
  runrate: {
    pageActivity: TimeSeriesDataPoint[];
    userCount: TimeSeriesDataPoint[];
    submissions: TimeSeriesDataPoint[];
    qualifications: TimeSeriesDataPoint[];
  };
  historical: {
    pageActivity: {
      hourly: TimeSeriesDataPoint[];
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
    };
    userCount: {
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
      monthly: TimeSeriesDataPoint[];
    };
    submissions: {
      hourly: TimeSeriesDataPoint[];
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
    };
    qualifications: {
      daily: TimeSeriesDataPoint[];
      weekly: TimeSeriesDataPoint[];
      monthly: TimeSeriesDataPoint[];
    };
  };
  locations: Array<{ country?: string; region?: string; city?: string; count: number }>;
  qualifications: {
    total: number;
    founder: number;
    pioneer: number;
    community: number;
    ecosystem: number;
  };
}

export function ActivityAnalytics() {
  const [analytics, setAnalytics] = useState<ActivityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalytics();
    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  async function loadAnalytics() {
    try {
      const response = await fetch('/api/activity/analytics?days=30&hours=24');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load activity analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text opacity-60">Loading activity analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text text-red-400">Failed to load activity analytics</div>
      </div>
    );
  }

  // Get data based on selected time range
  const getPageActivityData = () => {
    switch (timeRange) {
      case 'hourly':
        return analytics.historical.pageActivity.hourly;
      case 'daily':
        return analytics.historical.pageActivity.daily;
      case 'weekly':
        return analytics.historical.pageActivity.weekly;
      default:
        return analytics.historical.pageActivity.daily;
    }
  };

  const getSubmissionsData = () => {
    switch (timeRange) {
      case 'hourly':
        return analytics.historical.submissions.hourly;
      case 'daily':
        return analytics.historical.submissions.daily;
      case 'weekly':
        return analytics.historical.submissions.weekly;
      default:
        return analytics.historical.submissions.daily;
    }
  };

  const getQualificationsData = () => {
    switch (timeRange) {
      case 'daily':
        return analytics.historical.qualifications.daily;
      case 'weekly':
        return analytics.historical.qualifications.weekly;
      case 'monthly':
        return analytics.historical.qualifications.monthly;
      default:
        return analytics.historical.qualifications.daily;
    }
  };

  const getUserCountData = () => {
    switch (timeRange) {
      case 'daily':
        return analytics.historical.userCount.daily;
      case 'weekly':
        return analytics.historical.userCount.weekly;
      case 'monthly':
        return analytics.historical.userCount.monthly;
      default:
        return analytics.historical.userCount.daily;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cockpit-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="cockpit-label mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              ACTIVITY ANALYTICS
            </div>
            <h2 className="cockpit-title text-2xl">Real-Time & Historical Runrate</h2>
            <p className="cockpit-text mt-2 text-sm opacity-80">
              Monitor page activity, user growth, submissions, and PoC qualifications over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`cockpit-lever text-xs ${autoRefresh ? 'bg-green-600/20 text-green-400' : ''}`}
            >
              <Clock className="mr-1 inline h-3 w-3" />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button onClick={loadAnalytics} className="cockpit-lever text-xs">
              Refresh
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`cockpit-lever text-xs capitalize ${
                timeRange === range ? 'bg-[var(--hydrogen-amber)]/20 text-[var(--hydrogen-amber)]' : ''
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="cockpit-panel border-l-4 border-blue-500 p-4">
          <div className="cockpit-label mb-1 flex items-center gap-2 text-xs">
            <Activity className="h-3 w-3" />
            Page Activity (24h)
          </div>
          <div className="cockpit-number text-2xl">{analytics.realtime.pageActivity}</div>
          <div className="cockpit-text mt-1 text-xs opacity-60">Events in last 24 hours</div>
        </div>

        <div className="cockpit-panel border-l-4 border-green-500 p-4">
          <div className="cockpit-label mb-1 flex items-center gap-2 text-xs">
            <Users className="h-3 w-3" />
            Active Users (24h)
          </div>
          <div className="cockpit-number text-2xl">{analytics.realtime.activeUsers}</div>
          <div className="cockpit-text mt-1 text-xs opacity-60">Unique contributors</div>
        </div>

        <div className="cockpit-panel border-l-4 border-purple-500 p-4">
          <div className="cockpit-label mb-1 flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            Submissions (Today)
          </div>
          <div className="cockpit-number text-2xl">{analytics.realtime.submissionsToday}</div>
          <div className="cockpit-text mt-1 text-xs opacity-60">New PoC submissions</div>
        </div>

        <div className="cockpit-panel border-l-4 border-amber-500 p-4">
          <div className="cockpit-label mb-1 flex items-center gap-2 text-xs">
            <Award className="h-3 w-3" />
            Qualifications (Today)
          </div>
          <div className="cockpit-number text-2xl">{analytics.realtime.qualificationsToday}</div>
          <div className="cockpit-text mt-1 text-xs opacity-60">Qualified PoCs today</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Page Activity Chart */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Page Activity Runrate
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getPageActivityData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeRange === 'hourly') {
                    return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' });
                  }
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--cockpit-carbon)',
                  border: '1px solid var(--keyline-primary)',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FFB84D"
                strokeWidth={2}
                dot={{ fill: '#FFB84D', r: 3 }}
                name="Page Activity"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Submissions Chart */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submissions Runrate
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getSubmissionsData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeRange === 'hourly') {
                    return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit' });
                  }
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--cockpit-carbon)',
                  border: '1px solid var(--keyline-primary)',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ fill: '#A855F7', r: 3 }}
                name="Submissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Count Chart */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Count Growth
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getUserCountData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--cockpit-carbon)',
                  border: '1px solid var(--keyline-primary)',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ fill: '#22C55E', r: 3 }}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Qualifications Chart */}
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            PoC Qualifications
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getQualificationsData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--cockpit-carbon)',
                  border: '1px solid var(--keyline-primary)',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FFB84D"
                strokeWidth={2}
                dot={{ fill: '#FFB84D', r: 3 }}
                name="Qualifications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Qualifications Breakdown */}
      <div className="cockpit-panel p-6">
        <div className="cockpit-label mb-4 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Qualifications by Tier
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Total Qualified</div>
            <div className="cockpit-number text-2xl">{analytics.qualifications.total}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Founder (≥8,000)</div>
            <div className="cockpit-number text-2xl text-amber-400">{analytics.qualifications.founder}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Pioneer (≥6,000)</div>
            <div className="cockpit-number text-2xl text-purple-400">{analytics.qualifications.pioneer}</div>
          </div>
          <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-4">
            <div className="cockpit-label mb-1 text-xs">Community (≥5,000)</div>
            <div className="cockpit-number text-2xl text-blue-400">{analytics.qualifications.community}</div>
          </div>
        </div>
      </div>

      {/* Location Data */}
      {analytics.locations.length > 0 && (
        <div className="cockpit-panel p-6">
          <div className="cockpit-label mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Activity by Origin Location
          </div>
          <div className="space-y-2">
            {analytics.locations.map((location, idx) => (
              <div key={idx} className="cockpit-panel bg-[var(--cockpit-carbon)] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="cockpit-text text-sm">
                      {location.country || 'Unknown'} {location.region && `• ${location.region}`}
                      {location.city && ` • ${location.city}`}
                    </div>
                  </div>
                  <div className="cockpit-number">{location.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

