/**
 * Query Supabase schema using direct database connection
 * Run: node scripts/query_schema.js
 */

const postgres = require('postgres');

const PROJECT_REF = 'jfbgdxeumzqzigptbmvp';
const DB_PASSWORD = 'hcGw8smzTB5NXvel';
// Direct database connection (port 5432)
const DB_HOST = `db.${PROJECT_REF}.supabase.co`;
const DB_URL = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:5432/postgres?sslmode=require`;

async function querySchema() {
    const sql = postgres(DB_URL);
    
    try {
        console.log('✅ Connecting to Supabase database...\n');
        
        // Query registration columns
        console.log('📋 Checking registration-related columns in contributions table:\n');
        const columnsResult = await sql`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'contributions' 
            AND table_schema = 'public'
            AND (
                column_name LIKE 'registration%' 
                OR column_name = 'stripe_payment_id'
                OR column_name = 'registered'
            )
            ORDER BY column_name;
        `;
        
        if (columnsResult.length === 0) {
            console.log('❌ No registration columns found!\n');
            console.log('⚠️  Registration fields migration may not have been run.\n');
        } else {
            console.log('✅ Found registration columns:\n');
            columnsResult.forEach(col => {
                console.log(`  • ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} nullable: ${col.is_nullable}  default: ${col.column_default || 'none'}`);
            });
        }
        
        // Check all columns
        console.log('\n📋 All columns in contributions table:\n');
        const allColumnsResult = await sql`
            SELECT 
                column_name,
                data_type,
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'contributions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        console.log(`Total columns: ${allColumnsResult.length}\n`);
        allColumnsResult.forEach(col => {
            const isReg = col.column_name.includes('registration') || col.column_name === 'stripe_payment_id' || col.column_name === 'registered';
            const marker = isReg ? '🔹' : '  ';
            console.log(`${marker} ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
        });
        
        // Check indexes
        console.log('\n📋 Indexes on contributions table:\n');
        const indexesResult = await sql`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE tablename = 'contributions'
            AND schemaname = 'public'
            ORDER BY indexname;
        `;
        
        indexesResult.forEach(idx => {
            console.log(`  • ${idx.indexname}`);
            if (idx.indexdef.includes('registration') || idx.indexdef.includes('stripe_payment')) {
                console.log(`    ${idx.indexdef}`);
            }
        });
        
        // Summary
        console.log('\n📊 Summary:\n');
        const expectedCols = ['registered', 'registration_date', 'registration_tx_hash', 'stripe_payment_id'];
        const foundCols = columnsResult.map(r => r.column_name);
        const missingCols = expectedCols.filter(col => !foundCols.includes(col));
        
        if (missingCols.length === 0) {
            console.log('✅ All registration fields are present!');
        } else {
            console.log('❌ Missing registration fields:');
            missingCols.forEach(col => console.log(`   - ${col}`));
            console.log('\n⚠️  Run the migration: supabase/migrations/add_registration_fields.sql');
        }
        
    } catch (error) {
        console.error('❌ Error querying schema:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

querySchema();

