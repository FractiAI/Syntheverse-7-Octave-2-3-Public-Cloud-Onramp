/**
 * Sandbox Navigator Component
 * Table-based sandbox selector similar to PoC Archive navigator
 * Displays all accessible sandboxes in a cockpit-table format
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Layers, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface EnterpriseSandbox {
  id: string;
  name: string;
  description: string | null;
  operator: string;
  subscription_tier: string | null;
  contribution_count?: number;
  qualified_count?: number;
  synth_activated?: boolean;
  vault_status?: string;
  created_at?: string;
}

export function SandboxNavigator() {
  const [sandboxes, setSandboxes] = useState<EnterpriseSandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSandbox, setSelectedSandbox] = useState<string>('syntheverse');

  useEffect(() => {
    fetchSandboxes();
  }, []);

  async function fetchSandboxes() {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/sandboxes');
      if (res.ok) {
        const data = await res.json();
        setSandboxes(data.sandboxes || []);
      }
    } catch (error) {
      console.error('Error fetching sandboxes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSandboxClick = (sandboxId: string) => {
    setSelectedSandbox(sandboxId);
    // Store in localStorage for persistence
    localStorage.setItem('selectedSandbox', sandboxId);
    // Could also trigger navigation or context update here
  };

  const getStatusBadge = (sandbox: EnterpriseSandbox) => {
    if (sandbox.synth_activated) {
      return (
        <span className="cockpit-badge bg-green-500/20 text-green-400 border-green-500/50">
          Activated
        </span>
      );
    }
    if (sandbox.vault_status === 'paused') {
      return (
        <span className="cockpit-badge bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
          Paused
        </span>
      );
    }
    return (
      <span className="cockpit-badge bg-gray-500/20 text-gray-400 border-gray-500/50">
        Inactive
      </span>
    );
  };

  // Include Syntheverse as the first "sandbox"
  const syntheverseSandbox: EnterpriseSandbox = {
    id: 'syntheverse',
    name: 'Syntheverse',
    description: 'Main Syntheverse Protocol',
    operator: 'system',
    subscription_tier: null,
    contribution_count: 0,
    qualified_count: 0,
    synth_activated: true,
    vault_status: 'active',
  };

  const allSandboxes: EnterpriseSandbox[] = [syntheverseSandbox, ...sandboxes];

  return (
    <div className="cockpit-module cockpit-panel">
      <div className="p-4 md:p-6">
        {/* Module Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
          <div>
            <div className="cockpit-label">SANDBOX NAVIGATOR</div>
            <div className="cockpit-title mt-1 text-2xl">SANDBOX SELECTOR</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSandboxes()}
              className="cockpit-lever px-4 py-2 text-sm"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="cockpit-text opacity-60">Loading sandboxes...</div>
          </div>
        ) : allSandboxes.length === 0 ? (
          <div className="py-12 text-center">
            <div className="cockpit-text mb-4">No sandboxes found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cockpit-table">
              <thead>
                <tr>
                  <th>Sandbox Name</th>
                  <th>Description</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th className="text-right">Contributions</th>
                  <th className="text-right">Qualified</th>
                  <th>Operator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSandboxes.map((sandbox) => {
                  const isSelected = selectedSandbox === sandbox.id;
                  return (
                    <tr
                      key={sandbox.id}
                      onClick={() => handleSandboxClick(sandbox.id)}
                      className={`cursor-pointer ${isSelected ? 'bg-[var(--cockpit-carbon)]' : ''}`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hydrogen-amber)]/30 to-purple-500/30 text-xs font-semibold">
                            {sandbox.id === 'syntheverse' ? 'S' : sandbox.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium">{sandbox.name}</div>
                        </div>
                      </td>
                      <td className="cockpit-text text-sm">
                        {sandbox.description || '—'}
                      </td>
                      <td className="cockpit-text text-sm">
                        {sandbox.subscription_tier || (sandbox.id === 'syntheverse' ? 'Main Protocol' : '—')}
                      </td>
                      <td>{getStatusBadge(sandbox)}</td>
                      <td className="cockpit-number text-right font-mono">
                        {sandbox.contribution_count || 0}
                      </td>
                      <td className="cockpit-number text-right font-mono">
                        {sandbox.qualified_count || 0}
                      </td>
                      <td className="cockpit-text text-sm">
                        {sandbox.id === 'syntheverse' ? 'System' : sandbox.operator.split('@')[0]}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="cockpit-text text-xs text-[var(--hydrogen-amber)]">
                              Selected
                            </span>
                          )}
                          {sandbox.id !== 'syntheverse' && (
                            <Link
                              href={`/enterprise/sandbox/${sandbox.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="cockpit-lever text-xs"
                            >
                              <ExternalLink className="mr-1 inline h-3 w-3" />
                              View
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

