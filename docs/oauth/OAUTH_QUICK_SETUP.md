# OAuth Setup Quick Reference

## Google OAuth Setup

### Where: Google Cloud Console
**URL:** https://console.cloud.google.com/

### Steps:
1. Create/select project → 'Syntheverse PoC'
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Configure consent screen (External)
5. Set redirect URIs:
   - http://localhost:3000/auth/callback (dev)
   - https://your-app.vercel.app/auth/callback (prod)
6. Copy Client ID and Client Secret

### Supabase Config:
- Go to Authentication → Providers → Google
- Enable and paste credentials
- Save

---

## GitHub OAuth Setup

### Where: GitHub Developer Settings
**URL:** https://github.com/settings/developers

### Steps:
1. Go to OAuth Apps → New OAuth App
2. Fill details:
   - Name: 'Syntheverse PoC'
   - Homepage: http://localhost:3000 (or prod URL)
   - Callback: http://localhost:3000/auth/callback
3. Create app
4. Copy Client ID and generate Client Secret

### Supabase Config:
- Go to Authentication → Providers → GitHub
- Enable and paste credentials
- Save

---

## Testing Both Providers

```bash
# Start local server
npm run dev

# Test OAuth flows
# Visit: http://localhost:3000/signup
# Click OAuth buttons
# Verify user creation in Supabase
```

## Important Notes

- OAuth credentials are configured in the OAuth provider dashboards (Google/GitHub)
- Supabase acts as the bridge - you enable providers there
- Redirect URLs must match exactly
- Test locally first, then add production URLs
- Keep Client Secrets secure (never commit to git)

## Next Steps

After OAuth setup:
1. Test authentication locally
2. Move to Stripe testing
3. Deploy to Vercel
4. Update OAuth redirect URLs for production
