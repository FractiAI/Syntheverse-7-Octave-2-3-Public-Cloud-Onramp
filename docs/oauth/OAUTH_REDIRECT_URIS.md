# OAuth Redirect URIs Setup

## For Local Testing (Required Now):
http://localhost:3000/auth/callback

## For Production (Add Later):
Choose one of these options:

### Option A: Placeholder (Recommended)
https://syntheverse-poc.vercel.app/auth/callback
- Replace 'syntheverse-poc' with your actual Vercel app name
- Easy to identify and update later

### Option B: Generic Placeholder  
https://your-app-name.vercel.app/auth/callback
- Replace 'your-app-name' when you deploy
- Clear what needs to be changed

### Option C: Skip for Now
- Only add localhost URL now
- Add production URL later in Google Cloud Console
- And update Supabase redirect URL configuration

## Recommendation:
Use Option A with a descriptive name you'll remember:
https://syntheverse-whole-brain-ai.vercel.app/auth/callback

## When You Deploy to Vercel:
1. Vercel will give you a URL like: syntheverse-poc-xyz.vercel.app
2. Update the redirect URI in Google Cloud Console
3. Update the redirect URL in Supabase if needed
4. Test OAuth with production URL

## Current Setup:
- ✅ Local: http://localhost:3000/auth/callback
- 🔄 Production: [Add placeholder now, update later]

