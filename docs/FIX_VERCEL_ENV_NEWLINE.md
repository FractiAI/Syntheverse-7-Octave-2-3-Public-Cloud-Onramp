# Fix Vercel Environment Variable with Newline Character

## Problem
The logs show that `NEXT_PUBLIC_WEBSITE_URL` or `NEXT_PUBLIC_SITE_URL` contains a newline character:
```
redirectTo: 'https://syntheverse-poc.vercel.app\n/auth/callback'
fallbackUrl: 'https://syntheverse-poc.vercel.app\n'
```

## Solution

### Option 1: Fix via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

2. Find `NEXT_PUBLIC_WEBSITE_URL` (Production environment)

3. Click "Edit" or the value field

4. **Remove any trailing spaces or newlines** - the value should be exactly:
   ```
   https://syntheverse-poc.vercel.app
   ```
   (No newline, no trailing space)

5. Click "Save"

6. **Redeploy** the application:
   - Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/deployments
   - Click "Redeploy" on the latest deployment
   - Or trigger a new deployment by pushing a commit

### Option 2: Fix via Vercel CLI

```bash
# Remove the environment variable
vercel env rm NEXT_PUBLIC_WEBSITE_URL production

# Add it back with the correct value (no newline)
echo -n "https://syntheverse-poc.vercel.app" | vercel env add NEXT_PUBLIC_WEBSITE_URL production
```

### Option 3: Use NEXT_PUBLIC_SITE_URL Instead

If `NEXT_PUBLIC_WEBSITE_URL` is problematic, you can:
1. Delete `NEXT_PUBLIC_WEBSITE_URL`
2. Set `NEXT_PUBLIC_SITE_URL` to: `https://syntheverse-poc.vercel.app` (no newline)
3. The code will automatically use `NEXT_PUBLIC_SITE_URL` as fallback

## Verification

After fixing, check the logs again. The redirect URL should show:
```
redirectTo: 'https://syntheverse-poc.vercel.app/auth/callback'
fallbackUrl: 'https://syntheverse-poc.vercel.app'
```

(No `\n` characters)

## Note

The code now includes `.trim()` to automatically remove whitespace, but it's better to fix the environment variable at the source to avoid any issues.

