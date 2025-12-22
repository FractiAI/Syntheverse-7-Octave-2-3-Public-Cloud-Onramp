# Google OAuth Setup Guide

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create or Select Project
- Click 'Select a project' dropdown (top left)
- Click 'New Project'
- Name: 'Syntheverse PoC'
- Click 'Create'

### 3. Enable Google+ API
- Go to 'APIs & Services' → 'Library'
- Search for 'Google+ API'
- Click on it and 'Enable'

### 4. Create OAuth 2.0 Credentials
- Go to 'APIs & Services' → 'Credentials'
- Click '+ CREATE CREDENTIALS' → 'OAuth 2.0 Client IDs'

### 5. Configure OAuth Consent Screen
- If prompted, click 'Configure Consent Screen'
- Choose 'External' user type
- Fill in app information:
  - App name: 'Syntheverse PoC'
  - User support email: your-email@gmail.com
  - Developer contact: your-email@gmail.com
- Click 'Save and Continue'

### 6. Create Credentials
- Application type: 'Web application'
- Name: 'Syntheverse Web App'
- Authorized redirect URIs:
  - For local development: http://localhost:3000/auth/callback
  - For production (add later): https://your-vercel-app.vercel.app/auth/callback
- Click 'Create'

### 7. Copy Credentials
- Copy 'Client ID' and 'Client Secret'
- These will be used in Supabase configuration

## Supabase Configuration

### 1. Go to Supabase Dashboard
- Visit: https://app.supabase.io/
- Select your project

### 2. Enable Google OAuth
- Go to 'Authentication' → 'Providers'
- Find 'Google' and click to expand
- Toggle 'Enable sign in with Google'
- Paste your Client ID and Client Secret
- Click 'Save'

### 3. Update Redirect URLs
- In Google Cloud Console, add production URL if deploying to Vercel
- Format: https://your-app-name.vercel.app/auth/callback

## Test OAuth

1. Start your local server: `npm run dev`
2. Visit: http://localhost:3000/signup
3. Click 'Continue with Google'
4. Complete OAuth flow
5. Verify user creation in Supabase dashboard
