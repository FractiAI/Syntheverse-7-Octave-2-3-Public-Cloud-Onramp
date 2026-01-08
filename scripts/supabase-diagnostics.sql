-- ============================================
-- SUPABASE DIAGNOSTIC QUERIES
-- Copy-paste these into Supabase SQL Editor
-- ============================================

-- ============================================
-- QUERY 1: Quick Status Check
-- ============================================
-- Run this first to see if submissions are working

SELECT 
    '🔍 QUICK STATUS CHECK' as "Diagnostic",
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
    COUNT(*) FILTER (WHERE status = 'unqualified') as unqualified,
    COUNT(*) FILTER (WHERE status = 'evaluating') as evaluating,
    COUNT(*) FILTER (WHERE status = 'payment_pending') as payment_pending,
    COUNT(*) FILTER (WHERE status = 'evaluation_failed') as failed,
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_raw_response,
    MAX(created_at) as most_recent_submission
FROM contributions;


-- ============================================
-- QUERY 2: Check for Zero Scores Issue
-- ============================================
-- This identifies if the zero scores bug is present

SELECT 
    '🎯 ZERO SCORES CHECK' as "Diagnostic",
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric = 0 OR metadata->>'pod_score' IS NULL) as zero_scores,
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric > 0) as nonzero_scores,
    COUNT(*) as total_evaluated,
    ROUND(AVG((metadata->>'pod_score')::numeric), 2) as avg_score,
    MAX((metadata->>'pod_score')::numeric) as max_score,
    MIN((metadata->>'pod_score')::numeric) as min_score
FROM contributions
WHERE metadata->>'pod_score' IS NOT NULL;


-- ============================================
-- QUERY 3: Raw Groq Response Capture Status
-- ============================================
-- Verifies that AI responses are being stored

SELECT 
    '📡 RAW GROQ RESPONSE STATUS' as "Status",
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_raw_response_count,
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NULL) as missing_raw_response_count,
    COUNT(*) as total_submissions,
    ROUND(AVG(LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text))::numeric, 2) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as avg_response_length,
    MAX(LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text)) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as max_response_length
FROM contributions
WHERE metadata->'grok_evaluation_details' IS NOT NULL;


-- ============================================
-- QUERY 4: Recent Submissions Detail
-- ============================================
-- Shows last 10 submissions with key metrics

SELECT 
    submission_hash,
    LEFT(title, 50) as title,
    status,
    contributor,
    created_at,
    (metadata->>'pod_score')::numeric as pod_score,
    (metadata->>'novelty')::numeric as novelty,
    (metadata->>'density')::numeric as density,
    (metadata->>'coherence')::numeric as coherence,
    (metadata->>'alignment')::numeric as alignment,
    (metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_raw_response,
    LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text) as response_length
FROM contributions
ORDER BY created_at DESC
LIMIT 10;


-- ============================================
-- QUERY 5: Check Evaluation Errors
-- ============================================
-- Shows any submissions that failed evaluation

SELECT 
    submission_hash,
    LEFT(title, 40) as title,
    status,
    created_at,
    metadata->>'evaluation_error' as error_message,
    metadata->>'evaluation_error_type' as error_type,
    metadata->>'evaluation_failed_at' as failed_at
FROM contributions
WHERE status = 'evaluation_failed' 
   OR metadata->>'evaluation_error' IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;


-- ============================================
-- QUERY 6: Check Payment Flow Issues
-- ============================================
-- Identifies submissions stuck in payment_pending

SELECT 
    '💳 PAYMENT FLOW CHECK' as "Diagnostic",
    submission_hash,
    LEFT(title, 40) as title,
    status,
    metadata->>'payment_status' as payment_status,
    created_at,
    NOW() - created_at as age
FROM contributions
WHERE status = 'payment_pending'
   OR metadata->>'payment_status' = 'pending'
ORDER BY created_at DESC
LIMIT 10;


-- ============================================
-- QUERY 7: Evaluation Performance Metrics
-- ============================================
-- Shows how long evaluations are taking

SELECT 
    '⏱️ EVALUATION PERFORMANCE' as "Metric",
    event_type,
    COUNT(*) as count,
    ROUND(AVG(processing_time_ms)::numeric, 2) as avg_time_ms,
    MAX(processing_time_ms) as max_time_ms,
    MIN(processing_time_ms) as min_time_ms,
    MAX(created_at) as most_recent
FROM poc_log
WHERE event_type IN ('evaluation_complete', 'evaluation_failed')
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY most_recent DESC;


-- ============================================
-- QUERY 8: Sample Raw Groq Response
-- ============================================
-- Shows actual raw response from most recent submission

SELECT 
    '📄 SAMPLE RAW GROQ RESPONSE' as "Example",
    submission_hash,
    title,
    created_at,
    LEFT(metadata->'grok_evaluation_details'->>'raw_grok_response', 500) as response_preview,
    LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text) as full_length
FROM contributions
WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;


-- ============================================
-- QUERY 9: Full Raw Response (if needed)
-- ============================================
-- Gets complete raw response for debugging
-- Uncomment to use:

-- SELECT 
--     submission_hash,
--     title,
--     metadata->'grok_evaluation_details'->>'raw_grok_response' as full_raw_groq_response
-- FROM contributions
-- WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 1;


-- ============================================
-- QUERY 10: Health Check Summary
-- ============================================
-- Overall system health in last 24 hours

SELECT 
    '🏥 HEALTH CHECK (Last 24h)' as "Status",
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
    COUNT(*) FILTER (WHERE status = 'evaluation_failed') as failed,
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_groq_response,
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric > 0) as nonzero_scores,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('qualified', 'unqualified')) / NULLIF(COUNT(*), 0), 2) as success_rate_pct,
    ROUND(AVG((metadata->>'pod_score')::numeric), 2) as avg_score
FROM contributions
WHERE created_at > NOW() - INTERVAL '24 hours';


-- ============================================
-- EXPECTED RESULTS AFTER FIX:
-- ============================================
-- ✅ Query 1: Should show recent submissions
-- ✅ Query 2: zero_scores should be 0, nonzero_scores > 0
-- ✅ Query 3: has_raw_response_count > 0, avg_response_length ~2000-5000
-- ✅ Query 4: All recent submissions should have pod_score > 0
-- ✅ Query 5: Should show no recent evaluation_failed (or very few)
-- ✅ Query 6: No submissions stuck in payment_pending for >5 minutes
-- ✅ Query 7: avg_time_ms should be <120000 (2 minutes)
-- ✅ Query 8: Should show actual Groq response text
-- ✅ Query 10: success_rate_pct should be >95%

-- ============================================
-- TROUBLESHOOTING:
-- ============================================
-- If Query 3 shows has_raw_response_count = 0:
--   → Groq API key not set or incorrect
--   → Check: SELECT current_setting('app.settings.groq_api_key', true);
--
-- If Query 2 shows zero_scores > 0:
--   → Groq API may be down or rate-limited
--   → Run: scripts/test-groq-connection.ts locally
--
-- If Query 6 shows stuck payment_pending:
--   → Stripe webhook not configured
--   → Check: Vercel logs for /api/webhook/stripe

