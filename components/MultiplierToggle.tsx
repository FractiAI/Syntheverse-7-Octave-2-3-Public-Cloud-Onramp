'use client';

import { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';

interface MultiplierConfig {
  seed_enabled: boolean;
  edge_enabled: boolean;
}

export function MultiplierToggle() {
  const [config, setConfig] = useState<MultiplierConfig>({
    seed_enabled: true,
    edge_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/scoring/multiplier-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to load multiplier config:', error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleToggle = async (field: 'seed_enabled' | 'edge_enabled') => {
    const newConfig = { ...config, [field]: !config[field] };
    setConfig(newConfig);
    setSaving(true);

    try {
      const response = await fetch('/api/scoring/multiplier-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        // Auto-refresh the page after successful save
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        console.error('Failed to save config');
        // Revert on error
        setConfig(config);
        setSaving(false);
      }
    } catch (error) {
      console.error('Failed to save multiplier config:', error);
      // Revert on error
      setConfig(config);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cockpit-panel p-4 animate-pulse">
        <div className="h-20 bg-gray-700/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="cockpit-panel p-4 border-l-4 border-amber-500/50">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-5 w-5 text-amber-400" />
        <div>
          <div className="cockpit-label text-sm">SCORING MULTIPLIERS</div>
          <div className="text-xs text-gray-400 mt-0.5">Testing & Tuning Controls</div>
        </div>
        {saving && <RefreshCw className="h-4 w-4 text-amber-400 animate-spin ml-auto" />}
      </div>

      <div className="space-y-3">
        {/* Seed Multiplier Toggle */}
        <div className="flex items-center justify-between p-3 rounded bg-[var(--cockpit-carbon)] border border-[var(--keyline-primary)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                config.seed_enabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
              onClick={() => handleToggle('seed_enabled')}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.seed_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Seed Multiplier (×1.15)</div>
              <div className="text-xs text-gray-400">
                {config.seed_enabled ? 'Enabled' : 'Disabled'} - Content-based seed detection
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded text-xs font-mono ${
              config.seed_enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/20 text-gray-400'
            }`}
          >
            {config.seed_enabled ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Edge Multiplier Toggle */}
        <div className="flex items-center justify-between p-3 rounded bg-[var(--cockpit-carbon)] border border-[var(--keyline-primary)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                config.edge_enabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
              onClick={() => handleToggle('edge_enabled')}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.edge_enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Edge Multiplier (×1.15)</div>
              <div className="text-xs text-gray-400">
                {config.edge_enabled ? 'Enabled' : 'Disabled'} - Boundary operator detection
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded text-xs font-mono ${
              config.edge_enabled ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-600/20 text-gray-400'
            }`}
          >
            {config.edge_enabled ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/30">
        <div className="text-xs text-amber-200">
          ⚠️ <strong>Testing Mode:</strong> Toggle these during scoring tuning. Changes trigger automatic page
          refresh. This panel will be removed once scoring is stable.
        </div>
      </div>
    </div>
  );
}

