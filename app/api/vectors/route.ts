/**
 * API endpoint for retrieving 3D vectors for visualization
 * 
 * Returns all PoC submissions with their 3D vector coordinates
 * for visualization in the holographic hydrogen fractal sandbox
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { debug, debugError } from '@/utils/debug'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const includeEmbeddings = searchParams.get('include_embeddings') === 'true'
        
        debug('GetVectors', 'Fetching vectors for visualization', { includeEmbeddings })
        
        // Fetch all contributions with vector data
        const selectFields: any = {
            submission_hash: contributionsTable.submission_hash,
            title: contributionsTable.title,
            contributor: contributionsTable.contributor,
            category: contributionsTable.category,
            status: contributionsTable.status,
            metals: contributionsTable.metals,
            vector_x: contributionsTable.vector_x,
            vector_y: contributionsTable.vector_y,
            vector_z: contributionsTable.vector_z,
            embedding_model: contributionsTable.embedding_model,
            vector_generated_at: contributionsTable.vector_generated_at,
            metadata: contributionsTable.metadata,
            created_at: contributionsTable.created_at,
        }
        
        if (includeEmbeddings) {
            selectFields.embedding = contributionsTable.embedding
        }
        
        const contributions = await db
            .select(selectFields)
            .from(contributionsTable)
            .orderBy(contributionsTable.created_at)
        
        // Format response
        const vectors = contributions.map(contrib => ({
            id: contrib.submission_hash,
            title: contrib.title,
            contributor: contrib.contributor,
            category: contrib.category,
            status: contrib.status,
            metals: contrib.metals as string[] | null,
            vector: contrib.vector_x !== null && contrib.vector_y !== null && contrib.vector_z !== null
                ? {
                    x: Number(contrib.vector_x),
                    y: Number(contrib.vector_y),
                    z: Number(contrib.vector_z),
                }
                : null,
            embedding: includeEmbeddings && contrib.embedding ? (contrib.embedding as number[]) : undefined,
            embedding_model: contrib.embedding_model,
            vector_generated_at: contrib.vector_generated_at instanceof Date ? contrib.vector_generated_at.toISOString() : (contrib.vector_generated_at ? new Date(contrib.vector_generated_at).toISOString() : undefined),
            scores: {
                pod_score: (contrib.metadata as any)?.pod_score,
                novelty: (contrib.metadata as any)?.novelty,
                density: (contrib.metadata as any)?.density,
                coherence: (contrib.metadata as any)?.coherence,
                alignment: (contrib.metadata as any)?.alignment,
            },
            created_at: contrib.created_at instanceof Date ? contrib.created_at.toISOString() : (contrib.created_at ? new Date(contrib.created_at).toISOString() : undefined),
        }))
        
        // Filter out contributions without vectors if requested
        const filteredVectors = vectors.filter(v => v.vector !== null)
        
        debug('GetVectors', 'Vectors retrieved', { 
            total: contributions.length,
            withVectors: filteredVectors.length 
        })
        
        return NextResponse.json({
            success: true,
            count: filteredVectors.length,
            vectors: filteredVectors,
            metadata: {
                total_submissions: contributions.length,
                vectorized_submissions: filteredVectors.length,
                coordinate_system: 'HHF 3D Holographic Hydrogen Fractal Sandbox',
                hhf_constant: 'Λᴴᴴ ≈ 1.12 × 10²²',
            },
        })
    } catch (error) {
        debugError('GetVectors', 'Failed to fetch vectors', error)
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch vectors',
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}

