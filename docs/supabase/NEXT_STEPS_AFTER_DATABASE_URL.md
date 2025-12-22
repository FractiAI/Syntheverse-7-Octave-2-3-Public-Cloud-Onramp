# ✅ Next Steps After Getting DATABASE_URL

## Current Progress
- [x] Vercel account created
- [ ] DATABASE_URL obtained (in progress)
- [ ] Environment variables added to Vercel
- [ ] First deployment completed

---

## Step 1: Get Stripe Pricing Table ID (2 minutes)

### If you already have a Pricing Table:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - Make sure you're in **Test mode** (toggle in top right)

2. **Navigate to Pricing Tables**
   - Click **"Products"** in left sidebar
   - Click **"Pricing Tables"** (or go directly: https://dashboard.stripe.com/test/pricing-tables)

3. **Find Your Pricing Table**
   - If you have one, click on it
   - Copy the **Pricing Table ID** (starts with `prctbl_`)
   - Example: `prctbl_51R7L8z09dcGq3dt0...`

### If you DON'T have a Pricing Table yet:

You have two options:

**Option A: Create it now in Stripe Dashboard** (recommended for production)
1. Go to Stripe Dashboard → Products → Pricing Tables
2. Click **"Create pricing table"**
3. Add your products/prices
4. Set confirmation page to redirect to your success page
5. Copy the Pricing Table ID

**Option B: Skip for now and add later**
- You can deploy without it
- Add it later and update the environment variable
- Your app will work, but subscription features might not work until you add it

---

## Step 2: Add All Environment Variables to Vercel (5 minutes)

Now that you have DATABASE_URL, you're ready to add everything to Vercel:

### Go to Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Click on your project (or create new project if you haven't)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** for each variable below

### Add These Variables:

#### ✅ Already Have These Values:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://jfbgdxeumzqzigptbmvp.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODczODgsImV4cCI6MjA4MTY2MzM4OH0.PTv7kmbbz8k35blN2pONnK8Msi6mn8O1ok546BPz1gQ`

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY`

4. **DATABASE_URL** (you just got this!)
   - Value: `[paste your connection string here]`

5. **STRIPE_SECRET_KEY**
   - Value: `ssk_test_51R7L8z09dcGq3dt0venHR8ZuByT8Q4LvHC8pqiMyjPqM6ZB7SUECwSTqSvuZIBGYHmGFSuGTp7eBtVCXlT8qE4YM00lfUcoQMh`

6. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Value: `pk_test_51R7L8z09dcGq3dt09zHxvGW3kq410jcg5w9vCE6hMrwt3pjr3O7VvP9H5rHyzeS7ywIZnqxXfozHfVbT2uU7LZ5W00vG3fr6L8`

#### ⚠️ Temporary Placeholders (update after first deployment):

7. **NEXT_PUBLIC_SITE_URL**
   - Value: `https://YOUR-APP-NAME.vercel.app`
   - **Update after first deployment** with your actual Vercel URL

8. **NEXT_PUBLIC_WEBSITE_URL**
   - Value: `https://YOUR-APP-NAME.vercel.app`
   - **Update after first deployment** with your actual Vercel URL (same as above)

#### ⚠️ Optional / Can Add Later:

9. **NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID**
   - Value: `[your pricing table ID if you have it, or leave blank for now]`
   - Can add later if you don't have it yet

10. **STRIPE_WEBHOOK_SECRET**
    - Value: `[leave blank for now - add after creating webhook]`
    - Will add this after first deployment

### Important: Select All Three Environments
For each variable, make sure to select:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

Then click **"Save"**

---

## Step 3: Connect Repository & Deploy (5 minutes)

### If you haven't connected your repo yet:

1. **In Vercel Dashboard**
   - Click **"New Project"** (or "Add New" → Project)
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository: `Syntheverse_PoC_Contributer_UI_Vercel_Stripe`
   - Vercel will auto-detect Next.js

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - **Note your deployment URL** - it will be something like `https://syntheverse-poc.vercel.app`

### If repo is already connected:

1. **Trigger New Deployment**
   - Go to your project in Vercel
   - Click **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deployment

---

## Step 4: Update Site URLs (2 minutes)

After your first deployment completes:

1. **Note your Vercel URL**
   - It will be shown in the deployment page
   - Format: `https://your-project-name.vercel.app`

2. **Update Environment Variables**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Find `NEXT_PUBLIC_SITE_URL`
   - Click **Edit**
   - Update value to: `https://your-actual-vercel-url.vercel.app`
   - Save

3. **Update NEXT_PUBLIC_WEBSITE_URL**
   - Find `NEXT_PUBLIC_WEBSITE_URL`
   - Click **Edit**
   - Update value to: `https://your-actual-vercel-url.vercel.app` (same URL)
   - Save

4. **Redeploy**
   - Go to Deployments
   - Click **"Redeploy"** to apply the updated URLs

---

## Step 5: Update Supabase Site URL (2 minutes)

1. **Go to Supabase Dashboard**
   - https://app.supabase.io/
   - Select your project: `jfbgdxeumzqzigptbmvp`

2. **Update Site URL**
   - Go to **Authentication** → **URL Configuration**
   - Find **"Site URL"**
   - Change from `http://localhost:3000` to: `https://your-vercel-url.vercel.app`
   - Click **Save**

3. **Update Redirect URLs** (if using OAuth)
   - In the same section, find **"Redirect URLs"**
   - Add: `https://your-vercel-url.vercel.app/auth/callback`
   - Add: `https://your-vercel-url.vercel.app/**`
   - Click **Save**

---

## Step 6: Create Stripe Webhook (3 minutes)

After you have your Vercel URL:

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/
   - Make sure you're in **Test mode**

2. **Create Webhook Endpoint**
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - **Endpoint URL**: `https://your-vercel-url.vercel.app/webhook/stripe`
   - **Description**: "Production webhook for Syntheverse PoC"

3. **Select Events**
   - Click **"Select events"** or **"Add events"**
   - Select these events:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
   - Click **"Add events"**

4. **Get Webhook Secret**
   - After creating, click on the webhook endpoint
   - Find **"Signing secret"** section
   - Click **"Reveal"** or **"Click to reveal"**
   - Copy the secret (starts with `whsec_`)

5. **Add to Vercel**
   - Go back to Vercel → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET` (or add it if you didn't before)
   - Update value with the `whsec_...` secret you just copied
   - Save

6. **Redeploy**
   - Go to Deployments
   - Click **"Redeploy"** to apply the webhook secret

---

## Step 7: Test Your Deployment (5 minutes)

Test these features:

- [ ] **Homepage loads**: Visit your Vercel URL
- [ ] **Sign up**: Create a new account
- [ ] **Login**: Log in with email/password
- [ ] **Dashboard**: Access protected routes
- [ ] **Stripe checkout**: Test subscription (if pricing table is set up)
- [ ] **Webhooks**: Check Stripe Dashboard → Webhooks → See events received

---

## Quick Checklist Summary

- [ ] Got DATABASE_URL from Supabase
- [ ] Got NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID (or skip for now)
- [ ] Added all environment variables to Vercel
- [ ] Connected repository and deployed
- [ ] Got Vercel deployment URL
- [ ] Updated NEXT_PUBLIC_SITE_URL with actual URL
- [ ] Updated NEXT_PUBLIC_WEBSITE_URL with actual URL
- [ ] Updated Supabase Site URL
- [ ] Created Stripe webhook
- [ ] Added STRIPE_WEBHOOK_SECRET to Vercel
- [ ] Redeployed with all updates
- [ ] Tested deployment

---

## What's Next After This?

Once everything is deployed and working:

1. ✅ Set up custom domain (optional)
2. ✅ Move Stripe from test to live mode (when ready)
3. ✅ Set up monitoring and analytics
4. ✅ Configure database backups
5. ✅ Set up CI/CD workflows

---

## Need Help?

If you run into issues at any step:
- Check `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
- Check Vercel build logs for errors
- Verify all environment variables are set correctly
- Make sure database migrations have run

