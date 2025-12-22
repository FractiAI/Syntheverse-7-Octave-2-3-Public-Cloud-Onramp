# Supabase Cookies to Check After Sign-In

## Expected Cookies (After Successful OAuth Sign-In)

For your Supabase project (`jfbgdxeumzqzigptbmvp`), you should see cookies starting with:

### Main Authentication Cookie:
**Name:** `sb-jfbgdxeumzqzigptbmvp-auth-token`
- **Purpose**: Contains the access token and refresh token for authentication
- **Must be present**: ✅ YES - This is the most important one!
- **Value**: Should be a long encoded string (JSON data)
- **Expires**: Should be a future date (not "Session")

### OAuth Code Verifier (if using OAuth):
**Name:** `sb-jfbgdxeumzqzigptbmvp-auth-token-code-verifier`
- **Purpose**: Used for OAuth PKCE flow
- **Must be present**: Usually yes, for OAuth
- **Value**: Random string
- **Expires**: Usually short-lived (might expire quickly)

---

## Cookie Details to Verify

For the main cookie (`sb-jfbgdxeumzqzigptbmvp-auth-token`), check:

1. **Name**: `sb-jfbgdxeumzqzigptbmvp-auth-token`
2. **Value**: Long string (should exist and not be empty)
3. **Domain**: Should be:
   - `.vercel.app` (preferred - works for all subdomains)
   - OR `syntheverse-poc.vercel.app` (also acceptable)
4. **Path**: Should be `/`
5. **Expires**: Should show a date/time in the future
   - ✅ Good: `Dec 22, 2025, 4:30:00 PM` (example)
   - ❌ Bad: `Session` (expires when browser closes)
6. **HttpOnly**: Usually checked ✅ (security)
7. **Secure**: Should be checked ✅ (required for HTTPS)
8. **SameSite**: Should be `Lax` or `None`

---

## What Each Cookie Does

### `sb-jfbgdxeumzqzigptbmvp-auth-token`
- **Critical**: This is the main cookie that keeps you logged in
- Contains your JWT access token and refresh token
- Without this cookie, you'll be logged out immediately
- Should persist for the session duration (30 days if configured)

### `sb-jfbgdxeumzqzigptbmvp-auth-token-code-verifier`
- Used during OAuth flow for security
- May expire quickly (that's okay)
- Not critical for maintaining session after initial sign-in

---

## Quick Checklist

After signing in with Google/OAuth:

- [ ] Do you see `sb-jfbgdxeumzqzigptbmvp-auth-token` cookie? **Yes / No**
- [ ] What does "Expires" show for this cookie?
  - Future date/time: ✅ Good
  - "Session": ❌ Problem - cookie will expire when browser closes
  - No expiration shown: ❌ Problem
- [ ] What is the "Domain" value?
  - `.vercel.app`: ✅ Good
  - `syntheverse-poc.vercel.app`: ✅ Also good
  - Something else: ❌ Might be a problem

---

## If Cookies Are Missing

If you **don't see** the `sb-jfbgdxeumzqzigptbmvp-auth-token` cookie after signing in:
- ❌ Cookies aren't being set properly in the callback route
- This explains why sessions don't persist
- We need to fix the cookie handling in `/app/auth/callback/route.ts`

---

## If Cookie Has Wrong Expiration

If the cookie exists but shows "Session" expiration:
- ❌ Cookie will expire when you close the browser
- This explains why you need to sign in again
- We need to ensure cookies are set with proper expiration


