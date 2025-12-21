# ✅ Vercel Deployment Checklist

Quick checklist to track your deployment progress.

## Prerequisites
- [x] Vercel account created
- [ ] Git repository ready (GitHub/GitLab/Bitbucket)
- [ ] Supabase project created
- [ ] Stripe account created (test mode)
- [ ] All API keys obtained

---

## Step 1: Connect Repository
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "New Project"
- [ ] Import Git repository
- [ ] Verify Next.js auto-detection
- [ ] Complete initial deployment (can add env vars later)

**Your Vercel URL**: `https://_____________________.vercel.app`

---

## Step 2: Environment Variables in Vercel

Add these in: **Project Settings → Environment Variables**

### Supabase (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://_______.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...`
- [ ] `DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

**Where to find**: Supabase Dashboard → Settings → API

### Site URLs (Required)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app` (use your actual Vercel URL)
- [ ] `NEXT_PUBLIC_WEBSITE_URL` = `https://your-app.vercel.app` (same as above)

### Stripe (Required for billing)
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (get after Step 4)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
- [ ] `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` = `prctbl_...`

**Where to find**: Stripe Dashboard → Developers → API keys

### OAuth (Optional - only if using)
- [ ] `GOOGLE_CLIENT_ID` = `...`
- [ ] `GOOGLE_CLIENT_SECRET` = `...`
- [ ] `GITHUB_CLIENT_ID` = `...`
- [ ] `GITHUB_CLIENT_SECRET` = `...`

**Set for**: Production ✅ | Preview ✅ | Development ✅

---

## Step 3: Update Supabase

### Site URL
- [ ] Supabase Dashboard → Authentication → URL Configuration
- [ ] Change Site URL to: `https://your-app.vercel.app`

### Redirect URLs (if using OAuth)
- [ ] Add: `https://your-app.vercel.app/auth/callback`
- [ ] Add: `https://your-app.vercel.app/**`

---

## Step 4: Configure Stripe Webhook

- [ ] Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] URL: `https://your-app.vercel.app/webhook/stripe`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copy webhook signing secret (`whsec_...`)
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel env vars

---

## Step 5: Database Migrations

Choose one method:

**Option A: Automatic (recommended)**
- [ ] Verify `package.json` has: `"build": "drizzle-kit migrate && next build"`
- [ ] Migrations run automatically on build

**Option B: Manual**
- [ ] Set `DATABASE_URL` locally to production Supabase URL
- [ ] Run: `npm run db:migrate`
- [ ] Verify migrations completed

---

## Step 6: Redeploy

- [ ] Trigger new deployment in Vercel (Redeploy button or push to git)
- [ ] Monitor build logs for errors
- [ ] Verify deployment succeeded

---

## Step 7: Testing

- [ ] **Homepage**: Visit `https://your-app.vercel.app` - loads correctly
- [ ] **Sign Up**: Create new account - works
- [ ] **Login**: Log in with email/password - works
- [ ] **OAuth** (if enabled): Google login - works
- [ ] **OAuth** (if enabled): GitHub login - works
- [ ] **Dashboard**: Access protected route - works
- [ ] **Stripe Checkout**: Test subscription - completes
- [ ] **Webhooks**: Check Stripe Dashboard - events received
- [ ] **Password Reset**: Test forgot password - works
- [ ] **Mobile**: Test on mobile device - responsive

---

## Step 8: OAuth Provider Updates (if using)

### Google OAuth
- [ ] Google Cloud Console → APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client
- [ ] Add redirect URI: `https://[PROJECT-ID].supabase.co/auth/v1/callback`

### GitHub OAuth
- [ ] GitHub → Settings → Developer settings → OAuth Apps
- [ ] Edit OAuth App
- [ ] Update Authorization callback URL: `https://[PROJECT-ID].supabase.co/auth/v1/callback`

---

## Optional: Custom Domain

- [ ] Vercel → Project Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Update `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WEBSITE_URL` env vars
- [ ] Update Supabase Site URL
- [ ] Update Stripe webhook URL

---

## Final Verification

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] All environment variables set correctly
- [ ] Database migrations complete
- [ ] Webhooks working
- [ ] OAuth working (if enabled)
- [ ] Mobile responsive

---

## 🎉 Deployment Complete!

Your app is live at: `https://_____________________.vercel.app`

---

## Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard  
**Supabase Dashboard**: https://app.supabase.io/  
**Stripe Dashboard**: https://dashboard.stripe.com/  

**Project Structure**:
- Frontend: Next.js 14 (App Router)
- Auth: Supabase Auth
- Database: PostgreSQL (Supabase)
- Payments: Stripe
- Deployment: Vercel

**Support**: See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions

