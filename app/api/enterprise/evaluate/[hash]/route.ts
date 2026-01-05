import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { enterpriseContributionsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { evaluateWithGrok } from '@/utils/grok/evaluate';
import { vectorizeSubmission } from '@/utils/vectors';
import { debug, debugError } from '@/utils/debug';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
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

    if (!contrib.text_content) {
      return NextResponse.json({ error: 'Contribution text content missing' }, { status: 400 });
    }

    // Evaluate with Grok (no top matches for now - can enhance later)
    const evaluation = await evaluateWithGrok(
      contrib.text_content,
      contrib.title,
      contrib.category || undefined,
      undefined // excludeHash
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

    // Update contribution with evaluation results
    await db
      .update(enterpriseContributionsTable)
      .set({
        status: qualified ? 'qualified' : 'unqualified',
        metals: evaluation.metals,
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
          grok_evaluation_details: {
            base_novelty: evaluation.base_novelty,
            base_density: evaluation.base_density,
            redundancy_overlap_percent: evaluation.redundancy_overlap_percent,
            full_evaluation: evaluation,
            raw_grok_response: (evaluation as any).raw_grok_response || null,
          },
          llm_metadata: (evaluation as any).llm_metadata || null,
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
      { error: 'Evaluation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

