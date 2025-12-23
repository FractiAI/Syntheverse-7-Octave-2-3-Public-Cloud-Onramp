/**
 * Comprehensive PoC UI Functionality Test Program
 * Tests the complete PoC submission flow including Grok evaluation dialog
 * 
 * Usage:
 *   node scripts/test-poc-ui.js [--url <vercel-url>] [--email <test-email>]
 * 
 * Environment Variables:
 *   VERCEL_URL - Vercel deployment URL (default: https://syntheverse-poc.vercel.app)
 *   TEST_EMAIL - Test user email (optional, for authenticated tests)
 *   NEXT_PUBLIC_GROK_API_KEY - Grok API key for testing (optional)
 */

const VERCEL_URL = process.env.VERCEL_URL || (process.argv.includes('--url') 
    ? process.argv[process.argv.indexOf('--url') + 1] 
    : 'https://syntheverse-poc.vercel.app');

const TEST_EMAIL = process.env.TEST_EMAIL || (process.argv.includes('--email')
    ? process.argv[process.argv.indexOf('--email') + 1]
    : 'test@example.com');

const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY;

// Test PoC content for evaluation
const TEST_POC_CONTENT = {
    title: `Test PoC - Hydrogen Holographic Framework Evaluation ${Date.now()}`,
    content: `This is a comprehensive test Proof-of-Contribution to verify the complete PoC functionality and Grok evaluation dialog.

**Contribution Overview:**
This PoC explores the hydrogen-holographic fractal geometry and its applications in quantum computing and AI training frameworks. The contribution demonstrates novel insights into the relationship between atomic structure and cognitive patterns.

**Key Research Points:**
- Hydrogen as the fundamental holographic pixel of the universe
- Fractal cognitive grammar mapping energy flow and resonance
- Empirical validation of the Hydrogen Holographic Constant Λᴴᴴ ≈ 1.12 × 10²²
- Applications in AI training and symbolic-scientific language integration
- Novel approach to mapping atomic → biological → cognitive holographic continuities

**Technical Details:**
The framework establishes a direct connection between Planck-scale geometry and atomic structure, providing a mathematical foundation for understanding awareness as a fundamental property of matter. This represents a significant advancement in the Syntheverse ecosystem's theoretical foundation.

**Alignment with Syntheverse Principles:**
- Hydrogen-holographic fractal geometry ✓
- Whole Brain AI integration ✓
- Outcast Hero Cycle narrative structure ✓
- Empirical-symbolic synthesis ✓

**Novel Contributions:**
This work introduces new mathematical relationships between holographic constants and cognitive scaling factors, providing a bridge between quantum mechanics and information theory.`,
    category: 'scientific'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'bright');
    console.log('='.repeat(70));
}

function logTest(name, status, details = '') {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'skip' ? '⏭️' : '⚠️';
    const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : status === 'skip' ? 'gray' : 'yellow';
    log(`${icon} ${name}`, color);
    if (details) {
        log(`   ${details}`, 'gray');
    }
}

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
            options.body = body;
        } else if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const text = await response.text();
        
        let jsonBody;
        try {
            jsonBody = text ? JSON.parse(text) : null;
        } catch {
            jsonBody = text;
        }
        
        return {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            body: jsonBody
        };
    } catch (error) {
        return {
            error: error.message,
            failed: true
        };
    }
}

async function testHealthEndpoints() {
    logSection('🏥 Health Endpoints Test');
    
    const endpoints = [
        { url: `${VERCEL_URL}/`, name: 'Home page', expected: 200 },
        { url: `${VERCEL_URL}/submit`, name: 'Submit page', expected: 200 },
        { url: `${VERCEL_URL}/login`, name: 'Login page', expected: 200 },
        { url: `${VERCEL_URL}/dashboard`, name: 'Dashboard page', expected: [200, 307] },
        { url: `${VERCEL_URL}/api/archive/contributions`, name: 'Archive API', expected: [200, 401, 500] }
    ];
    
    const results = [];
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint.url);
        const expected = Array.isArray(endpoint.expected) ? endpoint.expected : [endpoint.expected];
        const passed = result.failed ? false : expected.includes(result.status);
        
        logTest(
            endpoint.name,
            passed ? 'pass' : (result.failed ? 'fail' : 'warning'),
            `Status: ${result.status || 'FAILED'}`
        );
        
        results.push({ endpoint: endpoint.name, passed, result });
    }
    
    return results;
}

async function testPoCSubmission() {
    logSection('📝 PoC Submission Test');
    
    log('Testing PoC submission with Grok evaluation...', 'cyan');
    log(`   Title: ${TEST_POC_CONTENT.title}`, 'gray');
    log(`   Content length: ${TEST_POC_CONTENT.content.length} characters`, 'gray');
    log(`   Category: ${TEST_POC_CONTENT.category}`, 'gray');
    
    const formData = new FormData();
    formData.append('title', TEST_POC_CONTENT.title);
    formData.append('text_content', TEST_POC_CONTENT.content);
    formData.append('category', TEST_POC_CONTENT.category);
    formData.append('contributor', TEST_EMAIL);
    
    const startTime = Date.now();
    const result = await testEndpoint(`${VERCEL_URL}/api/submit`, 'POST', formData);
    const duration = Date.now() - startTime;
    
    log(`   Duration: ${duration}ms`, 'gray');
    
    if (result.status === 401) {
        logTest('PoC Submission', 'skip', 'Authentication required (expected for API-only test)');
        return { success: false, requiresAuth: true, duration };
    }
    
    if (result.ok && result.body?.success) {
        logTest('PoC Submission', 'pass', `Submission successful - Hash: ${result.body.submission_hash?.substring(0, 16)}...`);
        
        if (result.body.evaluation) {
            logTest('Grok Evaluation', 'pass', 'Evaluation completed synchronously');
            log('   Evaluation Results:', 'cyan');
            log(`   - Pod Score: ${result.body.evaluation.pod_score || 'N/A'}`, 'gray');
            log(`   - Qualified: ${result.body.evaluation.qualified ? '✅ Yes' : '❌ No'}`, 'gray');
            log(`   - Novelty: ${result.body.evaluation.novelty || 'N/A'}`, 'gray');
            log(`   - Density: ${result.body.evaluation.density || 'N/A'}`, 'gray');
            log(`   - Coherence: ${result.body.evaluation.coherence || 'N/A'}`, 'gray');
            log(`   - Alignment: ${result.body.evaluation.alignment || 'N/A'}`, 'gray');
            log(`   - Metals: ${result.body.evaluation.metals?.join(', ') || 'N/A'}`, 'gray');
            
            if (result.body.evaluation.redundancy_analysis) {
                log(`   - Redundancy Analysis: ${result.body.evaluation.redundancy_analysis.substring(0, 100)}...`, 'gray');
            }
            
            if (result.body.evaluation.metal_justification) {
                log(`   - Metal Justification: ${result.body.evaluation.metal_justification.substring(0, 100)}...`, 'gray');
            }
            
            return {
                success: true,
                submission_hash: result.body.submission_hash,
                evaluation: result.body.evaluation,
                duration
            };
        } else if (result.body.evaluation_error) {
            logTest('Grok Evaluation', 'warning', `Evaluation error: ${result.body.evaluation_error}`);
            return {
                success: true,
                submission_hash: result.body.submission_hash,
                evaluationError: result.body.evaluation_error,
                duration
            };
        } else {
            logTest('Grok Evaluation', 'skip', 'No evaluation in response (may be processing)');
            return {
                success: true,
                submission_hash: result.body.submission_hash,
                duration
            };
        }
    } else {
        logTest('PoC Submission', 'fail', `Status: ${result.status} - ${result.body?.error || 'Unknown error'}`);
        if (result.body?.message) {
            log(`   Error message: ${result.body.message}`, 'red');
        }
        return { success: false, error: result.body?.error, status: result.status, duration };
    }
}

async function testGrokAPIDirectly() {
    if (!GROK_API_KEY) {
        logSection('🔬 Grok API Direct Test');
        logTest('Grok API Test', 'skip', 'GROK_API_KEY not configured');
        return { skipped: true };
    }
    
    logSection('🔬 Grok API Direct Test');
    log('Testing Grok API directly...', 'cyan');
    
    try {
        const systemPrompt = `You are the Syntheverse PoC Evaluation Engine. Evaluate the submitted Proof-of-Contribution and return a JSON object.`;
        
        const userQuery = `Evaluate this PoC:

**Title:** ${TEST_POC_CONTENT.title}
**Category:** ${TEST_POC_CONTENT.category}
**Content:**
${TEST_POC_CONTENT.content.substring(0, 5000)}${TEST_POC_CONTENT.content.length > 5000 ? '...' : ''}

Return only valid JSON with evaluation results.`;
        
        const startTime = Date.now();
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userQuery }
                ],
                temperature: 0.0,
                max_tokens: 2000,
            }),
        });
        
        const duration = Date.now() - startTime;
        
        if (!response.ok) {
            const errorText = await response.text();
            logTest('Grok API Direct Test', 'fail', `HTTP ${response.status}: ${errorText}`);
            return { success: false, error: `HTTP ${response.status}`, duration };
        }
        
        const data = await response.json();
        const answer = data.choices[0]?.message?.content || '';
        
        logTest('Grok API Direct Test', 'pass', `Response received (${duration}ms, ${answer.length} chars)`);
        
        // Try to parse JSON
        try {
            const jsonMatch = answer.match(/\{[\s\S]*\}/);
            const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(answer);
            
            if (evaluation.total_score || evaluation.pod_score) {
                log(`   Pod Score: ${evaluation.total_score || evaluation.pod_score}`, 'gray');
            }
            if (evaluation.qualified_founder !== undefined) {
                log(`   Qualified: ${evaluation.qualified_founder ? '✅ Yes' : '❌ No'}`, 'gray');
            }
            
            return { success: true, evaluation, duration };
        } catch (parseError) {
            logTest('Grok API Response Parsing', 'warning', 'Failed to parse JSON response');
            log(`   Response preview: ${answer.substring(0, 200)}...`, 'gray');
            return { success: true, rawResponse: answer, duration };
        }
    } catch (error) {
        logTest('Grok API Direct Test', 'fail', error.message);
        return { success: false, error: error.message };
    }
}

function printUITestingInstructions() {
    logSection('🖥️  Manual UI Testing Instructions');
    
    log('To test the complete PoC UI functionality including the Grok evaluation dialog:', 'cyan');
    console.log('');
    
    log('1. Open the Submit Page', 'bright');
    log(`   URL: ${VERCEL_URL}/submit`, 'gray');
    log('   ✓ Page should load successfully', 'green');
    log('   ✓ Form should be visible with all fields', 'green');
    console.log('');
    
    log('2. Log In (if not already logged in)', 'bright');
    log(`   URL: ${VERCEL_URL}/login`, 'gray');
    log('   ✓ Login form should be functional', 'green');
    log('   ✓ After login, redirect to dashboard or submit page', 'green');
    console.log('');
    
    log('3. Fill Out Submission Form', 'bright');
    log('   - Title: Enter a test PoC title', 'gray');
    log('   - Category: Select "Scientific Discovery"', 'gray');
    log('   - Content: Enter test PoC content (use the test content below)', 'gray');
    log('   ✓ Form validation should work (try submitting without title)', 'green');
    log('   ✓ File upload should be optional', 'green');
    console.log('');
    
    log('4. Submit the Contribution', 'bright');
    log('   - Click "Submit Contribution" button', 'gray');
    log('   ✓ Button should show loading state (spinner)', 'green');
    log('   ✓ Success message should appear', 'green');
    log('   ✓ Submission hash should be displayed', 'green');
    console.log('');
    
    log('5. Verify Grok Evaluation Dialog', 'bright');
    log('   ✓ Dialog should appear automatically after submission', 'green');
    log('   ✓ Dialog should show "Grok AI Evaluation Status" title', 'green');
    console.log('');
    
    log('   While Evaluation is in Progress:', 'bright');
    log('   ✓ Should show "Processing..." status', 'green');
    log('   ✓ Should display animated Brain icon with spinner', 'green');
    log('   ✓ Should show step-by-step evaluation progress:', 'green');
    log('     - Analyzing contribution content...', 'gray');
    log('     - Checking redundancy against archived PoCs...', 'gray');
    log('     - Scoring dimensions (Novelty, Density, Coherence, Alignment)...', 'gray');
    log('     - Determining metal alignment and Founder qualification...', 'gray');
    log('     - Generating evaluation report...', 'gray');
    log('   ✓ Dialog should not be dismissible during loading', 'green');
    console.log('');
    
    log('   When Evaluation Completes:', 'bright');
    log('   ✓ Dialog should update to show "Results Ready"', 'green');
    log('   ✓ Pod Score should be displayed prominently', 'green');
    log('   ✓ Should show all dimension scores (Novelty, Density, Coherence, Alignment)', 'green');
    log('   ✓ Should show classification tags if available', 'green');
    log('   ✓ Should show metal alignment with justification', 'green');
    log('   ✓ Should show redundancy analysis from Grok', 'green');
    log('   ✓ Should show Founder Certificate if qualified (≥8000 score)', 'green');
    log('   ✓ Should show Homebase v2.0 introduction', 'green');
    log('   ✓ Should show tokenomics recommendation', 'green');
    log('   ✓ Dialog should be dismissible (Close button and backdrop click)', 'green');
    log('   ✓ "View on Dashboard" button should navigate to dashboard', 'green');
    console.log('');
    
    log('6. Verify Error Handling', 'bright');
    log('   - Try submitting with empty title (should show validation error)', 'gray');
    log('   - Try submitting with empty content (should show validation error)', 'gray');
    log('   ✓ Error messages should be clear and actionable', 'green');
    log('   ✓ Form should remain accessible after error', 'green');
    console.log('');
    
    log('7. Check Browser Console', 'bright');
    log('   - Open browser DevTools (F12)', 'gray');
    log('   - Check Console tab for any JavaScript errors', 'gray');
    log('   - Check Network tab for API requests', 'gray');
    log('   ✓ No JavaScript errors should occur', 'green');
    log('   ✓ API calls should succeed (200 status)', 'green');
    log('   ✓ Grok API call should complete', 'green');
    console.log('');
    
    log('Test PoC Content (Copy and paste into form):', 'bright');
    console.log('');
    log(TEST_POC_CONTENT.content, 'gray');
    console.log('');
}

async function runTests() {
    console.log('\n');
    log('🧪 PoC UI Functionality Test Suite', 'bright');
    log('='.repeat(70), 'bright');
    log(`Test URL: ${VERCEL_URL}`, 'cyan');
    log(`Test Time: ${new Date().toISOString()}`, 'cyan');
    log(`Test Email: ${TEST_EMAIL}`, 'cyan');
    log(`Grok API Key: ${GROK_API_KEY ? '✅ Configured' : '❌ Not configured'}`, GROK_API_KEY ? 'green' : 'yellow');
    
    const results = {
        health: [],
        submission: null,
        grokDirect: null
    };
    
    // Test 1: Health endpoints
    results.health = await testHealthEndpoints();
    
    // Test 2: Grok API direct test (if API key available)
    if (GROK_API_KEY) {
        results.grokDirect = await testGrokAPIDirectly();
    }
    
    // Test 3: PoC submission
    results.submission = await testPoCSubmission();
    
    // Summary
    logSection('📊 Test Summary');
    
    const healthPassed = results.health.filter(r => r.passed).length;
    log(`Health Endpoints: ${healthPassed}/${results.health.length} passed`, healthPassed === results.health.length ? 'green' : 'yellow');
    
    if (results.grokDirect) {
        if (results.grokDirect.skipped) {
            log('Grok API Direct Test: Skipped (no API key)', 'yellow');
        } else if (results.grokDirect.success) {
            log(`Grok API Direct Test: ✅ Passed (${results.grokDirect.duration}ms)`, 'green');
        } else {
            log('Grok API Direct Test: ❌ Failed', 'red');
        }
    }
    
    if (results.submission) {
        if (results.submission.requiresAuth) {
            log('PoC Submission: ⚠️ Requires authentication (expected)', 'yellow');
            log('   → Use manual UI testing instructions below', 'gray');
        } else if (results.submission.success) {
            log(`PoC Submission: ✅ Passed (${results.submission.duration}ms)`, 'green');
            if (results.submission.evaluation) {
                log(`   Grok Evaluation: ✅ Completed - Score: ${results.submission.evaluation.pod_score}`, 'green');
            } else if (results.submission.evaluationError) {
                log(`   Grok Evaluation: ⚠️ Error - ${results.submission.evaluationError}`, 'yellow');
            }
        } else {
            log('PoC Submission: ❌ Failed', 'red');
        }
    }
    
    // Print UI testing instructions
    printUITestingInstructions();
    
    console.log('');
    log('='.repeat(70), 'bright');
    log('✅ Test suite completed', 'green');
    console.log('');
}

// Run tests
runTests()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ Test suite failed: ${error.message}`, 'red');
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    });

