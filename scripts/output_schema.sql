-- ============================================
-- Output Schema for Epoch Balances and Tokenomics
-- ============================================
-- This query shows the exact schema structure

-- 1. Show table structure for epoch_balances
SELECT 
    'epoch_balances' as "Table",
    column_name as "Column",
    data_type as "Data Type",
    character_maximum_length as "Max Length",
    numeric_precision as "Numeric Precision",
    numeric_scale as "Numeric Scale",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'epoch_balances'
ORDER BY ordinal_position;

-- 2. Show table structure for tokenomics
SELECT 
    'tokenomics' as "Table",
    column_name as "Column",
    data_type as "Data Type",
    character_maximum_length as "Max Length",
    numeric_precision as "Numeric Precision",
    numeric_scale as "Numeric Scale",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'tokenomics'
ORDER BY ordinal_position;

-- 3. Show constraints (primary keys, foreign keys, unique)
SELECT 
    tc.table_name as "Table",
    tc.constraint_name as "Constraint Name",
    tc.constraint_type as "Constraint Type",
    kcu.column_name as "Column",
    ccu.table_name AS "Foreign Table",
    ccu.column_name AS "Foreign Column"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('epoch_balances', 'tokenomics')
ORDER BY tc.table_name, tc.constraint_type, kcu.ordinal_position;

-- 4. Show indexes
SELECT 
    tablename as "Table",
    indexname as "Index Name",
    indexdef as "Index Definition"
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('epoch_balances', 'tokenomics')
ORDER BY tablename, indexname;

-- 5. Show actual current data
SELECT 
    'epoch_balances DATA' as "Info",
    "id",
    "epoch",
    "balance"::text as "balance",
    "balance"::numeric as "balance_numeric",
    "threshold"::text,
    "distribution_amount"::text,
    "distribution_percent"::text,
    "updated_at"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

SELECT 
    'tokenomics DATA' as "Info",
    "id",
    "total_supply"::text,
    "total_distributed"::text,
    "current_epoch",
    "founder_halving_count",
    "updated_at"
FROM "tokenomics"
WHERE "id" = 'main';


