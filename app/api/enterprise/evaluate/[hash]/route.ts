import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { enterpriseContributionsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { evaluateWithGroq } from '@/utils/grok/evaluate';
import { vectorizeSubmission } from '@/utils/vectors';
import { extractArchiveData } from '@/utils/archive/extract';
import { debug, debugError } from '@/utils/debug';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { hash: string } }) {
  try {
    const submissionHash = params.hash;

    // Get contribution
    const contributions = await db
      .select()
      .from(enterpriseContributionsTable)
      .where(eq(enterpriseContributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contributions || contributions.length === 0) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    const contrib = contributions[0];

    // Get sandbox config
    const sandboxes = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, contrib.sandbox_id))
      .limit(1);

    if (!sandboxes || sandboxes.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    const sandbox = sandboxes[0];
    const scoringConfig = (sandbox.scoring_config as any) || {};
    const sandboxMetadata = (sandbox.metadata as any) || {};

    if (!contrib.text_content) {
      return NextResponse.json({ error: 'Contribution text content missing' }, { status: 400 });
    }

    // Prepare sandbox context for system prompt customization
    const sandboxContext = {
      id: sandbox.id,
      name: sandbox.name,
      description: sandbox.description,
      mission: sandboxMetadata.mission,
      project_goals: sandboxMetadata.project_goals,
      metal_focus: {
        gold_focus: sandboxMetadata.gold_focus,
        silver_focus: sandboxMetadata.silver_focus,
        copper_focus: sandboxMetadata.copper_focus,
        hybrid_metals: sandboxMetadata.hybrid_metals,
      },
      scoring_config: scoringConfig,
      epoch_thresholds: {
        founder: sandboxMetadata.founder_threshold || 8000,
        pioneer: sandboxMetadata.pioneer_threshold || 6000,
        community: sandboxMetadata.community_threshold || 5000,
        ecosystem: sandboxMetadata.ecosystem_threshold || 4000,
      },
    };

    // Evaluate with Groq, passing sandbox context for system prompt customization
    const evaluation = await evaluateWithGroq(
      contrib.text_content,
      contrib.title,
      contrib.category || undefined,
      undefined, // excludeHash
      sandboxContext // Pass sandbox context to customize system prompt
    );

    // Apply custom scoring weights if configured
    let finalNovelty = evaluation.novelty || 0;
    let finalDensity = evaluation.density || 0;
    let finalCoherence = evaluation.coherence || 0;
    let finalAlignment = evaluation.alignment || 0;

    if (scoringConfig.novelty_weight) {
      finalNovelty = finalNovelty * scoringConfig.novelty_weight;
    }
    if (scoringConfig.density_weight) {
      finalDensity = finalDensity * scoringConfig.density_weight;
    }
    if (scoringConfig.coherence_weight) {
      finalCoherence = finalCoherence * scoringConfig.coherence_weight;
    }
    if (scoringConfig.alignment_weight) {
      finalAlignment = finalAlignment * scoringConfig.alignment_weight;
    }

    const podScore = finalNovelty + finalDensity + finalCoherence + finalAlignment;
    const qualificationThreshold = scoringConfig.qualification_threshold || 4000;
    const qualified = podScore >= qualificationThreshold;

    // Create vector embedding and 3D coordinates
    let vectorizationResult: {
      embedding: number[];
      vector: { x: number; y: number; z: number };
      embeddingModel: string;
    } | null = null;
    try {
      vectorizationResult = await vectorizeSubmission(contrib.text_content, {
        novelty: finalNovelty,
        density: finalDensity,
        coherence: finalCoherence,
        alignment: finalAlignment,
        pod_score: podScore,
      });
    } catch (vectorError) {
      debugError('EnterpriseEvaluate', 'Failed to generate vectorization', vectorError);
      // Continue without vectorization
    }

    // Extract archive data (abstract, formulas, constants) for permanent storage
    const archiveData = extractArchiveData(contrib.text_content, contrib.title);

    // Extract seed and sweet spot detection from evaluation metadata
    const isSeed = evaluation.is_seed_submission || false;
    const overlapPercent = evaluation.redundancy_overlap_percent || evaluation.redundancy || 0;
    // Sweet spot range is 9.2%-19.2% (centered at 14.2%)
    const hasSweetSpotEdges = overlapPercent >= 9.2 && overlapPercent <= 19.2;

    // TSRC: Extract snapshot_id from llm_metadata for top-level storage
    const snapshotId = (evaluation as any).llm_metadata?.tsrc?.archive_snapshot?.snapshot_id || null;

    // THALET Protocol: Extract atomic_score (Single Source of Truth)
    const atomicScore = (evaluation as any).atomic_score || null;
    
    // 🔥 MAREK & SIMBA DIAGNOSTIC: Verify THALET emission
    debug('THALET_DIAGNOSTIC', 'Evaluation object inspection', {
      has_atomic_score: !!atomicScore,
      atomic_score_final: atomicScore?.final,
      atomic_score_integrity_hash: atomicScore?.integrity_hash?.substring(0, 16),
      evaluation_keys: Object.keys(evaluation),
      pod_score: evaluation.pod_score,
      has_score_trace: !!evaluation.score_trace,
    });

    // Update contribution with evaluation results
    await db
      .update(enterpriseContributionsTable)
      .set({
        status: qualified ? 'qualified' : 'unqualified',
        metals: evaluation.metals,
        // Seed and Sweet Spot Edge Detection (for UI highlighting)
        is_seed: isSeed,
        has_sweet_spot_edges: hasSweetSpotEdges,
        overlap_percent: overlapPercent.toString(),
        // TSRC: Store snapshot_id for deterministic evaluation reproducibility
        snapshot_id: snapshotId,
        // THALET Protocol: Store atomic_score in top-level column (Single Source of Truth)
        atomic_score: atomicScore,
        metadata: {
          coherence: finalCoherence,
          density: finalDensity,
          redundancy: evaluation.redundancy,
          pod_score: podScore,
          novelty: finalNovelty,
          alignment: finalAlignment,
          qualified_founder: qualified,
          qualified_epoch: sandbox.current_epoch,
          classification: evaluation.classification,
          redundancy_analysis: evaluation.redundancy_analysis,
          metal_justification: evaluation.metal_justification,
          is_seed_submission: isSeed, // Also store in metadata for backwards compatibility
          grok_evaluation_details: {
            base_novelty: evaluation.base_novelty,
            base_density: evaluation.base_density,
            redundancy_penalty_percent: evaluation.redundancy_penalty_percent || 0,
            redundancy_overlap_percent: evaluation.redundancy_overlap_percent,
            overlap_percent: overlapPercent,
            bonus_multiplier_applied: evaluation.sweet_spot_bonus_multiplier || 1.0,
            seed_multiplier_applied: isSeed ? 1.15 : 1.0,
            has_sweet_spot_edges: hasSweetSpotEdges,
            full_evaluation: evaluation,
            raw_grok_response: (evaluation as any).raw_grok_response || null,
          },
          llm_metadata: (evaluation as any).llm_metadata || null,
          // THALET Protocol: atomic_score (SOVEREIGN FIELD - Single Source of Truth)
          atomic_score: atomicScore,
          archive_data: archiveData, // Store archive data in metadata for extraction
          // Deterministic Score Contract (Marek requirement) - Legacy scoring trace (backward compat)
          score_trace: evaluation.score_trace || null,
          scoring_metadata: evaluation.scoring_metadata || null,
          pod_composition: evaluation.pod_composition || null,
        } as any,
        embedding: vectorizationResult ? vectorizationResult.embedding : undefined,
        vector_x: vectorizationResult ? vectorizationResult.vector.x.toString() : undefined,
        vector_y: vectorizationResult ? vectorizationResult.vector.y.toString() : undefined,
        vector_z: vectorizationResult ? vectorizationResult.vector.z.toString() : undefined,
        embedding_model: vectorizationResult ? vectorizationResult.embeddingModel : undefined,
        vector_generated_at: vectorizationResult ? new Date() : undefined,
        updated_at: new Date(),
      })
      .where(eq(enterpriseContributionsTable.submission_hash, submissionHash));

    debug('EnterpriseEvaluate', 'Evaluation completed', {
      submissionHash,
      podScore,
      qualified,
    });

    return NextResponse.json({
      success: true,
      submission_hash: submissionHash,
      evaluation: {
        pod_score: podScore,
        novelty: finalNovelty,
        density: finalDensity,
        coherence: finalCoherence,
        alignment: finalAlignment,
        qualified,
        metals: evaluation.metals,
      },
    });
  } catch (error) {
    debugError('EnterpriseEvaluate', 'Evaluation error', error);

    // Mark as error in database
    await db
      .update(enterpriseContributionsTable)
      .set({
        status: 'unqualified',
        metadata: {
          error: error instanceof Error ? error.message : 'Evaluation failed',
        } as any,
        updated_at: new Date(),
      })
      .where(eq(enterpriseContributionsTable.submission_hash, params.hash));

    return NextResponse.json(
      {
        error: 'Evaluation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
