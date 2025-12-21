# 🚀 Complete OAuth Setup - Simple Steps

## Step 1: Get OAuth Credentials from Google
1. Go to: https://console.cloud.google.com/
2. Select project: 'Syntheverse Whole Brain AI'
3. Go to: APIs & Services → Credentials
4. Click the OAuth client you created
5. Copy: Client ID and Client Secret

## Step 2: Configure in Supabase  
1. Go to: https://app.supabase.io/
2. Select your project
3. Authentication → Providers → Google
4. Enable Google OAuth
5. Paste Client ID and Client Secret
6. Save

## Step 3: Test
1. Run: npm run dev
2. Visit: http://localhost:3000/signup
3. Click 'Continue with Google'
4. Should work!

## If you need the exact URLs:
- Client ID: [from Google Cloud Console]
- Client Secret: [from Google Cloud Console] 

Paste them here and I'll help configure Supabase.
