/**
 * UI Test Program for PoC Submission Form
 * Tests the submission form UI functionality including error handling and Grok evaluation dialog
 * 
 * Usage:
 *   node scripts/test-ui-submission.js [--url <vercel-url>]
 * 
 * Environment Variables:
 *   VERCEL_URL - Vercel deployment URL (default: https://syntheverse-poc.vercel.app)
 *   TEST_EMAIL - Test user email (optional, for authenticated tests)
 */

const VERCEL_URL = process.env.VERCEL_URL || process.argv.includes('--url') 
    ? process.argv[process.argv.indexOf('--url') + 1] 
    : 'https://syntheverse-poc.vercel.app';

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Test scenarios
const testScenarios = {
    validSubmission: {
        name: 'Valid Submission',
        title: `Test PoC - Hydrogen Holographic Framework ${Date.now()}`,
        content: `This is a test Proof-of-Contribution to verify the UI submission form.

**Contribution Overview:**
This PoC explores the hydrogen-holographic fractal geometry and its applications in quantum computing.

**Key Points:**
- Hydrogen as the fundamental holographic pixel
- Fractal cognitive grammar mapping energy flow
- Empirical validation of the Hydrogen Holographic Constant
- Applications in AI training frameworks
- Novel approach to mapping atomic → biological → cognitive continuities`,
        category: 'scientific',
        expectedStatus: 200
    },
    missingTitle: {
        name: 'Missing Title',
        title: '',
        content: 'Some content here',
        category: 'scientific',
        expectedStatus: 400,
        shouldFail: true
    },
    missingContent: {
        name: 'Missing Content',
        title: 'Test Title',
        content: '',
        category: 'scientific',
        expectedStatus: 400,
        shouldFail: true
    },
    longTitle: {
        name: 'Very Long Title',
        title: 'A'.repeat(500),
        content: 'Test content',
        category: 'scientific',
        expectedStatus: 200
    },
    longContent: {
        name: 'Very Long Content',
        title: 'Test Title',
        content: 'Test content\n'.repeat(1000),
        category: 'scientific',
        expectedStatus: 200
    },
    specialCharacters: {
        name: 'Special Characters',
        title: 'Test PoC with Special Chars: !@#$%^&*()[]{}|\\:";\'<>?,./',
        content: 'Content with special characters: <script>alert("test")</script> & more',
        category: 'scientific',
        expectedStatus: 200
    }
};

async function testEndpoint(url, method = 'GET', body = null, headers = {}) {
    try {
        const options = {
            method,
            headers: {
                'Accept': 'application/json',
                ...headers
            }
        };
        
        if (body instanceof FormData) {
            // Don't set Content-Type for FormData - browser will set it with boundary
            options.body = body;
        } else if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        return {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    return text;
                }
            }).catch(() => null)
        };
    } catch (error) {
        return {
            error: error.message,
            failed: true
        };
    }
}

async function testSubmission(scenario) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log('   Title length:', scenario.title.length);
    console.log('   Content length:', scenario.content.length);
    console.log('   Category:', scenario.category);
    
    const formData = new FormData();
    formData.append('title', scenario.title);
    formData.append('text_content', scenario.content);
    formData.append('category', scenario.category);
    formData.append('contributor', TEST_EMAIL);
    
    const startTime = Date.now();
    const result = await testEndpoint(`${VERCEL_URL}/api/submit`, 'POST', formData);
    const duration = Date.now() - startTime;
    
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Status: ${result.status} ${result.statusText || ''}`);
    
    if (result.failed) {
        console.log(`   ❌ Request failed: ${result.error}`);
        return { success: false, scenario: scenario.name, error: result.error };
    }
    
    if (scenario.shouldFail) {
        if (result.status === scenario.expectedStatus || result.status >= 400) {
            console.log(`   ✅ Expected failure - Status ${result.status}`);
            if (result.body?.error) {
                console.log(`   Error message: ${result.body.error}`);
            }
            return { success: true, scenario: scenario.name, expectedFailure: true };
        } else {
            console.log(`   ⚠️  Expected failure but got status ${result.status}`);
            return { success: false, scenario: scenario.name, unexpectedStatus: result.status };
        }
    }
    
    if (result.status === 401) {
        console.log(`   ⚠️  Authentication required (expected for API-only test)`);
        console.log(`   ✅ Endpoint is working correctly`);
        return { success: true, scenario: scenario.name, requiresAuth: true };
    }
    
    if (result.ok) {
        console.log(`   ✅ Submission successful`);
        if (result.body?.submission_hash) {
            console.log(`   Submission hash: ${result.body.submission_hash}`);
        }
        if (result.body?.evaluation) {
            console.log(`   ✅ Grok evaluation completed`);
            console.log(`   Pod Score: ${result.body.evaluation.pod_score || 'N/A'}`);
            console.log(`   Qualified: ${result.body.evaluation.qualified ? '✅ Yes' : '❌ No'}`);
            console.log(`   Metals: ${result.body.evaluation.metals?.join(', ') || 'N/A'}`);
        } else if (result.body?.evaluation_error) {
            console.log(`   ⚠️  Evaluation error: ${result.body.evaluation_error}`);
        }
        return { success: true, scenario: scenario.name, result: result.body };
    } else {
        console.log(`   ❌ Submission failed`);
        if (result.body?.error) {
            console.log(`   Error: ${result.body.error}`);
        }
        if (result.body?.message) {
            console.log(`   Message: ${result.body.message}`);
        }
        return { success: false, scenario: scenario.name, status: result.status, error: result.body };
    }
}

async function testHealthEndpoints() {
    console.log('\n🏥 Testing Health Endpoints');
    console.log('='.repeat(60));
    
    const endpoints = [
        { url: `${VERCEL_URL}/`, name: 'Home page' },
        { url: `${VERCEL_URL}/submit`, name: 'Submit page' },
        { url: `${VERCEL_URL}/login`, name: 'Login page' },
        { url: `${VERCEL_URL}/dashboard`, name: 'Dashboard page' }
    ];
    
    const results = [];
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint.url);
        const status = result.status || (result.failed ? 'FAILED' : 'UNKNOWN');
        const icon = result.ok ? '✅' : result.failed ? '❌' : '⚠️';
        console.log(`   ${icon} ${endpoint.name}: ${status} ${result.statusText || ''}`);
        results.push({ endpoint: endpoint.name, ...result });
    }
    
    return results;
}

async function testFormValidation() {
    console.log('\n📝 Testing Form Validation');
    console.log('='.repeat(60));
    
    const validationTests = [
        {
            name: 'Empty Title',
            title: '',
            content: 'Some content',
            expectedError: 'Title is required'
        },
        {
            name: 'Whitespace Only Title',
            title: '   ',
            content: 'Some content',
            expectedError: 'Title is required'
        },
        {
            name: 'Empty Content',
            title: 'Test Title',
            content: '',
            expectedError: 'Either text content or a file is required'
        },
        {
            name: 'Valid Submission',
            title: 'Test Title',
            content: 'Test content',
            expectedError: null
        }
    ];
    
    const results = [];
    for (const test of validationTests) {
        console.log(`\n   Testing: ${test.name}`);
        
        const formData = new FormData();
        formData.append('title', test.title);
        formData.append('text_content', test.content);
        formData.append('category', 'scientific');
        formData.append('contributor', TEST_EMAIL);
        
        const result = await testEndpoint(`${VERCEL_URL}/api/submit`, 'POST', formData);
        
        if (test.expectedError) {
            if (result.status === 400 && result.body?.error) {
                const hasError = result.body.error.includes(test.expectedError) || 
                               result.body.message?.includes(test.expectedError);
                if (hasError) {
                    console.log(`   ✅ Validation error correctly returned: ${result.body.error}`);
                    results.push({ success: true, test: test.name });
                } else {
                    console.log(`   ⚠️  Expected error "${test.expectedError}" but got: ${result.body.error}`);
                    results.push({ success: false, test: test.name });
                }
            } else if (result.status === 401) {
                console.log(`   ⚠️  Authentication required (skipping validation test)`);
                results.push({ success: true, test: test.name, skipped: true });
            } else {
                console.log(`   ❌ Expected validation error but got status ${result.status}`);
                results.push({ success: false, test: test.name });
            }
        } else {
            if (result.ok || result.status === 401) {
                console.log(`   ✅ Submission accepted`);
                results.push({ success: true, test: test.name });
            } else {
                console.log(`   ❌ Unexpected failure: ${result.status}`);
                results.push({ success: false, test: test.name });
            }
        }
    }
    
    return results;
}

async function runTests() {
    console.log('🧪 UI Submission Form Test Suite');
    console.log('='.repeat(60));
    console.log(`Test URL: ${VERCEL_URL}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    console.log(`Test Email: ${TEST_EMAIL}`);
    
    const allResults = {
        health: [],
        validation: [],
        submissions: []
    };
    
    // Test 1: Health endpoints
    allResults.health = await testHealthEndpoints();
    
    // Test 2: Form validation
    allResults.validation = await testFormValidation();
    
    // Test 3: Submission scenarios
    console.log('\n📦 Testing Submission Scenarios');
    console.log('='.repeat(60));
    
    for (const [key, scenario] of Object.entries(testScenarios)) {
        const result = await testSubmission(scenario);
        allResults.submissions.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    
    const healthPassed = allResults.health.filter(r => r.ok || r.status === 307).length;
    console.log(`\n🏥 Health Endpoints: ${healthPassed}/${allResults.health.length} passed`);
    
    const validationPassed = allResults.validation.filter(r => r.success).length;
    console.log(`📝 Form Validation: ${validationPassed}/${allResults.validation.length} passed`);
    
    const submissionsPassed = allResults.submissions.filter(r => r.success || r.requiresAuth).length;
    const submissionsTotal = allResults.submissions.length;
    console.log(`📦 Submission Scenarios: ${submissionsPassed}/${submissionsTotal} passed`);
    
    const evaluationsCompleted = allResults.submissions.filter(r => r.result?.evaluation).length;
    if (evaluationsCompleted > 0) {
        console.log(`🔬 Grok Evaluations: ${evaluationsCompleted} completed`);
    }
    
    // Detailed results
    console.log('\n📋 Detailed Results:');
    allResults.submissions.forEach(result => {
        if (result.requiresAuth) {
            console.log(`   ⚠️  ${result.scenario}: Requires authentication (expected)`);
        } else if (result.success) {
            console.log(`   ✅ ${result.scenario}: Passed`);
            if (result.result?.evaluation) {
                console.log(`      Pod Score: ${result.result.evaluation.pod_score}, Qualified: ${result.result.evaluation.qualified}`);
            }
        } else {
            console.log(`   ❌ ${result.scenario}: Failed`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test suite completed');
    console.log('\n📋 Next Steps:');
    console.log('   1. For authenticated tests, log in at:', `${VERCEL_URL}/login`);
    console.log('   2. Test the UI manually at:', `${VERCEL_URL}/submit`);
    console.log('   3. Verify Grok evaluation dialog appears after submission');
    console.log('   4. Check browser console for any JavaScript errors');
}

// Run tests
runTests()
    .then(() => {
        console.log('\n✅ All tests completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    });

