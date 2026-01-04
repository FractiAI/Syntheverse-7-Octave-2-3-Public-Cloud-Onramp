# Tokenomics Persistent Memory Tracking

## ✅ Confirmed: All Tokenomics Data is Stored in Permanent Database

This document confirms that token allocations, epoch balances, and open epochs are tracked in permanent database storage (PostgreSQL via Supabase).

---

## 1. Token Allocations Tracking

**Table:** `allocations`

**Schema:**

- `id` (text, primary key) - Unique allocation ID
- `submission_hash` (text) - PoC submission hash
- `contributor` (text) - Contributor email/address
- `metal` (text) - Metal type (gold, silver, copper)
- `epoch` (text) - Epoch name (founder, pioneer, community, ecosystem)
- `tier` (text, optional) - Tier information
- `reward` (numeric) - Token amount allocated
- `tier_multiplier` (numeric) - Tier multiplier applied
- `epoch_balance_before` (numeric) - Epoch balance before allocation
- `epoch_balance_after` (numeric) - Epoch balance after allocation
- `created_at` (timestamp) - Allocation timestamp

**Storage Location:**

- Permanent PostgreSQL database (Supabase)
- Migration: `supabase/migrations/20240101000001_create_poc_tables.sql`

**When Allocations are Recorded:**

- When tokens are allocated via `/api/poc/[hash]/allocate` endpoint
- When admin approves allocations via `/api/admin/approve-allocation` endpoint
- Each allocation creates a permanent record with before/after balance snapshots

**Code References:**

- `app/api/poc/[hash]/allocate/route.ts` (lines 122-133)
- `app/api/admin/approve-allocation/route.ts` (lines 231-243)
- `utils/db/schema.ts` (lines 70-82)

---

## 2. Epoch Balances Tracking

**Table:** `epoch_balances`

**Schema:**

- `id` (text, primary key) - Unique epoch balance ID
- `epoch` (text) - Epoch name (founder, pioneer, community, ecosystem)
- `balance` (numeric) - Current available balance
- `threshold` (numeric) - Qualification threshold
- `distribution_amount` (numeric) - Total distributed amount
- `distribution_percent` (numeric) - Distribution percentage
- `updated_at` (timestamp) - Last update timestamp

**Storage Location:**

- Permanent PostgreSQL database (Supabase)
- Migration: `supabase/migrations/20240101000001_create_poc_tables.sql`

**When Balances are Updated:**

- When tokens are allocated: balance decreases
- Updated via `/api/poc/[hash]/allocate` endpoint (lines 136-142)
- Updated via `/api/admin/approve-allocation` endpoint (lines 246-252)
- Balance is atomically updated with allocation record

**Initialization:**

- Default balances initialized in `app/api/tokenomics/epoch-info/route.ts` (lines 41-58)
- Founder: 45T SYNTH (50%)
- Pioneer: 22.5T SYNTH (25%)
- Community: 11.25T SYNTH (12.5%)
- Ecosystem: 11.25T SYNTH (12.5%)

**Code References:**

- `app/api/poc/[hash]/allocate/route.ts` (lines 136-142)
- `app/api/admin/approve-allocation/route.ts` (lines 246-252)
- `app/api/tokenomics/epoch-info/route.ts` (lines 35-105)
- `utils/db/schema.ts` (lines 59-67)

---

## 3. Open Epochs Tracking

**Table:** `tokenomics`

**Schema:**

- `id` (text, primary key, default: 'main')
- `total_supply` (numeric) - Total SYNTH supply (90T)
- `total_distributed` (numeric) - Total distributed tokens
- `current_epoch` (text) - Current active epoch
- `founder_halving_count` (integer) - Founder epoch halving count
- `updated_at` (timestamp) - Last update timestamp

**Storage Location:**

- Permanent PostgreSQL database (Supabase)
- Migration: `supabase/migrations/20240101000001_create_poc_tables.sql`

**How Open Epochs are Determined:**

1. Current epoch stored in `tokenomics.current_epoch` (default: 'founder')
2. Epoch balances checked from `epoch_balances` table
3. Open epochs calculated based on:
   - Founder epoch: Always open (threshold: 0)
   - Pioneer epoch: Opens when coherence density >= 1M
   - Community epoch: Opens when coherence density >= 2M
   - Ecosystem epoch: Opens when coherence density >= 3M

**Code References:**

- `app/api/tokenomics/epoch-info/route.ts` (lines 26-32, 108)
- `utils/epochs/qualification.ts` (lines 40-97)
- `utils/db/schema.ts` (lines 49-56)

---

## 4. Tokenomics State Tracking

**Table:** `tokenomics`

**Fields:**

- `total_supply`: 90,000,000,000,000 SYNTH (90T)
- `total_distributed`: Sum of all allocations
- `current_epoch`: Currently active epoch
- `founder_halving_count`: Halving counter for founder epoch

**Updates:**

- `total_distributed` updated when allocations occur (see `app/api/admin/approve-allocation/route.ts` lines 255-260)
- `current_epoch` can be updated by admin to progress epochs
- All updates are permanent and persisted to database

---

## 5. Allocation Formula Applied at Registration

**Formula:** `(score/10000) * Available tokens`

**Implementation:**

- Base allocation: `(pod_score / 10000) * epochBalance`
- Metal amplification applied: `baseAllocation * metalMultiplier`
- Tier multiplier applied: `amplifiedAllocation * tierMultiplier`
- Final: `floor(finalAmount)` capped at epoch balance

**Code Reference:**

- `utils/tokenomics/projected-allocation.ts` (lines 136-150)

---

## 6. Database Migrations

All tables are created via SQL migrations:

1. **Primary Migration:** `supabase/migrations/20240101000001_create_poc_tables.sql`
   - Creates `allocations` table
   - Creates `epoch_balances` table
   - Creates `tokenomics` table

2. **Drizzle Migration:** `utils/db/migrations/0001_nappy_jasper_sitwell.sql`
   - Same tables via Drizzle ORM

---

## 7. Data Persistence Guarantees

✅ **All allocations are permanently stored** - Every token allocation creates a database record
✅ **Epoch balances are permanently tracked** - Updated atomically with allocations
✅ **Open epochs are determined from database** - Current epoch and balances read from database
✅ **Tokenomics state is persistent** - Total supply, distributed, and current epoch stored in database
✅ **Audit trail available** - `epoch_balance_before` and `epoch_balance_after` track all changes

---

## 8. Verification Queries

To verify persistent memory is working:

```sql
-- Check all allocations
SELECT * FROM allocations ORDER BY created_at DESC;

-- Check epoch balances
SELECT * FROM epoch_balances ORDER BY epoch;

-- Check tokenomics state
SELECT * FROM tokenomics WHERE id = 'main';

-- Check allocation history for a specific PoC
SELECT * FROM allocations WHERE submission_hash = '<hash>';

-- Check total distributed
SELECT SUM(CAST(reward AS NUMERIC)) as total_allocated FROM allocations;
```

---

## Summary

✅ **Token Allocations**: Permanently stored in `allocations` table
✅ **Epoch Balances**: Permanently stored in `epoch_balances` table, updated atomically
✅ **Open Epochs**: Determined from `tokenomics.current_epoch` and `epoch_balances` tables
✅ **Tokenomics State**: Permanently stored in `tokenomics` table
✅ **All data persists** across server restarts, deployments, and database connections

All tokenomics data is stored in permanent PostgreSQL database (Supabase), ensuring data persistence and reliability.
