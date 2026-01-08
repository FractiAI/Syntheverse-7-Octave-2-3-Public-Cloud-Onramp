#!/usr/bin/env tsx

/**
 * Environment Variable Checker
 * Run this script to validate your environment configuration
 * Usage: tsx scripts/check-env.ts
 */

const requiredVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    validate: (v: string) => v.startsWith('https://'),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous key',
    validate: (v: string) => v.length > 50,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Supabase service role key',
    validate: (v: string) => v.length > 50,
  },
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection string',
    validate: (v: string) => v.startsWith('postgresql://'),
  },
  // Stripe
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe secret key',
    validate: (v: string) => v.startsWith('sk_'),
  },
};

const optionalVars = {
  NEXT_PUBLIC_SITE_URL: 'Public site URL',
  NEXT_PUBLIC_WEBSITE_URL: 'Public website URL',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
};

function checkEnvironment() {
  console.log('🔍 Checking environment variables...\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  console.log('📋 Required Variables:');
  for (const [key, config] of Object.entries(requiredVars)) {
    const value = process.env[key];
    
    if (!value) {
      console.log(`  ❌ ${key} - MISSING`);
      console.log(`     ${config.description}`);
      hasErrors = true;
    } else if (!config.validate(value)) {
      console.log(`  ⚠️  ${key} - INVALID FORMAT`);
      console.log(`     ${config.description}`);
      hasErrors = true;
    } else {
      const maskedValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      console.log(`  ✅ ${key} - ${maskedValue}`);
    }
  }

  // Check optional variables
  console.log('\n📝 Optional Variables:');
  for (const [key, description] of Object.entries(optionalVars)) {
    const value = process.env[key];
    
    if (!value) {
      console.log(`  ⚠️  ${key} - NOT SET`);
      console.log(`     ${description}`);
      hasWarnings = true;
    } else {
      const maskedValue = value.length > 20 
        ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
        : value;
      console.log(`  ✅ ${key} - ${maskedValue}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Environment check FAILED - Missing required variables');
    console.log('\n💡 To fix:');
    console.log('   1. Create a .env.local file in the project root');
    console.log('   2. Add all missing variables (see docs/ENV_VARIABLES_LIST.md)');
    console.log('   3. For Vercel: Add them in Project Settings → Environment Variables');
    console.log('   4. Redeploy your application');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Environment check PASSED with warnings');
    console.log('   Optional variables are missing but application should work');
  } else {
    console.log('✅ Environment check PASSED - All variables configured');
  }
  console.log('='.repeat(50) + '\n');
}

checkEnvironment();

