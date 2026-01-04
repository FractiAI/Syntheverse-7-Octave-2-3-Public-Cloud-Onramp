# Username Update Test

This document explains how to test the username update functionality on Vercel.

## Test Endpoint

A dedicated test endpoint has been created at `/api/test-username-update` to help diagnose issues with username updates.

## How to Use

### 1. Access the Test Endpoint

After deploying to Vercel, you can test the username update functionality by making a POST request to:

```
https://your-app.vercel.app/api/test-username-update
```

### 2. Authentication Required

The test endpoint requires authentication. You must be logged in to use it.

**Option A: Using Browser Developer Tools**

1. Log into your application on Vercel
2. Open browser Developer Tools (F12)
3. Go to the Console tab
4. Run this JavaScript:

```javascript
fetch('/api/test-username-update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log('Test Results:', JSON.stringify(data, null, 2));
  })
  .catch((err) => console.error('Error:', err));
```

**Option B: Using curl (with session cookie)**

1. Log into your application in a browser
2. Copy your session cookie from browser DevTools → Application → Cookies
3. Use curl:

```bash
curl -X POST https://your-app.vercel.app/api/test-username-update \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie-here" \
  | jq '.'
```

### 3. Understanding the Results

The test endpoint performs several checks and returns detailed results:

#### Test Steps:

1. **Authentication** - Verifies you are logged in
2. **Database Check (by ID)** - Checks if user exists in database by user ID
3. **Database Check (by Email)** - Checks if user exists by email (fallback)
4. **Stripe Configuration** - Verifies Stripe is configured
5. **Stripe Customer Creation** - Tests creating a Stripe customer (if user doesn't exist)
6. **Username Update Test** - Actually attempts to update the username
7. **Final Database State** - Checks final state after update

#### Result Format:

```json
{
  "success": true,
  "message": "All tests passed successfully!",
  "results": [
    {
      "step": "Authentication",
      "status": "success",
      "message": "User authenticated successfully",
      "details": {
        "userId": "...",
        "email": "..."
      }
    }
    // ... more steps
  ],
  "summary": {
    "total": 7,
    "success": 7,
    "warnings": 0,
    "errors": 0
  }
}
```

#### Status Types:

- **success** - Step completed successfully
- **warning** - Step completed but with warnings (non-critical)
- **error** - Step failed (critical issue)

### 4. Common Issues and Solutions

#### Error: "User not authenticated"

- **Solution**: Make sure you are logged into the application before running the test

#### Error: "Database table not found" or "relation does not exist"

- **Solution**: Database migrations may not be applied. Run migrations on your Supabase database.

#### Error: "Stripe customer creation failed"

- **Solution**:
  - Check that `STRIPE_SECRET_KEY` is set in Vercel environment variables
  - Verify the Stripe API key is valid
  - Check Stripe API logs for more details

#### Error: "Database connection timeout"

- **Solution**:
  - Check `DATABASE_URL` environment variable in Vercel
  - Verify database connection settings in Supabase
  - Check if database is accessible from Vercel's IP addresses

#### Error: "Failed to create user account"

- **Solution**: Check the detailed error message in the results. The test endpoint will provide specific information about what failed.

### 5. Debugging in Production

When testing on Vercel production/preview:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Functions → View Function Logs
   - Look for error messages from the test endpoint or username update action

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs → Database Logs
   - Look for query errors or connection issues

3. **Check Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Logs
   - Look for API errors when creating customers

4. **Review Test Results**:
   - The test endpoint provides detailed error information
   - Each step shows what succeeded or failed
   - Error details include error codes and messages

## Improved Error Handling

The username update functionality has been improved with:

1. **Better Error Messages**: More user-friendly error messages that explain what went wrong
2. **Detailed Logging**: Comprehensive error logging for debugging in production
3. **Graceful Degradation**: If Stripe fails, user creation still proceeds with a placeholder Stripe ID
4. **Error Context**: Error messages include context about what operation was being performed

## Manual Testing

You can also test the username update manually:

1. Log into your application
2. Go to the Account page (`/account`)
3. Try to update your username
4. If it fails, check the browser console for error messages
5. Check Vercel function logs for server-side errors

## Support

If you continue to experience issues after running the test:

1. Run the test endpoint and save the complete JSON response
2. Check Vercel function logs for additional error details
3. Check Supabase database logs for query errors
4. Verify all environment variables are set correctly in Vercel
5. Contact support with the test results and error logs
