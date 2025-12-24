/**
 * Debug endpoint to view recent evaluation logs
 * Helps troubleshoot why scores are showing as 0
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { pocLogTable } from '@/utils/db/schema'
import { desc, eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(request: NextRequest) {
    debug('DebugEvaluationLogs', 'Fetching recent evaluation logs')
    
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const submissionHash = searchParams.get('hash')
        
        let query = db
            .select()
            .from(pocLogTable)
            .where(eq(pocLogTable.event_type, 'evaluation_complete'))
            .orderBy(desc(pocLogTable.created_at))
            .limit(limit)
        
        if (submissionHash) {
            query = db
                .select()
                .from(pocLogTable)
                .where(eq(pocLogTable.submission_hash, submissionHash))
                .orderBy(desc(pocLogTable.created_at))
                .limit(limit) as any
        }
        
        const logs = await query
        
        const formattedLogs = logs.map(log => ({
            id: log.id,
            submission_hash: log.submission_hash,
            title: log.title,
            created_at: log.created_at?.toISOString(),
            event_type: log.event_type,
            event_status: log.event_status,
            evaluation_result: log.evaluation_result,
            grok_api_response: log.grok_api_response,
            error_message: log.error_message,
            processing_time_ms: log.processing_time_ms
        }))
        
        return NextResponse.json({
            success: true,
            count: formattedLogs.length,
            logs: formattedLogs
        })
    } catch (error) {
        debugError('DebugEvaluationLogs', 'Failed to fetch evaluation logs', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch evaluation logs',
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}

