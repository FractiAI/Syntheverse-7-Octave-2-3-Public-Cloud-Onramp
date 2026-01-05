-- ============================================
-- Syntheverse Operator & Creator Role Setup
-- Copy and paste this entire script into Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Add role and deleted_at columns (if not exists)
-- ============================================

ALTER TABLE public.users_table
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- ============================================
-- 2. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_table_role ON public.users_table(role);
CREATE INDEX IF NOT EXISTS idx_users_table_deleted_at ON public.users_table(deleted_at);

-- ============================================
-- 3. Set Creator role for info@fractiai.com
-- ============================================

UPDATE public.users_table
SET role = 'creator'
WHERE email = 'info@fractiai.com';

-- ============================================
-- 4. Grant Operator role to specific users
-- Replace 'operator@example.com' with actual operator email addresses
-- ============================================

-- Example: Grant operator role to a user
-- UPDATE public.users_table
-- SET role = 'operator'
-- WHERE email = 'operator@example.com';

-- Example: Grant operator role to multiple users
-- UPDATE public.users_table
-- SET role = 'operator'
-- WHERE email IN ('operator1@example.com', 'operator2@example.com');

-- ============================================
-- 5. Verify setup
-- ============================================

-- Check Creator role
SELECT 
    email, 
    role, 
    deleted_at,
    created_at
FROM public.users_table
WHERE role = 'creator';

-- Check all Operators
SELECT 
    email, 
    role, 
    deleted_at,
    created_at
FROM public.users_table
WHERE role = 'operator'
ORDER BY email;

-- Check all roles distribution
SELECT 
    role,
    COUNT(*) as count
FROM public.users_table
WHERE deleted_at IS NULL
GROUP BY role
ORDER BY role;

-- ============================================
-- 6. Revoke Operator role (if needed)
-- ============================================

-- Example: Revoke operator role (sets back to 'user')
-- UPDATE public.users_table
-- SET role = 'user'
-- WHERE email = 'operator@example.com';

-- ============================================
-- NOTES:
-- ============================================
-- - Creator: info@fractiai.com (hard-coded, cannot be changed via API)
-- - Operator: Users with role='operator' (granted by Creator via API or SQL)
-- - User: Default role for all other users
-- - Roles are checked server-side in API routes
-- - UI hides restricted actions from non-Creator roles
-- ============================================

