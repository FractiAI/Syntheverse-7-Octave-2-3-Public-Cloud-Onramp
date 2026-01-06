'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Play,
  Pause,
  Plus,
  Activity,
  Users,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionWrapper } from './landing/shared/SectionWrapper';
import { Card } from './landing/shared/Card';
import EnterpriseSubmitForm from './EnterpriseSubmitForm';
import EnterpriseAnalytics from './EnterpriseAnalytics';
import SandboxConfigurationWizard from './SandboxConfigurationWizard';

type EnterpriseSandboxDetailProps = {
  sandboxId: string;
  isAuthenticated?: boolean;
  userEmail?: string | null;
};

type Sandbox = {
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
};

type Contribution = {
  submission_hash: string;
  title: string;
  contributor: string;
  status: string;
  created_at: string;
  metadata: {
    pod_score?: number;
    novelty?: number;
    density?: number;
    coherence?: number;
    alignment?: number;
    qualified?: boolean;
  };
};

export default function EnterpriseSandboxDetail({
  sandboxId,
  isAuthenticated = false,
  userEmail = null,
}: EnterpriseSandboxDetailProps) {
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    evaluating: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetchSandbox();
    fetchContributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxId]);

  async function fetchSandbox() {
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}`);
      if (res.ok) {
        const data = await res.json();
        setSandbox(data.sandbox);
        // Update edit fields when sandbox loads
        if (data.sandbox) {
          setEditName(data.sandbox.name || '');
          setEditDescription(data.sandbox.description || '');
        }
      }
    } catch (error) {
      console.error('Error fetching sandbox:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchContributions() {
    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}/contributions`);
      if (res.ok) {
        const data = await res.json();
        setContributions(data.contributions || []);

        // Calculate stats
        const total = data.contributions?.length || 0;
        const qualified =
          data.contributions?.filter((c: Contribution) => c.status === 'qualified').length || 0;
        const evaluating =
          data.contributions?.filter((c: Contribution) => c.status === 'evaluating').length || 0;
        const scores =
          data.contributions
            ?.filter((c: Contribution) => c.metadata?.pod_score)
            .map((c: Contribution) => c.metadata.pod_score) || [];
        const averageScore =
          scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

        setStats({ total, qualified, evaluating, averageScore });
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  }

  async function toggleVaultStatus() {
    if (!sandbox) return;

    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}/vault`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_status: sandbox.vault_status === 'active' ? 'paused' : 'active',
        }),
      });

      if (res.ok) {
        fetchSandbox();
      }
    } catch (error) {
      console.error('Error updating vault status:', error);
    }
  }

  if (loading) {
    return (
      <div className="cockpit-bg min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="cockpit-panel p-6">
            <div className="cockpit-text text-sm opacity-75">Loading sandbox...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!sandbox) {
    return (
      <div className="cockpit-bg min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <Card hover={false} className="border-l-4 border-red-500/50">
            <div className="cockpit-title mb-2 text-lg">Sandbox Not Found</div>
            <div className="cockpit-text text-sm opacity-90">
              The requested sandbox could not be found or you don&apos;t have access.
            </div>
            <Link
              href="/fractiai/enterprise-dashboard"
              className="cockpit-lever mt-4 inline-flex items-center text-sm"
            >
              Back to Dashboard
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isOperator = sandbox?.operator === userEmail;

  async function handleSaveConfiguration(config: any) {
    if (!sandbox) return;

    try {
      const res = await fetch(`/api/enterprise/sandboxes/${sandboxId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          scoring_config: {
            novelty_weight: config.novelty_weight,
            density_weight: config.density_weight,
            coherence_weight: config.coherence_weight,
            alignment_weight: config.alignment_weight,
            qualification_threshold: config.qualification_threshold,
            overlap_penalty_start: config.overlap_penalty_start,
            sweet_spot_center: config.sweet_spot_center,
            sweet_spot_tolerance: config.sweet_spot_tolerance,
          },
          metadata: {
            mission: config.mission,
            project_goals: config.project_goals,
            public_access: config.public_access,
            contributor_channels: config.contributor_channels,
            allow_external_submissions: config.allow_external_submissions,
            gold_focus: config.gold_focus,
            silver_focus: config.silver_focus,
            copper_focus: config.copper_focus,
            hybrid_metals: config.hybrid_metals,
            founder_threshold: config.founder_threshold,
            pioneer_threshold: config.pioneer_threshold,
            community_threshold: config.community_threshold,
            ecosystem_threshold: config.ecosystem_threshold,
            synth_activation_fee: config.synth_activation_fee,
            monthly_rent_tier: config.monthly_rent_tier,
            energy_cost_per_evaluation: config.energy_cost_per_evaluation,
            energy_cost_per_registration: config.energy_cost_per_registration,
          },
        }),
      });

      if (res.ok) {
        setShowWizard(false);
        fetchSandbox();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update sandbox');
      }
    } catch (error) {
      console.error('Error updating sandbox:', error);
      alert('Failed to update sandbox');
    }
  }

  return (
    <div className="cockpit-bg min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/fractiai/enterprise-dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--hydrogen-amber)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Enterprise Dashboard
        </Link>

        <SectionWrapper
          id="sandbox-detail"
          eyebrow="SANDBOX CONFIGURATION"
          title="Define Your SYNTH-Based Ecosystem"
          background="default"
        >
          {/* Guided Configuration Wizard */}
          {isOperator && (
            <div className="mb-8">
              {!showWizard ? (
                <div className="cockpit-panel border-l-4 border-[var(--hydrogen-amber)] p-6">
                  <div className="cockpit-label mb-4" style={{ color: '#ffb84d' }}>
                    COMPREHENSIVE SANDBOX CONFIGURATION
                  </div>
                  <p className="cockpit-text mb-6 text-sm">
                    Configure your sandbox as a self-similar ecosystem nested within Syntheverse.
                    This guided setup will walk you through defining your project vision, SYNTH
                    tokenomics, epoch structure, scoring parameters, contributor access, and metal
                    alignment—all aligned with Syntheverse&apos;s foundational structure.
                  </p>

                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <Card hover={false} className="border-l-4 border-blue-500/50">
                      <div className="cockpit-label mb-2 text-xs">CURRENT CONFIGURATION</div>
                      <div className="cockpit-title text-lg">{sandbox.name}</div>
                      {sandbox.description && (
                        <div className="cockpit-text mt-2 text-xs opacity-75">
                          {sandbox.description}
                        </div>
                      )}
                    </Card>
                    <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
                      <div className="cockpit-label mb-2 text-xs">STATUS</div>
                      <div className="cockpit-title text-lg">
                        {sandbox.vault_status === 'active' ? 'ACTIVE' : 'PAUSED'}
                      </div>
                      <div className="cockpit-text mt-2 text-xs opacity-75">
                        Epoch: {sandbox.current_epoch.toUpperCase()}
                      </div>
                    </Card>
                  </div>

                  <button
                    onClick={() => setShowWizard(true)}
                    className="cockpit-lever inline-flex items-center text-sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Sandbox Ecosystem
                  </button>
                </div>
              ) : (
                <SandboxConfigurationWizard
                  sandboxId={sandboxId}
                  initialConfig={{
                    name: sandbox.name,
                    description: sandbox.description || '',
                    // Load from sandbox.scoring_config if available
                    novelty_weight: (sandbox as any).scoring_config?.novelty_weight || 1.0,
                    density_weight: (sandbox as any).scoring_config?.density_weight || 1.0,
                    coherence_weight: (sandbox as any).scoring_config?.coherence_weight || 1.0,
                    alignment_weight: (sandbox as any).scoring_config?.alignment_weight || 1.0,
                    qualification_threshold:
                      (sandbox as any).scoring_config?.qualification_threshold || 4000,
                    current_epoch: sandbox.current_epoch,
                  }}
                  onSave={handleSaveConfiguration}
                />
              )}
            </div>
          )}

          {/* Sandbox Info */}
          <div className="cockpit-panel mb-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1">
                {sandbox.description && (
                  <div className="cockpit-text mb-4 text-sm opacity-90">{sandbox.description}</div>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="cockpit-label mb-1 text-xs">VAULT STATUS</div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          sandbox.vault_status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                      <span className="cockpit-title text-lg">
                        {sandbox.vault_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="cockpit-label mb-1 text-xs">EPOCH</div>
                    <div className="cockpit-title text-lg">
                      {sandbox.current_epoch.toUpperCase()}
                    </div>
                  </div>
                  {sandbox.subscription_tier && (
                    <div>
                      <div className="cockpit-label mb-1 text-xs">SUBSCRIPTION</div>
                      <div className="cockpit-title text-lg">{sandbox.subscription_tier}</div>
                      <div className="cockpit-text text-xs opacity-75">
                        {sandbox.node_count || 0} nodes
                      </div>
                    </div>
                  )}
                  {sandbox.tokenized && (
                    <div>
                      <div className="cockpit-label mb-1 text-xs">TOKEN</div>
                      <div className="cockpit-title text-lg">{sandbox.token_symbol || 'N/A'}</div>
                    </div>
                  )}
                </div>
              </div>
              {isOperator && (
                <button
                  onClick={toggleVaultStatus}
                  className="cockpit-lever inline-flex items-center text-sm"
                >
                  {sandbox.vault_status === 'active' ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Vault
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Activate Vault
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card hover={false} className="border-l-4 border-blue-500/50">
              <div className="cockpit-label mb-1 text-xs">TOTAL CONTRIBUTIONS</div>
              <div className="cockpit-title text-2xl">{stats.total}</div>
            </Card>
            <Card hover={false} className="border-l-4 border-green-500/50">
              <div className="cockpit-label mb-1 text-xs">QUALIFIED</div>
              <div className="cockpit-title text-2xl">{stats.qualified}</div>
            </Card>
            <Card hover={false} className="border-l-4 border-yellow-500/50">
              <div className="cockpit-label mb-1 text-xs">EVALUATING</div>
              <div className="cockpit-title text-2xl">{stats.evaluating}</div>
            </Card>
            <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
              <div className="cockpit-label mb-1 text-xs">AVG SCORE</div>
              <div className="cockpit-title text-2xl">
                {stats.averageScore > 0 ? Math.round(stats.averageScore).toLocaleString() : 'N/A'}
              </div>
            </Card>
          </div>

          {/* Submit Form */}
          {isOperator && sandbox.vault_status === 'active' && (
            <div className="mb-8">
              {showSubmitForm ? (
                <EnterpriseSubmitForm
                  sandboxId={sandboxId}
                  sandboxName={sandbox.name}
                  onSuccess={() => {
                    setShowSubmitForm(false);
                    fetchContributions();
                  }}
                />
              ) : (
                <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="cockpit-lever inline-flex items-center text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Submit New Contribution
                  </button>
                </Card>
              )}
            </div>
          )}

          {/* Analytics */}
          <div className="mb-8">
            <div className="cockpit-label mb-4">ANALYTICS</div>
            <EnterpriseAnalytics sandboxId={sandboxId} />
          </div>

          {/* Contributions List */}
          <div className="cockpit-panel p-6">
            <div className="cockpit-label mb-4">CONTRIBUTIONS</div>
            {contributions.length === 0 ? (
              <div className="cockpit-text text-sm opacity-75">
                No contributions yet. Submit your first contribution to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map((contrib) => (
                  <Card key={contrib.submission_hash} hover={true}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="cockpit-title mb-2 text-lg">{contrib.title}</div>
                        <div className="cockpit-label mb-2 text-xs">
                          {contrib.contributor} ·{' '}
                          {new Date(contrib.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="cockpit-label text-xs">
                            Status: {contrib.status.toUpperCase()}
                          </div>
                          {contrib.metadata?.pod_score && (
                            <div className="cockpit-label text-xs">
                              Score: {Math.round(contrib.metadata.pod_score).toLocaleString()}
                            </div>
                          )}
                        </div>
                        {contrib.metadata?.qualified && (
                          <div className="cockpit-badge mt-2 text-xs">QUALIFIED</div>
                        )}
                      </div>
                      <Link
                        href={`/enterprise/contribution/${contrib.submission_hash}`}
                        className="cockpit-lever inline-flex items-center bg-transparent text-xs"
                      >
                        View Details
                        <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
