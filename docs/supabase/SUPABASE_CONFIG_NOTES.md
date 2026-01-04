# Supabase Configuration Notes

## Current Configuration (from CLI)

### Site URL Mismatch ⚠️

- **Configured in Supabase:** `https://syntheversevercel.vercel.app/`
- **Actual Vercel URL:** `https://syntheverse-poc.vercel.app`
- **Impact:** OAuth redirects and email confirmations may not work correctly

### Email Confirmations ✅

- `enable_confirmations = true` - Email confirmations are enabled

### Auth Settings

- MFA TOTP: Enabled
- Email signup: Enabled
- Email confirmations: Enabled

---

## OAuth Provider Configuration

**Note:** Supabase CLI doesn't provide commands to check OAuth provider settings. These must be verified in the dashboard.

### To Check OAuth Configuration:

1. Go to: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/authentication/providers
2. Verify Google and GitHub are enabled
3. Check that redirect URLs match your Vercel URL

### Recommended Fix:

Update the Site URL in Supabase to match your actual Vercel deployment:

- Current: `https://syntheversevercel.vercel.app/`
- Should be: `https://syntheverse-poc.vercel.app`

---

## Next Steps

1. **Update Site URL in Supabase Dashboard:**
   - Go to: Authentication → URL Configuration
   - Set Site URL to: `https://syntheverse-poc.vercel.app`
   - Add redirect URL: `https://syntheverse-poc.vercel.app/auth/callback`

2. **Verify OAuth Providers:**
   - Check Google and GitHub are enabled
   - Verify redirect URIs in Google Cloud Console and GitHub match
