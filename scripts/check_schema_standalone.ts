/**
 * Check Supabase schema using direct database connection
 * Run: DATABASE_URL="postgresql://postgres:password@host:5432/postgres" npx tsx scripts/check_schema_standalone.ts
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

// Set DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
    const PROJECT_REF = 'jfbgdxeumzqzigptbmvp';
    const DB_PASSWORD = 'hcGw8smzTB5NXvel';
    process.env.DATABASE_URL = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;
}

async function checkSchema() {
    const client = postgres(process.env.DATABASE_URL!, {
        prepare: false,
        connect_timeout: 10,
        max: 1,
    });
    
    const db = drizzle(client);
    
    try {
        console.log('✅ Connecting to Supabase database...\n');
        
        // Query registration columns
        console.log('📋 Checking registration-related columns in contributions table:\n');
        const columnsResult = await db.execute(sql`
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
            ORDER BY column_name
        `);
        
        const columns = columnsResult as any[];
        
        if (columns.length === 0) {
            console.log('❌ No registration columns found!\n');
            console.log('⚠️  Registration fields migration may not have been run.\n');
        } else {
            console.log('✅ Found registration columns:\n');
            columns.forEach((col: any) => {
                console.log(`  • ${String(col.column_name).padEnd(25)} ${String(col.data_type).padEnd(20)} nullable: ${col.is_nullable}  default: ${col.column_default || 'none'}`);
            });
        }
        
        // Check all columns
        console.log('\n📋 All columns in contributions table:\n');
        const allColumnsResult = await db.execute(sql`
            SELECT 
                column_name,
                data_type,
                is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'contributions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);
        
        const allColumns = allColumnsResult as any[];
        console.log(`Total columns: ${allColumns.length}\n`);
        allColumns.forEach((col: any) => {
            const colName = String(col.column_name);
            const isReg = colName.includes('registration') || colName === 'stripe_payment_id' || colName === 'registered';
            const marker = isReg ? '🔹' : '  ';
            console.log(`${marker} ${colName.padEnd(30)} ${String(col.data_type).padEnd(20)} ${col.is_nullable}`);
        });
        
        // Check indexes
        console.log('\n📋 Indexes on contributions table:\n');
        const indexesResult = await db.execute(sql`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE tablename = 'contributions'
            AND schemaname = 'public'
            ORDER BY indexname
        `);
        
        const indexes = indexesResult as any[];
        if (indexes.length === 0) {
            console.log('  (No indexes found)');
        } else {
            indexes.forEach((idx: any) => {
                const idxDef = String(idx.indexdef);
                console.log(`  • ${idx.indexname}`);
                if (idxDef.includes('registration') || idxDef.includes('stripe_payment')) {
                    console.log(`    ${idxDef}`);
                }
            });
        }
        
        // Summary
        console.log('\n📊 Summary:\n');
        const expectedCols = ['registered', 'registration_date', 'registration_tx_hash', 'stripe_payment_id'];
        const foundCols = columns.map((r: any) => String(r.column_name));
        const missingCols = expectedCols.filter(col => !foundCols.includes(col));
        
        if (missingCols.length === 0) {
            console.log('✅ All registration fields are present!');
        } else {
            console.log('❌ Missing registration fields:');
            missingCols.forEach(col => console.log(`   - ${col}`));
            console.log('\n⚠️  Run the migration: supabase/migrations/add_registration_fields.sql');
        }
        
        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error querying schema:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        await client.end();
        process.exit(1);
    }
}

checkSchema();

