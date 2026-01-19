# 🔑 Groq API Key Setup - Quick Fix for 401 Error

**Error:** `Groq API error (401): {"error":{"message":"Invalid API Key"}}`

## Quick Fix Steps

### 1. Get Your Groq API Key

1. Go to: **https://console.groq.com/**
2. Sign in or create account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)

### 2. Add to Vercel Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **Syntheverse-7-Octave-2-3-Public-Cloud-Onramp**
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New** button
6. Enter:
   - **Name**: `NEXT_PUBLIC_GROQ_API_KEY`
   - **Value**: `gsk_your_actual_key_here` (paste your key)
   - **Environments**: ✅ Production ✅ Preview ✅ Development (select all three)
7. Click **Save**

**Option B: Via Vercel CLI**

```bash
# Make sure you're logged in
vercel login

# Add the key (will prompt for value)
vercel env add NEXT_PUBLIC_GROQ_API_KEY production
vercel env add NEXT_PUBLIC_GROQ_API_KEY preview
vercel env add NEXT_PUBLIC_GROQ_API_KEY development
```

**Option C: Use the provided script**

```bash
# Set your API key as environment variable first
export GROQ_API_KEY="gsk_your_actual_key_here"

# Run the script (it will add to all environments)
bash add-groq-key-to-vercel.sh
```

**Note:** The script adds `GROQ_API_KEY` but the code also checks for `NEXT_PUBLIC_GROQ_API_KEY`. You may need to add both for compatibility.

### 3. Redeploy (Required)

After adding the environment variable, you **must redeploy** for it to take effect:

**Option A: Trigger via Git**
```bash
git commit --allow-empty -m "Trigger redeploy for Groq API key"
git push origin main
```

**Option B: Redeploy via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

### 4. Verify It Works

1. Wait for deployment to complete (~2-3 minutes)
2. Go to: **https://syntheverse-poc.vercel.app/submit**
3. Submit a test case
4. Evaluation should complete successfully (no 401 error)

## Troubleshooting

### Still getting 401 error?

1. **Check the key is correct:**
   - Key should start with `gsk_`
   - No extra spaces or quotes
   - Full key copied (usually ~50+ characters)

2. **Verify in Vercel:**
   - Go to Settings → Environment Variables
   - Confirm `NEXT_PUBLIC_GROQ_API_KEY` exists
   - Check it's enabled for Production environment
   - Value should show (masked) - click to verify

3. **Check Vercel logs:**
   - Go to Deployments → Latest deployment → Functions
   - Look for `/api/evaluate/[hash]` function logs
   - Should see successful Groq API calls (not 401)

4. **Verify key is active:**
   - Go to https://console.groq.com/keys
   - Check if key is active/valid
   - Create new key if needed

### Code Checks For:

The code in `utils/grok/evaluate.ts` checks for:
- `NEXT_PUBLIC_GROQ_API_KEY` (primary - correct spelling)
- `NEXT_PUBLIC_GROK_API_KEY` (legacy - backwards compatibility)

Both will work, but `NEXT_PUBLIC_GROQ_API_KEY` is preferred.

## Environment Variable Name

**Correct:** `NEXT_PUBLIC_GROQ_API_KEY`  
**Also works:** `NEXT_PUBLIC_GROK_API_KEY` (legacy)

The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to server-side API routes.

## Status

- ✅ Frontend error handling: Deployed
- ⏳ **Backend config: REQUIRED** (add `NEXT_PUBLIC_GROQ_API_KEY` to Vercel)
- 📝 Testing: Pending API key configuration

---

**Last Updated:** January 18, 2026  
**Issue:** 401 Invalid API Key error during evaluation
