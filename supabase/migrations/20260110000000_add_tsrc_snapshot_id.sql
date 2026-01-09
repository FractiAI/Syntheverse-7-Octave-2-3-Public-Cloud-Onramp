-- TSRC: Add snapshot_id field to contributions tables for deterministic evaluation
-- Content-addressed snapshot ID binds evaluation to specific archive state

-- Add snapshot_id to main contributions table
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS snapshot_id TEXT;

-- Add index for snapshot lookups
CREATE INDEX IF NOT EXISTS idx_contributions_snapshot_id ON contributions(snapshot_id);

-- Add comment explaining the field
COMMENT ON COLUMN contributions.snapshot_id IS 'TSRC: Content-addressed archive snapshot ID (SHA-256 hash) binding this evaluation to a specific immutable archive state for reproducibility';

-- Add snapshot_id to enterprise contributions table
ALTER TABLE enterprise_contributions
ADD COLUMN IF NOT EXISTS snapshot_id TEXT;

-- Add index for snapshot lookups
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_snapshot_id ON enterprise_contributions(snapshot_id);

-- Add comment explaining the field
COMMENT ON COLUMN enterprise_contributions.snapshot_id IS 'TSRC: Content-addressed archive snapshot ID (SHA-256 hash) binding this evaluation to a specific immutable archive state for reproducibility';

