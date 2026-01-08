-- ============================================
-- COMPREHENSIVE SUBMISSION DIAGNOSTICS
-- Run this query to diagnose 0 scores issue
-- ============================================

-- 1. Count submissions by status
SELECT 
    '1. SUBMISSION STATUS BREAKDOWN' as "Diagnostic",
    status,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM contributions
GROUP BY status
ORDER BY count DESC;

-- 2. Check for raw Groq responses
SELECT 
    '2. RAW GROQ RESPONSE STATUS' as "Diagnostic",
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_raw_response_count,
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NULL) as missing_raw_response_count,
    COUNT(*) as total_submissions,
    ROUND(AVG(LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text))::numeric, 2) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as avg_response_length,
    MAX(LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text)) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as max_response_length,
    MIN(LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text)) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as min_response_length
FROM contributions
WHERE metadata->'grok_evaluation_details' IS NOT NULL;

-- 3. Recent submissions with evaluation details
SELECT 
    '3. RECENT SUBMISSIONS' as "Diagnostic",
    submission_hash,
    title,
    status,
    created_at,
    (metadata->>'pod_score')::numeric as pod_score,
    (metadata->>'novelty')::numeric as novelty,
    (metadata->>'density')::numeric as density,
    (metadata->>'coherence')::numeric as coherence,
    (metadata->>'alignment')::numeric as alignment,
    (metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_raw_response,
    LENGTH((metadata->'grok_evaluation_details'->>'raw_grok_response')::text) as raw_response_length
FROM contributions
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check for evaluation errors
SELECT 
    '4. EVALUATION ERRORS' as "Diagnostic",
    submission_hash,
    title,
    created_at,
    metadata->>'evaluation_error' as error_message,
    metadata->>'evaluation_error_type' as error_type,
    metadata->>'evaluation_failed_at' as failed_at
FROM contributions
WHERE status = 'evaluation_failed' OR metadata->>'evaluation_error' IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check poc_log for Groq API errors
SELECT 
    '5. POC LOG - GROQ API ERRORS' as "Diagnostic",
    submission_hash,
    event_type,
    event_status,
    created_at,
    error_message,
    grok_api_response->>'error' as groq_error,
    request_data
FROM poc_log
WHERE event_type IN ('evaluation_failed', 'evaluation_error', 'evaluation_start')
    OR error_message IS NOT NULL
ORDER BY created_at DESC
LIMIT 15;

-- 6. Check if evaluations are actually running
SELECT 
    '6. EVALUATION EVENTS' as "Diagnostic",
    event_type,
    event_status,
    COUNT(*) as count,
    MAX(created_at) as most_recent
FROM poc_log
WHERE event_type LIKE 'evaluation%'
GROUP BY event_type, event_status
ORDER BY most_recent DESC;

-- 7. Check for payment status issues
SELECT 
    '7. PAYMENT STATUS' as "Diagnostic",
    status,
    metadata->>'payment_status' as payment_status,
    COUNT(*) as count,
    MAX(created_at) as most_recent
FROM contributions
WHERE metadata->>'payment_status' IS NOT NULL
GROUP BY status, metadata->>'payment_status'
ORDER BY most_recent DESC;

-- 8. Full metadata sample from most recent submission
SELECT 
    '8. MOST RECENT SUBMISSION - FULL METADATA' as "Diagnostic",
    submission_hash,
    title,
    status,
    created_at,
    jsonb_pretty(metadata) as full_metadata
FROM contributions
ORDER BY created_at DESC
LIMIT 1;

-- 9. Check grok_evaluation_details structure
SELECT 
    '9. GROK EVALUATION DETAILS KEYS' as "Diagnostic",
    submission_hash,
    title,
    created_at,
    jsonb_object_keys(metadata->'grok_evaluation_details') as available_key
FROM contributions
WHERE metadata->'grok_evaluation_details' IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

-- 10. Check for zero scores
SELECT 
    '10. ZERO SCORES CHECK' as "Diagnostic",
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric = 0) as zero_pod_score,
    COUNT(*) FILTER (WHERE (metadata->>'novelty')::numeric = 0) as zero_novelty,
    COUNT(*) FILTER (WHERE (metadata->>'density')::numeric = 0) as zero_density,
    COUNT(*) FILTER (WHERE (metadata->>'coherence')::numeric = 0) as zero_coherence,
    COUNT(*) FILTER (WHERE (metadata->>'alignment')::numeric = 0) as zero_alignment,
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric > 0) as nonzero_pod_score,
    COUNT(*) as total
FROM contributions
WHERE metadata IS NOT NULL;

