-- ============================================
-- Clear All Permanent Memory States
-- ============================================
-- This script clears all PoC submissions, allocations, logs, and resets everything to initial state
-- Use this to start completely fresh

-- Step 1: Clear all allocations
DELETE FROM "allocations";

-- Step 2: Clear all PoC logs (evaluation history, submission logs, etc.)
DELETE FROM "poc_log";

-- Step 3: Clear all contributions (submissions)
DELETE FROM "contributions";

-- Step 4: Reset tokenomics to initial state
UPDATE "tokenomics"
SET 
    "total_distributed" = '0',
    "current_epoch" = 'founder',
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Step 5: Reset epoch balances to 100% (balance = distribution_amount)
UPDATE "epoch_balances"
SET 
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'      -- 45T SYNTH (50%)
        WHEN "epoch" = 'pioneer' THEN '22500000000000'      -- 22.5T SYNTH (25%)
        WHEN "epoch" = 'community' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        ELSE "balance"
    END,
    "distribution_amount" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'      -- 45T SYNTH (50%)
        WHEN "epoch" = 'pioneer' THEN '22500000000000'      -- 22.5T SYNTH (25%)
        WHEN "epoch" = 'community' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        ELSE "distribution_amount"
    END,
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 6: Ensure epoch balances exist (insert if missing)
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '45000000000000', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '22500000000000', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '11250000000000', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '11250000000000', 12.5)
ON CONFLICT ("id") DO UPDATE
SET 
    "balance" = EXCLUDED."distribution_amount",
    "distribution_amount" = EXCLUDED."distribution_amount",
    "updated_at" = NOW();

-- Step 7: Ensure tokenomics record exists
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "total_distributed" = '0',
    "current_epoch" = 'founder',
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Step 8: Verification - Check final state
SELECT 
    'VERIFICATION - TOKENOMICS' as "Status",
    "id",
    "current_epoch" as "Current Epoch",
    "total_distributed" as "Total Distributed",
    "updated_at" as "Last Updated"
FROM "tokenomics"
WHERE "id" = 'main';

-- Step 9: Verification - Check epoch balances
SELECT 
    'VERIFICATION - EPOCH BALANCES' as "Status",
    "id",
    "epoch",
    "balance"::text as "balance",
    "distribution_amount"::text as "distribution_amount",
    "balance"::numeric = "distribution_amount"::numeric as "is_100_percent",
    "distribution_percent"::text as "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Step 10: Verification - Check that all data is cleared
SELECT 
    'VERIFICATION - DATA CLEARED' as "Status",
    (SELECT COUNT(*) FROM "contributions") as "contributions_count",
    (SELECT COUNT(*) FROM "allocations") as "allocations_count",
    (SELECT COUNT(*) FROM "poc_log") as "poc_log_count";

-- Expected results:
-- contributions_count: 0
-- allocations_count: 0
-- poc_log_count: 0
-- current_epoch: founder
-- total_distributed: 0
-- All epoch balances at 100%

