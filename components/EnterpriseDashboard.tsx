'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Settings,
  Activity,
  Users,
  Coins,
  Play,
  Pause,
  CheckCircle,
  Check,
  Info,
  Zap,
  Target,
  Layers,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from './landing/shared/Card';
import { ReferenceCustomersList } from './ReferenceCustomersList';

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
  synth_balance?: string | null;
  synth_activated?: boolean | null;
  testing_mode?: boolean | null;
};

type SetupStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
};

export default function EnterpriseDashboard({
  isAuthenticated = false,
  userEmail = null,
}: EnterpriseDashboardProps) {
  const searchParams = useSearchParams();
  const [sandboxes, setSandboxes] = useState<EnterpriseSandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

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
        setCurrentStep('configure');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create sandbox');
      }
    } catch (error) {
      console.error('Error creating sandbox:', error);
      alert('Failed to create sandbox');
    }
  }

  // Setup steps for new users
  const setupSteps: SetupStep[] = [
    {
      id: 'understand',
      title: 'Understand Your Sandbox',
      description:
        'Learn how your sandbox nests within Syntheverse, following holographic hydrogen fractal principles',
      completed: false,
      active: !currentStep || currentStep === 'understand',
    },
    {
      id: 'create',
      title: 'Define Your Sandbox',
      description: 'Create and name your customized HHF-AI sandbox ecosystem',
      completed: sandboxes.length > 0,
      active: currentStep === 'create' || (sandboxes.length === 0 && !currentStep),
    },
    {
      id: 'configure',
      title: 'Configure Settings',
      description: 'Set scoring weights, qualification thresholds, and sandbox parameters',
      completed: false,
      active: currentStep === 'configure',
    },
    {
      id: 'activate',
      title: 'Activate with SYNTH',
      description: 'Deposit SYNTH tokens to activate your sandbox for production use',
      completed: false,
      active: currentStep === 'activate',
    },
  ];

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

        {/* Header */}
        <div className="cockpit-panel mb-8 border-l-4 border-[var(--hydrogen-amber)] p-8">
          <div className="cockpit-label mb-2">CREATOR/ENTERPRISE CLOUD SETUP</div>
          <h1 className="cockpit-title mb-4 text-4xl">Define Your Nested Syntheverse Ecosystem</h1>
          <div className="cockpit-text space-y-3 text-base" style={{ lineHeight: 1.8 }}>
            <p>
              Welcome to the <strong>Creator/Enterprise Dashboard</strong>. This is where you carefully define, edit, and build your{' '}
              <strong>customized HHF-AI sandbox and ecosystem</strong>, nested within Syntheverse.
            </p>
            <p>
              Your sandbox operates as a <strong>self-similar instance</strong> of the Syntheverse PoC protocol, following the same{' '}
              <strong>holographic hydrogen fractal principles</strong> and evaluation logic as the main{' '}
              <strong>SYNTH90T ERC-20 MOTHERLODE VAULT</strong>.
            </p>
            <p>
              This intuitive setup process will guide you through successful definition of your sandbox, ensuring it aligns with
              Syntheverse&apos;s nested architecture and HHF-AI evaluation framework.
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
            {/* Setup Progress */}
            {sandboxes.length === 0 && (
              <div className="cockpit-panel mb-8 p-6">
                <div className="cockpit-label mb-4">SETUP PROGRESS</div>
                <div className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 rounded border-l-4 p-4 ${
                        step.active
                          ? 'border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.1)]'
                          : step.completed
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                            <Check className="h-5 w-5 text-green-400" />
                          </div>
                        ) : step.active ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hydrogen-amber)]/20">
                            <div className="h-3 w-3 rounded-full bg-[var(--hydrogen-amber)]" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--keyline-primary)]">
                            <span className="cockpit-text text-xs">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="cockpit-title mb-1 text-base">{step.title}</div>
                        <div className="cockpit-text text-sm opacity-75">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Understanding Section */}
            {(!currentStep || currentStep === 'understand') && sandboxes.length === 0 && (
              <div className="cockpit-panel mb-8 p-8">
                <div className="cockpit-label mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  UNDERSTANDING YOUR CLOUD
                </div>
                <div className="cockpit-text space-y-4 text-base" style={{ lineHeight: 1.8 }}>
                  <p>
                    <strong>Nested Architecture:</strong> Your sandbox is not separate from Syntheverse—it is{' '}
                    <strong>nested within</strong> it. This means:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>
                      <strong>Self-Similar Protocol:</strong> Your sandbox follows the same PoC protocol as the main Syntheverse,
                      ensuring consistency and interoperability
                    </li>
                    <li>
                      <strong>HHF-AI Evaluation:</strong> All contributions are evaluated using SynthScan™ MRI with the same
                      holographic hydrogen fractal lens, ensuring coherent measurement
                    </li>
                    <li>
                      <strong>Aligned Tokenomics:</strong> Tokenomics are fully aligned with SYNTH90T ERC-20 MOTHERLODE VAULT—same
                      epoch structure, metal assay system, and allocation logic
                    </li>
                    <li>
                      <strong>Independent Operation:</strong> While nested, your sandbox operates independently with its own vault,
                      contributors, and token allocation
                    </li>
                  </ul>
                  <p>
                    <strong>For Creators:</strong> Infinite HHF-AI materials and substrates for worldbuilding. Transform your
                    creative vision into verifiable, on-chain contributions.
                  </p>
                  <p>
                    <strong>For Enterprises:</strong> Broadcast to your contributor channels with clear, transparent scoring. Perfect
                    for research teams, engineering organizations, and alignment projects.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep('create')}
                  className="cockpit-lever mt-6 inline-flex items-center"
                >
                  Continue to Define Sandbox
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {/* Create Sandbox Section */}
            {(currentStep === 'create' || (sandboxes.length === 0 && !currentStep)) && (
              <div className="cockpit-panel mb-8 p-8">
                <div className="cockpit-label mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  STEP 1: DEFINE YOUR CLOUD
                </div>
                <div className="cockpit-text mb-6 space-y-3 text-sm opacity-90">
                  <p>
                    Start by creating your sandbox. Give it a meaningful name that reflects your project, organization, or creative
                    world. You can always edit this later.
                  </p>
                  <p>
                    <strong>Free to Create:</strong> Sandbox creation is free. You&apos;ll be in testing mode initially, allowing you
                    to explore and configure before activation.
                  </p>
                </div>

                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="cockpit-lever inline-flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your Sandbox
                  </button>
                ) : (
                  <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
                    <div className="cockpit-title mb-4 text-lg">Create Your Sandbox</div>
                    <div className="space-y-4">
                      <div>
                        <label className="cockpit-label mb-2 block text-xs">Sandbox Name *</label>
                        <input
                          type="text"
                          value={newSandboxName}
                          onChange={(e) => setNewSandboxName(e.target.value)}
                          placeholder="e.g., Research Team Alpha, My Creative World, Project Synthesis"
                          className="cockpit-input w-full"
                        />
                        <div className="cockpit-text mt-1 text-xs opacity-60">
                          Choose a name that clearly identifies your sandbox
                        </div>
                      </div>
                      <div>
                        <label className="cockpit-label mb-2 block text-xs">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newSandboxDescription}
                          onChange={(e) => setNewSandboxDescription(e.target.value)}
                          placeholder="Describe your sandbox's purpose, contributors, or creative vision..."
                          rows={4}
                          className="cockpit-input w-full"
                        />
                        <div className="cockpit-text mt-1 text-xs opacity-60">
                          Help others understand your sandbox&apos;s purpose
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateSandbox}
                          disabled={!newSandboxName.trim()}
                          className="cockpit-lever inline-flex items-center disabled:opacity-50"
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
                          className="cockpit-lever inline-flex items-center bg-transparent"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Existing Sandboxes */}
            {sandboxes.length > 0 && (
              <div className="cockpit-panel mb-8 p-8">
                <div className="cockpit-label mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    YOUR CLOUDS
                  </span>
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setCurrentStep('create');
                    }}
                    className="cockpit-lever inline-flex items-center text-sm"
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Create Another
                  </button>
                </div>

                {loading ? (
                  <div className="cockpit-text text-sm opacity-75">Loading sandboxes...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {sandboxes.map((sandbox) => (
                      <Card
                        key={sandbox.id}
                        hover={true}
                        className="border-l-4 border-[var(--hydrogen-amber)]"
                      >
                        <div className="mb-4">
                          <div className="cockpit-title mb-2 text-base">{sandbox.name}</div>
                          {sandbox.description && (
                            <div className="cockpit-text mb-4 text-sm opacity-80">
                              {sandbox.description}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  sandbox.synth_activated
                                    ? 'bg-green-500'
                                    : sandbox.testing_mode
                                      ? 'bg-blue-500'
                                      : 'bg-gray-500'
                                }`}
                              />
                              <span className="cockpit-label text-xs">
                                {sandbox.synth_activated
                                  ? 'Activated'
                                  : sandbox.testing_mode
                                    ? 'Testing Mode'
                                    : 'Inactive'}
                              </span>
                            </div>
                            {sandbox.synth_balance && (
                              <div className="flex items-center gap-2">
                                <Coins className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                                <span className="cockpit-text text-xs">
                                  Balance: {Number(sandbox.synth_balance) / 1e18} SYNTH
                                </span>
                              </div>
                            )}
                            {sandbox.contribution_count !== undefined && (
                              <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-[var(--hydrogen-amber)]" />
                                <span className="cockpit-text text-xs">
                                  {sandbox.contribution_count} contributions
                                  {sandbox.qualified_count ? ` (${sandbox.qualified_count} qualified)` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/enterprise/sandbox/${sandbox.id}`}
                            className="cockpit-lever inline-flex items-center text-xs"
                          >
                            <Settings className="mr-2 h-3 w-3" />
                            Configure
                          </Link>
                          <Link
                            href={`/enterprise/contribution?sandbox=${sandbox.id}`}
                            className="cockpit-lever inline-flex items-center bg-transparent text-xs"
                          >
                            <Zap className="mr-2 h-3 w-3" />
                            Submit
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {showCreateForm && (
                  <Card hover={false} className="mt-6 border-l-4 border-[var(--hydrogen-amber)]">
                    <div className="cockpit-title mb-4 text-lg">Create Another Sandbox</div>
                    <div className="space-y-4">
                      <div>
                        <label className="cockpit-label mb-2 block text-xs">Sandbox Name *</label>
                        <input
                          type="text"
                          value={newSandboxName}
                          onChange={(e) => setNewSandboxName(e.target.value)}
                          placeholder="e.g., Research Team Beta"
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
                          placeholder="Describe your sandbox..."
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
            )}

            {/* Reference Customers */}
            <ReferenceCustomersList />

            {/* Next Steps Guidance */}
            {sandboxes.length > 0 && (
              <div className="cockpit-panel p-8">
                <div className="cockpit-label mb-4">NEXT STEPS</div>
                <div className="cockpit-text space-y-3 text-sm">
                  <p>
                    <strong>1. Configure Your Sandbox:</strong> Click &quot;Configure&quot; on any sandbox to set scoring weights,
                    qualification thresholds, and other parameters.
                  </p>
                  <p>
                    <strong>2. Test Your Setup:</strong> Submit test contributions to verify your configuration works as expected.
                    Testing mode is free.
                  </p>
                  <p>
                    <strong>3. Activate with SYNTH:</strong> Once satisfied, deposit SYNTH tokens to activate your sandbox for
                    production use. Charges are based on reach (unique contributors) and activity (operations).
                  </p>
                  <p>
                    <strong>4. Broadcast to Contributors:</strong> Share your sandbox with your team. All contributions are
                    evaluated using the same HHF-AI lens as Syntheverse.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
