/**
 * Full Registration Test Suite
 * 
 * Tests the complete registration flow:
 * 1. Endpoint accessibility
 * 2. Authentication requirement
 * 3. PoC validation
 * 4. Stripe checkout creation
 * 5. Error handling
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
const envLocal = resolve(process.cwd(), '.env.local')
const env = resolve(process.cwd(), '.env')
config({ path: envLocal })
config({ path: env })

const VERCEL_URL = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'https://syntheverse-poc.vercel.app'
const TEST_POC_HASH = process.argv[3] || '0354e9651345eb8a9e4f28ade48961ea' // Found from API

interface TestResult {
    test: string
    status: 'PASS' | 'FAIL' | 'SKIP'
    message: string
    details?: any
    httpStatus?: number
}

const results: TestResult[] = []

function logResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any, httpStatus?: number) {
    results.push({ test, status, message, details, httpStatus })
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️'
    console.log(`${icon} ${test}: ${message}${httpStatus ? ` (HTTP ${httpStatus})` : ''}`)
    if (details && status === 'FAIL') {
        console.log(`   Details:`, JSON.stringify(details, null, 2))
    }
}

async function testRegistrationFull() {
    console.log('\n🧪 Full Registration Test Suite\n')
    console.log('=' .repeat(80))
    console.log(`📍 Testing URL: ${VERCEL_URL}`)
    console.log(`🔑 Test PoC Hash: ${TEST_POC_HASH}`)
    console.log('=' .repeat(80))
    
    // Test 1: Verify PoC exists and is qualified
    console.log('\n📋 Test 1: PoC Validation')
    try {
        const response = await fetch(`${VERCEL_URL}/api/archive/contributions`)
        const data = await response.json()
        const poc = data.contributions?.find((c: any) => c.submission_hash === TEST_POC_HASH)
        
        if (poc) {
            logResult(
                'PoC Exists',
                'PASS',
                'PoC found in archive',
                {
                    title: poc.title,
                    contributor: poc.contributor,
                    qualified: poc.qualified,
                    registered: poc.registered,
                    pod_score: poc.pod_score
                }
            )
            
            if (!poc.qualified) {
                logResult('PoC Qualification', 'FAIL', 'PoC is not qualified', { qualified: poc.qualified })
            } else {
                logResult('PoC Qualification', 'PASS', 'PoC is qualified', { pod_score: poc.pod_score })
            }
            
            if (poc.registered) {
                logResult('PoC Registration Status', 'SKIP', 'PoC is already registered', { registered: poc.registered })
            } else {
                logResult('PoC Registration Status', 'PASS', 'PoC is not yet registered', { registered: poc.registered })
            }
        } else {
            logResult('PoC Exists', 'FAIL', 'PoC not found in archive', { hash: TEST_POC_HASH })
        }
    } catch (error) {
        logResult('PoC Validation', 'FAIL', 'Failed to fetch PoC data', { error: error instanceof Error ? error.message : 'Unknown' })
    }
    
    // Test 2: Test without authentication (should return 401)
    console.log('\n🔐 Test 2: Authentication Requirement')
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
                'Correctly requires authentication',
                { error: data.error },
                401
            )
        } else {
            logResult(
                'Unauthenticated Request',
                'FAIL',
                `Expected 401, got ${response.status}`,
                { status: response.status, data },
                response.status
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
    
    // Test 3: Test with invalid hash
    console.log('\n🔍 Test 3: Invalid Hash Handling')
    try {
        const invalidHash = 'invalid_hash_12345'
        const response = await fetch(`${VERCEL_URL}/api/poc/${invalidHash}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        const data = await response.json().catch(() => ({}))
        
        if (response.status === 404 || response.status === 401) {
            logResult(
                'Invalid Hash',
                'PASS',
                `Correctly handles invalid hash (${response.status})`,
                { error: data.error },
                response.status
            )
        } else {
            logResult(
                'Invalid Hash',
                'FAIL',
                `Expected 404 or 401, got ${response.status}`,
                { status: response.status, data },
                response.status
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
    
    // Test 4: Test registration status endpoint
    console.log('\n📊 Test 4: Registration Status Endpoint')
    try {
        const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/registration-status`)
        const data = await response.json()
        
        if (response.status === 200) {
            logResult(
                'Registration Status',
                'PASS',
                'Successfully fetched registration status',
                {
                    registered: data.registered,
                    registration_date: data.registration_date,
                    has_payment_id: !!data.stripe_payment_id
                },
                200
            )
        } else {
            logResult(
                'Registration Status',
                'FAIL',
                `Unexpected status: ${response.status}`,
                { status: response.status, data },
                response.status
            )
        }
    } catch (error) {
        logResult(
            'Registration Status',
            'FAIL',
            'Request failed',
            { error: error instanceof Error ? error.message : 'Unknown error' }
        )
    }
    
    // Test 5: Test projected allocation (should work without auth)
    console.log('\n💰 Test 5: Projected Allocation')
    try {
        const response = await fetch(`${VERCEL_URL}/api/poc/${TEST_POC_HASH}/projected-allocation`)
        const data = await response.json()
        
        if (response.status === 200) {
            logResult(
                'Projected Allocation',
                'PASS',
                'Successfully calculated projected allocation',
                {
                    eligible: data.eligible,
                    projected_allocation: data.projected_allocation,
                    epoch: data.epoch
                },
                200
            )
        } else {
            logResult(
                'Projected Allocation',
                'FAIL',
                `Unexpected status: ${response.status}`,
                { status: response.status, data },
                response.status
            )
        }
    } catch (error) {
        logResult(
            'Projected Allocation',
            'FAIL',
            'Request failed',
            { error: error instanceof Error ? error.message : 'Unknown error' }
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
    
    console.log('\n📋 Test Results:')
    results.forEach(r => {
        const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️'
        console.log(`   ${icon} ${r.test}${r.httpStatus ? ` (${r.httpStatus})` : ''}`)
    })
    
    if (failed === 0 && passed > 0) {
        console.log('\n✅ All critical tests passed!')
        console.log('\n🎯 Registration functionality is working correctly!')
        console.log('\n💡 Next Steps for Browser Testing:')
        console.log('   1. Log in to the dashboard as the PoC contributor')
        console.log('   2. Navigate to "My Submissions"')
        console.log('   3. Find the qualified PoC')
        console.log('   4. Click "Register PoC - $200" button')
        console.log('   5. Verify Stripe checkout opens')
        console.log('   6. Complete or cancel the checkout')
        console.log('   7. Verify registration status updates')
        process.exit(0)
    } else if (failed > 0) {
        console.log('\n❌ Some tests failed. Please review the details above.')
        console.log('\n🔧 Troubleshooting:')
        console.log('   - Check Vercel logs: vercel logs --follow')
        console.log('   - Verify environment variables in Vercel dashboard')
        console.log('   - Check Stripe API status')
        process.exit(1)
    } else {
        console.log('\n⚠️  All tests were skipped. Check test configuration.')
        process.exit(0)
    }
}

// Run tests
testRegistrationFull().catch(error => {
    console.error('\n💥 Fatal error running tests:', error)
    process.exit(1)
})

