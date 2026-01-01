import { debug, debugError } from '@/utils/debug'
import { db } from '@/utils/db/db'
import { contributionsTable, tokenomicsTable, epochMetalBalancesTable } from '@/utils/db/schema'
import { ne, sql } from 'drizzle-orm'
import { qualifyEpoch } from '@/utils/epochs/qualification'
import { 
    vectorizeSubmission, 
    formatArchivedVectors, 
    calculateVectorRedundancy,
    Vector3D 
} from '@/utils/vectors'
import { SYNTHEVERSE_SYSTEM_PROMPT } from '@/utils/grok/system-prompt'

interface ArchivedPoC {
    submission_hash: string
    title: string
    contributor: string
    category: string | null
    text_content: string | null
    status: string
    metals: string[] | null
    metadata: any
    pod_score?: number
    coherence?: number
    density?: number
    novelty?: number
    alignment?: number
    created_at: Date | null
}

interface TokenomicsInfo {
    current_epoch: string
    epoch_balances: Record<string, number>
    total_coherence_density: number
    founder_halving_count: number
    epoch_progression: Record<string, boolean>
}

// Call Grok API directly for PoC evaluation
export async function evaluateWithGrok(
    textContent: string, 
    title: string, 
    category?: string,
    excludeHash?: string
): Promise<{
    coherence: number
    density: number
    redundancy: number
    pod_score: number
    novelty: number
    alignment: number
    metals: string[]
    qualified: boolean
    qualified_epoch?: string
    classification?: string[]
    redundancy_analysis?: string
    metal_justification?: string
    founder_certificate?: string
    homebase_intro?: string
    tokenomics_recommendation?: {
        eligible_epochs?: string[]
        suggested_allocation?: number
        tier_multiplier?: number
        epoch_distribution?: Record<string, number>
        allocation_notes?: string
        requires_admin_approval?: boolean
    }
    base_novelty?: number
    base_density?: number
    redundancy_overlap_percent?: number
    raw_grok_response?: string
}> {
    const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY
    if (!grokApiKey) {
        throw new Error('NEXT_PUBLIC_GROK_API_KEY not configured. Grok API key is required for evaluation.')
    }
    
    debug('EvaluateWithGrok', 'Calling Grok API for evaluation', { 
        textLength: textContent.length,
        title,
        category,
        excludeHash
    })
    
    // Extract archive data from current submission for matching
    const { extractArchiveData } = await import('@/utils/archive/extract')
    const currentArchiveData = extractArchiveData(textContent, title)
    
    // Generate vector embedding and 3D coordinates for current submission
    let currentVectorization: { embedding: number[], vector: Vector3D } | null = null
    try {
        debug('EvaluateWithGrok', 'Generating vector embedding and 3D coordinates')
        const vectorization = await vectorizeSubmission(textContent)
        currentVectorization = {
            embedding: vectorization.embedding,
            vector: vectorization.vector,
        }
        debug('EvaluateWithGrok', 'Vectorization complete', {
            embeddingDimensions: vectorization.embeddingDimensions,
            vector: vectorization.vector,
            model: vectorization.embeddingModel,
        })
    } catch (error) {
        debugError('EvaluateWithGrok', 'Failed to generate vectorization', error)
        // Continue without vectorization - will use text-based redundancy
    }
    
    // Find top 3 matching archived PoCs using abstract, formulas, constants, and vectors
    let top3Matches: Array<{
        submission_hash: string
        title: string
        abstract: string | null
        formulas: string[] | null
        constants: string[] | null
        similarity_score: number
        vector_x?: number | null
        vector_y?: number | null
        vector_z?: number | null
    }> = []
    
    // Fetch archived PoCs with vector data for redundancy checking and context
    let archivedPoCs: ArchivedPoC[] = []
    let archivedVectors: Array<{
        submission_hash: string
        title: string
        embedding?: number[] | null
        vector_x?: number | null
        vector_y?: number | null
        vector_z?: number | null
        metadata?: any
    }> = []
    
    try {
        // First, generate vector for current submission if not already done
        const currentVector = currentVectorization ? {
            x: currentVectorization.vector.x,
            y: currentVectorization.vector.y,
            z: currentVectorization.vector.z
        } : null
        
        // Find top 3 matches using archive data (reduced from 9 to reduce token usage)
        const { findTop3Matches } = await import('@/utils/archive/find-matches')
        top3Matches = await findTop3Matches(
            currentArchiveData.abstract,
            currentArchiveData.formulas,
            currentArchiveData.constants,
            currentVector,
            excludeHash
        )
        
        debug('EvaluateWithGrok', 'Found top 3 matches', {
            matchCount: top3Matches.length,
            topScore: top3Matches[0]?.similarity_score || 0
        })
        
        // Also fetch all contributions for redundancy calculation (legacy support)
        const allContributions = await db
            .select({
                submission_hash: contributionsTable.submission_hash,
                title: contributionsTable.title,
                contributor: contributionsTable.contributor,
                category: contributionsTable.category,
                text_content: contributionsTable.text_content,
                status: contributionsTable.status,
                metals: contributionsTable.metals,
                metadata: contributionsTable.metadata,
                embedding: contributionsTable.embedding,
                vector_x: contributionsTable.vector_x,
                vector_y: contributionsTable.vector_y,
                vector_z: contributionsTable.vector_z,
                created_at: contributionsTable.created_at,
            })
            .from(contributionsTable)
            .where(excludeHash ? ne(contributionsTable.submission_hash, excludeHash) : undefined)
            .orderBy(contributionsTable.created_at)
        
        archivedPoCs = allContributions.map(contrib => ({
            submission_hash: contrib.submission_hash,
            title: contrib.title,
            contributor: contrib.contributor,
            category: contrib.category,
            text_content: contrib.text_content,
            status: contrib.status,
            metals: contrib.metals as string[] | null,
            metadata: contrib.metadata || {},
            pod_score: (contrib.metadata as any)?.pod_score,
            coherence: (contrib.metadata as any)?.coherence,
            density: (contrib.metadata as any)?.density,
            novelty: (contrib.metadata as any)?.novelty,
            alignment: (contrib.metadata as any)?.alignment,
            created_at: contrib.created_at
        }))
        
        // Store vector data separately for redundancy calculations
        archivedVectors = allContributions.map(contrib => ({
            submission_hash: contrib.submission_hash,
            title: contrib.title,
            embedding: contrib.embedding as number[] | null,
            vector_x: contrib.vector_x ? Number(contrib.vector_x) : null,
            vector_y: contrib.vector_y ? Number(contrib.vector_y) : null,
            vector_z: contrib.vector_z ? Number(contrib.vector_z) : null,
            metadata: contrib.metadata || {},
        }))
        
        debug('EvaluateWithGrok', 'Fetched archived PoCs', { 
            count: archivedPoCs.length,
            withVectors: archivedVectors.filter(v => v.vector_x !== null).length,
            withEmbeddings: archivedVectors.filter(v => v.embedding).length,
        })
    } catch (error) {
        debugError('EvaluateWithGrok', 'Failed to fetch archived PoCs', error)
        // Continue without archived PoCs if fetch fails
    }
    
    // CRITICAL: Detect if this submission defines the Syntheverse sandbox itself
    // 
    // Logic: Compare this submission to:
    // 1. The Syntheverse sandbox definition (foundational submission)
    // 2. Prior submissions (archived PoCs)
    //
    // If this is the FIRST submission (no archived PoCs exist), it defines the sandbox.
    // All subsequent submissions are compared against the sandbox definition AND prior submissions.
    const isFirstSubmission = archivedVectors.length === 0
    const isSeedSubmission = isFirstSubmission  // First submission = defines the sandbox
    
    debug('EvaluateWithGrok', 'Submission comparison context', {
        isFirstSubmission,
        isSeedSubmission,
        archivedCount: archivedVectors.length,
        title,
        comparisonContext: isFirstSubmission
            ? 'FIRST SUBMISSION - Defines the Syntheverse sandbox itself'
            : `Subsequent submission - Will be compared to sandbox definition + ${archivedVectors.length} prior submission(s)`
    })
    
    // Calculate actual vector-based redundancy if we have current vectorization
    // Seed submissions always have 0% redundancy (they define the system)
    let calculatedRedundancy: {
        overlap_percent: number
        penalty_percent: number
        bonus_multiplier: number
        similarity_score: number
        closest_vectors: Array<{ hash: string, title: string, similarity: number, distance: number }>
        analysis: string
    } | null = null
    
    if (isSeedSubmission) {
        calculatedRedundancy = {
            overlap_percent: 0,
            penalty_percent: 0,
            bonus_multiplier: 1,
            similarity_score: 0,
            closest_vectors: [],
            analysis: 'This is the FIRST submission that defines the Syntheverse sandbox itself. Redundancy is 0% because nothing exists to be redundant with - this submission establishes the framework everything else operates within.',
        }
        debug('EvaluateWithGrok', 'FIRST SUBMISSION detected - setting redundancy to 0% (defines the sandbox)')
    } else if (currentVectorization && archivedVectors.length > 0) {
        // Compare this submission to the Syntheverse sandbox + prior submissions
        try {
            const formattedArchivedVectors = formatArchivedVectors(archivedVectors)
            calculatedRedundancy = await calculateVectorRedundancy(
                textContent,
                currentVectorization.embedding,
                currentVectorization.vector,
                formattedArchivedVectors  // Includes sandbox definition (first submission) + all prior submissions
            )
            debug('EvaluateWithGrok', 'Calculated redundancy by comparing to sandbox + prior submissions', {
                comparisonTargets: archivedVectors.length,
                note: 'Includes Syntheverse sandbox definition (first submission) + all prior submissions',
                overlap_percent: calculatedRedundancy.overlap_percent,
                penalty_percent: calculatedRedundancy.penalty_percent,
                bonus_multiplier: calculatedRedundancy.bonus_multiplier,
                similarity_score: calculatedRedundancy.similarity_score,
                closest_count: calculatedRedundancy.closest_vectors.length,
            })
        } catch (error) {
            debugError('EvaluateWithGrok', 'Failed to calculate vector redundancy', error)
            // Continue without calculated redundancy - Grok will estimate
        }
    }
    
    // Fetch tokenomics information
    let tokenomicsInfo: TokenomicsInfo | null = null
    try {
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .limit(1)
        
        if (tokenomics && tokenomics.length > 0) {
            const tk = tokenomics[0]
            const epochMetalBalances = await db
                .select()
                .from(epochMetalBalancesTable)
            
            // Calculate total coherence density from contributions metadata
            const allContribs = await db
                .select({ metadata: contributionsTable.metadata })
                .from(contributionsTable)
            
            let totalCoherenceDensity = 0
            for (const contrib of allContribs) {
                const metadata = contrib.metadata as any
                if (metadata?.coherence && metadata?.density) {
                    totalCoherenceDensity += (metadata.coherence * metadata.density) / 1000
                }
            }
            
            // Aggregate per-epoch total balances (sum of metal pools)
            const epochTotals: Record<string, number> = {}
            for (const row of epochMetalBalances) {
                const epoch = String(row.epoch).toLowerCase().trim()
                epochTotals[epoch] = (epochTotals[epoch] || 0) + Number(row.balance || 0)
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
                    ecosystem: false
                }
            }
            
            debug('EvaluateWithGrok', 'Fetched tokenomics info', tokenomicsInfo)
        }
    } catch (error) {
        debugError('EvaluateWithGrok', 'Failed to fetch tokenomics info', error)
        // Continue without tokenomics if fetch fails
    }
    
    // Use the canonical Syntheverse system prompt (intentionally long; required persona + schema).
    // Token-budget control is handled by shrinking user payload and truncating content when needed.
    const systemPrompt = SYNTHEVERSE_SYSTEM_PROMPT

    // Keep match context compact to avoid provider token budget errors.
    const archivedPoCsContext =
        top3Matches.length > 0
            ? `Top ${top3Matches.length} matching archived PoCs (redundancy context):
${top3Matches
    .map((match, idx) => {
        const abstract = (match.abstract || '').replace(/\s+/g, ' ').trim()
        const abstractPreview = abstract.length > 420 ? `${abstract.slice(0, 420)}…` : (abstract || 'N/A')
        return `${idx + 1}) ${match.title} [${match.submission_hash.substring(0, 8)}…] similarity=${(match.similarity_score * 100).toFixed(1)}% abstract="${abstractPreview}"`
    })
    .join('\n')}`
            : 'No prior archived PoCs found.'
    
    // Add calculated redundancy information if available (compact).
    const calculatedRedundancyContext = calculatedRedundancy
        ? `Vector redundancy (HHF 3D):
- overlap_percent=${calculatedRedundancy.overlap_percent.toFixed(1)}%
- penalty_percent=${calculatedRedundancy.penalty_percent.toFixed(1)}%
- bonus_multiplier=${calculatedRedundancy.bonus_multiplier.toFixed(3)}
- similarity=${(calculatedRedundancy.similarity_score * 100).toFixed(1)}%
- closest="${calculatedRedundancy.closest_vectors[0]?.title || 'N/A'}"`
        : ''

    // Format tokenomics context (condensed)
    const tokenomicsContext = tokenomicsInfo
        ? `**Tokenomics:** Epoch=${tokenomicsInfo.current_epoch}, Founder=${tokenomicsInfo.epoch_balances.founder?.toLocaleString() || 0} SYNTH. Thresholds: Founder≥8000, Pioneer≥6000, Community≥5000, Ecosystem≥4000.`
        : ''

    // Evaluation query with contribution details + minimal extra instructions.
    // IMPORTANT: We want a detailed narrative review AND parseable JSON (embedded).
    const evaluationQuery = `Evaluate this Proof-of-Contribution (PoC) using the system prompt rules.

Title: ${title}
Category: ${category || 'scientific'}
${tokenomicsContext ? `\n${tokenomicsContext}` : ''}

Submission Content:
${textContent}

${archivedPoCsContext ? `\n${archivedPoCsContext}` : ''}
${calculatedRedundancyContext ? `\n${calculatedRedundancyContext}` : ''}

Notes:
- ${isSeedSubmission ? 'This is the FIRST submission defining the Syntheverse sandbox. Redundancy penalty MUST be 0%.' : `This is NOT the first submission. Compare against the sandbox + archived PoCs (archived count: ${archivedVectors.length}).`}
- Apply redundancy penalty ONLY to the composite/total score (as specified in the system prompt).
- Output: Provide a detailed narrative review (clear + specific), AND include the REQUIRED JSON structure from the system prompt.
- The JSON may be placed in a markdown code block, but it MUST be valid parseable JSON.
`
    
    try {
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for Grok API
        
        // Groq on-demand tier enforces strict per-request token budgets (TPM). To avoid 413/TPM errors,
        // cap max_tokens and retry with smaller budgets if needed.
        const tokenBudgets = [1200, 800, 500]
        let response: Response | null = null
        let lastErrorText: string | null = null

        for (const maxTokens of tokenBudgets) {
            const attemptController = new AbortController()
            const attemptTimeoutId = setTimeout(() => attemptController.abort(), 30000)
        try {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                        max_tokens: maxTokens,
                }),
                    signal: attemptController.signal
            })
        } catch (fetchError) {
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error('Grok API request timed out after 30 seconds')
            }
            throw fetchError
            } finally {
                clearTimeout(attemptTimeoutId)
            }

            if (response.ok) break

            // Read error body for decision making
            lastErrorText = await response.text().catch(() => null)
            const isTokenBudgetError =
                response.status === 413 ||
                (lastErrorText || '').includes('Request too large') ||
                (lastErrorText || '').includes('TPM') ||
                (lastErrorText || '').includes('rate_limit_exceeded')

            debug('EvaluateWithGrok', 'Groq request failed, evaluating retry', {
                status: response.status,
                maxTokens,
                willRetry: isTokenBudgetError && maxTokens !== tokenBudgets[tokenBudgets.length - 1],
            })

            if (!isTokenBudgetError) {
                throw new Error(`Grok API error (${response.status}): ${lastErrorText || ''}`)
            }
        }

        clearTimeout(timeoutId)
        if (!response) {
            throw new Error('Grok API error: no response')
        }
        
        if (!response.ok) {
            throw new Error(
                `Grok API error (${response.status}): ${lastErrorText || 'Request failed (token budget exceeded)'}`
            )
        }
        
        const data = await response.json()
        const answer = data.choices[0]?.message?.content || ''
        
        debug('EvaluateWithGrok', 'Grok API response received', { 
            responseLength: answer.length,
            preview: answer.substring(0, 500),
            fullResponse: answer, // Log full response for debugging
            hasAnswer: !!answer,
            answerType: typeof answer
        })
        
        // Ensure answer is stored - log if empty
        if (!answer || answer.trim().length === 0) {
            debugError('EvaluateWithGrok', 'WARNING: Grok API response is empty', {
                dataKeys: Object.keys(data),
                choicesLength: data.choices?.length || 0,
                firstChoice: data.choices?.[0],
                fullResponse: JSON.stringify(data, null, 2).substring(0, 1000)
            })
        }
        
        const cleanJsonCandidate = (s: string): string => {
            let out = (s || '').trim()
            // Common invalid JSON issues from LLMs:
            // - thousands separators in numbers: 2,400 -> 2400
            out = out.replace(/(\d),(?=\d{3}\b)/g, '$1')
            // - trailing commas before closing braces/brackets
            out = out.replace(/,\s*([}\]])/g, '$1')
            return out
        }

        const tryParseJson = (candidate: string): any | null => {
            const cleaned = cleanJsonCandidate(candidate)
            try {
                const parsed = JSON.parse(cleaned)
                return parsed && typeof parsed === 'object' ? parsed : null
                    } catch {
                        return null
                    }
                }

        const parseNarrativeToJson = (raw: string): any | null => {
            const text = (raw || '').trim()
            if (!text) return null

            const normalizeNum = (v: string): number => {
                const cleaned = String(v || '').replace(/,/g, '').trim()
                const n = Number(cleaned)
                return Number.isFinite(n) ? n : 0
            }

            const extractScoreFromTable = (label: string): number => {
                const re = new RegExp(`\\|\\s*${label}\\s*\\|\\s*([\\d,\\.]+)\\s*\\|`, 'i')
                const m = text.match(re)
                return m?.[1] ? normalizeNum(m[1]) : 0
            }

            const novelty = extractScoreFromTable('Novelty')
            const density = extractScoreFromTable('Density')
            const coherence = extractScoreFromTable('Coherence')
            const alignment = extractScoreFromTable('Alignment')
            const total = novelty + density + coherence + alignment

            // Classification (best-effort)
            const classificationMatch =
                text.match(/PoC\s*Classification:\s*([^\n\r]+)/i) ||
                text.match(/Classification:\s*([^\n\r]+)/i)
            const classificationRaw = (classificationMatch?.[1] || '').trim()
            const classification = classificationRaw
                ? classificationRaw
                      .split(/[,\|\/]/g)
                      .map((s) => s.trim())
                      .filter(Boolean)
                : []

            // Metal alignment (best-effort)
            const metalMatch =
                text.match(/Metal\s*Alignment:\s*([A-Za-z]+)/i) ||
                text.match(/Primary:\s*(Gold|Silver|Copper|Hybrid)/i)
            const metal = (metalMatch?.[1] || '').trim()
            const metalAlignment = metal || 'Copper'

            const qualified_founder = total >= 8000

            // Use the narrative itself as a readable analysis fallback so the dashboard still has detail.
            const redundancy_analysis = text

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
                metals: [metalAlignment],
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
            }
        }

        const extractJsonCandidates = (raw: string): string[] => {
            const a = raw || ''
            const candidates: string[] = []
            candidates.push(a.trim())

            const jsonBlockMatch = a.match(/```json\s*([\s\S]*?)\s*```/i)
            if (jsonBlockMatch?.[1]) candidates.push(jsonBlockMatch[1].trim())

            const codeBlockMatch = a.match(/```\s*([\s\S]*?)\s*```/)
            if (codeBlockMatch?.[1]) candidates.push(codeBlockMatch[1].trim())

            const startMarker = a.indexOf('{')
            const endMarker = a.lastIndexOf('}')
                if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
                candidates.push(a.substring(startMarker, endMarker + 1))
            }

            const firstObjectMatch = a.match(/\{[\s\S]*\}/)
            if (firstObjectMatch?.[0]) candidates.push(firstObjectMatch[0])

            // De-dupe while preserving order
            const seen = new Set<string>()
            return candidates.filter((c) => {
                const key = c.trim()
                if (!key) return false
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
        }

        // Primary parse attempt (tolerant).
        let evaluation: any = null
        const candidates = extractJsonCandidates(answer)
        for (let i = 0; i < candidates.length; i++) {
            const parsed = tryParseJson(candidates[i])
            if (parsed) {
                evaluation = parsed
                debug('EvaluateWithGrok', 'JSON parsed successfully from Grok response', {
                    strategy: `candidate_${i + 1}/${candidates.length}`,
                        hasScoring: !!evaluation.scoring,
                        hasDensity: !!evaluation.density,
                        hasScoringDensity: !!evaluation.scoring?.density,
                        evaluationKeys: Object.keys(evaluation),
                    evaluationString: JSON.stringify(evaluation, null, 2).substring(0, 2000),
                    })
                    break
                }
        }

        // If no JSON was produced, do a single "repair" call to convert the narrative output into strict JSON.
        if (!evaluation) {
            debug('EvaluateWithGrok', 'No parseable JSON found. Attempting one-shot JSON repair call.', {
                responseLength: answer.length,
                preview: answer.substring(0, 400),
            })

            const repairSystemPrompt =
                'You are a strict JSON extraction and normalization engine. Output ONLY valid JSON. No markdown. No prose. No tables.'
            const repairUserPrompt = `Convert the following evaluation text into a single JSON object with EXACTLY these top-level keys:
classification, scoring, total_score, pod_score, qualified_founder, metal_alignment, metals, metal_justification, redundancy_analysis, founder_certificate, homebase_intro, tokenomics_recommendation.

Rules:
- All numeric values MUST be numbers (no commas like 2,400; use 2400).
- scoring must contain novelty, density, coherence, alignment.
- density must contain base_score, redundancy_penalty_percent, final_score, score, justification.
- tokenomics_recommendation must contain eligible_epochs, suggested_allocation, tier_multiplier, epoch_distribution, allocation_notes, requires_admin_approval.
- If a field is missing in the text, infer it conservatively (use 0, empty string, empty array, or {} as appropriate).

Text to convert:
${answer}`

            const repairBudgets = [800, 500]
            let repairedJsonText = ''
            let repairLastError: string | null = null
            for (const maxTokens of repairBudgets) {
                try {
                    const repairResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${grokApiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'llama-3.1-8b-instant',
                            messages: [
                                { role: 'system', content: repairSystemPrompt },
                                { role: 'user', content: repairUserPrompt },
                            ],
                            temperature: 0.0,
                            max_tokens: maxTokens,
                        }),
                    })
                    const repairText = repairResp.ok ? await repairResp.text() : await repairResp.text().catch(() => '')
                    if (!repairResp.ok) {
                        repairLastError = `Repair call failed (${repairResp.status}): ${repairText}`
                        continue
                    }
                    const repairData = JSON.parse(repairText)
                    repairedJsonText = repairData.choices?.[0]?.message?.content || ''
                    if (repairedJsonText.trim().length === 0) {
                        repairLastError = `Repair call returned empty content (max_tokens=${maxTokens})`
                        continue
                    }
                    break
                } catch (e) {
                    repairLastError = e instanceof Error ? e.message : String(e)
                continue
            }
        }
        
            if (repairedJsonText.trim().length > 0) {
                const repairCandidates = extractJsonCandidates(repairedJsonText)
                for (let i = 0; i < repairCandidates.length; i++) {
                    const parsed = tryParseJson(repairCandidates[i])
                    if (parsed) {
                        evaluation = parsed
                        debug('EvaluateWithGrok', 'JSON repair succeeded', {
                            repairedLength: repairedJsonText.length,
                            hasScoring: !!evaluation.scoring,
                        })
                        break
                    }
                }
            }

        if (!evaluation) {
                debugError('EvaluateWithGrok', 'JSON repair failed', {
                    repairLastError,
                responseLength: answer.length,
                responsePreview: answer.substring(0, 1000),
                    responseEnd: answer.substring(Math.max(0, answer.length - 500)),
                })
                // FINAL fallback: parse common narrative/table formats into the required JSON shape locally
                const narrativeParsed = parseNarrativeToJson(answer)
                if (narrativeParsed) {
                    evaluation = narrativeParsed
                    debug('EvaluateWithGrok', 'Parsed Grok narrative/table output into JSON locally', {
                        responseLength: answer.length,
                        total_score: evaluation.total_score,
                        qualified_founder: evaluation.qualified_founder,
                        metal_alignment: evaluation.metal_alignment,
                    })
                } else {
                    throw new Error(
                        `Failed to parse Grok response as JSON after tolerant parsing + repair. Response length: ${answer.length} chars. Preview: ${answer.substring(0, 200)}...`
                    )
                }
            }
        }
        
        // Debug: Log the full evaluation structure to understand Grok's response format
        debug('EvaluateWithGrok', 'Raw evaluation structure', {
            hasScoring: !!evaluation.scoring,
            hasDensity: !!evaluation.density,
            evaluationKeys: Object.keys(evaluation),
            evaluationString: JSON.stringify(evaluation, null, 2).substring(0, 1000) // First 1000 chars for debugging
        })
        
        // Extract scoring from new format - try multiple structures
        // IMPORTANT: Handle both object and number formats
        const scoring = evaluation.scoring || {}
        
        // Get raw values - could be objects or numbers
        const noveltyRaw = scoring.novelty ?? evaluation.novelty
        const densityRaw = scoring.density ?? evaluation.density
        const coherenceRaw = scoring.coherence ?? evaluation.coherence
        const alignmentRaw = scoring.alignment ?? evaluation.alignment
        
        // Extract base scores with extensive fallback options
        // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
        const baseNoveltyScore = 
            (typeof noveltyRaw === 'number' ? noveltyRaw : 0) ||
            (typeof noveltyRaw === 'object' && noveltyRaw !== null ? (noveltyRaw.base_score ?? noveltyRaw.final_score ?? noveltyRaw.score ?? 0) : 0) ||
            (typeof evaluation.novelty === 'number' ? evaluation.novelty : 0) ||
            (typeof evaluation.scoring?.novelty === 'number' ? evaluation.scoring.novelty : 0) ||
            (typeof evaluation.scoring?.novelty === 'object' ? (evaluation.scoring.novelty.base_score ?? evaluation.scoring.novelty.final_score ?? evaluation.scoring.novelty.score ?? 0) : 0) ||
            0
        
        const baseDensityScore = 
            (typeof densityRaw === 'number' ? densityRaw : 0) ||
            (typeof densityRaw === 'object' && densityRaw !== null ? (densityRaw.base_score ?? densityRaw.final_score ?? densityRaw.score ?? 0) : 0) ||
            (typeof evaluation.density === 'number' ? evaluation.density : 0) ||
            (typeof evaluation.scoring?.density === 'number' ? evaluation.scoring.density : 0) ||
            (typeof evaluation.scoring?.density === 'object' ? (evaluation.scoring.density.base_score ?? evaluation.scoring.density.final_score ?? evaluation.scoring.density.score ?? 0) : 0) ||
            0
        
        // Extract coherence score with extensive fallback (same as density)
        // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
        let finalCoherenceScore = 
            (typeof coherenceRaw === 'number' ? coherenceRaw : 0) ||
            (typeof coherenceRaw === 'object' && coherenceRaw !== null ? (coherenceRaw.score ?? coherenceRaw.final_score ?? coherenceRaw.base_score ?? 0) : 0) ||
            (typeof evaluation.coherence === 'number' ? evaluation.coherence : 0) ||
            (typeof evaluation.scoring?.coherence === 'number' ? evaluation.scoring.coherence : 0) ||
            (typeof evaluation.scoring?.coherence === 'object' ? (evaluation.scoring.coherence.score ?? evaluation.scoring.coherence.final_score ?? evaluation.scoring.coherence.base_score ?? 0) : 0) ||
            0
        
        // If still 0, try more locations for coherence
        if (finalCoherenceScore === 0) {
            finalCoherenceScore = evaluation.scoring?.coherence?.score ?? 
                                 evaluation.scoring?.coherence?.final_score ?? 
                                 evaluation.scoring?.coherence?.base_score ??
                                 evaluation.scoring?.coherence?.value ??
                                 evaluation.coherence_score ??
                                 evaluation.scores?.coherence ??
                                 0
        }
        
        // If still 0, try parsing as number from string
        if (finalCoherenceScore === 0 && typeof evaluation.coherence === 'string') {
            const parsed = parseFloat(evaluation.coherence)
            if (!isNaN(parsed)) {
                finalCoherenceScore = parsed
            }
        }
        
        // If still 0, try nested structures
        if (finalCoherenceScore === 0) {
            if (evaluation.evaluation?.coherence) {
                finalCoherenceScore = typeof evaluation.evaluation.coherence === 'number' ? evaluation.evaluation.coherence : 0
            } else if (evaluation.evaluation?.scoring?.coherence?.score) {
                finalCoherenceScore = evaluation.evaluation.scoring.coherence.score
            } else if (evaluation.evaluation?.scoring?.coherence?.final_score) {
                finalCoherenceScore = evaluation.evaluation.scoring.coherence.final_score
            }
        }
        
        let coherenceScore = finalCoherenceScore
        
        // Extract alignment score with extensive fallback (same as density)
        // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
        let finalAlignmentScore = 
            (typeof alignmentRaw === 'number' ? alignmentRaw : 0) ||
            (typeof alignmentRaw === 'object' && alignmentRaw !== null ? (alignmentRaw.score ?? alignmentRaw.final_score ?? alignmentRaw.base_score ?? 0) : 0) ||
            (typeof evaluation.alignment === 'number' ? evaluation.alignment : 0) ||
            (typeof evaluation.scoring?.alignment === 'number' ? evaluation.scoring.alignment : 0) ||
            (typeof evaluation.scoring?.alignment === 'object' ? (evaluation.scoring.alignment.score ?? evaluation.scoring.alignment.final_score ?? evaluation.scoring.alignment.base_score ?? 0) : 0) ||
            0
        
        // If still 0, try more locations for alignment
        if (finalAlignmentScore === 0) {
            finalAlignmentScore = evaluation.scoring?.alignment?.score ?? 
                                 evaluation.scoring?.alignment?.final_score ?? 
                                 evaluation.scoring?.alignment?.base_score ??
                                 evaluation.scoring?.alignment?.value ??
                                 evaluation.alignment_score ??
                                 evaluation.scores?.alignment ??
                                 0
        }
        
        // If still 0, try parsing as number from string
        if (finalAlignmentScore === 0 && typeof evaluation.alignment === 'string') {
            const parsed = parseFloat(evaluation.alignment)
            if (!isNaN(parsed)) {
                finalAlignmentScore = parsed
            }
        }
        
        // If still 0, try nested structures
        if (finalAlignmentScore === 0) {
            if (evaluation.evaluation?.alignment) {
                finalAlignmentScore = typeof evaluation.evaluation.alignment === 'number' ? evaluation.evaluation.alignment : 0
            } else if (evaluation.evaluation?.scoring?.alignment?.score) {
                finalAlignmentScore = evaluation.evaluation.scoring.alignment.score
            } else if (evaluation.evaluation?.scoring?.alignment?.final_score) {
                finalAlignmentScore = evaluation.evaluation.scoring.alignment.final_score
            }
        }
        
        let alignmentScore = finalAlignmentScore
        
        // Debug logging for score extraction - comprehensive
        debug('EvaluateWithGrok', 'Score extraction - initial values', {
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
        })
        
        // If some scores are 0 but not all, log warning
        if (baseNoveltyScore > 0 && (baseDensityScore === 0 || coherenceScore === 0 || alignmentScore === 0)) {
            debugError('EvaluateWithGrok', 'WARNING: Some scores extracted as 0', {
                baseNoveltyScore,
                baseDensityScore,
                coherenceScore,
                alignmentScore,
                evaluationStructure: JSON.stringify(evaluation, null, 2).substring(0, 3000),
                rawAnswer: answer.substring(0, 2000),
                noveltyRaw,
                densityRaw,
                coherenceRaw,
                alignmentRaw
            })
        }
        
        // If all scores are 0, log warning and try alternative extraction
        if (baseNoveltyScore === 0 && baseDensityScore === 0 && coherenceScore === 0 && alignmentScore === 0) {
            debugError('EvaluateWithGrok', 'WARNING: All scores extracted as 0', {
                evaluationStructure: JSON.stringify(evaluation, null, 2).substring(0, 3000),
                rawAnswer: answer.substring(0, 2000)
            })
        }
        
        // Extract overlap effect as percentage (-100 to +100)
        // Positive = bonus (sweet-spot), Negative = penalty (excessive overlap), Zero = neutral
        // Prefer calculated vector-based analysis if available, otherwise use Grok's estimate
        const redundancyOverlapPercent = calculatedRedundancy
            ? (calculatedRedundancy.bonus_multiplier - 1 - calculatedRedundancy.penalty_percent / 100) * 100
            : Math.max(-100, Math.min(100, Number(evaluation.redundancy_overlap_percent ?? evaluation.redundancy ?? 0)))
        
        // Use final_score if provided, otherwise use base score
        // Individual category scores are NOT penalized - penalty is applied to total composite score
        // Handle both object and number formats for novelty
        let finalNoveltyScore = 
            (typeof noveltyRaw === 'object' && noveltyRaw !== null ? (noveltyRaw.final_score ?? noveltyRaw.score ?? noveltyRaw.base_score) : null) ??
            baseNoveltyScore
        
        // For density, try multiple fallback paths since Grok may return it in different formats
        // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
        let finalDensityScore = 
            (typeof densityRaw === 'number' ? densityRaw : 0) ||
            (typeof densityRaw === 'object' && densityRaw !== null ? (densityRaw.final_score ?? densityRaw.score ?? densityRaw.base_score ?? 0) : 0) ||
            0
        
        // If still 0, try more locations
        if (finalDensityScore === 0) {
            // Try all possible locations for density score in the evaluation response
            finalDensityScore = evaluation.density ?? 
                               evaluation.scoring?.density?.score ?? 
                               evaluation.scoring?.density?.final_score ?? 
                               evaluation.scoring?.density?.base_score ??
                               evaluation.scoring?.density?.value ??
                               evaluation.density_score ??
                               evaluation.scores?.density ??
                               0
        }
        
        // If still 0, try parsing as number from string
        if (finalDensityScore === 0 && typeof evaluation.density === 'string') {
            const parsed = parseFloat(evaluation.density)
            if (!isNaN(parsed)) {
                finalDensityScore = parsed
            }
        }
        
        // If still 0, use base score (individual scores are NOT penalized)
        if (finalDensityScore === 0) {
            finalDensityScore = baseDensityScore
        }
        
        // If still 0, try to extract from nested structures
        if (finalDensityScore === 0) {
            // Check if density is in a nested evaluation object
            if (evaluation.evaluation?.density) {
                finalDensityScore = typeof evaluation.evaluation.density === 'number' ? evaluation.evaluation.density : 0
            } else if (evaluation.evaluation?.scoring?.density?.score) {
                finalDensityScore = evaluation.evaluation.scoring.density.score
            } else if (evaluation.evaluation?.scoring?.density?.final_score) {
                finalDensityScore = evaluation.evaluation.scoring.density.final_score
            }
        }
        
        // Use the best available density score (prefer finalDensityScore, fallback to baseDensityScore if final is 0)
        let densityFinal = finalDensityScore > 0 ? finalDensityScore : baseDensityScore
        
        // Final debug log to see what we extracted
        debug('EvaluateWithGrok', 'Density extraction result', {
            finalDensityScore,
            baseDensityScore,
            densityFinal,
            densityRaw: densityRaw,
            densityRawType: typeof densityRaw,
            evaluationDensity: evaluation.density,
        })
        
        // Calculate composite/total score from all individual category scores
        const compositeScore = finalNoveltyScore + densityFinal + coherenceScore + alignmentScore

        // Get base total score if provided by Grok
        let pod_score = evaluation.total_score ?? evaluation.pod_score ?? evaluation.poc_score ?? compositeScore
        if (!pod_score || pod_score === 0) {
            pod_score = compositeScore
        }

        // Apply overlap effect (penalty or bonus) to the composite/total score
        // redundancyOverlapPercent can be negative (penalty) or positive (bonus)
        pod_score = Math.max(0, Math.min(10000, pod_score * (1 + redundancyOverlapPercent / 100)))
        
        // CRITICAL: For foundational/seed submissions that define Syntheverse itself, 
        // auto-assign maximum scores to ensure consistency
        if (isSeedSubmission) {
            debug('EvaluateWithGrok', 'Foundational submission detected - awarding maximum pod_score for qualification', {
                title,
                actual_scores: {
                    novelty: finalNoveltyScore,
                    density: densityFinal,
                    coherence: coherenceScore,
                    alignment: alignmentScore
                },
                pod_score_override: 10000
            })
            
            // Keep actual evaluated scores for transparency, but ensure qualification
            // Only override pod_score to 10000 for Founder epoch qualification
            pod_score = 10000         // Perfect score - foundational submission deserves maximum for qualification
            // Overlap effect is already set to 0 for seed submissions above
            
            debug('EvaluateWithGrok', 'Foundational submission - pod_score set to maximum for qualification', {
                actual_novelty: finalNoveltyScore,
                actual_density: densityFinal,
                actual_coherence: coherenceScore,
                actual_alignment: alignmentScore,
                pod_score: pod_score
            })
        }
        
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
        // IMPORTANT: Always use the discounted pod_score, not evaluation.qualified_founder
        // because Grok's qualified_founder is based on pre-discount score
        // For foundational submissions, this should always be true (10,000 >= 8000)
        const qualified = pod_score >= 8000
        
        // Determine which epoch this PoC qualifies for based on composite/pod_score
        // For foundational submissions, pod_score will be 10000, which qualifies for Founder epoch
        const qualifiedEpoch = qualifyEpoch(pod_score)
        
        debug('EvaluateWithGrok', 'Epoch qualification determined', {
            pod_score,
            density: densityFinal,
            qualified_epoch: qualifiedEpoch,
            qualified,
            isSeedSubmission: isSeedSubmission,
            qualification_based_on: 'pod_score (composite score)'
        })
        
        // Final validation: If all scores are 0, this indicates a problem with Grok's response
        const allScoresZero = finalNoveltyScore === 0 && densityFinal === 0 && coherenceScore === 0 && alignmentScore === 0
        if (allScoresZero) {
            // Always log this critical error, even if debug is disabled
            console.error('[EvaluateWithGrok] CRITICAL ERROR: All scores are 0 - Grok may not have returned scores properly', {
                evaluationFull: JSON.stringify(evaluation, null, 2),
                rawAnswer: answer.substring(0, 3000),
                scoring: scoring,
                noveltyRaw: noveltyRaw,
                densityRaw: densityRaw,
                coherenceRaw: coherenceRaw,
                alignmentRaw: alignmentRaw,
                baseNoveltyScore,
                baseDensityScore,
                coherenceScore,
                alignmentScore
            })
            debugError('EvaluateWithGrok', 'CRITICAL ERROR: All scores are 0 - Grok may not have returned scores properly', {
                evaluationFull: JSON.stringify(evaluation, null, 2),
                rawAnswer: answer.substring(0, 2000),
                scoring: scoring,
                noveltyRaw: noveltyRaw,
                densityRaw: densityRaw,
                coherenceRaw: coherenceRaw,
                alignmentRaw: alignmentRaw
            })
            // Don't throw - return zeros but log the issue so we can debug
        }
        
        // Use final scores (may have been overridden for foundational submissions)
        const finalNovelty = Math.max(0, Math.min(2500, finalNoveltyScore))
        const finalDensity = Math.max(0, Math.min(2500, densityFinal))
        const finalCoherence = Math.max(0, Math.min(2500, coherenceScore))
        const finalAlignment = Math.max(0, Math.min(2500, alignmentScore))
        const finalPodScore = Math.max(0, Math.min(10000, pod_score))
        const finalRedundancy = isSeedSubmission ? 0 : Math.max(0, Math.min(100, redundancyOverlapPercent)) // Always 0 for foundational submissions
        const finalOverlap = isSeedSubmission ? 0 : Math.max(0, Math.min(100, redundancyOverlapPercent))
        
        return {
            coherence: finalCoherence,
            density: finalDensity,
            // "redundancy" is now the overlap % (display metric). Penalty is stored separately.
            redundancy: finalOverlap,
            pod_score: finalPodScore,
            metals,
            qualified,
            qualified_epoch: qualifiedEpoch, // Epoch this PoC qualifies for based on density
            // Additional fields from new evaluation format
            novelty: finalNovelty,
            alignment: finalAlignment,
            classification: evaluation.classification || [],
            redundancy_analysis: calculatedRedundancy 
                ? `${calculatedRedundancy.analysis}\n\n${evaluation.redundancy_analysis || (typeof noveltyRaw === 'object' && noveltyRaw !== null ? noveltyRaw.justification : '') || ''}`
                : (evaluation.redundancy_analysis || (typeof noveltyRaw === 'object' && noveltyRaw !== null ? noveltyRaw.justification : '') || ''),
            metal_justification: evaluation.metal_justification || '',
            founder_certificate: evaluation.founder_certificate || '',
            homebase_intro: evaluation.homebase_intro || '',
            tokenomics_recommendation: evaluation.tokenomics_recommendation || {
                eligible_epochs: [qualifiedEpoch], // Include qualified epoch in eligible epochs
                suggested_allocation: 0,
                tier_multiplier: 1,
                epoch_distribution: {},
                allocation_notes: 'Token allocation requires human admin approval',
                requires_admin_approval: true
            },
            // Store base scores and overlap effect for transparency
            // For seed submissions, keep original base scores for transparency but award maximum final scores
            base_novelty: baseNoveltyScore,
            base_density: baseDensityScore,
            redundancy_overlap_percent: redundancyOverlapPercent,
            // Store raw Grok API response for display
            raw_grok_response: answer // Store the raw markdown/text response from Grok
        }
    } catch (error) {
        debugError('EvaluateWithGrok', 'Grok API call failed', error)
        throw error
    }
}

