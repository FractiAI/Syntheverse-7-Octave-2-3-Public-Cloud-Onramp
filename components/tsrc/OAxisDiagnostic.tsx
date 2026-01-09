'use client';

import React from 'react';
import { Grid3x3, AlertCircle, TrendingUp, Info } from 'lucide-react';

interface AxisOverlap {
  axis: 'N' | 'D' | 'C' | 'A';
  label: string;
  value: number;
  threshold: number;
  flagged: boolean;
  description: string;
}

interface OAxisDiagnosticProps {
  axisOverlaps: AxisOverlap[];
  aggregationMethod?: 'max' | 'weighted_sum' | 'tiered_thresholds';
  overallScore?: number;
  variant?: 'compact' | 'full';
}

/**
 * OAxisDiagnostic - Displays per-axis overlap analysis (N, D, C, A)
 * 
 * Shows which specific dimension drives redundancy detection.
 * Part of TSRC operator hygiene for transparent, auditable overlap analysis.
 */
export function OAxisDiagnostic({
  axisOverlaps,
  aggregationMethod = 'max',
  overallScore,
  variant = 'compact'
}: OAxisDiagnosticProps) {
  const getAxisColor = (axis: string) => {
    switch (axis) {
      case 'N': return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300' };
      case 'D': return { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300' };
      case 'C': return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-300' };
      case 'A': return { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-300' };
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300' };
    }
  };

  const getFlaggedCount = () => axisOverlaps.filter(a => a.flagged).length;

  // Compact variant - just show flagged axes
  if (variant === 'compact') {
    const flaggedAxes = axisOverlaps.filter(a => a.flagged);
    
    if (flaggedAxes.length === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Grid3x3 className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-300">All axes within threshold</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-yellow-300">
            {flaggedAxes.length} Axis{flaggedAxes.length > 1 ? 'es' : ''} Flagged
          </div>
          <div className="text-xs text-gray-400">
            {flaggedAxes.map(a => a.label).join(', ')}
          </div>
        </div>
        <div className="flex gap-1">
          {flaggedAxes.map(axis => {
            const colors = getAxisColor(axis.axis);
            return (
              <div
                key={axis.axis}
                className={`px-2 py-1 ${colors.bg} border ${colors.border} rounded text-xs font-bold ${colors.text}`}
              >
                {axis.axis}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant - detailed breakdown
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-cyan-500/30 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Grid3x3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-300">O_axis Diagnostic (Orthogonal Channels)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Per-axis overlap analysis: N, D, C, A</p>
          </div>
        </div>
        {getFlaggedCount() > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-xs font-semibold">
              {getFlaggedCount()} Flagged
            </span>
          </div>
        )}
      </div>

      {/* Overall Score */}
      {overallScore !== undefined && (
        <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Overall Overlap Score</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Aggregation: <span className="font-mono text-cyan-400">{aggregationMethod}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-300">
              {(overallScore * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Axis Breakdown */}
      <div className="space-y-3">
        {axisOverlaps.map((axis) => {
          const colors = getAxisColor(axis.axis);
          const percentage = axis.value * 100;
          const thresholdPercentage = axis.threshold * 100;
          
          return (
            <div
              key={axis.axis}
              className={`p-3 bg-black/30 border rounded-lg ${
                axis.flagged ? 'border-yellow-500/40' : 'border-cyan-500/20'
              }`}
            >
              {/* Axis Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 ${colors.bg} border ${colors.border} rounded font-bold text-sm ${colors.text}`}>
                    {axis.axis}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-200">{axis.label}</div>
                    <div className="text-xs text-gray-500">{axis.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${axis.flagged ? 'text-yellow-300' : 'text-cyan-300'}`}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    Threshold: {thresholdPercentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                    axis.flagged
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                {/* Threshold Marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/50"
                  style={{ left: `${thresholdPercentage}%` }}
                />
              </div>

              {/* Flagged Warning */}
              {axis.flagged && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/90">
                    This axis exceeds threshold. Consider this dimension when evaluating redundancy.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-300/90 leading-relaxed space-y-1">
          <p>
            <strong>N (Novelty):</strong> Semantic distance from existing ideas
          </p>
          <p>
            <strong>D (Depth):</strong> Rigor, evidence quality, mathematical formalism
          </p>
          <p>
            <strong>C (Coherence):</strong> Internal consistency, logical flow
          </p>
          <p>
            <strong>A (Applicability):</strong> Practical utility, implementability
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to create mock O_axis data for testing
 * In production, this will come from the TSRC operator
 */
export function createMockOAxisData(): AxisOverlap[] {
  return [
    {
      axis: 'N',
      label: 'Novelty',
      value: 0.42,
      threshold: 0.65,
      flagged: false,
      description: 'Semantic distance from existing contributions'
    },
    {
      axis: 'D',
      label: 'Depth',
      value: 0.78,
      threshold: 0.70,
      flagged: true,
      description: 'Rigor and evidence quality'
    },
    {
      axis: 'C',
      label: 'Coherence',
      value: 0.55,
      threshold: 0.70,
      flagged: false,
      description: 'Internal consistency and logical flow'
    },
    {
      axis: 'A',
      label: 'Applicability',
      value: 0.68,
      threshold: 0.70,
      flagged: false,
      description: 'Practical utility and implementability'
    }
  ];
}

