# Verify OAuth Configuration

## Supabase Dashboard Check

1. **Go to:** https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/authentication/providers

2. **Verify Google OAuth:**
   - ✅ Toggle "Enable sign in with Google" is ON
   - ✅ Client ID is filled in
   - ✅ Client Secret is filled in
   - ✅ Click "Save" if you made changes

3. **Verify GitHub OAuth:**
   - ✅ Toggle "Enable sign in with GitHub" is ON
   - ✅ Client ID is filled in
   - ✅ Client Secret is filled in
   - ✅ Click "Save" if you made changes

## OAuth Provider Redirect URLs

### Google Cloud Console
- Go to: https://console.cloud.google.com/apis/credentials
- Find your OAuth 2.0 Client ID
- Verify "Authorized redirect URIs" includes:
  - `https://syntheverse-poc.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local testing)

### GitHub OAuth App
- Go to: https://github.com/settings/developers
- Find your OAuth App
- Verify "Authorization callback URL" is set to:
  - `https://syntheverse-poc.vercel.app/auth/callback`
  - (or add multiple URLs if supported)

## Test OAuth Buttons

1. Go to: https://syntheverse-poc.vercel.app/signup
2. Click "Continue with Google" button
3. Click "Continue with GitHub" button
4. Both should redirect to the OAuth provider's login page

If buttons still don't work, check browser console for errors.


