# Fix Google OAuth Redirect URI Error

## Error

`Error 400: redirect_uri_mismatch` from Google

## Problem

When using Supabase for OAuth, Google needs to redirect to **Supabase's callback URL**, not your application's callback URL.

## Solution

### Update Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Sign in with your Google account

2. **Find Your OAuth 2.0 Client ID**
   - Look for the OAuth 2.0 Client ID you created for this app
   - Click on it to edit

3. **Update Authorized redirect URIs**
   - In the "Authorized redirect URIs" section
   - **Remove** any URLs like:
     - `https://syntheverse-poc.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
   - **Add** this URL:
     ```
     https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback
     ```
   - **Important**: Replace `jfbgdxeumzqzigptbmvp` with your Supabase project ID if different

4. **Save Changes**
   - Click "Save" at the bottom

5. **Wait a Few Minutes**
   - Google sometimes takes a few minutes to propagate changes

---

## For GitHub OAuth (Do the same)

If you get a similar error with GitHub:

1. Go to: https://github.com/settings/developers
2. Find your OAuth App
3. Update "Authorization callback URL" to:
   ```
   https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback
   ```
4. Save changes

---

## How OAuth Flow Works with Supabase

1. User clicks "Continue with Google" on your app
2. Your app redirects to Supabase OAuth endpoint
3. Supabase redirects to Google login
4. User authorizes on Google
5. **Google redirects back to Supabase** (`https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback`)
6. Supabase processes the OAuth response
7. Supabase redirects to your app's callback URL (`https://syntheverse-poc.vercel.app/auth/callback`)

---

## Quick Checklist

- [ ] Go to Google Cloud Console → Credentials
- [ ] Find your OAuth 2.0 Client ID
- [ ] Remove old redirect URIs (your app URLs)
- [ ] Add: `https://jfbgdxeumzqzigptbmvp.supabase.co/auth/v1/callback`
- [ ] Save changes
- [ ] Wait 2-3 minutes
- [ ] Test OAuth again
