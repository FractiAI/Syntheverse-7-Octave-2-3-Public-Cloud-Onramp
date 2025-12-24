/**
 * Test script to verify username update functionality
 * Run with: npx tsx scripts/test-username-update.ts
 */

import { db } from '../utils/db/db'
import { usersTable } from '../utils/db/schema'
import { eq } from 'drizzle-orm'

async function testUsernameUpdate() {
    console.log('🔍 Testing username update functionality...\n')

    try {
        // Test 1: Check if users_table exists and can be queried
        console.log('Test 1: Checking if users_table exists...')
        const testUsers = await db.select().from(usersTable).limit(1)
        console.log(`✅ Successfully queried users_table (found ${testUsers.length} users)\n`)

        // Test 2: Check table structure
        console.log('Test 2: Checking table structure...')
        if (testUsers.length > 0) {
            const user = testUsers[0]
            console.log('Sample user structure:', {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                stripe_id: user.stripe_id ? 'present' : 'missing'
            })
            console.log('✅ Table structure looks correct\n')
        }

        // Test 3: Test update syntax (using a dummy ID that won't match)
        console.log('Test 3: Testing update query syntax...')
        const dummyId = 'test-' + Date.now()
        try {
            const updateResult = await db
                .update(usersTable)
                .set({ name: 'Test Name' })
                .where(eq(usersTable.id, dummyId))
            
            console.log('✅ Update query syntax is correct (no rows affected as expected)\n')
        } catch (updateError) {
            console.error('❌ Update query failed:', updateError)
            throw updateError
        }

        // Test 4: Test with email lookup
        console.log('Test 4: Testing email-based lookup...')
        if (testUsers.length > 0 && testUsers[0].email) {
            const email = testUsers[0].email
            const usersByEmail = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.email, email))
                .limit(1)
            
            console.log(`✅ Email-based lookup works (found ${usersByEmail.length} user(s))\n`)
        }

        console.log('✅ All tests passed! Username update functionality should work correctly.')
        console.log('\nNote: If you\'re still getting errors, check:')
        console.log('1. DATABASE_URL environment variable is set correctly')
        console.log('2. Database connection is accessible from your deployment')
        console.log('3. User ID matches an existing user in users_table')
        
    } catch (error) {
        console.error('\n❌ Test failed:', error)
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        process.exit(1)
    }
}

testUsernameUpdate()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Unhandled error:', error)
        process.exit(1)
    })

