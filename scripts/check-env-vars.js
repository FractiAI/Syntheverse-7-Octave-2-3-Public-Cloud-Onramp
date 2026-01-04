#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Checks which environment variables are set and which are missing
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = {
    'Supabase': [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DATABASE_URL',
    ],
    'Stripe': [
        'STRIPE_SECRET_KEY',
    ],
    'Site URLs': [
        'NEXT_PUBLIC_SITE_URL',
        'NEXT_PUBLIC_WEBSITE_URL',
    ],
    'Testing': [
        'NEXT_PUBLIC_GROK_API_KEY',
        'BASE_MAINNET_RPC_URL',
    ],
};

// Optional but recommended
const OPTIONAL_VARS = {
    'Stripe (Optional)': [
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID',
    ],
    'Blockchain (Optional)': [
        'PRIVATE_KEY',
        'BASESCAN_API_KEY',
        'SYNTH90T_CONTRACT_ADDRESS',
        'LENS_KERNEL_CONTRACT_ADDRESS',
    ],
    'OAuth (Optional)': [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
    ],
};

console.log('🔍 Checking Environment Variables\n');
console.log('='.repeat(60));

// Check .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
let envLocalExists = false;
let envLocalVars = {};

if (fs.existsSync(envLocalPath)) {
    envLocalExists = true;
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                envLocalVars[key] = value;
            }
        }
    });
    
    console.log(`✅ Found .env.local file (${Object.keys(envLocalVars).length} variables)`);
} else {
    console.log('❌ .env.local file not found');
}

console.log('\n' + '='.repeat(60));
console.log('📋 Required Variables Status:\n');

let allRequiredPresent = true;
const missing = [];

// Check required variables
for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
    console.log(`\n${category}:`);
    for (const varName of vars) {
        const envValue = process.env[varName];
        const localValue = envLocalVars[varName];
        const isSet = !!(envValue || localValue);
        
        if (isSet) {
            const source = envValue ? 'process.env' : '.env.local';
            const preview = (envValue || localValue).substring(0, 30) + '...';
            console.log(`  ✅ ${varName} (from ${source})`);
        } else {
            console.log(`  ❌ ${varName} - MISSING`);
            missing.push(varName);
            allRequiredPresent = false;
        }
    }
}

console.log('\n' + '='.repeat(60));
console.log('📋 Optional Variables Status:\n');

// Check optional variables
for (const [category, vars] of Object.entries(OPTIONAL_VARS)) {
    console.log(`\n${category}:`);
    for (const varName of vars) {
        const envValue = process.env[varName];
        const localValue = envLocalVars[varName];
        const isSet = !!(envValue || localValue);
        
        if (isSet) {
            const source = envValue ? 'process.env' : '.env.local';
            console.log(`  ✅ ${varName} (from ${source})`);
        } else {
            console.log(`  ⚠️  ${varName} - Not set (optional)`);
        }
    }
}

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:\n');

if (allRequiredPresent) {
    console.log('✅ All required environment variables are set!');
    console.log('✅ Ready to run tests');
} else {
    console.log('❌ Missing required environment variables:');
    missing.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n📝 Next Steps:');
    console.log('   1. Add missing variables to .env.local file');
    console.log('   2. Or set them in Vercel Dashboard → Settings → Environment Variables');
    console.log('   3. See docs/ENV_VARIABLES_LIST.md for values');
}

console.log('\n' + '='.repeat(60));

// Exit with error code if variables are missing
if (!allRequiredPresent) {
    process.exit(1);
}

