/**
 * Test PoC submission on Vercel deployment
 * Requires Node.js 18+ for native fetch support
 */

const VERCEL_URL = 'https://syntheverse-poc.vercel.app';
const TEST_TITLE = `Test PoC - ${Date.now()}`;
const TEST_CONTENT = `This is a test contribution to verify Grok API integration.

Key points:
- Hydrogen-holographic fractal geometry
- Quantum computing applications
- Syntheverse ecosystem alignment
- Novel research findings`;

async function testEndpoint(url, description) {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log(`   ✅ Endpoint accessible`);
            return true;
        } else {
            console.log(`   ⚠️  Endpoint returned ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function testSubmitEndpoint() {
    console.log(`\n📝 Testing Submit Endpoint (without auth - will fail auth check)`);
    console.log(`   URL: ${VERCEL_URL}/api/submit`);
    
    const formData = new FormData();
    formData.append('title', TEST_TITLE);
    formData.append('text_content', TEST_CONTENT);
    formData.append('category', 'scientific');
    formData.append('contributor', 'test@example.com');
    
    try {
        const response = await fetch(`${VERCEL_URL}/api/submit`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
            console.log(`   ✅ Expected: Authentication required (401)`);
            console.log(`   ✅ Endpoint is working correctly - auth check is active`);
            return { success: true, requiresAuth: true };
        } else if (response.status === 500) {
            console.log(`   ❌ Server error: ${result.error || 'Unknown error'}`);
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
            return { success: false, error: result.error, details: result.details };
        } else if (response.ok) {
            console.log(`   ✅ Submission successful!`);
            console.log(`   Submission hash: ${result.submission_hash}`);
            if (result.evaluation) {
                console.log(`   ✅ Grok evaluation completed`);
                console.log(`   Pod Score: ${result.evaluation.pod_score}`);
                console.log(`   Qualified: ${result.evaluation.qualified}`);
            } else if (result.evaluation_error) {
                console.log(`   ⚠️  Evaluation error: ${result.evaluation_error}`);
            }
            return { success: true, result };
        } else {
            console.log(`   ⚠️  Unexpected status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(result, null, 2));
            return { success: false, status: response.status, result };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.stack) {
            console.log(`   Stack: ${error.stack}`);
        }
        return { success: false, error: error.message };
    }
}

async function testHealthCheck() {
    console.log(`\n🏥 Testing Health/Status Endpoints`);
    
    const endpoints = [
        { url: `${VERCEL_URL}/`, name: 'Home page' },
        { url: `${VERCEL_URL}/api/archive/contributions`, name: 'Archive endpoint' }
    ];
    
    let allPassed = true;
    for (const endpoint of endpoints) {
        const passed = await testEndpoint(endpoint.url, endpoint.name);
        if (!passed) allPassed = false;
    }
    
    return allPassed;
}

async function runTests() {
    console.log('🧪 Testing Vercel Deployment');
    console.log('='.repeat(60));
    console.log(`Production URL: ${VERCEL_URL}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    
    // Test 1: Health checks
    const healthOk = await testHealthCheck();
    
    // Test 2: Submit endpoint (will fail auth, but that's expected)
    const submitResult = await testSubmitEndpoint();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    
    if (healthOk) {
        console.log('✅ Health checks: PASSED');
    } else {
        console.log('⚠️  Health checks: Some endpoints may be unavailable');
    }
    
    if (submitResult.success) {
        if (submitResult.requiresAuth) {
            console.log('✅ Submit endpoint: WORKING (requires authentication)');
            console.log('\n📝 Next Steps:');
            console.log('   1. Go to https://syntheverse-poc.vercel.app/submit');
            console.log('   2. Log in with your account');
            console.log('   3. Submit a test contribution');
            console.log('   4. Check if Grok API evaluation completes');
        } else {
            console.log('✅ Submit endpoint: WORKING');
            console.log('✅ Grok API evaluation: COMPLETED');
        }
    } else {
        console.log('❌ Submit endpoint: FAILED');
        if (submitResult.error) {
            console.log(`   Error: ${submitResult.error}`);
        }
        if (submitResult.details) {
            console.log(`   Details: ${submitResult.details}`);
        }
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check Vercel deployment logs');
        console.log('   2. Verify NEXT_PUBLIC_GROK_API_KEY is set in Vercel');
        console.log('   3. Verify DATABASE_URL is set in Vercel');
        console.log('   4. Check browser console for client-side errors');
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run tests
runTests()
    .then(() => {
        console.log('\n✅ Test script completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test script failed:', error);
        process.exit(1);
    });

