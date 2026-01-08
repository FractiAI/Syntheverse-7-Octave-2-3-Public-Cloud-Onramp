-- Create scoring_config table for runtime scoring configuration
-- This table stores configuration options that can be toggled by creators/operators

CREATE TABLE IF NOT EXISTS scoring_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on config_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_scoring_config_key ON scoring_config(config_key);

-- Insert default multiplier config
INSERT INTO scoring_config (config_key, config_value, updated_by)
VALUES (
  'multiplier_toggles',
  '{"seed_enabled": true, "edge_enabled": true}'::jsonb,
  'system'
)
ON CONFLICT (config_key) DO NOTHING;

-- Enable RLS
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read scoring config
CREATE POLICY "Anyone authenticated can read scoring config"
ON scoring_config FOR SELECT
TO authenticated
USING (true);

-- Policy: Only creators and operators can update scoring config
CREATE POLICY "Only creators and operators can update scoring config"
ON scoring_config FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND (users_table.role = 'creator' OR users_table.role = 'operator')
  )
);

-- Add comment
COMMENT ON TABLE scoring_config IS 'Runtime configuration for scoring system - used for testing and tuning';
COMMENT ON COLUMN scoring_config.config_key IS 'Unique identifier for config option (e.g., multiplier_toggles)';
COMMENT ON COLUMN scoring_config.config_value IS 'JSONB value storing the configuration';

