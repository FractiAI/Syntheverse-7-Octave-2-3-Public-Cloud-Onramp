/**
 * API endpoint to get PoC registration status
 * 
 * GET /api/poc/[hash]/registration-status
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable, allocationsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { debug, debugError } from '@/utils/debug'

export async function GET(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    const submissionHash = params.hash
    debug('RegistrationStatus', 'Fetching registration status', { submissionHash })
    
    // Prevent caching - always return fresh data
    const headers = new Headers()
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    
    try {
        const contributions = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.submission_hash, submissionHash))
            .limit(1)
        
        if (!contributions || contributions.length === 0) {
            return NextResponse.json(
                {
                    submission_hash: submissionHash,
                    registered: false,
                    error: 'Contribution not found'
                },
                { status: 404, headers }
            )
        }
        
        const contrib = contributions[0]
        
        // Also check for allocations
        const allocations = await db
            .select()
            .from(allocationsTable)
            .where(eq(allocationsTable.submission_hash, submissionHash))
        
        const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.reward), 0)
        
        return NextResponse.json({
            submission_hash: submissionHash,
            registered: contrib.registered || false,
            registration_date: contrib.registration_date?.toISOString() || null,
            transaction_hash: contrib.registration_tx_hash || null,
            stripe_payment_id: contrib.stripe_payment_id || null,
            status: contrib.status || null, // Include status field
            allocation_count: allocations.length,
            total_allocated: totalAllocated
        }, { headers })
    } catch (error) {
        debugError('RegistrationStatus', 'Error fetching registration status', error)
        return NextResponse.json(
            {
                submission_hash: submissionHash,
                registered: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500, headers }
        )
    }
}

