# 🔍 Troubleshooting: Google OAuth Button Not Showing

## Possible Issues:

### 1. App Not Running
```bash
npm run dev
# Check if server starts on http://localhost:3000
```

### 2. JavaScript Errors
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for React/component errors

### 3. Supabase Not Configured
- Check if .env.local exists with Supabase credentials
- Verify NEXT_PUBLIC_SUPABASE_URL is set
- Make sure Supabase project is active

### 4. OAuth Not Enabled in Supabase
- Go to Supabase Dashboard → Authentication → Providers
- Check if Google provider is enabled
- Verify Client ID and Client Secret are entered

### 5. Browser Cache
- Try hard refresh: Ctrl+F5 or Cmd+Shift+R
- Clear browser cache

## Debug Steps:

1. Visit: http://localhost:3000/signup
2. Open browser console (F12 → Console)
3. Look for any error messages
4. Check if the page loads at all

## Check Environment:
```bash
# Verify environment variables
cat .env.local | grep SUPABASE
```

## Expected Behavior:
- Signup page should load
- Email/password form should be visible  
- Google and GitHub buttons should be visible below 'Or continue with'

If buttons are missing, there might be a JavaScript error preventing the component from rendering.
