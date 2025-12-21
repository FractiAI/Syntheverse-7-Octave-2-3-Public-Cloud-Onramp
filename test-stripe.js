#!/usr/bin/env node

/**
 * Stripe Billing Testing Script - Phase 2
 * Run this script after authentication testing is complete
 */

const fs = require('fs');
const path = require('path');

console.log('💳 Syntheverse PoC - Stripe Billing Testing\n');
console.log('==========================================\n');

// Check Stripe environment setup
console.log('📋 Stripe Environment Check:');
console.log('----------------------------');

const stripeEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

let stripeConfigured = true;

try {
    if (fs.existsSync('.env.local')) {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const envLines = envContent.split('\n');

        stripeEnvVars.forEach(varName => {
            const hasVar = envLines.some(line => line.startsWith(`${varName}=`) && line.length > varName.length + 1);
            if (hasVar) {
                console.log(`✅ ${varName} configured`);
            } else {
                console.log(`❌ ${varName} missing or empty`);
                stripeConfigured = false;
            }
        });
    } else {
        console.log('❌ .env.local file missing');
        stripeConfigured = false;
    }
} catch (error) {
    console.log('❌ Error reading .env.local:', error.message);
    stripeConfigured = false;
}

// Check Stripe-related files
console.log('\n📄 Stripe Files Check:');
console.log('---------------------');

const stripeFiles = [
    'app/subscribe/page.tsx',
    'app/webhook/stripe/route.ts',
    'utils/stripe/api.ts',
    'stripeSetup.ts'
];

stripeFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('\n🧪 Stripe Testing Steps:');
console.log('=========================');

if (!stripeConfigured) {
    console.log('⚠️  WARNING: Stripe environment variables not configured!');
    console.log('   Set up your Stripe test account first.');
    console.log('   Visit: https://dashboard.stripe.com/test/');
    console.log('');
}

console.log('1. Set up Stripe Products (one-time setup):');
console.log('   npm run stripe:setup');
console.log('   # This creates test products in your Stripe account');
console.log('');

console.log('2. Start Webhook Listener (in separate terminal):');
console.log('   npm run stripe:listen');
console.log('   # Forwards webhooks from Stripe to your local server');
console.log('');

console.log('3. Test Subscription Flow:');
console.log('   - Login to your account');
console.log('   - Visit: http://localhost:3000/subscribe');
console.log('   - Click on a pricing plan');
console.log('   - Complete Stripe checkout with test card');
console.log('   - Verify redirect to success page');
console.log('   - Check database for updated plan field');
console.log('');

console.log('4. Test Customer Portal:');
console.log('   - After subscription, visit billing page');
console.log('   - Click "Manage Billing"');
console.log('   - Test plan changes, payment methods, etc.');
console.log('');

console.log('5. Test Webhook Processing:');
console.log('   - Make subscription changes in Stripe dashboard');
console.log('   - Check webhook listener terminal for events');
console.log('   - Verify database updates automatically');
console.log('');

console.log('📝 Stripe Testing Checklist:');
console.log('===========================');
console.log('□ Stripe test account created');
console.log('□ Products created via stripeSetup.ts');
console.log('□ Webhook listener running');
console.log('□ Subscription checkout works');
console.log('□ Success page redirects correctly');
console.log('□ Database plan field updates');
console.log('□ Customer portal accessible');
console.log('□ Webhook events processed');
console.log('□ Subscription changes reflected');
console.log('');

console.log('💳 Test Payment Methods:');
console.log('=======================');
console.log('Use these test card numbers in Stripe checkout:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Declined: 4000 0000 0000 0002');
console.log('• Requires auth: 4000 0025 0000 3155');
console.log('• Insufficient funds: 4000 0000 0000 9995');
console.log('• CVC check fails: 4000 0000 0000 0127');
console.log('');
console.log('All cards use any future expiry date and any CVC.');
console.log('');

console.log('🔧 Stripe Troubleshooting:');
console.log('=========================');
console.log('• Webhook errors: Check STRIPE_WEBHOOK_SECRET');
console.log('• Checkout fails: Verify NEXT_PUBLIC_SITE_URL');
console.log('• Portal not loading: Check Stripe dashboard configuration');
console.log('• Database not updating: Check webhook listener is running');
console.log('');

console.log('✅ Ready to test Stripe billing! Complete authentication testing first.');

if (!stripeConfigured) {
    console.log('\n🚨 ACTION REQUIRED: Configure Stripe environment variables in .env.local');
}

