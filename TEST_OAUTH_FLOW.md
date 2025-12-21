# 🧪 Test Google OAuth Flow

## Step 1: Start Your App
```bash
npm run dev
```

## Step 2: Test Signup Flow
1. Visit: http://localhost:3000/signup
2. Look for 'Continue with Google' button
3. Click it
4. Select your Google account
5. Grant permissions
6. Should redirect to dashboard

## Step 3: Test Login Flow  
1. Visit: http://localhost:3000/login
2. Click 'Continue with Google'
3. Should sign you in automatically

## Step 4: Verify User Creation
1. Go to Supabase Dashboard → Authentication → Users
2. Should see your Google account listed
3. Check if Stripe customer was created

## Expected Results:
✅ OAuth button visible and clickable
✅ Google sign-in popup appears
✅ Successful authentication
✅ Redirect to dashboard
✅ User appears in Supabase
✅ Stripe customer created

## Debug if Issues:
- Check browser console (F12) for errors
- Verify redirect URI matches: http://localhost:3000/auth/callback
- Check Supabase auth logs

## Next: Move to Stripe Testing (Phase 2)
Once OAuth works, we'll test billing and subscriptions!
