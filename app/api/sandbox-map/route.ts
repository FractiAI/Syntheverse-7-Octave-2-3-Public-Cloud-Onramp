import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('SandboxMap', 'Fetching sandbox map data')
    
    try {
        // Get all contributions
        const contributions = await db
            .select()
            .from(contributionsTable)
        
        // Generate nodes from contributions
        const nodes = contributions.map(contrib => ({
            submission_hash: contrib.submission_hash,
            title: contrib.title,
            contributor: contrib.contributor,
            status: contrib.status,
            metals: contrib.metals as string[] || [],
            coherence: (contrib.metadata as any)?.coherence,
            density: (contrib.metadata as any)?.density,
            redundancy: (contrib.metadata as any)?.redundancy,
            created_at: contrib.created_at?.toISOString()
        }))
        
        // Generate edges based on similarity (simplified for now)
        // In production, this would calculate actual similarity scores
        const edges: Array<{
            source_hash: string
            target_hash: string
            similarity_score: number
            overlap_type: string
        }> = []
        
        // Simple edge generation: connect contributions by same contributor
        const contributorMap = new Map<string, string[]>()
        contributions.forEach(contrib => {
            if (!contributorMap.has(contrib.contributor)) {
                contributorMap.set(contrib.contributor, [])
            }
            contributorMap.get(contrib.contributor)!.push(contrib.submission_hash)
        })
        
        contributorMap.forEach((hashes, contributor) => {
            for (let i = 0; i < hashes.length; i++) {
                for (let j = i + 1; j < hashes.length; j++) {
                    edges.push({
                        source_hash: hashes[i],
                        target_hash: hashes[j],
                        similarity_score: 0.5, // Placeholder
                        overlap_type: 'contributor'
                    })
                }
            }
        })
        
        const sandboxMap = {
            nodes,
            edges,
            metadata: {
                total_nodes: nodes.length,
                total_edges: edges.length,
                generated_at: new Date().toISOString()
            }
        }
        
        debug('SandboxMap', 'Sandbox map generated', {
            nodes: nodes.length,
            edges: edges.length
        })
        
        return NextResponse.json(sandboxMap)
    } catch (error) {
        debugError('SandboxMap', 'Error generating sandbox map', error)
        return NextResponse.json(
            { error: 'Failed to generate sandbox map' },
            { status: 500 }
        )
    }
}

