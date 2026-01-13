import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import {
  contributionsTable,
  allocationsTable,
  tokenomicsTable,
  pocLogTable,
} from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { evaluateWithGroq } from '@/utils/grok/evaluate';
import { vectorizeSubmission } from '@/utils/vectors';
import { sendApprovalRequestEmail } from '@/utils/email/send-approval-request';
import { isQualifiedForEpoch, qualifyEpoch, getOpenEpochInfo, isEpochOpen } from '@/utils/epochs/qualification';
import { extractArchiveData } from '@/utils/archive/extract';
import crypto from 'crypto';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  createRateLimitHeaders,
  RateLimitConfig,
} from '@/utils/rate-limit';
import { handleCorsPreflight, createCorsHeaders } from '@/utils/cors';

// Increase timeout for Grok API evaluation (can take up to 2 minutes)
export const maxDuration = 120; // 120 seconds (2 minutes)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: { hash: string } }) {
  // Handle CORS preflight
  const corsPreflight = handleCorsPreflight(request);
  if (corsPreflight) return corsPreflight;

  const submissionHash = params.hash;
  debug('EvaluateContribution', 'Evaluation request received', { submissionHash });

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, RateLimitConfig.EVALUATE);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      debug('EvaluateContribution', 'Rate limit exceeded', {
        identifier: identifier.substring(0, 20) + '...',
        submissionHash,
      });
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many evaluation requests. Please try again after ${new Date(rateLimitResult.reset).toISOString()}`,
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }
    // Get contribution
    const contribution = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      const corsHeaders = createCorsHeaders(request);
      corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404, headers: rateLimitHeaders }
      );
    }

    const contrib = contribution[0];
    const startTime = Date.now();

    // Log evaluation start
    const evaluationStartLogId = crypto.randomUUID();
    await db.insert(pocLogTable).values({
      id: evaluationStartLogId,
      submission_hash: submissionHash,
      contributor: contrib.contributor,
      event_type: 'evaluation_start',
      event_status: 'pending',
      title: contrib.title,
      category: contrib.category || null,
      request_data: {
        submission_hash: submissionHash,
        title: contrib.title,
        has_text_content: !!contrib.text_content,
      },
      created_at: new Date(),
    });

    // Update status to evaluating
    await db
      .update(contributionsTable)
      .set({
        status: 'evaluating',
        updated_at: new Date(),
      })
      .where(eq(contributionsTable.submission_hash, submissionHash));

    // Perform evaluation with Groq AI
    const textContent = contrib.text_content || contrib.title;
    let groqRequest: any = null;
    let groqResponse: any = null;
    let evaluation: any = null;
    let evaluationError: Error | null = null;

    try {
      // Call Groq API for actual evaluation
      evaluation = await evaluateWithGroq(
        textContent,
        contrib.title,
        contrib.category || undefined,
        submissionHash
      );
      groqRequest = { text_content_length: textContent.length };
      groqResponse = { success: true, evaluation };
    } catch (error) {
      evaluationError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Extract detailed error information if available
      const errorDetails = (error as any)?.errorDetails || null;
      const fullGroqResponse = (error as any)?.fullGroqResponse || null;
      const rawAnswer = (error as any)?.rawAnswer || null;
      const evaluation = (error as any)?.evaluation || null;

      // If evaluation failed (e.g., all scores are 0), mark status as evaluation_failed
      if (
        errorMessage.includes('All scores are 0') ||
        errorMessage.includes('evaluation did not return valid scores')
      ) {
        // Update status to evaluation_failed and store error details
        await db
          .update(contributionsTable)
          .set({
            status: 'evaluation_failed',
            metadata: {
              ...((contrib.metadata as any) || {}),
              evaluation_error: errorMessage,
              evaluation_failed_at: new Date().toISOString(),
              evaluation_error_type: 'zero_scores',
              // Store detailed error information for debugging
              error_details: errorDetails,
              full_groq_response: fullGroqResponse,
              raw_groq_answer: rawAnswer,
              parsed_evaluation: evaluation,
            } as any,
            updated_at: new Date(),
          })
          .where(eq(contributionsTable.submission_hash, submissionHash));

        // Log evaluation failure with detailed information
        await db.insert(pocLogTable).values({
          id: crypto.randomUUID(),
          submission_hash: submissionHash,
          contributor: contrib.contributor,
          event_type: 'evaluation_failed',
          event_status: 'error',
          title: contrib.title,
          category: contrib.category || null,
          request_data: {
            error: errorMessage,
            error_type: 'zero_scores',
            text_content_length: textContent.length,
          },
          response_data: {
            error: errorMessage,
            error_details: errorDetails,
            full_groq_response: fullGroqResponse,
            raw_groq_answer: rawAnswer,
            parsed_evaluation: evaluation,
          },
          grok_api_response: fullGroqResponse || null,
          error_message: errorMessage,
          created_at: new Date(),
        });

        debugError('EvaluateContribution', 'Evaluation failed - all scores are 0', {
          submissionHash,
          error: errorMessage,
          hasErrorDetails: !!errorDetails,
          hasFullGroqResponse: !!fullGroqResponse,
        });

        // Return error response instead of throwing (so frontend can handle it)
        const corsHeaders = createCorsHeaders(request);
        corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
        return NextResponse.json(
          {
            error: 'Evaluation failed',
            message: errorMessage,
            submission_hash: submissionHash,
            status: 'evaluation_failed',
          },
          { status: 500, headers: rateLimitHeaders }
        );
      }

      throw error;
    }

    // Determine which epoch this submission qualifies for based on pod_score
    // Qualification is independent of epoch open status - submissions can qualify for epochs even when closed
    const qualifiedEpoch = qualifyEpoch(evaluation.pod_score);
    const qualifiedByEpoch = await isQualifiedForEpoch(
      evaluation.pod_score,
      evaluation.density
    );

    // Use qualified status from evaluation if provided, otherwise use epoch-based qualification
    const qualified = evaluation.qualified !== undefined ? evaluation.qualified : qualifiedByEpoch;

    // Check if the qualified epoch is currently open (for display/informational purposes)
    const epochInfo = await getOpenEpochInfo();
    const qualifiedEpochIsOpen = await isEpochOpen(qualifiedEpoch);

    // Store the epoch this submission qualifies for (based on pod_score, not open status)
    const displayEpoch = qualifiedEpoch;

    // Generate vector embedding and 3D coordinates using evaluation scores
    let vectorizationResult: {
      embedding: number[];
      vector: { x: number; y: number; z: number };
      embeddingModel: string;
    } | null = null;
    try {
      vectorizationResult = await vectorizeSubmission(textContent, {
        novelty: evaluation.novelty,
        density: evaluation.density,
        coherence: evaluation.coherence,
        alignment: evaluation.alignment,
        pod_score: evaluation.pod_score,
      });
      debug('EvaluateContribution', 'Vectorization complete', {
        embeddingDimensions: vectorizationResult.embedding.length,
        vector: vectorizationResult.vector,
        model: vectorizationResult.embeddingModel,
      });
    } catch (vectorError) {
      debugError('EvaluateContribution', 'Failed to generate vectorization', vectorError);
      // Continue without vectorization - evaluation still succeeds
    }

    // Get current metadata to preserve existing values
    const currentMetadata = (contrib.metadata as any) || {};

    // Extract seed and sweet spot detection from evaluation metadata
    const isSeed = evaluation.is_seed_submission || false;
    const isEdge = evaluation.is_edge_submission || false;
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

    // Update contribution with evaluation results and vector data
    await db
      .update(contributionsTable)
      .set({
        status: qualified ? 'qualified' : 'unqualified',
        metals: evaluation.metals,
        // Seed and Edge Detection (content-based) + Sweet Spot Detection (overlap-based)
        is_seed: isSeed,
        is_edge: isEdge,
        has_sweet_spot_edges: hasSweetSpotEdges,
        overlap_percent: overlapPercent.toString(),
        // TSRC: Store snapshot_id for deterministic evaluation reproducibility
        snapshot_id: snapshotId,
        // THALET Protocol: Store atomic_score in top-level column (Single Source of Truth)
        atomic_score: atomicScore,
        metadata: {
          ...currentMetadata,
          coherence: evaluation.coherence,
          density: evaluation.density,
          redundancy: evaluation.redundancy,
          pod_score: evaluation.pod_score,
          novelty: evaluation.novelty,
          alignment: evaluation.alignment,
          classification: evaluation.classification,
          redundancy_analysis: evaluation.redundancy_analysis,
          metal_justification: evaluation.metal_justification,
          founder_certificate: evaluation.founder_certificate,
          homebase_intro: evaluation.homebase_intro,
          tokenomics_recommendation: evaluation.tokenomics_recommendation,
          qualified_founder: qualified,
          qualified_epoch: displayEpoch || evaluation.qualified_epoch || null, // Store the epoch this submission qualifies for
          allocation_status: qualified ? 'pending_admin_approval' : 'not_qualified', // Token allocation requires admin approval
          is_seed_submission: isSeed, // Also store in metadata for backwards compatibility
          seed_justification: evaluation.seed_justification || null,
          is_edge_submission: isEdge, // Content-based edge detection (E₀-E₆)
          edge_justification: evaluation.edge_justification || null,
          // Store detailed Groq evaluation details for detailed report
          // Note: Field name uses "grok" for database backwards compatibility (refers to Groq AI provider)
          grok_evaluation_details: {
            base_novelty: evaluation.base_novelty,
            base_density: evaluation.base_density,
            redundancy_penalty_percent: evaluation.redundancy_penalty_percent || 0,
            density_penalty_percent: evaluation.density_penalty_percent || 0,
            overlap_percent: overlapPercent,
            bonus_multiplier_applied: evaluation.sweet_spot_bonus_multiplier || 1.0,
            seed_multiplier_applied: isSeed ? 1.15 : 1.0,
            edge_multiplier_applied: isEdge ? 1.15 : 1.0,
            has_sweet_spot_edges: hasSweetSpotEdges,
            is_seed_submission: isSeed,
            seed_justification: evaluation.seed_justification || null,
            is_edge_submission: isEdge,
            edge_justification: evaluation.edge_justification || null,
            full_evaluation: evaluation, // Store full evaluation object
            raw_grok_response: (evaluation as any).raw_groq_response || null, // Store raw Groq API response text/markdown
          },
          // LLM Metadata for provenance (timestamp, date, model, version, system prompt)
          llm_metadata: (evaluation as any).llm_metadata || null,
          // THALET Protocol: atomic_score (SOVEREIGN FIELD - Single Source of Truth)
          atomic_score: atomicScore,
          // Deterministic Score Contract (Marek requirement) - Legacy scoring trace (backward compat)
          score_trace: evaluation.score_trace || null,
          scoring_metadata: evaluation.scoring_metadata || null,
          pod_composition: evaluation.pod_composition || null,
        },
        // Store vector embedding and 3D coordinates if available
        embedding: vectorizationResult ? vectorizationResult.embedding : undefined,
        vector_x: vectorizationResult ? vectorizationResult.vector.x.toString() : undefined,
        vector_y: vectorizationResult ? vectorizationResult.vector.y.toString() : undefined,
        vector_z: vectorizationResult ? vectorizationResult.vector.z.toString() : undefined,
        embedding_model: vectorizationResult ? vectorizationResult.embeddingModel : undefined,
        vector_generated_at: vectorizationResult ? new Date() : undefined,
        updated_at: new Date(),
      })
      .where(eq(contributionsTable.submission_hash, submissionHash));

    // If qualified, create allocation (simplified for now)
    if (qualified) {
      // TODO: Implement proper token allocation logic
      // For now, just mark as qualified
    }

    const processingTime = Date.now() - startTime;

    // Extract archive data (abstract, formulas, constants) for permanent storage
    const archiveData = extractArchiveData(textContent, contrib.title);

    // Log successful evaluation
    const evaluationCompleteLogId = crypto.randomUUID();
    await db.insert(pocLogTable).values({
      id: evaluationCompleteLogId,
      submission_hash: submissionHash,
      contributor: contrib.contributor,
      event_type: 'evaluation_complete',
      event_status: 'success',
      title: contrib.title,
      category: contrib.category || null,
      evaluation_result: {
        coherence: evaluation.coherence,
        density: evaluation.density,
        redundancy: evaluation.redundancy,
        pod_score: evaluation.pod_score,
        novelty: evaluation.novelty,
        alignment: evaluation.alignment,
        metals: evaluation.metals,
        qualified,
        qualified_founder: qualified,
        classification: evaluation.classification,
        redundancy_analysis: evaluation.redundancy_analysis,
        metal_justification: evaluation.metal_justification,
      },
      grok_api_request: groqRequest,
      grok_api_response: groqResponse,
      response_data: {
        success: true,
        qualified,
        evaluation,
      },
      metadata: {
        archive_data: archiveData,
      },
      processing_time_ms: processingTime,
      created_at: new Date(),
    });

    // Log status change
    const statusChangeLogId = crypto.randomUUID();
    await db.insert(pocLogTable).values({
      id: statusChangeLogId,
      submission_hash: submissionHash,
      contributor: contrib.contributor,
      event_type: 'status_change',
      event_status: 'success',
      title: contrib.title,
      request_data: {
        old_status: 'evaluating',
        new_status: qualified ? 'qualified' : 'unqualified',
      },
      response_data: { status: qualified ? 'qualified' : 'unqualified' },
      created_at: new Date(),
    });

    debug('EvaluateContribution', 'Evaluation completed', {
      submissionHash,
      qualified,
      evaluation,
    });

    // Send approval request email if qualified
    if (qualified) {
      try {
        await sendApprovalRequestEmail({
          submission_hash: submissionHash,
          title: contrib.title,
          contributor: contrib.contributor,
          pod_score: evaluation.pod_score,
          metals: evaluation.metals || [],
          tokenomics_recommendation: evaluation.tokenomics_recommendation,
        });
        debug('EvaluateContribution', 'Approval request email sent', { submissionHash });
      } catch (emailError) {
        debugError('EvaluateContribution', 'Failed to send approval request email', emailError);
        // Don't fail evaluation if email fails
      }
    }

    // Get existing allocations if any
    const existingAllocations = await db
      .select()
      .from(allocationsTable)
      .where(eq(allocationsTable.submission_hash, submissionHash));

    const allocations = existingAllocations.map((a) => ({
      id: a.id,
      metal: a.metal,
      epoch: a.epoch,
      reward: Number(a.reward),
      tier_multiplier: Number(a.tier_multiplier),
      created_at: a.created_at?.toISOString(),
    }));

    // Return success with CORS and rate limit headers
    const corsHeaders = createCorsHeaders(request);
    corsHeaders.forEach((value, key) => rateLimitHeaders.set(key, value));
    // MAREK/SIMBA AUDIT: Enforce Zero-Delta Invariant
    // SOVEREIGN SOURCE: atomic_score.final (if present) overrides all other score fields
    const sovereignScore = atomicScore?.final ?? evaluation.pod_score;
    
    return NextResponse.json(
      {
        success: true,
        submission_hash: submissionHash,
        evaluation: {
          coherence: evaluation.coherence,
          density: evaluation.density,
          redundancy: evaluation.redundancy,
          novelty: evaluation.novelty,
          alignment: evaluation.alignment,
          metals: evaluation.metals,
          
          // ZERO-DELTA ENFORCEMENT: pod_score MUST equal atomic_score.final
          pod_score: sovereignScore,
          
          // 🔥 THALET Protocol: atomic_score is the Single Source of Truth
          atomic_score: atomicScore,
          
          // Include score_trace for transparency (but atomic_score.final is authoritative)
          score_trace: evaluation.score_trace || null,
          
          status: qualified ? 'qualified' : 'unqualified',
          qualified_founder: qualified,
          qualified_epoch: displayEpoch, // Epoch this submission qualifies for (based on pod_score)
          qualified_epoch_is_open: qualifiedEpochIsOpen, // Whether the qualified epoch is currently open
          classification: evaluation.classification,
          redundancy_analysis: evaluation.redundancy_analysis,
          metal_justification: evaluation.metal_justification,
          founder_certificate: evaluation.founder_certificate,
          homebase_intro: evaluation.homebase_intro,
          tokenomics_recommendation: evaluation.tokenomics_recommendation,
          allocation_status:
            (contrib.metadata as any)?.allocation_status || 'pending_admin_approval',
          allocations: allocations.length > 0 ? allocations : undefined,
          // Include full Grok evaluation details for detailed report
          grok_evaluation_details: {
            base_novelty: evaluation.base_novelty,
            base_density: evaluation.base_density,
            redundancy_penalty_percent: evaluation.redundancy_penalty_percent,
            density_penalty_percent: evaluation.density_penalty_percent,
            full_evaluation: evaluation, // Include full evaluation object
            raw_grok_response: (evaluation as any).raw_grok_response || null, // Include raw Grok API response text/markdown
          },
          // LLM Metadata for provenance (timestamp, date, model, version, system prompt)
          llm_metadata: (evaluation as any).llm_metadata || null,
        },
        status: qualified ? 'qualified' : 'unqualified',
        qualified,
        qualified_founder: qualified,
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    debugError('EvaluateContribution', 'Error evaluating contribution', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Get contribution for logging
    let contributor = 'unknown';
    let title = 'unknown';
    try {
      const contrib = await db
        .select()
        .from(contributionsTable)
        .where(eq(contributionsTable.submission_hash, submissionHash))
        .limit(1);
      if (contrib && contrib.length > 0) {
        contributor = contrib[0].contributor;
        title = contrib[0].title;
      }
    } catch (e) {
      // Ignore error getting contribution
    }

    // Log evaluation error
    const errorLogId = crypto.randomUUID();
    await db.insert(pocLogTable).values({
      id: errorLogId,
      submission_hash: submissionHash,
      contributor,
      event_type: 'evaluation_error',
      event_status: 'error',
      title,
      error_message: errorMessage,
      error_stack: errorStack,
      response_data: {
        success: false,
        error: errorMessage,
      },
      created_at: new Date(),
    });

    // Update status to unqualified on error
    try {
      await db
        .update(contributionsTable)
        .set({
          status: 'unqualified',
          updated_at: new Date(),
        })
        .where(eq(contributionsTable.submission_hash, submissionHash));

      // Log status change to unqualified
      const statusChangeLogId = crypto.randomUUID();
      await db.insert(pocLogTable).values({
        id: statusChangeLogId,
        submission_hash: submissionHash,
        contributor,
        event_type: 'status_change',
        event_status: 'success',
        title,
        request_data: {
          old_status: 'evaluating',
          new_status: 'unqualified',
          reason: 'evaluation_error',
        },
        response_data: { status: 'unqualified' },
        created_at: new Date(),
      });
    } catch (updateError) {
      debugError('EvaluateContribution', 'Error updating status', updateError);
    }

    const corsHeaders = createCorsHeaders(request);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        submission_hash: submissionHash,
        status: 'unqualified',
        qualified: false,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsPreflight = handleCorsPreflight(request);
  return corsPreflight || new Response(null, { status: 204 });
}
