/**
 * Get a test PoC hash from the database
 * 
 * Fetches a qualified, unregistered PoC hash for testing
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const envLocal = resolve(process.cwd(), '.env.local')
const env = resolve(process.cwd(), '.env')
config({ path: envLocal })
config({ path: env })

async function getTestPocHash() {
    const contributorEmail = process.argv[2] || process.env.TEST_USER_EMAIL
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not configured')
        console.log('\n💡 Try using the API endpoint instead:')
        console.log('   curl https://syntheverse-poc.vercel.app/api/archive/contributions')
        process.exit(1)
    }
    
    try {
        const { db } = await import('@/utils/db/db')
        const { contributionsTable } = await import('@/utils/db/schema')
        const { eq, and, sql } = await import('drizzle-orm')
        
        console.log('\n🔍 Searching for test PoC...\n')
        
        let query = db
            .select({
                submission_hash: contributionsTable.submission_hash,
                title: contributionsTable.title,
                contributor: contributionsTable.contributor,
                registered: contributionsTable.registered,
                pod_score: sql<string>`${contributionsTable.metadata}->>'pod_score'`,
                qualified: sql<string>`${contributionsTable.metadata}->>'qualified_founder'`,
            })
            .from(contributionsTable)
            .where(
                and(
                    eq(contributionsTable.registered, false),
                    sql`(${contributionsTable.metadata}->>'qualified_founder')::boolean = true`
                )
            )
            .limit(5)
        
        // Build query with conditions
        const conditions = []
        if (contributorEmail) {
            conditions.push(eq(contributionsTable.contributor, contributorEmail))
            conditions.push(eq(contributionsTable.registered, false))
        }
        
        if (conditions.length > 0) {
            query = query.where(and(...conditions))
        }
        }
        
        const results = await query
        
        if (results.length === 0) {
            console.log('❌ No qualified, unregistered PoCs found')
            if (contributorEmail) {
                console.log(`   (for contributor: ${contributorEmail})`)
            }
            console.log('\n💡 Options:')
            console.log('   1. Submit a new PoC and wait for evaluation')
            console.log('   2. Use a different contributor email')
            console.log('   3. Check existing PoCs: SELECT submission_hash, title, registered FROM contributions LIMIT 10;')
            process.exit(1)
        }
        
        console.log(`✅ Found ${results.length} qualified PoC(s):\n`)
        results.forEach((poc, idx) => {
            console.log(`${idx + 1}. Hash: ${poc.submission_hash}`)
            console.log(`   Title: ${poc.title?.substring(0, 60)}...`)
            console.log(`   Contributor: ${poc.contributor}`)
            console.log(`   Pod Score: ${poc.pod_score || 'N/A'}`)
            console.log(`   Registered: ${poc.registered}`)
            console.log('')
        })
        
        const firstPoc = results[0]
        console.log('📋 Use this hash for testing:')
        console.log(`   ${firstPoc.submission_hash}\n`)
        console.log('💡 Test command:')
        console.log(`   npx tsx scripts/test-registration-vercel.ts https://syntheverse-poc.vercel.app ${firstPoc.submission_hash}`)
        
    } catch (error) {
        console.error('❌ Error fetching PoC:', error)
        console.log('\n💡 Alternative: Use the API endpoint')
        console.log('   curl https://syntheverse-poc.vercel.app/api/archive/contributions | jq ".contributions[0].submission_hash"')
        process.exit(1)
    }
}

getTestPocHash()

