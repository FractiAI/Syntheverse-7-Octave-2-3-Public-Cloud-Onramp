-- ============================================
-- Complete Reset: Clear All Data and Restore Default Epoch Balances
-- ============================================
-- This script clears all PoC data and resets epoch balances to their original distribution amounts

-- Clear all allocations
DELETE FROM "allocations";

-- Clear all contributions (this will cascade if foreign keys are set up)
DELETE FROM "contributions";

-- Clear tokenomics logs
DELETE FROM "tokenomics_logs";

-- Reset tokenomics state to initial values
UPDATE "tokenomics"
SET 
    "total_distributed" = '0',
    "current_epoch" = 'founder',
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Reset epoch balances to original distribution amounts
UPDATE "epoch_balances"
SET 
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'      -- 45T SYNTH
        WHEN "epoch" = 'pioneer' THEN '22500000000000'      -- 22.5T SYNTH
        WHEN "epoch" = 'community' THEN '11250000000000'    -- 11.25T SYNTH
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'    -- 11.25T SYNTH
        ELSE "balance"
    END,
    "distribution_amount" = '0',
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- If epoch balances don't exist, insert them
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

-- Ensure tokenomics record exists
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "total_distributed" = '0',
    "current_epoch" = 'founder',
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Verify the reset
SELECT 
    'Tokenomics State' as "Section",
    "total_supply" as "Total Supply",
    "total_distributed" as "Total Distributed",
    "current_epoch" as "Current Epoch"
FROM "tokenomics"
WHERE "id" = 'main'

UNION ALL

SELECT 
    'Epoch Balances' as "Section",
    "balance"::text as "Balance",
    "epoch" as "Epoch",
    "distribution_percent"::text as "Distribution %"
FROM "epoch_balances"
ORDER BY "Section", "Epoch";


