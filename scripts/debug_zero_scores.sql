-- ============================================
-- Debug Zero Scores Issue
-- ============================================
-- Check the most recent evaluation to see what Grok API returned

-- Step 1: Find the most recent evaluation that returned 0 scores
SELECT 
    'RECENT EVALUATIONS' as "Status",
    "submission_hash",
    "title",
    "created_at",
    "event_type",
    "event_status",
    "evaluation_result"->>'pod_score' as "pod_score",
    "evaluation_result"->>'novelty' as "novelty",
    "evaluation_result"->>'density' as "density",
    "evaluation_result"->>'coherence' as "coherence",
    "evaluation_result"->>'alignment' as "alignment",
    "error_message",
    "processing_time_ms"
FROM "poc_log"
WHERE "event_type" = 'evaluation_complete'
ORDER BY "created_at" DESC
LIMIT 5;

-- Step 2: Get the full Grok API response for the most recent evaluation (with 0 scores)
SELECT 
    'GROK API RESPONSE' as "Status",
    "submission_hash",
    "title",
    "grok_api_response",
    "evaluation_result",
    "error_message"
FROM "poc_log"
WHERE "event_type" = 'evaluation_complete'
    AND (
        ("evaluation_result"->>'pod_score')::numeric = 0 
        OR ("evaluation_result"->>'novelty')::numeric = 0
    )
ORDER BY "created_at" DESC
LIMIT 1;

-- Step 3: Check if PDF text was extracted properly (check submission log)
SELECT 
    'SUBMISSION DATA' as "Status",
    "submission_hash",
    "title",
    "request_data"->>'content_length' as "content_length",
    "request_data"->>'has_file' as "has_file",
    "request_data"->>'file_name' as "file_name",
    "created_at"
FROM "poc_log"
WHERE "event_type" = 'submission'
ORDER BY "created_at" DESC
LIMIT 3;
