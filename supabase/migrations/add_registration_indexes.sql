-- ============================================================================
-- Add Missing Indexes for Registration Fields
-- ============================================================================
-- Purpose: Create indexes for registration fields to improve query performance
--          These indexes were defined in add_registration_fields.sql but may
--          not have been created if the migration was run before the indexes
--          section was added.
--
-- IMPORTANT: Run add_registration_fields_complete.sql FIRST to create the columns!
--
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- First, verify columns exist (this will error if columns don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributions' 
        AND column_name = 'registered'
    ) THEN
        RAISE EXCEPTION 'Column "registered" does not exist. Please run add_registration_fields_complete.sql first!';
    END IF;
END $$;

-- Index for querying registered PoCs
CREATE INDEX IF NOT EXISTS "contributions_registered_idx" ON "contributions" (registered) 
WHERE registered = true;

-- Index for Stripe payment lookups
CREATE INDEX IF NOT EXISTS "contributions_stripe_payment_id_idx" ON "contributions" (stripe_payment_id) 
WHERE stripe_payment_id IS NOT NULL;

-- ============================================================================
-- Verify Indexes Were Created
-- ============================================================================
-- Run this query to verify:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'contributions' 
-- AND (indexname LIKE '%registered%' OR indexname LIKE '%stripe%')
-- ORDER BY indexname;
-- ============================================================================

