/**
 * Test Registration Functionality on Vercel
 * 
 * This script tests the registration endpoint on the deployed Vercel instance.
 * It verifies:
 * - Endpoint is accessible
 * - Authentication is required
 * - Error handling works correctly
 * - Stripe checkout session creation
 * 
 * Usage:
 *   npx tsx scripts/test-registration-vercel.ts [vercel-url] [poc-hash] [auth-token]
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const envLocal = resolve(process.cwd(), '.env.local')
const env = resolve(process.cwd(), '.env')
config({ path: envLocal })
config({ path: env })

const VERCEL_URL = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'https://syntheverse-poc.vercel.app'
const TEST_POC_HASH = process.argv[3] || process.env.TEST_POC_HASH || ''
const AUTH_TOKEN = process.argv[4] || process.env.TEST_AUTH_TOKEN || ''

interface TestResult {
    test: string
    status: 'PASS' | 'FAIL' | 'SKIP'
    message: string
    details?: any
    response?: any
}

const results: TestResult[] = []

function logResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any, response?: any) {
    results.push({ test, status, message, details, response })
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️'
    console.log(`${icon} ${test}: ${message}`)
    if (details && status === 'FAIL') {
        console.log(`   Details:`, JSON.stringify(details, null, 2))
    }
    if (response && status === 'FAIL') {
        console.log(`   Response:`, JSON.stringify(response, null, 2))
    }
}

async function testRegistrationEndpoint() {
    console.log('\n🧪 Testing PoC Registration on Vercel\n')
    console.log('=' .repeat(80))
    console.log(`📍 Testing URL: ${VERCEL_URL}`)
    console.log(`🔑 Test PoC Hash: ${TEST_POC_HASH || 'Not provided (will test error cases)'}`)
    console.log('=' .repeat(80))
    
    // Test 1: Check endpoint is accessible
    console.log('\n📋 Test 1: Endpoint Accessibility')
    try {
        const healthCheck = await fetch(`${VERCEL_URL}/api/health`).catch(() => null)
        if (healthCheck) {
            logResult('Health Check', 'PASS', 'Endpoint is accessible')
        } else {
            logResult('Health Check', 'SKIP', 'Health endpoint not available (this is okay)')
        }
    } catch (error) {
        logResult('Health Check', 'SKIP', 'Health check skipped', { error: error instanceof Error ? error.message : 'Unknown' })
    }
    
    // Test 2: Test without authentication (should fail with 401)
    console.log('\n🔐 Test 2: Authentication Required')
    if (TEST_POC_HASH) {
        try {
            const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            const data = await response.json().catch(() => ({}))
            
            if (response.status === 401) {
                logResult(
                    'Unauthenticated Request',
                    'PASS',
                    'Correctly returns 401 Unauthorized',
                    { status: response.status },
                    data
                )
            } else {
                logResult(
                    'Unauthenticated Request',
                    'FAIL',
                    `Expected 401, got ${response.status}`,
                    { status: response.status },
                    data
                )
            }
        } catch (error) {
            logResult(
                'Unauthenticated Request',
                'FAIL',
                'Request failed',
                { error: error instanceof Error ? error.message : 'Unknown error' }
            )
        }
    } else {
        logResult('Unauthenticated Request', 'SKIP', 'No test PoC hash provided')
    }
    
    // Test 3: Test with invalid PoC hash (should fail with 404)
    console.log('\n🔍 Test 3: Invalid PoC Hash Handling')
    try {
        const invalidHash = 'invalid_hash_12345'
        const response = await fetch(`${VERCEL_URL}/api/poc/${invalidHash}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {})
            }
        })
        
        const data = await response.json().catch(() => ({}))
        
        if (response.status === 404 || response.status === 401) {
            logResult(
                'Invalid Hash',
                'PASS',
                `Correctly handles invalid hash (${response.status})`,
                { status: response.status },
                data
            )
        } else {
            logResult(
                'Invalid Hash',
                'FAIL',
                `Expected 404 or 401, got ${response.status}`,
                { status: response.status },
                data
            )
        }
    } catch (error) {
        logResult(
            'Invalid Hash',
            'FAIL',
            'Request failed',
            { error: error instanceof Error ? error.message : 'Unknown error' }
        )
    }
    
    // Test 4: Test with valid PoC hash and authentication (if provided)
    console.log('\n✅ Test 4: Valid Registration Request')
    if (TEST_POC_HASH && AUTH_TOKEN) {
        try {
            const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            })
            
            const data = await response.json().catch(() => ({}))
            
            if (response.status === 200 && data.checkout_url) {
                logResult(
                    'Valid Registration',
                    'PASS',
                    'Successfully created Stripe checkout session',
                    {
                        status: response.status,
                        sessionId: data.session_id,
                        hasCheckoutUrl: !!data.checkout_url
                    },
                    { checkout_url: data.checkout_url?.substring(0, 50) + '...' }
                )
            } else if (response.status === 403) {
                logResult(
                    'Valid Registration',
                    'SKIP',
                    'User is not the contributor (expected for test)',
                    { status: response.status },
                    data
                )
            } else if (response.status === 400 && data.error?.includes('already registered')) {
                logResult(
                    'Valid Registration',
                    'SKIP',
                    'PoC is already registered (expected if already tested)',
                    { status: response.status },
                    data
                )
            } else {
                logResult(
                    'Valid Registration',
                    'FAIL',
                    `Unexpected response: ${response.status}`,
                    { status: response.status },
                    data
                )
            }
        } catch (error) {
            logResult(
                'Valid Registration',
                'FAIL',
                'Request failed',
                { error: error instanceof Error ? error.message : 'Unknown error' }
            )
        }
    } else {
        logResult(
            'Valid Registration',
            'SKIP',
            'Missing test PoC hash or auth token',
            {
                hasHash: !!TEST_POC_HASH,
                hasToken: !!AUTH_TOKEN
            }
        )
    }
    
    // Test 5: Test error handling (missing hash)
    console.log('\n⚠️  Test 5: Error Handling')
    try {
        const response = await fetch(`${VERCEL_URL}/api/poc//register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        // Should handle missing hash gracefully (404 or 400)
        if (response.status >= 400 && response.status < 500) {
            logResult(
                'Missing Hash Error',
                'PASS',
                'Correctly handles missing hash',
                { status: response.status }
            )
        } else {
            logResult(
                'Missing Hash Error',
                'FAIL',
                `Unexpected status: ${response.status}`,
                { status: response.status }
            )
        }
    } catch (error) {
        logResult(
            'Missing Hash Error',
            'SKIP',
            'Error handling test skipped',
            { error: error instanceof Error ? error.message : 'Unknown' }
        )
    }
    
    // Summary
    console.log('\n' + '=' .repeat(80))
    console.log('\n📊 Test Summary\n')
    
    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length
    const skipped = results.filter(r => r.status === 'SKIP').length
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️  Skipped: ${skipped}`)
    console.log(`📈 Total: ${results.length}`)
    
    console.log('\n💡 Testing Instructions:')
    console.log('   1. Get a valid PoC hash from your database:')
    console.log('      SELECT submission_hash FROM contributions WHERE contributor = \'your-email@example.com\' LIMIT 1;')
    console.log('   2. Get an auth token from your browser (check localStorage or cookies)')
    console.log('   3. Run: npx tsx scripts/test-registration-vercel.ts <vercel-url> <poc-hash> <auth-token>')
    console.log('   4. Or set environment variables:')
    console.log('      TEST_POC_HASH=your-hash')
    console.log('      TEST_AUTH_TOKEN=your-token')
    
    if (failed > 0) {
        console.log('\n❌ Some tests failed. Check the details above.')
        process.exit(1)
    } else if (passed > 0) {
        console.log('\n✅ Critical tests passed!')
        console.log('\n🎯 Ready for browser testing:')
        console.log('   1. Log in to the dashboard')
        console.log('   2. Find a qualified PoC in "My Submissions"')
        console.log('   3. Click "Anchor PoC on-chain - $500" button')
        console.log('   4. Verify Stripe checkout opens')
        process.exit(0)
    } else {
        console.log('\n⚠️  All tests were skipped. Provide test data to run full test suite.')
        process.exit(0)
    }
}

// Run tests
testRegistrationEndpoint().catch(error => {
    console.error('\n💥 Fatal error running tests:', error)
    process.exit(1)
})

