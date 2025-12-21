# ✅ Google OAuth Setup Progress
Project: Syntheverse Whole Brain AI
Status: Google+ API Enabled

## Next Steps:

### 1. Create OAuth 2.0 Credentials
- Go to 'APIs & Services' → 'Credentials'
- Click '+ CREATE CREDENTIALS'
- Select 'OAuth 2.0 Client IDs'

### 2. Configure OAuth Consent Screen (if prompted)
- User Type: External
- App Name: Syntheverse Whole Brain AI
- Support Email: [your email]
- Click 'Save and Continue'

### 3. Create Client ID
- Application Type: Web application
- Name: Syntheverse Web App
- Authorized redirect URIs:
  - http://localhost:3000/auth/callback
  - https://[your-vercel-app].vercel.app/auth/callback
- Click 'Create'

### 4. Save Credentials
- Client ID: [copy this value]
- Client Secret: [copy this value]

### 5. Configure in Supabase
- Dashboard → Authentication → Providers → Google
- Enable Google OAuth
- Paste Client ID and Client Secret
- Save

## Testing Commands:
```bash
npm run dev                    # Start local server
# Visit http://localhost:3000/signup
# Click 'Continue with Google'
# Test OAuth flow
```

