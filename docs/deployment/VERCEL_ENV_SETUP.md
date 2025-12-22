# 🚀 Step-by-Step: Add Environment Variables to Vercel

## Current Status

✅ **You have these ready:**
- Supabase URL and keys
- Stripe secret and publishable keys

⚠️ **You need to get these:**
- `DATABASE_URL` (from Supabase)
- `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` (from Stripe)
- `STRIPE_WEBHOOK_SECRET` (after creating webhook)
- Site URLs (will update after first deployment)

---

## Step 1: Get Missing Values

### Get DATABASE_URL from Supabase

1. Go to [Supabase Dashboard](https://app.supabase.io/)
2. Select your project: `jfbgdxeumzqzigptbmvp`
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **URI** tab
6. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password
8. **Save this value** - you'll need it for Vercel

### Get NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID from Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Pricing Tables**
3. If you have a pricing table, click on it
4. Copy the **Pricing Table ID** (starts with `prctbl_`)
5. If you don't have one yet, you'll need to create it first (see Stripe setup in README.md)

---

## Step 2: Add Variables to Vercel

### Navigate to Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (or create one if you haven't yet)
3. Go to **Settings** → **Environment Variables**

### Add Each Variable

For each variable below, click **"Add New"** and fill in:

#### 1. NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://jfbgdxeumzqzigptbmvp.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODczODgsImV4cCI6MjA4MTY2MzM4OH0.PTv7kmbbz8k35blN2pONnK8Msi6mn8O1ok546BPz1gQ`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 3. SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 4. DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`
  - ⚠️ Replace `[YOUR-PASSWORD]` with your actual Supabase database password
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 5. NEXT_PUBLIC_SITE_URL
- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: `https://YOUR-APP-NAME.vercel.app`
  - ⚠️ **Update this after your first deployment** with your actual Vercel URL
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 6. NEXT_PUBLIC_WEBSITE_URL
- **Key**: `NEXT_PUBLIC_WEBSITE_URL`
- **Value**: `https://YOUR-APP-NAME.vercel.app`
  - ⚠️ **Update this after your first deployment** with your actual Vercel URL (same as NEXT_PUBLIC_SITE_URL)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 7. STRIPE_SECRET_KEY
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: `ssk_test_51R7L8z09dcGq3dt0venHR8ZuByT8Q4LvHC8pqiMyjPqM6ZB7SUECwSTqSvuZIBGYHmGFSuGTp7eBtVCXlT8qE4YM00lfUcoQMh`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 8. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_51R7L8z09dcGq3dt09zHxvGW3kq410jcg5w9vCE6hMrwt3pjr3O7VvP9H5rHyzeS7ywIZnqxXfozHfVbT2uU7LZ5W00vG3fr6L8`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 9. NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
- **Key**: `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`
- **Value**: `prctbl_XXXXXXXXXXXXX` (get from Stripe Dashboard)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 10. STRIPE_WEBHOOK_SECRET
- **Key**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_XXXXXXXXXXXXX`
  - ⚠️ **Get this after creating webhook** (see Step 3 below)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

---

## Step 3: Create Stripe Webhook (After First Deployment)

After your first Vercel deployment, you'll get a URL like `https://your-app.vercel.app`. Then:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://your-app.vercel.app/webhook/stripe`
4. **Description**: "Production webhook for Syntheverse PoC"
5. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Go back to Vercel and update `STRIPE_WEBHOOK_SECRET` with this value

---

## Step 4: Update Site URLs After First Deployment

After your first deployment:

1. Note your Vercel URL (e.g., `https://syntheverse-poc.vercel.app`)
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_SITE_URL` with your actual URL
4. Update `NEXT_PUBLIC_WEBSITE_URL` with your actual URL
5. Click **"Redeploy"** to apply changes

---

## Quick Checklist

- [ ] Got DATABASE_URL from Supabase
- [ ] Got NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID from Stripe
- [ ] Added all 10 environment variables to Vercel
- [ ] Selected all three environments for each variable
- [ ] Completed first deployment
- [ ] Created Stripe webhook and added STRIPE_WEBHOOK_SECRET
- [ ] Updated Site URLs with actual Vercel URL
- [ ] Redeployed with updated variables

---

## Troubleshooting

### Can't find DATABASE_URL?
- Make sure you're in Supabase Dashboard → Settings → Database
- Look for "Connection string" section
- Select "URI" tab (not "JDBC" or "Connection pooling")
- Your password is the one you set when creating the Supabase project

### Can't find Pricing Table ID?
- You may need to create a pricing table first
- See README.md for Stripe setup instructions
- Or run `npm run stripe:setup` locally first

### Variables not working after deployment?
- Make sure you selected all three environments (Production, Preview, Development)
- Try redeploying after adding variables
- Check Vercel build logs for any errors

---

## Next Steps

After adding all environment variables:
1. Complete your first Vercel deployment
2. Update Supabase Site URL to your Vercel URL
3. Create Stripe webhook
4. Test your deployment
5. See `VERCEL_DEPLOYMENT_GUIDE.md` for complete testing checklist

