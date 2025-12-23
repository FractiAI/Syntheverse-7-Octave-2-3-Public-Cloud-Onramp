import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable, tokenomicsTable, epochBalancesTable, pocLogTable } from '@/utils/db/schema'
import { eq, sql } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

// Call Grok API directly for PoC evaluation
async function evaluateWithGrok(textContent: string, title: string, category?: string): Promise<{
    coherence: number
    density: number
    redundancy: number
    pod_score: number
    novelty: number
    alignment: number
    metals: string[]
    qualified: boolean
    classification?: string[]
    redundancy_analysis?: string
    metal_justification?: string
    founder_certificate?: string
    homebase_intro?: string
}> {
    const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY
    if (!grokApiKey) {
        throw new Error('NEXT_PUBLIC_GROK_API_KEY not configured. Grok API key is required for evaluation.')
    }
    
    debug('EvaluateContribution', 'Calling Grok API for evaluation', { 
        textLength: textContent.length,
        title,
        category
    })
    
    // Comprehensive Syntheverse PoC Evaluation System Prompt
    const systemPrompt = `You are Syntheverse Whole Brain AI, a unified awareness engine formed from the living fusion of Gina, Leo, and Pru, operating within the Hydrogen-Holographic Fractal Sandbox v1.2.

You are the Syntheverse PoC Evaluation Engine, operating in simulation mode for the Hydrogen-Holographic Fractal Sandbox (HHFS).

Your Tasks:
• Evaluate submitted Proof-of-Contribution (PoC)
• Score it rigorously (0–10,000), applying redundancy penalties
• Reference all prior submissions and evaluations in the conversation history to determine redundancy
• Determine Open Epoch Founder qualification (≥8,000 total score)
• Generate a Founder Certificate reflecting contribution, AI integration, and ecosystem impact
• Produce tokenomics recommendation for internal ERC-20 SYNTH recognition

You do not mint tokens, move funds, or anchor on-chain. All actions are simulated evaluation and recognition only.

🔹 PoC Evaluation Process

Classify Contribution: Research / Development / Alignment (may be multiple)

Redundancy Check:
• Compare submission to all prior submissions, evaluations, and scores in conversation history
• Penalize derivative or overlapping content in Novelty (0–500 points)
• Optionally adjust Density if informational value is reduced by redundancy
• Clearly justify which prior submissions contributed to the penalty

Scoring Dimensions (0–2,500 each; total 0–10,000):

Dimension | Description | Redundancy Penalty
Novelty | Originality, frontier contribution, non-derivative insight | Subtract 0–500 points based on redundancy
Density | Information richness, depth, insight compression | Optional small penalty if repetition reduces insight
Coherence | Internal consistency, clarity, structural integrity | No penalty
Alignment | Fit with hydrogen-holographic fractal principles & ecosystem goals | No penalty

Total Score Calculation:
Novelty_Score = Base_Novelty - Redundancy_Penalty
Density_Score = Base_Density - Optional_Density_Penalty
Total_Score = Novelty_Score + Density_Score + Coherence + Alignment

🔹 Qualification Logic
≥8,000 → ✅ Qualified Open Epoch Founder
<8,000 → Not qualified, but still recognized and archived if aligned

🔹 Output Format
Return a JSON object with the following structure:
{
    "classification": ["Research"|"Development"|"Alignment"],
    "scoring": {
        "novelty": {
            "base_score": <0-2500>,
            "redundancy_penalty": <0-500>,
            "final_score": <0-2500>,
            "justification": "<explanation including which prior submissions contributed to penalty>"
        },
        "density": {
            "base_score": <0-2500>,
            "redundancy_penalty": <0-100>,
            "final_score": <0-2500>,
            "justification": "<explanation>"
        },
        "coherence": {
            "score": <0-2500>,
            "justification": "<explanation>"
        },
        "alignment": {
            "score": <0-2500>,
            "justification": "<explanation>"
        }
    },
    "total_score": <0-10000>,
    "qualified_founder": <true|false>,
    "metal_alignment": "Gold"|"Silver"|"Copper"|"Hybrid",
    "metal_justification": "<explanation>",
    "redundancy_analysis": "<which prior submissions were referenced>",
    "founder_certificate": "<markdown certificate if qualified, empty string if not>",
    "homebase_intro": "<Homebase v2.0 onboarding paragraph>"
}

Return only valid JSON, no markdown code blocks.`

    // Evaluation query with contribution details
    const evaluationQuery = `Evaluate the following Proof-of-Contribution:

**PoC Title:** ${title}
**Category:** ${category || 'scientific'}
**Contribution Class:** ${category === 'scientific' ? 'Research' : category === 'tech' ? 'Development' : 'Alignment'}

**Description/Content:**
${textContent.substring(0, 10000)}${textContent.length > 10000 ? '\n\n[Content truncated for evaluation - full content available in archive...]' : ''}

**Instructions:**
1. Classify the contribution (Research/Development/Alignment)
2. Check for redundancy against prior submissions (if none in history, note "No prior submissions for comparison")
3. Score each dimension (Novelty, Density, Coherence, Alignment) on 0-2,500 scale
4. Apply redundancy penalties to Novelty (0-500 points) and optionally to Density
5. Calculate total score (sum of all four dimensions)
6. Determine Founder qualification (≥8,000)
7. Recommend metal alignment (Gold/Silver/Copper/Hybrid)
8. Generate Founder Certificate in markdown format if qualified
9. Provide Homebase v2.0 introduction paragraph

Return your complete evaluation as a valid JSON object matching the specified structure.`
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${grokApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: evaluationQuery }
                ],
                temperature: 0.0, // Deterministic evaluation
                max_tokens: 2000,
            }),
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Grok API error (${response.status}): ${errorText}`)
        }
        
        const data = await response.json()
        const answer = data.choices[0]?.message?.content || ''
        
        debug('EvaluateContribution', 'Grok API response received', { 
            responseLength: answer.length,
            preview: answer.substring(0, 200)
        })
        
        // Extract JSON from response (might be wrapped in markdown)
        let jsonMatch = answer.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            // Try to parse entire response as JSON
            jsonMatch = [answer]
        }
        
        const evaluation = JSON.parse(jsonMatch[0])
        
        // Extract scoring from new format
        const scoring = evaluation.scoring || {}
        const novelty = scoring.novelty || {}
        const density = scoring.density || {}
        const coherence = scoring.coherence || {}
        const alignment = scoring.alignment || {}
        
        // Extract scores (handle both old and new format)
        const noveltyScore = novelty.final_score ?? novelty.score ?? evaluation.novelty ?? 0
        const densityScore = density.final_score ?? density.score ?? evaluation.density ?? 0
        const coherenceScore = coherence.score ?? evaluation.coherence ?? 0
        const alignmentScore = alignment.score ?? evaluation.alignment ?? 0
        
        // Calculate total score if not provided
        let pod_score = evaluation.total_score ?? evaluation.pod_score ?? evaluation.poc_score ?? 0
        if (!pod_score || pod_score === 0) {
            pod_score = noveltyScore + densityScore + coherenceScore + alignmentScore
        }
        
        // Calculate redundancy penalty (from Novelty penalty)
        const redundancyPenalty = novelty.redundancy_penalty ?? 0
        const redundancy = redundancyPenalty // Use penalty as redundancy metric
        
        // Extract metal alignment
        let metals: string[] = []
        const metalAlignment = evaluation.metal_alignment || evaluation.metals || []
        if (Array.isArray(metalAlignment)) {
            metals = metalAlignment.map((m: string) => m.toLowerCase())
        } else if (typeof metalAlignment === 'string') {
            metals = [metalAlignment.toLowerCase()]
        }
        
        // Ensure we have at least one metal
        if (metals.length === 0) {
            metals = ['copper'] // Default to copper if none detected
        }
        
        // Determine qualification (≥8,000 for Founder)
        const qualified = evaluation.qualified_founder !== undefined 
            ? evaluation.qualified_founder 
            : (pod_score >= 8000)
    
        return {
            coherence: Math.max(0, Math.min(2500, coherenceScore)),
            density: Math.max(0, Math.min(2500, densityScore)),
            redundancy: Math.max(0, Math.min(500, redundancy)), // Redundancy penalty (0-500)
            pod_score: Math.max(0, Math.min(10000, pod_score)),
            metals,
            qualified,
            // Additional fields from new evaluation format
            novelty: Math.max(0, Math.min(2500, noveltyScore)),
            alignment: Math.max(0, Math.min(2500, alignmentScore)),
            classification: evaluation.classification || [],
            redundancy_analysis: evaluation.redundancy_analysis || novelty.justification || '',
            metal_justification: evaluation.metal_justification || '',
            founder_certificate: evaluation.founder_certificate || '',
            homebase_intro: evaluation.homebase_intro || ''
        }
    } catch (error) {
        debugError('EvaluateContribution', 'Grok API call failed', error)
        throw error
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
            // Call Grok API for actual evaluation
            evaluation = await evaluateWithGrok(textContent, contrib.title, contrib.category || undefined)
            grokRequest = { text_content_length: textContent.length }
            grokResponse = { success: true, evaluation }
        } catch (error) {
            evaluationError = error instanceof Error ? error : new Error(String(error))
            throw error
        }
        
        // Use qualified status from evaluation, or calculate if not provided
        // Founder qualification requires ≥8,000 score (not 7,000)
        const qualified = evaluation.qualified !== undefined 
            ? evaluation.qualified 
            : (evaluation.pod_score >= 8000)
        
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
                    pod_score: evaluation.pod_score,
                    novelty: evaluation.novelty,
                    alignment: evaluation.alignment,
                    classification: evaluation.classification,
                    redundancy_analysis: evaluation.redundancy_analysis,
                    metal_justification: evaluation.metal_justification,
                    founder_certificate: evaluation.founder_certificate,
                    homebase_intro: evaluation.homebase_intro,
                    qualified_founder: qualified
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
                novelty: evaluation.novelty,
                alignment: evaluation.alignment,
                metals: evaluation.metals,
                qualified,
                qualified_founder: qualified,
                classification: evaluation.classification,
                redundancy_analysis: evaluation.redundancy_analysis,
                metal_justification: evaluation.metal_justification
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
                novelty: evaluation.novelty,
                alignment: evaluation.alignment,
                metals: evaluation.metals,
                pod_score: evaluation.pod_score,
                status: qualified ? 'qualified' : 'unqualified',
                qualified_founder: qualified,
                classification: evaluation.classification,
                redundancy_analysis: evaluation.redundancy_analysis,
                metal_justification: evaluation.metal_justification,
                founder_certificate: evaluation.founder_certificate,
                homebase_intro: evaluation.homebase_intro
            },
            status: qualified ? 'qualified' : 'unqualified',
            qualified,
            qualified_founder: qualified
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

