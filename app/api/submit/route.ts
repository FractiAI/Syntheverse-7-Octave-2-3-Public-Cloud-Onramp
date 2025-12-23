import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, pocLogTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'
import { evaluateWithGrok } from '@/utils/grok/evaluate'
import crypto from 'crypto'

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
        const text_content = formData.get('text_content') as string | null || ''
        const file = formData.get('file') as File | null
        
        if (!title || !title.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }
        
        if (!text_content || !text_content.trim()) {
            if (!file) {
                return NextResponse.json(
                    { error: 'Either text content or a file is required' },
                    { status: 400 }
                )
            }
        }
        
        // Check database connection
        if (!process.env.DATABASE_URL) {
            debugError('SubmitContribution', 'DATABASE_URL not configured', new Error('DATABASE_URL environment variable is missing'))
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            )
        }
        
        // Generate submission hash
        const submission_hash = crypto.randomBytes(16).toString('hex')
        
        // Calculate content hash
        const contentToHash = text_content || title
        const content_hash = crypto
            .createHash('sha256')
            .update(contentToHash.toLowerCase().trim())
            .digest('hex')
        
        // Handle file upload if present
        let pdf_path: string | null = null
        if (file) {
            // In production, you'd upload to Supabase Storage or S3
            // For now, we'll store the file name
            pdf_path = file.name
            debug('SubmitContribution', 'File received', { fileName: file.name, size: file.size })
        }
        
        const startTime = Date.now()
        
        // Insert contribution into database
        try {
            await db.insert(contributionsTable).values({
                submission_hash,
                title: title.trim(),
                contributor: contributor || user.email,
                content_hash,
                text_content: text_content?.trim() || null,
                pdf_path,
                status: 'draft',
                category: category || 'scientific',
                metals: [],
                metadata: {}
            })
        } catch (dbError) {
            debugError('SubmitContribution', 'Database insert error', dbError)
            throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
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
                    has_text_content: !!text_content,
                    has_file: !!file,
                    file_name: file?.name,
                    file_size: file?.size
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
        
        // Check if Grok API key is configured
        if (!process.env.NEXT_PUBLIC_GROK_API_KEY) {
            debug('SubmitContribution', 'GROK_API_KEY not configured, skipping evaluation')
            evaluationError = new Error('GROK_API_KEY not configured. Evaluation skipped.')
        } else {
            try {
                const textContent = text_content?.trim() || title.trim()
                debug('SubmitContribution', 'Starting Grok API evaluation', {
                    textLength: textContent.length,
                    title: title.trim()
                })
                evaluation = await evaluateWithGrok(textContent, title.trim(), category || undefined, submission_hash)
                
                // Use qualified status from evaluation
                const qualified = evaluation.qualified || (evaluation.pod_score >= 8000)
            
                // Update contribution with evaluation results
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
                                allocation_status: 'pending_admin_approval' // Token allocation requires admin approval
                            },
                            updated_at: new Date()
                        })
                        .where(eq(contributionsTable.submission_hash, submission_hash))
                } catch (updateError) {
                    debugError('SubmitContribution', 'Failed to update contribution with evaluation results', updateError)
                    // Don't fail the submission if update fails
                }
            
                // Log evaluation completion
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
                        response_data: {
                            success: true,
                            qualified,
                            evaluation
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
            
                // Update status to indicate evaluation error
                try {
                    await db
                        .update(contributionsTable)
                        .set({
                            status: 'draft', // Keep as draft if evaluation fails
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
                classification: evaluation.classification || [],
                redundancy_analysis: evaluation.redundancy_analysis,
                metal_justification: evaluation.metal_justification,
                founder_certificate: evaluation.founder_certificate,
                homebase_intro: evaluation.homebase_intro,
                tokenomics_recommendation: evaluation.tokenomics_recommendation
            } : null,
            evaluation_error: evaluationError ? evaluationError.message : null,
            status: evaluation ? (evaluation.qualified ? 'qualified' : 'unqualified') : 'draft',
            message: evaluation 
                ? 'Contribution submitted and evaluated successfully'
                : evaluationError 
                    ? `Contribution submitted successfully. Evaluation skipped: ${evaluationError.message}`
                    : 'Contribution submitted successfully'
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

