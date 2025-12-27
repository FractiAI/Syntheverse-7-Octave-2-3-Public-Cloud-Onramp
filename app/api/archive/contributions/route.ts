import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, pocLogTable, allocationsTable } from '@/utils/db/schema'
import { eq, and, or, like, ilike } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'
import { createClient } from '@/utils/supabase/server'

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
        
        // Get all allocations to check which contributions are allocated
        const allocations = await db
            .select()
            .from(allocationsTable)
        
        const allocatedHashes = new Set(allocations.map(a => a.submission_hash))
        
        // Format contributions to match expected API response
        const formattedContributions = contributions.map(contrib => {
            const metadata = contrib.metadata as any || {}
            const qualified = metadata.qualified_founder ?? false
            
            // Use the stored qualified_epoch from metadata
            // This should have been set to the open epoch that was used to qualify the submission
            // If missing, we can't reliably determine which epoch was open at qualification time,
            // so we'll return null rather than calculating based on density (which doesn't reflect historical epoch state)
            const qualified_epoch = metadata.qualified_epoch ?? null
            
            return {
                submission_hash: contrib.submission_hash,
                title: contrib.title,
                contributor: contrib.contributor,
                content_hash: contrib.content_hash,
                text_content: contrib.text_content,
                status: contrib.status,
                category: contrib.category,
                metals: contrib.metals as string[] || [],
                // Extract scores from metadata
                pod_score: metadata.pod_score ?? null,
                novelty: metadata.novelty ?? null,
                density: metadata.density ?? null,
                coherence: metadata.coherence ?? null,
                alignment: metadata.alignment ?? null,
                redundancy: metadata.redundancy ?? null, // Redundancy percentage (0-100)
                qualified: qualified,
                qualified_epoch: qualified_epoch,
                // Direct fields
                registered: contrib.registered ?? false,
                allocated: allocatedHashes.has(contrib.submission_hash),
                metadata: metadata,
                created_at: contrib.created_at?.toISOString() || '',
                updated_at: contrib.updated_at?.toISOString() || ''
            }
        })
        
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

// POST endpoint to cleanup test submissions
export async function POST(request: NextRequest) {
    debug('ArchiveContributions', 'Cleaning up test submissions')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            debug('ArchiveContributions', 'Unauthorized cleanup attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        // Find test submissions (identified by title, contributor, or submission_hash patterns)
        const allContributions = await db
            .select()
            .from(contributionsTable)
        
        const testSubmissions = allContributions.filter(contrib => {
            const title = contrib.title?.toLowerCase() || ''
            const contributor = contrib.contributor?.toLowerCase() || ''
            const hash = contrib.submission_hash?.toLowerCase() || ''
            
            return (
                title.includes('test') ||
                title.includes('demo') ||
                contributor.includes('test') ||
                contributor.includes('@example.com') ||
                hash.endsWith('-test-123') ||
                hash.endsWith('-123')
            )
        })
        
        debug('ArchiveContributions', 'Found test submissions', { count: testSubmissions.length })
        
        let cleanedCount = 0
        
        // Delete test submissions and their logs
        for (const submission of testSubmissions) {
            try {
                // Delete related poc_log entries
                await db
                    .delete(pocLogTable)
                    .where(eq(pocLogTable.submission_hash, submission.submission_hash))
                
                // Delete the contribution
                await db
                    .delete(contributionsTable)
                    .where(eq(contributionsTable.submission_hash, submission.submission_hash))
                
                cleanedCount++
                debug('ArchiveContributions', 'Deleted test submission', {
                    hash: submission.submission_hash,
                    title: submission.title
                })
            } catch (error) {
                debugError('ArchiveContributions', 'Error deleting test submission', {
                    error,
                    hash: submission.submission_hash
                })
                // Continue with other deletions even if one fails
            }
        }
        
        debug('ArchiveContributions', 'Cleanup completed', { cleanedCount })
        
        return NextResponse.json({
            success: true,
            cleaned_count: cleanedCount,
            message: `Successfully deleted ${cleanedCount} test submission(s)`
        })
    } catch (error) {
        debugError('ArchiveContributions', 'Error cleaning up test submissions', error)
        return NextResponse.json(
            { error: 'Failed to cleanup test submissions' },
            { status: 500 }
        )
    }
}


