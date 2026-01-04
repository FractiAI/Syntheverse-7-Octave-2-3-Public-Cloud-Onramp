# Missing Environment Variables Guide

## Current Status

✅ **Set:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

❌ **Missing (Required for Testing):**
1. `DATABASE_URL`
2. `NEXT_PUBLIC_WEBSITE_URL`
3. `NEXT_PUBLIC_GROK_API_KEY`
4. `BASE_MAINNET_RPC_URL`

---

## How to Get Each Missing Variable

### 1. DATABASE_URL

**Source:** Supabase Dashboard

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jfbgdxeumzqzigptbmvp`
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

**Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
```

**If you don't know your password:**
- Go to **Settings** → **Database** → **Database password**
- Click **Reset database password** (if needed)
- Save the new password securely

---

### 2. NEXT_PUBLIC_WEBSITE_URL

**Source:** Your Vercel deployment URL

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** tab
4. Copy the production URL (e.g., `https://syntheverse-poc.vercel.app`)

**Value:**
```
https://syntheverse-poc.vercel.app
```
*(Replace with your actual Vercel URL)*

**Note:** This should be the same as `NEXT_PUBLIC_SITE_URL` if you already have that set.

---

### 3. NEXT_PUBLIC_GROK_API_KEY

**Source:** Groq API (for AI evaluation)

**Steps:**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign in or create an account
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the API key

**Format:**
```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Alternative:** If you don't have a Groq account yet:
- Sign up at https://console.groq.com/
- Free tier includes API access
- Create an API key from the dashboard

---

### 4. BASE_MAINNET_RPC_URL

**Source:** Base Mainnet RPC endpoint

**Options:**

**Option A: Public RPC (Free, Rate Limited)**
```
https://mainnet.base.org
```

**Option B: Alchemy (Recommended for Testing)**
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a free account
3. Create a new app
4. Select **Base** network
5. Copy the HTTPS URL from the app dashboard

**Option C: Infura (Alternative)**
1. Go to [Infura](https://www.infura.io/)
2. Create a free account
3. Create a new project
4. Select **Base** network
5. Copy the HTTPS endpoint URL

**Recommended Value (Public):**
```
https://mainnet.base.org
```

**For Production/Testing (Alchemy/Infura):**
```
https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```
or
```
https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID
```

---

## Quick Setup Script

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres

# Site URL (same as NEXT_PUBLIC_SITE_URL)
NEXT_PUBLIC_WEBSITE_URL=https://syntheverse-poc.vercel.app

# Grok API (for AI evaluation)
NEXT_PUBLIC_GROK_API_KEY=gsk_YOUR_GROK_API_KEY_HERE

# Base Mainnet RPC (for Hardhat forking)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

---

## Verification

After adding the variables, run:

```bash
node scripts/check-env-vars.js
```

This will verify all required variables are set.

---

## Priority Order

1. **DATABASE_URL** - Required for all database operations
2. **NEXT_PUBLIC_WEBSITE_URL** - Required for site functionality
3. **NEXT_PUBLIC_GROK_API_KEY** - Required for PoC evaluation tests
4. **BASE_MAINNET_RPC_URL** - Required for Hardhat blockchain tests

---

## Need Help?

- **Supabase:** Check `docs/ENV_VARIABLES_LIST.md`
- **Stripe:** Already configured ✅
- **Groq API:** Sign up at https://console.groq.com/
- **Base RPC:** Use public endpoint or sign up for Alchemy/Infura

