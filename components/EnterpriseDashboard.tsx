'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeft, Plus, Settings, Activity, Users, Coins, Play, Pause } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionWrapper } from './landing/shared/SectionWrapper';
import { Card } from './landing/shared/Card';
import EnterprisePricing from './EnterprisePricing';

type EnterpriseDashboardProps = {
  isAuthenticated?: boolean;
  userEmail?: string | null;
};

type EnterpriseSandbox = {
  id: string;
  name: string;
  description: string | null;
  operator: string;
  vault_status: string;
  tokenized: boolean;
  token_address: string | null;
  token_name: string | null;
  token_symbol: string | null;
  current_epoch: string;
  subscription_tier: string | null;
  node_count: number | null;
  created_at: string;
  contribution_count?: number;
  qualified_count?: number;
};

export default function EnterpriseDashboard({
  isAuthenticated = false,
  userEmail = null,
}: EnterpriseDashboardProps) {
  const [sandboxes, setSandboxes] = useState<EnterpriseSandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSandboxes();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  async function fetchSandboxes() {
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

  async function handleCreateSandbox() {
    if (!newSandboxName.trim()) return;

    try {
      const res = await fetch('/api/enterprise/sandboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSandboxName,
          description: newSandboxDescription || null,
        }),
      });

      if (res.ok) {
        setNewSandboxName('');
        setNewSandboxDescription('');
        setShowCreateForm(false);
        fetchSandboxes();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create sandbox');
      }
    } catch (error) {
      console.error('Error creating sandbox:', error);
      alert('Failed to create sandbox');
    }
  }

  async function toggleVaultStatus(sandboxId: string, currentStatus: string) {
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}/vault`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_status: currentStatus === 'active' ? 'paused' : 'active',
        }),
      });

      if (res.ok) {
        fetchSandboxes();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update vault status');
      }
    } catch (error) {
      console.error('Error updating vault status:', error);
      alert('Failed to update vault status');
    }
  }

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/fractiai"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FractiAI Bulletin
        </Link>

        <SectionWrapper
          id="enterprise-dashboard"
          eyebrow="ENTERPRISE OFFERING"
          title="PoC Enterprise Dashboard"
          background="default"
        >
          {/* Narrative Introduction */}
          <div className="cockpit-panel mb-8 p-8">
            <div className="cockpit-text mb-6 space-y-4 text-base" style={{ lineHeight: 1.8 }}>
              <p>
                <strong>Operators can spin up their own PoC environment inside Syntheverse</strong> —
                self-similar, tokenized, and scalable. Each enterprise sandbox operates as a nested
                instance of the Syntheverse PoC protocol, following the same holographic hydrogen
                fractal principles and evaluation logic.
              </p>
              <p>
                Enterprise sandboxes enable organizations, projects, and multi-contributor teams to
                create their own Proof-of-Contribution ecosystem with:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Independent vault management:</strong> Activate or pause your sandbox vault
                  independently
                </li>
                <li>
                  <strong>Optional tokenization:</strong> Deploy a nested ERC-20 token for your
                  sandbox on Base Mainnet
                </li>
                <li>
                  <strong>SynthScan™ MRI evaluation:</strong> All contributions evaluated using the
                  same HHF-AI lens as the main Syntheverse
                </li>
                <li>
                  <strong>Self-similar scoring:</strong> Novelty, density, coherence, and alignment
                  measured with the same standards
                </li>
                <li>
                  <strong>Nested governance:</strong> Contributions scored, rewarded, and optionally
                  anchored on-chain within your enterprise sandbox
                </li>
              </ul>
              <p>
                <strong>Benefits:</strong> Lower cost per contribution, higher coherent output,
                decentralized evaluation, and nested enterprise flexibility. Perfect for research
                teams, engineering organizations, and alignment projects.
              </p>
            </div>
          </div>

          {/* Authentication Check */}
          {!isAuthenticated ? (
            <Card hover={false} className="mb-8 border-l-4 border-amber-500/50">
              <div className="cockpit-title mb-4 text-lg">Authentication Required</div>
              <div className="cockpit-text mb-4 text-sm opacity-90">
                You must be signed in to create and manage enterprise sandboxes.
              </div>
              <div className="flex gap-4">
                <Link href="/signup" className="cockpit-lever inline-flex items-center text-sm">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="cockpit-lever inline-flex items-center bg-transparent text-sm"
                >
                  Log In
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Create Sandbox Section */}
              <div className="cockpit-panel mb-8 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="cockpit-label mb-2">SANDBOX MANAGEMENT</div>
                    <div className="cockpit-title text-xl">Your Enterprise Sandboxes</div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="cockpit-lever inline-flex items-center text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Sandbox
                  </button>
                </div>

                {showCreateForm && (
                  <Card hover={false} className="mt-6 border-l-4 border-[var(--hydrogen-amber)]">
                    <div className="cockpit-title mb-4 text-lg">Create Enterprise Sandbox</div>
                    <div className="space-y-4">
                      <div>
                        <label className="cockpit-label mb-2 block text-xs">Sandbox Name</label>
                        <input
                          type="text"
                          value={newSandboxName}
                          onChange={(e) => setNewSandboxName(e.target.value)}
                          placeholder="e.g., Research Team Alpha"
                          className="cockpit-input w-full"
                        />
                      </div>
                      <div>
                        <label className="cockpit-label mb-2 block text-xs">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newSandboxDescription}
                          onChange={(e) => setNewSandboxDescription(e.target.value)}
                          placeholder="Describe your enterprise sandbox..."
                          rows={3}
                          className="cockpit-input w-full"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateSandbox}
                          className="cockpit-lever inline-flex items-center text-sm"
                        >
                          Create Sandbox
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewSandboxName('');
                            setNewSandboxDescription('');
                          }}
                          className="cockpit-lever inline-flex items-center bg-transparent text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sandboxes List */}
              {loading ? (
                <div className="cockpit-panel p-6">
                  <div className="cockpit-text text-sm opacity-75">Loading sandboxes...</div>
                </div>
              ) : sandboxes.length === 0 ? (
                <Card hover={false} className="border-l-4 border-blue-500/50">
                  <div className="cockpit-title mb-2 text-lg">No Sandboxes Yet</div>
                  <div className="cockpit-text text-sm opacity-90">
                    Create your first enterprise sandbox to get started. Each sandbox operates as a
                    self-similar instance of the Syntheverse PoC protocol.
                  </div>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {sandboxes.map((sandbox) => (
                    <Card key={sandbox.id} hover={true} className="border-l-4 border-[var(--hydrogen-amber)]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="cockpit-title mb-2 text-lg">{sandbox.name}</div>
                          {sandbox.description && (
                            <div className="cockpit-text mb-4 text-sm opacity-80">
                              {sandbox.description}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  sandbox.vault_status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                              />
                              <span className="cockpit-label text-xs">
                                Vault: {sandbox.vault_status.toUpperCase()}
                              </span>
                            </div>
                            <div className="cockpit-label text-xs">
                              Epoch: {sandbox.current_epoch.toUpperCase()}
                            </div>
                            {sandbox.subscription_tier && (
                              <div className="cockpit-label text-xs">
                                Tier: {sandbox.subscription_tier} ({sandbox.node_count || 0} nodes)
                              </div>
                            )}
                            {sandbox.tokenized && (
                              <div className="cockpit-label text-xs">
                                Tokenized: {sandbox.token_symbol || 'N/A'}
                              </div>
                            )}
                            {sandbox.contribution_count !== undefined && (
                              <div className="cockpit-label text-xs">
                                Contributions: {sandbox.contribution_count} (
                                {sandbox.qualified_count || 0} qualified)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleVaultStatus(sandbox.id, sandbox.vault_status)}
                          className={`cockpit-lever inline-flex items-center text-xs ${
                            sandbox.vault_status === 'active' ? 'bg-transparent' : ''
                          }`}
                        >
                          {sandbox.vault_status === 'active' ? (
                            <>
                              <Pause className="mr-2 h-3 w-3" />
                              Pause Vault
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-3 w-3" />
                              Activate Vault
                            </>
                          )}
                        </button>
                        <Link
                          href={`/enterprise/sandbox/${sandbox.id}`}
                          className="cockpit-lever inline-flex items-center bg-transparent text-xs"
                        >
                          <Settings className="mr-2 h-3 w-3" />
                          Manage
                        </Link>
                        <Link
                          href={`/enterprise/sandbox/${sandbox.id}`}
                          className="cockpit-lever inline-flex items-center bg-transparent text-xs"
                        >
                          <Activity className="mr-2 h-3 w-3" />
                          View Contributions
                        </Link>
                        {sandbox.subscription_tier && (
                          <button
                            onClick={() => {
                              // Scroll to pricing section
                              document.getElementById('enterprise-pricing')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="cockpit-lever inline-flex items-center bg-transparent text-xs"
                          >
                            <Coins className="mr-2 h-3 w-3" />
                            Upgrade
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pricing Section */}
          <div id="enterprise-pricing" className="mt-8">
            <EnterprisePricing showNarrative={true} />
          </div>

          {/* Use Cases Section */}
          <div className="cockpit-panel mt-8 p-8">
            <div className="cockpit-label mb-4">USE CASES</div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card hover={false}>
                <div className="cockpit-title mb-2 text-base">Enterprise Research Teams</div>
                <div className="cockpit-text text-sm opacity-90">
                  Create a sandbox for your research organization. Contributors submit work,
                  receive SynthScan™ MRI evaluation, and earn tokenized rewards based on coherence
                  and alignment.
                </div>
              </Card>
              <Card hover={false}>
                <div className="cockpit-title mb-2 text-base">Engineering Projects</div>
                <div className="cockpit-text text-sm opacity-90">
                  Launch a project-specific sandbox. Evaluate technical contributions, measure
                  coherence across implementations, and reward aligned work with nested tokens.
                </div>
              </Card>
              <Card hover={false}>
                <div className="cockpit-title mb-2 text-base">Multi-Contributor Initiatives</div>
                <div className="cockpit-text text-sm opacity-90">
                  Coordinate distributed teams. Each contributor&apos;s work is evaluated
                  independently, scored for novelty and alignment, and rewarded proportionally.
                </div>
              </Card>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}

