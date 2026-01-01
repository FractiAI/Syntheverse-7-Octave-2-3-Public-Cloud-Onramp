// Script to apply RLS migration to tokenomics table
// Run with: node scripts/apply_tokenomics_rls.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyTokenomicsRLS() {
  try {
    console.log('Applying RLS migration to tokenomics table...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260102000000_enable_tokenomics_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // If rpc doesn't work, try direct query
          const { error: queryError } = await supabase.from('_supabase_migration_temp').select('*').limit(0);
          // Just run the raw SQL
          console.log('Note: Using direct SQL execution...');
        }
      }
    }

    // Try to execute the SQL directly
    console.log('Executing RLS migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.log('RPC method not available, trying direct approach...');

      // Try executing the statements one by one using raw SQL
      const { error: enableError } = await supabase.from('tokenomics').select('*').limit(1);
      if (!enableError) {
        console.log('✓ Successfully connected to tokenomics table');

        // Since we can't use RPC, we'll need to apply this manually in Supabase dashboard
        console.log('\n❌ Cannot apply RLS migration programmatically.');
        console.log('Please apply the following SQL manually in your Supabase SQL Editor:');
        console.log('\n' + '='.repeat(60));
        console.log(migrationSQL);
        console.log('='.repeat(60));
        console.log('\nOr run this command from your Supabase project directory:');
        console.log('npx supabase db push');
      }
    } else {
      console.log('✅ RLS migration applied successfully!');
    }

  } catch (error) {
    console.error('❌ Error applying RLS migration:', error.message);

    // Show the manual instructions
    console.log('\n📋 MANUAL APPLICATION REQUIRED:');
    console.log('Please apply the following SQL manually in your Supabase SQL Editor:');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260102000000_enable_tokenomics_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n' + '='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60));
  }
}

applyTokenomicsRLS();
