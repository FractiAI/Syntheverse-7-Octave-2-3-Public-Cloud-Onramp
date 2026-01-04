# 🚀 Deployment & Testing Plan

**Last Updated**: December 21, 2025  
**Current Status**: Environment variables configured, ready for redeploy

---

## ✅ Completed Steps

1. ✅ **Environment Variables Added** (via CLI)
   - NEXT_PUBLIC_SUPABASE_URL → Production, Preview, Development
   - NEXT_PUBLIC_SUPABASE_ANON_KEY → Production, Preview, Development
   - SUPABASE_SERVICE_ROLE_KEY → Production, Preview
   - NEXT_PUBLIC_SITE_URL → Set to `https://syntheverse-poc.vercel.app`
   - NEXT_PUBLIC_WEBSITE_URL → Set to `https://syntheverse-poc.vercel.app`
   - STRIPE_SECRET_KEY → Production, Preview
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → Production, Preview, Development
   - NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID → Production, Preview, Development

2. ✅ **Latest Deployment**: Ready (21 hours ago)
   - URL: https://syntheverse-poc.vercel.app
   - Status: Build successful, but needs redeploy to pick up new env vars

---

## 📋 Next Steps for Successful Deployment & Testing

### Step 1: Redeploy with New Environment Variables ⚡ **IMMEDIATE**

The current deployment is 21 hours old and was built **before** we added the environment variables. We need to trigger a new deployment so the new variables are available.

**Option A: Redeploy via Vercel Dashboard** (Easiest)

1. Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/deployments
2. Find the latest deployment (Ready status)
3. Click the "⋯" (three dots) menu
4. Select **"Redeploy"**
5. Wait 1-2 minutes for build to complete

**Option B: Redeploy via CLI**

```bash
vercel --prod --token fzO8FQHd6KWOZPRH5uleceIi
```

**Option C: Trigger via Git Push** (if repo is connected)

- Push any commit to trigger automatic deployment

**Expected Result**: New deployment builds successfully with all environment variables

---

### Step 2: Add DATABASE_URL (REQUIRED) ⚠️ **CRITICAL**

**✅ CONFIRMED: DATABASE_URL is REQUIRED**

Found usage in these files:

- `app/auth/actions.ts` - Authentication actions
- `app/webhook/stripe/route.ts` - Stripe webhook handler
- `app/dashboard/layout.tsx` - Dashboard layout
- `app/auth/callback/route.ts` - OAuth callback handler

**Without DATABASE_URL, these features will fail:**

- ❌ Authentication actions (signup, login)
- ❌ Stripe webhook processing
- ❌ Dashboard data loading
- ❌ OAuth callbacks

**How to add DATABASE_URL:**

1. **Get connection string from Supabase Dashboard:**
   - Go to: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/database
   - Scroll to **"Connection string"** section
   - Click on **"URI"** tab
   - Copy the connection string
   - Format: `postgresql://postgres:[PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`
   - **If password shows as [YOUR-PASSWORD]**, you need to:
     - Click "Reset database password" (if available)
     - OR use your existing database password
     - Replace `[YOUR-PASSWORD]` with actual password
     - URL-encode any special characters in password

2. **Add to Vercel via CLI:**

   ```bash
   # Replace YOUR_CONNECTION_STRING with actual connection string
   echo "YOUR_CONNECTION_STRING" | vercel env add DATABASE_URL production --sensitive --token fzO8FQHd6KWOZPRH5uleceIi
   echo "YOUR_CONNECTION_STRING" | vercel env add DATABASE_URL preview --sensitive --token fzO8FQHd6KWOZPRH5uleceIi
   ```

3. **Verify it was added:**

   ```bash
   vercel env ls production --token fzO8FQHd6KWOZPRH5uleceIi | grep DATABASE_URL
   ```

4. **Redeploy** after adding (the deployment will need this to work)

---

### Step 3: Update Supabase Configuration 🔧

**Update Site URL:**

1. Go to: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp
2. Navigate to: **Authentication** → **URL Configuration**
3. Update **Site URL** to: `https://syntheverse-poc.vercel.app`
4. Click **Save**

**Update Redirect URLs (for OAuth):**

1. In same section, find **Redirect URLs**
2. Add the following URLs (one per line):
   ```
   https://syntheverse-poc.vercel.app/auth/callback
   https://syntheverse-poc.vercel.app/**
   ```
3. Click **Save**

**This enables:**

- ✅ Authentication callbacks to work correctly
- ✅ OAuth redirects to function
- ✅ Session management to work

---

### Step 4: Basic Deployment Testing 🧪

**After redeploy completes, test these endpoints:**

1. **Homepage** (Should load)
   - Visit: https://syntheverse-poc.vercel.app
   - ✅ Should load without errors
   - ❌ Check browser console for errors

2. **Login Page** (Should render)
   - Visit: https://syntheverse-poc.vercel.app/login
   - ✅ Should show login form
   - ✅ Should not show environment variable errors

3. **Signup Page** (Should render)
   - Visit: https://syntheverse-poc.vercel.app/signup
   - ✅ Should show signup form

4. **API Routes** (Test if accessible)
   - Check browser Network tab for API calls
   - ✅ Should not see 500 errors related to missing env vars

---

### Step 5: Functional Testing (After Basic Tests Pass) ✅

**Authentication Flow:**

- [ ] Create a new account via signup
- [ ] Verify email (if email verification enabled)
- [ ] Login with credentials
- [ ] Check if session persists
- [ ] Access protected routes (dashboard, account)

**Subscription Flow:**

- [ ] Visit `/subscribe` page
- [ ] Verify Stripe pricing table loads
- [ ] Test checkout flow (test mode)
- [ ] Verify redirect to success page

**Dashboard:**

- [ ] Access `/dashboard` after login
- [ ] Verify data loads correctly
- [ ] Check for any errors in console

---

### Step 6: Configure Stripe Webhook (Optional for Testing) 🔔

**Only needed if you want webhook functionality:**

1. **Create Webhook in Stripe:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click **"Add endpoint"**
   - Endpoint URL: `https://syntheverse-poc.vercel.app/webhook/stripe`
   - Select events you want to listen to (e.g., `checkout.session.completed`, `customer.subscription.created`)
   - Click **"Add endpoint"**

2. **Get Webhook Signing Secret:**
   - After creating, click on the webhook endpoint
   - Copy the **"Signing secret"** (starts with `whsec_`)

3. **Add to Vercel:**

   ```bash
   echo "whsec_YOUR_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production --sensitive --token fzO8FQHd6KWOZPRH5uleceIi
   echo "whsec_YOUR_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET preview --sensitive --token fzO8FQHd6KWOZPRH5uleceIi
   ```

4. **Redeploy again** after adding webhook secret

5. **Test Webhook:**
   - Complete a test checkout
   - Check Stripe Dashboard → Webhooks → Your endpoint → Events
   - ✅ Should see successful webhook deliveries

---

### Step 7: Monitor & Verify 🎯

**Check Deployment Logs:**

- Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/deployments
- Click on latest deployment
- Review **"Build Logs"** for any warnings or errors
- Review **"Function Logs"** for runtime errors

**Check Runtime Errors:**

- Open browser console on your site
- Look for any red errors
- Check Network tab for failed API calls

**Verify Environment Variables:**

- Run: `vercel env ls --token fzO8FQHd6KWOZPRH5uleceIi`
- Verify all expected variables are present

---

## 🎯 Priority Order

**High Priority (Do First):**

1. ✅ Redeploy to pick up environment variables
2. ✅ Update Supabase Site URL
3. ✅ Basic deployment testing (homepage, login, signup)

**Medium Priority (Do Next):** 4. ⚠️ **Add DATABASE_URL** (REQUIRED - app won't work without it) 5. ⚠️ Functional testing (authentication, subscriptions) 6. ⚠️ Fix any errors found during testing

**Low Priority (Can Do Later):** 7. 🔔 Configure Stripe webhook 8. 🔔 OAuth setup (if using) 9. 🔔 Advanced testing

---

## 🔗 Quick Links

**Vercel:**

- Dashboard: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc
- Deployments: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/deployments
- Environment Variables: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

**Supabase:**

- Dashboard: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp
- Auth Settings: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/auth/url-configuration
- Database Settings: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/database

**Stripe:**

- Dashboard: https://dashboard.stripe.com/
- Webhooks: https://dashboard.stripe.com/test/webhooks

**Your App:**

- Production URL: https://syntheverse-poc.vercel.app

---

## 📊 Success Criteria

**Deployment is successful when:**

- ✅ New deployment builds without errors
- ✅ Homepage loads without errors
- ✅ Login/signup pages render correctly
- ✅ No environment variable errors in console
- ✅ Authentication works (can create account and login)
- ✅ Protected routes are accessible after login
- ✅ Stripe pricing table displays (if on subscribe page)

---

## 🐛 Troubleshooting

**If deployment fails:**

1. Check build logs in Vercel Dashboard
2. Verify all required environment variables are set
3. Check for syntax errors in code

**If app loads but shows errors:**

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Supabase Site URL matches Vercel URL
4. Verify API keys are correct

**If authentication doesn't work:**

1. Verify Supabase Site URL is updated
2. Check redirect URLs are configured
3. Verify Supabase keys are correct
4. Check browser console for auth errors

---

**Ready to proceed?** Start with **Step 1: Redeploy** to get the new environment variables active! 🚀
