# 📋 Supabase Configuration - Copy & Paste Snippets

## 🔐 1. Authentication URL Configuration

**Location:** Supabase Dashboard → Authentication → URL Configuration

### Site URL
```
https://YOUR-VERCEL-APP.vercel.app
```
*Replace `YOUR-VERCEL-APP` with your actual Vercel deployment URL*

### Redirect URLs (Add these to "Allowed Redirect URLs")
```
https://YOUR-VERCEL-APP.vercel.app/auth/callback
https://YOUR-VERCEL-APP.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 📧 2. Email Templates (Optional - for custom branding)

**Location:** Supabase Dashboard → Authentication → Email Templates

### Confirm Signup Template
```html
<h2>Confirm your signup</h2>
<p>Welcome to Syntheverse PoC!</p>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

### Reset Password Template
```html
<h2>Reset Your Password</h2>
<p>You requested to reset your password for Syntheverse PoC.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

### Magic Link Template
```html
<h2>Your Magic Link</h2>
<p>Click the link below to sign in to Syntheverse PoC:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
```

---

## 🔑 3. Enable Authentication Providers

**Location:** Supabase Dashboard → Authentication → Providers

### Email Provider (Already enabled by default)
✅ Enable Email provider

**Settings:**
- ✅ Enable email signup
- ✅ Enable email confirmation
- ⚠️ Disable email confirmation for testing (optional)

### Google OAuth (Optional)

**Redirect URI for Google Console:**
```
https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback
```

**In Supabase:**
- Enable Google provider
- Add your Google Client ID
- Add your Google Client Secret

### GitHub OAuth (Optional)

**Authorization callback URL for GitHub:**
```
https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback
```

**In Supabase:**
- Enable GitHub provider
- Add your GitHub Client ID
- Add your GitHub Client Secret

---

## 🗄️ 4. Database Schema (Run in SQL Editor)

**Location:** Supabase Dashboard → SQL Editor → New Query

### Check Existing Tables
```sql
-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Check if poc_submissions table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'poc_submissions'
);
```

### Create Users Table (if needed)
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
```

### Create PoC Submissions Table (if needed)
```sql
-- Create poc_submissions table
CREATE TABLE IF NOT EXISTS poc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  equations TEXT,
  constants TEXT,
  score NUMERIC,
  novelty_score NUMERIC,
  density_score NUMERIC,
  coherence_score NUMERIC,
  alignment_score NUMERIC,
  redundancy_percentage NUMERIC,
  status TEXT DEFAULT 'pending',
  blockchain_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_poc_submissions_user_id ON poc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_poc_submissions_status ON poc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_poc_submissions_created_at ON poc_submissions(created_at);

-- Enable Row Level Security
ALTER TABLE poc_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own submissions"
  ON poc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
  ON poc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON poc_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON poc_submissions TO authenticated;
GRANT ALL ON poc_submissions TO service_role;
```

### Create Customers Table (for Stripe)
```sql
-- Create customers table for Stripe integration
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their own customer data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customers TO service_role;
```

---

## 🔒 5. Row Level Security (RLS) Policies

**Location:** Supabase Dashboard → Authentication → Policies

### Verify RLS is Enabled
```sql
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'poc_submissions', 'customers');
```

### Test RLS Policies
```sql
-- Test as authenticated user
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claim.sub = 'test-user-id';

-- This should only return the authenticated user's data
SELECT * FROM users WHERE id = 'test-user-id';
SELECT * FROM poc_submissions WHERE user_id = 'test-user-id';
```

---

## 🌐 6. API Settings

**Location:** Supabase Dashboard → Settings → API

### Copy These Values to Vercel:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://jfbgdxeumzqzigptbmvp.supabase.co

# Anon/Public Key (safe to use in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODczODgsImV4cCI6MjA4MTY2MzM4OH0.PTv7kmbbz8k35blN2pONnK8Msi6mn8O1ok546BPz1gQ

# Service Role Key (NEVER expose in browser - server-side only!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY
```

---

## 🗃️ 7. Database Connection String

**Location:** Supabase Dashboard → Settings → Database → Connection String → URI

### For Vercel Environment Variable:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-DB-PASSWORD]` with your actual database password from Supabase Dashboard → Settings → Database → Database password

---

## ⚙️ 8. Database Settings

**Location:** Supabase Dashboard → Settings → Database

### Connection Pooling (Recommended for Vercel)

Enable **Connection Pooler** and use this for DATABASE_URL instead:

```bash
# Pooled connection (better for serverless)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Recommended Settings:
- ✅ Enable Connection Pooler
- Mode: **Transaction** (for serverless)
- Pool size: **15** (default)

---

## 🧪 9. Test Connection

**Run this in Supabase SQL Editor:**

```sql
-- Test basic connection
SELECT current_database(), current_user, version();

-- Test users table
SELECT count(*) FROM users;

-- Test poc_submissions table
SELECT count(*) FROM poc_submissions;

-- Test auth.users table
SELECT count(*) FROM auth.users;
```

---

## ✅ Quick Verification Checklist

After configuration, verify:

- [ ] **Site URL** is set to your Vercel app URL
- [ ] **Redirect URLs** include your Vercel callback route
- [ ] **Email provider** is enabled
- [ ] **Tables exist**: users, poc_submissions, customers
- [ ] **RLS is enabled** on all tables
- [ ] **Indexes created** for performance
- [ ] **API keys copied** to Vercel environment variables
- [ ] **Database connection tested** successfully

---

## 🚨 Common Issues & Fixes

### Issue: "Invalid redirect URL"
**Fix:** Make sure redirect URL in Supabase matches exactly: `https://your-app.vercel.app/auth/callback`

### Issue: "Database connection failed"
**Fix:** 
1. Check DATABASE_URL has correct password
2. Use pooled connection string for Vercel
3. Verify IP restrictions allow Vercel (use Connection Pooler to bypass this)

### Issue: "Row Level Security violation"
**Fix:** Run the RLS policy creation SQL above

### Issue: "Table doesn't exist"
**Fix:** Run the CREATE TABLE SQL statements above

---

## 📞 Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check Vercel deployment logs for specific error messages

