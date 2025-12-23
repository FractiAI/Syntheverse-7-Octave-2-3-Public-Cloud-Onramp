#!/usr/bin/env node

/**
 * Test PoC Evaluation Functionality
 * Tests submission and evaluation endpoints
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';

async function testPoCEvaluation() {
    console.log('🧪 Testing Syntheverse PoC Evaluation\n');
    console.log('=====================================\n');

    // Test data
    const testContribution = {
        title: 'Test Contribution: Hydrogen-Holographic Fractal Analysis',
        text_content: `This is a test contribution to evaluate the Syntheverse PoC evaluation system.

The contribution discusses the fundamental role of hydrogen as the universe's original awareness pixel, 
exploring how its geometry encodes the same surface-volume asymmetry seen in spacetime itself. 
We examine the Hydrogen Holographic Constant Λᴴᴴ ≈ 1.12 × 10²² and its implications for 
fractal cognitive grammar and recursive awareness structures.

Key findings:
- Hydrogen serves as the fundamental holographic pixel
- Fractal geometry maps energy flow and resonance
- Recursive awareness structures enable novel information processing
- The system demonstrates clear coherence and alignment with Syntheverse principles`,
        category: 'scientific',
        contributor: 'test-contributor@example.com'
    };

    console.log('📝 Step 1: Submitting test contribution...');
    console.log('------------------------------------------');
    
    try {
        const submitFormData = new FormData();
        submitFormData.append('title', testContribution.title);
        submitFormData.append('text_content', testContribution.text_content);
        submitFormData.append('category', testContribution.category);
        submitFormData.append('contributor', testContribution.contributor);

        // Note: In a real test, you'd need authentication cookies
        // For now, this shows the expected flow
        console.log('📤 Submission Data:');
        console.log(`   Title: ${testContribution.title}`);
        console.log(`   Category: ${testContribution.category}`);
        console.log(`   Content Length: ${testContribution.text_content.length} chars\n`);

        console.log('⚠️  Note: Submission requires authentication.');
        console.log('   Please test through the UI at:', `${BASE_URL}/submit`);
        console.log('   Or use curl with auth cookies:\n');
        
        console.log(`curl -X POST ${BASE_URL}/api/submit \\`);
        console.log(`  -F "title=${testContribution.title}" \\`);
        console.log(`  -F "text_content=${testContribution.text_content.substring(0, 100)}..." \\`);
        console.log(`  -F "category=${testContribution.category}" \\`);
        console.log(`  -H "Cookie: your-auth-cookie"`);
        console.log('');

    } catch (error) {
        console.error('❌ Error preparing submission:', error.message);
    }

    console.log('🤖 Step 2: Evaluation Process');
    console.log('------------------------------');
    console.log('After submission, the evaluation endpoint will:');
    console.log('  1. Call Grok API with Syntheverse PoC Evaluation Engine prompt');
    console.log('  2. Score on 4 dimensions (0-2,500 each):');
    console.log('     - Novelty (with redundancy penalty 0-500)');
    console.log('     - Density (with optional redundancy penalty)');
    console.log('     - Coherence');
    console.log('     - Alignment');
    console.log('  3. Calculate total score (sum, 0-10,000)');
    console.log('  4. Determine Founder qualification (≥8,000)');
    console.log('  5. Recommend metal alignment (Gold/Silver/Copper/Hybrid)');
    console.log('  6. Generate Founder Certificate if qualified');
    console.log('  7. Provide Homebase v2.0 introduction\n');

    console.log('📋 Expected Evaluation Response Format:');
    console.log('--------------------------------------');
    console.log(JSON.stringify({
        success: true,
        submission_hash: '<hash>',
        evaluation: {
            coherence: 2300,
            density: 2450,
            redundancy: 150,
            novelty: 2200,
            alignment: 2350,
            metals: ['gold'],
            pod_score: 9300,
            status: 'qualified',
            qualified_founder: true,
            classification: ['Research'],
            redundancy_analysis: 'Low redundancy compared to archive...',
            metal_justification: 'Gold: Research novelty & density',
            founder_certificate: '# 🜂 Syntheverse Founder Certificate...',
            homebase_intro: 'Welcome to Homebase v2.0...'
        },
        status: 'qualified',
        qualified: true,
        qualified_founder: true
    }, null, 2));
    console.log('');

    console.log('🧪 Manual Testing Steps:');
    console.log('========================');
    console.log('1. Start the development server:');
    console.log('   npm run dev');
    console.log('');
    console.log('2. Login to your account');
    console.log(`   ${BASE_URL}/login`);
    console.log('');
    console.log('3. Submit a contribution:');
    console.log(`   ${BASE_URL}/submit`);
    console.log('   - Fill in title and content');
    console.log('   - Select category');
    console.log('   - Submit');
    console.log('');
    console.log('4. Check the submission in dashboard');
    console.log(`   ${BASE_URL}/dashboard`);
    console.log('');
    console.log('5. Trigger evaluation (if not automatic):');
    console.log(`   POST ${BASE_URL}/api/evaluate/<submission_hash>`);
    console.log('');
    console.log('6. Check evaluation results:');
    console.log('   - View in dashboard');
    console.log('   - Check database for metadata');
    console.log('   - Review poc_log table for detailed logs');
    console.log('');

    console.log('🔍 Debugging:');
    console.log('-------------');
    console.log('1. Check environment variables:');
    console.log('   - NEXT_PUBLIC_GROK_API_KEY must be set');
    console.log('   - Check VERCEL_ENV_VARIABLES.txt for reference');
    console.log('');
    console.log('2. Check server logs for:');
    console.log('   - Grok API call details');
    console.log('   - Evaluation response parsing');
    console.log('   - Database updates');
    console.log('');
    console.log('3. Check database:');
    console.log('   - contributions table for evaluation results');
    console.log('   - poc_log table for evaluation process logs');
    console.log('');

    console.log('🧹 Step 3: Cleanup Test Submissions');
    console.log('-----------------------------------');
    console.log('After testing, clean up test submissions:');
    console.log('');
    console.log('Option 1: Use the cleanup endpoint (requires auth):');
    console.log(`   POST ${BASE_URL}/api/archive/contributions`);
    console.log('   This will automatically find and delete all test submissions');
    console.log('');
    console.log('Option 2: Delete individual contributions:');
    console.log(`   DELETE ${BASE_URL}/api/archive/contributions/<submission_hash>`);
    console.log('');
    console.log('Test submissions are identified by:');
    console.log('  - Title containing "test" or "demo"');
    console.log('  - Contributor containing "test" or "@example.com"');
    console.log('  - Submission hash ending with "-test-123" or "-123"');
    console.log('');
    console.log('⚠️  Note: Both DELETE endpoints require authentication');
    console.log('   Make sure you\'re logged in and include auth cookies');
    console.log('');

    console.log('✅ Test complete! Use the manual steps above to test the full flow.');
    console.log('⚠️  Remember to cleanup test submissions after testing!');
}

testPoCEvaluation().catch(console.error);

