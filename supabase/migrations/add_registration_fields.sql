-- ============================================================================
-- Add Registration Fields to Contributions Table
-- ============================================================================
-- Purpose: Enable PoC registration tracking for blockchain registration
--          via Stripe payment ($500 registration fee)
--
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Add registration columns
ALTER TABLE "contributions" 
ADD COLUMN IF NOT EXISTS "registered" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "registration_date" timestamp,
ADD COLUMN IF NOT EXISTS "registration_tx_hash" text,
ADD COLUMN IF NOT EXISTS "stripe_payment_id" text;

-- ============================================================================
-- Create Indexes for Registration Fields
-- ============================================================================

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
'Whether the PoC has been registered on the blockchain via Stripe payment ($500 fee).';

COMMENT ON COLUMN "contributions"."registration_date" IS 
'Timestamp when the PoC was registered on the blockchain.';

COMMENT ON COLUMN "contributions"."registration_tx_hash" IS 
'Blockchain transaction hash for the PoC registration transaction.';

COMMENT ON COLUMN "contributions"."stripe_payment_id" IS 
'Stripe payment intent ID for the registration payment ($500).';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Verify columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'contributions' 
-- AND (column_name LIKE 'registration%' OR column_name = 'stripe_payment_id');
-- ============================================================================

