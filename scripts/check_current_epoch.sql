-- ============================================
-- Check Current Epoch in Database
-- ============================================
-- Run this to see what the database actually has

SELECT 
    'Tokenomics Current Epoch' as "Check",
    "id",
    "current_epoch",
    "total_distributed",
    "updated_at"
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


