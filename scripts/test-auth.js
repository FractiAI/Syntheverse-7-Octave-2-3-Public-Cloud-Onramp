#!/usr/bin/env node

/**
 * Authentication Testing Script - Phase 1
 * Run this script to test all authentication functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Syntheverse PoC - Authentication Testing\n');
console.log('==========================================\n');

// Check environment setup
console.log('📋 Environment Check:');
console.log('---------------------');

const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL'
];

const envPath = '.env.local';
let envExists = false;

try {
    if (fs.existsSync(envPath)) {
        envExists = true;
        console.log('✅ .env.local file exists');

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n');

        requiredEnvVars.forEach(varName => {
            const hasVar = envLines.some(line => line.startsWith(`${varName}=`) && line.length > varName.length + 1);
            if (hasVar) {
                console.log(`✅ ${varName} configured`);
            } else {
                console.log(`❌ ${varName} missing or empty`);
            }
        });
    } else {
        console.log('❌ .env.local file missing');
        console.log('   Run: cp .env.example .env.local');
    }
} catch (error) {
    console.log('❌ Error reading .env.local:', error.message);
}

console.log('\n🗂️  Database Check:');
console.log('------------------');

// Check if database schema exists
if (fs.existsSync('utils/db/schema.ts')) {
    console.log('✅ Database schema exists');
} else {
    console.log('❌ Database schema missing');
}

// Check if auth actions exist
const authFiles = [
    'app/auth/actions.ts',
    'app/auth/callback/route.ts',
    'components/ProviderSigninBlock.tsx'
];

authFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('\n🧪 Manual Testing Steps:');
console.log('========================');
console.log('1. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('2. Test Basic Authentication:');
console.log('   - Visit: http://localhost:3000/signup');
console.log('   - Create account with email/password');
console.log('   - Check email for confirmation (if required)');
console.log('   - Login with new account');
console.log('   - Verify dashboard access');
console.log('');
console.log('3. Test Password Reset:');
console.log('   - Click "Forgot password?" on login page');
console.log('   - Enter email and check for reset email');
console.log('   - Use reset link to change password');
console.log('');
console.log('4. Test OAuth (requires Supabase configuration):');
console.log('   - Configure Google/GitHub OAuth in Supabase dashboard');
console.log('   - Click "Continue with Google/GitHub" buttons');
console.log('   - Complete OAuth flow');
console.log('   - Verify user creation and dashboard access');
console.log('');
console.log('5. Test Protected Routes:');
console.log('   - Visit http://localhost:3000/dashboard without login');
console.log('   - Should redirect to /login');
console.log('   - Login and verify dashboard access');
console.log('');
console.log('6. Test User Management:');
console.log('   - Visit http://localhost:3000/account');
console.log('   - Verify profile information displays');
console.log('   - Test logout functionality');
console.log('');

console.log('📝 Testing Checklist:');
console.log('====================');
console.log('□ Email/password signup works');
console.log('□ Email confirmation works (if enabled)');
console.log('□ Email/password login works');
console.log('□ Password reset flow works');
console.log('□ Protected routes redirect correctly');
console.log('□ User profile displays correctly');
console.log('□ Logout functionality works');
console.log('□ Google OAuth works (if configured)');
console.log('□ GitHub OAuth works (if configured)');
console.log('□ OAuth users created in database');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('==================');
console.log('• Check browser console for JavaScript errors');
console.log('• Verify Supabase project is active');
console.log('• Check NEXT_PUBLIC_SITE_URL matches localhost:3000');
console.log('• For OAuth: Configure providers in Supabase dashboard');
console.log('• Database errors: Run npm run db:migrate');
console.log('');

console.log('✅ Ready to test authentication! Run "npm run dev" and start testing.');

if (!envExists) {
    console.log('\n⚠️  WARNING: Set up .env.local first!');
    console.log('   cp .env.example .env.local');
    console.log('   # Then edit with your Supabase credentials');
}

