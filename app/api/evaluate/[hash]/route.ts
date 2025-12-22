import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { eq, sql } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

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
        const evaluation = await evaluateWithGrok(textContent)
        
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
        
        // Update status to unqualified on error
        try {
            await db
                .update(contributionsTable)
                .set({ 
                    status: 'unqualified',
                    updated_at: new Date()
                })
                .where(eq(contributionsTable.submission_hash, submissionHash))
        } catch (updateError) {
            debugError('EvaluateContribution', 'Error updating status', updateError)
        }
        
        return NextResponse.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : 'Failed to evaluate contribution',
                submission_hash: submissionHash,
                status: 'unqualified',
                qualified: false
            },
            { status: 500 }
        )
    }
}

