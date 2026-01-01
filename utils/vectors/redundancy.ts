/**
 * Redundancy Calculation Using Vector Similarity
 * 
 * Calculates redundancy between submissions using 3D vector coordinates
 * and embedding similarity in the holographic hydrogen fractal sandbox.
 */

import { cosineSimilarity } from './embeddings'
import { distance3D, similarityFromDistance, Vector3D } from './hhf-3d-mapping'
import { debug } from '@/utils/debug'

export interface ArchivedVector {
    submission_hash: string
    title: string
    embedding?: number[]
    vector?: Vector3D
    novelty?: number
    density?: number
    coherence?: number
    alignment?: number
}

export interface RedundancyResult {
    overlap_percent: number // 0-100% overlap (highest similarity * 100)
    penalty_percent: number // 0-100% penalty applied only for excessive overlap
    bonus_multiplier: number // 1.00..~1.30 multiplier awarded for "edge sweet spot" overlap
    similarity_score: number // 0-1 similarity (1 = identical)
    closest_vectors: Array<{
        hash: string
        title: string
        similarity: number
        distance: number
    }>
    analysis: string
}

/**
 * Calculate redundancy penalty based on vector similarity to archived PoCs
 * 
 * @param currentEmbedding Current submission's embedding
 * @param currentVector Current submission's 3D vector
 * @param archivedVectors Array of archived PoC vectors
 * @returns Redundancy result with penalty percentage and analysis
 */
export function calculateRedundancy(
    currentEmbedding: number[],
    currentVector: Vector3D,
    archivedVectors: ArchivedVector[]
): RedundancyResult {
    if (archivedVectors.length === 0) {
        return {
            overlap_percent: 0,
            penalty_percent: 0,
            bonus_multiplier: 1,
            similarity_score: 0,
            closest_vectors: [],
            analysis: 'No archived PoCs to compare against. This is the first submission.',
        }
    }
    
    const similarities: Array<{
        hash: string
        title: string
        embeddingSimilarity?: number
        vectorDistance?: number
        vectorSimilarity?: number
        combinedSimilarity: number
    }> = []
    
    const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

    // Convert cosine similarity (-1..1) to a stable [0..1] similarity.
    // This prevents negative similarity percentages in the UI/logs.
    const cosineToUnit = (cos: number): number => clamp01((cos + 1) / 2)

    // Calculate similarities to all archived vectors
    for (const archived of archivedVectors) {
        let embeddingSimilarity = 0
        let vectorDistance = Infinity
        let vectorSimilarity = 0
        
        // Calculate embedding similarity if available
        if (archived.embedding && archived.embedding.length > 0) {
            try {
                const cos = cosineSimilarity(currentEmbedding, archived.embedding)
                embeddingSimilarity = cosineToUnit(cos)
            } catch (error) {
                debug('CalculateRedundancy', 'Error calculating embedding similarity', error)
            }
        }
        
        // Calculate 3D vector distance if available
        if (archived.vector) {
            vectorDistance = distance3D(currentVector, archived.vector)
            vectorSimilarity = similarityFromDistance(vectorDistance)
        }
        
        // Combined similarity: primarily embedding similarity (semantic), with optional HHF-3D proximity signal.
        // Note: HHF 3D coords may reflect scoring-based geometry; keep it a light secondary signal.
        const combinedSimilarityRaw =
            archived.embedding && archived.vector
                ? (embeddingSimilarity * 0.85 + vectorSimilarity * 0.15)
                : archived.embedding
                  ? embeddingSimilarity
                  : vectorSimilarity
        const combinedSimilarity = clamp01(combinedSimilarityRaw)
        
        similarities.push({
            hash: archived.submission_hash,
            title: archived.title,
            embeddingSimilarity,
            vectorDistance: vectorDistance !== Infinity ? vectorDistance : undefined,
            vectorSimilarity,
            combinedSimilarity,
        })
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.combinedSimilarity - a.combinedSimilarity)
    
    // Get top 3 most similar
    const topSimilar = similarities.slice(0, 3)
    
    // Calculate redundancy penalty based on highest similarity
    // Convert similarity (0-1) to redundancy penalty (0-100%)
    // Higher similarity = higher redundancy penalty
    const maxSimilarity = similarities.length > 0 ? similarities[0].combinedSimilarity : 0

    const overlapPercent = Math.min(100, Math.max(0, maxSimilarity * 100))

    // Edge sweet-spot overlap policy (HHFS expedition prerelease):
    // - Some overlap is beneficial: it connects nodes at the boundaries.
    // - Reward a "sweet spot" of overlap at the edges (Λ_edge ≈ 1.42 ± 0.05).
    // - Do not penalize overlap until it becomes excessive.
    //
    // We operationalize Λ_edge into an overlap target centered at 14.2% (1.42 * 10),
    // with a practical tolerance band. Inside the band, award a multiplier tied to the
    // measured overlap%, e.g. 13% overlap -> ×1.13 on composite score, tapered by distance
    // from the center so the multiplier returns to ×1.00 at the band edges.
    const LAMBDA_EDGE = 1.42
    const SWEET_SPOT_CENTER = LAMBDA_EDGE * 10 // 14.2%
    const SWEET_SPOT_TOLERANCE = 5.0 // 9.2%..19.2%

    const sweetSpotDistance = Math.abs(overlapPercent - SWEET_SPOT_CENTER)
    const sweetSpotFactor =
        sweetSpotDistance <= SWEET_SPOT_TOLERANCE ? 1 - sweetSpotDistance / SWEET_SPOT_TOLERANCE : 0
    const bonusMultiplier = 1 + (overlapPercent / 100) * sweetSpotFactor

    // Penalty applies ONLY once overlap is excessive. Below the threshold, penalty is 0.
    // Above the threshold, ramp non-linearly up to 100% for near-duplicates.
    const PENALTY_START_OVERLAP = 30 // allow meaningful overlap before penalties begin
    const PENALTY_FULL_OVERLAP = 98 // treat near-duplicates as effectively duplicate

    let penaltyPercent = 0
    if (overlapPercent <= PENALTY_START_OVERLAP) {
        penaltyPercent = 0
    } else if (overlapPercent >= PENALTY_FULL_OVERLAP) {
        penaltyPercent = 100
    } else {
        const t = (overlapPercent - PENALTY_START_OVERLAP) / (PENALTY_FULL_OVERLAP - PENALTY_START_OVERLAP)
        penaltyPercent = 100 * Math.pow(t, 2) // gentle early, steep late
    }
    penaltyPercent = Math.min(100, Math.max(0, penaltyPercent))
    
    // Generate analysis text
    const closestVectors = topSimilar.map(sim => ({
        hash: sim.hash,
        title: sim.title,
        similarity: sim.combinedSimilarity,
        distance: sim.vectorDistance || 0,
    }))
    
    let analysis = `Redundancy analysis based on vector similarity (embedding + HHF 3D proximity) in holographic hydrogen fractal sandbox:\n`
    if (topSimilar.length > 0) {
        analysis += `Highest similarity: ${(maxSimilarity * 100).toFixed(1)}% with "${topSimilar[0].title}" (hash: ${topSimilar[0].hash.substring(0, 8)}...)\n`
        if (topSimilar.length > 1) {
            analysis += `Additional similar vectors:\n`
            topSimilar.slice(1).forEach((sim, idx) => {
                analysis += `  ${idx + 2}. "${sim.title}" - ${(sim.combinedSimilarity * 100).toFixed(1)}% similarity\n`
            })
        }
    }
    analysis += `\nOverlap (max similarity): ${overlapPercent.toFixed(1)}%`
    analysis += `\nEdge sweet-spot multiplier (Λ_edge≈1.42): ×${bonusMultiplier.toFixed(3)} (center=${SWEET_SPOT_CENTER.toFixed(1)}% ± ${SWEET_SPOT_TOLERANCE.toFixed(1)}%)`
    analysis += `\nExcess-overlap penalty: ${penaltyPercent.toFixed(1)}% (starts > ${PENALTY_START_OVERLAP}%)`
    
    return {
        overlap_percent: overlapPercent,
        penalty_percent: penaltyPercent,
        bonus_multiplier: bonusMultiplier,
        similarity_score: maxSimilarity,
        closest_vectors: closestVectors,
        analysis,
    }
}

