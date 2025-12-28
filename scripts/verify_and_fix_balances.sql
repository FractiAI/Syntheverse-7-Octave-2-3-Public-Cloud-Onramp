-- ============================================
-- Verify and Force Fix Zero Epoch Balances
-- ============================================
-- Run this to check current state and fix if needed

-- Step 1: Check current state
SELECT 'CURRENT STATE' as "Check", 
    "id", 
    "epoch", 
    "balance"::text as "balance_text",
    "balance"::numeric as "balance_numeric",
    "distribution_amount"::text,
    "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Step 2: Check tokenomics
SELECT 'TOKENOMICS' as "Check", 
    "current_epoch", 
    "total_distributed"::text,
    "total_supply"::text
FROM "tokenomics"
WHERE "id" = 'main';

-- Step 3: Force update balances using numeric cast
UPDATE "epoch_balances"
SET 
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'::numeric
        WHEN "epoch" = 'pioneer' THEN '22500000000000'::numeric
        WHEN "epoch" = 'community' THEN '11250000000000'::numeric
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'::numeric
        ELSE "balance"
    END,
    "distribution_amount" = '0'::numeric,
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 4: If records don't exist, insert them
DO $$
BEGIN
    -- Insert founder if doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "epoch_balances" WHERE "id" = 'epoch_founder') THEN
        INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
        VALUES ('epoch_founder', 'founder', '45000000000000'::numeric, '0'::numeric, '0'::numeric, 50.0::numeric);
    END IF;
    
    -- Insert pioneer if doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "epoch_balances" WHERE "id" = 'epoch_pioneer') THEN
        INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
        VALUES ('epoch_pioneer', 'pioneer', '22500000000000'::numeric, '0'::numeric, '0'::numeric, 25.0::numeric);
    END IF;
    
    -- Insert community if doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "epoch_balances" WHERE "id" = 'epoch_community') THEN
        INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
        VALUES ('epoch_community', 'community', '11250000000000'::numeric, '0'::numeric, '0'::numeric, 12.5::numeric);
    END IF;
    
    -- Insert ecosystem if doesn't exist
    IF NOT EXISTS (SELECT 1 FROM "epoch_balances" WHERE "id" = 'epoch_ecosystem') THEN
        INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
        VALUES ('epoch_ecosystem', 'ecosystem', '11250000000000'::numeric, '0'::numeric, '0'::numeric, 12.5::numeric);
    END IF;
END $$;

-- Step 5: Force update again to ensure correct values
UPDATE "epoch_balances"
SET 
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'::numeric
        WHEN "epoch" = 'pioneer' THEN '22500000000000'::numeric
        WHEN "epoch" = 'community' THEN '11250000000000'::numeric
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'::numeric
        ELSE "balance"
    END,
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 6: Update tokenomics
UPDATE "tokenomics"
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0'::numeric,
    "founder_halving_count" = 0,
    "updated_at" = NOW()
WHERE "id" = 'main';

-- Insert tokenomics if doesn't exist
INSERT INTO "tokenomics" ("id", "total_supply", "total_distributed", "current_epoch", "founder_halving_count")
VALUES ('main', '90000000000000'::numeric, '0'::numeric, 'founder', 0)
ON CONFLICT ("id") DO UPDATE
SET 
    "current_epoch" = 'founder',
    "total_distributed" = '0'::numeric,
    "founder_halving_count" = 0,
    "updated_at" = NOW();

-- Step 7: Verify final state
SELECT 'FINAL STATE' as "Check", 
    "id", 
    "epoch", 
    "balance"::text as "balance_text",
    "balance"::numeric as "balance_numeric",
    "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

SELECT 'FINAL TOKENOMICS' as "Check", 
    "current_epoch", 
    "total_distributed"::text,
    "total_supply"::text
FROM "tokenomics"
WHERE "id" = 'main';


