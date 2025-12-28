-- ============================================
-- Verify Reset: Check Current State
-- ============================================
-- Run this to verify the reset completed successfully

-- Check tokenomics state
SELECT 
    'Tokenomics State' as "Check",
    "id",
    "total_supply",
    "total_distributed",
    "current_epoch",
    "founder_halving_count"
FROM "tokenomics"
WHERE "id" = 'main';

-- Check epoch balances
SELECT 
    'Epoch Balances' as "Check",
    "id",
    "epoch",
    "balance",
    "distribution_amount",
    "distribution_percent"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Check remaining data counts
SELECT 
    'Data Counts' as "Check",
    (SELECT COUNT(*) FROM "contributions") as "contributions_count",
    (SELECT COUNT(*) FROM "allocations") as "allocations_count",
    (SELECT COUNT(*) FROM "poc_log") as "logs_count";

-- Expected results:
-- Tokenomics: current_epoch = 'founder', total_distributed = 0
-- Epoch Balances:
--   - founder: 45000000000000 (45T)
--   - pioneer: 22500000000000 (22.5T)
--   - community: 11250000000000 (11.25T)
--   - ecosystem: 11250000000000 (11.25T)
-- All counts should be 0


