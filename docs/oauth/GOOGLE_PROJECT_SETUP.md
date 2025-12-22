# Google Cloud Console - Project Creation Checklist

## ✅ Step Completed: New Project Created
- Project Name: Syntheverse Whole Brain AI
- Status: Project created successfully

## Next Steps in Google Cloud Console:

### 1. Enable Google+ API
- From the left sidebar, click 'APIs & Services' → 'Library'
- Search for 'Google+ API' 
- Click on 'Google+ API' from results
- Click the 'Enable' button

### 2. Create OAuth Credentials  
- Go to 'APIs & Services' → 'Credentials' (in left sidebar)
- Click '+ CREATE CREDENTIALS' at the top
- Select 'OAuth 2.0 Client IDs'

### 3. Configure OAuth Consent Screen (if prompted)
- Choose 'External' for user type
- App name: Syntheverse Whole Brain AI
- User support email: [your email]
- Developer contact information: [your email]
- Click 'Save and Continue' through the steps

### 4. Create OAuth Client ID
- Application type: Web application
- Name: Syntheverse Web App
- Authorized redirect URIs:
  - http://localhost:3000/auth/callback
  - https://[your-vercel-app].vercel.app/auth/callback (add later)
- Click 'Create'

### 5. Copy Credentials
- Client ID: [copy this value]
- Client Secret: [copy this value]

## ⚠️ Important Notes:
- Make sure to add both localhost and production redirect URIs
- Keep the Client Secret secure and don't commit to git
- The Client ID is public and can be shared

## Next: Configure in Supabase
After getting credentials, go to Supabase dashboard → Authentication → Providers → Google to enable OAuth.

Ready to continue with enabling the Google+ API?
