import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, pocLogTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'
import { evaluateWithGrok } from '@/utils/grok/evaluate'
import { vectorizeSubmission } from '@/utils/vectors'
import { sendApprovalRequestEmail } from '@/utils/email/send-approval-request'
import { isQualifiedForOpenEpoch, getOpenEpochInfo } from '@/utils/epochs/qualification'
import * as crypto from 'crypto'

function toPublicEvaluationError(message: string): string {
    const m = String(message || '')
    if (
        m.includes('Request too large') ||
        m.includes('TPM') ||
        m.includes('rate_limit_exceeded') ||
        m.includes('Grok API error (413)') ||
        m.includes('token budget')
    ) {
        return 'Evaluation queued: provider token budget exceeded. Your submission was saved and will be evaluated shortly.'
    }
    if (m.includes('timed out')) {
        return 'Evaluation queued: provider timeout. Your submission was saved and will be evaluated shortly.'
    }
    return m
}

function isProviderTokenBudgetError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err ?? '')
    return (
        msg.includes('Request too large') ||
        msg.includes('TPM') ||
        msg.includes('rate_limit_exceeded') ||
        msg.includes('Grok API error (413)') ||
        msg.toLowerCase().includes('token budget')
    )
}

function truncateForEvaluation(text: string, maxChars: number): {
    text: string
    truncated: boolean
    originalChars: number
    truncatedChars: number
} {
    const original = (text || '').trim()
    if (original.length <= maxChars) {
        return { text: original, truncated: false, originalChars: original.length, truncatedChars: original.length }
    }
    const truncatedText = original.slice(0, maxChars).trimEnd()
    return {
        text: truncatedText,
        truncated: true,
        originalChars: original.length,
        truncatedChars: truncatedText.length,
    }
}

export async function POST(request: NextRequest) {
    debug('SubmitContribution', 'Submission request received')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user || !user.email) {
            debug('SubmitContribution', 'Unauthorized submission attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const formData = await request.formData()
        const title = formData.get('title') as string | null
        const contributor = formData.get('contributor') as string | null || user.email
        const category = formData.get('category') as string | null || 'scientific'
        const text_content = (formData.get('text_content') as string | null) || ''
        
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Text-only submission is required
        if (!text_content || !text_content.trim()) {
            return NextResponse.json(
                { error: 'Submission text is required. Please paste your contribution into the submission window.' },
                { status: 400 }
            )
        }
        // Basic anti-empty / anti-noise guard
        if (text_content.trim().length < 40) {
            return NextResponse.json(
                { error: 'Submission text is too short. Please include more detail (at least 40 characters).' },
                { status: 400 }
            )
        }
        
        // Check database connection
        if (!process.env.DATABASE_URL) {
            debugError('SubmitContribution', 'DATABASE_URL not configured', new Error('DATABASE_URL environment variable is missing'))
            return NextResponse.json(
                { 
                    error: 'Database not configured',
                    message: 'DATABASE_URL environment variable is missing',
                    details: 'Please configure DATABASE_URL in Vercel environment variables'
                },
                { status: 500 }
            )
        }
        
        // Validate DATABASE_URL format
        try {
            new URL(process.env.DATABASE_URL)
        } catch (urlError) {
            debugError('SubmitContribution', 'Invalid DATABASE_URL format', urlError)
            return NextResponse.json(
                { 
                    error: 'Invalid database configuration',
                    message: 'DATABASE_URL format is invalid'
                },
                { status: 500 }
            )
        }
        
        // Generate submission hash
        let submission_hash: string
        try {
            submission_hash = crypto.randomBytes(16).toString('hex')
        } catch (cryptoError) {
            debugError('SubmitContribution', 'Failed to generate submission hash', cryptoError)
            return NextResponse.json(
                { 
                    error: 'Failed to generate submission hash',
                    message: cryptoError instanceof Error ? cryptoError.message : String(cryptoError)
                },
                { status: 500 }
            )
        }
        
        // Text-only submissions: no file upload, no storage
        const pdf_path: string | null = null
        const textContentForEvaluation = text_content.trim()
        const textContentForStorage = text_content.trim()
        
        debug('SubmitContribution', 'Text content prepared for evaluation', {
            hasTextContent: !!text_content,
            textContentLength: text_content?.length || 0,
            titleLength: title.trim().length,
            willUseForEvaluation: textContentForEvaluation.length,
            source: 'user_pasted_text'
        })
        
        // Calculate content hash from the full content
        const contentToHash = textContentForEvaluation
        const content_hash = crypto
            .createHash('sha256')
            .update(contentToHash.toLowerCase().trim())
            .digest('hex')
        
        const startTime = Date.now()
        
        // Insert contribution into database
        try {
            debug('SubmitContribution', 'Inserting contribution into database', {
                submission_hash,
                title: title.trim(),
                contributor: contributor || user.email,
                content_length: textContentForStorage?.length || 0,
                category: category || 'scientific'
            })
            
            // Prepare values for insert - handle JSONB fields carefully
            // Status starts as 'evaluating' - will be updated to 'qualified' or 'unqualified' after evaluation
            const insertValues: any = {
                submission_hash,
                title: title.trim(),
                contributor: contributor || user.email,
                content_hash,
                text_content: textContentForStorage,
                pdf_path: pdf_path || null,
                status: 'evaluating', // No drafts - submissions are immediately evaluated
                category: category || 'scientific',
                metals: [] as string[], // Empty array for metals
                metadata: {} as Record<string, any> // Empty object for metadata
            }
            
            await db.insert(contributionsTable).values(insertValues)
            
            debug('SubmitContribution', 'Contribution inserted successfully', { submission_hash })
        } catch (dbError) {
            debugError('SubmitContribution', 'Database insert error', dbError)
            const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError)
            const dbErrorStack = dbError instanceof Error ? dbError.stack : undefined
            const dbErrorCode = (dbError as any)?.code || (dbError as any)?.constraint || undefined
            
            console.error('Database insert error details:', {
                error: dbError,
                message: dbErrorMessage,
                stack: dbErrorStack,
                code: dbErrorCode,
                submission_hash,
                title: title.trim(),
                contributor: contributor || user.email
            })
            
            // Return more detailed error for debugging - show actual error in production too
            return NextResponse.json(
                { 
                    error: 'Database error',
                    message: `Failed to save contribution: ${dbErrorMessage}`,
                    details: dbErrorMessage, // Show actual error message
                    code: dbErrorCode,
                    // Include helpful info for debugging
                    hint: dbErrorMessage.includes('does not exist') 
                        ? 'Database table may not exist. Please run migrations.'
                        : dbErrorMessage.includes('relation') 
                        ? 'Database table may not exist. Please check migrations.'
                        : dbErrorMessage.includes('column') 
                        ? 'Database schema mismatch. Please check table structure.'
                        : 'Check database connection and table structure.',
                    ...(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' ? {
                        stack: dbErrorStack,
                        submission_hash,
                        title: title.trim().substring(0, 50)
                    } : {})
                },
                { status: 500 }
            )
        }
        
        // Log submission event
        try {
            const logId = crypto.randomUUID()
            await db.insert(pocLogTable).values({
                id: logId,
                submission_hash,
                contributor: contributor || user.email,
                event_type: 'submission',
                event_status: 'success',
                title: title.trim(),
                category: category || 'scientific',
                request_data: {
                    title: title.trim(),
                    contributor: contributor || user.email,
                    category: category || 'scientific',
                    has_file: false,
                    content_length: textContentForStorage?.length || 0
                },
                response_data: {
                    success: true,
                    submission_hash
                },
                processing_time_ms: Date.now() - startTime,
                created_at: new Date()
            })
        } catch (logError) {
            // Log error but don't fail the submission
            debugError('SubmitContribution', 'Failed to log submission event', logError)
        }
        
        debug('SubmitContribution', 'Contribution submitted successfully, starting evaluation', {
            submission_hash,
            title,
            contributor
        })
        
        // Automatically trigger Grok API evaluation
        let evaluation: any = null
        let evaluationError: Error | null = null
        let evaluationNotice: string | null = null
        let evaluationTruncation: { originalChars: number; truncatedChars: number } | null = null
        
        // Check if Grok API key is configured
        if (!process.env.NEXT_PUBLIC_GROK_API_KEY) {
            debug('SubmitContribution', 'GROK_API_KEY not configured, skipping evaluation')
            evaluationError = new Error('GROK_API_KEY not configured. Evaluation skipped.')
        } else {
            try {
                // Evaluate, retrying with truncated input if provider token budget is exceeded.
                const charBudgets = [24000, 16000, 10000, 7000]
                let lastEvalError: Error | null = null
                let textUsedForEvaluation = textContentForEvaluation

                for (const maxChars of charBudgets) {
                    const t = truncateForEvaluation(textContentForEvaluation, maxChars)
                    textUsedForEvaluation = t.text

                    debug('SubmitContribution', 'Starting Grok API evaluation', {
                        textLength: textUsedForEvaluation.length,
                        originalLength: t.originalChars,
                        truncated: t.truncated,
                        maxChars,
                        title: title.trim(),
                        source: 'user_pasted_text',
                    })

                    try {
                        evaluation = await evaluateWithGrok(textUsedForEvaluation, title.trim(), category || undefined, submission_hash)
                        if (t.truncated) {
                            evaluationTruncation = { originalChars: t.originalChars, truncatedChars: t.truncatedChars }
                            evaluationNotice = `Evaluated using truncated content (${t.truncatedChars.toLocaleString()} of ${t.originalChars.toLocaleString()} chars).`
                        }
                        break
                    } catch (err) {
                        const e = err instanceof Error ? err : new Error(String(err))
                        lastEvalError = e
                        if (isProviderTokenBudgetError(e)) {
                            // retry with smaller input budget
                            continue
                        }
                        throw e
                    }
                }

                if (!evaluation) {
                    throw lastEvalError || new Error('Evaluation failed to complete.')
                }
                
                // Use qualified status from evaluation
                // evaluation.qualified is already calculated with discounted pod_score in evaluateWithGrok
                // Always use it directly - no fallback needed since evaluateWithGrok always returns qualified
                const qualified = evaluation.qualified
                
                // Get the open epoch that was used to qualify (capture the epoch at qualification time)
                let openEpochUsed: string | null = null
                if (qualified) {
                    try {
                        const epochInfo = await getOpenEpochInfo()
                        openEpochUsed = epochInfo.current_epoch
                        debug('SubmitContribution', 'Captured open epoch for qualification', {
                            submission_hash,
                            open_epoch: openEpochUsed
                        })
                    } catch (epochError) {
                        debugError('SubmitContribution', 'Error getting open epoch info', epochError)
                        // Fallback to evaluation.qualified_epoch if available
                        openEpochUsed = evaluation.qualified_epoch || null
                    }
                }
            
                // Generate vector embedding and 3D coordinates using evaluation scores
                let vectorizationResult: { embedding: number[], vector: { x: number, y: number, z: number }, embeddingModel: string } | null = null
                try {
                    // Vectorize using the same text used for evaluation (may be truncated to fit provider limits).
                    const textContent = evaluationTruncation ? truncateForEvaluation(textContentForEvaluation, evaluationTruncation.truncatedChars).text : textContentForEvaluation
                    vectorizationResult = await vectorizeSubmission(textContent, {
                        novelty: evaluation.novelty,
                        density: evaluation.density,
                        coherence: evaluation.coherence,
                        alignment: evaluation.alignment,
                        pod_score: evaluation.pod_score,
                    })
                    debug('SubmitContribution', 'Vectorization complete', {
                        embeddingDimensions: vectorizationResult.embedding.length,
                        vector: vectorizationResult.vector,
                        model: vectorizationResult.embeddingModel,
                    })
                } catch (vectorError) {
                    debugError('SubmitContribution', 'Failed to generate vectorization', vectorError)
                    // Continue without vectorization - submission still succeeds
                }
                
                // Update contribution with evaluation results and vector data
                try {
                    await db
                        .update(contributionsTable)
                        .set({
                            status: qualified ? 'qualified' : 'unqualified',
                            metals: evaluation.metals || [],
                            metadata: {
                                coherence: evaluation.coherence,
                                density: evaluation.density,
                                redundancy: evaluation.redundancy,
                                pod_score: evaluation.pod_score,
                                novelty: evaluation.novelty,
                                alignment: evaluation.alignment,
                                classification: evaluation.classification || [],
                                redundancy_analysis: evaluation.redundancy_analysis,
                                metal_justification: evaluation.metal_justification,
                                founder_certificate: evaluation.founder_certificate,
                                homebase_intro: evaluation.homebase_intro,
                                tokenomics_recommendation: evaluation.tokenomics_recommendation,
                                qualified_founder: qualified,
                                qualified_epoch: openEpochUsed || evaluation.qualified_epoch || null, // Store the open epoch used to qualify
                                allocation_status: 'pending_admin_approval', // Token allocation requires admin approval
                                evaluation_truncated: evaluationTruncation ? true : false,
                                evaluation_truncated_chars: evaluationTruncation?.truncatedChars ?? null,
                                evaluation_original_chars: evaluationTruncation?.originalChars ?? null,
                                // Store detailed Grok evaluation details for detailed report
                                grok_evaluation_details: {
                                    base_novelty: evaluation.base_novelty,
                                    base_density: evaluation.base_density,
                                    redundancy_penalty_percent: evaluation.redundancy_penalty_percent,
                                    density_penalty_percent: evaluation.density_penalty_percent,
                                    full_evaluation: evaluation, // Store full evaluation object
                                    raw_grok_response: (evaluation as any).raw_grok_response || null // Store raw Grok API response text/markdown
                                }
                            },
                            // Store vector embedding and 3D coordinates if available
                            embedding: vectorizationResult ? vectorizationResult.embedding : null,
                            vector_x: vectorizationResult ? vectorizationResult.vector.x.toString() : null,
                            vector_y: vectorizationResult ? vectorizationResult.vector.y.toString() : null,
                            vector_z: vectorizationResult ? vectorizationResult.vector.z.toString() : null,
                            embedding_model: vectorizationResult ? vectorizationResult.embeddingModel : null,
                            vector_generated_at: vectorizationResult ? new Date() : null,
                            updated_at: new Date()
                        })
                        .where(eq(contributionsTable.submission_hash, submission_hash))
                } catch (updateError) {
                    debugError('SubmitContribution', 'Failed to update contribution with evaluation results', updateError)
                    // Don't fail the submission if update fails
                }
            
                // Extract archive data (abstract, formulas, constants) for permanent storage in log
                const { extractArchiveData } = await import('@/utils/archive/extract')
                const archiveData = extractArchiveData(textContentForStorage || '', title.trim())
                
                // Log evaluation completion with archive data in metadata
                try {
                    const evalLogId = crypto.randomUUID()
                    await db.insert(pocLogTable).values({
                        id: evalLogId,
                        submission_hash,
                        contributor: contributor || user.email,
                        event_type: 'evaluation_complete',
                        event_status: 'success',
                        title: title.trim(),
                        category: category || 'scientific',
                        evaluation_result: {
                            coherence: evaluation.coherence,
                            density: evaluation.density,
                            redundancy: evaluation.redundancy,
                            pod_score: evaluation.pod_score,
                            novelty: evaluation.novelty,
                            alignment: evaluation.alignment,
                            metals: evaluation.metals || [],
                            qualified,
                            qualified_founder: qualified,
                            classification: evaluation.classification || [],
                            redundancy_analysis: evaluation.redundancy_analysis,
                            metal_justification: evaluation.metal_justification
                        },
                        grok_api_response: {
                            full_evaluation: evaluation, // Store full evaluation object for debugging
                            scores_extracted: {
                                coherence: evaluation.coherence,
                                density: evaluation.density,
                                novelty: evaluation.novelty,
                                alignment: evaluation.alignment,
                                pod_score: evaluation.pod_score
                            }
                        },
                        response_data: {
                            success: true,
                            qualified,
                            evaluation
                        },
                        metadata: {
                            archive_data: {
                                abstract: archiveData.abstract,
                                formulas: archiveData.formulas,
                                constants: archiveData.constants
                            }
                        },
                        processing_time_ms: Date.now() - startTime,
                        created_at: new Date()
                    })
                } catch (logError) {
                    debugError('SubmitContribution', 'Failed to log evaluation', logError)
                    // Don't fail submission if logging fails
                }
                
                debug('SubmitContribution', 'Evaluation completed successfully', {
                    submission_hash,
                    qualified,
                    pod_score: evaluation.pod_score
                })
            } catch (error) {
                evaluationError = error instanceof Error ? error : new Error(String(error))
                debugError('SubmitContribution', 'Evaluation failed', evaluationError)
                // IMPORTANT: Do not mark as unqualified on evaluation failures.
                // Many failures are transient (provider token budget, timeouts, etc.). Keep as 'evaluating'
                // so the submission can be re-evaluated later.
                try {
                    await db
                        .update(contributionsTable)
                        .set({
                            status: 'evaluating',
                            metadata: {
                                evaluation_error: evaluationError.message,
                                evaluation_error_at: new Date().toISOString(),
                            } as any,
                            updated_at: new Date()
                        })
                        .where(eq(contributionsTable.submission_hash, submission_hash))
                } catch (updateError) {
                    debugError('SubmitContribution', 'Failed to update status after evaluation error', updateError)
                }
                
                // Log evaluation error
                try {
                    const errorLogId = crypto.randomUUID()
                    await db.insert(pocLogTable).values({
                        id: errorLogId,
                        submission_hash,
                        contributor: contributor || user.email,
                        event_type: 'evaluation_error',
                        event_status: 'error',
                        title: title.trim(),
                        error_message: evaluationError.message,
                        response_data: {
                            success: false,
                            error: evaluationError.message
                        },
                        created_at: new Date()
                    })
                } catch (logError) {
                    debugError('SubmitContribution', 'Failed to log evaluation error', logError)
                }
            }
        }
        
        // Always return success for submission, even if evaluation failed
        debug('SubmitContribution', 'Returning success response', {
            submission_hash,
            hasEvaluation: !!evaluation,
            hasError: !!evaluationError
        })
        
        return NextResponse.json({
            success: true,
            submission_hash,
            evaluation: evaluation ? {
                coherence: evaluation.coherence,
                density: evaluation.density,
                redundancy: evaluation.redundancy,
                novelty: evaluation.novelty,
                alignment: evaluation.alignment,
                metals: evaluation.metals || [],
                pod_score: evaluation.pod_score,
                qualified: evaluation.qualified,
                qualified_founder: evaluation.qualified,
                qualified_epoch: evaluation.qualified_epoch || null,
                classification: evaluation.classification || [],
                redundancy_analysis: evaluation.redundancy_analysis,
                metal_justification: evaluation.metal_justification,
                founder_certificate: evaluation.founder_certificate,
                homebase_intro: evaluation.homebase_intro,
                tokenomics_recommendation: evaluation.tokenomics_recommendation,
                allocation_status: 'pending_admin_approval', // Token allocation requires admin approval
                // Include base scores for debugging and fallback
                base_density: evaluation.base_density,
                base_novelty: evaluation.base_novelty,
                // Include detailed Grok evaluation details for detailed review
                grok_evaluation_details: {
                    base_novelty: evaluation.base_novelty,
                    base_density: evaluation.base_density,
                    redundancy_penalty_percent: evaluation.redundancy_penalty_percent,
                    density_penalty_percent: evaluation.density_penalty_percent,
                    full_evaluation: evaluation, // Include full evaluation object from Grok API
                    raw_grok_response: (evaluation as any).raw_grok_response || null // Include raw Grok API response text/markdown
                }
            } : null,
            evaluation_error: evaluationError ? toPublicEvaluationError(evaluationError.message) : null,
            evaluation_notice: evaluationNotice,
            status: evaluation ? (evaluation.qualified ? 'qualified' : 'unqualified') : 'evaluating',
            allocation_status: evaluation ? 'pending_admin_approval' : undefined,
            message: evaluation 
                ? (evaluationNotice ? `Contribution submitted and evaluated successfully. ${evaluationNotice}` : 'Contribution submitted and evaluated successfully')
                : evaluationError 
                    ? 'Contribution submitted successfully. Evaluation is queued and may complete shortly.'
                    : 'Contribution submitted successfully (evaluation pending)'
        })
    } catch (error) {
        debugError('SubmitContribution', 'Error submitting contribution', error)
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        
        // Log the full error for debugging
        console.error('SubmitContribution Error:', {
            message: errorMessage,
            stack: errorStack,
            error: error
        })
        
        // Return detailed error for debugging
        return NextResponse.json(
            { 
                error: 'Failed to submit contribution',
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' 
                    ? errorMessage 
                    : 'An error occurred while submitting. Please try again.',
                ...(process.env.NODE_ENV === 'development' ? {
                    stack: errorStack,
                    name: error instanceof Error ? error.name : undefined
                } : {})
            },
            { status: 500 }
        )
    }
}

