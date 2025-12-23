import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { pocLogTable } from '@/utils/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('PocLog', 'Fetching PoC log entries')
    
    try {
        // Check authentication (optional - can be public or require auth)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const { searchParams } = new URL(request.url)
        const submissionHash = searchParams.get('submission_hash')
        const contributor = searchParams.get('contributor')
        const eventType = searchParams.get('event_type')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')
        
        debug('PocLog', 'Query parameters', {
            submissionHash,
            contributor,
            eventType,
            limit,
            offset
        })
        
        // Build query conditions
        const conditions = []
        if (submissionHash) {
            conditions.push(eq(pocLogTable.submission_hash, submissionHash))
        }
        if (contributor) {
            conditions.push(eq(pocLogTable.contributor, contributor))
        }
        if (eventType) {
            conditions.push(eq(pocLogTable.event_type, eventType))
        }
        if (startDate) {
            conditions.push(gte(pocLogTable.created_at, new Date(startDate)))
        }
        if (endDate) {
            conditions.push(lte(pocLogTable.created_at, new Date(endDate)))
        }
        
        // Query log entries
        const logs = await db
            .select()
            .from(pocLogTable)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(pocLogTable.created_at))
            .limit(limit)
            .offset(offset)
        
        // Format log entries
        const formattedLogs = logs.map(log => ({
            id: log.id,
            submission_hash: log.submission_hash,
            contributor: log.contributor,
            event_type: log.event_type,
            event_status: log.event_status,
            title: log.title,
            category: log.category,
            request_data: log.request_data,
            response_data: log.response_data,
            evaluation_result: log.evaluation_result,
            grok_api_request: log.grok_api_request,
            grok_api_response: log.grok_api_response,
            error_message: log.error_message,
            error_stack: log.error_stack,
            processing_time_ms: log.processing_time_ms,
            metadata: log.metadata,
            created_at: log.created_at?.toISOString() || ''
        }))
        
        debug('PocLog', 'Log entries fetched', { count: formattedLogs.length })
        
        return NextResponse.json({
            logs: formattedLogs,
            count: formattedLogs.length,
            limit,
            offset
        })
    } catch (error) {
        debugError('PocLog', 'Error fetching PoC log', error)
        return NextResponse.json(
            { error: 'Failed to fetch PoC log' },
            { status: 500 }
        )
    }
}



