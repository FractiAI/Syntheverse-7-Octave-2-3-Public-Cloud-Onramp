-- ============================================
-- Check if Grok raw response was captured
-- ============================================
-- This script checks if raw_grok_response is stored in the metadata

-- Step 1: Check recent submissions for raw_grok_response
SELECT 
    'RECENT SUBMISSIONS - GROK RESPONSE CHECK' as "Status",
    "submission_hash",
    "title",
    "created_at",
    "status",
    ("metadata"->'grok_evaluation_details'->>'raw_grok_response') IS NOT NULL as "has_raw_response",
    LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text) as "raw_response_length",
    SUBSTRING("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text, 1, 200) as "raw_response_preview",
    ("metadata"->'grok_evaluation_details'->'full_evaluation') IS NOT NULL as "has_full_evaluation",
    ("metadata"->'grok_evaluation_details') IS NOT NULL as "has_grok_details"
FROM "contributions"
ORDER BY "created_at" DESC
LIMIT 10;

-- Step 2: Get detailed view of grok_evaluation_details structure
SELECT 
    'GROK EVALUATION DETAILS STRUCTURE' as "Status",
    "submission_hash",
    "title",
    "metadata"->'grok_evaluation_details' as "grok_evaluation_details",
    jsonb_object_keys("metadata"->'grok_evaluation_details') as "available_keys"
FROM "contributions"
WHERE "metadata"->'grok_evaluation_details' IS NOT NULL
ORDER BY "created_at" DESC
LIMIT 5;

-- Step 3: Check if raw_grok_response exists and its length
SELECT 
    'RAW GROK RESPONSE STATS' as "Status",
    COUNT(*) FILTER (WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as "has_raw_response_count",
    COUNT(*) FILTER (WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NULL) as "missing_raw_response_count",
    COUNT(*) as "total_submissions",
    AVG(LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text)) FILTER (WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as "avg_response_length",
    MAX(LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text)) FILTER (WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as "max_response_length",
    MIN(LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text)) FILTER (WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as "min_response_length"
FROM "contributions"
WHERE "metadata"->'grok_evaluation_details' IS NOT NULL;

-- Step 4: Show full raw_grok_response for most recent submission (if available)
SELECT 
    'MOST RECENT - FULL RAW RESPONSE' as "Status",
    "submission_hash",
    "title",
    "created_at",
    "metadata"->'grok_evaluation_details'->>'raw_grok_response' as "raw_grok_response"
FROM "contributions"
WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL
ORDER BY "created_at" DESC
LIMIT 1;

