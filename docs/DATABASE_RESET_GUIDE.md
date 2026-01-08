# Database Reset Guide

Complete guide for resetting the Syntheverse database during testing and development.

## ⚠️ Important: Prevent Duplicate Submissions

Before using any reset, add this unique constraint (only needs to be run once):

```sql
-- Add unique constraint to prevent duplicate submissions
ALTER TABLE contributions 
ADD CONSTRAINT IF NOT EXISTS unique_submission_hash 
UNIQUE (submission_hash);

-- Verify constraint exists
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'contributions' 
  AND tc.constraint_type = 'UNIQUE';
```

---

## Reset Options

### Option 1: NUCLEAR RESET (Everything)

**Use when:** Fresh start, testing seed/edge detection, complete system reset

**Deletes:** Everything - all submissions, allocations, and logs

```sql
-- ============================================================================
-- SYNTHEVERSE DATABASE NUCLEAR RESET
-- Deletes ALL submissions, allocations, logs, and resets system state
-- USE WITH CAUTION: This cannot be undone
-- ============================================================================

-- Step 1: Show current state BEFORE reset
SELECT '=== BEFORE RESET ===' as status;

SELECT 
  'contributions' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified,
  COUNT(CASE WHEN status = 'evaluating' THEN 1 END) as evaluating,
  COUNT(CASE WHEN status = 'payment_pending' THEN 1 END) as payment_pending
FROM contributions
UNION ALL
SELECT 
  'allocations', 
  COUNT(*), 
  NULL, 
  NULL, 
  NULL
FROM allocations
UNION ALL
SELECT 
  'poc_log', 
  COUNT(*), 
  NULL, 
  NULL, 
  NULL
FROM poc_log;

-- Step 2: Nuclear deletion (order matters for foreign keys)
DELETE FROM allocations;
DELETE FROM poc_log;
DELETE FROM contributions;

-- Step 3: Verify clean slate
SELECT '=== AFTER RESET ===' as status;

SELECT 
  'contributions' as table_name, COUNT(*) as remaining_records FROM contributions
UNION ALL
SELECT 'allocations', COUNT(*) FROM allocations
UNION ALL
SELECT 'poc_log', COUNT(*) FROM poc_log;

-- Expected result: All counts should be 0

SELECT '✅ RESET COMPLETE - Database is now empty' as final_status;
```

---

### Option 2: SOFT RESET (Keep Qualified, Delete Tests)

**Use when:** Production testing, want to preserve qualified PoCs

**Deletes:** Only test submissions (payment_pending, evaluating, unqualified)

**Keeps:** Qualified and on-chain PoCs

```sql
-- ============================================================================
-- SYNTHEVERSE SOFT RESET
-- Deletes only test submissions, keeps qualified/on-chain PoCs
-- Safe for production testing
-- ============================================================================

-- Show what will be deleted
SELECT '=== SUBMISSIONS TO BE DELETED ===' as status;

SELECT 
  submission_hash,
  title,
  contributor,
  status,
  created_at
FROM contributions
WHERE status IN ('payment_pending', 'evaluating', 'unqualified')
ORDER BY created_at DESC;

-- Delete test submissions and their related data
DELETE FROM allocations 
WHERE submission_hash IN (
  SELECT submission_hash FROM contributions 
  WHERE status IN ('payment_pending', 'evaluating', 'unqualified')
);

DELETE FROM poc_log 
WHERE submission_hash IN (
  SELECT submission_hash FROM contributions 
  WHERE status IN ('payment_pending', 'evaluating', 'unqualified')
);

DELETE FROM contributions 
WHERE status IN ('payment_pending', 'evaluating', 'unqualified');

-- Show what remains
SELECT '=== REMAINING SUBMISSIONS ===' as status;

SELECT 
  submission_hash,
  title,
  contributor,
  status,
  (metadata->>'pod_score')::numeric as score,
  created_at
FROM contributions
WHERE status = 'qualified'
ORDER BY created_at DESC;
```

---

### Option 3: TIME-BASED RESET (Delete Recent Only)

**Use when:** Cleaning up recent tests, debugging specific time period

**Deletes:** Submissions from last N hours/days (configurable)

```sql
-- ============================================================================
-- SYNTHEVERSE TIME-BASED RESET
-- Deletes submissions from last N hours/days
-- Useful for cleaning up recent tests
-- ============================================================================

-- Show submissions in time window
SELECT '=== SUBMISSIONS IN TIME WINDOW ===' as status;

SELECT 
  submission_hash,
  title,
  contributor,
  status,
  created_at,
  NOW() - created_at as age
FROM contributions
WHERE created_at > NOW() - INTERVAL '24 hours'  -- Change time window here
ORDER BY created_at DESC;

-- Delete submissions from time window
DELETE FROM allocations 
WHERE submission_hash IN (
  SELECT submission_hash FROM contributions 
  WHERE created_at > NOW() - INTERVAL '24 hours'
);

DELETE FROM poc_log 
WHERE submission_hash IN (
  SELECT submission_hash FROM contributions 
  WHERE created_at > NOW() - INTERVAL '24 hours'
);

DELETE FROM contributions 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Verify
SELECT 
  'contributions' as table_name, COUNT(*) as remaining_records FROM contributions
UNION ALL
SELECT 'allocations', COUNT(*) FROM allocations
UNION ALL
SELECT 'poc_log', COUNT(*) FROM poc_log;
```

---

### Option 4: CONTRIBUTOR-SPECIFIC RESET

**Use when:** Deleting submissions from specific email/contributor

**Deletes:** All submissions from specified contributor

```sql
-- ============================================================================
-- SYNTHEVERSE CONTRIBUTOR-SPECIFIC RESET
-- Deletes submissions from specific email/contributor
-- ============================================================================

-- Set your email here
DO $$
DECLARE
  target_email TEXT := 'your-email@example.com';  -- CHANGE THIS
BEGIN
  -- Show what will be deleted
  RAISE NOTICE '=== SUBMISSIONS TO BE DELETED FOR: % ===', target_email;
  
  -- Delete in correct order
  DELETE FROM allocations WHERE contributor = target_email;
  DELETE FROM poc_log WHERE contributor = target_email;
  DELETE FROM contributions WHERE contributor = target_email;
  
  RAISE NOTICE '✅ All submissions deleted for: %', target_email;
END $$;

-- Verify
SELECT 
  contributor,
  COUNT(*) as remaining_submissions
FROM contributions
GROUP BY contributor;
```

---

### Option 5: DIAGNOSTIC RESET (Show Everything First)

**Use when:** Want to see complete database state before deciding to reset

**Deletes:** Nothing by default (must uncomment DELETE lines)

```sql
-- ============================================================================
-- SYNTHEVERSE DIAGNOSTIC RESET
-- Shows complete database state, then resets with confirmation
-- ============================================================================

-- Complete diagnostic view
SELECT '=== COMPLETE DATABASE STATE ===' as status;

-- Submissions by status
SELECT 
  status,
  COUNT(*) as count,
  AVG((metadata->>'pod_score')::numeric) as avg_score,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM contributions
GROUP BY status
ORDER BY status;

-- Submissions by contributor
SELECT 
  contributor,
  COUNT(*) as submission_count,
  COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_count,
  MAX(created_at) as last_submission
FROM contributions
GROUP BY contributor
ORDER BY submission_count DESC;

-- Seed and edge submissions
SELECT 
  'Seed Submissions' as type, COUNT(*) as count FROM contributions WHERE is_seed = true
UNION ALL
SELECT 'Edge Submissions', COUNT(*) FROM contributions WHERE is_edge = true
UNION ALL
SELECT 'Seed + Edge', COUNT(*) FROM contributions WHERE is_seed = true AND is_edge = true;

-- Allocation summary
SELECT 
  epoch,
  metal,
  COUNT(*) as allocation_count,
  SUM(reward) as total_synth_allocated
FROM allocations
GROUP BY epoch, metal
ORDER BY epoch, metal;

-- UNCOMMENT THE LINES BELOW TO ACTUALLY DELETE EVERYTHING:
-- DELETE FROM allocations;
-- DELETE FROM poc_log;
-- DELETE FROM contributions;

SELECT '⚠️ RESET COMMENTED OUT - Uncomment DELETE lines above to execute' as notice;
```

---

## Quick Reference Table

| Reset Type | Use When | What It Deletes | What It Keeps |
|------------|----------|-----------------|---------------|
| **Nuclear** | Fresh start, testing | Everything | Nothing |
| **Soft** | Keep qualified PoCs | Tests only | Qualified submissions |
| **Time-Based** | Recent tests | Last N hours/days | Older submissions |
| **Contributor** | Your submissions | Specific email | Other contributors |
| **Diagnostic** | Check before delete | Nothing (shows state) | Everything |

---

## Common Scenarios

### Scenario 1: Testing Seed/Edge Detection

Use **Nuclear Reset** to start with empty archive:

```sql
DELETE FROM allocations;
DELETE FROM poc_log;
DELETE FROM contributions;

SELECT COUNT(*) as remaining FROM contributions;
-- Should return: 0
```

### Scenario 2: Check for Duplicates

```sql
-- Find duplicate submissions
SELECT 
  title,
  contributor,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(submission_hash) as hashes,
  MIN(created_at) as first_submission,
  MAX(created_at) as last_submission
FROM contributions
GROUP BY title, contributor
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
```

### Scenario 3: Verify Seed/Edge Flags

```sql
-- Check seed and edge detection results
SELECT 
  submission_hash,
  LEFT(title, 40) as title,
  is_seed,
  is_edge,
  CASE 
    WHEN is_seed AND is_edge THEN 'Seed + Edge (×1.3225)'
    WHEN is_seed THEN 'Seed Only (×1.15)'
    WHEN is_edge THEN 'Edge Only (×1.15)'
    ELSE 'Standard'
  END as multiplier_type,
  (metadata->>'pod_score')::numeric as pod_score,
  status,
  created_at
FROM contributions
ORDER BY created_at DESC;
```

---

## Known Issues

### Issue: Duplicate Submissions

**Problem:** Multiple submissions created from single submit attempt

**Cause:** No unique constraint on `submission_hash`, allows duplicates

**Fix:** Add unique constraint (see top of this document)

### Issue: "Something Went Wrong" Black Page

**Problem:** User sees black error page after submission

**Cause:** Evaluation endpoint timeout or fetch failure

**Status:** Cosmetic issue - submission is usually saved successfully

**Workaround:** Check dashboard for submission status instead of relying on redirect

---

## Best Practices

1. **Always add unique constraint first** before testing
2. **Use Diagnostic Reset** to see state before deleting
3. **Soft Reset** is safer for production environments
4. **Nuclear Reset** is best for development/testing
5. **Check for duplicates** after each test submission
6. **Verify reset** by checking all three tables (contributions, allocations, poc_log)

---

## Migration Script

Add this to your Supabase migrations:

```sql
-- File: supabase/migrations/add_unique_constraint_submission_hash.sql
-- Prevent duplicate submissions

-- Add unique constraint
ALTER TABLE contributions 
ADD CONSTRAINT IF NOT EXISTS unique_submission_hash 
UNIQUE (submission_hash);

-- Add comment
COMMENT ON CONSTRAINT unique_submission_hash ON contributions 
IS 'Prevents duplicate submissions by ensuring submission_hash is unique';

-- Create index for performance (if not exists from constraint)
CREATE INDEX IF NOT EXISTS idx_contributions_submission_hash 
ON contributions(submission_hash);
```

---

## Support

For issues with database resets:

1. Check the [TROUBLESHOOTING_COMPLETE_SUMMARY.md](TROUBLESHOOTING_COMPLETE_SUMMARY.md)
2. Review [SEED_DETECTION_FIX.md](SEED_DETECTION_FIX.md) for seed-related issues
3. Check [EDGE_DETECTION_IMPLEMENTATION.md](EDGE_DETECTION_IMPLEMENTATION.md) for edge-related issues

---

**Last Updated:** January 8, 2026  
**Version:** 1.0

