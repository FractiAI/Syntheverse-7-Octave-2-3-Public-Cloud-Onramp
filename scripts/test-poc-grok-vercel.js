/**
 * Test PoC functionality and Grok API integration on Vercel
 * This script tests:
 * 1. Grok API connectivity and evaluation
 * 2. Submit endpoint (will show auth requirement)
 * 3. Evaluate endpoint (if we have a submission hash)
 */

const VERCEL_URL = process.env.VERCEL_URL || 'https://syntheverse-poc.vercel.app';
const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY;

// Test PoC content
const TEST_POC = {
    title: `Test PoC - Hydrogen Holographic Framework ${Date.now()}`,
    content: `This is a test Proof-of-Contribution to verify Grok API integration with the Syntheverse PoC Evaluation Engine.

**Contribution Overview:**
This PoC explores the hydrogen-holographic fractal geometry and its applications in quantum computing and AI training frameworks. The contribution demonstrates novel insights into the relationship between atomic structure and cognitive patterns.

**Key Points:**
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
- Empirical-symbolic synthesis ✓`,
    category: 'scientific'
};

async function testGrokAPIDirectly() {
    console.log('\n🔬 Testing Grok API Directly');
    console.log('='.repeat(60));
    
    if (!GROK_API_KEY) {
        console.log('⚠️  NEXT_PUBLIC_GROK_API_KEY not found in environment');
        console.log('   Skipping direct Grok API test');
        console.log('   To test: export NEXT_PUBLIC_GROK_API_KEY=your_key');
        return { success: false, skipped: true };
    }
    
    console.log('📝 Test PoC:');
    console.log(`   Title: ${TEST_POC.title}`);
    console.log(`   Content Length: ${TEST_POC.content.length} characters`);
    console.log(`   Category: ${TEST_POC.category}`);
    
    try {
        console.log('\n⏳ Calling Grok API...');
        const startTime = Date.now();
        
        // Simplified system prompt for testing
        const systemPrompt = `You are the Syntheverse PoC Evaluation Engine. Evaluate the submitted Proof-of-Contribution and return a JSON object with:
{
    "classification": ["Research"|"Development"|"Alignment"],
    "scoring": {
        "novelty": {"base_score": <0-2500>, "redundancy_penalty_percent": <0-100>, "final_score": <0-2500>, "justification": "<text>"},
        "density": {"base_score": <0-2500>, "final_score": <0-2500>, "justification": "<text>"},
        "coherence": {"score": <0-2500>, "justification": "<text>"},
        "alignment": {"score": <0-2500>, "justification": "<text>"}
    },
    "total_score": <0-10000>,
    "qualified_founder": <true|false>,
    "metal_alignment": "Gold"|"Silver"|"Copper"|"Hybrid",
    "metal_justification": "<text>",
    "redundancy_analysis": "<text>",
    "founder_certificate": "<markdown or empty>",
    "homebase_intro": "<text>"
}`;

        const userQuery = `Evaluate this PoC:

**Title:** ${TEST_POC.title}
**Category:** ${TEST_POC.category}
**Content:**
${TEST_POC.content.substring(0, 5000)}${TEST_POC.content.length > 5000 ? '...' : ''}

Return only valid JSON, no markdown code blocks.`;

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
        
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Grok API Error (${response.status}): ${errorText}`);
            return { success: false, error: `HTTP ${response.status}: ${errorText}` };
        }
        
        const data = await response.json();
        const answer = data.choices[0]?.message?.content || '';
        
        console.log(`✅ Grok API Response received (${responseTime}ms)`);
        console.log(`   Response length: ${answer.length} characters`);
        
        // Try to parse JSON from response
        let evaluation;
        try {
            const jsonMatch = answer.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                evaluation = JSON.parse(jsonMatch[0]);
            } else {
                evaluation = JSON.parse(answer);
            }
        } catch (parseError) {
            console.log(`⚠️  Failed to parse JSON response`);
            console.log(`   Response preview: ${answer.substring(0, 200)}...`);
            return { success: false, error: 'Failed to parse JSON response', rawResponse: answer };
        }
        
        // Display evaluation results
        console.log('\n📊 Evaluation Results:');
        console.log('   Classification:', evaluation.classification || 'N/A');
        
        if (evaluation.scoring) {
            const scoring = evaluation.scoring;
            console.log('   Novelty:', scoring.novelty?.final_score || scoring.novelty?.base_score || 'N/A');
            console.log('   Density:', scoring.density?.final_score || scoring.density?.base_score || 'N/A');
            console.log('   Coherence:', scoring.coherence?.score || 'N/A');
            console.log('   Alignment:', scoring.alignment?.score || 'N/A');
        }
        
        console.log('   Total Score:', evaluation.total_score || 'N/A');
        console.log('   Qualified Founder:', evaluation.qualified_founder ? '✅ Yes' : '❌ No');
        console.log('   Metal Alignment:', evaluation.metal_alignment || 'N/A');
        
        if (evaluation.redundancy_analysis) {
            console.log('   Redundancy Analysis:', evaluation.redundancy_analysis.substring(0, 100) + '...');
        }
        
        return {
            success: true,
            evaluation,
            responseTime
        };
        
    } catch (error) {
        console.log(`❌ Error calling Grok API: ${error.message}`);
        if (error.stack) {
            console.log(`   Stack: ${error.stack}`);
        }
        return { success: false, error: error.message };
    }
}

async function testSubmitEndpoint() {
    console.log('\n📝 Testing Submit Endpoint');
    console.log('='.repeat(60));
    console.log(`   URL: ${VERCEL_URL}/api/submit`);
    
    const formData = new FormData();
    formData.append('title', TEST_POC.title);
    formData.append('text_content', TEST_POC.content);
    formData.append('category', TEST_POC.category);
    
    try {
        const response = await fetch(`${VERCEL_URL}/api/submit`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
            console.log('   ✅ Expected: Authentication required (401)');
            console.log('   ℹ️  This is correct - the endpoint requires user authentication');
            console.log('   📋 To test with auth:');
            console.log('      1. Go to https://syntheverse-poc.vercel.app/submit');
            console.log('      2. Log in with your account');
            console.log('      3. Submit a contribution');
            console.log('      4. Check if Grok evaluation completes');
            return { success: true, requiresAuth: true };
        } else if (response.ok) {
            console.log('   ✅ Submission successful!');
            console.log(`   Submission hash: ${result.submission_hash}`);
            
            if (result.evaluation) {
                console.log('   ✅ Grok evaluation completed');
                console.log(`   Pod Score: ${result.evaluation.pod_score}`);
                console.log(`   Qualified: ${result.evaluation.qualified ? '✅ Yes' : '❌ No'}`);
                console.log(`   Metals: ${result.evaluation.metals?.join(', ') || 'N/A'}`);
                console.log(`   Novelty: ${result.evaluation.novelty || 'N/A'}`);
                console.log(`   Density: ${result.evaluation.density || 'N/A'}`);
                console.log(`   Coherence: ${result.evaluation.coherence || 'N/A'}`);
                console.log(`   Alignment: ${result.evaluation.alignment || 'N/A'}`);
                
                if (result.evaluation.founder_certificate) {
                    console.log('   ✅ Founder Certificate generated');
                }
                
                if (result.evaluation.tokenomics_recommendation) {
                    console.log('   ✅ Tokenomics recommendation provided');
                }
                
                return { success: true, result, hasEvaluation: true };
            } else if (result.evaluation_error) {
                console.log(`   ⚠️  Evaluation error: ${result.evaluation_error}`);
                return { success: true, result, evaluationError: result.evaluation_error };
            } else {
                console.log('   ⚠️  No evaluation in response (may be processing)');
                return { success: true, result, hasEvaluation: false };
            }
        } else {
            console.log(`   ❌ Error: ${result.error || 'Unknown error'}`);
            if (result.message) {
                console.log(`   Message: ${result.message}`);
            }
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }
            return { success: false, error: result.error, message: result.message };
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testEvaluateEndpoint(submissionHash) {
    if (!submissionHash) {
        console.log('\n⏭️  Skipping Evaluate Endpoint Test (no submission hash)');
        return { success: false, skipped: true };
    }
    
    console.log('\n🔍 Testing Evaluate Endpoint');
    console.log('='.repeat(60));
    console.log(`   URL: ${VERCEL_URL}/api/evaluate/${submissionHash}`);
    
    try {
        const response = await fetch(`${VERCEL_URL}/api/evaluate/${submissionHash}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok && result.success) {
            console.log('   ✅ Evaluation successful');
            if (result.evaluation) {
                console.log(`   Pod Score: ${result.evaluation.pod_score}`);
                console.log(`   Qualified: ${result.evaluation.qualified ? '✅ Yes' : '❌ No'}`);
            }
            return { success: true, result };
        } else {
            console.log(`   ❌ Error: ${result.error || 'Unknown error'}`);
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.log(`   ❌ Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testHealthCheck() {
    console.log('\n🏥 Testing Health/Status Endpoints');
    console.log('='.repeat(60));
    
    const endpoints = [
        { url: `${VERCEL_URL}/`, name: 'Home page' },
        { url: `${VERCEL_URL}/api/archive/contributions`, name: 'Archive endpoint' }
    ];
    
    let allPassed = true;
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            const status = response.status;
            const statusText = status >= 200 && status < 300 ? '✅' : '⚠️';
            console.log(`   ${statusText} ${endpoint.name}: ${status} ${response.statusText}`);
            
            if (status >= 500) {
                allPassed = false;
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint.name}: ${error.message}`);
            allPassed = false;
        }
    }
    
    return allPassed;
}

async function runTests() {
    console.log('🧪 Testing PoC Functionality and Grok API on Vercel');
    console.log('='.repeat(60));
    console.log(`Production URL: ${VERCEL_URL}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    console.log(`Grok API Key: ${GROK_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    
    const results = {
        grokDirect: null,
        submit: null,
        evaluate: null,
        health: null
    };
    
    // Test 1: Health checks
    results.health = await testHealthCheck();
    
    // Test 2: Direct Grok API test (if API key available)
    results.grokDirect = await testGrokAPIDirectly();
    
    // Test 3: Submit endpoint
    results.submit = await testSubmitEndpoint();
    
    // Test 4: Evaluate endpoint (if we got a submission hash)
    if (results.submit?.success && results.submit?.result?.submission_hash) {
        results.evaluate = await testEvaluateEndpoint(results.submit.result.submission_hash);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    
    if (results.health) {
        console.log('✅ Health checks: PASSED');
    } else {
        console.log('⚠️  Health checks: Some endpoints may be unavailable');
    }
    
    if (results.grokDirect) {
        if (results.grokDirect.success) {
            console.log('✅ Grok API Direct Test: PASSED');
            console.log(`   Response time: ${results.grokDirect.responseTime}ms`);
        } else if (results.grokDirect.skipped) {
            console.log('⏭️  Grok API Direct Test: SKIPPED (no API key)');
        } else {
            console.log('❌ Grok API Direct Test: FAILED');
            if (results.grokDirect.error) {
                console.log(`   Error: ${results.grokDirect.error}`);
            }
        }
    }
    
    if (results.submit) {
        if (results.submit.success) {
            if (results.submit.requiresAuth) {
                console.log('✅ Submit Endpoint: WORKING (requires authentication)');
            } else if (results.submit.hasEvaluation) {
                console.log('✅ Submit Endpoint: WORKING');
                console.log('✅ Grok API Evaluation: COMPLETED');
            } else if (results.submit.evaluationError) {
                console.log('⚠️  Submit Endpoint: WORKING (evaluation had errors)');
                console.log(`   Evaluation Error: ${results.submit.evaluationError}`);
            } else {
                console.log('✅ Submit Endpoint: WORKING (no evaluation in response)');
            }
        } else {
            console.log('❌ Submit Endpoint: FAILED');
            if (results.submit.error) {
                console.log(`   Error: ${results.submit.error}`);
            }
        }
    }
    
    if (results.evaluate) {
        if (results.evaluate.success) {
            console.log('✅ Evaluate Endpoint: WORKING');
        } else if (results.evaluate.skipped) {
            console.log('⏭️  Evaluate Endpoint: SKIPPED');
        } else {
            console.log('❌ Evaluate Endpoint: FAILED');
        }
    }
    
    console.log('\n📋 Next Steps for Manual Testing:');
    console.log('   1. Go to https://syntheverse-poc.vercel.app/submit');
    console.log('   2. Log in with your account');
    console.log('   3. Submit a test contribution');
    console.log('   4. Verify that:');
    console.log('      - Submission succeeds');
    console.log('      - Grok API evaluation completes');
    console.log('      - Evaluation results are displayed');
    console.log('      - Founder certificate is generated (if qualified)');
    console.log('      - Tokenomics recommendation is provided');
    
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

