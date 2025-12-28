-- ============================================
-- Fix Zero Epoch Balances
-- ============================================
-- This script ensures epoch balances are set to correct amounts

-- First, check current state
SELECT 'BEFORE FIX' as "Status", "epoch", "balance", "distribution_amount", "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Delete existing epoch balance records to force recreation
DELETE FROM "epoch_balances";

-- Insert epoch balances with correct amounts
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '0', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '0', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '0', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '0', 12.5);

-- Update tokenomics to ensure founder epoch and zero distributed
UPDATE "tokenomics"
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Ensure tokenomics record exists
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Verify after fix
SELECT 'AFTER FIX' as "Status", "epoch", "balance", "distribution_amount", "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Verify tokenomics
SELECT 'TOKENOMICS' as "Status", "current_epoch", "total_distributed", "total_supply"
FROM "tokenomics"
WHERE "id" = 'main';

-- Expected results:
-- founder: 45000000000000 (45T)
-- pioneer: 22500000000000 (22.5T)
-- community: 11250000000000 (11.25T)
-- ecosystem: 11250000000000 (11.25T)
-- current_epoch: founder
-- total_distributed: 0


