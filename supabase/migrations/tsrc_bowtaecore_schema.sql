-- ============================================================================
-- TSRC BøwTæCøre Gate Model Schema
-- ============================================================================
-- Layer -1: Proposal Envelopes (untrusted, no side-effects)
-- Layer 0a: Projected Commands (deterministic projector/veto)
-- Layer 0b: Authorizations (minimal authorizer with counters/leases)
-- Layer +1: Execution Audit Log (fail-closed executor records)
-- ============================================================================

-- ============================================================================
-- LAYER -1: PROPOSAL ENVELOPES
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposal_envelopes (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core fields
  proposal_id UUID UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  intent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Trace
  run_id TEXT NOT NULL,
  inputs_hash TEXT NOT NULL, -- SHA-256 hex
  
  -- Determinism contract
  provider TEXT NOT NULL, -- 'groq', 'openai', etc.
  model TEXT NOT NULL,
  temperature NUMERIC(5,3) NOT NULL,
  prompt_hash TEXT NOT NULL, -- SHA-256 hex
  content_hash TEXT, -- SHA-256 hex
  seed INTEGER,
  score_config_id TEXT NOT NULL,
  archive_snapshot_id TEXT NOT NULL,
  mode_state TEXT, -- 'growth', 'saturation', 'safe_mode', 'validation'
  
  -- Score toggles
  seed_on BOOLEAN DEFAULT FALSE,
  edge_on BOOLEAN DEFAULT FALSE,
  overlap_on BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'projected', 'authorized', 'executed', 'vetoed', 'rejected'
  
  -- Indexes
  CONSTRAINT proposal_envelopes_action_type_check CHECK (action_type IN ('score_poc_proposal', 'create_payment_session', 'register_blockchain', 'update_snapshot', 'other'))
);

CREATE INDEX idx_proposal_envelopes_proposal_id ON proposal_envelopes(proposal_id);
CREATE INDEX idx_proposal_envelopes_timestamp ON proposal_envelopes(timestamp DESC);
CREATE INDEX idx_proposal_envelopes_action_type ON proposal_envelopes(action_type);
CREATE INDEX idx_proposal_envelopes_status ON proposal_envelopes(status);
CREATE INDEX idx_proposal_envelopes_user_id ON proposal_envelopes(user_id);
CREATE INDEX idx_proposal_envelopes_submission_id ON proposal_envelopes(submission_id);
CREATE INDEX idx_proposal_envelopes_inputs_hash ON proposal_envelopes(inputs_hash);

-- ============================================================================
-- LAYER 0a: PROJECTED COMMANDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projected_commands (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core identifiers
  projection_id UUID UNIQUE NOT NULL,
  proposal_id UUID NOT NULL REFERENCES proposal_envelopes(proposal_id) ON DELETE CASCADE,
  
  -- Policy tracking
  kman_hash TEXT NOT NULL, -- Capability manifest hash
  bset_hash TEXT NOT NULL, -- Forbidden action set hash
  policy_seq INTEGER NOT NULL, -- Monotonically increasing
  
  -- Mode and closure
  mode_id TEXT NOT NULL, -- 'normal', 'safe_mode', 'validation'
  closure_op TEXT NOT NULL, -- 'axis', 'kiss', 'custom'
  closure_d_def TEXT NOT NULL,
  closure_d INTEGER NOT NULL,
  
  -- Action
  action_type TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Risk and artifact classification
  risk_tier INTEGER NOT NULL, -- 0, 1, 2, 3
  artifact_sink_ref TEXT,
  artifact_class TEXT NOT NULL, -- 'data', 'control', 'na'
  
  -- Checks and veto
  checks_passed TEXT[] DEFAULT '{}',
  is_veto BOOLEAN NOT NULL DEFAULT FALSE,
  veto_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  projected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'authorized', 'executed', 'vetoed'
  
  -- Constraints
  CONSTRAINT projected_commands_risk_tier_check CHECK (risk_tier IN (0, 1, 2, 3)),
  CONSTRAINT projected_commands_artifact_class_check CHECK (artifact_class IN ('data', 'control', 'na')),
  CONSTRAINT projected_commands_closure_op_check CHECK (closure_op IN ('axis', 'kiss', 'custom')),
  CONSTRAINT projected_commands_veto_check CHECK ((is_veto = TRUE AND veto_reason IS NOT NULL) OR (is_veto = FALSE))
);

CREATE INDEX idx_projected_commands_projection_id ON projected_commands(projection_id);
CREATE INDEX idx_projected_commands_proposal_id ON projected_commands(proposal_id);
CREATE INDEX idx_projected_commands_policy_seq ON projected_commands(policy_seq DESC);
CREATE INDEX idx_projected_commands_risk_tier ON projected_commands(risk_tier);
CREATE INDEX idx_projected_commands_is_veto ON projected_commands(is_veto);
CREATE INDEX idx_projected_commands_status ON projected_commands(status);
CREATE INDEX idx_projected_commands_created_at ON projected_commands(created_at DESC);

-- ============================================================================
-- LAYER 0b: AUTHORIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorizations (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core identifiers
  command_id UUID UNIQUE NOT NULL,
  projection_id UUID NOT NULL REFERENCES projected_commands(projection_id) ON DELETE CASCADE,
  
  -- Timing
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lease_id UUID NOT NULL,
  lease_valid_for_ms INTEGER NOT NULL, -- Milliseconds
  expires_at TIMESTAMPTZ NOT NULL, -- Computed: issued_at + lease_valid_for_ms
  
  -- Anti-replay counter
  cmd_counter BIGINT NOT NULL,
  
  -- Policy tracking (copied from projected command)
  kman_hash TEXT NOT NULL,
  bset_hash TEXT NOT NULL,
  policy_seq INTEGER NOT NULL,
  
  -- Mode and closure (copied from projected command)
  mode_id TEXT NOT NULL,
  closure_op TEXT NOT NULL,
  closure_d_def TEXT NOT NULL,
  closure_d INTEGER NOT NULL,
  
  -- Action (copied from projected command)
  action_type TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Signature
  sig_alg TEXT NOT NULL, -- 'hmac-sha256', 'ed25519'
  sig_canonicalization TEXT NOT NULL, -- 'jcs-rfc8785'
  sig_key_id TEXT NOT NULL,
  sig_payload_hash TEXT NOT NULL, -- SHA-256 hex
  sig_b64 TEXT NOT NULL, -- Base64 signature
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'executed', 'expired', 'revoked'
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  
  -- Constraints
  CONSTRAINT authorizations_sig_alg_check CHECK (sig_alg IN ('hmac-sha256', 'ed25519')),
  CONSTRAINT authorizations_status_check CHECK (status IN ('pending', 'executed', 'expired', 'revoked')),
  CONSTRAINT authorizations_cmd_counter_positive CHECK (cmd_counter >= 0),
  CONSTRAINT authorizations_lease_positive CHECK (lease_valid_for_ms > 0)
);

-- Unique counter to prevent replay attacks
CREATE UNIQUE INDEX idx_authorizations_cmd_counter ON authorizations(cmd_counter);

CREATE INDEX idx_authorizations_command_id ON authorizations(command_id);
CREATE INDEX idx_authorizations_projection_id ON authorizations(projection_id);
CREATE INDEX idx_authorizations_lease_id ON authorizations(lease_id);
CREATE INDEX idx_authorizations_issued_at ON authorizations(issued_at DESC);
CREATE INDEX idx_authorizations_expires_at ON authorizations(expires_at);
CREATE INDEX idx_authorizations_status ON authorizations(status);
CREATE INDEX idx_authorizations_policy_seq ON authorizations(policy_seq DESC);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Command Counter Management (anti-replay)
CREATE TABLE IF NOT EXISTS command_counters (
  id BIGSERIAL PRIMARY KEY,
  
  counter_scope TEXT NOT NULL, -- 'global', 'per_action_type', 'per_user'
  scope_key TEXT, -- NULL for global, action_type or user_id for scoped
  
  current_counter BIGINT NOT NULL DEFAULT 0,
  last_incremented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT command_counters_scope_check CHECK (counter_scope IN ('global', 'per_action_type', 'per_user')),
  CONSTRAINT command_counters_unique_scope UNIQUE (counter_scope, scope_key)
);

CREATE INDEX idx_command_counters_scope ON command_counters(counter_scope, scope_key);

-- Lease Management
CREATE TABLE IF NOT EXISTS leases (
  id BIGSERIAL PRIMARY KEY,
  
  lease_id UUID UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_for_ms INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  authorization_id BIGINT REFERENCES authorizations(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked'
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT leases_status_check CHECK (status IN ('active', 'expired', 'revoked'))
);

CREATE INDEX idx_leases_lease_id ON leases(lease_id);
CREATE INDEX idx_leases_expires_at ON leases(expires_at);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_authorization_id ON leases(authorization_id);

-- Policy Versions (monotonic)
CREATE TABLE IF NOT EXISTS policy_versions (
  id BIGSERIAL PRIMARY KEY,
  
  policy_seq INTEGER UNIQUE NOT NULL,
  kman_hash TEXT NOT NULL,
  bset_hash TEXT NOT NULL,
  
  kman_content JSONB NOT NULL, -- Capability manifest
  bset_content JSONB NOT NULL, -- Forbidden action set
  
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  superseded_at TIMESTAMPTZ,
  
  created_by TEXT,
  justification TEXT,
  
  -- Governance
  requires_governance BOOLEAN DEFAULT FALSE,
  approved_by TEXT[] DEFAULT '{}',
  approval_threshold INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT policy_versions_seq_positive CHECK (policy_seq >= 0)
);

CREATE INDEX idx_policy_versions_policy_seq ON policy_versions(policy_seq DESC);
CREATE INDEX idx_policy_versions_effective_at ON policy_versions(effective_at DESC);
CREATE INDEX idx_policy_versions_kman_hash ON policy_versions(kman_hash);
CREATE INDEX idx_policy_versions_bset_hash ON policy_versions(bset_hash);

-- ============================================================================
-- LAYER +1: EXECUTION AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS execution_audit_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- References
  command_id UUID NOT NULL REFERENCES authorizations(command_id) ON DELETE CASCADE,
  authorization_id BIGINT NOT NULL REFERENCES authorizations(id) ON DELETE CASCADE,
  projection_id UUID NOT NULL,
  proposal_id UUID NOT NULL,
  
  -- Execution details
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_type TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Result
  success BOOLEAN NOT NULL,
  result JSONB,
  error_message TEXT,
  error_code TEXT,
  
  -- Side effects (what actually happened)
  db_writes JSONB, -- Tables/rows affected
  payment_created JSONB, -- Payment session details
  blockchain_tx JSONB, -- Transaction hash/details
  
  -- Verification trace
  counter_verified BOOLEAN NOT NULL,
  lease_verified BOOLEAN NOT NULL,
  policy_verified BOOLEAN NOT NULL,
  signature_verified BOOLEAN NOT NULL,
  
  -- Duration
  duration_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_execution_audit_log_command_id ON execution_audit_log(command_id);
CREATE INDEX idx_execution_audit_log_authorization_id ON execution_audit_log(authorization_id);
CREATE INDEX idx_execution_audit_log_executed_at ON execution_audit_log(executed_at DESC);
CREATE INDEX idx_execution_audit_log_success ON execution_audit_log(success);
CREATE INDEX idx_execution_audit_log_action_type ON execution_audit_log(action_type);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get next command counter
CREATE OR REPLACE FUNCTION get_next_command_counter(
  p_scope TEXT DEFAULT 'global',
  p_scope_key TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_counter BIGINT;
BEGIN
  -- Insert or update counter
  INSERT INTO command_counters (counter_scope, scope_key, current_counter, last_incremented_at, updated_at)
  VALUES (p_scope, p_scope_key, 1, NOW(), NOW())
  ON CONFLICT (counter_scope, scope_key)
  DO UPDATE SET 
    current_counter = command_counters.current_counter + 1,
    last_incremented_at = NOW(),
    updated_at = NOW()
  RETURNING current_counter INTO v_counter;
  
  RETURN v_counter;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if lease is valid
CREATE OR REPLACE FUNCTION is_lease_valid(p_lease_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  SELECT (status = 'active' AND expires_at > NOW())
  INTO v_valid
  FROM leases
  WHERE lease_id = p_lease_id;
  
  RETURN COALESCE(v_valid, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function: Expire old leases (run periodically)
CREATE OR REPLACE FUNCTION expire_old_leases()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE leases
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at <= NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Update authorization status from projected command
CREATE OR REPLACE FUNCTION sync_authorization_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When an authorization is executed, update the projected command
  IF NEW.status = 'executed' AND OLD.status != 'executed' THEN
    UPDATE projected_commands
    SET status = 'executed'
    WHERE projection_id = NEW.projection_id;
    
    UPDATE proposal_envelopes
    SET status = 'executed'
    WHERE proposal_id = (
      SELECT proposal_id 
      FROM projected_commands 
      WHERE projection_id = NEW.projection_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_authorization_status
AFTER UPDATE ON authorizations
FOR EACH ROW
WHEN (NEW.status != OLD.status)
EXECUTE FUNCTION sync_authorization_status();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Full pipeline trace (proposal → projection → authorization → execution)
CREATE OR REPLACE VIEW pipeline_trace AS
SELECT 
  pe.proposal_id,
  pe.timestamp AS proposal_timestamp,
  pe.intent,
  pe.action_type,
  pe.params AS proposal_params,
  pe.status AS proposal_status,
  
  pc.projection_id,
  pc.projected_at,
  pc.risk_tier,
  pc.artifact_class,
  pc.is_veto,
  pc.veto_reason,
  pc.status AS projection_status,
  
  a.command_id,
  a.issued_at AS authorization_issued_at,
  a.expires_at AS authorization_expires_at,
  a.cmd_counter,
  a.status AS authorization_status,
  
  eal.executed_at,
  eal.success AS execution_success,
  eal.error_message AS execution_error,
  eal.duration_ms AS execution_duration_ms,
  
  -- Policy tracking
  pc.policy_seq,
  pc.kman_hash,
  pc.bset_hash,
  pc.mode_id
  
FROM proposal_envelopes pe
LEFT JOIN projected_commands pc ON pe.proposal_id = pc.proposal_id
LEFT JOIN authorizations a ON pc.projection_id = a.projection_id
LEFT JOIN execution_audit_log eal ON a.command_id = eal.command_id
ORDER BY pe.timestamp DESC;

-- View: Active authorizations (not expired, not executed)
CREATE OR REPLACE VIEW active_authorizations AS
SELECT 
  a.*,
  l.status AS lease_status,
  pc.action_type,
  pc.risk_tier,
  pe.user_id
FROM authorizations a
JOIN leases l ON a.lease_id = l.lease_id
JOIN projected_commands pc ON a.projection_id = pc.projection_id
JOIN proposal_envelopes pe ON pc.proposal_id = pe.proposal_id
WHERE a.status = 'pending'
  AND l.status = 'active'
  AND a.expires_at > NOW()
ORDER BY a.issued_at DESC;

-- View: Veto log
CREATE OR REPLACE VIEW veto_log AS
SELECT 
  pc.projection_id,
  pc.projected_at,
  pc.veto_reason,
  pc.risk_tier,
  pc.artifact_class,
  pe.proposal_id,
  pe.action_type,
  pe.user_id,
  pe.submission_id
FROM projected_commands pc
JOIN proposal_envelopes pe ON pc.proposal_id = pe.proposal_id
WHERE pc.is_veto = TRUE
ORDER BY pc.projected_at DESC;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Initialize global counter
INSERT INTO command_counters (counter_scope, scope_key, current_counter)
VALUES ('global', NULL, 0)
ON CONFLICT (counter_scope, scope_key) DO NOTHING;

-- Initialize first policy version (permissive bootstrap)
INSERT INTO policy_versions (
  policy_seq,
  kman_hash,
  bset_hash,
  kman_content,
  bset_content,
  effective_at,
  created_by,
  justification
)
VALUES (
  0,
  'bootstrap_kman_v0',
  'bootstrap_bset_v0',
  '{
    "capabilities": [
      "score_poc_proposal",
      "create_payment_session",
      "register_blockchain",
      "update_snapshot"
    ],
    "risk_tiers": {
      "score_poc_proposal": 1,
      "create_payment_session": 2,
      "register_blockchain": 2,
      "update_snapshot": 2
    }
  }'::jsonb,
  '{
    "forbidden_actions": [],
    "control_artifacts_disabled": false,
    "max_risk_tier_allowed": 3
  }'::jsonb,
  NOW(),
  'system',
  'Bootstrap policy - permissive initial state for Phase 1 testing'
)
ON CONFLICT (policy_seq) DO NOTHING;

-- ============================================================================
-- PERMISSIONS (Supabase RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE proposal_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projected_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own proposals
CREATE POLICY "Users can read their own proposals"
ON proposal_envelopes FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Policy: Service role can insert proposals (Layer -1)
CREATE POLICY "Service role can insert proposals"
ON proposal_envelopes FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can read/write all projections (Layer 0a)
CREATE POLICY "Service role can manage projections"
ON projected_commands FOR ALL
USING (auth.role() = 'service_role');

-- Policy: Service role can read/write all authorizations (Layer 0b)
CREATE POLICY "Service role can manage authorizations"
ON authorizations FOR ALL
USING (auth.role() = 'service_role');

-- Policy: Service role can read/write counters
CREATE POLICY "Service role can manage counters"
ON command_counters FOR ALL
USING (auth.role() = 'service_role');

-- Policy: Service role can read/write leases
CREATE POLICY "Service role can manage leases"
ON leases FOR ALL
USING (auth.role() = 'service_role');

-- Policy: Everyone can read policy versions
CREATE POLICY "Everyone can read policy versions"
ON policy_versions FOR SELECT
USING (true);

-- Policy: Only service role can create policy versions
CREATE POLICY "Service role can create policy versions"
ON policy_versions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can write audit log (Layer +1)
CREATE POLICY "Service role can write audit log"
ON execution_audit_log FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can read audit log for their commands
CREATE POLICY "Users can read their audit log"
ON execution_audit_log FOR SELECT
USING (
  auth.role() = 'service_role' OR
  proposal_id IN (
    SELECT proposal_id FROM proposal_envelopes WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE proposal_envelopes IS 'Layer -1: Untrusted proposals from evaluation engine (no side-effects)';
COMMENT ON TABLE projected_commands IS 'Layer 0a: Deterministic projector output with veto capability';
COMMENT ON TABLE authorizations IS 'Layer 0b: Minimal authorizer output with counters/leases/signatures';
COMMENT ON TABLE execution_audit_log IS 'Layer +1: Fail-closed executor audit trail';
COMMENT ON TABLE command_counters IS 'Anti-replay counter management (prevents replay attacks)';
COMMENT ON TABLE leases IS 'Time-bound execution leases (limits execution window)';
COMMENT ON TABLE policy_versions IS 'Monotonic policy versioning (can only tighten)';

COMMENT ON FUNCTION get_next_command_counter IS 'Atomically increment and return next command counter';
COMMENT ON FUNCTION is_lease_valid IS 'Check if a lease is still active and not expired';
COMMENT ON FUNCTION expire_old_leases IS 'Batch expire leases past their expiration time';

COMMENT ON VIEW pipeline_trace IS 'Complete audit trail from proposal → projection → authorization → execution';
COMMENT ON VIEW active_authorizations IS 'Currently valid authorizations (not expired, not executed)';
COMMENT ON VIEW veto_log IS 'All vetoed projections with reasons';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

