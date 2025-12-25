/**
 * Check Supabase schema using existing database connection
 * Run: npx tsx scripts/check_schema_ts.ts
 */

// Set DATABASE_URL before importing db
const PROJECT_REF = 'jfbgdxeumzqzigptbmvp';
const DB_PASSWORD = 'hcGw8smzTB5NXvel';
process.env.DATABASE_URL = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;

import { db } from '../utils/db/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
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
        
        const columns = (columnsResult as any).rows || (columnsResult as any[]);
        
        if (columns.length === 0) {
            console.log('❌ No registration columns found!\n');
            console.log('⚠️  Registration fields migration may not have been run.\n');
        } else {
            console.log('✅ Found registration columns:\n');
            columns.forEach((col: any) => {
                console.log(`  • ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} nullable: ${col.is_nullable}  default: ${col.column_default || 'none'}`);
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
        
        const allColumns = (allColumnsResult as any).rows || (allColumnsResult as any[]);
        console.log(`Total columns: ${allColumns.length}\n`);
        allColumns.forEach((col: any) => {
            const isReg = col.column_name.includes('registration') || col.column_name === 'stripe_payment_id' || col.column_name === 'registered';
            const marker = isReg ? '🔹' : '  ';
            console.log(`${marker} ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
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
        
        const indexes = (indexesResult as any).rows || (indexesResult as any[]);
        indexes.forEach((idx: any) => {
            console.log(`  • ${idx.indexname}`);
            if (idx.indexdef.includes('registration') || idx.indexdef.includes('stripe_payment')) {
                console.log(`    ${idx.indexdef}`);
            }
        });
        
        // Summary
        console.log('\n📊 Summary:\n');
        const expectedCols = ['registered', 'registration_date', 'registration_tx_hash', 'stripe_payment_id'];
        const foundCols = columns.map((r: any) => r.column_name);
        const missingCols = expectedCols.filter(col => !foundCols.includes(col));
        
        if (missingCols.length === 0) {
            console.log('✅ All registration fields are present!');
        } else {
            console.log('❌ Missing registration fields:');
            missingCols.forEach(col => console.log(`   - ${col}`));
            console.log('\n⚠️  Run the migration: supabase/migrations/add_registration_fields.sql');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error querying schema:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

checkSchema();

