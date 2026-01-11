-- ============================================================================
-- THALET Protocol Compliance Migration
-- Date: 2026-01-11
-- Purpose: Add atomic_score column for Atomic Data Sovereignty
-- ============================================================================

-- Add atomic_score column to contributions table
-- This column stores the THALET-compliant atomic score payload
-- It is the single source of truth for all PoC scores
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS atomic_score JSONB;

-- Create GIN index on atomic_score for performance
-- Allows efficient querying of JSONB fields
CREATE INDEX IF NOT EXISTS idx_contributions_atomic_score 
ON contributions USING gin(atomic_score);

-- Add validation constraint to ensure atomic_score integrity
-- Enforces THALET Protocol requirements:
-- 1. Must have 'final' field (sovereign score)
-- 2. Must have 'execution_context' object
-- 3. Must have 'integrity_hash' field
-- 4. Final score must be in range [0, 10000]
ALTER TABLE contributions
ADD CONSTRAINT chk_atomic_score_integrity
CHECK (
  atomic_score IS NULL OR (
    atomic_score ? 'final' AND
    atomic_score ? 'execution_context' AND
    atomic_score ? 'integrity_hash' AND
    atomic_score ? 'trace' AND
    (atomic_score->>'final')::numeric >= 0 AND
    (atomic_score->>'final')::numeric <= 10000
  )
);

-- Add comment for documentation
COMMENT ON COLUMN contributions.atomic_score IS 
'THALET Protocol compliant atomic score payload. Single source of truth for PoC score. Contains: final (sovereign field), execution_context (toggles, seed, timestamp_utc, pipeline_version, operator_id), trace (intermediate steps), integrity_hash (SHA-256 for validation).';

-- Create index on final score for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_contributions_atomic_final_score
ON contributions ((atomic_score->>'final')::numeric DESC NULLS LAST);

-- Create index on execution context timestamp for temporal queries
CREATE INDEX IF NOT EXISTS idx_contributions_atomic_timestamp
ON contributions ((atomic_score->'execution_context'->>'timestamp_utc'));

-- ============================================================================
-- Backward Compatibility View
-- ============================================================================
-- Create a view that prioritizes atomic_score but falls back to legacy fields
-- This allows gradual migration without breaking existing queries

CREATE OR REPLACE VIEW contributions_with_score AS
SELECT 
  id,
  user_id,
  title,
  description,
  hash,
  status,
  created_at,
  updated_at,
  metadata,
  atomic_score,
  -- Computed field: Use atomic_score.final if available, else fall back to legacy
  COALESCE(
    (atomic_score->>'final')::numeric,
    (metadata->'score_trace'->>'final_score')::numeric,
    (metadata->>'pod_score')::numeric,
    pod_score,
    0
  ) AS computed_score,
  -- Flag indicating which source was used
  CASE
    WHEN atomic_score IS NOT NULL AND atomic_score ? 'final' THEN 'atomic_score'
    WHEN metadata->'score_trace' ? 'final_score' THEN 'score_trace'
    WHEN metadata ? 'pod_score' THEN 'metadata_pod_score'
    WHEN pod_score IS NOT NULL THEN 'pod_score_column'
    ELSE 'none'
  END AS score_source,
  -- THALET compliance flag
  CASE
    WHEN atomic_score IS NOT NULL 
      AND atomic_score ? 'final'
      AND atomic_score ? 'execution_context'
      AND atomic_score ? 'integrity_hash'
    THEN true
    ELSE false
  END AS is_thalet_compliant
FROM contributions;

COMMENT ON VIEW contributions_with_score IS 
'Backward-compatible view that prioritizes THALET-compliant atomic_score but falls back to legacy score fields. Use computed_score for display, score_source to identify data origin, and is_thalet_compliant to filter for validated scores.';

-- ============================================================================
-- Migration Status Tracking
-- ============================================================================
-- Create a table to track THALET compliance migration progress

CREATE TABLE IF NOT EXISTS thalet_migration_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_records INTEGER DEFAULT 0,
  migrated_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Insert initial migration record
INSERT INTO thalet_migration_status (migration_name, status, metadata)
VALUES (
  'atomic_score_column_addition',
  'completed',
  jsonb_build_object(
    'migration_file', '20260111000001_thalet_compliance.sql',
    'protocol', 'THALET',
    'compliance_level', 'Phase 1: Infrastructure',
    'description', 'Added atomic_score column with validation constraints and indexes'
  )
)
ON CONFLICT (migration_name) DO NOTHING;

-- ============================================================================
-- Audit Log Enhancement
-- ============================================================================
-- Add trigger to log atomic_score changes for audit trail

CREATE OR REPLACE FUNCTION log_atomic_score_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if atomic_score changed
  IF (TG_OP = 'UPDATE' AND OLD.atomic_score IS DISTINCT FROM NEW.atomic_score) OR TG_OP = 'INSERT' THEN
    -- Log to metadata if audit_log exists
    IF NEW.metadata ? 'audit_log' THEN
      NEW.metadata = jsonb_set(
        NEW.metadata,
        '{audit_log}',
        (NEW.metadata->'audit_log') || jsonb_build_array(
          jsonb_build_object(
            'timestamp', NOW(),
            'action', TG_OP,
            'field', 'atomic_score',
            'integrity_hash', NEW.atomic_score->'integrity_hash',
            'final_score', NEW.atomic_score->'final'
          )
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for atomic_score audit logging
DROP TRIGGER IF EXISTS trigger_log_atomic_score_change ON contributions;
CREATE TRIGGER trigger_log_atomic_score_change
  BEFORE INSERT OR UPDATE ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION log_atomic_score_change();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to validate atomic_score integrity hash
CREATE OR REPLACE FUNCTION validate_atomic_score_hash(score_payload JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
  computed_hash TEXT;
  payload_without_hash JSONB;
BEGIN
  -- Extract stored hash
  stored_hash := score_payload->>'integrity_hash';
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Remove hash from payload for recomputation
  payload_without_hash := score_payload - 'integrity_hash';
  
  -- Compute hash (Note: This is a placeholder - actual hash computation
  -- should match the TypeScript implementation using SHA-256)
  -- In production, use pgcrypto extension: digest(payload_without_hash::text, 'sha256')
  
  -- For now, just validate structure
  RETURN score_payload ? 'final' 
    AND score_payload ? 'execution_context'
    AND score_payload ? 'trace'
    AND score_payload ? 'integrity_hash';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_atomic_score_hash IS 
'Validates atomic_score integrity hash. Returns true if structure is valid. Full hash validation requires pgcrypto extension.';

-- Function to extract score safely with validation
CREATE OR REPLACE FUNCTION get_validated_score(contribution_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  score_payload JSONB;
  final_score NUMERIC;
BEGIN
  -- Get atomic_score
  SELECT atomic_score INTO score_payload
  FROM contributions
  WHERE id = contribution_id;
  
  -- Validate and extract
  IF score_payload IS NULL THEN
    RAISE EXCEPTION 'No atomic_score found for contribution %', contribution_id;
  END IF;
  
  IF NOT validate_atomic_score_hash(score_payload) THEN
    RAISE EXCEPTION 'Invalid atomic_score structure for contribution %', contribution_id;
  END IF;
  
  final_score := (score_payload->>'final')::numeric;
  
  IF final_score < 0 OR final_score > 10000 THEN
    RAISE EXCEPTION 'Score % out of range [0, 10000] for contribution %', final_score, contribution_id;
  END IF;
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_validated_score IS 
'Safely extracts and validates score from atomic_score payload. Throws exception if invalid. Use for critical operations requiring validated data.';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'THALET Protocol compliance migration completed successfully';
  RAISE NOTICE 'Added: atomic_score column with validation constraints';
  RAISE NOTICE 'Added: Performance indexes on atomic_score fields';
  RAISE NOTICE 'Added: Backward-compatible view (contributions_with_score)';
  RAISE NOTICE 'Added: Audit logging trigger for atomic_score changes';
  RAISE NOTICE 'Added: Helper functions for validation';
  RAISE NOTICE 'Status: Phase 1 Infrastructure Complete';
  RAISE NOTICE 'Next: Migrate existing contributions to atomic_score format';
END $$;

