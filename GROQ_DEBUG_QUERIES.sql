-- SQL Queries to Debug Groq API Raw Responses
-- Use these in Supabase SQL Editor to inspect what Groq returned

-- ============================================================================
-- 1. Get all Groq API responses from poc_log (most recent first)
-- ============================================================================
SELECT 
  id,
  created_at,
  event_type,
  event_status,
  submission_hash,
  title,
  grok_api_response,
  error_message,
  response_data
FROM poc_log
WHERE event_type IN ('evaluation_complete', 'evaluation_failed', 'evaluation_error')
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- 2. Get ONLY failed evaluations with raw Groq responses
-- ============================================================================
SELECT 
  id,
  created_at,
  submission_hash,
  title,
  error_message,
  grok_api_response::text as raw_groq_response,
  response_data->'raw_groq_answer' as raw_answer,
  response_data->'parsed_evaluation' as parsed_evaluation,
  response_data->'error_details' as error_details
FROM poc_log
WHERE event_type = 'evaluation_failed'
  AND event_status = 'error'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 3. Get evaluations with zero scores (the main issue)
-- ============================================================================
SELECT 
  id,
  created_at,
  submission_hash,
  title,
  error_message,
  grok_api_response,
  response_data->'parsed_evaluation' as parsed_scores
FROM poc_log
WHERE event_type = 'evaluation_failed'
  AND error_message LIKE '%all scores are 0%'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 4. Get the last 10 evaluations (successful and failed) to see pattern
-- ============================================================================
SELECT 
  id,
  created_at,
  event_type,
  event_status,
  submission_hash,
  title,
  CASE 
    WHEN event_type = 'evaluation_complete' THEN 'SUCCESS'
    WHEN event_type = 'evaluation_failed' THEN 'FAILED'
    ELSE 'OTHER'
  END as result,
  error_message,
  LENGTH(grok_api_response::text) as response_length_bytes
FROM poc_log
WHERE event_type IN ('evaluation_complete', 'evaluation_failed', 'evaluation_error', 'evaluation_start')
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- 5. Extract just the Groq API error messages (rate limits, etc.)
-- ============================================================================
SELECT 
  created_at,
  submission_hash,
  title,
  error_message,
  grok_api_response->'error' as groq_error_object,
  grok_api_response->'error'->>'message' as groq_error_message,
  grok_api_response->'error'->>'type' as groq_error_type,
  grok_api_response->'error'->>'code' as groq_error_code
FROM poc_log
WHERE event_type = 'evaluation_failed'
  AND grok_api_response IS NOT NULL
  AND grok_api_response::text != 'null'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. Get raw Groq responses for specific submission hash
-- ============================================================================
-- Replace 'YOUR_SUBMISSION_HASH' with actual hash
SELECT 
  id,
  created_at,
  event_type,
  event_status,
  error_message,
  grok_api_response,
  response_data
FROM poc_log
WHERE submission_hash = 'YOUR_SUBMISSION_HASH'
ORDER BY created_at DESC;

-- ============================================================================
-- 7. Check for rate limit patterns (time-based clustering of failures)
-- ============================================================================
SELECT 
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) as total_evaluations,
  SUM(CASE WHEN event_type = 'evaluation_failed' THEN 1 ELSE 0 END) as failures,
  SUM(CASE WHEN event_type = 'evaluation_complete' THEN 1 ELSE 0 END) as successes
FROM poc_log
WHERE event_type IN ('evaluation_complete', 'evaluation_failed')
  AND created_at > NOW() - INTERVAL '2 hours'
GROUP BY DATE_TRUNC('minute', created_at)
ORDER BY minute DESC
LIMIT 20;

-- ============================================================================
-- 8. Get full Groq API response for the most recent failure
-- ============================================================================
SELECT 
  created_at,
  submission_hash,
  title,
  error_message,
  grok_api_response::text as full_groq_response
FROM poc_log
WHERE event_type = 'evaluation_failed'
  AND grok_api_response IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- 9. Compare successful vs failed evaluations metadata
-- ============================================================================
SELECT 
  event_type,
  COUNT(*) as count,
  AVG(LENGTH(grok_api_response::text)) as avg_response_size,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM poc_log
WHERE event_type IN ('evaluation_complete', 'evaluation_failed')
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- ============================================================================
-- 10. Get raw answer text that Groq returned (before JSON parsing)
-- ============================================================================
SELECT 
  created_at,
  submission_hash,
  title,
  response_data->'raw_groq_answer' as raw_groq_text,
  error_message
FROM poc_log
WHERE event_type = 'evaluation_failed'
  AND response_data->'raw_groq_answer' IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
-- 1. Copy any query above
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste the query
-- 4. Click "Run" or press Cmd/Ctrl + Enter
-- 5. Export results as CSV if needed (click "..." → "Download as CSV")
--
-- For Query #6, replace 'YOUR_SUBMISSION_HASH' with the actual submission_hash
-- that's experiencing the zero scores issue.

