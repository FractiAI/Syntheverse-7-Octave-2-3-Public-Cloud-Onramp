-- Clear PoC Archive for Testing
-- This script deletes all contributions, allocations, and PoC logs
-- 
-- WARNING: This will delete ALL PoC submissions, allocations, and logs!
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- Delete in order to respect foreign key constraints
-- 1. Delete allocations first (references contributions via submission_hash)
DELETE FROM allocations;

-- 2. Delete poc_log entries (references contributions via submission_hash)
DELETE FROM poc_log;

-- 3. Delete contributions
DELETE FROM contributions;

-- Verify deletion (including vector data)
SELECT 
    (SELECT COUNT(*) FROM contributions) as remaining_contributions,
    (SELECT COUNT(*) FROM allocations) as remaining_allocations,
    (SELECT COUNT(*) FROM poc_log) as remaining_logs,
    (SELECT COUNT(*) FROM contributions WHERE embedding IS NOT NULL) as remaining_embeddings,
    (SELECT COUNT(*) FROM contributions WHERE vector_x IS NOT NULL) as remaining_vector_x,
    (SELECT COUNT(*) FROM contributions WHERE vector_y IS NOT NULL) as remaining_vector_y,
    (SELECT COUNT(*) FROM contributions WHERE vector_z IS NOT NULL) as remaining_vector_z;

