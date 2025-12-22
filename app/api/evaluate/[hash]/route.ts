import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, tokenomicsTable, epochBalancesTable, pocLogTable } from '@/utils/db/schema'
import { eq, sql } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

// GROK API integration for evaluation
async function evaluateWithGrok(textContent: string): Promise<{
    coherence: number
    density: number
    redundancy: number
    pod_score: number
    metals: string[]
}> {
    const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY
    if (!grokApiKey) {
        throw new Error('GROK API key not configured')
    }
    
    // TODO: Implement actual GROK API call for evaluation
    // For now, return mock evaluation
    // In production, this would call the GROK API with the text content
    
    return {
        coherence: Math.floor(Math.random() * 5000) + 5000, // 5000-10000
        density: Math.floor(Math.random() * 5000) + 5000,
        redundancy: Math.floor(Math.random() * 3000), // 0-3000 (lower is better)
        pod_score: Math.floor(Math.random() * 5000) + 5000,
        metals: ['gold'] // Simplified for now
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('EvaluateContribution', 'Evaluation request received', { submissionHash })
    
    try {
        // Get contribution
        const contribution = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contribution || contribution.length === 0) {
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contribution[0]
        const startTime = Date.now()
        
        // Log evaluation start
        const evaluationStartLogId = crypto.randomUUID()
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
                has_text_content: !!contrib.text_content
            },
            created_at: new Date()
        })
        
        // Update status to evaluating
        await db
            .update(contributionsTable)
            .set({ 
                status: 'evaluating',
                updated_at: new Date()
            })
            .where(eq(contributionsTable.submission_hash, submissionHash))
        
        // Perform evaluation with GROK
        const textContent = contrib.text_content || contrib.title
        let grokRequest: any = null
        let grokResponse: any = null
        let evaluation: any = null
        let evaluationError: Error | null = null
        
        try {
            // TODO: Make actual GROK API call here
            // For now, using mock evaluation
            evaluation = await evaluateWithGrok(textContent)
            grokRequest = { text_content_length: textContent.length }
            grokResponse = { success: true, evaluation }
        } catch (error) {
            evaluationError = error instanceof Error ? error : new Error(String(error))
            throw error
        }
        
        // Determine if qualified (simplified logic)
        const qualified = evaluation.pod_score >= 7000 && evaluation.redundancy < 2000
        
        // Update contribution with evaluation results
        await db
            .update(contributionsTable)
            .set({
                status: qualified ? 'qualified' : 'unqualified',
                metals: evaluation.metals,
                metadata: {
                    coherence: evaluation.coherence,
                    density: evaluation.density,
                    redundancy: evaluation.redundancy,
                    pod_score: evaluation.pod_score
                },
                updated_at: new Date()
            })
            .where(eq(contributionsTable.submission_hash, submissionHash))
        
        // If qualified, create allocation (simplified for now)
        if (qualified) {
            // TODO: Implement proper token allocation logic
            // For now, just mark as qualified
        }
        
        const processingTime = Date.now() - startTime
        
        // Log successful evaluation
        const evaluationCompleteLogId = crypto.randomUUID()
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
                metals: evaluation.metals,
                qualified
            },
            grok_api_request: grokRequest,
            grok_api_response: grokResponse,
            response_data: {
                success: true,
                qualified,
                evaluation
            },
            processing_time_ms: processingTime,
            created_at: new Date()
        })
        
        // Log status change
        const statusChangeLogId = crypto.randomUUID()
        await db.insert(pocLogTable).values({
            id: statusChangeLogId,
            submission_hash: submissionHash,
            contributor: contrib.contributor,
            event_type: 'status_change',
            event_status: 'success',
            title: contrib.title,
            request_data: { old_status: 'evaluating', new_status: qualified ? 'qualified' : 'unqualified' },
            response_data: { status: qualified ? 'qualified' : 'unqualified' },
            created_at: new Date()
        })
        
        debug('EvaluateContribution', 'Evaluation completed', {
            submissionHash,
            qualified,
            evaluation
        })
        
        return NextResponse.json({
            success: true,
            submission_hash: submissionHash,
            evaluation: {
                coherence: evaluation.coherence,
                density: evaluation.density,
                redundancy: evaluation.redundancy,
                metals: evaluation.metals,
                pod_score: evaluation.pod_score,
                status: qualified ? 'qualified' : 'unqualified'
            },
            status: qualified ? 'qualified' : 'unqualified',
            qualified
        })
    } catch (error) {
        debugError('EvaluateContribution', 'Error evaluating contribution', error)
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        
        // Get contribution for logging
        let contributor = 'unknown'
        let title = 'unknown'
        try {
            const contrib = await db
                .select()
                .from(contributionsTable)
                .where(eq(contributionsTable.submission_hash, submissionHash))
                .limit(1)
            if (contrib && contrib.length > 0) {
                contributor = contrib[0].contributor
                title = contrib[0].title
            }
        } catch (e) {
            // Ignore error getting contribution
        }
        
        // Log evaluation error
        const errorLogId = crypto.randomUUID()
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
                error: errorMessage
            },
            created_at: new Date()
        })
        
        // Update status to unqualified on error
        try {
            await db
                .update(contributionsTable)
                .set({ 
                    status: 'unqualified',
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
            
            // Log status change to unqualified
            const statusChangeLogId = crypto.randomUUID()
            await db.insert(pocLogTable).values({
                id: statusChangeLogId,
                submission_hash: submissionHash,
                contributor,
                event_type: 'status_change',
                event_status: 'success',
                title,
                request_data: { old_status: 'evaluating', new_status: 'unqualified', reason: 'evaluation_error' },
                response_data: { status: 'unqualified' },
                created_at: new Date()
            })
        } catch (updateError) {
            debugError('EvaluateContribution', 'Error updating status', updateError)
        }
        
        return NextResponse.json(
            { 
                success: false,
                error: errorMessage,
                submission_hash: submissionHash,
                status: 'unqualified',
                qualified: false
            },
            { status: 500 }
        )
    }
}

