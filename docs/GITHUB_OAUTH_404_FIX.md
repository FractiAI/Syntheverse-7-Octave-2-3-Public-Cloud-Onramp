# GitHub OAuth 404 Error Fix

## Issue
When clicking "Continue with GitHub", users are redirected to a GitHub 404 page instead of the OAuth authorization page.

## Root Causes

1. **Redirect URL Mismatch**: The callback URL configured in GitHub OAuth app doesn't match what Supabase is sending
2. **Environment Variable**: `NEXT_PUBLIC_WEBSITE_URL` might not be set correctly in Vercel
3. **Supabase Configuration**: GitHub OAuth might not be enabled or configured correctly in Supabase

## Fixes Applied

### Code Changes
- Updated `/app/auth/github/route.ts` to use request origin instead of relying solely on environment variable
- Added better error handling and logging
- Same fix applied to Google OAuth for consistency

### How It Works Now
1. Uses the request origin (automatically detects localhost or production domain)
2. Falls back to environment variables if needed
3. Logs redirect URLs for debugging

## Verification Steps

### 1. Check Supabase GitHub OAuth Configuration

1. Go to: https://app.supabase.io/project/[your-project]/authentication/providers
2. Find "GitHub" provider
3. Verify:
   - ✅ "Enable sign in with GitHub" is toggled ON
   - ✅ Client ID is filled in
   - ✅ Client Secret is filled in
   - ✅ Click "Save" if you made changes

### 2. Check GitHub OAuth App Settings ⚠️ CRITICAL

**IMPORTANT**: When using Supabase for OAuth, GitHub must redirect to **Supabase's callback URL**, NOT your app's URL!

1. Go to: https://github.com/settings/developers
2. Click on your OAuth App (or create one if it doesn't exist)
3. **Set "Authorization callback URL" to:**
   ```
   https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback
   ```
   (Replace `jfbgdxeumzqzigptbmvp` with your actual Supabase project ID)

**Why?** The OAuth flow works like this:
1. User clicks "Continue with GitHub" → App redirects to Supabase
2. Supabase redirects to GitHub login
3. User authorizes → **GitHub redirects to Supabase** (not your app)
4. Supabase processes OAuth → Supabase redirects to your app's callback

**DO NOT** use your app's URL (`https://syntheverse-poc.vercel.app/auth/callback`) in the GitHub OAuth app - that's why you're getting 404!

### 3. Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables
2. Verify these are set for Production:
   - `NEXT_PUBLIC_WEBSITE_URL` = `https://syntheverse-poc.vercel.app`
   - `NEXT_PUBLIC_SITE_URL` = `https://syntheverse-poc.vercel.app`

### 4. Check Supabase Redirect URLs

1. Go to: https://app.supabase.io/project/[your-project]/authentication/url-configuration
2. Verify "Redirect URLs" includes:
   - `https://syntheverse-poc.vercel.app/**`
   - `http://localhost:3000/**` (for local testing)

## Testing

1. **Clear browser cache and cookies** for the site
2. Go to: https://syntheverse-poc.vercel.app/signup
3. Click "Continue with GitHub"
4. Should redirect to GitHub authorization page (not 404)
5. After authorizing, should redirect back to `/auth/callback` then to dashboard

## Common Issues

### Still Getting 404?
- Check browser console for errors
- Check Vercel function logs for OAuth errors
- Verify GitHub OAuth app callback URL matches exactly
- Ensure Supabase GitHub provider is enabled

### "Redirect URI mismatch" Error
- The callback URL in GitHub OAuth app must match exactly what Supabase sends
- Check Supabase redirect URL configuration
- Update GitHub OAuth app callback URL to match

### OAuth Button Not Working
- Check that Supabase GitHub provider is enabled
- Verify Client ID and Secret are correct in Supabase
- Check Vercel environment variables are set

## Debugging

Check Vercel function logs:
1. Go to Vercel Dashboard → Functions → `/auth/github`
2. Look for log messages showing redirect URLs
3. Compare with GitHub OAuth app callback URL

The logs will show:
```
GitHub OAuth redirect: { origin: '...', callbackUrl: '...', redirectTo: '...' }
```

Use this to verify the redirect URL matches your GitHub OAuth app configuration.

