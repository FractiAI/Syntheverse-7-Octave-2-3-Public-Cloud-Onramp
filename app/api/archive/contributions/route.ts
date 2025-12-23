import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq, and } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('ArchiveContributions', 'Fetching contributions')
    
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const contributor = searchParams.get('contributor')
        const metal = searchParams.get('metal')
        
        debug('ArchiveContributions', 'Query parameters', { status, contributor, metal })
        
        // Build query conditions
        const conditions = []
        if (status) {
            conditions.push(eq(contributionsTable.status, status))
        }
        if (contributor) {
            conditions.push(eq(contributionsTable.contributor, contributor))
        }
        
        let contributions = await db
            .select()
            .from(contributionsTable)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(contributionsTable.created_at)
        
        // Filter by metal if specified (post-query since metals is JSONB array)
        if (metal) {
            contributions = contributions.filter(contrib => {
                const metals = contrib.metals as string[] || []
                return metals.includes(metal.toLowerCase())
            })
        }
        
        // Format contributions to match expected API response
        const formattedContributions = contributions.map(contrib => ({
            submission_hash: contrib.submission_hash,
            title: contrib.title,
            contributor: contrib.contributor,
            content_hash: contrib.content_hash,
            text_content: contrib.text_content,
            status: contrib.status,
            category: contrib.category,
            metals: contrib.metals as string[] || [],
            metadata: contrib.metadata || {},
            created_at: contrib.created_at?.toISOString() || '',
            updated_at: contrib.updated_at?.toISOString() || ''
        }))
        
        debug('ArchiveContributions', 'Contributions fetched', { count: formattedContributions.length })
        
        return NextResponse.json({
            contributions: formattedContributions,
            count: formattedContributions.length
        })
    } catch (error) {
        debugError('ArchiveContributions', 'Error fetching contributions', error)
        return NextResponse.json(
            { error: 'Failed to fetch contributions' },
            { status: 500 }
        )
    }
}


