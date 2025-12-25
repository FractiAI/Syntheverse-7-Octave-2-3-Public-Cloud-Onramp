-- ============================================================================
-- Verify Registration Schema in Contributions Table
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Check if registration columns exist
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

-- 2. Check if registration indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'contributions'
AND schemaname = 'public'
AND (
    indexname LIKE '%registered%' 
    OR indexname LIKE '%stripe%'
)
ORDER BY indexname;

-- 3. Expected Results:
--    Columns should include:
--    - registered (boolean, default false)
--    - registration_date (timestamp, nullable)
--    - registration_tx_hash (text, nullable)
--    - stripe_payment_id (text, nullable)
--
--    Indexes should include:
--    - contributions_registered_idx
--    - contributions_stripe_payment_id_idx

