-- Verify Activity Analytics Tables and Indexes
-- Run this in Supabase Dashboard → SQL Editor to check if tables exist
-- This is a verification query, not a migration

-- Check if poc_log table exists and has required columns
SELECT 
    'poc_log' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'poc_log'
    AND column_name IN ('created_at', 'contributor', 'event_type', 'event_status')
ORDER BY column_name;

-- Check if contributions table exists and has required columns
SELECT 
    'contributions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'contributions'
    AND column_name IN ('created_at', 'contributor', 'status', 'metadata')
ORDER BY column_name;

-- Check indexes on poc_log.created_at (for performance)
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'poc_log'
    AND indexdef LIKE '%created_at%';

-- Check indexes on contributions.created_at (for performance)
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'contributions'
    AND indexdef LIKE '%created_at%';

-- Summary: Count records in each table
SELECT 
    'poc_log' as table_name,
    COUNT(*) as record_count
FROM poc_log
UNION ALL
SELECT 
    'contributions' as table_name,
    COUNT(*) as record_count
FROM contributions;

