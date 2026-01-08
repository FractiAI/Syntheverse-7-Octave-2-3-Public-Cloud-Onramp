-- Add edge detection column to contributions table
-- This is for content-based edge detection (E₀-E₆), not overlap-based sweet spot
-- Created: January 8, 2026

-- Add edge detection boolean
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_edge boolean DEFAULT false;

-- Add comments to clarify distinctions between different detection types
COMMENT ON COLUMN contributions.is_edge IS 
'Content-based edge detection (E₀-E₆): Boundary operators that enable interaction (Adjacency, Directionality, Feedback, Threshold, Exclusion, Compression, Expansion). Receives 15% multiplier. DIFFERENT from has_sweet_spot_edges which is overlap-based (9.2%-19.2%).';

COMMENT ON COLUMN contributions.is_seed IS 
'Content-based seed detection (S₀-S₈): Irreducible informational primitives (Holographic Hydrogen, Phase, Boundary, Recursion, Memory, Resonance, Scale Invariance, Identity, Constraint). Receives 15% multiplier. Combined seed+edge = 32.25% total bonus (1.15 × 1.15 = 1.3225).';

COMMENT ON COLUMN contributions.has_sweet_spot_edges IS 
'Overlap-based sweet spot detection (9.2%-19.2% overlap with archive). Receives overlap bonus multiplier. This is DIFFERENT from is_edge which is content-based boundary operator detection from Seeds & Edges paper.';

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_contributions_is_seed 
ON contributions(is_seed) 
WHERE is_seed = true;

CREATE INDEX IF NOT EXISTS idx_contributions_is_edge 
ON contributions(is_edge) 
WHERE is_edge = true;

-- Create composite index for seed+edge combinations
CREATE INDEX IF NOT EXISTS idx_contributions_seed_edge 
ON contributions(is_seed, is_edge) 
WHERE is_seed = true OR is_edge = true;

-- Create view for seed and edge submissions with multiplier calculation
CREATE OR REPLACE VIEW seed_and_edge_submissions AS
SELECT 
  submission_hash,
  title,
  contributor,
  status,
  is_seed,
  is_edge,
  has_sweet_spot_edges,
  overlap_percent,
  CASE 
    WHEN is_seed AND is_edge THEN 'Seed + Edge (×1.3225)'
    WHEN is_seed THEN 'Seed Only (×1.15)'
    WHEN is_edge THEN 'Edge Only (×1.15)'
    ELSE 'Standard (×1.0)'
  END as multiplier_type,
  CASE
    WHEN is_seed AND is_edge THEN 1.3225
    WHEN is_seed OR is_edge THEN 1.15
    ELSE 1.0
  END as multiplier_value,
  (metadata->>'pod_score')::numeric as pod_score,
  (metadata->>'novelty')::numeric as novelty,
  (metadata->>'density')::numeric as density,
  (metadata->>'coherence')::numeric as coherence,
  (metadata->>'alignment')::numeric as alignment,
  metals,
  created_at,
  updated_at
FROM contributions
WHERE is_seed = true OR is_edge = true
ORDER BY created_at DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON seed_and_edge_submissions TO authenticated;
-- GRANT SELECT ON seed_and_edge_submissions TO anon;

-- Verification query
-- Run this after migration to verify:
/*
SELECT 
  LEFT(submission_hash, 12) as hash,
  LEFT(title, 30) as title,
  is_seed,
  is_edge,
  has_sweet_spot_edges,
  multiplier_type,
  multiplier_value,
  pod_score,
  created_at
FROM seed_and_edge_submissions
ORDER BY created_at DESC
LIMIT 10;
*/

