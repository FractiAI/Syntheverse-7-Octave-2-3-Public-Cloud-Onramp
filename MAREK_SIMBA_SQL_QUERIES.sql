-- ============================================================================
-- MAREK & SIMBA TEST 2 - SUPABASE SQL QUERIES
-- ============================================================================
-- Purpose: Generate all requested test data directly from Supabase
-- Date: 2026-01-12
-- ============================================================================

-- ============================================================================
-- STEP 1: SUBMIT A FRESH TEST (Use UI)
-- ============================================================================
-- Go to: https://syntheverse-poc.vercel.app/submit
-- Submit test content and copy the submission_hash
-- Then run queries below with that hash

-- ============================================================================
-- QUERY 1: VERIFY THALET INFRASTRUCTURE
-- ============================================================================
-- Check that THALET migration is complete
SELECT 
  migration_name,
  status,
  started_at,
  completed_at,
  metadata->>'protocol' as protocol,
  metadata->>'compliance_level' as compliance_level
FROM thalet_migration_status
WHERE migration_name = 'atomic_score_column_addition';

-- Expected Result:
-- status = 'completed'
-- protocol = 'THALET'
-- compliance_level = 'Phase 1: Infrastructure'

-- ============================================================================
-- QUERY 2: GET FULL THALET DATA FOR SUBMISSION
-- ============================================================================
-- Replace <HASH> with your actual submission hash
-- This gets ALL the data Marek & Simba requested

SELECT 
  submission_hash,
  title,
  status,
  category,
  contributor,
  created_at,
  
  -- THALET atomic_score (top-level column)
  atomic_score,
  
  -- Extract specific THALET fields
  atomic_score->'final' as atomic_final_score,
  atomic_score->'execution_context' as execution_context,
  atomic_score->'trace' as scoring_trace,
  atomic_score->'integrity_hash' as integrity_hash,
  
  -- Legacy/metadata fields for comparison
  metadata,
  metadata->'pod_score' as metadata_pod_score,
  metadata->'score_trace' as legacy_score_trace,
  
  -- Redundancy/overlap data
  overlap_percent,
  is_seed,
  is_edge,
  has_sweet_spot_edges,
  
  -- Registration data
  registered,
  registration_date,
  registration_tx_hash
  
FROM contributions
WHERE submission_hash = '<REPLACE_WITH_ACTUAL_HASH>';

-- ============================================================================
-- QUERY 3: VALIDATE THALET EMISSION (Binary Proof)
-- ============================================================================
-- This query checks all THALET compliance criteria

SELECT 
  submission_hash,
  
  -- Check 1: atomic_score exists and is not null
  CASE 
    WHEN atomic_score IS NOT NULL THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as check_atomic_score_exists,
  
  -- Check 2: atomic_score has 'final' field
  CASE 
    WHEN atomic_score->'final' IS NOT NULL THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as check_final_exists,
  
  -- Check 3: execution_context exists
  CASE 
    WHEN atomic_score->'execution_context' IS NOT NULL THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as check_execution_context_exists,
  
  -- Check 4: integrity_hash exists
  CASE 
    WHEN atomic_score->'integrity_hash' IS NOT NULL THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as check_integrity_hash_exists,
  
  -- Check 5: trace exists
  CASE 
    WHEN atomic_score->'trace' IS NOT NULL THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as check_trace_exists,
  
  -- Check 6: No placeholder timestamps (2023)
  CASE 
    WHEN atomic_score->'execution_context'->>'timestamp_utc' NOT LIKE '2023%' THEN '✅ PASS'
    WHEN atomic_score->'execution_context'->>'timestamp_utc' IS NULL THEN '⚠️  MISSING'
    ELSE '❌ FAIL (placeholder timestamp)'
  END as check_timestamp_valid,
  
  -- Display actual values
  atomic_score->'final' as final_score,
  atomic_score->'execution_context'->>'timestamp_utc' as timestamp,
  atomic_score->'execution_context'->>'pipeline_version' as pipeline_version,
  atomic_score->'trace'->>'composite' as composite_score,
  atomic_score->>'integrity_hash' as integrity_hash_value

FROM contributions
WHERE submission_hash = '<REPLACE_WITH_ACTUAL_HASH>';

-- ============================================================================
-- QUERY 4: EXPORT RAW JSON FOR API SIMULATION
-- ============================================================================
-- This exports the data in the same format as GET /api/contributions/<hash>

SELECT jsonb_build_object(
  'submission_hash', submission_hash,
  'title', title,
  'status', status,
  'category', category,
  'contributor', contributor,
  'created_at', created_at,
  'atomic_score', atomic_score,
  'metadata', metadata,
  'metals', metals,
  'overlap_percent', overlap_percent,
  'is_seed', is_seed,
  'is_edge', is_edge,
  'has_sweet_spot_edges', has_sweet_spot_edges
) as api_response
FROM contributions
WHERE submission_hash = '<REPLACE_WITH_ACTUAL_HASH>';

-- Save this output to: test-2-contributions-response.json

-- ============================================================================
-- QUERY 5: EXTRACT EVALUATION TRACE
-- ============================================================================
-- This simulates POST /api/evaluate/<hash> response structure

SELECT jsonb_build_object(
  'success', true,
  'evaluation', jsonb_build_object(
    'pod_score', (atomic_score->'final')::numeric,
    'atomic_score', atomic_score,
    'metals', metals,
    'status', status
  )
) as evaluate_response
FROM contributions
WHERE submission_hash = '<REPLACE_WITH_ACTUAL_HASH>';

-- Save this output to: test-2-evaluate-response.json

-- ============================================================================
-- QUERY 6: FIND ANY EXISTING TEST SUBMISSIONS
-- ============================================================================
-- Use this if you don't have a specific hash yet

SELECT 
  submission_hash,
  title,
  contributor,
  status,
  created_at,
  CASE 
    WHEN atomic_score IS NOT NULL THEN '✅ HAS THALET'
    ELSE '❌ NO THALET'
  END as thalet_status,
  overlap_percent
FROM contributions
WHERE 
  (title ILIKE '%test%' OR title ILIKE '%hydrogen%' OR title ILIKE '%hhf%')
  OR contributor ILIKE '%test%'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- QUERY 7: CHECK ALL RECENT SUBMISSIONS (Last 7 Days)
-- ============================================================================

SELECT 
  submission_hash,
  LEFT(title, 50) as title_preview,
  status,
  created_at,
  CASE 
    WHEN atomic_score IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_thalet,
  overlap_percent,
  is_seed
FROM contributions
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================================================
-- QUERY 8: COMPREHENSIVE THALET REPORT
-- ============================================================================
-- This generates a full report on THALET emission status

SELECT 
  '=== THALET EMISSION REPORT ===' as section,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN atomic_score IS NOT NULL THEN 1 END) as with_atomic_score,
  COUNT(CASE WHEN atomic_score IS NULL THEN 1 END) as without_atomic_score,
  ROUND(
    100.0 * COUNT(CASE WHEN atomic_score IS NOT NULL THEN 1 END) / 
    NULLIF(COUNT(*), 0), 
    2
  ) as emission_percentage,
  MAX(created_at) as most_recent_submission
FROM contributions
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- QUERY 9: DETAILED THALET STRUCTURE ANALYSIS
-- ============================================================================
-- Analyzes the structure of atomic_score fields

SELECT 
  submission_hash,
  title,
  
  -- Structure checks
  jsonb_typeof(atomic_score) as atomic_score_type,
  jsonb_typeof(atomic_score->'final') as final_type,
  jsonb_typeof(atomic_score->'execution_context') as execution_context_type,
  jsonb_typeof(atomic_score->'trace') as trace_type,
  jsonb_typeof(atomic_score->'integrity_hash') as integrity_hash_type,
  
  -- Field counts
  jsonb_object_keys(atomic_score) as atomic_score_keys,
  jsonb_object_keys(atomic_score->'execution_context') as context_keys,
  jsonb_object_keys(atomic_score->'trace') as trace_keys
  
FROM contributions
WHERE atomic_score IS NOT NULL
LIMIT 5;

-- ============================================================================
-- QUERY 10: EXPORT FOR VERIFICATION SCRIPT
-- ============================================================================
-- This generates the exact data format that verify-thalet-emission.sh expects

SELECT jsonb_build_object(
  'metadata', jsonb_build_object(
    'atomic_score', atomic_score
  ),
  'pod_score', (atomic_score->'final')::numeric,
  'submission_hash', submission_hash
) as verification_input
FROM contributions
WHERE submission_hash = '<REPLACE_WITH_ACTUAL_HASH>';

-- ============================================================================
-- INSTRUCTIONS FOR MAREK & SIMBA
-- ============================================================================

/*
HOW TO USE THESE QUERIES:

1. SUBMIT TEST POC:
   - Go to https://syntheverse-poc.vercel.app/submit
   - Submit your Test 2 content
   - Copy the submission_hash you receive

2. RUN QUERY 2:
   - Replace <REPLACE_WITH_ACTUAL_HASH> with your hash
   - Save the entire result to: test-2-full-data.json

3. RUN QUERY 3:
   - Replace hash and run for validation checks
   - All checks should show ✅ PASS
   - Save result to: test-2-validation.txt

4. RUN QUERY 4:
   - Save output to: test-2-contributions-response.json
   - This is File #4 from your request

5. RUN QUERY 5:
   - Save output to: test-2-evaluate-response.json
   - This is File #3 from your request

6. CAPTURE UI SCREENSHOT:
   - Go to https://syntheverse-poc.vercel.app/dashboard
   - Find your submission
   - Screenshot the score display
   - Save as: test-2-ui-screenshot.png

7. SEND ALL FILES TO PRU:
   - test-2-full-data.json
   - test-2-validation.txt
   - test-2-contributions-response.json
   - test-2-evaluate-response.json
   - test-2-ui-screenshot.png

Then I'll run verification script and provide complete analysis.

EXPECTED RESULTS:
- All validation checks: ✅ PASS
- atomic_score.final = numeric value
- execution_context with toggles, timestamp, pipeline_version
- integrity_hash = "sha256:..."
- trace with composite, penalty, multipliers, final
- NO 2023 timestamps (should be 2026)

TIMELINE:
- Your submission: 5 minutes
- Run queries: 5 minutes
- Screenshot: 2 minutes
- Send to Pru: 1 minute
- My analysis: 30-60 minutes
- Total: ~1-2 hours for complete validation

CONTACT:
If any query fails or returns unexpected results, paste the error
and I'll provide the fix immediately.
*/

-- ============================================================================
-- END OF QUERIES
-- ============================================================================

