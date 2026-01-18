/**
 * Groq AI Evaluation Module
 * 
 * NOTE: This folder is named "utils/grok/" for historical reasons.
 * The actual AI provider is Groq (https://groq.com), not "Grok" by Elon Musk.
 * All variable names in this file use "groq" for clarity.
 * 
 * Provider: Groq (https://groq.com)
 * Model: llama-3.3-70b-versatile
 * Purpose: AI-powered Proof-of-Contribution evaluation using hydrogen-holographic fractal scoring
 */

import { debug, debugError } from '@/utils/debug';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  tokenomicsTable,
  epochMetalBalancesTable,
  enterpriseContributionsTable,
} from '@/utils/db/schema';
import { ne, sql } from 'drizzle-orm';
import { qualifyEpoch } from '@/utils/epochs/qualification';
import {
  vectorizeSubmission,
  formatArchivedVectors,
  calculateVectorRedundancy,
  Vector3D,
} from '@/utils/vectors';
import { SYNTHEVERSE_SYSTEM_PROMPT } from '@/utils/grok/system-prompt';
import crypto from 'crypto';
// THALET Protocol: Import AtomicScorer for single source of truth
import { AtomicScorer } from '@/utils/scoring/AtomicScorer';
// NSPFRP: Import BridgeSpec utilities for TO/Testability integration
import { extractBridgeSpec } from '@/utils/bridgespec/BridgeSpecExtractor';
// SCALABILITY FIX: Removed archive utilities - using vectors-only approach for infinite scalability

// TSRC: Import snapshot and operator utilities
import { createArchiveSnapshot, verifySnapshotIntegrity } from '@/utils/tsrc/snapshot';
import { createIsotropicOperator } from '@/utils/tsrc/operators';
import type { DeterminismContract, TSRCEvaluationTrace } from '@/utils/tsrc/types';

interface TokenomicsInfo {
  current_epoch: string;
  epoch_balances: Record<string, number>;
  total_coherence_density: number;
  founder_halving_count: number;
  epoch_progression: Record<string, boolean>;
}

interface GroqEvaluationResult {
  coherence: number;
  density: number;
  redundancy: number;
  pod_score: number;
  novelty: number;
  alignment: number;
  metals: string[];
  qualified: boolean;
  qualified_epoch?: string;
  classification?: string[];
  redundancy_analysis?: string;
  metal_justification?: string;
  founder_certificate?: string;
  homebase_intro?: string;
  tokenomics_recommendation?: any;
  base_novelty?: number;
  base_density?: number;
  redundancy_overlap_percent?: number;
  is_seed_submission?: boolean;
  seed_justification?: string;
  is_edge_submission?: boolean;
  edge_justification?: string;
  raw_groq_response?: string;
  llm_metadata?: {
    timestamp: string;
    date: string;
    model: string;
    model_version: string;
    provider: string;
    system_prompt_preview: string;
    system_prompt_hash: string;
    system_prompt_file: string;
    evaluation_timestamp_ms: number;
  };
  redundancy_penalty_percent_computed?: number;
  sweet_spot_bonus_multiplier_computed?: number;
  atomic_score?: any; // THALET Protocol: Atomic score payload
  score_trace?: any; // THALET Protocol: Score trace
  scoring_metadata?: any; // THALET Protocol: Scoring metadata
  pod_composition?: any; // THALET Protocol: Pod composition
}

// Sandbox context for customizing system prompt
type SandboxContext = {
  id: string;
  name: string;
  description?: string | null;
  mission?: string;
  project_goals?: string;
  metal_focus?: {
    gold_focus?: boolean;
    silver_focus?: boolean;
    copper_focus?: boolean;
    hybrid_metals?: boolean;
  };
  scoring_config?: {
    novelty_weight?: number;
    density_weight?: number;
    coherence_weight?: number;
    alignment_weight?: number;
    qualification_threshold?: number;
    overlap_penalty_start?: number;
    sweet_spot_center?: number;
    sweet_spot_tolerance?: number;
  };
  epoch_thresholds?: {
    founder?: number;
    pioneer?: number;
    community?: number;
    ecosystem?: number;
  };
};

// Call Groq API directly for PoC evaluation
export async function evaluateWithGroq(
  textContent: string,
  title: string,
  category?: string,
  excludeHash?: string,
  sandboxContext?: SandboxContext,
  bridgeSpec?: any // Optional BridgeSpec for TO/Testability integration
): Promise<{
  coherence: number;
  density: number;
  redundancy: number;
  pod_score: number;
  novelty: number;
  alignment: number;
  metals: string[];
  qualified: boolean;
  qualified_epoch?: string;
  classification?: string[];
  redundancy_analysis?: string;
  metal_justification?: string;
  founder_certificate?: string;
  homebase_intro?: string;
  tokenomics_recommendation?: {
    eligible_epochs?: string[];
    suggested_allocation?: number;
    tier_multiplier?: number;
    epoch_distribution?: Record<string, number>;
    allocation_notes?: string;
    requires_admin_approval?: boolean;
  };
  base_novelty?: number;
  base_density?: number;
  redundancy_overlap_percent?: number;
  is_seed_submission?: boolean;
  seed_justification?: string;
  is_edge_submission?: boolean;
  edge_justification?: string;
  raw_groq_response?: string;
  llm_metadata?: {
    timestamp: string;
    date: string;
    model: string;
    model_version: string;
    provider: string;
    system_prompt_preview: string;
    system_prompt_hash: string;
    system_prompt_file: string;
    evaluation_timestamp_ms: number;
  };
  redundancy_penalty_percent?: number;
  sweet_spot_bonus_multiplier?: number;
  redundancy_penalty_percent_computed?: number;
  sweet_spot_bonus_multiplier_computed?: number;
  // H) Score trace for transparency (Marek requirement)
  score_trace?: {
    dimension_scores: {
      novelty: number;
      density: number;
      coherence: number;
      alignment: number;
    };
    composite: number;
    base_pod_score: number;
    overlap_percent: number;
    penalty_percent_computed: number;
    penalty_percent_applied: number;
    bonus_multiplier_computed: number;
    bonus_multiplier_applied: number;
    seed_multiplier?: number;
    edge_multiplier?: number;
    is_seed_submission?: boolean;
    is_edge_submission?: boolean;
    after_penalty: number;
    after_bonus: number;
    after_seed?: number;
    final_score: number;
    formula: string;
    clamped: boolean;
  };
  // Deterministic Score Contract (Marek requirement)
  scoring_metadata?: {
    score_config_id: string;
    sandbox_id: string;
    archive_version: string;
    evaluation_timestamp: string;
  };
  pod_composition?: {
    sum_dims: {
      novelty: number;
      density: number;
      coherence: number;
      alignment: number;
      composite: number;
    };
    multipliers: {
      sweet_spot_multiplier: number;
      seed_multiplier: number;
      total_multiplier: number;
    };
    penalties: {
      overlap_penalty_percent: number;
      total_penalty_percent: number;
    };
    sandbox_factor: number;
    final_clamped: number;
  };
  // THALET Protocol: Atomic Score (Single Source of Truth)
  atomic_score?: any;
  // NEW: BridgeSpec info (for TO/Testability integration)
  bridge_spec?: any | null;
  bridgespec_hash?: string | null;
}> {
  // Try both GROQ and GROK variants for backwards compatibility
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY;
  if (!groqApiKey) {
    throw new Error(
      'NEXT_PUBLIC_GROQ_API_KEY or NEXT_PUBLIC_GROK_API_KEY not configured. Groq API key is required for evaluation.'
    );
  }

  // SCALABILITY FIX: Truncate text content to prevent token limit errors (413/429)
  // Groq on-demand tier has 6000 token limit. Optimized system prompt is ~2210 tokens.
  // Available tokens: ~3790 tokens. With safety margin: ~3000 tokens (~12000 chars).
  // Safe limit: 10000 characters (~2500 tokens) for submissions
  // Budget breakdown: System(~2210) + Content(~2500) + Overhead(~500) = ~5210 tokens (< 6000 limit)
  const MAX_CONTENT_LENGTH = 10000;
  const truncatedText =
    textContent.length > MAX_CONTENT_LENGTH
      ? textContent.substring(0, MAX_CONTENT_LENGTH).trimEnd() +
        '\n\n[Content truncated for evaluation. Focus on abstract, key equations, and novel contributions.]'
      : textContent;

  debug('EvaluateWithGroq', 'Calling Groq API for evaluation', {
    textLength: textContent.length,
    truncatedLength: truncatedText.length,
    wasTruncated: textContent.length > MAX_CONTENT_LENGTH,
    title,
    category,
    excludeHash,
  });

  // 🔥 CRITICAL FIX: Load toggle config EARLY (before building AI prompt)
  // This ensures AI prompt shows APPLIED values, not COMPUTED values
  let seedMultiplierEnabled = true;
  let edgeMultiplierEnabled = true;
  let overlapAdjustmentsEnabled = true;
  let scoreConfigVersion = 'v1.0.0';
  let sweetSpotCenter = 0.142;
  let sweetSpotTolerance = 0.05;
  let penaltyThreshold = 0.30;
  let overlapOperator = 'embedding_cosine';
  
  try {
    const { db } = await import('@/utils/db/db');
    const { scoringConfigTable } = await import('@/utils/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const configResult = await db
      .select()
      .from(scoringConfigTable)
      .where(eq(scoringConfigTable.config_key, 'multiplier_toggles'))
      .limit(1);
    
    if (configResult && configResult.length > 0) {
      const config = configResult[0];
      const configValue = config.config_value;
      
      // NSPFRP: Use centralized toggle extractor (eliminates fractalized self-similar errors)
      const { extractToggleStates } = await import('@/utils/thalet/ToggleExtractor');
      const toggleStates = extractToggleStates(configValue);
      seedMultiplierEnabled = toggleStates.seedMultiplierEnabled;
      edgeMultiplierEnabled = toggleStates.edgeMultiplierEnabled;
      overlapAdjustmentsEnabled = toggleStates.overlapAdjustmentsEnabled;
      
      debug('ToggleConfig', 'Early toggle load (before AI prompt)', {
        raw_config: {
          seed_enabled: configValue.seed_enabled,
          edge_enabled: configValue.edge_enabled,
          overlap_enabled: configValue.overlap_enabled,
        },
        computed_states: {
          seedMultiplierEnabled,
          edgeMultiplierEnabled,
          overlapAdjustmentsEnabled,
        },
      });
      
      scoreConfigVersion = config.version || 'v1.0.0';
      sweetSpotCenter = configValue.sweet_spot_center ?? 0.142;
      sweetSpotTolerance = configValue.sweet_spot_tolerance ?? 0.05;
      penaltyThreshold = configValue.penalty_threshold ?? 0.30;
      overlapOperator = configValue.overlap_operator || 'embedding_cosine';
    }
  } catch (error) {
    console.warn('Failed to fetch scoring config (early load), using defaults:', error);
  }

  // Generate vector embedding and 3D coordinates for current submission
  // SCALABILITY FIX: Using vectors-only approach - removed archive data extraction and top3Matches
  // Vector-based redundancy is sufficient and scales infinitely without bloating the prompt
  // Use full text for vectorization (not truncated) - embeddings need full context
  let currentVectorization: { embedding: number[]; vector: Vector3D } | null = null;
  try {
    debug('EvaluateWithGroq', 'Generating vector embedding and 3D coordinates');
    const vectorization = await vectorizeSubmission(textContent);
    currentVectorization = {
      embedding: vectorization.embedding,
      vector: vectorization.vector,
    };
    debug('EvaluateWithGroq', 'Vectorization complete', {
      embeddingDimensions: vectorization.embeddingDimensions,
      vector: vectorization.vector,
      model: vectorization.embeddingModel,
    });
  } catch (error) {
    debugError('EvaluateWithGroq', 'Failed to generate vectorization', error);
    // Continue without vectorization - redundancy calculation will handle gracefully
  }

  // Fetch archived vectors for redundancy checking and context
  // SCALABILITY: Only load vectors/metadata, not full text_content
  let archivedVectors: Array<{
    submission_hash: string;
    title: string;
    embedding?: number[] | null;
    vector_x?: number | null;
    vector_y?: number | null;
    vector_z?: number | null;
    metadata?: any;
  }> = [];

  try {
    // Fetch ONLY vector/metadata data for redundancy calculation (SCALABILITY FIX: removed text_content)
    // This reduces memory usage by ~99% and improves query performance significantly
    // If sandbox context is provided, fetch from enterprise contributions table for that sandbox
    // Otherwise, fetch from main Syntheverse contributions table
    let archivedContributions;
    
    if (sandboxContext) {
      // Fetch from enterprise sandbox contributions
      archivedContributions = await db
        .select({
          submission_hash: enterpriseContributionsTable.submission_hash,
          title: enterpriseContributionsTable.title,
          embedding: enterpriseContributionsTable.embedding,
          vector_x: enterpriseContributionsTable.vector_x,
          vector_y: enterpriseContributionsTable.vector_y,
          vector_z: enterpriseContributionsTable.vector_z,
          metadata: enterpriseContributionsTable.metadata,
          created_at: enterpriseContributionsTable.created_at,
        })
        .from(enterpriseContributionsTable)
        .where(
          sandboxContext.id
            ? sql`${enterpriseContributionsTable.sandbox_id} = ${sandboxContext.id} ${
                excludeHash ? sql`AND ${enterpriseContributionsTable.submission_hash} != ${excludeHash}` : sql``
              }`
            : excludeHash
              ? sql`${enterpriseContributionsTable.submission_hash} != ${excludeHash}`
              : undefined
        )
        .orderBy(enterpriseContributionsTable.created_at);
    } else {
      // Fetch from main Syntheverse contributions
      archivedContributions = await db
        .select({
          submission_hash: contributionsTable.submission_hash,
          title: contributionsTable.title,
          embedding: contributionsTable.embedding,
          vector_x: contributionsTable.vector_x,
          vector_y: contributionsTable.vector_y,
          vector_z: contributionsTable.vector_z,
          metadata: contributionsTable.metadata,
          created_at: contributionsTable.created_at,
        })
        .from(contributionsTable)
        .where(excludeHash ? ne(contributionsTable.submission_hash, excludeHash) : undefined)
        .orderBy(contributionsTable.created_at);
    }

    // Store vector data for redundancy calculations (no text_content needed)
    archivedVectors = archivedContributions.map((contrib) => ({
      submission_hash: contrib.submission_hash,
      title: contrib.title,
      embedding: contrib.embedding as number[] | null,
      vector_x: contrib.vector_x ? Number(contrib.vector_x) : null,
      vector_y: contrib.vector_y ? Number(contrib.vector_y) : null,
      vector_z: contrib.vector_z ? Number(contrib.vector_z) : null,
      metadata: contrib.metadata || {},
    }));

    debug('EvaluateWithGroq', 'Fetched archived vectors for redundancy', {
      count: archivedVectors.length,
      withVectors: archivedVectors.filter((v) => v.vector_x !== null).length,
      withEmbeddings: archivedVectors.filter((v) => v.embedding).length,
      note: 'Only vectors/metadata loaded (text_content excluded for scalability)',
    });
  } catch (error) {
    debugError('EvaluateWithGroq', 'Failed to fetch archived PoCs', error);
    // Continue without archived PoCs if fetch fails
  }

  // TSRC: Create content-addressed archive snapshot for deterministic evaluation
  const contributionHashes = archivedVectors.map(v => v.submission_hash);
  const archiveSnapshot = createArchiveSnapshot(
    contributionHashes,
    sandboxContext?.id || null,
    {
      name: 'text-embedding-3-small',
      version: '1.0',
      provider: 'openai',
    },
    {
      method: 'cosine_similarity',
      dimensions: 1536,
      normalization: 'l2',
    },
    {
      purpose: 'evaluation',
      notes: `Evaluation for: ${title}`,
    }
  );

  debug('TSRC:Snapshot', 'Created archive snapshot', {
    snapshot_id: archiveSnapshot.snapshot_id,
    item_count: archiveSnapshot.item_count,
    sandbox_id: archiveSnapshot.sandbox_id,
  });

  // Seed detection: NOT based on timing, but on CONTENT (Seed Information Theory)
  // The AI will analyze if content exhibits seed characteristics:
  // - Irreducible informational primitive
  // - Contains implicit expansion rules
  // - Establishes foundational concepts/frameworks
  // We pass a hint but let AI make the determination based on actual content
  const emptyArchive = archivedVectors.length === 0;
  const seedDetectionMode = emptyArchive 
    ? 'high_priority' // Empty archive increases seed likelihood, but not guaranteed
    : 'evaluate_content'; // Non-empty archive doesn't exclude seed status

  debug('EvaluateWithGroq', 'Submission comparison context', {
    archivedCount: archivedVectors.length,
    seedDetectionMode,
    title,
    comparisonContext: emptyArchive
      ? 'Empty archive - analyze content for seed characteristics'
      : `Compare to ${archivedVectors.length} prior submission(s) AND check for seed properties`,
  });

  // Calculate actual vector-based redundancy if we have current vectorization
  let calculatedRedundancy: {
    overlap_percent: number;
    penalty_percent: number;
    bonus_multiplier: number;
    similarity_score: number;
    closest_vectors: Array<{ hash: string; title: string; similarity: number; distance: number }>;
    analysis: string;
    overlap_percentile?: number;
    nearest_10_neighbors?: {
      mean: number;
      std_dev: number;
      min: number;
      max: number;
    };
    computation_context?: 'global' | 'per-user' | 'per-sandbox';
  } | null = null;

  if (currentVectorization && archivedVectors.length > 0) {
    // Compare this submission to the Syntheverse sandbox + prior submissions
    // SCALABILITY FIX: Limit to top 50 vectors for redundancy calculation (still accurate, much faster)
    const MAX_REDUNDANCY_VECTORS = 50;
    const limitedArchivedVectors = archivedVectors.slice(0, MAX_REDUNDANCY_VECTORS);

    try {
      const formattedArchivedVectors = formatArchivedVectors(limitedArchivedVectors);
      calculatedRedundancy = await calculateVectorRedundancy(
        truncatedText, // Use truncated text for redundancy calculation (matches what we send to Groq)
        currentVectorization.embedding,
        currentVectorization.vector,
        formattedArchivedVectors // Limited to top 50 for scalability (redundancy calc only needs closest matches)
      );
      debug(
        'EvaluateWithGroq',
        'Calculated redundancy by comparing to sandbox + prior submissions',
        {
          totalArchivedVectors: archivedVectors.length,
          vectorsUsed: limitedArchivedVectors.length,
          note: 'Limited to top 50 vectors for scalability (redundancy calculation only needs closest matches)',
          overlap_percent: calculatedRedundancy.overlap_percent,
          penalty_percent: calculatedRedundancy.penalty_percent,
          bonus_multiplier: calculatedRedundancy.bonus_multiplier,
          similarity_score: calculatedRedundancy.similarity_score,
          closest_count: calculatedRedundancy.closest_vectors.length,
        }
      );
    } catch (error) {
      debugError('EvaluateWithGroq', 'Failed to calculate vector redundancy', error);
      // Continue without calculated redundancy - Groq will estimate
    }
  }

  // Fetch tokenomics information
  let tokenomicsInfo: TokenomicsInfo | null = null;
  try {
    const tokenomics = await db.select().from(tokenomicsTable).limit(1);

    if (tokenomics && tokenomics.length > 0) {
      const tk = tokenomics[0];
      const epochMetalBalances = await db.select().from(epochMetalBalancesTable);

      // SCALABILITY FIX: Skip total_coherence_density calculation (not critical for evaluation)
      // This value is not used in the evaluation prompt and was causing O(n) performance issues
      // If needed in the future, it should be cached in the tokenomics table or computed incrementally
      const totalCoherenceDensity = 0;

      // Aggregate per-epoch total balances (sum of metal pools)
      const epochTotals: Record<string, number> = {};
      for (const row of epochMetalBalances) {
        const epoch = String(row.epoch).toLowerCase().trim();
        epochTotals[epoch] = (epochTotals[epoch] || 0) + Number(row.balance || 0);
      }

      tokenomicsInfo = {
        current_epoch: tk.current_epoch || 'founder',
        epoch_balances: epochTotals,
        total_coherence_density: totalCoherenceDensity,
        founder_halving_count: Number(tk.founder_halving_count || 0),
        epoch_progression: {
          founder: true, // Assume founder epoch is open
          pioneer: false,
          community: false,
          ecosystem: false,
        },
      };

      debug('EvaluateWithGroq', 'Fetched tokenomics info', tokenomicsInfo);
    }
  } catch (error) {
    debugError('EvaluateWithGroq', 'Failed to fetch tokenomics info', error);
    // Continue without tokenomics if fetch fails
  }

  // Use the canonical Syntheverse system prompt (intentionally long; required persona + schema).
  // Token-budget control is handled by shrinking user payload and truncating content when needed.
  let systemPrompt = SYNTHEVERSE_SYSTEM_PROMPT;

  // Customize system prompt for sandbox context if provided
  if (sandboxContext) {
    const sandboxCustomization = `

---

## SANDBOX-SPECIFIC CONTEXT

You are evaluating a contribution within the **${sandboxContext.name}** sandbox, a nested ecosystem within Syntheverse.

**Sandbox Identity:**
- Sandbox ID: ${sandboxContext.id}
- Name: ${sandboxContext.name}
${sandboxContext.description ? `- Description: ${sandboxContext.description}` : ''}
${sandboxContext.mission ? `- Mission: ${sandboxContext.mission}` : ''}
${sandboxContext.project_goals ? `- Project Goals: ${sandboxContext.project_goals}` : ''}

**Sandbox-Specific Evaluation Parameters:**
${sandboxContext.scoring_config ? `
- Scoring Weights: Novelty=${sandboxContext.scoring_config.novelty_weight || 1.0}, Density=${sandboxContext.scoring_config.density_weight || 1.0}, Coherence=${sandboxContext.scoring_config.coherence_weight || 1.0}, Alignment=${sandboxContext.scoring_config.alignment_weight || 1.0}
- Qualification Threshold: ${sandboxContext.scoring_config.qualification_threshold || 4000}
- Overlap Parameters: Penalty Start=${sandboxContext.scoring_config.overlap_penalty_start || 30}%, Sweet Spot=${sandboxContext.scoring_config.sweet_spot_center || 14.2}%±${sandboxContext.scoring_config.sweet_spot_tolerance || 5.0}%
` : ''}
${sandboxContext.epoch_thresholds ? `
- Epoch Thresholds: Founder≥${sandboxContext.epoch_thresholds.founder || 8000}, Pioneer≥${sandboxContext.epoch_thresholds.pioneer || 6000}, Community≥${sandboxContext.epoch_thresholds.community || 5000}, Ecosystem≥${sandboxContext.epoch_thresholds.ecosystem || 4000}
` : ''}
${sandboxContext.metal_focus ? `
- Metal Focus: ${sandboxContext.metal_focus.gold_focus ? 'Gold (Research/Novelty) ' : ''}${sandboxContext.metal_focus.silver_focus ? 'Silver (Technology/Development) ' : ''}${sandboxContext.metal_focus.copper_focus ? 'Copper (Alignment/Coherence) ' : ''}${sandboxContext.metal_focus.hybrid_metals ? 'Hybrid (All Metals)' : ''}
` : ''}

**Evaluation Context:**
- This contribution is being evaluated within the ${sandboxContext.name} sandbox ecosystem
- The sandbox operates as a self-similar nested world within Syntheverse
- All Syntheverse principles (HHF-AI, holographic hydrogen fractals, recursive awareness) apply
- However, the sandbox may have specific focus areas, goals, or evaluation criteria as defined above
- When evaluating alignment, consider both general Syntheverse alignment AND alignment with this sandbox's specific mission and goals

**Archive Context:**
- Similarity comparisons should be made within this sandbox's archive (per-sandbox context)
- Contributions are compared against other submissions to the ${sandboxContext.name} sandbox
- This ensures proper redundancy detection within the sandbox's specific domain

---

`;

    systemPrompt = systemPrompt + sandboxCustomization;
  }

  // SCALABILITY FIX: Using vectors-only approach - removed archivedPoCsContext (abstract text)
  // Vector-based redundancy (calculatedRedundancyContext) is sufficient and scales infinitely
  // This prevents prompt bloat that causes coherence collapse after multiple submissions

  // Add calculated redundancy information if available (compact, vector-based).
  // Include enhanced distribution data (Marek's requirements)
  // 🔥 CRITICAL FIX: Show APPLIED values (respecting toggles), not COMPUTED values
  const appliedPenaltyPercent = overlapAdjustmentsEnabled ? calculatedRedundancy?.penalty_percent || 0 : 0;
  const appliedBonusMultiplier = overlapAdjustmentsEnabled ? calculatedRedundancy?.bonus_multiplier || 1.0 : 1.0;
  
  const calculatedRedundancyContext = calculatedRedundancy
    ? `Vector redundancy (HHF 3D):
- overlap_percent=${calculatedRedundancy.overlap_percent.toFixed(1)}%
- penalty_percent_APPLIED=${appliedPenaltyPercent.toFixed(1)}% ${!overlapAdjustmentsEnabled ? '(overlap toggle OFF - not applied)' : ''}
- bonus_multiplier_APPLIED=${appliedBonusMultiplier.toFixed(3)} ${!overlapAdjustmentsEnabled ? '(overlap toggle OFF - not applied)' : ''}
${overlapAdjustmentsEnabled && (appliedPenaltyPercent !== calculatedRedundancy.penalty_percent || appliedBonusMultiplier !== calculatedRedundancy.bonus_multiplier) ? `- penalty_percent_computed=${calculatedRedundancy.penalty_percent.toFixed(1)}% (for reference)` : ''}
${overlapAdjustmentsEnabled && (appliedPenaltyPercent !== calculatedRedundancy.penalty_percent || appliedBonusMultiplier !== calculatedRedundancy.bonus_multiplier) ? `- bonus_multiplier_computed=${calculatedRedundancy.bonus_multiplier.toFixed(3)} (for reference)` : ''}
- similarity=${(calculatedRedundancy.similarity_score * 100).toFixed(1)}%
- closest="${calculatedRedundancy.closest_vectors[0]?.title || 'N/A'}"
${calculatedRedundancy.overlap_percentile !== undefined ? `- overlap_percentile=${calculatedRedundancy.overlap_percentile}th percentile` : ''}
${calculatedRedundancy.nearest_10_neighbors ? `- nearest_10_neighbors: μ=${calculatedRedundancy.nearest_10_neighbors.mean.toFixed(3)} ± ${calculatedRedundancy.nearest_10_neighbors.std_dev.toFixed(3)} (min=${calculatedRedundancy.nearest_10_neighbors.min.toFixed(3)}, max=${calculatedRedundancy.nearest_10_neighbors.max.toFixed(3)})` : ''}
- computation_context=${calculatedRedundancy.computation_context || 'per-sandbox'}
- overlap_adjustments_enabled=${overlapAdjustmentsEnabled}`
    : '';
  
  // Generate scoring config ID (versioned)
  // TODO: This should come from a config management system in production
  const SCORE_CONFIG_VERSION = 'v2.0.13';
  const scoreConfigId = `score_config=${SCORE_CONFIG_VERSION}(overlap_penalty_start=30%, sweet_spot_center=14.2%±5%, weights:N=1.0/D=1.0/C=1.0/A=1.0)`;
  
  // Generate sandbox ID (use actual sandbox ID if provided, otherwise default)
  const sandboxId = sandboxContext 
    ? `sandbox_id=${sandboxContext.id}` 
    : 'sandbox_id=pru-default'; // Default sandbox for main Syntheverse
  
  // TSRC: Compute content hash for determinism
  const contentHash = crypto.createHash('sha256').update(textContent).digest('hex');
  
  // TSRC: Hash system prompt for version tracking
  const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex');
  
  // TSRC: Create IsotropicOperator record (O_kiss)
  const isotropicOperator = createIsotropicOperator(
    'embedding_cosine',
    '1.0',
    {
      name: 'text-embedding-3-small',
      version: '1.0',
      provider: 'openai',
    },
    'cosine'
  );
  
  // TSRC: Build determinism contract
  const determinismContract: DeterminismContract = {
    content_hash: contentHash,
    score_config_id: SCORE_CONFIG_VERSION,
    sandbox_id: sandboxContext?.id || null,
    snapshot_id: archiveSnapshot.snapshot_id,
    mode_state: 'growth', // TODO: Get from stability monitoring system
    llm_params: {
      model: 'llama-3.3-70b-versatile',
      model_version: '3.3',
      provider: 'groq',
      temperature: 0, // Enforced for determinism
      prompt_hash: promptHash,
    },
    operators: {
      isotropic: isotropicOperator,
    },
    evaluated_at: new Date().toISOString(),
  };

  debug('TSRC:Determinism', 'Created determinism contract', {
    content_hash: contentHash.substring(0, 16) + '...',
    snapshot_id: archiveSnapshot.snapshot_id,
    prompt_hash: promptHash.substring(0, 16) + '...',
    operator: isotropicOperator.operator_name,
  });

  // Archive version/snapshot ID (TSRC: Now using content-addressed snapshot)
  const archiveVersion = `archive_version=${archiveSnapshot.snapshot_id}`;

  // Format tokenomics context (condensed)
  const tokenomicsContext = tokenomicsInfo
    ? `**Tokenomics:** Epoch=${tokenomicsInfo.current_epoch}, Founder=${tokenomicsInfo.epoch_balances.founder?.toLocaleString() || 0} SYNTH. Thresholds: Founder≥8000, Pioneer≥6000, Community≥5000, Ecosystem≥4000.`
    : '';

  // Evaluation query with contribution details + minimal extra instructions.
  // IMPORTANT: We want a detailed narrative review AND parseable JSON (embedded).
  // SCALABILITY FIX: Using vectors-only approach - removed archivedPoCsContext to prevent prompt bloat
  
  // Seed detection instruction (content-based, not timing-based)
  const seedDetectionNote = emptyArchive
    ? '\n**Seed Detection:** Archive is empty. Carefully analyze if this content exhibits SEED characteristics (irreducibility, generative capacity, foundational nature). Set "is_seed_submission" field accordingly.\n'
    : '\n**Seed Detection:** Archive has prior submissions. Still analyze if this exhibits SEED characteristics. Set "is_seed_submission" field accordingly.\n';

  const evaluationQuery = `Evaluate this Proof-of-Contribution (PoC) using the system prompt rules.

**Scoring Metadata (Deterministic Score Contract):**
${scoreConfigId}
${sandboxId}
${archiveVersion}
archive_status=${emptyArchive ? 'empty' : `${archivedVectors.length}_prior_submissions`}

Title: ${title}
Category: ${category || 'scientific'}
${tokenomicsContext ? `\n${tokenomicsContext}` : ''}
${seedDetectionNote}
Submission Content:
${truncatedText}

${calculatedRedundancyContext ? `\n${calculatedRedundancyContext}` : ''}

**Multiplier Toggle Configuration (CRITICAL - Must respect these in scoring):**
- seed_multiplier_enabled: ${seedMultiplierEnabled} ${!seedMultiplierEnabled ? '(DISABLED - Do NOT apply seed multiplier, use 1.0)' : '(enabled - may apply 1.15 if detected)'}
- edge_multiplier_enabled: ${edgeMultiplierEnabled} ${!edgeMultiplierEnabled ? '(DISABLED - Do NOT apply edge multiplier, use 1.0)' : '(enabled - may apply 1.15 if detected)'}
- overlap_adjustments_enabled: ${overlapAdjustmentsEnabled} ${!overlapAdjustmentsEnabled ? '(DISABLED - already reflected in APPLIED values above)' : '(enabled - already reflected in APPLIED values above)'}

Notes:
- Use the vector-based redundancy information above to determine overlap and redundancy penalties.
- Apply redundancy penalty ONLY to the composite/total score (as specified in the system prompt).
- CRITICAL: Respect the toggle configuration above. If a multiplier is DISABLED, use 1.0 in your JSON response, NOT the typical 1.15 value.
- You MUST include scoring_metadata, pod_composition, and archive_similarity_distribution in your JSON response.
- You MUST include "is_seed_submission" (boolean) and "seed_justification" (string) fields based on content analysis.
- You MUST include "is_edge_submission" (boolean) and "edge_justification" (string) fields based on content analysis.
- Output: Provide a detailed narrative review (clear + specific), AND include the REQUIRED JSON structure from the system prompt.
- The JSON may be placed in a markdown code block, but it MUST be valid parseable JSON.
`;

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Groq API

    // Groq on-demand tier enforces strict per-request token budgets (TPM). To avoid 413/TPM errors,
    // cap max_tokens and retry with smaller budgets if needed.
    // Increased initial budget to 2000 to allow complete JSON responses (Groq was hitting limit at 1200)
    const tokenBudgets = [2000, 1500, 1200, 800, 500];
    let response: Response | null = null;
    let lastErrorText: string | null = null;

    for (const maxTokens of tokenBudgets) {
      const attemptController = new AbortController();
      const attemptTimeoutId = setTimeout(() => attemptController.abort(), 30000);
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: evaluationQuery },
            ],
            temperature: 0.0, // Deterministic evaluation
            max_tokens: maxTokens,
          }),
          signal: attemptController.signal,
        });
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Groq API request timed out after 30 seconds');
        }
        throw fetchError;
      } finally {
        clearTimeout(attemptTimeoutId);
      }

      if (response.ok) break;

      // Read error body for decision making
      lastErrorText = await response.text().catch(() => null);
      const isTokenBudgetError =
        response.status === 413 ||
        (lastErrorText || '').includes('Request too large') ||
        (lastErrorText || '').includes('TPM') ||
        (lastErrorText || '').includes('rate_limit_exceeded');

      debug('EvaluateWithGroq', 'Groq request failed, evaluating retry', {
        status: response.status,
        maxTokens,
        willRetry: isTokenBudgetError && maxTokens !== tokenBudgets[tokenBudgets.length - 1],
      });

      if (!isTokenBudgetError) {
        throw new Error(`Groq API error (${response.status}): ${lastErrorText || ''}`);
      }
    }

    clearTimeout(timeoutId);
    if (!response) {
      throw new Error('Groq API error: no response');
    }

    if (!response.ok) {
      throw new Error(
        `Groq API error (${response.status}): ${lastErrorText || 'Request failed (token budget exceeded)'}`
      );
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || '';

    // Log FULL Groq API response for debugging (including metadata)
    const fullGroqResponse = {
      id: data.id,
      object: data.object,
      created: data.created,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
      system_fingerprint: data.system_fingerprint,
      raw_content: answer,
      content_length: answer.length,
      has_content: !!answer && answer.trim().length > 0,
    };

    debug('EvaluateWithGroq', 'Groq API response received', {
      responseLength: answer.length,
      preview: answer.substring(0, 500),
      fullResponse: answer, // Log full response for debugging
      hasAnswer: !!answer,
      answerType: typeof answer,
      fullGroqResponse: JSON.stringify(fullGroqResponse, null, 2), // Full API response structure
      groqApiResponseKeys: Object.keys(data),
      groqApiResponseStructure: {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        firstChoiceKeys: data.choices?.[0] ? Object.keys(data.choices[0]) : [],
        messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : [],
        usage: data.usage,
      },
    });

    // Ensure answer is stored - log if empty
    if (!answer || answer.trim().length === 0) {
      debugError('EvaluateWithGroq', 'WARNING: Groq API response is empty', {
        dataKeys: Object.keys(data),
        choicesLength: data.choices?.length || 0,
        firstChoice: data.choices?.[0],
        fullResponse: JSON.stringify(data, null, 2),
        fullGroqResponse: JSON.stringify(fullGroqResponse, null, 2),
      });
    }

    const cleanJsonCandidate = (s: string): string => {
      let out = (s || '').trim();
      // Common invalid JSON issues from LLMs:
      // - thousands separators in numbers: 2,400 -> 2400
      out = out.replace(/(\d),(?=\d{3}\b)/g, '$1');
      // - trailing commas before closing braces/brackets
      out = out.replace(/,\s*([}\]])/g, '$1');
      return out;
    };

    const tryParseJson = (candidate: string): any | null => {
      const cleaned = cleanJsonCandidate(candidate);
      try {
        const parsed = JSON.parse(cleaned);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    };

    const parseNarrativeToJson = (raw: string): any | null => {
      const text = (raw || '').trim();
      if (!text) return null;

      const normalizeNum = (v: string): number => {
        const cleaned = String(v || '')
          .replace(/,/g, '')
          .trim();
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
      };

      // Extract score from multiple formats:
      // 1. Table format: | Novelty | 2,400 |
      // 2. Bullet list: * Novelty: 2,400
      // 3. Line format: Novelty: 2,400
      const extractScore = (label: string): number => {
        // Try table format first
        const tableRe = new RegExp(`\\|\\s*${label}\\s*\\|\\s*([\\d,\\.]+)\\s*\\|`, 'i');
        const tableMatch = text.match(tableRe);
        if (tableMatch?.[1]) return normalizeNum(tableMatch[1]);

        // Try bullet list format: * Novelty: 2,400
        const bulletRe = new RegExp(`[\\*\\-]\\s*${label}\\s*[:]\\s*([\\d,\\.]+)`, 'i');
        const bulletMatch = text.match(bulletRe);
        if (bulletMatch?.[1]) return normalizeNum(bulletMatch[1]);

        // Try line format: Novelty: 2,400 (with optional parentheses)
        const lineRe = new RegExp(`${label}\\s*[:]\\s*([\\d,\\.]+)`, 'i');
        const lineMatch = text.match(lineRe);
        if (lineMatch?.[1]) return normalizeNum(lineMatch[1]);

        return 0;
      };

      const novelty = extractScore('Novelty');
      const density = extractScore('Density');
      const coherence = extractScore('Coherence');
      const alignment = extractScore('Alignment');

      // Also try to extract total score from text
      const totalMatch =
        text.match(/total\s+score[:\s]+([\d,\.]+)/i) || text.match(/score[:\s]+([\d,\.]+)\s*\(/i);
      const totalFromText = totalMatch ? normalizeNum(totalMatch[1]) : 0;
      const total = totalFromText > 0 ? totalFromText : novelty + density + coherence + alignment;

      // Classification (best-effort) - try multiple patterns
      let classification: string[] = [];
      const classificationMatch =
        text.match(/PoC\s*Classification:\s*([^\n\r]+)/i) ||
        text.match(/Classification:\s*([^\n\r]+)/i) ||
        text.match(/["']classification["']\s*:\s*\[([^\]]+)\]/i);

      if (classificationMatch?.[1]) {
        const classificationRaw = classificationMatch[1].trim();
        classification = classificationRaw
          .split(/[,\|\/\[\]"]/g)
          .map((s) => s.trim().replace(/"/g, ''))
          .filter(Boolean);
      }

      // Also try to extract from JSON if present (even if truncated)
      if (classification.length === 0) {
        const jsonClassMatch = text.match(/"classification"\s*:\s*\["([^"]+)"\]/i);
        if (jsonClassMatch?.[1]) {
          classification = [jsonClassMatch[1]];
        }
      }

      // Metal alignment (best-effort) - try multiple patterns
      let metal = '';
      const metalMatch =
        text.match(/Metal\s*Alignment:\s*([A-Za-z]+)/i) ||
        text.match(/["']metal_alignment["']\s*:\s*"([^"]+)"/i) ||
        text.match(/Primary:\s*(Gold|Silver|Copper|Hybrid)/i) ||
        text.match(/metals["']\s*:\s*\["([^"]+)"/i);

      if (metalMatch?.[1]) {
        metal = metalMatch[1].trim();
      }

      const metalAlignment = metal || 'Copper';
      const metals = metal ? [metal] : [metalAlignment];

      const qualified_founder = total >= 8000;

      // Use the narrative itself as a readable analysis fallback so the dashboard still has detail.
      const redundancy_analysis = text;

      return {
        classification,
        scoring: {
          novelty: {
            base_score: novelty,
            redundancy_penalty_percent: 0,
            final_score: novelty,
            justification: '',
          },
          density: {
            base_score: density,
            redundancy_penalty_percent: 0,
            final_score: density,
            score: density,
            justification: '',
          },
          coherence: {
            score: coherence,
            final_score: coherence,
            justification: '',
          },
          alignment: {
            score: alignment,
            final_score: alignment,
            justification: '',
          },
        },
        total_score: total,
        pod_score: total,
        qualified_founder,
        metal_alignment: metalAlignment,
        metals: metals,
        metal_justification: '',
        redundancy_analysis,
        founder_certificate: '',
        homebase_intro: '',
        tokenomics_recommendation: {
          eligible_epochs: [],
          suggested_allocation: 0,
          tier_multiplier: 1,
          epoch_distribution: {},
          allocation_notes: 'Token allocation requires human admin approval',
          requires_admin_approval: true,
        },
        // keep any extra fields used by downstream logic if present
        _parsed_from: 'narrative_table',
      };
    };

    const extractJsonCandidates = (raw: string): string[] => {
      const a = raw || '';
      const candidates: string[] = [];
      candidates.push(a.trim());

      const jsonBlockMatch = a.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch?.[1]) candidates.push(jsonBlockMatch[1].trim());

      const codeBlockMatch = a.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch?.[1]) candidates.push(codeBlockMatch[1].trim());

      const startMarker = a.indexOf('{');
      const endMarker = a.lastIndexOf('}');
      if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
        candidates.push(a.substring(startMarker, endMarker + 1));
      }

      const firstObjectMatch = a.match(/\{[\s\S]*\}/);
      if (firstObjectMatch?.[0]) candidates.push(firstObjectMatch[0]);

      // De-dupe while preserving order
      const seen = new Set<string>();
      return candidates.filter((c) => {
        const key = c.trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Primary parse attempt (tolerant).
    let evaluation: any = null;
    const candidates = extractJsonCandidates(answer);
    for (let i = 0; i < candidates.length; i++) {
      const parsed = tryParseJson(candidates[i]);
      if (parsed) {
        evaluation = parsed;
        debug('EvaluateWithGroq', 'JSON parsed successfully from Groq response', {
          strategy: `candidate_${i + 1}/${candidates.length}`,
          hasScoring: !!evaluation.scoring,
          hasDensity: !!evaluation.density,
          hasScoringDensity: !!evaluation.scoring?.density,
          evaluationKeys: Object.keys(evaluation),
          evaluationString: JSON.stringify(evaluation, null, 2).substring(0, 2000),
        });
        break;
      }
    }

    // If no JSON was produced, do a single "repair" call to convert the narrative output into strict JSON.
    if (!evaluation) {
      debug('EvaluateWithGroq', 'No parseable JSON found. Attempting one-shot JSON repair call.', {
        responseLength: answer.length,
        preview: answer.substring(0, 400),
      });

      const repairSystemPrompt =
        'You are a strict JSON extraction and normalization engine. Output ONLY valid JSON. No markdown. No prose. No tables.';
      const repairUserPrompt = `Convert the following evaluation text into a single JSON object with EXACTLY these top-level keys:
classification, scoring, total_score, pod_score, qualified_founder, metal_alignment, metals, metal_justification, redundancy_analysis, founder_certificate, homebase_intro, tokenomics_recommendation.

Rules:
- All numeric values MUST be numbers (no commas like 2,400; use 2400).
- scoring must contain novelty, density, coherence, alignment.
- density must contain base_score, redundancy_penalty_percent, final_score, score, justification.
- tokenomics_recommendation must contain eligible_epochs, suggested_allocation, tier_multiplier, epoch_distribution, allocation_notes, requires_admin_approval.
- If a field is missing in the text, infer it conservatively (use 0, empty string, empty array, or {} as appropriate).

Text to convert:
${answer}`;

      const repairBudgets = [800, 500];
      let repairedJsonText = '';
      let repairLastError: string | null = null;
      for (const maxTokens of repairBudgets) {
        try {
          const repairResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: repairSystemPrompt },
                { role: 'user', content: repairUserPrompt },
              ],
              temperature: 0.0,
              max_tokens: maxTokens,
            }),
          });
          const repairText = repairResp.ok
            ? await repairResp.text()
            : await repairResp.text().catch(() => '');
          if (!repairResp.ok) {
            repairLastError = `Repair call failed (${repairResp.status}): ${repairText}`;
            continue;
          }
          const repairData = JSON.parse(repairText);
          repairedJsonText = repairData.choices?.[0]?.message?.content || '';
          if (repairedJsonText.trim().length === 0) {
            repairLastError = `Repair call returned empty content (max_tokens=${maxTokens})`;
            continue;
          }
          break;
        } catch (e) {
          repairLastError = e instanceof Error ? e.message : String(e);
          continue;
        }
      }

      if (repairedJsonText.trim().length > 0) {
        const repairCandidates = extractJsonCandidates(repairedJsonText);
        for (let i = 0; i < repairCandidates.length; i++) {
          const parsed = tryParseJson(repairCandidates[i]);
          if (parsed) {
            evaluation = parsed;
            debug('EvaluateWithGroq', 'JSON repair succeeded', {
              repairedLength: repairedJsonText.length,
              hasScoring: !!evaluation.scoring,
            });
            break;
          }
        }
      }

      if (!evaluation) {
        debugError('EvaluateWithGroq', 'JSON repair failed', {
          repairLastError,
          responseLength: answer.length,
          responsePreview: answer.substring(0, 1000),
          responseEnd: answer.substring(Math.max(0, answer.length - 500)),
        });
        // FINAL fallback: parse common narrative/table formats into the required JSON shape locally
        const narrativeParsed = parseNarrativeToJson(answer);
        if (narrativeParsed) {
          evaluation = narrativeParsed;
          debug('EvaluateWithGroq', 'Parsed Groq narrative/table output into JSON locally', {
            responseLength: answer.length,
            total_score: evaluation.total_score,
            qualified_founder: evaluation.qualified_founder,
            metal_alignment: evaluation.metal_alignment,
          });
        } else {
          throw new Error(
            `Failed to parse Groq response as JSON after tolerant parsing + repair. Response length: ${answer.length} chars. Preview: ${answer.substring(0, 200)}...`
          );
        }
      }
    }

    // Debug: Log the full evaluation structure to understand Groq's response format
    debug('EvaluateWithGroq', 'Raw evaluation structure', {
      hasScoring: !!evaluation.scoring,
      hasDensity: !!evaluation.density,
      evaluationKeys: Object.keys(evaluation),
      evaluationString: JSON.stringify(evaluation, null, 2), // FULL evaluation structure for debugging
      evaluationStructure: {
        topLevelKeys: Object.keys(evaluation),
        hasScoring: !!evaluation.scoring,
        scoringKeys: evaluation.scoring ? Object.keys(evaluation.scoring) : [],
        scoringStructure: evaluation.scoring ? JSON.stringify(evaluation.scoring, null, 2) : null,
        hasNovelty: 'novelty' in evaluation,
        hasDensity: 'density' in evaluation,
        hasCoherence: 'coherence' in evaluation,
        hasAlignment: 'alignment' in evaluation,
        noveltyType: typeof evaluation.novelty,
        densityType: typeof evaluation.density,
        coherenceType: typeof evaluation.coherence,
        alignmentType: typeof evaluation.alignment,
        noveltyValue: evaluation.novelty,
        densityValue: evaluation.density,
        coherenceValue: evaluation.coherence,
        alignmentValue: evaluation.alignment,
      },
    });

    // Extract scoring from new format - try multiple structures
    // IMPORTANT: Handle both object and number formats
    const scoring = evaluation.scoring || {};

    // Get raw values - could be objects or numbers
    const noveltyRaw = scoring.novelty ?? evaluation.novelty;
    const densityRaw = scoring.density ?? evaluation.density;
    const coherenceRaw = scoring.coherence ?? evaluation.coherence;
    const alignmentRaw = scoring.alignment ?? evaluation.alignment;

    // Extract base scores with extensive fallback options
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let baseNoveltyScore = 0;
    let noveltyExtractionPath = 'none';

    if (typeof noveltyRaw === 'number' && noveltyRaw > 0) {
      baseNoveltyScore = noveltyRaw;
      noveltyExtractionPath = 'noveltyRaw (number)';
    } else if (typeof noveltyRaw === 'object' && noveltyRaw !== null) {
      baseNoveltyScore = noveltyRaw.base_score ?? noveltyRaw.final_score ?? noveltyRaw.score ?? 0;
      noveltyExtractionPath = 'noveltyRaw (object)';
    } else if (typeof evaluation.novelty === 'number' && evaluation.novelty > 0) {
      baseNoveltyScore = evaluation.novelty;
      noveltyExtractionPath = 'evaluation.novelty (number)';
    } else if (typeof evaluation.scoring?.novelty === 'number' && evaluation.scoring.novelty > 0) {
      baseNoveltyScore = evaluation.scoring.novelty;
      noveltyExtractionPath = 'evaluation.scoring.novelty (number)';
    } else if (typeof evaluation.scoring?.novelty === 'object') {
      baseNoveltyScore =
        evaluation.scoring.novelty.base_score ??
        evaluation.scoring.novelty.final_score ??
        evaluation.scoring.novelty.score ??
        0;
      noveltyExtractionPath = 'evaluation.scoring.novelty (object)';
    } else if (typeof evaluation.novelty === 'string') {
      const parsed = parseFloat(evaluation.novelty);
      if (!isNaN(parsed) && parsed > 0) {
        baseNoveltyScore = parsed;
        noveltyExtractionPath = 'evaluation.novelty (string parsed)';
      }
    } else if (evaluation.scores?.novelty) {
      baseNoveltyScore =
        typeof evaluation.scores.novelty === 'number' ? evaluation.scores.novelty : 0;
      noveltyExtractionPath = 'evaluation.scores.novelty';
    } else if (evaluation.evaluation?.novelty) {
      baseNoveltyScore =
        typeof evaluation.evaluation.novelty === 'number' ? evaluation.evaluation.novelty : 0;
      noveltyExtractionPath = 'evaluation.evaluation.novelty';
    }

    let baseDensityScore = 0;
    let densityExtractionPath = 'none';

    if (typeof densityRaw === 'number' && densityRaw > 0) {
      baseDensityScore = densityRaw;
      densityExtractionPath = 'densityRaw (number)';
    } else if (typeof densityRaw === 'object' && densityRaw !== null) {
      baseDensityScore = densityRaw.base_score ?? densityRaw.final_score ?? densityRaw.score ?? 0;
      densityExtractionPath = 'densityRaw (object)';
    } else if (typeof evaluation.density === 'number' && evaluation.density > 0) {
      baseDensityScore = evaluation.density;
      densityExtractionPath = 'evaluation.density (number)';
    } else if (typeof evaluation.scoring?.density === 'number' && evaluation.scoring.density > 0) {
      baseDensityScore = evaluation.scoring.density;
      densityExtractionPath = 'evaluation.scoring.density (number)';
    } else if (typeof evaluation.scoring?.density === 'object') {
      baseDensityScore =
        evaluation.scoring.density.base_score ??
        evaluation.scoring.density.final_score ??
        evaluation.scoring.density.score ??
        0;
      densityExtractionPath = 'evaluation.scoring.density (object)';
    } else if (typeof evaluation.density === 'string') {
      const parsed = parseFloat(evaluation.density);
      if (!isNaN(parsed) && parsed > 0) {
        baseDensityScore = parsed;
        densityExtractionPath = 'evaluation.density (string parsed)';
      }
    } else if (evaluation.scores?.density) {
      baseDensityScore =
        typeof evaluation.scores.density === 'number' ? evaluation.scores.density : 0;
      densityExtractionPath = 'evaluation.scores.density';
    } else if (evaluation.evaluation?.density) {
      baseDensityScore =
        typeof evaluation.evaluation.density === 'number' ? evaluation.evaluation.density : 0;
      densityExtractionPath = 'evaluation.evaluation.density';
    }

    // Extract coherence score with extensive fallback (same as density)
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalCoherenceScore = 0;
    let coherenceExtractionPath = 'none';

    if (typeof coherenceRaw === 'number' && coherenceRaw > 0) {
      finalCoherenceScore = coherenceRaw;
      coherenceExtractionPath = 'coherenceRaw (number)';
    } else if (typeof coherenceRaw === 'object' && coherenceRaw !== null) {
      finalCoherenceScore =
        coherenceRaw.score ?? coherenceRaw.final_score ?? coherenceRaw.base_score ?? 0;
      coherenceExtractionPath = 'coherenceRaw (object)';
    } else if (typeof evaluation.coherence === 'number' && evaluation.coherence > 0) {
      finalCoherenceScore = evaluation.coherence;
      coherenceExtractionPath = 'evaluation.coherence (number)';
    } else if (
      typeof evaluation.scoring?.coherence === 'number' &&
      evaluation.scoring.coherence > 0
    ) {
      finalCoherenceScore = evaluation.scoring.coherence;
      coherenceExtractionPath = 'evaluation.scoring.coherence (number)';
    } else if (typeof evaluation.scoring?.coherence === 'object') {
      finalCoherenceScore =
        evaluation.scoring.coherence.score ??
        evaluation.scoring.coherence.final_score ??
        evaluation.scoring.coherence.base_score ??
        0;
      coherenceExtractionPath = 'evaluation.scoring.coherence (object)';
    } else if (evaluation.scoring?.coherence?.score) {
      finalCoherenceScore = evaluation.scoring.coherence.score;
      coherenceExtractionPath = 'evaluation.scoring.coherence.score';
    } else if (evaluation.scoring?.coherence?.final_score) {
      finalCoherenceScore = evaluation.scoring.coherence.final_score;
      coherenceExtractionPath = 'evaluation.scoring.coherence.final_score';
    } else if (evaluation.scoring?.coherence?.value) {
      finalCoherenceScore = evaluation.scoring.coherence.value;
      coherenceExtractionPath = 'evaluation.scoring.coherence.value';
    } else if (evaluation.coherence_score) {
      finalCoherenceScore =
        typeof evaluation.coherence_score === 'number' ? evaluation.coherence_score : 0;
      coherenceExtractionPath = 'evaluation.coherence_score';
    } else if (evaluation.scores?.coherence) {
      finalCoherenceScore =
        typeof evaluation.scores.coherence === 'number' ? evaluation.scores.coherence : 0;
      coherenceExtractionPath = 'evaluation.scores.coherence';
    } else if (typeof evaluation.coherence === 'string') {
      const parsed = parseFloat(evaluation.coherence);
      if (!isNaN(parsed) && parsed > 0) {
        finalCoherenceScore = parsed;
        coherenceExtractionPath = 'evaluation.coherence (string parsed)';
      }
    } else if (evaluation.evaluation?.coherence) {
      finalCoherenceScore =
        typeof evaluation.evaluation.coherence === 'number' ? evaluation.evaluation.coherence : 0;
      coherenceExtractionPath = 'evaluation.evaluation.coherence';
    } else if (evaluation.evaluation?.scoring?.coherence?.score) {
      finalCoherenceScore = evaluation.evaluation.scoring.coherence.score;
      coherenceExtractionPath = 'evaluation.evaluation.scoring.coherence.score';
    } else if (evaluation.evaluation?.scoring?.coherence?.final_score) {
      finalCoherenceScore = evaluation.evaluation.scoring.coherence.final_score;
      coherenceExtractionPath = 'evaluation.evaluation.scoring.coherence.final_score';
    }

    let coherenceScore = finalCoherenceScore;

    debug('EvaluateWithGroq', 'Score extraction paths (novelty/density)', {
      novelty: { score: baseNoveltyScore, path: noveltyExtractionPath },
      density: { score: baseDensityScore, path: densityExtractionPath },
      coherence: { score: coherenceScore, path: coherenceExtractionPath },
    });

    // Extract alignment score with extensive fallback (same as density)
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalAlignmentScore = 0;
    let alignmentExtractionPath = 'none';

    if (typeof alignmentRaw === 'number' && alignmentRaw > 0) {
      finalAlignmentScore = alignmentRaw;
      alignmentExtractionPath = 'alignmentRaw (number)';
    } else if (typeof alignmentRaw === 'object' && alignmentRaw !== null) {
      finalAlignmentScore =
        alignmentRaw.score ?? alignmentRaw.final_score ?? alignmentRaw.base_score ?? 0;
      alignmentExtractionPath = 'alignmentRaw (object)';
    } else if (typeof evaluation.alignment === 'number' && evaluation.alignment > 0) {
      finalAlignmentScore = evaluation.alignment;
      alignmentExtractionPath = 'evaluation.alignment (number)';
    } else if (
      typeof evaluation.scoring?.alignment === 'number' &&
      evaluation.scoring.alignment > 0
    ) {
      finalAlignmentScore = evaluation.scoring.alignment;
      alignmentExtractionPath = 'evaluation.scoring.alignment (number)';
    } else if (typeof evaluation.scoring?.alignment === 'object') {
      finalAlignmentScore =
        evaluation.scoring.alignment.score ??
        evaluation.scoring.alignment.final_score ??
        evaluation.scoring.alignment.base_score ??
        0;
      alignmentExtractionPath = 'evaluation.scoring.alignment (object)';
    } else if (evaluation.scoring?.alignment?.score) {
      finalAlignmentScore = evaluation.scoring.alignment.score;
      alignmentExtractionPath = 'evaluation.scoring.alignment.score';
    } else if (evaluation.scoring?.alignment?.final_score) {
      finalAlignmentScore = evaluation.scoring.alignment.final_score;
      alignmentExtractionPath = 'evaluation.scoring.alignment.final_score';
    } else if (evaluation.scoring?.alignment?.value) {
      finalAlignmentScore = evaluation.scoring.alignment.value;
      alignmentExtractionPath = 'evaluation.scoring.alignment.value';
    } else if (evaluation.alignment_score) {
      finalAlignmentScore =
        typeof evaluation.alignment_score === 'number' ? evaluation.alignment_score : 0;
      alignmentExtractionPath = 'evaluation.alignment_score';
    } else if (evaluation.scores?.alignment) {
      finalAlignmentScore =
        typeof evaluation.scores.alignment === 'number' ? evaluation.scores.alignment : 0;
      alignmentExtractionPath = 'evaluation.scores.alignment';
    } else if (typeof evaluation.alignment === 'string') {
      const parsed = parseFloat(evaluation.alignment);
      if (!isNaN(parsed) && parsed > 0) {
        finalAlignmentScore = parsed;
        alignmentExtractionPath = 'evaluation.alignment (string parsed)';
      }
    } else if (evaluation.evaluation?.alignment) {
      finalAlignmentScore =
        typeof evaluation.evaluation.alignment === 'number' ? evaluation.evaluation.alignment : 0;
      alignmentExtractionPath = 'evaluation.evaluation.alignment';
    } else if (evaluation.evaluation?.scoring?.alignment?.score) {
      finalAlignmentScore = evaluation.evaluation.scoring.alignment.score;
      alignmentExtractionPath = 'evaluation.evaluation.scoring.alignment.score';
    } else if (evaluation.evaluation?.scoring?.alignment?.final_score) {
      finalAlignmentScore = evaluation.evaluation.scoring.alignment.final_score;
      alignmentExtractionPath = 'evaluation.evaluation.scoring.alignment.final_score';
    }

    // If still 0, try nested structures
    if (finalAlignmentScore === 0) {
      if (evaluation.evaluation?.alignment) {
        finalAlignmentScore =
          typeof evaluation.evaluation.alignment === 'number' ? evaluation.evaluation.alignment : 0;
      } else if (evaluation.evaluation?.scoring?.alignment?.score) {
        finalAlignmentScore = evaluation.evaluation.scoring.alignment.score;
      } else if (evaluation.evaluation?.scoring?.alignment?.final_score) {
        finalAlignmentScore = evaluation.evaluation.scoring.alignment.final_score;
      }
    }

    let alignmentScore = finalAlignmentScore;

    // Debug logging for score extraction - comprehensive with extraction paths
    debug('EvaluateWithGroq', 'Score extraction paths - all scores', {
      novelty: { score: baseNoveltyScore, path: noveltyExtractionPath },
      density: { score: baseDensityScore, path: densityExtractionPath },
      coherence: { score: coherenceScore, path: coherenceExtractionPath },
      alignment: { score: alignmentScore, path: alignmentExtractionPath },
    });

    // Debug logging for score extraction - comprehensive
    debug('EvaluateWithGroq', 'Score extraction - initial values', {
      baseNoveltyScore,
      baseDensityScore,
      coherenceScore,
      alignmentScore,
      evaluationKeys: Object.keys(evaluation),
      scoringKeys: evaluation.scoring ? Object.keys(evaluation.scoring) : [],
      noveltyRawType: typeof noveltyRaw,
      densityRawType: typeof densityRaw,
      coherenceRawType: typeof coherenceRaw,
      alignmentRawType: typeof alignmentRaw,
      noveltyRaw: noveltyRaw,
      densityRaw: densityRaw,
      coherenceRaw: coherenceRaw,
      alignmentRaw: alignmentRaw,
      evaluationDensity: evaluation.density,
      evaluationNovelty: evaluation.novelty,
      evaluationCoherence: evaluation.coherence,
      evaluationAlignment: evaluation.alignment,
      scoringDensity: evaluation.scoring?.density,
      scoringNovelty: evaluation.scoring?.novelty,
      scoringCoherence: evaluation.scoring?.coherence,
      scoringAlignment: evaluation.scoring?.alignment,
    });

    // If some scores are 0 but not all, log warning
    if (
      baseNoveltyScore > 0 &&
      (baseDensityScore === 0 || coherenceScore === 0 || alignmentScore === 0)
    ) {
      debugError('EvaluateWithGroq', 'WARNING: Some scores extracted as 0', {
        baseNoveltyScore,
        baseDensityScore,
        coherenceScore,
        alignmentScore,
        evaluationStructure: JSON.stringify(evaluation, null, 2).substring(0, 3000),
        rawAnswer: answer.substring(0, 2000),
        noveltyRaw,
        densityRaw,
        coherenceRaw,
        alignmentRaw,
      });
    }

    // If all scores are 0, log warning and try alternative extraction
    if (
      baseNoveltyScore === 0 &&
      baseDensityScore === 0 &&
      coherenceScore === 0 &&
      alignmentScore === 0
    ) {
      debugError('EvaluateWithGroq', 'WARNING: All scores extracted as 0', {
        evaluationStructure: JSON.stringify(evaluation, null, 2).substring(0, 3000),
        rawAnswer: answer.substring(0, 2000),
      });
    }

    // Extract penalty and bonus separately (G-H-I: Fix formula violation and add score trace)
    // Use calculated vector-based redundancy if available, otherwise extract from Groq's response
    const penaltyPercent = calculatedRedundancy
      ? calculatedRedundancy.penalty_percent
      : Math.max(0, Math.min(100, Number(evaluation.redundancy_penalty_percent ?? 0)));
    
    const bonusMultiplier = calculatedRedundancy
      ? calculatedRedundancy.bonus_multiplier
      : Math.max(1.0, Math.min(2.0, Number(evaluation.redundancy_bonus_multiplier ?? 1.0)));
    
    // Legacy: keep redundancyOverlapPercent for backward compatibility in metadata
    // But DO NOT use it for score calculation - use penaltyPercent and bonusMultiplier directly
    let redundancyOverlapPercent = calculatedRedundancy
      ? calculatedRedundancy.overlap_percent
      : Math.max(0, Math.min(100, Number(evaluation.redundancy_overlap_percent ?? 0)));
    
    // MAREK/SIMBA FIX: Prevent negative overlap (impossible value, indicates bug)
    // Also prevent overlap > 100% (also impossible)
    if (redundancyOverlapPercent < 0) {
      debugError('EvaluateWithGroq', '[SCORER BUG] redundancy_overlap_percent is negative - clamping to 0', {
        redundancyOverlapPercent,
        calculatedRedundancy,
        evaluation_redundancy_overlap_percent: evaluation.redundancy_overlap_percent,
      });
      redundancyOverlapPercent = 0; // Clamp to 0
    } else if (redundancyOverlapPercent > 100) {
      debugError('EvaluateWithGroq', '[SCORER BUG] redundancy_overlap_percent exceeds 100% - clamping to 100', {
        redundancyOverlapPercent,
        calculatedRedundancy,
        evaluation_redundancy_overlap_percent: evaluation.redundancy_overlap_percent,
      });
      redundancyOverlapPercent = 100; // Clamp to 100
    }

    // Use final_score if provided, otherwise use base score
    // Individual category scores are NOT penalized - penalty is applied to total composite score
    // Handle both object and number formats for novelty
    let finalNoveltyScore =
      (typeof noveltyRaw === 'object' && noveltyRaw !== null
        ? (noveltyRaw.final_score ?? noveltyRaw.score ?? noveltyRaw.base_score)
        : null) ?? baseNoveltyScore;

    // For density, try multiple fallback paths since Groq may return it in different formats
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalDensityScore =
      (typeof densityRaw === 'number' ? densityRaw : 0) ||
      (typeof densityRaw === 'object' && densityRaw !== null
        ? (densityRaw.final_score ?? densityRaw.score ?? densityRaw.base_score ?? 0)
        : 0) ||
      0;

    // If still 0, try more locations
    if (finalDensityScore === 0) {
      // Try all possible locations for density score in the evaluation response
      finalDensityScore =
        evaluation.density ??
        evaluation.scoring?.density?.score ??
        evaluation.scoring?.density?.final_score ??
        evaluation.scoring?.density?.base_score ??
        evaluation.scoring?.density?.value ??
        evaluation.density_score ??
        evaluation.scores?.density ??
        0;
    }

    // If still 0, try parsing as number from string
    if (finalDensityScore === 0 && typeof evaluation.density === 'string') {
      const parsed = parseFloat(evaluation.density);
      if (!isNaN(parsed)) {
        finalDensityScore = parsed;
      }
    }

    // If still 0, use base score (individual scores are NOT penalized)
    if (finalDensityScore === 0) {
      finalDensityScore = baseDensityScore;
    }

    // If still 0, try to extract from nested structures
    if (finalDensityScore === 0) {
      // Check if density is in a nested evaluation object
      if (evaluation.evaluation?.density) {
        finalDensityScore =
          typeof evaluation.evaluation.density === 'number' ? evaluation.evaluation.density : 0;
      } else if (evaluation.evaluation?.scoring?.density?.score) {
        finalDensityScore = evaluation.evaluation.scoring.density.score;
      } else if (evaluation.evaluation?.scoring?.density?.final_score) {
        finalDensityScore = evaluation.evaluation.scoring.density.final_score;
      }
    }

    // Use the best available density score (prefer finalDensityScore, fallback to baseDensityScore if final is 0)
    let densityFinal = finalDensityScore > 0 ? finalDensityScore : baseDensityScore;

    // Final debug log to see what we extracted
    debug('EvaluateWithGroq', 'Density extraction result', {
      finalDensityScore,
      baseDensityScore,
      densityFinal,
      densityRaw: densityRaw,
      densityRawType: typeof densityRaw,
      evaluationDensity: evaluation.density,
    });

    // =============================================================================
    // THALET PROTOCOL: ATOMIC SCORING (Single Source of Truth)
    // =============================================================================
    // ALL scoring computation happens in AtomicScorer.computeScore()
    // This section ONLY calls the atomic scorer (config already loaded early)
    // NO calculation, normalization, or interpretation permitted here
    
    // 🔥 NOTE: Toggle config already loaded early (before AI prompt) to ensure
    // AI receives APPLIED values, not COMPUTED values. Variables are already
    // in scope: seedMultiplierEnabled, edgeMultiplierEnabled, overlapAdjustmentsEnabled
    
    const isSeedFromAI = evaluation.is_seed_submission === true;
    const isEdgeFromAI = evaluation.is_edge_submission === true;

    // =============================================================================
    // CALL ATOMIC SCORER (ONLY place where scoring happens)
    // =============================================================================
    
    // 🔥 DEBUG: Log toggle states being passed to AtomicScorer
    debug('AtomicScorerCall', 'Calling AtomicScorer with toggles', {
      toggles: {
        overlap_on: overlapAdjustmentsEnabled,
        seed_on: seedMultiplierEnabled,
        edge_on: edgeMultiplierEnabled,
      },
      detection: {
        is_seed_from_ai: isSeedFromAI,
        is_edge_from_ai: isEdgeFromAI,
      },
      scores: {
        novelty: finalNoveltyScore,
        density: densityFinal,
        coherence: coherenceScore,
        alignment: alignmentScore,
      },
    });
    
    // NSPFRP: Extract BridgeSpec from submission data (if provided)
    const extractedBridgeSpec = extractBridgeSpec({ bridge_spec: bridgeSpec });
    
    // Call AtomicScorer with BridgeSpec (if provided)
    const atomicScore = AtomicScorer.getInstance().computeScore({
      novelty: finalNoveltyScore,
      density: densityFinal,
      coherence: coherenceScore,
      alignment: alignmentScore,
      overlap_percent: redundancyOverlapPercent,
      is_seed: isSeedFromAI,
      is_edge: isEdgeFromAI,
      toggles: {
        overlap_on: overlapAdjustmentsEnabled,
        seed_on: seedMultiplierEnabled,
        edge_on: edgeMultiplierEnabled,
        metal_policy_on: true,
      },
      bridgeSpec: extractedBridgeSpec, // Pass BridgeSpec for TO/Testability integration
      // Let AtomicScorer generate seed (deterministic)
    });

    // Extract values from atomic score for backward compatibility
    const pod_score = atomicScore.final;
    const compositeScore = atomicScore.trace.composite;
    const effectivePenaltyPercent = atomicScore.trace.penalty_percent;
    const effectiveBonusMultiplier = atomicScore.trace.bonus_multiplier;
    const seedMultiplier = atomicScore.trace.seed_multiplier;
    const edgeMultiplier = atomicScore.trace.edge_multiplier;
    const combinedMultiplier = seedMultiplier * edgeMultiplier;
    const afterPenalty = atomicScore.trace.intermediate_steps.after_penalty;
    const afterBonus = atomicScore.trace.intermediate_steps.after_bonus;
    const afterSeedAndEdge = atomicScore.trace.intermediate_steps.after_seed;
    const final_preclamp = atomicScore.trace.intermediate_steps.raw_final;
    const wasClamped = atomicScore.trace.intermediate_steps.clamped_final !== atomicScore.trace.intermediate_steps.raw_final;

    debug('EvaluateWithGroq', 'AtomicScorer result', {
      final: pod_score,
      composite: compositeScore,
      integrity_hash: atomicScore.integrity_hash.substring(0, 12),
      execution_context: atomicScore.execution_context,
    });

    // H) Score trace for transparency (THALET + Marek/Simba enhanced specification)
    const scoreTrace = {
      // === THALET Protocol Fields ===
      thalet_compliant: true,
      atomic_score_hash: atomicScore.integrity_hash,
      execution_context: atomicScore.execution_context,
      
      // === IDs (Versioning + Traceability) - Marek/Simba P0 ===
      score_config_id: scoreConfigVersion,
      sandbox_id: sandboxContext?.id || 'main',
      archive_snapshot_id: `snapshot_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      
      // === Operator Declaration - Marek/Simba P0 (must be explicit) ===
      overlap_operator: overlapOperator,
      
      // === Mode Toggles State - Marek/Simba requirement ===
      // NOTE: These are duplicated from execution_context for backward compatibility
      toggles: {
        overlap_on: overlapAdjustmentsEnabled,
        seed_on: seedMultiplierEnabled,
        edge_on: edgeMultiplierEnabled,
        metal_policy_on: true,
      },
      
      // === Sweet Spot Parameters (HHF Bridge - tunable) ===
      sweet_spot_params: {
        center: sweetSpotCenter,
        tolerance: sweetSpotTolerance,
        penalty_threshold: penaltyThreshold,
      },
      // Dimension scores (inputs to formula)
      dimension_scores: {
        novelty: finalNoveltyScore,
        density: densityFinal,
        coherence: coherenceScore,
        alignment: alignmentScore,
      },
      // Composite (sum of dimensions) - this is ALWAYS the base
      composite: compositeScore,
      composite_used_as_base: compositeScore, // Explicit: this is what we use as base
      base_pod_score: compositeScore, // Should equal composite (verification)
      
      // Overlap (from redundancy detection)
      overlap_percent: redundancyOverlapPercent,
      
      // Penalty calculation and application
      penalty_percent_computed: penaltyPercent,
      penalty_percent_applied: effectivePenaltyPercent, // Can differ if overlap toggle is off
      penalty_applied_to: 'composite', // Clarify where penalty is applied
      overlap_adjustments_enabled: overlapAdjustmentsEnabled, // Show toggle state
      penalty_difference_reason: !overlapAdjustmentsEnabled 
        ? 'Overlap adjustments disabled via config toggle - penalty computed but not applied'
        : penaltyPercent !== effectivePenaltyPercent
        ? 'Penalty modified by system configuration'
        : null,
      
      // Bonus calculation and application
      bonus_multiplier_computed: bonusMultiplier,
      bonus_multiplier_applied: effectiveBonusMultiplier, // Can differ if overlap toggle is off
      bonus_difference_reason: !overlapAdjustmentsEnabled
        ? 'Overlap adjustments disabled via config toggle - bonus computed but not applied (1.0 used)'
        : bonusMultiplier !== effectiveBonusMultiplier
        ? 'Bonus multiplier modified by system configuration'
        : null,
      bonus_applied_to: 'post_penalty', // Clarify where bonus is applied
      
      // Seed multiplier calculation and application (content-based, not timing-based)
      seed_multiplier: seedMultiplier,
      seed_multiplier_applied: (isSeedFromAI && seedMultiplierEnabled), // MAREK/SIMBA FIX: Show actual application, not just AI detection
      seed_detected_by_ai: isSeedFromAI, // Separate field for AI detection
      seed_toggle_enabled: seedMultiplierEnabled, // Separate field for toggle state
      seed_applied_to: 'post_bonus',
      seed_justification: evaluation.seed_justification || (isSeedFromAI ? 'AI determined seed characteristics' : 'Not a seed contribution'),
      
      // Edge multiplier calculation and application (content-based boundary operator detection)
      edge_multiplier: edgeMultiplier,
      edge_multiplier_applied: (isEdgeFromAI && edgeMultiplierEnabled), // MAREK/SIMBA FIX: Show actual application, not just AI detection
      edge_detected_by_ai: isEdgeFromAI, // Separate field for AI detection
      edge_toggle_enabled: edgeMultiplierEnabled, // Separate field for toggle state
      edge_applied_to: 'post_bonus',
      edge_justification: evaluation.edge_justification || (isEdgeFromAI ? 'AI determined edge characteristics' : 'Not an edge contribution'),
      
      // Combined multiplier (seed × edge if both apply)
      combined_multiplier: combinedMultiplier,
      has_both_seed_and_edge: isSeedFromAI && isEdgeFromAI,
      
      // Step-by-step calculation (full transparency)
      step_1_composite: compositeScore,
      step_2_after_penalty: afterPenalty,
      step_3_after_bonus: afterBonus,
      step_4_after_seed_and_edge: afterSeedAndEdge,
      step_5_clamped: pod_score,
      
      // Required for type compatibility
      after_penalty: afterPenalty,
      after_bonus: afterBonus,
      after_seed_and_edge: afterSeedAndEdge,
      
      // Final score
      final_score: pod_score,
      
      // Formula used (APPLIED values only - Marek/Simba fix for trace consistency)
      // CRITICAL: Use effectivePenaltyPercent and effectiveBonusMultiplier (APPLIED) not computed values
      // CRITICAL: Only show seed/edge in formula if BOTH detected AND toggle enabled
      formula: (isSeedFromAI && seedMultiplierEnabled && isEdgeFromAI && edgeMultiplierEnabled)
        ? `Final = (Composite=${compositeScore} × (1 - ${effectivePenaltyPercent}%/100)) × ${effectiveBonusMultiplier.toFixed(3)} × ${seedMultiplier.toFixed(2)} (seed) × ${edgeMultiplier.toFixed(2)} (edge) = ${pod_score}`
        : (isSeedFromAI && seedMultiplierEnabled)
        ? `Final = (Composite=${compositeScore} × (1 - ${effectivePenaltyPercent}%/100)) × ${effectiveBonusMultiplier.toFixed(3)} × ${seedMultiplier.toFixed(2)} (seed) = ${pod_score}`
        : (isEdgeFromAI && edgeMultiplierEnabled)
        ? `Final = (Composite=${compositeScore} × (1 - ${effectivePenaltyPercent}%/100)) × ${effectiveBonusMultiplier.toFixed(3)} × ${edgeMultiplier.toFixed(2)} (edge) = ${pod_score}`
        : `Final = (Composite=${compositeScore} × (1 - ${effectivePenaltyPercent}%/100)) × ${effectiveBonusMultiplier.toFixed(3)} = ${pod_score}`,
      
      // Step-by-step formula breakdown (for UI display) - APPLIED values only
      // MAREK/SIMBA FIX: Only show seed/edge steps if BOTH detected AND toggle enabled
      formula_steps: [
        `Step 1: Composite = N(${finalNoveltyScore}) + D(${densityFinal}) + C(${coherenceScore}) + A(${alignmentScore}) = ${compositeScore}`,
        `Step 2: After Penalty = ${compositeScore} × (1 - ${effectivePenaltyPercent}/100) = ${afterPenalty.toFixed(2)}${effectivePenaltyPercent !== penaltyPercent ? ` [Computed: ${penaltyPercent}%, Applied: ${effectivePenaltyPercent}%]` : ''}`,
        `Step 3: After Bonus = ${afterPenalty.toFixed(2)} × ${effectiveBonusMultiplier.toFixed(3)} = ${afterBonus.toFixed(2)}${effectiveBonusMultiplier !== bonusMultiplier ? ` [Computed: ${bonusMultiplier.toFixed(3)}, Applied: ${effectiveBonusMultiplier.toFixed(3)}]` : ''}`,
        ((isSeedFromAI && seedMultiplierEnabled) || (isEdgeFromAI && edgeMultiplierEnabled))
          ? `Step 4: After Multipliers = ${afterBonus.toFixed(2)} × ${combinedMultiplier.toFixed(4)} ${(isSeedFromAI && seedMultiplierEnabled && isEdgeFromAI && edgeMultiplierEnabled) ? '(seed × edge)' : (isSeedFromAI && seedMultiplierEnabled) ? '(seed)' : '(edge)'} = ${afterSeedAndEdge.toFixed(2)}`
          : null,
        `Step ${((isSeedFromAI && seedMultiplierEnabled) || (isEdgeFromAI && edgeMultiplierEnabled)) ? '5' : '4'}: Final (clamped 0-10000) = ${pod_score}`,
      ].filter(Boolean),
      
      // === Multipliers Applied (Structured Array) - Marek/Simba requirement ===
      multipliers_applied: [
        ...(isSeedFromAI && seedMultiplierEnabled ? [{
          name: 'seed',
          value: seedMultiplier,
          applied_to: 'post_bonus',
          justification: evaluation.seed_justification || 'AI determined seed characteristics'
        }] : []),
        ...(isEdgeFromAI && edgeMultiplierEnabled ? [{
          name: 'edge',
          value: edgeMultiplier,
          applied_to: 'post_bonus',
          justification: evaluation.edge_justification || 'AI determined edge characteristics'
        }] : []),
      ],
      
      // === Finals (Pre-clamp vs Clamped) - Marek/Simba P0 CRITICAL ===
      final_preclamp: final_preclamp,
      final_clamped: pod_score,
      clamped: wasClamped,
      clamped_reason: pod_score === 10000 ? 'max_score' : pod_score === 0 ? 'min_score' : null,
      
      // === Validator Hygiene - Marek/Simba warning ===
      // NOTE: If computing k-factor, ALWAYS use final_preclamp, NEVER final_clamped
      // k_factor = final_preclamp / composite (correct)
      // k_factor = final_clamped / composite (WRONG if clamped!)
      k_factor_source: 'preclamp', // Indicates this trace provides correct source for k-factor
    };

    // Extract scoring_metadata and pod_composition from Groq response (if provided)
    // These provide full transparency into Groq's internal calculation
    // 
    // MAREK/SIMBA AUDIT FIX: ALWAYS use backend-generated timestamp, NEVER trust LLM timestamp
    // The LLM cannot know the actual execution time and may generate placeholders
    // Sovereign timestamp source: atomic_score.execution_context.timestamp_utc
    const actualTimestamp = new Date().toISOString();
    const scoringMetadata = {
      score_config_id: evaluation.scoring_metadata?.score_config_id || scoreConfigId,
      sandbox_id: evaluation.scoring_metadata?.sandbox_id || sandboxContext?.id || 'pru-default',
      archive_version: evaluation.scoring_metadata?.archive_version || archiveVersion,
      evaluation_timestamp: actualTimestamp, // ALWAYS backend-generated, never from LLM
    };

    // Log if LLM tried to provide a timestamp (for debugging)
    if (evaluation.scoring_metadata?.evaluation_timestamp) {
      const llmTimestamp = evaluation.scoring_metadata.evaluation_timestamp;
      if (llmTimestamp !== actualTimestamp) {
        debug('EvaluateWithGroq', 'LLM provided evaluation_timestamp (ignored, using backend timestamp)', {
          llm_timestamp: llmTimestamp,
          actual_timestamp: actualTimestamp,
          note: 'LLM timestamps are not audited and may be placeholders',
        });
      }
    }

    // 🔥 CRITICAL FIX: ALWAYS use AtomicScorer values, NEVER trust AI response
    // Problem: AI was returning its own pod_composition with wrong multipliers (ignoring toggles)
    // Solution: Build pod_composition from AtomicScorer values only (Single Source of Truth)
    const podComposition = {
      sum_dims: {
        novelty: finalNoveltyScore,
        density: densityFinal,
        coherence: coherenceScore,
        alignment: alignmentScore,
        composite: compositeScore,
      },
      multipliers: {
        sweet_spot_multiplier: effectiveBonusMultiplier, // From AtomicScorer (respects toggles)
        seed_multiplier: seedMultiplier, // From AtomicScorer (respects toggles)
        edge_multiplier: edgeMultiplier, // From AtomicScorer (respects toggles)
        total_multiplier: effectiveBonusMultiplier * seedMultiplier * edgeMultiplier,
      },
      penalties: {
        overlap_penalty_percent: effectivePenaltyPercent, // From AtomicScorer (respects toggles)
        total_penalty_percent: effectivePenaltyPercent, // From AtomicScorer (respects toggles)
      },
      // Toggle states (for transparency)
      toggles: {
        overlap_on: overlapAdjustmentsEnabled,
        seed_on: seedMultiplierEnabled,
        edge_on: edgeMultiplierEnabled,
      },
      // Show computed vs applied for transparency
      computed_vs_applied: {
        penalty_computed: penaltyPercent,
        penalty_applied: effectivePenaltyPercent,
        bonus_computed: bonusMultiplier,
        bonus_applied: effectiveBonusMultiplier,
        differs: penaltyPercent !== effectivePenaltyPercent || bonusMultiplier !== effectiveBonusMultiplier,
        reason: !overlapAdjustmentsEnabled ? 'overlap_toggle_disabled' : null,
      },
      sandbox_factor: 1.0, // Default, can be overridden
      final_clamped: pod_score,
    };

    // Qualification threshold (≥8,000 for Founder) is checked separately

    // Extract metal alignment
    let metals: string[] = [];
    const metalAlignment = evaluation.metal_alignment || evaluation.metals || [];
    if (Array.isArray(metalAlignment)) {
      metals = metalAlignment.map((m: string) => m.toLowerCase());
    } else if (typeof metalAlignment === 'string') {
      metals = [metalAlignment.toLowerCase()];
    }

    // Ensure we have at least one metal
    if (metals.length === 0) {
      metals = ['copper']; // Default to copper if none detected
    }

    // Determine qualification (≥8,000 for Founder)
    // IMPORTANT: Always use the discounted pod_score, not evaluation.qualified_founder
    // because Groq's qualified_founder is based on pre-discount score
    // For foundational submissions, this should always be true (10,000 >= 8000)
    const qualified = pod_score >= 8000;

    // Determine which epoch this PoC qualifies for based on composite/pod_score
    // For foundational submissions, pod_score will be 10000, which qualifies for Founder epoch
    const qualifiedEpoch = qualifyEpoch(pod_score);

    debug('EvaluateWithGroq', 'Epoch qualification determined', {
      pod_score,
      density: densityFinal,
      qualified_epoch: qualifiedEpoch,
      qualified,
      qualification_based_on: 'pod_score (composite score)',
    });

    // Final validation: If all scores are 0, this indicates a problem with Groq's response
    const allScoresZero =
      finalNoveltyScore === 0 && densityFinal === 0 && coherenceScore === 0 && alignmentScore === 0;
    if (allScoresZero) {
      // Always log this critical error with COMPREHENSIVE debugging information
      const errorDetails = {
        // Full evaluation object
        evaluationFull: JSON.stringify(evaluation, null, 2),
        // Raw Groq API response (full)
        rawAnswer: answer,
        rawAnswerLength: answer.length,
        // Full Groq API response structure
        fullGroqApiResponse: JSON.stringify(fullGroqResponse, null, 2),
        // Scoring object structure
        scoring: scoring,
        scoringString: JSON.stringify(scoring, null, 2),
        // Raw values before extraction
        noveltyRaw: noveltyRaw,
        noveltyRawType: typeof noveltyRaw,
        densityRaw: densityRaw,
        densityRawType: typeof densityRaw,
        coherenceRaw: coherenceRaw,
        coherenceRawType: typeof coherenceRaw,
        alignmentRaw: alignmentRaw,
        alignmentRawType: typeof alignmentRaw,
        // Extracted scores
        baseNoveltyScore,
        baseDensityScore,
        coherenceScore,
        alignmentScore,
        // Extraction paths used
        extractionPaths: {
          novelty: noveltyExtractionPath,
          density: densityExtractionPath,
          coherence: coherenceExtractionPath,
          alignment: alignmentExtractionPath,
        },
        // Evaluation structure analysis
        evaluationKeys: Object.keys(evaluation),
        evaluationStructure: {
          hasScoring: !!evaluation.scoring,
          scoringKeys: evaluation.scoring ? Object.keys(evaluation.scoring) : [],
          hasNovelty: 'novelty' in evaluation,
          hasDensity: 'density' in evaluation,
          hasCoherence: 'coherence' in evaluation,
          hasAlignment: 'alignment' in evaluation,
          noveltyType: typeof evaluation.novelty,
          densityType: typeof evaluation.density,
          coherenceType: typeof evaluation.coherence,
          alignmentType: typeof evaluation.alignment,
        },
        // JSON parsing candidates that were tried
        jsonCandidates: extractJsonCandidates(answer),
        // Timestamp for correlation
        timestamp: new Date().toISOString(),
      };
      const errorDetailsString = JSON.stringify(errorDetails, null, 2);
      console.error(
        '[EvaluateWithGroq] CRITICAL ERROR: All scores are 0 - Groq may not have returned scores properly',
        errorDetailsString
      );
      debugError(
        'EvaluateWithGroq',
        'CRITICAL ERROR: All scores are 0 - Groq may not have returned scores properly',
        new Error(errorDetailsString)
      );

      // Create a custom error with detailed information attached
      const error = new Error(
        'Evaluation failed: All scores are 0. This indicates the AI evaluation did not return valid scores. Please try submitting again.'
      );
      (error as any).errorDetails = errorDetails;
      (error as any).fullGroqResponse = fullGroqResponse;
      (error as any).rawAnswer = answer;
      (error as any).evaluation = evaluation;
      throw error;
    }

    // Use final scores (may have been overridden for foundational submissions)
    const finalNovelty = Math.max(0, Math.min(2500, finalNoveltyScore));
    const finalDensity = Math.max(0, Math.min(2500, densityFinal));
    const finalCoherence = Math.max(0, Math.min(2500, coherenceScore));
    const finalAlignment = Math.max(0, Math.min(2500, alignmentScore));
    const finalPodScore = Math.max(0, Math.min(10000, pod_score));
    const finalRedundancy = Math.max(0, Math.min(100, redundancyOverlapPercent));
    const finalOverlap = Math.max(0, Math.min(100, redundancyOverlapPercent));

    // Capture LLM metadata for provenance (timestamp, date, model, version, system prompt)
    // TSRC: Enhanced with determinism contract and operator metadata
    const evaluationTimestamp = new Date();
    const llmMetadata = {
      timestamp: evaluationTimestamp.toISOString(),
      date: evaluationTimestamp.toISOString().split('T')[0], // YYYY-MM-DD format
      model: 'llama-3.3-70b-versatile',
      model_version: '3.3',
      provider: 'Groq',
      system_prompt_preview: systemPrompt.substring(0, 500) + '...', // First 500 chars + indicator
      system_prompt_hash: crypto
        .createHash('sha256')
        .update(systemPrompt)
        .digest('hex')
        .substring(0, 16), // Hash for verification
      system_prompt_file: 'utils/grok/system-prompt.ts', // Reference to full prompt location (note: "grok" is folder name, Groq is the API provider)
      evaluation_timestamp_ms: evaluationTimestamp.getTime(),
      // TSRC: Determinism contract and operator metadata
      tsrc: {
        determinism_contract: determinismContract,
        archive_snapshot: {
          snapshot_id: archiveSnapshot.snapshot_id,
          item_count: archiveSnapshot.item_count,
          created_at: archiveSnapshot.created_at,
        },
        operators: {
          isotropic: isotropicOperator,
        },
        content_hash: contentHash,
        mode_state: determinismContract.mode_state,
        temperature: 0, // Enforced for determinism
        reproducible: true, // This evaluation is reproducible via snapshot_id
      },
    };

    // ============================================================================
    // MAREK/SIMBA CRITICAL FIX: SINGLE SOURCE OF TRUTH FOR SCORING
    // ============================================================================
    // The `pod_score` field below is the AUTHORITATIVE final score.
    // DO NOT use evaluation.total_score from the LLM - it may have penalties
    // baked in that don't respect our toggle configuration.
    // 
    // Our scoring pipeline:
    //   1. Calculate composite = N + D + C + A (dimensions)
    //   2. Apply penalty (if overlap > 30% AND overlap_on toggle is TRUE)
    //   3. Apply bonus (if in sweet spot AND overlap_on toggle is TRUE)
    //   4. Apply seed/edge multipliers (if detected AND respective toggle is TRUE)
    //   5. Clamp to [0, 10000]
    // 
    // The score_trace object contains the complete step-by-step calculation
    // and is the source of truth for reproducibility and auditing.
    // ============================================================================
    return {
      coherence: finalCoherence,
      density: finalDensity,
      // "redundancy" is now the overlap % (display metric). Penalty is stored separately.
      redundancy: finalOverlap,
      pod_score: finalPodScore, // AUTHORITATIVE FINAL SCORE (see comment above)
      metals,
      qualified,
      qualified_epoch: qualifiedEpoch, // Epoch this PoC qualifies for based on density
      // Additional fields from new evaluation format
      novelty: finalNovelty,
      alignment: finalAlignment,
      classification: evaluation.classification || [],
      redundancy_analysis: calculatedRedundancy
        ? `${calculatedRedundancy.analysis}\n\n${evaluation.redundancy_analysis || (typeof noveltyRaw === 'object' && noveltyRaw !== null ? noveltyRaw.justification : '') || ''}`
        : evaluation.redundancy_analysis ||
          (typeof noveltyRaw === 'object' && noveltyRaw !== null ? noveltyRaw.justification : '') ||
          '',
      metal_justification: evaluation.metal_justification || '',
      founder_certificate: evaluation.founder_certificate || '',
      homebase_intro: evaluation.homebase_intro || '',
      tokenomics_recommendation: evaluation.tokenomics_recommendation || {
        eligible_epochs: [qualifiedEpoch], // Include qualified epoch in eligible epochs
        suggested_allocation: 0,
        tier_multiplier: 1,
        epoch_distribution: {},
        allocation_notes: 'Token allocation requires human admin approval',
        requires_admin_approval: true,
      },
      // Store base scores and overlap effect for transparency
      base_novelty: baseNoveltyScore,
      base_density: baseDensityScore,
      redundancy_overlap_percent: redundancyOverlapPercent,
      // Marek/Simba fix: Return APPLIED values as primary fields
      redundancy_penalty_percent: effectivePenaltyPercent, // APPLIED penalty % (may differ from computed)
      sweet_spot_bonus_multiplier: effectiveBonusMultiplier, // APPLIED bonus multiplier (may differ from computed)
      // Also include computed values for transparency
      redundancy_penalty_percent_computed: penaltyPercent, // Computed penalty (before toggle consideration)
      sweet_spot_bonus_multiplier_computed: bonusMultiplier, // Computed bonus (before toggle consideration)
      // Seed and Edge detection (content-based, not timing-based)
      is_seed_submission: isSeedFromAI,
      seed_justification: evaluation.seed_justification || null,
      is_edge_submission: isEdgeFromAI,
      edge_justification: evaluation.edge_justification || null,
      // Store raw Groq API response for display
      raw_groq_response: answer, // Store the raw markdown/text response from Groq
      // LLM Metadata for provenance and audit trail (required for all qualifying PoCs)
      llm_metadata: llmMetadata,
      // H) Score trace for transparency (Marek requirement)
      score_trace: scoreTrace,
      // Deterministic Score Contract (Marek requirement)
      scoring_metadata: scoringMetadata,
      pod_composition: podComposition,
      // THALET Protocol: Atomic Score (Single Source of Truth)
      atomic_score: atomicScore,
      // NEW: BridgeSpec info (for TO/Testability integration)
      bridge_spec: extractedBridgeSpec || null, // Include BridgeSpec if provided
      bridgespec_hash: atomicScore.trace.bridgespec_hash || null, // BridgeSpec hash from atomic_score.trace
    };
  } catch (error) {
    debugError('EvaluateWithGroq', 'Groq API call failed', error);
    throw error;
  }
}
