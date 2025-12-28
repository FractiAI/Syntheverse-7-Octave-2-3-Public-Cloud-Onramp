-- ============================================
-- Simple Script to Force Founder Epoch ONLY
-- ============================================
-- Run this in Supabase SQL Editor to force current_epoch to 'founder'

-- Step 1: Update tokenomics to force founder epoch
UPDATE "tokenomics"
SET 
    "current_epoch" = 'founder',
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Step 2: If the record doesn't exist, insert it
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "current_epoch" = 'founder',
    "updated_at" = NOW();

-- Step 3: Verify it worked
SELECT 
    'VERIFICATION' as "Status",
    "id",
    "current_epoch" as "Current Epoch",
    "total_distributed" as "Total Distributed",
    "updated_at" as "Last Updated"
FROM "tokenomics"
WHERE "id" = 'main';

-- Expected result: current_epoch should be 'founder'

