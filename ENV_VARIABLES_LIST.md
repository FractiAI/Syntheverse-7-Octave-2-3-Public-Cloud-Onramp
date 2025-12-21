# 📋 Environment Variables for Vercel

## Quick Copy-Paste List

Copy each variable into **Vercel Dashboard → Your Project → Settings → Environment Variables**

Select **all three environments** (Production, Preview, Development) for each variable.

---

## Required Variables

### 1. Supabase - URL
**Key:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://jfbgdxeumzqzigptbmvp.supabase.co`

---

### 2. Supabase - Anon Key
**Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODczODgsImV4cCI6MjA4MTY2MzM4OH0.PTv7kmbbz8k35blN2pONnK8Msi6mn8O1ok546BPz1gQ`

---

### 3. Supabase - Service Role Key
**Key:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY`

---

### 4. Database URL
**Key:** `DATABASE_URL`  
**Value:** `postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres`

⚠️ **Get this from:** Supabase Dashboard → Settings → Database → Connection string → URI tab  
⚠️ **Replace** `[YOUR-PASSWORD]` with your actual database password

---

### 5. Site URL (Part 1)
**Key:** `NEXT_PUBLIC_SITE_URL`  
**Value:** `https://YOUR-APP-NAME.vercel.app`

⚠️ **Update after first deployment** with your actual Vercel URL

---

### 6. Site URL (Part 2)
**Key:** `NEXT_PUBLIC_WEBSITE_URL`  
**Value:** `https://YOUR-APP-NAME.vercel.app`

⚠️ **Update after first deployment** with your actual Vercel URL (same as above)

---

### 7. Stripe - Secret Key
**Key:** `STRIPE_SECRET_KEY`  
**Value:** `ssk_test_51R7L8z09dcGq3dt0venHR8ZuByT8Q4LvHC8pqiMyjPqM6ZB7SUECwSTqSvuZIBGYHmGFSuGTp7eBtVCXlT8qE4YM00lfUcoQMh`

⚠️ **Note:** This should start with `sk_test_`. Verify in Stripe Dashboard if needed.

---

### 8. Stripe - Publishable Key
**Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  
**Value:** `pk_test_51R7L8z09dcGq3dt09zHxvGW3kq410jcg5w9vCE6hMrwt3pjr3O7VvP9H5rHyzeS7ywIZnqxXfozHfVbT2uU7LZ5W00vG3fr6L8`

---

### 9. Stripe - Pricing Table ID
**Key:** `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`  
**Value:** `prctbl_1Sgbe509dcGq3dt0CgPQ4MFg`

✅ **Found!** This is your Pricing Table ID from Stripe

---

### 10. Stripe - Webhook Secret
**Key:** `STRIPE_WEBHOOK_SECRET`  
**Value:** `[GET AFTER CREATING WEBHOOK]`

⚠️ **Get after:** Creating webhook endpoint in Stripe (after first deployment). Copy the signing secret (starts with `whsec_`)

---

## Optional Variables (Only if using OAuth)

### 11. Google OAuth - Client ID (Optional)
**Key:** `GOOGLE_CLIENT_ID`  
**Value:** `[Your Google OAuth Client ID]`

---

### 12. Google OAuth - Client Secret (Optional)
**Key:** `GOOGLE_CLIENT_SECRET`  
**Value:** `[Your Google OAuth Client Secret]`

---

### 13. GitHub OAuth - Client ID (Optional)
**Key:** `GITHUB_CLIENT_ID`  
**Value:** `[Your GitHub OAuth Client ID]`

---

### 14. GitHub OAuth - Client Secret (Optional)
**Key:** `GITHUB_CLIENT_SECRET`  
**Value:** `[Your GitHub OAuth Client Secret]`

---

## Summary

**Total Required:** 10 variables (items 1-10 above)  
**Optional:** 4 variables (items 11-14, only if using OAuth)

---

## Quick Steps

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** for each variable
5. Copy **Key** and **Value** from above
6. Select **✅ Production, ✅ Preview, ✅ Development**
7. Click **"Save"**

---

## What to Get First

Before adding to Vercel, you need to get:

1. ✅ **DATABASE_URL** - From Supabase Dashboard → Settings → Database
2. ✅ **NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID** - From Stripe Dashboard → Products → Pricing Tables
3. ⏳ **STRIPE_WEBHOOK_SECRET** - After creating webhook (can do after first deployment)
4. ⏳ **Site URLs** - Update after first deployment with your Vercel URL

