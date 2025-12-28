-- ============================================
-- Check and Insert Epoch Balances
-- ============================================
-- First check if records exist, then insert/update them

-- Check current state
SELECT 
    'BEFORE' as "Status",
    "id",
    "epoch",
    "balance"::text as "balance",
    "distribution_amount"::text,
    "distribution_percent"::text
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Check if table exists and has any rows
SELECT 
    COUNT(*) as "record_count"
FROM "epoch_balances";

-- Delete all existing records first (clean slate)
TRUNCATE TABLE "epoch_balances" RESTART IDENTITY;

-- Insert epoch balances with correct values
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '0', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '0', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '0', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '0', 12.5);

-- Verify after insert
SELECT 
    'AFTER' as "Status",
    "id",
    "epoch",
    "balance"::text as "balance",
    "balance"::bigint as "balance_bigint",
    "distribution_amount"::text,
    "distribution_percent"::text
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;


