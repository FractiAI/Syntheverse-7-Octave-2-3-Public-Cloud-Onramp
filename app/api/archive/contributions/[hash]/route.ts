import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('ArchiveContribution', 'Fetching contribution', { submissionHash })
    
    try {
        const contribution = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contribution || contribution.length === 0) {
            debug('ArchiveContribution', 'Contribution not found', { submissionHash })
            return NextResponse.json(
                { error: 'Contribution not found' },
                { status: 404 }
            )
        }
        
        const contrib = contribution[0]
        const formatted = {
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
        }
        
        debug('ArchiveContribution', 'Contribution fetched successfully', { submissionHash })
        
        return NextResponse.json(formatted)
    } catch (error) {
        debugError('ArchiveContribution', 'Error fetching contribution', error)
        return NextResponse.json(
            { error: 'Failed to fetch contribution' },
            { status: 500 }
        )
    }
}


