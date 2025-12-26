/**
 * Find Top 3 Matching Archived PoCs
 * 
 * Uses vector similarity and text matching to find the most relevant
 * archived PoCs for inclusion in Grok evaluation system prompt
 * Limited to 3 matches to reduce token usage in API calls
 */

import { debug, debugError } from '@/utils/debug'
import { db } from '@/utils/db/db'
import { pocLogTable, contributionsTable } from '@/utils/db/schema'
import { ne, sql, desc, and, or, isNotNull, eq, inArray } from 'drizzle-orm'
import { distance3D, similarityFromDistance, Vector3D } from '@/utils/vectors/hhf-3d-mapping'

export interface ArchivedPoCMatch {
    submission_hash: string
    title: string
    abstract: string | null
    formulas: string[] | null
    constants: string[] | null
    similarity_score: number
    vector_x?: number | null
    vector_y?: number | null
    vector_z?: number | null
}

/**
 * Find top 3 matching archived PoCs based on:
 * 1. Vector similarity (if vectors exist)
 * 2. Text similarity (abstract, formulas, constants)
 * 3. Recency (newer submissions prioritized if scores are equal)
 */
export async function findTop3Matches(
    currentAbstract: string,
    currentFormulas: string[],
    currentConstants: string[],
    currentVector?: { x: number; y: number; z: number } | null,
    excludeHash?: string
): Promise<ArchivedPoCMatch[]> {
    debug('FindTop3Matches', 'Finding top 3 matches', {
        abstractLength: currentAbstract.length,
        formulasCount: currentFormulas.length,
        constantsCount: currentConstants.length,
        hasVector: !!currentVector,
        excludeHash
    })
    
    try {
        // Fetch archived PoCs from poc_log table (where archive data is permanently stored)
        // Select metadata and extract archive_data in JavaScript instead of SQL
        const archivedPoCsWithLogs = await db
            .select({
                submission_hash: pocLogTable.submission_hash,
                title: pocLogTable.title,
                metadata: pocLogTable.metadata,
                created_at: pocLogTable.created_at,
            })
            .from(pocLogTable)
            .where(
                and(
                    eq(pocLogTable.event_type, 'evaluation_complete'),
                    eq(pocLogTable.event_status, 'success'),
                    sql`${pocLogTable.metadata}->'archive_data' IS NOT NULL`,
                    ...(excludeHash ? [ne(pocLogTable.submission_hash, excludeHash)] : [])
                )
            )
            .orderBy(desc(pocLogTable.created_at))
        
        // Get unique submission hashes and fetch vector data from contributions
        const uniqueHashes = Array.from(new Set(archivedPoCsWithLogs.map(p => p.submission_hash)))
        let contributions: Array<{
            submission_hash: string
            vector_x: number | null
            vector_y: number | null
            vector_z: number | null
        }> = []
        
        if (uniqueHashes.length > 0) {
            const contributionsRaw = await db
                .select({
                    submission_hash: contributionsTable.submission_hash,
                    vector_x: contributionsTable.vector_x,
                    vector_y: contributionsTable.vector_y,
                    vector_z: contributionsTable.vector_z,
                })
                .from(contributionsTable)
                .where(inArray(contributionsTable.submission_hash, uniqueHashes))
            
            // Convert numeric strings to numbers (Drizzle numeric type returns strings)
            contributions = contributionsRaw.map(c => ({
                submission_hash: c.submission_hash,
                vector_x: c.vector_x ? parseFloat(c.vector_x) : null,
                vector_y: c.vector_y ? parseFloat(c.vector_y) : null,
                vector_z: c.vector_z ? parseFloat(c.vector_z) : null,
            }))
        }
        
        // Combine log data with vector data
        // Extract archive_data from metadata JSONB field
        const archivedPoCs = archivedPoCsWithLogs
            .map(log => {
                const metadata = log.metadata as any
                const archiveData = metadata?.archive_data as { abstract?: string; formulas?: string[]; constants?: string[] } | undefined
                if (!archiveData) return null
                
                const contrib = contributions.find(c => c.submission_hash === log.submission_hash)
                return {
                    submission_hash: log.submission_hash,
                    title: log.title || '',
                    abstract: archiveData.abstract || null,
                    formulas: archiveData.formulas || null,
                    constants: archiveData.constants || null,
                    vector_x: contrib?.vector_x ?? null,
                    vector_y: contrib?.vector_y ?? null,
                    vector_z: contrib?.vector_z ?? null,
                    created_at: log.created_at
                }
            })
            .filter((poc): poc is NonNullable<typeof poc> => poc !== null)
        
        if (archivedPoCs.length === 0) {
            debug('FindTop3Matches', 'No archived PoCs found')
            return []
        }
        
        debug('FindTop3Matches', 'Fetched archived PoCs', { count: archivedPoCs.length })
        
        // Calculate similarity scores for each archived PoC
        const matches: ArchivedPoCMatch[] = archivedPoCs.map(poc => {
            let similarityScore = 0
            
            // 1. Vector similarity (if both have vectors) - 50% weight
            if (currentVector && poc.vector_x !== null && poc.vector_y !== null && poc.vector_z !== null) {
                try {
                    const currentVec: Vector3D = { x: currentVector.x, y: currentVector.y, z: currentVector.z }
                    const archivedVec: Vector3D = { 
                        x: Number(poc.vector_x), 
                        y: Number(poc.vector_y), 
                        z: Number(poc.vector_z) 
                    }
                    const vectorDistance = distance3D(currentVec, archivedVec)
                    const vectorSimilarity = similarityFromDistance(vectorDistance)
                    similarityScore += vectorSimilarity * 0.5
                } catch (error) {
                    debugError('FindTop3Matches', 'Error calculating vector similarity', error)
                }
            }
            
            // 2. Abstract similarity - 30% weight
            if (currentAbstract && poc.abstract) {
                const abstractSimilarity = calculateTextSimilarity(currentAbstract, poc.abstract)
                similarityScore += abstractSimilarity * 0.3
            }
            
            // 3. Formula overlap - 10% weight
            if (currentFormulas.length > 0 && poc.formulas && Array.isArray(poc.formulas)) {
                const formulaOverlap = calculateArrayOverlap(currentFormulas, poc.formulas)
                similarityScore += formulaOverlap * 0.1
            }
            
            // 4. Constant overlap - 10% weight
            if (currentConstants.length > 0 && poc.constants && Array.isArray(poc.constants)) {
                const constantOverlap = calculateArrayOverlap(currentConstants, poc.constants)
                similarityScore += constantOverlap * 0.1
            }
            
            return {
                submission_hash: poc.submission_hash,
                title: poc.title,
                abstract: poc.abstract,
                formulas: poc.formulas as string[] | null,
                constants: poc.constants as string[] | null,
                similarity_score: similarityScore,
                vector_x: poc.vector_x ? Number(poc.vector_x) : null,
                vector_y: poc.vector_y ? Number(poc.vector_y) : null,
                vector_z: poc.vector_z ? Number(poc.vector_z) : null,
            }
        })
        
        // Sort by similarity score (descending) and take top 3
        const top3 = matches
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, 3)
        
        debug('FindTop3Matches', 'Top 3 matches found', {
            topScore: top3[0]?.similarity_score || 0,
            minScore: top3[top3.length - 1]?.similarity_score || 0
        })
        
        return top3
    } catch (error) {
        debugError('FindTop3Matches', 'Error finding top 3 matches', error)
        return []
    }
}

/**
 * Calculate text similarity using simple word overlap
 * Returns a score between 0 and 1
 */
function calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2))
    
    if (words1.size === 0 || words2.size === 0) return 0
    
    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Calculate array overlap (Jaccard similarity)
 * Returns a score between 0 and 1
 */
function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0
    
    const set1 = new Set(arr1.map(item => item.toLowerCase().trim()))
    const set2 = new Set(arr2.map(item => item.toLowerCase().trim()))
    
    const intersection = new Set([...set1].filter(item => set2.has(item)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
}

