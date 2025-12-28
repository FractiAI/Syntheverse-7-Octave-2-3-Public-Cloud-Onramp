# Stripe Webhook Signature Verification Fix

## Issue
Webhook signature verification was failing with error:
```
Signature verification failed: The provided signing secret contains whitespace. 
This often indicates an extra newline or space is in the value
```

## Root Cause
The `STRIPE_WEBHOOK_SECRET` environment variable in Vercel contains whitespace (spaces, newlines, or tabs) that breaks signature verification.

## Fix Applied
The webhook handler now automatically sanitizes the webhook secret by:
1. Trimming leading/trailing whitespace
2. Removing all internal whitespace characters
3. Validating the secret is not empty after sanitization
4. Adding better error logging for debugging

## Action Required

### Check Vercel Environment Variable

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

2. **Find `STRIPE_WEBHOOK_SECRET`**
   - Check the value for Production, Preview, and Development environments

3. **Get the Correct Secret from Stripe**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click on your webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - **Copy the secret carefully** - it should start with `whsec_`

4. **Update in Vercel**
   - Edit the `STRIPE_WEBHOOK_SECRET` value
   - **Paste the secret directly** - don't add any spaces or newlines
   - Make sure there are no leading/trailing spaces
   - Save the changes

5. **Redeploy**
   - Vercel will automatically redeploy, or you can trigger a manual redeploy

## Verification

After updating the secret:

1. **Test Webhook in Stripe Dashboard**
   - Go to your webhook in Stripe
   - Click "Send test webhook"
   - Select `checkout.session.completed`
   - Click "Send test webhook"
   - Should see 200 response in Stripe

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Functions → `/webhook/stripe`
   - Should see successful webhook processing logs
   - Should NOT see "Signature verification failed" errors

3. **Test Full Flow**
   - Register a PoC via Stripe checkout
   - After payment, check dashboard
   - Status should update to "Registered"
   - Token allocation should appear
   - Epoch balances should update

## Code Changes

**File:** `app/webhook/stripe/route.ts`

- Added webhook secret sanitization (trim + remove whitespace)
- Added validation for missing/empty secrets
- Added better error logging with secret prefix/suffix (for debugging without exposing full secret)
- Added signature header validation

## Notes

- The webhook secret should be exactly as shown in Stripe Dashboard
- No spaces, newlines, or special characters should be added
- The secret format is: `whsec_...` (for test mode) or `whsec_...` (for live mode)
- If you see whitespace errors after this fix, double-check the Vercel environment variable

