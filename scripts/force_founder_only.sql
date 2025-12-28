-- ============================================
-- Force Reset to Founder Epoch ONLY
-- ============================================
-- This ensures current_epoch is 'founder' and prevents automatic transitions

-- Step 1: Force tokenomics to founder epoch (with explicit type casting)
UPDATE "tokenomics"
SET 
    "current_epoch" = 'founder'::text,
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Step 2: Ensure tokenomics record exists with founder epoch
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "current_epoch" = 'founder'::text,
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Step 3: Ensure all epoch balances are set correctly
UPDATE "epoch_balances"
SET 
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'
        WHEN "epoch" = 'pioneer' THEN '22500000000000'
        WHEN "epoch" = 'community' THEN '11250000000000'
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'
        ELSE "balance"
    END,
    "distribution_amount" = '0',
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 4: Insert/Update epoch balances to ensure they exist
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '0', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '0', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '0', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '0', 12.5)
ON CONFLICT ("id") DO UPDATE
SET 
    "balance" = EXCLUDED."balance",
    "distribution_amount" = '0',
    "updated_at" = NOW();

-- Step 5: Verify - should show 'founder' as current_epoch
SELECT 
    'VERIFICATION' as "Status",
    "current_epoch" as "Current Epoch",
    "total_distributed" as "Total Distributed",
    "updated_at"
FROM "tokenomics"
WHERE "id" = 'main';

-- Expected result: current_epoch = 'founder', total_distributed = 0


