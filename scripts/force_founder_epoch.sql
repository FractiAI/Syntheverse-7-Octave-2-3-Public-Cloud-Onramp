-- ============================================
-- Force Reset to Founder Epoch
-- ============================================
-- This script forces the current epoch back to 'founder' and ensures all balances are correct

-- Force tokenomics to founder epoch
UPDATE "tokenomics"
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- If tokenomics record doesn't exist, create it
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000', '0', 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0',
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Ensure epoch balances are set to original amounts
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

-- Insert epoch balances if they don't exist
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

-- Verify the fix
SELECT 
    'Tokenomics' as "Check",
    "current_epoch" as "Current Epoch",
    "total_distributed" as "Total Distributed"
FROM "tokenomics"
WHERE "id" = 'main';

SELECT 
    'Epoch Balances' as "Check",
    "epoch",
    "balance"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;


