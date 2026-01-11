/**
 * Cloud Navigator Component
 * Table-based sandbox selector similar to PoC Archive navigator
 * Displays all accessible sandboxes in a cockpit-table format
 * Supports delete (contributors: own sandboxes, creators/operators: any except Syntheverse)
 * Supports edit via sandbox builder assistant
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Layers, ExternalLink, Trash2, Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SandboxConfigurationWizard from './SandboxConfigurationWizard';

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
  created_at?: string | null;
  current_epoch?: string;
  scoring_config?: any;
}

interface SandboxNavigatorProps {
  userEmail?: string | null;
  isCreator?: boolean;
  isOperator?: boolean;
}

export function SandboxNavigator({ userEmail, isCreator = false, isOperator = false }: SandboxNavigatorProps) {
  const [sandboxes, setSandboxes] = useState<EnterpriseSandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSandbox, setSelectedSandbox] = useState<string>('syntheverse');
  const [editingSandbox, setEditingSandbox] = useState<EnterpriseSandbox | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingSandboxId, setDeletingSandboxId] = useState<string | null>(null);

  useEffect(() => {
    fetchSandboxes();
  }, []);

  async function fetchSandboxes() {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/sandboxes');
      if (res.ok) {
        const data = await res.json();
        const fetchedSandboxes = data.sandboxes || [];
        setSandboxes(fetchedSandboxes);
        
        // If operator (not creator) and syntheverse is selected, switch to first available sandbox
        if (isOperator && !isCreator && selectedSandbox === 'syntheverse' && fetchedSandboxes.length > 0) {
          const firstSandbox = fetchedSandboxes[0];
          handleSandboxClick(firstSandbox.id);
        }
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
    // Dispatch custom event to notify StatusIndicators
    window.dispatchEvent(new CustomEvent('sandboxChanged', { detail: { sandboxId } }));
  };

  const handleEdit = (sandbox: EnterpriseSandbox, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSandbox(sandbox);
    setShowEditDialog(true);
  };

  const handleDelete = async (sandboxId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete this sandbox? This action cannot be undone.`)) {
      return;
    }

    setDeletingSandboxId(sandboxId);
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh sandboxes list
        await fetchSandboxes();
        // If deleted sandbox was selected, reset to Syntheverse
        if (selectedSandbox === sandboxId) {
          handleSandboxClick('syntheverse');
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete sandbox');
      }
    } catch (error) {
      console.error('Error deleting sandbox:', error);
      alert('Failed to delete sandbox');
    } finally {
      setDeletingSandboxId(null);
    }
  };

  const handleSaveConfig = async (config: any) => {
    if (!editingSandbox) return;

    try {
      // Update sandbox via PATCH endpoint
      const res = await fetch(`/api/enterprise/sandboxes/${editingSandbox.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          scoring_config: {
            novelty_weight: config.novelty_weight || 1.0,
            density_weight: config.density_weight || 1.0,
            coherence_weight: config.coherence_weight || 1.0,
            alignment_weight: config.alignment_weight || 1.0,
            qualification_threshold: config.qualification_threshold || 4000,
            overlap_penalty_start: config.overlap_penalty_start || 30,
            sweet_spot_center: config.sweet_spot_center || 14.2,
            sweet_spot_tolerance: config.sweet_spot_tolerance || 5.0,
          },
        }),
      });

      if (res.ok) {
        setShowEditDialog(false);
        setEditingSandbox(null);
        await fetchSandboxes();
        alert('Sandbox configuration saved successfully');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save sandbox configuration');
      }
    } catch (error) {
      console.error('Error saving sandbox configuration:', error);
      alert('Failed to save sandbox configuration');
    }
  };

  const canDelete = (sandbox: EnterpriseSandbox): boolean => {
    if (sandbox.id === 'syntheverse') return false;
    if (isCreator || isOperator) return true;
    if (userEmail && sandbox.operator === userEmail) return true;
    return false;
  };

  const canEdit = (sandbox: EnterpriseSandbox): boolean => {
    if (sandbox.id === 'syntheverse') return false;
    if (isCreator || isOperator) return true;
    if (userEmail && sandbox.operator === userEmail) return true;
    return false;
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

  // Include Syntheverse as the first "sandbox" (only for creators, not operators)
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

  // Operators (enterprise users) see only their own sandboxes, creators see everything
  const allSandboxes: EnterpriseSandbox[] = isCreator 
    ? [syntheverseSandbox, ...sandboxes]
    : sandboxes;

  return (
    <div className="cockpit-module cockpit-panel">
      <div className="p-4 md:p-6">
        {/* Module Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
          <div>
            <div className="cockpit-label">CLOUD NAVIGATOR</div>
            <div className="cockpit-title mt-1 text-2xl">CLOUD SELECTOR</div>
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
                          {canEdit(sandbox) && (
                            <button
                              onClick={(e) => handleEdit(sandbox, e)}
                              className="cockpit-lever text-xs"
                              title="Edit sandbox configuration"
                            >
                              <Edit2 className="mr-1 inline h-3 w-3" />
                              Edit
                            </button>
                          )}
                          {canDelete(sandbox) && (
                            <button
                              onClick={(e) => handleDelete(sandbox.id, e)}
                              disabled={deletingSandboxId === sandbox.id}
                              className="cockpit-lever text-xs bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                              title="Delete sandbox"
                            >
                              <Trash2 className="mr-1 inline h-3 w-3" />
                              {deletingSandboxId === sandbox.id ? 'Deleting...' : 'Delete'}
                            </button>
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

      {/* Edit Dialog - Sandbox Builder Assistant */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) setEditingSandbox(null);
      }}>
        <DialogContent className="cockpit-panel max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--cockpit-near-black)] border-2 border-[var(--keyline-primary)]">
          <DialogHeader>
            <DialogTitle className="cockpit-title text-xl mb-4">
              Edit Sandbox: {editingSandbox?.name}
            </DialogTitle>
          </DialogHeader>
          {editingSandbox && (
            <div className="mt-4">
              <SandboxConfigurationWizard
                sandboxId={editingSandbox.id}
                initialConfig={{
                  name: editingSandbox.name,
                  description: editingSandbox.description || '',
                  mission: '',
                  project_goals: '',
                  synth_activation_fee: 10000,
                  monthly_rent_tier: 'Seed',
                  energy_cost_per_evaluation: 100,
                  energy_cost_per_registration: 500,
                  founder_threshold: 8000,
                  pioneer_threshold: 6000,
                  community_threshold: 5000,
                  ecosystem_threshold: 4000,
                  current_epoch: editingSandbox.current_epoch || 'founder',
                  novelty_weight: editingSandbox.scoring_config?.novelty_weight || 1.0,
                  density_weight: editingSandbox.scoring_config?.density_weight || 1.0,
                  coherence_weight: editingSandbox.scoring_config?.coherence_weight || 1.0,
                  alignment_weight: editingSandbox.scoring_config?.alignment_weight || 1.0,
                  qualification_threshold: editingSandbox.scoring_config?.qualification_threshold || 4000,
                  overlap_penalty_start: editingSandbox.scoring_config?.overlap_penalty_start || 30,
                  sweet_spot_center: editingSandbox.scoring_config?.sweet_spot_center || 14.2,
                  sweet_spot_tolerance: editingSandbox.scoring_config?.sweet_spot_tolerance || 5.0,
                  public_access: false,
                  contributor_channels: [],
                  allow_external_submissions: false,
                  gold_focus: false,
                  silver_focus: false,
                  copper_focus: false,
                  hybrid_metals: true,
                }}
                onSave={handleSaveConfig}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

