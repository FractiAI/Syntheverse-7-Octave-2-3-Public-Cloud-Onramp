# Creator Dashboard Verification Steps

## ✅ Migration Complete

The database migration has been successfully applied. Use these steps to verify everything is working correctly.

## 1. Verify Database Schema

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check users_table has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users_table'
AND column_name IN ('role', 'deleted_at')
ORDER BY column_name;

-- Check contributions has archived_at
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contributions'
AND column_name = 'archived_at';

-- Check audit_log table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'audit_log';

-- Verify Creator role is set
SELECT email, role, deleted_at
FROM users_table
WHERE email = 'info@fractiai.com';

-- Check indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND (indexname LIKE '%role%' OR indexname LIKE '%deleted_at%' OR indexname LIKE '%archived_at%' OR indexname LIKE '%audit_log%')
ORDER BY tablename, indexname;
```

**Expected Results:**

- `users_table` should have `role` (text, default 'user') and `deleted_at` (timestamp, nullable)
- `contributions` should have `archived_at` (timestamp, nullable)
- `audit_log` table should exist with all columns
- Creator email should have `role = 'creator'`
- Indexes should exist for performance

## 2. Verify RLS Policies

```sql
-- Check RLS is enabled on audit_log
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'audit_log';

-- List all policies on audit_log
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'audit_log';

-- List policies on users_table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users_table'
ORDER BY policyname;
```

**Expected Results:**

- `audit_log` should have `rowsecurity = true`
- Should have 2 policies: "Service role can write audit logs" (INSERT) and "Creator and service role can read audit logs" (SELECT)
- `users_table` should have updated policies respecting `deleted_at`

## 3. Test Creator Dashboard Access

1. **Log in as Creator** (`info@fractiai.com`)
2. **Navigate to** `/creator/dashboard`
3. **Verify you can see:**
   - PoC Archive Management section
   - User Management section
   - Audit Log section

4. **If you get redirected**, check:
   - Email matches exactly: `info@fractiai.com` (case-insensitive)
   - User exists in `users_table` with `role = 'creator'`

## 4. Test API Endpoints

### Test Archive Statistics

```bash
# Should return archive statistics
curl -X GET https://your-domain.vercel.app/api/creator/archive/reset \
  -H "Cookie: your-session-cookie"
```

### Test User List

```bash
# Should return list of users
curl -X GET https://your-domain.vercel.app/api/creator/users \
  -H "Cookie: your-session-cookie"
```

### Test Audit Logs

```bash
# Should return audit logs (empty initially)
curl -X GET https://your-domain.vercel.app/api/creator/audit-logs \
  -H "Cookie: your-session-cookie"
```

**Note:** Replace `your-domain.vercel.app` with your actual domain and include proper authentication cookies.

## 5. Test Non-Creator Access

1. **Log in as a regular user** (not Creator)
2. **Try to access** `/creator/dashboard`
3. **Should be redirected** to `/dashboard`
4. **Verify** Creator Dashboard link is NOT visible in main dashboard

## 6. Quick Test Actions

Once verified, you can test:

1. **Grant Operator Role:**
   - Go to User Management
   - Find a test user
   - Click "Grant Operator"
   - Verify role changes in database

2. **View Audit Log:**
   - After any action, check Audit Log section
   - Should see entry with action details

3. **Check Archive Stats:**
   - View PoC Archive Management
   - Should show counts for registered, archived, etc.

## Troubleshooting

### Creator Dashboard Not Accessible

**Check:**

```sql
-- Verify Creator role
SELECT email, role FROM users_table WHERE email = 'info@fractiai.com';
```

**Fix if needed:**

```sql
UPDATE users_table SET role = 'creator' WHERE email = 'info@fractiai.com';
```

### API Returns 403 Unauthorized

- Verify you're logged in as Creator
- Check browser console for errors
- Verify session cookie is valid
- Check server logs for permission errors

### Policies Not Working

```sql
-- Re-enable RLS if needed
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_table ENABLE ROW LEVEL SECURITY;
```

## Next Steps

After verification:

1. ✅ Test archive reset (soft mode first)
2. ✅ Test user deletion (soft mode first)
3. ✅ Test operator role management
4. ✅ Verify audit logs are created
5. ✅ Test with production data (carefully!)

## Support

If you encounter issues:

1. Check audit logs for error details
2. Review API route error responses
3. Verify Creator email matches exactly
4. Check Supabase logs for RLS policy violations
