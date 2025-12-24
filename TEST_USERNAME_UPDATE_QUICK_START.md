# Quick Start: Testing Username Update on Vercel

## Issue
Users are receiving the error: "Failed to create user account. Please try again or contact support." when trying to save their username.

## Solution
I've created a comprehensive test endpoint and improved error handling to diagnose and fix the issue.

## Quick Test on Vercel

### Step 1: Access Your Vercel Deployment
1. Go to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. **Log in** to your application first (this is required!)

### Step 2: Run the Test
Open your browser's Developer Console (F12) and run:

```javascript
fetch('/api/test-username-update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('=== TEST RESULTS ===');
  console.log(JSON.stringify(data, null, 2));
  
  // Check for errors
  if (!data.success) {
    console.error('❌ Test failed! Check the results above.');
    data.results.forEach(r => {
      if (r.status === 'error') {
        console.error(`Error in ${r.step}: ${r.message}`, r.details);
      }
    });
  } else {
    console.log('✅ All tests passed!');
  }
})
.catch(err => console.error('Request failed:', err));
```

### Step 3: Review Results
The test will check:
- ✅ Authentication status
- ✅ Database connection
- ✅ User existence in database
- ✅ Stripe configuration
- ✅ Stripe customer creation
- ✅ Username update functionality
- ✅ Final database state

Each step shows what succeeded or failed, with detailed error information.

## What Was Fixed

### 1. Improved Error Handling
- More detailed error logging for debugging
- User-friendly error messages
- Better error context (includes error codes and stack traces in dev/preview)

### 2. Better Stripe Error Handling
- Stripe errors are now caught and logged with full details
- If Stripe fails, user creation continues with a placeholder Stripe ID
- Detailed logging shows exactly what failed in Stripe

### 3. Comprehensive Test Endpoint
- New endpoint at `/api/test-username-update` for testing on Vercel
- Tests all components of the username update flow
- Provides detailed diagnostic information

## Common Issues & Solutions

### Issue: "Database table not found"
**Solution**: Run database migrations in Supabase
```sql
-- Check if users_table exists
SELECT * FROM information_schema.tables WHERE table_name = 'users_table';
```

### Issue: "Stripe customer creation failed"
**Solution**: 
1. Check `STRIPE_SECRET_KEY` is set in Vercel environment variables
2. Verify the key is valid in Stripe Dashboard → Developers → API keys
3. Check Stripe logs for API errors

### Issue: "Database connection timeout"
**Solution**:
1. Verify `DATABASE_URL` is set correctly in Vercel
2. Check Supabase connection pooling settings
3. Ensure database is accessible from Vercel's IPs

### Issue: "User not authenticated"
**Solution**: Make sure you're logged in before running the test

## Next Steps

1. **Run the test** using the JavaScript code above
2. **Review the results** - check which step failed
3. **Check Vercel logs** - Go to Vercel Dashboard → Your Project → Functions → View Function Logs
4. **Check Supabase logs** - Go to Supabase Dashboard → Logs → Database Logs
5. **Fix the issue** based on the error details provided

## Documentation

For more detailed information, see:
- `docs/testing/TEST_USERNAME_UPDATE.md` - Complete testing guide
- `app/api/test-username-update/route.ts` - Test endpoint source code
- `app/account/actions.ts` - Improved username update logic

## Support

If the test reveals an issue you can't resolve:
1. Save the complete test results (JSON output)
2. Check Vercel function logs
3. Check Supabase database logs
4. Contact support with the error details

