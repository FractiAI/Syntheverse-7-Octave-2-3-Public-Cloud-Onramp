# GitHub OAuth Setup Guide

## Step-by-Step Instructions

### 1. Go to GitHub Developer Settings
- Visit: https://github.com/settings/developers
- Sign in to GitHub if needed

### 2. Create New OAuth App
- Click 'OAuth Apps' in left sidebar
- Click 'New OAuth App' (or 'Register a new application')

### 3. Fill Application Details
- Application name: 'Syntheverse PoC'
- Homepage URL: 
  - For local development: http://localhost:3000
  - For production: https://your-vercel-app.vercel.app
- Application description: 'Syntheverse Proof of Contribution System'
- Authorization callback URL:
  - For local development: http://localhost:3000/auth/callback
  - For production: https://your-vercel-app.vercel.app/auth/callback

### 4. Create Application
- Click 'Register application'

### 5. Copy Credentials
- Copy 'Client ID' (public, can be shared)
- Click 'Generate a new client secret'
- Copy 'Client Secret' (private, keep secure)

## Supabase Configuration

### 1. Go to Supabase Dashboard
- Visit: https://app.supabase.io/
- Select your project

### 2. Enable GitHub OAuth
- Go to 'Authentication' → 'Providers'
- Find 'GitHub' and click to expand
- Toggle 'Enable sign in with GitHub'
- Paste your Client ID and Client Secret
- Click 'Save'

### 3. Update Redirect URLs (if needed)
- In GitHub OAuth app settings, add production URL when deploying to Vercel

## Test OAuth

1. Start your local server: `npm run dev`
2. Visit: http://localhost:3000/signup
3. Click 'Continue with GitHub'
4. Authorize the application
5. Complete OAuth flow
6. Verify user creation in Supabase dashboard

## Common Issues

### 'Redirect URI mismatch'
- Ensure the callback URL in GitHub matches exactly what's configured
- Include both localhost and production URLs

### 'Application suspended'
- This happens if GitHub detects unusual activity
- Contact GitHub support to reactivate

### OAuth buttons not showing
- Check that Client ID is configured in Supabase
- Verify the provider is enabled in Supabase dashboard
