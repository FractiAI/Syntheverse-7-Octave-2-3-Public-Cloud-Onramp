#!/usr/bin/env node

/**
 * Complete Testing Suite Runner
 * Executes all testing phases in sequence
 */

const { execSync } = require('child_process');

console.log('🧪 Syntheverse PoC - Complete Testing Suite\n');
console.log('==========================================\n');

const testPhases = [
    {
        name: 'Phase 1: Authentication Testing',
        script: 'test-auth.js',
        description: 'Test email/password auth, OAuth, user management'
    },
    {
        name: 'Phase 2: Stripe Billing Testing',
        script: 'test-stripe.js',
        description: 'Test subscriptions, payments, webhooks'
    },
    {
        name: 'Phase 3: PoC API Integration Testing',
        script: 'test-poc-api.js',
        description: 'Test contribution submission and evaluation'
    },
    {
        name: 'Phase 4: Vercel Deployment Testing',
        script: 'test-vercel.js',
        description: 'Test production deployment and scaling'
    }
];

function runTestPhase(phase) {
    console.log(`\n📋 ${phase.name}`);
    console.log('='.repeat(phase.name.length + 3));
    console.log(`${phase.description}\n`);

    try {
        console.log(`Running: node ${phase.script}`);
        execSync(`node ${phase.script}`, { stdio: 'inherit' });

        console.log(`\n✅ ${phase.name} completed successfully!\n`);
        console.log('Press Enter to continue to next phase...');

        // Wait for user input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', () => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
        });

        // Wait synchronously (not ideal but works for this use case)
        const start = Date.now();
        while (Date.now() - start < 1000) {} // Small delay

    } catch (error) {
        console.error(`\n❌ Error running ${phase.script}:`, error.message);
        console.log('\n🔧 Fix the issues above and re-run this phase.');
        process.exit(1);
    }
}

console.log('🎯 Testing Overview:');
console.log('===================');
testPhases.forEach((phase, index) => {
    console.log(`${index + 1}. ${phase.name}`);
    console.log(`   ${phase.description}`);
});
console.log('');

console.log('⚡ Quick Commands:');
console.log('=================');
console.log('npm install          # Install dependencies');
console.log('npm run db:migrate   # Set up database');
console.log('npm run dev         # Start development server');
console.log('npm run stripe:listen # Start webhook listener (separate terminal)');
console.log('');

console.log('🚀 Ready to start testing? Press Enter to begin Phase 1...');

// Wait for initial user input
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();

    // Run all test phases
    testPhases.forEach(runTestPhase);

    console.log('\n🎉 All testing phases completed!');
    console.log('=============================');
    console.log('Your Syntheverse PoC Contributor UI is fully tested and ready for production!');
    console.log('');
    console.log('📊 Summary:');
    console.log('• ✅ Authentication system tested');
    console.log('• ✅ Stripe billing integration verified');
    console.log('• ✅ PoC API integration prepared');
    console.log('• ✅ Vercel deployment ready');
    console.log('');
    console.log('🚀 Next: Deploy to Vercel and start collecting contributions!');

    process.exit(0);
});

