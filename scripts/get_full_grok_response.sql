-- ============================================
-- Get Full Raw Grok API Response
-- ============================================
-- This script retrieves the complete raw_grok_response text

-- Get the full raw Grok response for the most recent submission
SELECT 
    "submission_hash",
    "title",
    "created_at",
    "metadata"->'grok_evaluation_details'->>'raw_grok_response' as "full_raw_grok_response"
FROM "contributions"
WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL
    AND LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text) > 0
ORDER BY "created_at" DESC
LIMIT 1;

-- Alternative: Get all raw responses (useful if you want to see multiple)
-- SELECT 
--     "submission_hash",
--     "title",
--     "created_at",
--     "metadata"->'grok_evaluation_details'->>'raw_grok_response' as "full_raw_grok_response"
-- FROM "contributions"
-- WHERE "metadata"->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL
--     AND LENGTH("metadata"->'grok_evaluation_details'->>'raw_grok_response'::text) > 0
-- ORDER BY "created_at" DESC;

