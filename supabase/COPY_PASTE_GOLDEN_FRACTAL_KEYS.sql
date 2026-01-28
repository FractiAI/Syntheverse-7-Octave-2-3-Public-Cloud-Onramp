-- ============================================================================
-- Syntheverse: Golden Fractal Key — tied to auth user (NSPFRNP)
-- Copy this entire file into Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

CREATE TABLE IF NOT EXISTS golden_fractal_key_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(key_hash)
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_table') THEN
    ALTER TABLE golden_fractal_key_assignments
      ADD CONSTRAINT fk_golden_fractal_key_user
      FOREIGN KEY (user_id) REFERENCES public.users_table(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_golden_fractal_key_hash ON golden_fractal_key_assignments(key_hash);
CREATE INDEX IF NOT EXISTS idx_golden_fractal_key_user_id ON golden_fractal_key_assignments(user_id);

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

ALTER TABLE golden_fractal_key_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_key_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own key assignments" ON golden_fractal_key_assignments;
CREATE POLICY "Users can read own key assignments"
  ON golden_fractal_key_assignments FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Service role manages key assignments" ON golden_fractal_key_assignments;
CREATE POLICY "Service role manages key assignments"
  ON golden_fractal_key_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Users can read own entitlement" ON gold_key_entitlements;
CREATE POLICY "Users can read own entitlement"
  ON gold_key_entitlements FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Service role manages entitlements" ON gold_key_entitlements;
CREATE POLICY "Service role manages entitlements"
  ON gold_key_entitlements FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
