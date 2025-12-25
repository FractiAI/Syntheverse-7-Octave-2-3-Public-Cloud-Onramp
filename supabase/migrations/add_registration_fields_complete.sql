-- ============================================================================
-- Add Registration Fields to Contributions Table (COMPLETE MIGRATION)
-- ============================================================================
-- Purpose: Enable PoC registration tracking for blockchain registration
--          via Stripe payment ($200 registration fee)
--
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Step 1: Add registration columns
ALTER TABLE "contributions" 
ADD COLUMN IF NOT EXISTS "registered" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "registration_date" timestamp,
ADD COLUMN IF NOT EXISTS "registration_tx_hash" text,
ADD COLUMN IF NOT EXISTS "stripe_payment_id" text;

-- Step 2: Create Indexes for Registration Fields
-- (Only create indexes after columns exist)

-- Index for querying registered PoCs
CREATE INDEX IF NOT EXISTS "contributions_registered_idx" ON "contributions" (registered) 
WHERE registered = true;

-- Index for Stripe payment lookups
CREATE INDEX IF NOT EXISTS "contributions_stripe_payment_id_idx" ON "contributions" (stripe_payment_id) 
WHERE stripe_payment_id IS NOT NULL;

-- ============================================================================
-- Column Comments (Documentation)
-- ============================================================================

COMMENT ON COLUMN "contributions"."registered" IS 
'Whether the PoC has been registered on the blockchain via Stripe payment ($200 fee).';

COMMENT ON COLUMN "contributions"."registration_date" IS 
'Timestamp when the PoC was registered on the blockchain.';

COMMENT ON COLUMN "contributions"."registration_tx_hash" IS 
'Blockchain transaction hash for the PoC registration transaction.';

COMMENT ON COLUMN "contributions"."stripe_payment_id" IS 
'Stripe payment intent ID for the registration payment ($200).';

-- ============================================================================
-- Verify Migration
-- ============================================================================
-- Run this query to verify columns were added:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'contributions' 
-- AND table_schema = 'public'
-- AND (
--     column_name LIKE 'registration%' 
--     OR column_name = 'stripe_payment_id'
--     OR column_name = 'registered'
-- )
-- ORDER BY column_name;
--
-- Run this query to verify indexes were created:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'contributions'
-- AND schemaname = 'public'
-- AND (
--     indexname LIKE '%registered%' 
--     OR indexname LIKE '%stripe%'
-- )
-- ORDER BY indexname;
-- ============================================================================

