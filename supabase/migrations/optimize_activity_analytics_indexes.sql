-- Optional: Optimize Indexes for Activity Analytics Queries
-- Run this in Supabase Dashboard → SQL Editor if queries are slow
-- These indexes will improve performance of DATE_TRUNC and date range queries

-- Index for poc_log created_at (for time-series queries)
CREATE INDEX IF NOT EXISTS idx_poc_log_created_at_date 
ON poc_log (DATE(created_at));

-- Index for contributions created_at (for time-series queries)
CREATE INDEX IF NOT EXISTS idx_contributions_created_at_date 
ON contributions (DATE(created_at));

-- Index for contributions status + created_at (for qualification queries)
CREATE INDEX IF NOT EXISTS idx_contributions_status_created_at 
ON contributions (status, created_at) 
WHERE status = 'qualified';

-- Index for metadata->>'pod_score' (for tier breakdown queries)
CREATE INDEX IF NOT EXISTS idx_contributions_metadata_pod_score 
ON contributions ((metadata->>'pod_score'))
WHERE status = 'qualified' AND metadata->>'pod_score' IS NOT NULL;

-- Note: These indexes are optional and will improve query performance
-- but the queries will work without them (just slower on large datasets)

