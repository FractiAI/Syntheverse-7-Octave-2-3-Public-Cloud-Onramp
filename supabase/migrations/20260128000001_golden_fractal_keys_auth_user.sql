-- ============================================================================
-- Golden Fractal Key — tied to auth user (NSPFRNP catalog)
-- Copy-paste into Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ============================================================================
-- Purpose: Store gold keys per user so API validation is tied to authenticated user.
-- Keys are stored as SHA-256 hash; app hashes incoming key and checks key_hash + user_id.
-- ============================================================================

-- Table: golden_fractal_key_assignments
-- Each row = one Golden Fractal Key assigned to one user (key stored as hash).
CREATE TABLE IF NOT EXISTS golden_fractal_key_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(key_hash)
);

-- Tie to app users (users_table.id is auth user id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_table') THEN
    ALTER TABLE golden_fractal_key_assignments
      ADD CONSTRAINT fk_golden_fractal_key_user
      FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL; -- constraint already exists
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_golden_fractal_key_hash ON golden_fractal_key_assignments(key_hash);
CREATE INDEX IF NOT EXISTS idx_golden_fractal_key_user_id ON golden_fractal_key_assignments(user_id);

COMMENT ON TABLE golden_fractal_key_assignments IS 'NSPFRNP: Golden Fractal Keys tied to auth user; key_hash = SHA-256 of key';

-- Optional: gold_key_entitlements — users who have gold key access without a stored key
-- (e.g. grant by email/user_id; app can check hasValidGoldKey(request) OR user in this table)
CREATE TABLE IF NOT EXISTS gold_key_entitlements (
  user_id TEXT PRIMARY KEY,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  granted_by TEXT
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_table') THEN
    ALTER TABLE gold_key_entitlements
      ADD CONSTRAINT fk_gold_key_entitlements_user
      FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE gold_key_entitlements IS 'NSPFRNP: Users with gold key access (no key value stored)';

-- RLS
ALTER TABLE golden_fractal_key_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_key_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own key assignments only (user_id = auth user id as text)
DROP POLICY IF EXISTS "Users can read own key assignments" ON golden_fractal_key_assignments;
CREATE POLICY "Users can read own key assignments"
  ON golden_fractal_key_assignments FOR SELECT
  USING (user_id = auth.uid()::text);

-- Only service role can insert/update/delete key assignments (admin issues keys)
DROP POLICY IF EXISTS "Service role manages key assignments" ON golden_fractal_key_assignments;
CREATE POLICY "Service role manages key assignments"
  ON golden_fractal_key_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can read own entitlement row
DROP POLICY IF EXISTS "Users can read own entitlement" ON gold_key_entitlements;
CREATE POLICY "Users can read own entitlement"
  ON gold_key_entitlements FOR SELECT
  USING (user_id = auth.uid()::text);

-- Only service role can manage entitlements
DROP POLICY IF EXISTS "Service role manages entitlements" ON gold_key_entitlements;
CREATE POLICY "Service role manages entitlements"
  ON gold_key_entitlements FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Helper: resolve user_id from key (for app/server use with service role)
-- Returns user_id if key_hash matches and row exists.
-- ============================================================================
-- Usage from app: hash the key (e.g. crypto.createHash('sha256').update(key).digest('hex')),
-- then SELECT user_id FROM golden_fractal_key_assignments WHERE key_hash = $1.
-- Then require request auth user = that user_id.
-- ============================================================================

-- Example: grant gold key entitlement to a user by email (run in SQL Editor with your user id/email)
-- INSERT INTO gold_key_entitlements (user_id)
-- SELECT id FROM users_table WHERE email = 'user@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- Example: assign a Golden Fractal Key to a user (key_hash = SHA-256 hex of the key)
-- INSERT INTO golden_fractal_key_assignments (user_id, key_hash, label)
-- SELECT id, 'YOUR_SHA256_HEX_OF_THE_KEY', 'Production key'
-- FROM users_table WHERE email = 'user@example.com';
