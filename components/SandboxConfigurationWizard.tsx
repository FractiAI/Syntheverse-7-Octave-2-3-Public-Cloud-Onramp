'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Target,
  Coins,
  Layers,
  Settings,
  Users,
  Zap,
  Award,
  FileText,
} from 'lucide-react';
import { Card } from './landing/shared/Card';

type ConfigurationStep = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

type SandboxConfig = {
  // Step 1: Project Vision
  name: string;
  description: string;
  mission: string;
  project_goals: string;

  // Step 2: SYNTH Tokenomics
  synth_activation_fee: number;
  monthly_rent_tier: string;
  energy_cost_per_evaluation: number;
  energy_cost_per_registration: number;

  // Step 3: Epoch Structure
  founder_threshold: number;
  pioneer_threshold: number;
  community_threshold: number;
  ecosystem_threshold: number;
  current_epoch: string;

  // Step 4: Scoring Configuration
  novelty_weight: number;
  density_weight: number;
  coherence_weight: number;
  alignment_weight: number;
  qualification_threshold: number;
  overlap_penalty_start: number;
  sweet_spot_center: number;
  sweet_spot_tolerance: number;

  // Step 5: Contributor Access
  public_access: boolean;
  contributor_channels: string[];
  allow_external_submissions: boolean;

  // Step 6: Metal Alignment
  gold_focus: boolean;
  silver_focus: boolean;
  copper_focus: boolean;
  hybrid_metals: boolean;
};

type SandboxConfigurationWizardProps = {
  sandboxId: string;
  initialConfig?: Partial<SandboxConfig>;
  onSave: (config: SandboxConfig) => Promise<void>;
};

const STEPS: ConfigurationStep[] = [
  {
    id: 'vision',
    title: 'Project Vision',
    icon: <Target className="h-5 w-5" />,
    description: 'Define your sandbox purpose and goals',
  },
  {
    id: 'tokenomics',
    title: 'SYNTH Tokenomics',
    icon: <Coins className="h-5 w-5" />,
    description: 'Configure SYNTH-based pricing and activation',
  },
  {
    id: 'epochs',
    title: 'Epoch Structure',
    icon: <Layers className="h-5 w-5" />,
    description: 'Set qualification thresholds for each epoch',
  },
  {
    id: 'scoring',
    title: 'Scoring Configuration',
    icon: <Award className="h-5 w-5" />,
    description: 'Customize evaluation weights and parameters',
  },
  {
    id: 'contributors',
    title: 'Contributor Access',
    icon: <Users className="h-5 w-5" />,
    description: 'Configure who can submit PoCs',
  },
  {
    id: 'metals',
    title: 'Metal Alignment',
    icon: <Zap className="h-5 w-5" />,
    description: 'Define focus areas (Gold/Silver/Copper)',
  },
  {
    id: 'review',
    title: 'Review & Activate',
    icon: <FileText className="h-5 w-5" />,
    description: 'Review configuration and activate sandbox',
  },
];

export default function SandboxConfigurationWizard({
  sandboxId,
  initialConfig = {},
  onSave,
}: SandboxConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<SandboxConfig>({
    // Defaults matching Syntheverse structure
    name: '',
    description: '',
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
    current_epoch: 'founder',
    novelty_weight: 1.0,
    density_weight: 1.0,
    coherence_weight: 1.0,
    alignment_weight: 1.0,
    qualification_threshold: 4000,
    overlap_penalty_start: 30,
    sweet_spot_center: 14.2,
    sweet_spot_tolerance: 5.0,
    public_access: false,
    contributor_channels: [],
    allow_external_submissions: false,
    gold_focus: false,
    silver_focus: false,
    copper_focus: false,
    hybrid_metals: true,
    ...initialConfig,
  });

  const [saving, setSaving] = useState(false);

  const updateConfig = (updates: Partial<SandboxConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const isStepComplete = (stepIndex: number): boolean => {
    const step = STEPS[stepIndex];
    switch (step.id) {
      case 'vision':
        return !!(config.name && config.description);
      case 'tokenomics':
        return config.synth_activation_fee > 0;
      case 'epochs':
        return (
          config.founder_threshold > 0 &&
          config.pioneer_threshold > 0 &&
          config.community_threshold > 0 &&
          config.ecosystem_threshold > 0
        );
      case 'scoring':
        return (
          config.novelty_weight > 0 &&
          config.density_weight > 0 &&
          config.coherence_weight > 0 &&
          config.alignment_weight > 0
        );
      case 'contributors':
        return true; // Optional step
      case 'metals':
        return config.gold_focus || config.silver_focus || config.copper_focus || config.hybrid_metals;
      case 'review':
        return false; // Review step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'vision':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                SELF-SIMILAR TO SYNTHEVERSE
              </div>
              <p className="cockpit-text text-sm">
                Your sandbox is a nested world within Syntheverse, operating with the same
                foundational principles: holographic hydrogen fractals, recursive awareness, and
                SYNTH-based tokenomics. Define your project&apos;s unique vision while maintaining
                structural alignment with the parent ecosystem.
              </p>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">
                Sandbox Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="e.g., Quantum Biology Research Sandbox"
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
              <p className="cockpit-text mt-1 text-xs opacity-75">
                A clear, descriptive name for your sandbox ecosystem
              </p>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe what your sandbox is about, what contributions you seek, and how it fits within Syntheverse..."
                rows={4}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Mission Statement</label>
              <textarea
                value={config.mission}
                onChange={(e) => updateConfig({ mission: e.target.value })}
                placeholder="Your sandbox's core mission and purpose within the Syntheverse ecosystem..."
                rows={3}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Project Goals</label>
              <textarea
                value={config.project_goals}
                onChange={(e) => updateConfig({ project_goals: e.target.value })}
                placeholder="Specific goals and outcomes you aim to achieve through this sandbox..."
                rows={3}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
            </div>
          </div>
        );

      case 'tokenomics':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                SYNTH-BASED PRICING MODEL
              </div>
              <p className="cockpit-text text-sm">
                Configure your sandbox&apos;s SYNTH token economics. Sandboxes operate on a
                free-to-build model with SYNTH charges for activation, rent (based on reach), and
                energy (based on activity).
              </p>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">
                Activation Fee (SYNTH) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={config.synth_activation_fee}
                onChange={(e) => updateConfig({ synth_activation_fee: Number(e.target.value) })}
                min={0}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
              <p className="cockpit-text mt-1 text-xs opacity-75">
                One-time SYNTH fee to activate sandbox for production (default: 10,000 SYNTH)
              </p>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Initial Reach Tier</label>
              <select
                value={config.monthly_rent_tier}
                onChange={(e) => updateConfig({ monthly_rent_tier: e.target.value })}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              >
                <option value="Seed">Seed (1,000 SYNTH/month)</option>
                <option value="Growth">Growth (5,000 SYNTH/month)</option>
                <option value="Community">Community (15,000 SYNTH/month)</option>
                <option value="Ecosystem">Ecosystem (50,000 SYNTH/month)</option>
                <option value="Metropolis">Metropolis (100,000 SYNTH/month)</option>
              </select>
              <p className="cockpit-text mt-1 text-xs opacity-75">
                Monthly rent scales automatically based on unique contributors
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="cockpit-label mb-2 block text-xs">Energy: Evaluation (SYNTH)</label>
                <input
                  type="number"
                  value={config.energy_cost_per_evaluation}
                  onChange={(e) =>
                    updateConfig({ energy_cost_per_evaluation: Number(e.target.value) })
                  }
                  min={0}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Per PoC evaluation</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">
                  Energy: Registration (SYNTH)
                </label>
                <input
                  type="number"
                  value={config.energy_cost_per_registration}
                  onChange={(e) =>
                    updateConfig({ energy_cost_per_registration: Number(e.target.value) })
                  }
                  min={0}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Per on-chain registration</p>
              </div>
            </div>
          </div>
        );

      case 'epochs':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                EPOCH QUALIFICATION THRESHOLDS
              </div>
              <p className="cockpit-text text-sm">
                Set the minimum PoC scores required for each epoch qualification. These thresholds
                determine when contributions qualify for Founder, Pioneer, Community, or Ecosystem
                recognition within your sandbox.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="cockpit-label mb-2 block text-xs">
                  Founder Threshold <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={config.founder_threshold}
                  onChange={(e) => updateConfig({ founder_threshold: Number(e.target.value) })}
                  min={0}
                  max={10000}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Default: 8,000 (Syntheverse standard)</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">
                  Pioneer Threshold <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={config.pioneer_threshold}
                  onChange={(e) => updateConfig({ pioneer_threshold: Number(e.target.value) })}
                  min={0}
                  max={10000}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Default: 6,000</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">
                  Community Threshold <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={config.community_threshold}
                  onChange={(e) => updateConfig({ community_threshold: Number(e.target.value) })}
                  min={0}
                  max={10000}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Default: 5,000</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">
                  Ecosystem Threshold <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={config.ecosystem_threshold}
                  onChange={(e) => updateConfig({ ecosystem_threshold: Number(e.target.value) })}
                  min={0}
                  max={10000}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Default: 4,000</p>
              </div>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Starting Epoch</label>
              <select
                value={config.current_epoch}
                onChange={(e) => updateConfig({ current_epoch: e.target.value })}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              >
                <option value="founder">Founder</option>
                <option value="pioneer">Pioneer</option>
                <option value="community">Community</option>
                <option value="ecosystem">Ecosystem</option>
              </select>
            </div>
          </div>
        );

      case 'scoring':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                CUSTOM SCORING WEIGHTS
              </div>
              <p className="cockpit-text text-sm">
                Adjust the relative importance of each scoring dimension. Default weights (1.0 each)
                match Syntheverse&apos;s balanced evaluation. You can emphasize specific dimensions
                to align with your sandbox&apos;s focus.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="cockpit-label mb-2 block text-xs">Novelty Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.novelty_weight}
                  onChange={(e) => updateConfig({ novelty_weight: Number(e.target.value) })}
                  min={0}
                  max={5}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Originality & frontier contribution</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">Density Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.density_weight}
                  onChange={(e) => updateConfig({ density_weight: Number(e.target.value) })}
                  min={0}
                  max={5}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Information richness & depth</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">Coherence Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.coherence_weight}
                  onChange={(e) => updateConfig({ coherence_weight: Number(e.target.value) })}
                  min={0}
                  max={5}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Internal consistency & clarity</p>
              </div>
              <div>
                <label className="cockpit-label mb-2 block text-xs">Alignment Weight</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.alignment_weight}
                  onChange={(e) => updateConfig({ alignment_weight: Number(e.target.value) })}
                  min={0}
                  max={5}
                  className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
                />
                <p className="cockpit-text mt-1 text-xs opacity-75">Fit with HHF principles</p>
              </div>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Qualification Threshold</label>
              <input
                type="number"
                value={config.qualification_threshold}
                onChange={(e) => updateConfig({ qualification_threshold: Number(e.target.value) })}
                min={0}
                max={10000}
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
              <p className="cockpit-text mt-1 text-xs opacity-75">
                Minimum score to qualify for any epoch (default: 4,000)
              </p>
            </div>

            <div className="border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
              <div className="cockpit-label mb-3 text-xs">Overlap & Redundancy Parameters</div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="cockpit-label mb-2 block text-xs">Overlap Penalty Start (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.overlap_penalty_start}
                    onChange={(e) => updateConfig({ overlap_penalty_start: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="cockpit-input w-full bg-black/20 p-2 text-sm"
                  />
                  <p className="cockpit-text mt-1 text-xs opacity-75">Default: 30%</p>
                </div>
                <div>
                  <label className="cockpit-label mb-2 block text-xs">Sweet Spot Center (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.sweet_spot_center}
                    onChange={(e) => updateConfig({ sweet_spot_center: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="cockpit-input w-full bg-black/20 p-2 text-sm"
                  />
                  <p className="cockpit-text mt-1 text-xs opacity-75">Default: 14.2%</p>
                </div>
                <div>
                  <label className="cockpit-label mb-2 block text-xs">Sweet Spot Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.sweet_spot_tolerance}
                    onChange={(e) => updateConfig({ sweet_spot_tolerance: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="cockpit-input w-full bg-black/20 p-2 text-sm"
                  />
                  <p className="cockpit-text mt-1 text-xs opacity-75">Default: ±5.0%</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contributors':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                CONTRIBUTOR ACCESS CONTROL
              </div>
              <p className="cockpit-text text-sm">
                Configure who can submit PoCs to your sandbox. You can allow public submissions,
                restrict to specific channels, or manage access manually.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.public_access}
                  onChange={(e) => updateConfig({ public_access: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Allow Public Submissions</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Anyone can submit PoCs to your sandbox
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.allow_external_submissions}
                  onChange={(e) => updateConfig({ allow_external_submissions: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Allow External Submissions</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Accept submissions from outside your organization
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className="cockpit-label mb-2 block text-xs">Contributor Channels (Optional)</label>
              <input
                type="text"
                value={config.contributor_channels.join(', ')}
                onChange={(e) =>
                  updateConfig({
                    contributor_channels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g., research-team, developers, community"
                className="cockpit-input w-full bg-[var(--cockpit-carbon)] p-3 text-sm"
              />
              <p className="cockpit-text mt-1 text-xs opacity-75">
                Comma-separated list of contributor channel names
              </p>
            </div>
          </div>
        );

      case 'metals':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                METAL ALIGNMENT FOCUS
              </div>
              <p className="cockpit-text text-sm">
                Define which metal types your sandbox emphasizes. Gold = Research/Novelty, Silver =
                Technology/Development, Copper = Alignment/Coherence. Hybrid accepts all types.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.gold_focus}
                  onChange={(e) => updateConfig({ gold_focus: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Gold Focus (Research & Novelty)</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Emphasize scientific contributions and original research
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.silver_focus}
                  onChange={(e) => updateConfig({ silver_focus: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Silver Focus (Technology & Development)</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Emphasize technical implementations and development work
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.copper_focus}
                  onChange={(e) => updateConfig({ copper_focus: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Copper Focus (Alignment & Coherence)</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Emphasize alignment with HHF principles and coherence
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.hybrid_metals}
                  onChange={(e) => updateConfig({ hybrid_metals: e.target.checked })}
                  className="h-4 w-4"
                />
                <div>
                  <div className="cockpit-label text-xs">Hybrid (All Metals)</div>
                  <p className="cockpit-text text-xs opacity-75">
                    Accept contributions across all metal types (recommended)
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="border border-[var(--hydrogen-amber)] bg-[rgba(255,184,77,0.05)] p-4">
              <div className="cockpit-label mb-2 text-xs" style={{ color: '#ffb84d' }}>
                CONFIGURATION REVIEW
              </div>
              <p className="cockpit-text text-sm">
                Review your sandbox configuration. Once saved, you can activate your sandbox and
                start receiving PoC submissions.
              </p>
            </div>

            <div className="space-y-4">
              <Card hover={false} className="border-l-4 border-blue-500/50">
                <div className="cockpit-label mb-2 text-xs">PROJECT VISION</div>
                <div className="cockpit-title text-sm">{config.name || 'Not set'}</div>
                {config.description && (
                  <div className="cockpit-text mt-2 text-xs opacity-75">{config.description}</div>
                )}
              </Card>

              <Card hover={false} className="border-l-4 border-[var(--hydrogen-amber)]">
                <div className="cockpit-label mb-2 text-xs">SYNTH TOKENOMICS</div>
                <div className="cockpit-text text-xs">
                  Activation: {config.synth_activation_fee.toLocaleString()} SYNTH
                </div>
                <div className="cockpit-text text-xs">
                  Initial Rent Tier: {config.monthly_rent_tier}
                </div>
                <div className="cockpit-text text-xs">
                  Energy Costs: {config.energy_cost_per_evaluation} SYNTH/eval,{' '}
                  {config.energy_cost_per_registration} SYNTH/registration
                </div>
              </Card>

              <Card hover={false} className="border-l-4 border-purple-500/50">
                <div className="cockpit-label mb-2 text-xs">EPOCH THRESHOLDS</div>
                <div className="cockpit-text text-xs">
                  Founder: {config.founder_threshold} | Pioneer: {config.pioneer_threshold} |
                  Community: {config.community_threshold} | Ecosystem: {config.ecosystem_threshold}
                </div>
              </Card>

              <Card hover={false} className="border-l-4 border-green-500/50">
                <div className="cockpit-label mb-2 text-xs">SCORING WEIGHTS</div>
                <div className="cockpit-text text-xs">
                  N:{config.novelty_weight} D:{config.density_weight} C:{config.coherence_weight}{' '}
                  A:{config.alignment_weight}
                </div>
              </Card>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="cockpit-lever inline-flex items-center text-sm"
            >
              {saving ? 'Saving...' : 'Save Configuration & Continue'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="cockpit-panel p-6">
        <div className="mb-6">
          <div className="cockpit-label mb-2 text-xs">CONFIGURATION PROGRESS</div>
          <div className="cockpit-title text-xl">{STEPS[currentStep].title}</div>
          <p className="cockpit-text mt-1 text-sm opacity-75">{STEPS[currentStep].description}</p>
        </div>

        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    index === currentStep
                      ? 'border-[var(--hydrogen-amber)] bg-[var(--hydrogen-amber)]/20'
                      : isStepComplete(index)
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)]'
                  }`}
                >
                  {isStepComplete(index) && index !== currentStep ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="cockpit-label mt-2 text-xs">{step.title}</div>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="mx-2 h-4 w-4 text-[var(--keyline-primary)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="cockpit-panel p-6">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="cockpit-lever inline-flex items-center bg-transparent text-sm disabled:opacity-50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button onClick={nextStep} className="cockpit-lever inline-flex items-center text-sm">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="cockpit-lever inline-flex items-center text-sm"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        )}
      </div>
    </div>
  );
}

