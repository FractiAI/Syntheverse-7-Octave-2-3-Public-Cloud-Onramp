'use client';

import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Gauge } from 'lucide-react';

interface StabilitySignals {
  clamp_rate: number;
  overlap_drift: number;
  pressure: number;
  stability_margin: number;
}

interface StabilityMonitorProps {
  modeState: 'growth' | 'saturation' | 'safe_mode';
  stabilitySignals: StabilitySignals;
  lastTransition?: {
    from: string;
    to: string;
    timestamp: string;
    trigger: string;
  };
  variant?: 'compact' | 'full';
}

/**
 * StabilityMonitor - Displays TSRC stability state and signals
 * 
 * Shows current mode state (growth/saturation/safe_mode) and monitors
 * stability triggers for monotone-tightening transitions.
 */
export function StabilityMonitor({
  modeState,
  stabilitySignals,
  lastTransition,
  variant = 'compact'
}: StabilityMonitorProps) {
  const getModeConfig = (mode: string) => {
    switch (mode) {
      case 'growth':
        return {
          color: 'green',
          icon: TrendingUp,
          label: 'Growth Mode',
          description: 'Normal operation, accepting new contributions'
        };
      case 'saturation':
        return {
          color: 'yellow',
          icon: Activity,
          label: 'Saturation Mode',
          description: 'Archive nearing capacity, increased scrutiny'
        };
      case 'safe_mode':
        return {
          color: 'red',
          icon: AlertTriangle,
          label: 'Safe Mode',
          description: 'Defensive operation, tightened parameters'
        };
      default:
        return {
          color: 'gray',
          icon: Activity,
          label: mode,
          description: 'Unknown mode state'
        };
    }
  };

  const getSignalStatus = (signal: number, threshold: number) => {
    if (signal < threshold * 0.5) return { color: 'green', status: 'Healthy' };
    if (signal < threshold * 0.8) return { color: 'yellow', status: 'Elevated' };
    return { color: 'red', status: 'Critical' };
  };

  const config = getModeConfig(modeState);
  const ModeIcon = config.icon;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 bg-${config.color}-500/10 border border-${config.color}-500/30 rounded-lg`}>
        <ModeIcon className={`w-4 h-4 text-${config.color}-400`} />
        <div className="flex-1">
          <div className={`text-sm font-semibold text-${config.color}-300`}>{config.label}</div>
          <div className="text-xs text-gray-400">{config.description}</div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-300">
            γ: {stabilitySignals.stability_margin.toFixed(3)}
          </span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-cyan-500/30 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${config.color}-500/20 rounded-lg`}>
            <ModeIcon className={`w-5 h-5 text-${config.color}-400`} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold text-${config.color}-300`}>{config.label}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 text-xs font-semibold">TSRC Active</span>
        </div>
      </div>

      {/* Stability Signals Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg space-y-1.5">
          <div className="text-xs text-gray-400">Clamp Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-300">
              {(stabilitySignals.clamp_rate * 100).toFixed(1)}%
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              stabilitySignals.clamp_rate < 0.2 
                ? 'bg-green-500/20 text-green-400' 
                : stabilitySignals.clamp_rate < 0.4
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stabilitySignals.clamp_rate < 0.2 ? 'Low' : stabilitySignals.clamp_rate < 0.4 ? 'Med' : 'High'}
            </span>
          </div>
          <div className="text-xs text-gray-500">Scores hitting limits</div>
        </div>

        <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg space-y-1.5">
          <div className="text-xs text-gray-400">Overlap Drift</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-300">
              {(stabilitySignals.overlap_drift * 100).toFixed(1)}%
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              stabilitySignals.overlap_drift < 0.15 
                ? 'bg-green-500/20 text-green-400' 
                : stabilitySignals.overlap_drift < 0.3
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stabilitySignals.overlap_drift < 0.15 ? 'Stable' : stabilitySignals.overlap_drift < 0.3 ? 'Drifting' : 'Volatile'}
            </span>
          </div>
          <div className="text-xs text-gray-500">Redundancy variance</div>
        </div>

        <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg space-y-1.5">
          <div className="text-xs text-gray-400">Pressure (ρ)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-300">
              {stabilitySignals.pressure.toFixed(3)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              stabilitySignals.pressure < 0.7 
                ? 'bg-green-500/20 text-green-400' 
                : stabilitySignals.pressure < 0.85
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stabilitySignals.pressure < 0.7 ? 'Normal' : stabilitySignals.pressure < 0.85 ? 'Elevated' : 'High'}
            </span>
          </div>
          <div className="text-xs text-gray-500">Archive saturation</div>
        </div>

        <div className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg space-y-1.5">
          <div className="text-xs text-gray-400">Stability Margin (γ)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-300">
              {stabilitySignals.stability_margin.toFixed(3)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              stabilitySignals.stability_margin > 0.5 
                ? 'bg-green-500/20 text-green-400' 
                : stabilitySignals.stability_margin > 0.2
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stabilitySignals.stability_margin > 0.5 ? 'Strong' : stabilitySignals.stability_margin > 0.2 ? 'Weak' : 'Critical'}
            </span>
          </div>
          <div className="text-xs text-gray-500">Safety buffer</div>
        </div>
      </div>

      {/* Last Transition */}
      {lastTransition && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Last Transition</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>
              <span className="text-gray-400">Mode:</span>{' '}
              <span className="font-mono">{lastTransition.from}</span>
              {' → '}
              <span className="font-mono">{lastTransition.to}</span>
            </div>
            <div>
              <span className="text-gray-400">Trigger:</span>{' '}
              <span className="text-cyan-300">{lastTransition.trigger}</span>
            </div>
            <div>
              <span className="text-gray-400">Time:</span>{' '}
              <span>{new Date(lastTransition.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Monotone-Tightening Notice */}
      <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-purple-300/90 leading-relaxed">
          <strong>Monotone-Tightening:</strong> Automatic transitions only shrink capability (safer operation). 
          Expanding parameters requires governance approval with formal proof of safety.
        </p>
      </div>
    </div>
  );
}

