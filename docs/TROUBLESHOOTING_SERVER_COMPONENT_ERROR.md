# Troubleshooting: Server Components Render Error

## Error Description

```
Error: An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
```

This error typically occurs when:
1. **Missing or invalid environment variables** (most common)
2. **Supabase connection issues**
3. **API endpoint failures**

## Quick Fix

### Step 1: Check Environment Variables

Run the diagnostic script:

```bash
npm install -g tsx  # If not already installed
tsx scripts/check-env.ts
```

Or manually check if these variables are set:

```bash
# Required variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
echo $DATABASE_URL
echo $STRIPE_SECRET_KEY
```

### Step 2: Fix Missing Variables

#### For Local Development

Create or update `.env.local` file in the project root:

```bash
# Copy from .env.example or docs/ENV_VARIABLES_LIST.md
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
STRIPE_SECRET_KEY=sk_test_...
```

Then restart your development server:

```bash
npm run dev
```

#### For Vercel Production

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add/verify all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `STRIPE_SECRET_KEY`
3. Select **all environments** (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

### Step 3: Verify the Fix

After redeploying, check:

1. **Homepage loads** without errors
2. **Browser console** (F12) shows no errors
3. **Authentication** works (try logging in)

## Understanding the Error

### What Happened

The landing page component (`SectionEngage`) tries to check if a user is authenticated by calling `/api/auth/check`. This endpoint requires Supabase to be properly configured with valid environment variables.

When the environment variables are missing or invalid:
1. Supabase client fails to initialize
2. The API endpoint throws an error
3. The error propagates to the Server Component
4. React's Error Boundary catches it and displays the error screen

### Files Involved

- `components/landing/SectionEngage.tsx` - Makes the auth check
- `app/api/auth/check/route.ts` - API endpoint that checks authentication
- `utils/supabase/server.ts` - Creates Supabase client (requires env vars)

## Enhanced Error Handling

The code has been updated with better error handling:

1. **Validation**: Environment variables are now validated before use
2. **Error Messages**: Clear error messages in development mode
3. **Graceful Degradation**: Pages load even if auth check fails
4. **Logging**: Errors are logged to help diagnose issues

## Still Having Issues?

### Check Supabase Connection

```bash
# Test database connection
tsx scripts/test-db.ts
```

### Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the failing deployment
3. Go to **Runtime Logs** tab
4. Look for specific error messages

### Common Issues

#### 1. Variable Not Found in Production

**Symptom**: Works locally but fails in production

**Fix**: Environment variables must be added in Vercel Dashboard, not just in your local `.env.local`

#### 2. Invalid Database URL

**Symptom**: Database connection errors

**Fix**: Get the correct connection string from:
- Supabase Dashboard → Settings → Database → Connection string → URI

#### 3. Expired or Invalid Keys

**Symptom**: Authentication fails even with variables set

**Fix**: Regenerate keys in Supabase Dashboard:
- Settings → API → Reset anon/service role keys

## Prevention

### For Future Deployments

1. **Always** verify environment variables before deploying
2. Run `tsx scripts/check-env.ts` before pushing code
3. Keep a backup of your environment variables
4. Document any new required variables in `docs/ENV_VARIABLES_LIST.md`

### Testing Locally

```bash
# Build and test production mode locally
npm run build
npm run start

# Then visit http://localhost:3000
```

## Need More Help?

See related documentation:
- `docs/ENV_VARIABLES_LIST.md` - Complete list of environment variables
- `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/DATABASE_CONNECTION_FIX.md` - Database troubleshooting

