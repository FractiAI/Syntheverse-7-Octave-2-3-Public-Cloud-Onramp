#!/usr/bin/env node

/**
 * Helper script to prepare environment variables for Vercel deployment
 * Reads from .env.local and formats for easy copy-paste into Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing Environment Variables for Vercel\n');
console.log('='.repeat(50));
console.log('');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    // Skip comments and empty lines
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    }
  });
} else {
  console.log('❌ .env.local not found!');
  process.exit(1);
}

// Required variables checklist
const requiredVars = {
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ],
  'Site URLs': [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_WEBSITE_URL'
  ],
  'Stripe': [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID'
  ],
  'OAuth (Optional)': [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
  ]
};

console.log('📋 Environment Variables Status:\n');

let allPresent = true;
let missingVars = [];

Object.entries(requiredVars).forEach(([category, vars]) => {
  console.log(`\n${category}:`);
  vars.forEach(varName => {
    const isPresent = envVars[varName] && envVars[varName] !== 'whsec_your_webhook_secret';
    const icon = isPresent ? '✅' : '❌';
    console.log(`  ${icon} ${varName}`);
    
    if (!isPresent) {
      allPresent = false;
      missingVars.push(varName);
    }
  });
});

console.log('\n' + '='.repeat(50));
console.log('\n📝 Variables to Add to Vercel:\n');

// Format for Vercel
const vercelVars = [];

// Supabase
if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
  vercelVars.push({
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: envVars.NEXT_PUBLIC_SUPABASE_URL,
    category: 'Supabase'
  });
}

if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  vercelVars.push({
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    category: 'Supabase'
  });
}

if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
  vercelVars.push({
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: envVars.SUPABASE_SERVICE_ROLE_KEY,
    category: 'Supabase'
  });
}

// DATABASE_URL - check if exists, if not provide instructions
if (envVars.DATABASE_URL) {
  vercelVars.push({
    key: 'DATABASE_URL',
    value: envVars.DATABASE_URL,
    category: 'Supabase'
  });
} else {
  console.log('⚠️  DATABASE_URL not found in .env.local');
  console.log('   You need to get this from Supabase Dashboard:');
  console.log('   Settings → Database → Connection string → URI');
  console.log('');
}

// Site URLs
console.log('⚠️  NOTE: Update these with your actual Vercel URL after deployment!');
console.log('   Format: https://your-app-name.vercel.app\n');

if (envVars.NEXT_PUBLIC_SITE_URL) {
  vercelVars.push({
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://YOUR-APP-NAME.vercel.app', // Placeholder
    category: 'Site URLs',
    note: 'Update with your actual Vercel URL'
  });
}

vercelVars.push({
  key: 'NEXT_PUBLIC_WEBSITE_URL',
  value: 'https://YOUR-APP-NAME.vercel.app', // Placeholder
  category: 'Site URLs',
  note: 'Update with your actual Vercel URL (same as NEXT_PUBLIC_SITE_URL)'
});

// Stripe
if (envVars.STRIPE_SECRET_KEY) {
  vercelVars.push({
    key: 'STRIPE_SECRET_KEY',
    value: envVars.STRIPE_SECRET_KEY,
    category: 'Stripe'
  });
}

if (envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  vercelVars.push({
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    value: envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    category: 'Stripe'
  });
}

if (envVars.STRIPE_WEBHOOK_SECRET && envVars.STRIPE_WEBHOOK_SECRET !== 'whsec_your_webhook_secret') {
  vercelVars.push({
    key: 'STRIPE_WEBHOOK_SECRET',
    value: envVars.STRIPE_WEBHOOK_SECRET,
    category: 'Stripe'
  });
} else {
  console.log('⚠️  STRIPE_WEBHOOK_SECRET needs to be set after creating webhook in Stripe');
  console.log('   (You\'ll get this after configuring the webhook endpoint)\n');
}

if (envVars.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID) {
  vercelVars.push({
    key: 'NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID',
    value: envVars.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
    category: 'Stripe'
  });
} else {
  console.log('⚠️  NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID not found');
  console.log('   Get this from: Stripe Dashboard → Products → Pricing Tables\n');
}

// OAuth (if present)
if (envVars.GOOGLE_CLIENT_ID) {
  vercelVars.push({
    key: 'GOOGLE_CLIENT_ID',
    value: envVars.GOOGLE_CLIENT_ID,
    category: 'OAuth'
  });
}

if (envVars.GOOGLE_CLIENT_SECRET) {
  vercelVars.push({
    key: 'GOOGLE_CLIENT_SECRET',
    value: envVars.GOOGLE_CLIENT_SECRET,
    category: 'OAuth'
  });
}

if (envVars.GITHUB_CLIENT_ID) {
  vercelVars.push({
    key: 'GITHUB_CLIENT_ID',
    value: envVars.GITHUB_CLIENT_ID,
    category: 'OAuth'
  });
}

if (envVars.GITHUB_CLIENT_SECRET) {
  vercelVars.push({
    key: 'GITHUB_CLIENT_SECRET',
    value: envVars.GITHUB_CLIENT_SECRET,
    category: 'OAuth'
  });
}

// Print formatted list
console.log('\n📋 Copy-Paste Ready Format:\n');
console.log('─'.repeat(50));

vercelVars.forEach(({ key, value, note }) => {
  console.log(`\nKey: ${key}`);
  if (note) {
    console.log(`Note: ${note}`);
  }
  console.log(`Value: ${value}`);
  console.log(`Environments: Production, Preview, Development`);
  console.log('─'.repeat(50));
});

console.log('\n\n📖 Instructions:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Click "Add New" for each variable above');
console.log('3. Copy the Key and Value from above');
console.log('4. Select all three environments (Production, Preview, Development)');
console.log('5. Click "Save"');
console.log('\n⚠️  Remember to:');
console.log('   - Update Site URLs with your actual Vercel URL after first deployment');
console.log('   - Add DATABASE_URL from Supabase Dashboard');
console.log('   - Add STRIPE_WEBHOOK_SECRET after creating webhook in Stripe');
console.log('   - Add NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID from Stripe Dashboard\n');

