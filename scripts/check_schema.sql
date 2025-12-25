-- Check contributions table schema, specifically registration fields
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check specifically for registration-related columns
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

-- Check indexes on contributions table
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'contributions'
AND schemaname = 'public'
ORDER BY indexname;

