# 🗄️ Supabase Database Migrations Guide

## Quick Start

To apply the PoC database migrations, you have **two options**:

### Option 1: Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/jfbgdxeumzqzigptbmvp/sql/new
   - Or: Dashboard → SQL Editor → New Query

2. **Copy the migration SQL**
   - Open: `supabase/migrations/combined_poc_migrations.sql`
   - Copy all contents

3. **Paste and Run**
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Cmd/Ctrl + Enter)

4. **Verify**
   - Check that all tables were created successfully
   - Tables should appear in: Dashboard → Table Editor

### Option 2: Supabase CLI (Requires Database Password)

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Link to your project** (already done)
   ```bash
   supabase link --project-ref jfbgdxeumzqzigptbmvp
   ```

3. **Push migrations**
   ```bash
   supabase db push
   ```
   - You'll be prompted for your database password
   - Get password from: Dashboard → Settings → Database → Database password

## What Gets Created

The migration creates the following tables:

### Core Tables
- **`contributions`** - PoC contribution submissions
- **`tokenomics`** - Tokenomics state and configuration
- **`epoch_balances`** - Epoch balance tracking
- **`allocations`** - Token allocation records
- **`poc_log`** - Audit log for all PoC operations

### Indexes
Performance indexes on:
- `contributions.contributor`
- `contributions.status`
- `contributions.content_hash`
- `poc_log.submission_hash`
- `poc_log.contributor`
- `poc_log.event_type`
- `poc_log.created_at`
- `allocations.submission_hash`
- `allocations.contributor`
- `epoch_balances.epoch`

### Default Data
- Initializes tokenomics state (90T total supply)
- Initializes epoch balances (Founder, Pioneer, Community, Ecosystem)

## Verification

After running migrations, verify in Supabase Dashboard:

1. **Table Editor** → Should see all 5 new tables
2. **SQL Editor** → Run:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('contributions', 'tokenomics', 'epoch_balances', 'allocations', 'poc_log');
   ```

## Troubleshooting

### "Table already exists" errors
- Safe to ignore if using `CREATE TABLE IF NOT EXISTS`
- Tables may have been partially created

### "Permission denied" errors
- Ensure you're using the correct database password
- Check that your user has CREATE TABLE permissions

### Need to reset?
- Drop tables manually in SQL Editor if needed:
  ```sql
  DROP TABLE IF EXISTS poc_log, allocations, contributions, epoch_balances, tokenomics CASCADE;
  ```
- Then re-run the migration

## Migration File Location

- **Combined migration**: `supabase/migrations/combined_poc_migrations.sql`
- **Individual migrations**: `utils/db/migrations/`



