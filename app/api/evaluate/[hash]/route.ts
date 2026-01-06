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
import { evaluateWithGrok } from '@/utils/grok/evaluate';
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

    // Perform evaluation with GROK
    const textContent = contrib.text_content || contrib.title;
    let grokRequest: any = null;
    let grokResponse: any = null;
    let evaluation: any = null;
    let evaluationError: Error | null = null;

    try {
      // Call Grok API for actual evaluation
      evaluation = await evaluateWithGrok(
        textContent,
        contrib.title,
        contrib.category || undefined,
        submissionHash
      );
      grokRequest = { text_content_length: textContent.length };
      grokResponse = { success: true, evaluation };
    } catch (error) {
      evaluationError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Extract detailed error information if available
      const errorDetails = (error as any)?.errorDetails || null;
      const fullGrokResponse = (error as any)?.fullGrokResponse || null;
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
              full_grok_response: fullGrokResponse,
              raw_grok_answer: rawAnswer,
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
            full_grok_response: fullGrokResponse,
            raw_grok_answer: rawAnswer,
            parsed_evaluation: evaluation,
          },
          grok_api_response: fullGrokResponse || null,
          error_message: errorMessage,
          created_at: new Date(),
        });

        debugError('EvaluateContribution', 'Evaluation failed - all scores are 0', {
          submissionHash,
          error: errorMessage,
          hasErrorDetails: !!errorDetails,
          hasFullGrokResponse: !!fullGrokResponse,
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

    // Update contribution with evaluation results and vector data
    await db
      .update(contributionsTable)
      .set({
        status: qualified ? 'qualified' : 'unqualified',
        metals: evaluation.metals,
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
          // Store detailed Grok evaluation details for detailed report
          grok_evaluation_details: {
            base_novelty: evaluation.base_novelty,
            base_density: evaluation.base_density,
            redundancy_penalty_percent: evaluation.redundancy_penalty_percent,
            density_penalty_percent: evaluation.density_penalty_percent,
            full_evaluation: evaluation, // Store full evaluation object
            raw_grok_response: (evaluation as any).raw_grok_response || null, // Store raw Grok API response text/markdown
          },
          // LLM Metadata for provenance (timestamp, date, model, version, system prompt)
          llm_metadata: (evaluation as any).llm_metadata || null,
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
      grok_api_request: grokRequest,
      grok_api_response: grokResponse,
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
          pod_score: evaluation.pod_score,
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
