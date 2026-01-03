/**
 * API endpoint to fetch and sync on-chain PoC registrations
 * 
 * GET /api/blockchain/on-chain-pocs
 * 
 * Queries Base Mainnet for PoC registrations and syncs with Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { queryPoCRegistrationEvents } from '@/utils/blockchain/base-mainnet-integration'
import { debug, debugError } from '@/utils/debug'

// Force dynamic rendering - this route must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        debug('OnChainPoCs', 'Fetching on-chain PoC registrations')
        
        // Query Base Mainnet for PoC registration events
        const onChainRegistrations = await queryPoCRegistrationEvents()
        
        debug('OnChainPoCs', `Found ${onChainRegistrations.length} on-chain registrations`)
        
        // Sync with Supabase - check which ones are in our database
        const syncResults = []
        const missingFromDb = []
        const missingFromChain = []
        
        // Get all registered PoCs from Supabase
        const registeredPoCs = await db
            .select()
            .from(contributionsTable)
            .where(eq(contributionsTable.registered, true))
        
        debug('OnChainPoCs', `Found ${registeredPoCs.length} registered PoCs in database`)
        
        // Create maps for quick lookup
        const onChainMap = new Map(
            onChainRegistrations.map(reg => [reg.submissionHash.toLowerCase(), reg])
        )
        const dbMap = new Map(
            registeredPoCs.map(poc => [poc.submission_hash.toLowerCase(), poc])
        )
        
        // Find PoCs on-chain but missing from DB
        for (const onChainReg of onChainRegistrations) {
            const hash = onChainReg.submissionHash.toLowerCase()
            const dbPoC = dbMap.get(hash)
            
            if (!dbPoC) {
                missingFromDb.push(onChainReg)
            } else {
                // Check if DB has correct tx hash
                const needsUpdate = !dbPoC.registration_tx_hash || 
                    dbPoC.registration_tx_hash.toLowerCase() !== onChainReg.transactionHash.toLowerCase()
                
                syncResults.push({
                    submissionHash: onChainReg.submissionHash,
                    onChain: true,
                    inDatabase: true,
                    needsUpdate,
                    onChainTxHash: onChainReg.transactionHash,
                    dbTxHash: dbPoC.registration_tx_hash,
                    blockNumber: onChainReg.blockNumber,
                    timestamp: onChainReg.timestamp
                })
            }
        }
        
        // Find PoCs in DB but missing from chain
        for (const dbPoC of registeredPoCs) {
            const hash = dbPoC.submission_hash.toLowerCase()
            if (!onChainMap.has(hash)) {
                missingFromChain.push({
                    submissionHash: dbPoC.submission_hash,
                    contributor: dbPoC.contributor,
                    registered: dbPoC.registered,
                    registrationTxHash: dbPoC.registration_tx_hash,
                    registrationDate: dbPoC.registration_date
                })
            }
        }
        
        // Auto-sync: Update DB records that need tx hash updates
        let syncedCount = 0
        for (const result of syncResults) {
            if (result.needsUpdate && result.onChainTxHash) {
                try {
                    await db
                        .update(contributionsTable)
                        .set({
                            registration_tx_hash: result.onChainTxHash,
                            updated_at: new Date()
                        })
                        .where(eq(contributionsTable.submission_hash, result.submissionHash))
                    
                    syncedCount++
                } catch (updateError) {
                    debugError('OnChainPoCs', `Failed to update ${result.submissionHash}`, updateError)
                }
            }
        }
        
        debug('OnChainPoCs', `Synced ${syncedCount} records`)
        
        return NextResponse.json({
            success: true,
            summary: {
                onChainCount: onChainRegistrations.length,
                databaseCount: registeredPoCs.length,
                syncedCount,
                missingFromDb: missingFromDb.length,
                missingFromChain: missingFromChain.length
            },
            onChainRegistrations: onChainRegistrations.map(reg => ({
                submissionHash: reg.submissionHash,
                contributor: reg.contributor,
                contributorEmail: reg.contributorEmail,
                metal: reg.metal,
                metadata: reg.metadata,
                timestamp: reg.timestamp,
                transactionHash: reg.transactionHash,
                blockNumber: reg.blockNumber,
                baseScanUrl: `https://basescan.org/tx/${reg.transactionHash}`
            })),
            syncStatus: {
                inSync: syncResults.filter(r => !r.needsUpdate).length,
                needsUpdate: syncResults.filter(r => r.needsUpdate).length,
                missingFromDb: missingFromDb.map(m => ({
                    submissionHash: m.submissionHash,
                    transactionHash: m.transactionHash,
                    blockNumber: m.blockNumber,
                    timestamp: m.timestamp
                })),
                missingFromChain: missingFromChain
            }
        })
        
    } catch (error) {
        debugError('OnChainPoCs', 'Failed to fetch on-chain PoCs', error)
        
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to fetch on-chain PoC registrations. Check network connectivity and contract configuration.'
            },
            { status: 500 }
        )
    }
}

