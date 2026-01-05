# Creator Dashboard Migration Guide

## Overview

This document describes the migration and setup for the Creator-controlled Operator Dashboard, which adds destructive controls for PoC lifecycle management and user administration.

## Roles & Authority Model

### Roles

- **Creator**: `info@fractiai.com` (hard-coded, cannot be changed)
- **Operator**: Users with `role='operator'` in database (granted by Creator)
- **User**: Standard users (default role)

### Authority Rules

- **Only Creator can**:
  - Reset PoC archives (soft/hard)
  - Delete users (soft/hard)
  - Grant or revoke Operator privileges
  - View audit logs

- **Operators have no destructive permissions** (existing operator functionality remains unchanged)

- **All checks enforced server-side** (UI hides restricted actions from non-Creator roles)

## Database Migration

### Step 1: Run Migration SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/20250106000000_add_creator_controls.sql`
4. Click **Run** to execute

This migration:

- Adds `role` and `deleted_at` columns to `users_table`
- Sets Creator role for `info@fractiai.com`
- Adds `archived_at` column to `contributions` table
- Creates `audit_log` table for tracking destructive actions
- Updates RLS policies

### Step 2: Verify Migration

Run this query to verify:

```sql
-- Check users_table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users_table'
AND column_name IN ('role', 'deleted_at');

-- Check contributions has archived_at
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contributions'
AND column_name = 'archived_at';

-- Check audit_log table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'audit_log';

-- Verify Creator role is set
SELECT email, role
FROM users_table
WHERE email = 'info@fractiai.com';
```

## Features

### 1. PoC Archive Reset (Creator Only)

**Location**: `/creator/dashboard` → PoC Archive Management section

**Soft Reset**:

- Clears archived PoC records by setting `archived_at` timestamp
- Preserves:
  - On-chain registrations
  - Audit logs
  - Aggregate metrics
- Requires confirmation phrase: `RESET ARCHIVE`

**Hard Reset**:

- Deletes archived PoC data (only non-registered archived PoCs)
- Preserves:
  - On-chain registrations (always preserved)
  - Audit logs
  - Active PoCs
  - Enterprise sandboxes
- Requires confirmation phrase: `RESET ARCHIVE`
- All resets logged with timestamp + Creator ID

### 2. User Deletion (Creator Only)

**Location**: `/creator/dashboard` → User Management section

**User List Shows**:

- Email
- Role
- Account status
- Sandbox associations
- Contribution count
- On-chain PoC count
- Last activity timestamp

**Soft Delete**:

- Deactivates user account (sets `deleted_at` timestamp)
- Revokes access
- Preserves historical contributions
- Requires confirmation phrase: `DELETE USER`

**Hard Delete**:

- Fully removes user account
- Anonymizes contribution records (sets contributor to `deleted-{hash}`)
- Requires confirmation phrase: `DELETE USER`
- Warning shown if user has on-chain PoCs (but allows with confirmation)

**Restrictions**:

- Creator account cannot be deleted
- Operators cannot delete users
- Cannot delete users with active on-chain PoCs without explicit override (confirmation phrase serves as override)

### 3. Operator Role Management (Creator Only)

**Location**: `/creator/dashboard` → User Management section

**Actions**:

- Grant Operator role: Click "Grant Operator" button
- Revoke Operator role: Click "Revoke Operator" button

**Restrictions**:

- Cannot modify Creator role
- All role changes logged in audit log

### 4. Audit Logging

**Location**: `/creator/dashboard` → Audit Log section

**Logged Actions**:

- Archive resets (soft/hard)
- User deletions (soft/hard)
- Operator role changes (grant/revoke)

**Log Includes**:

- Actor ID (email)
- Action type
- Timestamp
- Affected records count
- Metadata (confirmation phrase, IP, user agent, etc.)

## API Endpoints

### Creator-Only Endpoints

All endpoints require Creator authentication (checked server-side):

1. **GET `/api/creator/archive/reset`** - Get archive statistics
2. **POST `/api/creator/archive/reset`** - Reset archive (soft/hard)
3. **GET `/api/creator/users`** - List all users
4. **POST `/api/creator/users/[email]/delete`** - Delete user (soft/hard)
5. **POST `/api/creator/users/[email]/role`** - Grant/revoke operator role
6. **GET `/api/creator/audit-logs`** - View audit logs

## UI Access

### Creator Dashboard

- **URL**: `/creator/dashboard`
- **Access**: Only visible to Creator (`info@fractiai.com`)
- **Link**: Appears in main dashboard navigation (red border, only for Creator)

### Main Dashboard

- Creator Dashboard link appears in navigation (only for Creator)
- All other functionality unchanged

## Security Considerations

1. **Server-Side Enforcement**: All permission checks happen server-side in API routes
2. **Hard-Coded Creator**: Creator email is hard-coded in `utils/auth/permissions.ts`
3. **Confirmation Phrases**: All destructive actions require typed confirmation phrases
4. **Audit Trail**: All destructive actions are logged with full metadata
5. **RLS Policies**: Database RLS policies updated to respect `deleted_at` and role-based access

## Testing Checklist

After migration:

- [ ] Verify Creator can access `/creator/dashboard`
- [ ] Verify non-Creator users are redirected from `/creator/dashboard`
- [ ] Test soft archive reset
- [ ] Test hard archive reset
- [ ] Verify on-chain PoCs are preserved after reset
- [ ] Test user soft delete
- [ ] Test user hard delete
- [ ] Verify Creator account cannot be deleted
- [ ] Test grant operator role
- [ ] Test revoke operator role
- [ ] Verify audit logs are created for all actions
- [ ] Verify operators cannot access Creator endpoints

## Rollback

If needed, rollback steps:

1. Remove Creator Dashboard link from main dashboard
2. Drop `audit_log` table (if created)
3. Remove `role` and `deleted_at` columns from `users_table` (if added)
4. Remove `archived_at` column from `contributions` (if added)

**Note**: Rollback will lose audit log data. Consider exporting audit logs before rollback if needed.

## Support

For issues or questions:

- Check audit logs for action history
- Review API route error responses
- Verify Creator email matches `info@fractiai.com` exactly (case-insensitive)
