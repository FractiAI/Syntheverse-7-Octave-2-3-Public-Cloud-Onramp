# Quick OAuth Debug Check

Run these commands to diagnose the issue:

## 1. Check if app is running:
curl http://localhost:3000/signup

## 2. Check environment variables:
cat .env.local 2>/dev/null || echo '.env.local not found'

## 3. Check Supabase connection:
grep 'SUPABASE' .env.local 2>/dev/null || echo 'No Supabase vars found'

## 4. Check if dependencies are installed:
ls -la node_modules/ | wc -l

## 5. Check for build errors:
npm run build --silent 2>&1 | head -10

## Expected Results:
- App should return HTML for signup page
- .env.local should exist with Supabase credentials  
- node_modules should have many files
- Build should complete without errors

If any of these fail, that's your issue!
