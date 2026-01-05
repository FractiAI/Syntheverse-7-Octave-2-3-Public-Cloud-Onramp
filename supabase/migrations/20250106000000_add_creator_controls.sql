-- Migration: Add Creator Controls and Role Management
-- Adds role system, soft deletes, archive tracking, and audit logging
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- 1. Add role and deleted_at to users_table
-- ============================================

ALTER TABLE public.users_table
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- Set Creator role for info@fractiai.com
UPDATE public.users_table
SET role = 'creator'
WHERE email = 'info@fractiai.com';

-- Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_table_role ON public.users_table(role);
CREATE INDEX IF NOT EXISTS idx_users_table_deleted_at ON public.users_table(deleted_at);

-- ============================================
-- 2. Add archived_at to contributions table
-- ============================================

ALTER TABLE public.contributions
ADD COLUMN IF NOT EXISTS archived_at timestamp;

CREATE INDEX IF NOT EXISTS idx_contributions_archived_at ON public.contributions(archived_at);

-- ============================================
-- 3. Create audit_log table for tracking destructive actions
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
    id text PRIMARY KEY NOT NULL,
    actor_email text NOT NULL,
    actor_role text NOT NULL,
    action_type text NOT NULL, -- 'archive_reset', 'user_delete', 'user_soft_delete', 'role_grant', 'role_revoke'
    action_mode text, -- 'soft', 'hard' for resets/deletes
    target_type text, -- 'archive', 'user', 'role'
    target_identifier text, -- email, submission_hash, etc.
    affected_count integer, -- Number of records affected
    metadata jsonb, -- Additional context (confirmation phrase, IP, etc.)
    created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_email ON public.audit_log(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- ============================================
-- 4. Enable RLS on audit_log
-- ============================================

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can write audit logs
CREATE POLICY "Service role can write audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Creator and service role can read audit logs
CREATE POLICY "Creator and service role can read audit logs"
ON public.audit_log
FOR SELECT
USING (
    auth.role() = 'service_role' 
    OR (auth.jwt() ->> 'email' = 'info@fractiai.com')
);

-- ============================================
-- 5. Update RLS policies for users_table to respect deleted_at
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read own user record" ON public.users_table;

-- New policy: Users can read their own non-deleted record
CREATE POLICY "Users can read own non-deleted user record"
ON public.users_table
FOR SELECT
USING (
    (auth.uid()::text = id OR auth.jwt() ->> 'email' = email)
    AND deleted_at IS NULL
);

-- Service role can read all (including deleted)
-- Note: If this policy already exists, drop it first
DROP POLICY IF EXISTS "Service role full access to users_table" ON public.users_table;

CREATE POLICY "Service role full access to users_table"
ON public.users_table
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

