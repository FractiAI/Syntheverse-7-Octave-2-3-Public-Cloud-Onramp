# Configure 1 Month Session Duration in Supabase

## Steps to Set Session Duration to 30 Days

### 1. Go to Supabase Dashboard
- Visit: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/authentication/settings

### 2. Find JWT Settings
- Look for "JWT expiry" or "Access token expiry" setting
- Current value is likely: `3600` (1 hour in seconds)

### 3. Update JWT Expiry
- Change to: `2592000` (30 days in seconds)
- Calculation: 30 days × 24 hours × 60 minutes × 60 seconds = 2,592,000 seconds

### 4. Refresh Token Settings (if available)
- Ensure "Refresh token rotation" is enabled
- Set refresh token expiry to at least 30 days (if configurable)

### 5. Save Changes
- Click "Save" at the bottom of the page

---

## Alternative: Via Supabase CLI (if supported)

The session duration is primarily controlled by Supabase's JWT settings, which are managed in the dashboard. The CLI doesn't have direct commands to modify these settings yet.

---

## Verification

After updating:
1. Sign in with Google/OAuth
2. Check browser cookies - auth tokens should be set with long expiration
3. Session should remain active for up to 30 days

---

## Notes

- **Security Consideration**: Longer session durations are convenient but less secure. 30 days is reasonable for a contributor dashboard.
- **Token Refresh**: Supabase automatically refreshes tokens when they're close to expiring (if refresh token rotation is enabled).
- **User Experience**: Users won't need to sign in again for 30 days unless they explicitly log out.


