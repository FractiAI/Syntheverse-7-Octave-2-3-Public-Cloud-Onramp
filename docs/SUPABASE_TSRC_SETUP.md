# Supabase Setup for TSRC BøwTæCøre Gate Model

## Overview

This guide walks through setting up the database schema for the TSRC BøwTæCøre gate model in Supabase.

---

## Quick Setup

### **Option 1: Copy-Paste into Supabase SQL Editor** ✨

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** in left sidebar

2. **Create New Query**
   - Click **"New Query"** button

3. **Copy Schema**
   - Open: `supabase/migrations/tsrc_bowtaecore_schema.sql`
   - Copy the entire file contents

4. **Paste and Run**
   - Paste into SQL Editor
   - Click **"Run"** button
   - Wait for success confirmation

5. **Verify Tables Created**
   - Click **"Table Editor"** in left sidebar
   - You should see new tables:
     - `proposal_envelopes`
     - `projected_commands`
     - `authorizations`
     - `command_counters`
     - `leases`
     - `policy_versions`
     - `execution_audit_log`

---

### **Option 2: Using Supabase CLI** (Advanced)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

---

## Schema Components

### **Tables Created**

#### **Layer -1: Proposal Envelopes** (Untrusted)
- `proposal_envelopes` - All evaluation proposals before authorization
- No side-effects, purely logging proposals

#### **Layer 0a: Projected Commands** (Deterministic)
- `projected_commands` - Normalized, classified, veto-capable projections
- Deterministic only, ambiguity → veto

#### **Layer 0b: Authorizations** (Minimal Authorizer)
- `authorizations` - Minted credentials with counters/leases/signatures
- Anti-replay counters, time-bound leases

#### **Supporting Tables**
- `command_counters` - Anti-replay counter management
- `leases` - Time-bound execution leases
- `policy_versions` - Monotonic policy tracking

#### **Layer +1: Execution Audit**
- `execution_audit_log` - Complete execution trail
- Records all side-effects (DB writes, payments, blockchain)

---

### **Functions Created**

```sql
-- Get next command counter (atomic, prevents replay)
get_next_command_counter(scope TEXT, scope_key TEXT)

-- Check if lease is valid (not expired)
is_lease_valid(lease_id UUID)

-- Expire old leases (run periodically)
expire_old_leases()
```

---

### **Views Created**

```sql
-- Complete pipeline trace (proposal → execution)
pipeline_trace

-- Currently active authorizations
active_authorizations

-- All vetoed projections with reasons
veto_log
```

---

## Initial Data

The schema includes bootstrap data:

1. **Global Counter**: Initialized to 0
2. **Policy Version 0**: Permissive bootstrap policy
   - Allows: score_poc_proposal, create_payment_session, register_blockchain, update_snapshot
   - Risk tiers defined
   - No forbidden actions (yet)

---

## Row Level Security (RLS)

All tables have RLS enabled with policies:

### **Proposal Envelopes**
- ✅ Users can read their own proposals
- ✅ Service role can insert proposals

### **Projected Commands**
- ✅ Service role can manage all projections

### **Authorizations**
- ✅ Service role can manage all authorizations

### **Audit Log**
- ✅ Service role can write audit records
- ✅ Users can read audit records for their own commands

### **Policy Versions**
- ✅ Everyone can read policy versions
- ✅ Only service role can create new policies

---

## Verification Queries

After running the schema, verify with these queries:

### **Check Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%proposal%' 
  OR table_name LIKE '%authorization%' 
  OR table_name LIKE '%projected%';
```

Expected output:
- proposal_envelopes
- projected_commands
- authorizations
- execution_audit_log

### **Check Initial Counter**
```sql
SELECT * FROM command_counters;
```

Expected: 1 row with `counter_scope = 'global'`, `current_counter = 0`

### **Check Bootstrap Policy**
```sql
SELECT policy_seq, kman_hash, bset_hash, effective_at 
FROM policy_versions 
ORDER BY policy_seq;
```

Expected: 1 row with `policy_seq = 0`

### **Test Counter Function**
```sql
SELECT get_next_command_counter('global', NULL);
SELECT get_next_command_counter('global', NULL);
SELECT get_next_command_counter('global', NULL);
```

Expected: 1, 2, 3 (incrementing)

### **Check Views**
```sql
SELECT * FROM pipeline_trace LIMIT 1;
SELECT * FROM active_authorizations LIMIT 1;
SELECT * FROM veto_log LIMIT 1;
```

Expected: Empty results (no data yet)

---

## Schema Relationships

```
proposal_envelopes (Layer -1)
    ↓
    └─→ projected_commands (Layer 0a)
            ↓
            └─→ authorizations (Layer 0b)
                    ↓
                    ├─→ leases (time-bound)
                    ├─→ command_counters (anti-replay)
                    └─→ execution_audit_log (Layer +1)
```

---

## Security Properties

### **Replay Attack Prevention**
- `cmd_counter` is unique (enforced by unique index)
- Same counter cannot be used twice
- Atomic increment prevents races

### **Lease Expiry**
- `expires_at` timestamp enforced
- `is_lease_valid()` checks expiration
- Periodic cleanup with `expire_old_leases()`

### **Policy Monotonicity**
- `policy_seq` is monotonically increasing
- Each version references previous via hash
- Cannot roll back to older policy

### **Fail-Closed Execution**
- Executor must verify:
  1. Counter not used (unique constraint)
  2. Lease not expired (`is_lease_valid()`)
  3. Policy matches (`policy_seq` + `kman_hash` + `bset_hash`)
  4. Signature valid (HMAC or ed25519)
- Any failure = reject, no execution

---

## Testing the Schema

### **Test 1: Create Proposal**
```sql
INSERT INTO proposal_envelopes (
  proposal_id,
  timestamp,
  intent,
  action_type,
  params,
  run_id,
  inputs_hash,
  provider,
  model,
  temperature,
  prompt_hash,
  score_config_id,
  archive_snapshot_id,
  mode_state
)
VALUES (
  gen_random_uuid(),
  NOW(),
  'Test scoring proposal',
  'score_poc_proposal',
  '{"submission_id": "test_123"}'::jsonb,
  'run_test_001',
  'abc123hash',
  'groq',
  'llama-3.3-70b-versatile',
  0.0,
  'def456hash',
  'v2.0.13',
  'snapshot_001',
  'growth'
)
RETURNING *;
```

### **Test 2: Create Projection**
```sql
-- Use proposal_id from Test 1
INSERT INTO projected_commands (
  projection_id,
  proposal_id,
  kman_hash,
  bset_hash,
  policy_seq,
  mode_id,
  closure_op,
  closure_d_def,
  closure_d,
  action_type,
  params,
  risk_tier,
  artifact_class,
  is_veto,
  veto_reason
)
VALUES (
  gen_random_uuid(),
  'PROPOSAL_ID_FROM_TEST_1',
  'bootstrap_kman_v0',
  'bootstrap_bset_v0',
  0,
  'normal',
  'kiss',
  'embedding_cosine',
  1536,
  'score_poc_proposal',
  '{"submission_id": "test_123"}'::jsonb,
  1,
  'data',
  FALSE,
  NULL
)
RETURNING *;
```

### **Test 3: Create Authorization**
```sql
-- Use projection_id from Test 2
DO $$
DECLARE
  v_next_counter BIGINT;
  v_lease_id UUID;
  v_projection_id UUID := 'PROJECTION_ID_FROM_TEST_2';
BEGIN
  -- Get next counter
  v_next_counter := get_next_command_counter('global', NULL);
  v_lease_id := gen_random_uuid();
  
  -- Create lease
  INSERT INTO leases (lease_id, valid_for_ms, expires_at)
  VALUES (v_lease_id, 300000, NOW() + INTERVAL '5 minutes');
  
  -- Create authorization
  INSERT INTO authorizations (
    command_id,
    projection_id,
    issued_at,
    lease_id,
    lease_valid_for_ms,
    expires_at,
    cmd_counter,
    kman_hash,
    bset_hash,
    policy_seq,
    mode_id,
    closure_op,
    closure_d_def,
    closure_d,
    action_type,
    params,
    sig_alg,
    sig_canonicalization,
    sig_key_id,
    sig_payload_hash,
    sig_b64
  )
  VALUES (
    gen_random_uuid(),
    v_projection_id,
    NOW(),
    v_lease_id,
    300000,
    NOW() + INTERVAL '5 minutes',
    v_next_counter,
    'bootstrap_kman_v0',
    'bootstrap_bset_v0',
    0,
    'normal',
    'kiss',
    'embedding_cosine',
    1536,
    'score_poc_proposal',
    '{"submission_id": "test_123"}'::jsonb,
    'hmac-sha256',
    'jcs-rfc8785',
    'key_001',
    'payloadhash123',
    'signature_base64_here'
  );
  
  RAISE NOTICE 'Authorization created with counter: %', v_next_counter;
END $$;
```

### **Test 4: Verify Pipeline Trace**
```sql
SELECT 
  proposal_id,
  intent,
  action_type,
  projection_id,
  is_veto,
  command_id,
  cmd_counter,
  authorization_status
FROM pipeline_trace
ORDER BY proposal_timestamp DESC
LIMIT 5;
```

---

## Maintenance

### **Periodic Tasks** (Run via cron or Supabase Edge Functions)

#### **Expire Old Leases**
```sql
SELECT expire_old_leases();
```

Run every 5 minutes.

#### **Clean Up Old Proposals**
```sql
-- Archive proposals older than 90 days
DELETE FROM proposal_envelopes
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('executed', 'vetoed');
```

Run daily.

#### **Monitor Counter Growth**
```sql
SELECT 
  counter_scope,
  scope_key,
  current_counter,
  last_incremented_at
FROM command_counters
ORDER BY current_counter DESC;
```

---

## Troubleshooting

### **Issue: Tables Not Created**
- Check for SQL syntax errors in output
- Verify you have admin permissions
- Try running sections separately

### **Issue: RLS Blocking Queries**
- Use service role key for backend operations
- Check RLS policies with: `SELECT * FROM pg_policies;`
- Disable RLS temporarily for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### **Issue: Counter Not Incrementing**
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'get_next_command_counter';`
- Test manually: `SELECT get_next_command_counter('global', NULL);`
- Check for locks: `SELECT * FROM pg_locks WHERE relation = 'command_counters'::regclass;`

### **Issue: Foreign Key Violations**
- Ensure proposals exist before creating projections
- Ensure projections exist before creating authorizations
- Check cascade rules on DELETE

---

## Next Steps

After schema is set up:

1. ✅ **Verify all tables exist** (use verification queries above)
2. ✅ **Test counter function** (should increment atomically)
3. ✅ **Review RLS policies** (ensure security is correct)
4. 🔄 **Implement Phase 2**: Refactor evaluation to write to `proposal_envelopes`
5. 🔄 **Implement Phase 3**: Build projector to write to `projected_commands`
6. 🔄 **Implement Phase 4**: Build authorizer to write to `authorizations`
7. 🔄 **Implement Phase 5**: Wrap executor to verify and log to `execution_audit_log`

---

## Documentation Links

- **Schema File**: `supabase/migrations/tsrc_bowtaecore_schema.sql`
- **Integration Guide**: `docs/TSRC_BOWTAECORE_INTEGRATION.md`
- **Type Definitions**: `utils/tsrc/types.ts`
- **Endpoint Mapping**: `docs/tsrc_endpoint_map.md`

---

**Status**: ✅ **Schema Ready for Use**  
**Next**: 🔄 **Implement Phase 2 - Evaluation Refactor**

*Last Updated: January 10, 2026*

