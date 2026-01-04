# Registration Functionality Testing Guide

## Overview

This guide explains how to test the PoC registration functionality before testing in the browser UI.

## Test Scripts

### 1. Local Environment Test (`test-registration.ts`)

Tests the registration functionality in your local environment:

```bash
npx tsx scripts/test-registration.ts
```

**What it tests:**

- ✅ Environment variables (Stripe, Database, Supabase)
- ✅ Authentication setup
- ✅ Database connection
- ✅ Stripe client initialization
- ✅ Registration route structure

**Requirements:**

- `.env.local` file with all required environment variables
- Local database connection (optional)

### 2. Vercel Deployment Test (`test-registration-vercel.ts`)

Tests the registration endpoint on your deployed Vercel instance:

```bash
# Basic test (error cases only)
npx tsx scripts/test-registration-vercel.ts

# With Vercel URL
npx tsx scripts/test-registration-vercel.ts https://syntheverse-poc.vercel.app

# With PoC hash (tests authentication requirement)
npx tsx scripts/test-registration-vercel.ts https://syntheverse-poc.vercel.app <poc-hash>

# Full test with auth token
npx tsx scripts/test-registration-vercel.ts https://syntheverse-poc.vercel.app <poc-hash> <auth-token>
```

**What it tests:**

- ✅ Endpoint accessibility
- ✅ Authentication requirement (401 for unauthenticated)
- ✅ Invalid PoC hash handling (404)
- ✅ Valid registration request (creates Stripe checkout)
- ✅ Error handling

## Getting Test Data

### 1. Get a PoC Hash

Query your database for a qualified PoC:

```sql
SELECT
    submission_hash,
    title,
    contributor,
    registered,
    metadata->>'pod_score' as pod_score,
    metadata->>'qualified_founder' as qualified
FROM contributions
WHERE contributor = 'your-email@example.com'
    AND (metadata->>'qualified_founder')::boolean = true
    AND registered = false
LIMIT 1;
```

### 2. Get Auth Token

**Option A: From Browser**

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check localStorage or cookies for Supabase session
4. Look for `sb-<project-id>-auth-token` or similar

**Option B: From Supabase Dashboard**

1. Go to Authentication > Users
2. Find your user
3. Generate a new access token (if available)

**Option C: Programmatically**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password',
});

console.log('Auth token:', data.session?.access_token);
```

## Testing Checklist

### Pre-Testing

- [ ] Environment variables configured in Vercel
- [ ] Stripe secret key is valid and active
- [ ] Database connection is working
- [ ] At least one qualified PoC exists in database
- [ ] User account exists and can authenticate

### Test Execution

1. **Run Local Test**

   ```bash
   npx tsx scripts/test-registration.ts
   ```

   - Should pass: Environment variables, Stripe client, Database connection
   - May skip: Authentication (if test user doesn't exist)

2. **Run Vercel Test (Basic)**

   ```bash
   npx tsx scripts/test-registration-vercel.ts https://syntheverse-poc.vercel.app
   ```

   - Should pass: Invalid hash handling, Error handling
   - May skip: Valid registration (needs hash and token)

3. **Run Vercel Test (Full)**
   ```bash
   npx tsx scripts/test-registration-vercel.ts \
     https://syntheverse-poc.vercel.app \
     <your-poc-hash> \
     <your-auth-token>
   ```

   - Should pass: All tests including valid registration

### Expected Results

✅ **Success Indicators:**

- All environment checks pass
- Authentication correctly returns 401 for unauthenticated requests
- Invalid hash returns 404
- Valid request with auth creates Stripe checkout session
- Error handling works correctly

❌ **Failure Indicators:**

- Stripe key format invalid
- Database connection fails
- Endpoint returns 500 errors
- Authentication not working

## Troubleshooting

### Issue: "Stripe not configured"

**Solution:** Check `STRIPE_SECRET_KEY` in Vercel environment variables

### Issue: "Database error"

**Solution:**

- Verify `DATABASE_URL` is set in Vercel
- Check database connection string format
- Ensure database is accessible from Vercel

### Issue: "401 Unauthorized" (when you expect success)

**Solution:**

- Verify auth token is valid and not expired
- Check that user email matches PoC contributor
- Ensure Supabase authentication is configured

### Issue: "404 Contribution not found"

**Solution:**

- Verify PoC hash is correct
- Check that PoC exists in database
- Ensure hash matches exactly (case-sensitive)

### Issue: "403 Forbidden"

**Solution:**

- User email must match PoC contributor
- Check that you're using the correct user account

### Issue: "500 Internal Server Error"

**Solution:**

- Check Vercel function logs
- Verify all environment variables are set
- Check Stripe API status
- Review error details in test output

## Browser Testing

After script tests pass:

1. **Log in to Dashboard**
   - Navigate to `/dashboard`
   - Ensure you're authenticated

2. **Find Qualified PoC**
   - Check "My Submissions" table
   - Look for PoC with "Qualified" status
   - Ensure it's not already registered

3. **Click Register Button**
   - Click "Anchor PoC on-chain - $500" button
   - Should redirect to Stripe checkout

4. **Verify Stripe Checkout**
   - Checkout page should show $500.00
   - Product name should show PoC title
   - Description should mention "Hard Hat L1 blockchain"

5. **Test Stripe Payment (Test Mode)**
   - Use Stripe test card numbers (see below)
   - Test successful payment flow
   - Test cancel flow (should return to dashboard)

### Stripe Test Card Numbers

For testing in Stripe test mode, use these test card numbers:

**Successful Payment:**

- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment (for testing error handling):**

- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Requires Authentication (3D Secure):**

- Card Number: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Note:** These cards only work in Stripe test mode. If you're using live mode, you'll need real payment methods (not recommended for testing).

6. **Complete or Cancel**
   - Test cancel flow (should return to dashboard)
   - Test success flow (after payment, should update registration status)
   - Verify registration status updates in database

## Monitoring

### Vercel Logs

Check Vercel function logs for detailed error messages:

```bash
vercel logs --follow
```

Or in Vercel Dashboard:

1. Go to your project
2. Click "Functions" tab
3. Find `/api/poc/[hash]/register`
4. View logs for errors

### Database Verification

After successful registration:

```sql
SELECT
    submission_hash,
    title,
    registered,
    registration_date,
    stripe_payment_id
FROM contributions
WHERE submission_hash = '<your-hash>';
```

Should show:

- `registered = true`
- `registration_date` set
- `stripe_payment_id` populated

## Next Steps

After confirming registration works:

1. Test token allocation (if PoC is qualified)
2. Verify epoch balance updates
3. Check allocation records in database
4. Test webhook handling (Stripe → registration update)
