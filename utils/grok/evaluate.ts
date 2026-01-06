import { debug, debugError } from '@/utils/debug';
import { db } from '@/utils/db/db';
import { contributionsTable, tokenomicsTable, epochMetalBalancesTable } from '@/utils/db/schema';
import { ne, sql } from 'drizzle-orm';
import { qualifyEpoch } from '@/utils/epochs/qualification';
import {
  vectorizeSubmission,
  formatArchivedVectors,
  calculateVectorRedundancy,
  Vector3D,
} from '@/utils/vectors';
import { SYNTHEVERSE_SYSTEM_PROMPT } from '@/utils/grok/system-prompt';
import crypto from 'crypto';
// SCALABILITY FIX: Removed archive utilities - using vectors-only approach for infinite scalability

interface TokenomicsInfo {
  current_epoch: string;
  epoch_balances: Record<string, number>;
  total_coherence_density: number;
  founder_halving_count: number;
  epoch_progression: Record<string, boolean>;
}

interface GrokEvaluationResult {
  coherence: number;
  density: number;
  redundancy: number;
  pod_score: number;
  novelty: number;
  alignment: number;
  metals: string[];
  qualified: boolean;
  qualified_epoch?: string;
  classification?: string[];
  redundancy_analysis?: string;
  metal_justification?: string;
  founder_certificate?: string;
  homebase_intro?: string;
  tokenomics_recommendation?: any;
  base_novelty?: number;
  base_density?: number;
  redundancy_overlap_percent?: number;
  is_seed_submission?: boolean;
  raw_grok_response?: string;
  llm_metadata?: {
    timestamp: string;
    date: string;
    model: string;
    model_version: string;
    provider: string;
    system_prompt_preview: string;
    system_prompt_hash: string;
    system_prompt_file: string;
    evaluation_timestamp_ms: number;
  };
}

// Call Grok API directly for PoC evaluation
export async function evaluateWithGrok(
  textContent: string,
  title: string,
  category?: string,
  excludeHash?: string
): Promise<{
  coherence: number;
  density: number;
  redundancy: number;
  pod_score: number;
  novelty: number;
  alignment: number;
  metals: string[];
  qualified: boolean;
  qualified_epoch?: string;
  classification?: string[];
  redundancy_analysis?: string;
  metal_justification?: string;
  founder_certificate?: string;
  homebase_intro?: string;
  tokenomics_recommendation?: {
    eligible_epochs?: string[];
    suggested_allocation?: number;
    tier_multiplier?: number;
    epoch_distribution?: Record<string, number>;
    allocation_notes?: string;
    requires_admin_approval?: boolean;
  };
  base_novelty?: number;
  base_density?: number;
  redundancy_overlap_percent?: number;
  is_seed_submission?: boolean;
  raw_grok_response?: string;
  llm_metadata?: {
    timestamp: string;
    date: string;
    model: string;
    model_version: string;
    provider: string;
    system_prompt_preview: string;
    system_prompt_hash: string;
    system_prompt_file: string;
    evaluation_timestamp_ms: number;
  };
  // H) Score trace for transparency (Marek requirement)
  score_trace?: {
    dimension_scores: {
      novelty: number;
      density: number;
      coherence: number;
      alignment: number;
    };
    composite: number;
    base_pod_score: number;
    overlap_percent: number;
    penalty_percent_computed: number;
    penalty_percent_applied: number;
    bonus_multiplier_computed: number;
    bonus_multiplier_applied: number;
    after_penalty: number;
    after_bonus: number;
    final_score: number;
    formula: string;
    clamped: boolean;
  };
}> {
  const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
  if (!grokApiKey) {
    throw new Error(
      'NEXT_PUBLIC_GROK_API_KEY not configured. Grok API key is required for evaluation.'
    );
  }

  // SCALABILITY FIX: Truncate text content to prevent token limit errors (413/429)
  // Groq on-demand tier has 6000 token limit. System prompt is ~4500 tokens.
  // Available tokens: ~1500 tokens. With 20% margin: ~1200 tokens (~4800 chars).
  // Safe limit: 4000 characters (~1000 tokens) for submissions (abstract, equations, constants only)
  const MAX_CONTENT_LENGTH = 4000;
  const truncatedText =
    textContent.length > MAX_CONTENT_LENGTH
      ? textContent.substring(0, MAX_CONTENT_LENGTH).trimEnd() +
        '\n\n[Content truncated for evaluation]'
      : textContent;

  debug('EvaluateWithGrok', 'Calling Grok API for evaluation', {
    textLength: textContent.length,
    truncatedLength: truncatedText.length,
    wasTruncated: textContent.length > MAX_CONTENT_LENGTH,
    title,
    category,
    excludeHash,
  });

  // Generate vector embedding and 3D coordinates for current submission
  // SCALABILITY FIX: Using vectors-only approach - removed archive data extraction and top3Matches
  // Vector-based redundancy is sufficient and scales infinitely without bloating the prompt
  // Use full text for vectorization (not truncated) - embeddings need full context
  let currentVectorization: { embedding: number[]; vector: Vector3D } | null = null;
  try {
    debug('EvaluateWithGrok', 'Generating vector embedding and 3D coordinates');
    const vectorization = await vectorizeSubmission(textContent);
    currentVectorization = {
      embedding: vectorization.embedding,
      vector: vectorization.vector,
    };
    debug('EvaluateWithGrok', 'Vectorization complete', {
      embeddingDimensions: vectorization.embeddingDimensions,
      vector: vectorization.vector,
      model: vectorization.embeddingModel,
    });
  } catch (error) {
    debugError('EvaluateWithGrok', 'Failed to generate vectorization', error);
    // Continue without vectorization - redundancy calculation will handle gracefully
  }

  // Fetch archived vectors for redundancy checking and context
  // SCALABILITY: Only load vectors/metadata, not full text_content
  let archivedVectors: Array<{
    submission_hash: string;
    title: string;
    embedding?: number[] | null;
    vector_x?: number | null;
    vector_y?: number | null;
    vector_z?: number | null;
    metadata?: any;
  }> = [];

  try {
    // Fetch ONLY vector/metadata data for redundancy calculation (SCALABILITY FIX: removed text_content)
    // This reduces memory usage by ~99% and improves query performance significantly
    const archivedContributions = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        embedding: contributionsTable.embedding,
        vector_x: contributionsTable.vector_x,
        vector_y: contributionsTable.vector_y,
        vector_z: contributionsTable.vector_z,
        metadata: contributionsTable.metadata,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .where(excludeHash ? ne(contributionsTable.submission_hash, excludeHash) : undefined)
      .orderBy(contributionsTable.created_at);

    // Store vector data for redundancy calculations (no text_content needed)
    archivedVectors = archivedContributions.map((contrib) => ({
      submission_hash: contrib.submission_hash,
      title: contrib.title,
      embedding: contrib.embedding as number[] | null,
      vector_x: contrib.vector_x ? Number(contrib.vector_x) : null,
      vector_y: contrib.vector_y ? Number(contrib.vector_y) : null,
      vector_z: contrib.vector_z ? Number(contrib.vector_z) : null,
      metadata: contrib.metadata || {},
    }));

    debug('EvaluateWithGrok', 'Fetched archived vectors for redundancy', {
      count: archivedVectors.length,
      withVectors: archivedVectors.filter((v) => v.vector_x !== null).length,
      withEmbeddings: archivedVectors.filter((v) => v.embedding).length,
      note: 'Only vectors/metadata loaded (text_content excluded for scalability)',
    });
  } catch (error) {
    debugError('EvaluateWithGrok', 'Failed to fetch archived PoCs', error);
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
  const isFirstSubmission = archivedVectors.length === 0;
  const isSeedSubmission = isFirstSubmission; // First submission = defines the sandbox

  debug('EvaluateWithGrok', 'Submission comparison context', {
    isFirstSubmission,
    isSeedSubmission,
    archivedCount: archivedVectors.length,
    title,
    comparisonContext: isFirstSubmission
      ? 'FIRST SUBMISSION - Defines the Syntheverse sandbox itself'
      : `Subsequent submission - Will be compared to sandbox definition + ${archivedVectors.length} prior submission(s)`,
  });

  // Calculate actual vector-based redundancy if we have current vectorization
  // Seed submissions always have 0% redundancy (they define the system)
  let calculatedRedundancy: {
    overlap_percent: number;
    penalty_percent: number;
    bonus_multiplier: number;
    similarity_score: number;
    closest_vectors: Array<{ hash: string; title: string; similarity: number; distance: number }>;
    analysis: string;
    overlap_percentile?: number;
    nearest_10_neighbors?: {
      mean: number;
      std_dev: number;
      min: number;
      max: number;
    };
    computation_context?: 'global' | 'per-user' | 'per-sandbox';
  } | null = null;

  if (isSeedSubmission) {
    calculatedRedundancy = {
      overlap_percent: 0,
      penalty_percent: 0,
      bonus_multiplier: 1,
      similarity_score: 0,
      closest_vectors: [],
      analysis:
        'This is the FIRST submission that defines the Syntheverse sandbox itself. Redundancy is 0% because nothing exists to be redundant with - this submission establishes the framework everything else operates within.',
    };
    debug(
      'EvaluateWithGrok',
      'FIRST SUBMISSION detected - setting redundancy to 0% (defines the sandbox)'
    );
  } else if (currentVectorization && archivedVectors.length > 0) {
    // Compare this submission to the Syntheverse sandbox + prior submissions
    // SCALABILITY FIX: Limit to top 50 vectors for redundancy calculation (still accurate, much faster)
    const MAX_REDUNDANCY_VECTORS = 50;
    const limitedArchivedVectors = archivedVectors.slice(0, MAX_REDUNDANCY_VECTORS);

    try {
      const formattedArchivedVectors = formatArchivedVectors(limitedArchivedVectors);
      calculatedRedundancy = await calculateVectorRedundancy(
        truncatedText, // Use truncated text for redundancy calculation (matches what we send to Grok)
        currentVectorization.embedding,
        currentVectorization.vector,
        formattedArchivedVectors // Limited to top 50 for scalability (redundancy calc only needs closest matches)
      );
      debug(
        'EvaluateWithGrok',
        'Calculated redundancy by comparing to sandbox + prior submissions',
        {
          totalArchivedVectors: archivedVectors.length,
          vectorsUsed: limitedArchivedVectors.length,
          note: 'Limited to top 50 vectors for scalability (redundancy calculation only needs closest matches)',
          overlap_percent: calculatedRedundancy.overlap_percent,
          penalty_percent: calculatedRedundancy.penalty_percent,
          bonus_multiplier: calculatedRedundancy.bonus_multiplier,
          similarity_score: calculatedRedundancy.similarity_score,
          closest_count: calculatedRedundancy.closest_vectors.length,
        }
      );
    } catch (error) {
      debugError('EvaluateWithGrok', 'Failed to calculate vector redundancy', error);
      // Continue without calculated redundancy - Grok will estimate
    }
  }

  // Fetch tokenomics information
  let tokenomicsInfo: TokenomicsInfo | null = null;
  try {
    const tokenomics = await db.select().from(tokenomicsTable).limit(1);

    if (tokenomics && tokenomics.length > 0) {
      const tk = tokenomics[0];
      const epochMetalBalances = await db.select().from(epochMetalBalancesTable);

      // SCALABILITY FIX: Skip total_coherence_density calculation (not critical for evaluation)
      // This value is not used in the evaluation prompt and was causing O(n) performance issues
      // If needed in the future, it should be cached in the tokenomics table or computed incrementally
      const totalCoherenceDensity = 0;

      // Aggregate per-epoch total balances (sum of metal pools)
      const epochTotals: Record<string, number> = {};
      for (const row of epochMetalBalances) {
        const epoch = String(row.epoch).toLowerCase().trim();
        epochTotals[epoch] = (epochTotals[epoch] || 0) + Number(row.balance || 0);
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
          ecosystem: false,
        },
      };

      debug('EvaluateWithGrok', 'Fetched tokenomics info', tokenomicsInfo);
    }
  } catch (error) {
    debugError('EvaluateWithGrok', 'Failed to fetch tokenomics info', error);
    // Continue without tokenomics if fetch fails
  }

  // Use the canonical Syntheverse system prompt (intentionally long; required persona + schema).
  // Token-budget control is handled by shrinking user payload and truncating content when needed.
  const systemPrompt = SYNTHEVERSE_SYSTEM_PROMPT;

  // SCALABILITY FIX: Using vectors-only approach - removed archivedPoCsContext (abstract text)
  // Vector-based redundancy (calculatedRedundancyContext) is sufficient and scales infinitely
  // This prevents prompt bloat that causes coherence collapse after multiple submissions

  // Add calculated redundancy information if available (compact, vector-based).
  // Include enhanced distribution data (Marek's requirements)
  const calculatedRedundancyContext = calculatedRedundancy
    ? `Vector redundancy (HHF 3D):
- overlap_percent=${calculatedRedundancy.overlap_percent.toFixed(1)}%
- penalty_percent=${calculatedRedundancy.penalty_percent.toFixed(1)}%
- bonus_multiplier=${calculatedRedundancy.bonus_multiplier.toFixed(3)}
- similarity=${(calculatedRedundancy.similarity_score * 100).toFixed(1)}%
- closest="${calculatedRedundancy.closest_vectors[0]?.title || 'N/A'}"
${calculatedRedundancy.overlap_percentile !== undefined ? `- overlap_percentile=${calculatedRedundancy.overlap_percentile}th percentile` : ''}
${calculatedRedundancy.nearest_10_neighbors ? `- nearest_10_neighbors: μ=${calculatedRedundancy.nearest_10_neighbors.mean.toFixed(3)} ± ${calculatedRedundancy.nearest_10_neighbors.std_dev.toFixed(3)} (min=${calculatedRedundancy.nearest_10_neighbors.min.toFixed(3)}, max=${calculatedRedundancy.nearest_10_neighbors.max.toFixed(3)})` : ''}
- computation_context=${calculatedRedundancy.computation_context || 'per-sandbox'}`
    : '';
  
  // Generate scoring config ID (versioned)
  // TODO: This should come from a config management system in production
  const SCORE_CONFIG_VERSION = 'v2.0.13';
  const scoreConfigId = `score_config=${SCORE_CONFIG_VERSION}(overlap_penalty_start=30%, sweet_spot_center=14.2%±5%, weights:N=1.0/D=1.0/C=1.0/A=1.0)`;
  
  // Generate sandbox ID (default to main sandbox, can be overridden per-user/per-enterprise)
  // TODO: This should come from user context or enterprise sandbox selection
  const sandboxId = 'sandbox_id=pru-default'; // Default sandbox; can be 'marek-sandbox-01', 'syntheverse-genesis', etc.
  
  // Archive version/snapshot ID
  const archiveVersion = `archive_version=${archivedVectors.length > 0 ? `snapshot-${archivedVectors.length}` : 'empty'}`;

  // Format tokenomics context (condensed)
  const tokenomicsContext = tokenomicsInfo
    ? `**Tokenomics:** Epoch=${tokenomicsInfo.current_epoch}, Founder=${tokenomicsInfo.epoch_balances.founder?.toLocaleString() || 0} SYNTH. Thresholds: Founder≥8000, Pioneer≥6000, Community≥5000, Ecosystem≥4000.`
    : '';

  // Evaluation query with contribution details + minimal extra instructions.
  // IMPORTANT: We want a detailed narrative review AND parseable JSON (embedded).
  // SCALABILITY FIX: Using vectors-only approach - removed archivedPoCsContext to prevent prompt bloat
  const evaluationQuery = `Evaluate this Proof-of-Contribution (PoC) using the system prompt rules.

**Scoring Metadata (Deterministic Score Contract):**
${scoreConfigId}
${sandboxId}
${archiveVersion}

Title: ${title}
Category: ${category || 'scientific'}
${tokenomicsContext ? `\n${tokenomicsContext}` : ''}

Submission Content:
${truncatedText}

${calculatedRedundancyContext ? `\n${calculatedRedundancyContext}` : ''}

Notes:
- ${isSeedSubmission ? 'This is the FIRST submission defining the Syntheverse sandbox. Redundancy penalty MUST be 0%.' : 'This is NOT the first submission. Use the vector-based redundancy information above to determine overlap and redundancy penalties.'}
- Apply redundancy penalty ONLY to the composite/total score (as specified in the system prompt).
- You MUST include scoring_metadata, pod_composition, and archive_similarity_distribution in your JSON response.
- Output: Provide a detailed narrative review (clear + specific), AND include the REQUIRED JSON structure from the system prompt.
- The JSON may be placed in a markdown code block, but it MUST be valid parseable JSON.
`;

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for Grok API

    // Groq on-demand tier enforces strict per-request token budgets (TPM). To avoid 413/TPM errors,
    // cap max_tokens and retry with smaller budgets if needed.
    // Increased initial budget to 2000 to allow complete JSON responses (Grok was hitting limit at 1200)
    const tokenBudgets = [2000, 1500, 1200, 800, 500];
    let response: Response | null = null;
    let lastErrorText: string | null = null;

    for (const maxTokens of tokenBudgets) {
      const attemptController = new AbortController();
      const attemptTimeoutId = setTimeout(() => attemptController.abort(), 30000);
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: evaluationQuery },
            ],
            temperature: 0.0, // Deterministic evaluation
            max_tokens: maxTokens,
          }),
          signal: attemptController.signal,
        });
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Grok API request timed out after 30 seconds');
        }
        throw fetchError;
      } finally {
        clearTimeout(attemptTimeoutId);
      }

      if (response.ok) break;

      // Read error body for decision making
      lastErrorText = await response.text().catch(() => null);
      const isTokenBudgetError =
        response.status === 413 ||
        (lastErrorText || '').includes('Request too large') ||
        (lastErrorText || '').includes('TPM') ||
        (lastErrorText || '').includes('rate_limit_exceeded');

      debug('EvaluateWithGrok', 'Groq request failed, evaluating retry', {
        status: response.status,
        maxTokens,
        willRetry: isTokenBudgetError && maxTokens !== tokenBudgets[tokenBudgets.length - 1],
      });

      if (!isTokenBudgetError) {
        throw new Error(`Grok API error (${response.status}): ${lastErrorText || ''}`);
      }
    }

    clearTimeout(timeoutId);
    if (!response) {
      throw new Error('Grok API error: no response');
    }

    if (!response.ok) {
      throw new Error(
        `Grok API error (${response.status}): ${lastErrorText || 'Request failed (token budget exceeded)'}`
      );
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || '';

    // Log FULL Grok API response for debugging (including metadata)
    const fullGrokResponse = {
      id: data.id,
      object: data.object,
      created: data.created,
      model: data.model,
      choices: data.choices,
      usage: data.usage,
      system_fingerprint: data.system_fingerprint,
      raw_content: answer,
      content_length: answer.length,
      has_content: !!answer && answer.trim().length > 0,
    };

    debug('EvaluateWithGrok', 'Grok API response received', {
      responseLength: answer.length,
      preview: answer.substring(0, 500),
      fullResponse: answer, // Log full response for debugging
      hasAnswer: !!answer,
      answerType: typeof answer,
      fullGrokResponse: JSON.stringify(fullGrokResponse, null, 2), // Full API response structure
      grokApiResponseKeys: Object.keys(data),
      grokApiResponseStructure: {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        firstChoiceKeys: data.choices?.[0] ? Object.keys(data.choices[0]) : [],
        messageKeys: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : [],
        usage: data.usage,
      },
    });

    // Ensure answer is stored - log if empty
    if (!answer || answer.trim().length === 0) {
      debugError('EvaluateWithGrok', 'WARNING: Grok API response is empty', {
        dataKeys: Object.keys(data),
        choicesLength: data.choices?.length || 0,
        firstChoice: data.choices?.[0],
        fullResponse: JSON.stringify(data, null, 2),
        fullGrokResponse: JSON.stringify(fullGrokResponse, null, 2),
      });
    }

    const cleanJsonCandidate = (s: string): string => {
      let out = (s || '').trim();
      // Common invalid JSON issues from LLMs:
      // - thousands separators in numbers: 2,400 -> 2400
      out = out.replace(/(\d),(?=\d{3}\b)/g, '$1');
      // - trailing commas before closing braces/brackets
      out = out.replace(/,\s*([}\]])/g, '$1');
      return out;
    };

    const tryParseJson = (candidate: string): any | null => {
      const cleaned = cleanJsonCandidate(candidate);
      try {
        const parsed = JSON.parse(cleaned);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    };

    const parseNarrativeToJson = (raw: string): any | null => {
      const text = (raw || '').trim();
      if (!text) return null;

      const normalizeNum = (v: string): number => {
        const cleaned = String(v || '')
          .replace(/,/g, '')
          .trim();
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
      };

      // Extract score from multiple formats:
      // 1. Table format: | Novelty | 2,400 |
      // 2. Bullet list: * Novelty: 2,400
      // 3. Line format: Novelty: 2,400
      const extractScore = (label: string): number => {
        // Try table format first
        const tableRe = new RegExp(`\\|\\s*${label}\\s*\\|\\s*([\\d,\\.]+)\\s*\\|`, 'i');
        const tableMatch = text.match(tableRe);
        if (tableMatch?.[1]) return normalizeNum(tableMatch[1]);

        // Try bullet list format: * Novelty: 2,400
        const bulletRe = new RegExp(`[\\*\\-]\\s*${label}\\s*[:]\\s*([\\d,\\.]+)`, 'i');
        const bulletMatch = text.match(bulletRe);
        if (bulletMatch?.[1]) return normalizeNum(bulletMatch[1]);

        // Try line format: Novelty: 2,400 (with optional parentheses)
        const lineRe = new RegExp(`${label}\\s*[:]\\s*([\\d,\\.]+)`, 'i');
        const lineMatch = text.match(lineRe);
        if (lineMatch?.[1]) return normalizeNum(lineMatch[1]);

        return 0;
      };

      const novelty = extractScore('Novelty');
      const density = extractScore('Density');
      const coherence = extractScore('Coherence');
      const alignment = extractScore('Alignment');

      // Also try to extract total score from text
      const totalMatch =
        text.match(/total\s+score[:\s]+([\d,\.]+)/i) || text.match(/score[:\s]+([\d,\.]+)\s*\(/i);
      const totalFromText = totalMatch ? normalizeNum(totalMatch[1]) : 0;
      const total = totalFromText > 0 ? totalFromText : novelty + density + coherence + alignment;

      // Classification (best-effort) - try multiple patterns
      let classification: string[] = [];
      const classificationMatch =
        text.match(/PoC\s*Classification:\s*([^\n\r]+)/i) ||
        text.match(/Classification:\s*([^\n\r]+)/i) ||
        text.match(/["']classification["']\s*:\s*\[([^\]]+)\]/i);

      if (classificationMatch?.[1]) {
        const classificationRaw = classificationMatch[1].trim();
        classification = classificationRaw
          .split(/[,\|\/\[\]"]/g)
          .map((s) => s.trim().replace(/"/g, ''))
          .filter(Boolean);
      }

      // Also try to extract from JSON if present (even if truncated)
      if (classification.length === 0) {
        const jsonClassMatch = text.match(/"classification"\s*:\s*\["([^"]+)"\]/i);
        if (jsonClassMatch?.[1]) {
          classification = [jsonClassMatch[1]];
        }
      }

      // Metal alignment (best-effort) - try multiple patterns
      let metal = '';
      const metalMatch =
        text.match(/Metal\s*Alignment:\s*([A-Za-z]+)/i) ||
        text.match(/["']metal_alignment["']\s*:\s*"([^"]+)"/i) ||
        text.match(/Primary:\s*(Gold|Silver|Copper|Hybrid)/i) ||
        text.match(/metals["']\s*:\s*\["([^"]+)"/i);

      if (metalMatch?.[1]) {
        metal = metalMatch[1].trim();
      }

      const metalAlignment = metal || 'Copper';
      const metals = metal ? [metal] : [metalAlignment];

      const qualified_founder = total >= 8000;

      // Use the narrative itself as a readable analysis fallback so the dashboard still has detail.
      const redundancy_analysis = text;

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
        metals: metals,
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
      };
    };

    const extractJsonCandidates = (raw: string): string[] => {
      const a = raw || '';
      const candidates: string[] = [];
      candidates.push(a.trim());

      const jsonBlockMatch = a.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonBlockMatch?.[1]) candidates.push(jsonBlockMatch[1].trim());

      const codeBlockMatch = a.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch?.[1]) candidates.push(codeBlockMatch[1].trim());

      const startMarker = a.indexOf('{');
      const endMarker = a.lastIndexOf('}');
      if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
        candidates.push(a.substring(startMarker, endMarker + 1));
      }

      const firstObjectMatch = a.match(/\{[\s\S]*\}/);
      if (firstObjectMatch?.[0]) candidates.push(firstObjectMatch[0]);

      // De-dupe while preserving order
      const seen = new Set<string>();
      return candidates.filter((c) => {
        const key = c.trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // Primary parse attempt (tolerant).
    let evaluation: any = null;
    const candidates = extractJsonCandidates(answer);
    for (let i = 0; i < candidates.length; i++) {
      const parsed = tryParseJson(candidates[i]);
      if (parsed) {
        evaluation = parsed;
        debug('EvaluateWithGrok', 'JSON parsed successfully from Grok response', {
          strategy: `candidate_${i + 1}/${candidates.length}`,
          hasScoring: !!evaluation.scoring,
          hasDensity: !!evaluation.density,
          hasScoringDensity: !!evaluation.scoring?.density,
          evaluationKeys: Object.keys(evaluation),
          evaluationString: JSON.stringify(evaluation, null, 2).substring(0, 2000),
        });
        break;
      }
    }

    // If no JSON was produced, do a single "repair" call to convert the narrative output into strict JSON.
    if (!evaluation) {
      debug('EvaluateWithGrok', 'No parseable JSON found. Attempting one-shot JSON repair call.', {
        responseLength: answer.length,
        preview: answer.substring(0, 400),
      });

      const repairSystemPrompt =
        'You are a strict JSON extraction and normalization engine. Output ONLY valid JSON. No markdown. No prose. No tables.';
      const repairUserPrompt = `Convert the following evaluation text into a single JSON object with EXACTLY these top-level keys:
classification, scoring, total_score, pod_score, qualified_founder, metal_alignment, metals, metal_justification, redundancy_analysis, founder_certificate, homebase_intro, tokenomics_recommendation.

Rules:
- All numeric values MUST be numbers (no commas like 2,400; use 2400).
- scoring must contain novelty, density, coherence, alignment.
- density must contain base_score, redundancy_penalty_percent, final_score, score, justification.
- tokenomics_recommendation must contain eligible_epochs, suggested_allocation, tier_multiplier, epoch_distribution, allocation_notes, requires_admin_approval.
- If a field is missing in the text, infer it conservatively (use 0, empty string, empty array, or {} as appropriate).

Text to convert:
${answer}`;

      const repairBudgets = [800, 500];
      let repairedJsonText = '';
      let repairLastError: string | null = null;
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
          });
          const repairText = repairResp.ok
            ? await repairResp.text()
            : await repairResp.text().catch(() => '');
          if (!repairResp.ok) {
            repairLastError = `Repair call failed (${repairResp.status}): ${repairText}`;
            continue;
          }
          const repairData = JSON.parse(repairText);
          repairedJsonText = repairData.choices?.[0]?.message?.content || '';
          if (repairedJsonText.trim().length === 0) {
            repairLastError = `Repair call returned empty content (max_tokens=${maxTokens})`;
            continue;
          }
          break;
        } catch (e) {
          repairLastError = e instanceof Error ? e.message : String(e);
          continue;
        }
      }

      if (repairedJsonText.trim().length > 0) {
        const repairCandidates = extractJsonCandidates(repairedJsonText);
        for (let i = 0; i < repairCandidates.length; i++) {
          const parsed = tryParseJson(repairCandidates[i]);
          if (parsed) {
            evaluation = parsed;
            debug('EvaluateWithGrok', 'JSON repair succeeded', {
              repairedLength: repairedJsonText.length,
              hasScoring: !!evaluation.scoring,
            });
            break;
          }
        }
      }

      if (!evaluation) {
        debugError('EvaluateWithGrok', 'JSON repair failed', {
          repairLastError,
          responseLength: answer.length,
          responsePreview: answer.substring(0, 1000),
          responseEnd: answer.substring(Math.max(0, answer.length - 500)),
        });
        // FINAL fallback: parse common narrative/table formats into the required JSON shape locally
        const narrativeParsed = parseNarrativeToJson(answer);
        if (narrativeParsed) {
          evaluation = narrativeParsed;
          debug('EvaluateWithGrok', 'Parsed Grok narrative/table output into JSON locally', {
            responseLength: answer.length,
            total_score: evaluation.total_score,
            qualified_founder: evaluation.qualified_founder,
            metal_alignment: evaluation.metal_alignment,
          });
        } else {
          throw new Error(
            `Failed to parse Grok response as JSON after tolerant parsing + repair. Response length: ${answer.length} chars. Preview: ${answer.substring(0, 200)}...`
          );
        }
      }
    }

    // Debug: Log the full evaluation structure to understand Grok's response format
    debug('EvaluateWithGrok', 'Raw evaluation structure', {
      hasScoring: !!evaluation.scoring,
      hasDensity: !!evaluation.density,
      evaluationKeys: Object.keys(evaluation),
      evaluationString: JSON.stringify(evaluation, null, 2), // FULL evaluation structure for debugging
      evaluationStructure: {
        topLevelKeys: Object.keys(evaluation),
        hasScoring: !!evaluation.scoring,
        scoringKeys: evaluation.scoring ? Object.keys(evaluation.scoring) : [],
        scoringStructure: evaluation.scoring ? JSON.stringify(evaluation.scoring, null, 2) : null,
        hasNovelty: 'novelty' in evaluation,
        hasDensity: 'density' in evaluation,
        hasCoherence: 'coherence' in evaluation,
        hasAlignment: 'alignment' in evaluation,
        noveltyType: typeof evaluation.novelty,
        densityType: typeof evaluation.density,
        coherenceType: typeof evaluation.coherence,
        alignmentType: typeof evaluation.alignment,
        noveltyValue: evaluation.novelty,
        densityValue: evaluation.density,
        coherenceValue: evaluation.coherence,
        alignmentValue: evaluation.alignment,
      },
    });

    // Extract scoring from new format - try multiple structures
    // IMPORTANT: Handle both object and number formats
    const scoring = evaluation.scoring || {};

    // Get raw values - could be objects or numbers
    const noveltyRaw = scoring.novelty ?? evaluation.novelty;
    const densityRaw = scoring.density ?? evaluation.density;
    const coherenceRaw = scoring.coherence ?? evaluation.coherence;
    const alignmentRaw = scoring.alignment ?? evaluation.alignment;

    // Extract base scores with extensive fallback options
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let baseNoveltyScore = 0;
    let noveltyExtractionPath = 'none';

    if (typeof noveltyRaw === 'number' && noveltyRaw > 0) {
      baseNoveltyScore = noveltyRaw;
      noveltyExtractionPath = 'noveltyRaw (number)';
    } else if (typeof noveltyRaw === 'object' && noveltyRaw !== null) {
      baseNoveltyScore = noveltyRaw.base_score ?? noveltyRaw.final_score ?? noveltyRaw.score ?? 0;
      noveltyExtractionPath = 'noveltyRaw (object)';
    } else if (typeof evaluation.novelty === 'number' && evaluation.novelty > 0) {
      baseNoveltyScore = evaluation.novelty;
      noveltyExtractionPath = 'evaluation.novelty (number)';
    } else if (typeof evaluation.scoring?.novelty === 'number' && evaluation.scoring.novelty > 0) {
      baseNoveltyScore = evaluation.scoring.novelty;
      noveltyExtractionPath = 'evaluation.scoring.novelty (number)';
    } else if (typeof evaluation.scoring?.novelty === 'object') {
      baseNoveltyScore =
        evaluation.scoring.novelty.base_score ??
        evaluation.scoring.novelty.final_score ??
        evaluation.scoring.novelty.score ??
        0;
      noveltyExtractionPath = 'evaluation.scoring.novelty (object)';
    } else if (typeof evaluation.novelty === 'string') {
      const parsed = parseFloat(evaluation.novelty);
      if (!isNaN(parsed) && parsed > 0) {
        baseNoveltyScore = parsed;
        noveltyExtractionPath = 'evaluation.novelty (string parsed)';
      }
    } else if (evaluation.scores?.novelty) {
      baseNoveltyScore =
        typeof evaluation.scores.novelty === 'number' ? evaluation.scores.novelty : 0;
      noveltyExtractionPath = 'evaluation.scores.novelty';
    } else if (evaluation.evaluation?.novelty) {
      baseNoveltyScore =
        typeof evaluation.evaluation.novelty === 'number' ? evaluation.evaluation.novelty : 0;
      noveltyExtractionPath = 'evaluation.evaluation.novelty';
    }

    let baseDensityScore = 0;
    let densityExtractionPath = 'none';

    if (typeof densityRaw === 'number' && densityRaw > 0) {
      baseDensityScore = densityRaw;
      densityExtractionPath = 'densityRaw (number)';
    } else if (typeof densityRaw === 'object' && densityRaw !== null) {
      baseDensityScore = densityRaw.base_score ?? densityRaw.final_score ?? densityRaw.score ?? 0;
      densityExtractionPath = 'densityRaw (object)';
    } else if (typeof evaluation.density === 'number' && evaluation.density > 0) {
      baseDensityScore = evaluation.density;
      densityExtractionPath = 'evaluation.density (number)';
    } else if (typeof evaluation.scoring?.density === 'number' && evaluation.scoring.density > 0) {
      baseDensityScore = evaluation.scoring.density;
      densityExtractionPath = 'evaluation.scoring.density (number)';
    } else if (typeof evaluation.scoring?.density === 'object') {
      baseDensityScore =
        evaluation.scoring.density.base_score ??
        evaluation.scoring.density.final_score ??
        evaluation.scoring.density.score ??
        0;
      densityExtractionPath = 'evaluation.scoring.density (object)';
    } else if (typeof evaluation.density === 'string') {
      const parsed = parseFloat(evaluation.density);
      if (!isNaN(parsed) && parsed > 0) {
        baseDensityScore = parsed;
        densityExtractionPath = 'evaluation.density (string parsed)';
      }
    } else if (evaluation.scores?.density) {
      baseDensityScore =
        typeof evaluation.scores.density === 'number' ? evaluation.scores.density : 0;
      densityExtractionPath = 'evaluation.scores.density';
    } else if (evaluation.evaluation?.density) {
      baseDensityScore =
        typeof evaluation.evaluation.density === 'number' ? evaluation.evaluation.density : 0;
      densityExtractionPath = 'evaluation.evaluation.density';
    }

    // Extract coherence score with extensive fallback (same as density)
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalCoherenceScore = 0;
    let coherenceExtractionPath = 'none';

    if (typeof coherenceRaw === 'number' && coherenceRaw > 0) {
      finalCoherenceScore = coherenceRaw;
      coherenceExtractionPath = 'coherenceRaw (number)';
    } else if (typeof coherenceRaw === 'object' && coherenceRaw !== null) {
      finalCoherenceScore =
        coherenceRaw.score ?? coherenceRaw.final_score ?? coherenceRaw.base_score ?? 0;
      coherenceExtractionPath = 'coherenceRaw (object)';
    } else if (typeof evaluation.coherence === 'number' && evaluation.coherence > 0) {
      finalCoherenceScore = evaluation.coherence;
      coherenceExtractionPath = 'evaluation.coherence (number)';
    } else if (
      typeof evaluation.scoring?.coherence === 'number' &&
      evaluation.scoring.coherence > 0
    ) {
      finalCoherenceScore = evaluation.scoring.coherence;
      coherenceExtractionPath = 'evaluation.scoring.coherence (number)';
    } else if (typeof evaluation.scoring?.coherence === 'object') {
      finalCoherenceScore =
        evaluation.scoring.coherence.score ??
        evaluation.scoring.coherence.final_score ??
        evaluation.scoring.coherence.base_score ??
        0;
      coherenceExtractionPath = 'evaluation.scoring.coherence (object)';
    } else if (evaluation.scoring?.coherence?.score) {
      finalCoherenceScore = evaluation.scoring.coherence.score;
      coherenceExtractionPath = 'evaluation.scoring.coherence.score';
    } else if (evaluation.scoring?.coherence?.final_score) {
      finalCoherenceScore = evaluation.scoring.coherence.final_score;
      coherenceExtractionPath = 'evaluation.scoring.coherence.final_score';
    } else if (evaluation.scoring?.coherence?.value) {
      finalCoherenceScore = evaluation.scoring.coherence.value;
      coherenceExtractionPath = 'evaluation.scoring.coherence.value';
    } else if (evaluation.coherence_score) {
      finalCoherenceScore =
        typeof evaluation.coherence_score === 'number' ? evaluation.coherence_score : 0;
      coherenceExtractionPath = 'evaluation.coherence_score';
    } else if (evaluation.scores?.coherence) {
      finalCoherenceScore =
        typeof evaluation.scores.coherence === 'number' ? evaluation.scores.coherence : 0;
      coherenceExtractionPath = 'evaluation.scores.coherence';
    } else if (typeof evaluation.coherence === 'string') {
      const parsed = parseFloat(evaluation.coherence);
      if (!isNaN(parsed) && parsed > 0) {
        finalCoherenceScore = parsed;
        coherenceExtractionPath = 'evaluation.coherence (string parsed)';
      }
    } else if (evaluation.evaluation?.coherence) {
      finalCoherenceScore =
        typeof evaluation.evaluation.coherence === 'number' ? evaluation.evaluation.coherence : 0;
      coherenceExtractionPath = 'evaluation.evaluation.coherence';
    } else if (evaluation.evaluation?.scoring?.coherence?.score) {
      finalCoherenceScore = evaluation.evaluation.scoring.coherence.score;
      coherenceExtractionPath = 'evaluation.evaluation.scoring.coherence.score';
    } else if (evaluation.evaluation?.scoring?.coherence?.final_score) {
      finalCoherenceScore = evaluation.evaluation.scoring.coherence.final_score;
      coherenceExtractionPath = 'evaluation.evaluation.scoring.coherence.final_score';
    }

    let coherenceScore = finalCoherenceScore;

    debug('EvaluateWithGrok', 'Score extraction paths (novelty/density)', {
      novelty: { score: baseNoveltyScore, path: noveltyExtractionPath },
      density: { score: baseDensityScore, path: densityExtractionPath },
      coherence: { score: coherenceScore, path: coherenceExtractionPath },
    });

    // Extract alignment score with extensive fallback (same as density)
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalAlignmentScore = 0;
    let alignmentExtractionPath = 'none';

    if (typeof alignmentRaw === 'number' && alignmentRaw > 0) {
      finalAlignmentScore = alignmentRaw;
      alignmentExtractionPath = 'alignmentRaw (number)';
    } else if (typeof alignmentRaw === 'object' && alignmentRaw !== null) {
      finalAlignmentScore =
        alignmentRaw.score ?? alignmentRaw.final_score ?? alignmentRaw.base_score ?? 0;
      alignmentExtractionPath = 'alignmentRaw (object)';
    } else if (typeof evaluation.alignment === 'number' && evaluation.alignment > 0) {
      finalAlignmentScore = evaluation.alignment;
      alignmentExtractionPath = 'evaluation.alignment (number)';
    } else if (
      typeof evaluation.scoring?.alignment === 'number' &&
      evaluation.scoring.alignment > 0
    ) {
      finalAlignmentScore = evaluation.scoring.alignment;
      alignmentExtractionPath = 'evaluation.scoring.alignment (number)';
    } else if (typeof evaluation.scoring?.alignment === 'object') {
      finalAlignmentScore =
        evaluation.scoring.alignment.score ??
        evaluation.scoring.alignment.final_score ??
        evaluation.scoring.alignment.base_score ??
        0;
      alignmentExtractionPath = 'evaluation.scoring.alignment (object)';
    } else if (evaluation.scoring?.alignment?.score) {
      finalAlignmentScore = evaluation.scoring.alignment.score;
      alignmentExtractionPath = 'evaluation.scoring.alignment.score';
    } else if (evaluation.scoring?.alignment?.final_score) {
      finalAlignmentScore = evaluation.scoring.alignment.final_score;
      alignmentExtractionPath = 'evaluation.scoring.alignment.final_score';
    } else if (evaluation.scoring?.alignment?.value) {
      finalAlignmentScore = evaluation.scoring.alignment.value;
      alignmentExtractionPath = 'evaluation.scoring.alignment.value';
    } else if (evaluation.alignment_score) {
      finalAlignmentScore =
        typeof evaluation.alignment_score === 'number' ? evaluation.alignment_score : 0;
      alignmentExtractionPath = 'evaluation.alignment_score';
    } else if (evaluation.scores?.alignment) {
      finalAlignmentScore =
        typeof evaluation.scores.alignment === 'number' ? evaluation.scores.alignment : 0;
      alignmentExtractionPath = 'evaluation.scores.alignment';
    } else if (typeof evaluation.alignment === 'string') {
      const parsed = parseFloat(evaluation.alignment);
      if (!isNaN(parsed) && parsed > 0) {
        finalAlignmentScore = parsed;
        alignmentExtractionPath = 'evaluation.alignment (string parsed)';
      }
    } else if (evaluation.evaluation?.alignment) {
      finalAlignmentScore =
        typeof evaluation.evaluation.alignment === 'number' ? evaluation.evaluation.alignment : 0;
      alignmentExtractionPath = 'evaluation.evaluation.alignment';
    } else if (evaluation.evaluation?.scoring?.alignment?.score) {
      finalAlignmentScore = evaluation.evaluation.scoring.alignment.score;
      alignmentExtractionPath = 'evaluation.evaluation.scoring.alignment.score';
    } else if (evaluation.evaluation?.scoring?.alignment?.final_score) {
      finalAlignmentScore = evaluation.evaluation.scoring.alignment.final_score;
      alignmentExtractionPath = 'evaluation.evaluation.scoring.alignment.final_score';
    }

    // If still 0, try nested structures
    if (finalAlignmentScore === 0) {
      if (evaluation.evaluation?.alignment) {
        finalAlignmentScore =
          typeof evaluation.evaluation.alignment === 'number' ? evaluation.evaluation.alignment : 0;
      } else if (evaluation.evaluation?.scoring?.alignment?.score) {
        finalAlignmentScore = evaluation.evaluation.scoring.alignment.score;
      } else if (evaluation.evaluation?.scoring?.alignment?.final_score) {
        finalAlignmentScore = evaluation.evaluation.scoring.alignment.final_score;
      }
    }

    let alignmentScore = finalAlignmentScore;

    // Debug logging for score extraction - comprehensive with extraction paths
    debug('EvaluateWithGrok', 'Score extraction paths - all scores', {
      novelty: { score: baseNoveltyScore, path: noveltyExtractionPath },
      density: { score: baseDensityScore, path: densityExtractionPath },
      coherence: { score: coherenceScore, path: coherenceExtractionPath },
      alignment: { score: alignmentScore, path: alignmentExtractionPath },
    });

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
    });

    // If some scores are 0 but not all, log warning
    if (
      baseNoveltyScore > 0 &&
      (baseDensityScore === 0 || coherenceScore === 0 || alignmentScore === 0)
    ) {
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
        alignmentRaw,
      });
    }

    // If all scores are 0, log warning and try alternative extraction
    if (
      baseNoveltyScore === 0 &&
      baseDensityScore === 0 &&
      coherenceScore === 0 &&
      alignmentScore === 0
    ) {
      debugError('EvaluateWithGrok', 'WARNING: All scores extracted as 0', {
        evaluationStructure: JSON.stringify(evaluation, null, 2).substring(0, 3000),
        rawAnswer: answer.substring(0, 2000),
      });
    }

    // Extract penalty and bonus separately (G-H-I: Fix formula violation and add score trace)
    // Use calculated vector-based redundancy if available, otherwise extract from Grok's response
    const penaltyPercent = calculatedRedundancy
      ? calculatedRedundancy.penalty_percent
      : Math.max(0, Math.min(100, Number(evaluation.redundancy_penalty_percent ?? 0)));
    
    const bonusMultiplier = calculatedRedundancy
      ? calculatedRedundancy.bonus_multiplier
      : Math.max(1.0, Math.min(2.0, Number(evaluation.redundancy_bonus_multiplier ?? 1.0)));
    
    // Legacy: keep redundancyOverlapPercent for backward compatibility in metadata
    // But DO NOT use it for score calculation - use penaltyPercent and bonusMultiplier directly
    const redundancyOverlapPercent = calculatedRedundancy
      ? calculatedRedundancy.overlap_percent
      : Math.max(0, Math.min(100, Number(evaluation.redundancy_overlap_percent ?? 0)));

    // Use final_score if provided, otherwise use base score
    // Individual category scores are NOT penalized - penalty is applied to total composite score
    // Handle both object and number formats for novelty
    let finalNoveltyScore =
      (typeof noveltyRaw === 'object' && noveltyRaw !== null
        ? (noveltyRaw.final_score ?? noveltyRaw.score ?? noveltyRaw.base_score)
        : null) ?? baseNoveltyScore;

    // For density, try multiple fallback paths since Grok may return it in different formats
    // Priority: 1) Direct number, 2) Object with score fields, 3) Top-level number, 4) Scoring object
    let finalDensityScore =
      (typeof densityRaw === 'number' ? densityRaw : 0) ||
      (typeof densityRaw === 'object' && densityRaw !== null
        ? (densityRaw.final_score ?? densityRaw.score ?? densityRaw.base_score ?? 0)
        : 0) ||
      0;

    // If still 0, try more locations
    if (finalDensityScore === 0) {
      // Try all possible locations for density score in the evaluation response
      finalDensityScore =
        evaluation.density ??
        evaluation.scoring?.density?.score ??
        evaluation.scoring?.density?.final_score ??
        evaluation.scoring?.density?.base_score ??
        evaluation.scoring?.density?.value ??
        evaluation.density_score ??
        evaluation.scores?.density ??
        0;
    }

    // If still 0, try parsing as number from string
    if (finalDensityScore === 0 && typeof evaluation.density === 'string') {
      const parsed = parseFloat(evaluation.density);
      if (!isNaN(parsed)) {
        finalDensityScore = parsed;
      }
    }

    // If still 0, use base score (individual scores are NOT penalized)
    if (finalDensityScore === 0) {
      finalDensityScore = baseDensityScore;
    }

    // If still 0, try to extract from nested structures
    if (finalDensityScore === 0) {
      // Check if density is in a nested evaluation object
      if (evaluation.evaluation?.density) {
        finalDensityScore =
          typeof evaluation.evaluation.density === 'number' ? evaluation.evaluation.density : 0;
      } else if (evaluation.evaluation?.scoring?.density?.score) {
        finalDensityScore = evaluation.evaluation.scoring.density.score;
      } else if (evaluation.evaluation?.scoring?.density?.final_score) {
        finalDensityScore = evaluation.evaluation.scoring.density.final_score;
      }
    }

    // Use the best available density score (prefer finalDensityScore, fallback to baseDensityScore if final is 0)
    let densityFinal = finalDensityScore > 0 ? finalDensityScore : baseDensityScore;

    // Final debug log to see what we extracted
    debug('EvaluateWithGrok', 'Density extraction result', {
      finalDensityScore,
      baseDensityScore,
      densityFinal,
      densityRaw: densityRaw,
      densityRawType: typeof densityRaw,
      evaluationDensity: evaluation.density,
    });

    // Calculate composite/total score from all individual category scores
    // G) Ensure scoring formula is always followed: Composite = N + D + C + A
    const compositeScore = finalNoveltyScore + densityFinal + coherenceScore + alignmentScore;

    // Get base total score if provided by Grok (but prefer compositeScore for consistency)
    let basePodScore =
      evaluation.total_score ?? evaluation.pod_score ?? evaluation.poc_score ?? compositeScore;
    if (!basePodScore || basePodScore === 0) {
      basePodScore = compositeScore;
    }

    // G) Apply correct formula: Final = (Composite × (1 - penalty%/100)) × bonus_multiplier
    // This matches the published formula exactly
    const afterPenalty = basePodScore * (1 - penaltyPercent / 100);
    const afterBonus = afterPenalty * bonusMultiplier;
    const pod_score = Math.max(0, Math.min(10000, Math.round(afterBonus)));

    // H) Score trace for transparency (Marek requirement)
    const scoreTrace = {
      dimension_scores: {
        novelty: finalNoveltyScore,
        density: densityFinal,
        coherence: coherenceScore,
        alignment: alignmentScore,
      },
      composite: compositeScore,
      base_pod_score: basePodScore,
      overlap_percent: redundancyOverlapPercent,
      penalty_percent_computed: penaltyPercent,
      penalty_percent_applied: penaltyPercent, // Same for now, but can differ if gated
      bonus_multiplier_computed: bonusMultiplier,
      bonus_multiplier_applied: bonusMultiplier, // Same for now, but can differ if gated
      after_penalty: afterPenalty,
      after_bonus: afterBonus,
      final_score: pod_score,
      formula: `Final = (Composite × (1 - ${penaltyPercent}% / 100)) × ${bonusMultiplier.toFixed(3)} = ${pod_score}`,
      clamped: pod_score === 10000 || pod_score === 0,
    };

    // Use actual evaluated score for all submissions, including seed submissions
    // Qualification threshold (≥8,000 for Founder) is checked separately
    if (isSeedSubmission) {
      debug(
        'EvaluateWithGrok',
        'Foundational submission detected - using actual evaluated pod_score',
        {
          title,
          actual_scores: {
            novelty: finalNoveltyScore,
            density: densityFinal,
            coherence: coherenceScore,
            alignment: alignmentScore,
          },
          pod_score: pod_score,
          note: 'Using actual evaluated score, not overridden to 10000',
        }
      );
    }

    // Extract metal alignment
    let metals: string[] = [];
    const metalAlignment = evaluation.metal_alignment || evaluation.metals || [];
    if (Array.isArray(metalAlignment)) {
      metals = metalAlignment.map((m: string) => m.toLowerCase());
    } else if (typeof metalAlignment === 'string') {
      metals = [metalAlignment.toLowerCase()];
    }

    // Ensure we have at least one metal
    if (metals.length === 0) {
      metals = ['copper']; // Default to copper if none detected
    }

    // Determine qualification (≥8,000 for Founder)
    // IMPORTANT: Always use the discounted pod_score, not evaluation.qualified_founder
    // because Grok's qualified_founder is based on pre-discount score
    // For foundational submissions, this should always be true (10,000 >= 8000)
    const qualified = pod_score >= 8000;

    // Determine which epoch this PoC qualifies for based on composite/pod_score
    // For foundational submissions, pod_score will be 10000, which qualifies for Founder epoch
    const qualifiedEpoch = qualifyEpoch(pod_score);

    debug('EvaluateWithGrok', 'Epoch qualification determined', {
      pod_score,
      density: densityFinal,
      qualified_epoch: qualifiedEpoch,
      qualified,
      isSeedSubmission: isSeedSubmission,
      qualification_based_on: 'pod_score (composite score)',
    });

    // Final validation: If all scores are 0, this indicates a problem with Grok's response
    const allScoresZero =
      finalNoveltyScore === 0 && densityFinal === 0 && coherenceScore === 0 && alignmentScore === 0;
    if (allScoresZero) {
      // Always log this critical error with COMPREHENSIVE debugging information
      const errorDetails = {
        // Full evaluation object
        evaluationFull: JSON.stringify(evaluation, null, 2),
        // Raw Grok API response (full)
        rawAnswer: answer,
        rawAnswerLength: answer.length,
        // Full Grok API response structure
        fullGrokApiResponse: JSON.stringify(fullGrokResponse, null, 2),
        // Scoring object structure
        scoring: scoring,
        scoringString: JSON.stringify(scoring, null, 2),
        // Raw values before extraction
        noveltyRaw: noveltyRaw,
        noveltyRawType: typeof noveltyRaw,
        densityRaw: densityRaw,
        densityRawType: typeof densityRaw,
        coherenceRaw: coherenceRaw,
        coherenceRawType: typeof coherenceRaw,
        alignmentRaw: alignmentRaw,
        alignmentRawType: typeof alignmentRaw,
        // Extracted scores
        baseNoveltyScore,
        baseDensityScore,
        coherenceScore,
        alignmentScore,
        // Extraction paths used
        extractionPaths: {
          novelty: noveltyExtractionPath,
          density: densityExtractionPath,
          coherence: coherenceExtractionPath,
          alignment: alignmentExtractionPath,
        },
        // Evaluation structure analysis
        evaluationKeys: Object.keys(evaluation),
        evaluationStructure: {
          hasScoring: !!evaluation.scoring,
          scoringKeys: evaluation.scoring ? Object.keys(evaluation.scoring) : [],
          hasNovelty: 'novelty' in evaluation,
          hasDensity: 'density' in evaluation,
          hasCoherence: 'coherence' in evaluation,
          hasAlignment: 'alignment' in evaluation,
          noveltyType: typeof evaluation.novelty,
          densityType: typeof evaluation.density,
          coherenceType: typeof evaluation.coherence,
          alignmentType: typeof evaluation.alignment,
        },
        // JSON parsing candidates that were tried
        jsonCandidates: extractJsonCandidates(answer),
        // Timestamp for correlation
        timestamp: new Date().toISOString(),
      };
      const errorDetailsString = JSON.stringify(errorDetails, null, 2);
      console.error(
        '[EvaluateWithGrok] CRITICAL ERROR: All scores are 0 - Grok may not have returned scores properly',
        errorDetailsString
      );
      debugError(
        'EvaluateWithGrok',
        'CRITICAL ERROR: All scores are 0 - Grok may not have returned scores properly',
        new Error(errorDetailsString)
      );

      // Create a custom error with detailed information attached
      const error = new Error(
        'Evaluation failed: All scores are 0. This indicates the AI evaluation did not return valid scores. Please try submitting again.'
      );
      (error as any).errorDetails = errorDetails;
      (error as any).fullGrokResponse = fullGrokResponse;
      (error as any).rawAnswer = answer;
      (error as any).evaluation = evaluation;
      throw error;
    }

    // Use final scores (may have been overridden for foundational submissions)
    const finalNovelty = Math.max(0, Math.min(2500, finalNoveltyScore));
    const finalDensity = Math.max(0, Math.min(2500, densityFinal));
    const finalCoherence = Math.max(0, Math.min(2500, coherenceScore));
    const finalAlignment = Math.max(0, Math.min(2500, alignmentScore));
    const finalPodScore = Math.max(0, Math.min(10000, pod_score));
    const finalRedundancy = isSeedSubmission
      ? 0
      : Math.max(0, Math.min(100, redundancyOverlapPercent)); // Always 0 for foundational submissions
    const finalOverlap = isSeedSubmission
      ? 0
      : Math.max(0, Math.min(100, redundancyOverlapPercent));

    // Capture LLM metadata for provenance (timestamp, date, model, version, system prompt)
    const evaluationTimestamp = new Date();
    const llmMetadata = {
      timestamp: evaluationTimestamp.toISOString(),
      date: evaluationTimestamp.toISOString().split('T')[0], // YYYY-MM-DD format
      model: 'llama-3.1-8b-instant',
      model_version: '3.1',
      provider: 'Groq',
      system_prompt_preview: systemPrompt.substring(0, 500) + '...', // First 500 chars + indicator
      system_prompt_hash: crypto
        .createHash('sha256')
        .update(systemPrompt)
        .digest('hex')
        .substring(0, 16), // Hash for verification
      system_prompt_file: 'utils/grok/system-prompt.ts', // Reference to full prompt location
      evaluation_timestamp_ms: evaluationTimestamp.getTime(),
    };

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
        : evaluation.redundancy_analysis ||
          (typeof noveltyRaw === 'object' && noveltyRaw !== null ? noveltyRaw.justification : '') ||
          '',
      metal_justification: evaluation.metal_justification || '',
      founder_certificate: evaluation.founder_certificate || '',
      homebase_intro: evaluation.homebase_intro || '',
      tokenomics_recommendation: evaluation.tokenomics_recommendation || {
        eligible_epochs: [qualifiedEpoch], // Include qualified epoch in eligible epochs
        suggested_allocation: 0,
        tier_multiplier: 1,
        epoch_distribution: {},
        allocation_notes: 'Token allocation requires human admin approval',
        requires_admin_approval: true,
      },
      // Store base scores and overlap effect for transparency
      // For seed submissions, keep original base scores for transparency but award maximum final scores
      base_novelty: baseNoveltyScore,
      base_density: baseDensityScore,
      redundancy_overlap_percent: redundancyOverlapPercent,
      // Flag to indicate if this was a seed submission with qualification override
      is_seed_submission: isSeedSubmission,
      // Store raw Grok API response for display
      raw_grok_response: answer, // Store the raw markdown/text response from Grok
      // LLM Metadata for provenance and audit trail (required for all qualifying PoCs)
      llm_metadata: llmMetadata,
      // H) Score trace for transparency (Marek requirement)
      score_trace: scoreTrace,
    };
  } catch (error) {
    debugError('EvaluateWithGrok', 'Grok API call failed', error);
    throw error;
  }
}
