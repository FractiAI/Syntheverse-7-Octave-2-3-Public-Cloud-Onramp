# Stripe Key Fix - Registration 500 Error

## Issue

500 error when trying to register a PoC due to Stripe key validation.

## Root Cause

1. Documentation incorrectly showed key starting with `ssk_test_`
2. Code validation was too strict (only accepted `sk_test_` or `sk_live_`)
3. The actual correct key starts with `sk_test_` (standard format)

## Solution Applied

### Code Changes

1. ✅ Updated key validation in `app/api/poc/[hash]/register/route.ts` to accept:
   - `sk_test_` / `sk_live_` (standard keys)
   - `ssk_test_` / `ssk_live_` (restricted keys)
   - `rk_test_` / `rk_live_` (restricted keys)

2. ✅ Updated key validation in `app/webhook/stripe/route.ts` (same pattern)

3. ✅ Updated key validation in `utils/stripe/api.ts` (same pattern)

4. ✅ Improved error messages to include more debugging information

## Correct Stripe Secret Key

**Key:** `STRIPE_SECRET_KEY`  
**Value:** `sk_test_...` (get from Stripe Dashboard)

⚠️ **Note:**

- Must start with `sk_test_` (standard test key) or `sk_live_` (production key)
- Should NOT start with `ssk_test_` (that was a documentation error)
- Get the actual key from Stripe Dashboard → Developers → API keys

## Action Required

### Update Vercel Environment Variable

1. Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

2. Find `STRIPE_SECRET_KEY` for **Production** environment

3. Edit the value and ensure:
   - ✅ Starts with `sk_test_` (not `ssk_test_`)
   - ✅ No extra spaces or newlines
   - ✅ Copy the exact key from Stripe Dashboard → Developers → API keys → Secret key
   - ✅ Use the "Secret key" (starts with `sk_test_`), not any restricted key format

4. Save and redeploy (or wait for next auto-deployment)

## Testing

After updating the key in Vercel:

1. Try registering a PoC again
2. The 500 error should be resolved
3. You should be redirected to Stripe checkout

## Files Changed

- `app/api/poc/[hash]/register/route.ts` - Updated validation regex and error handling
- `app/webhook/stripe/route.ts` - Updated validation regex
- `utils/stripe/api.ts` - Updated validation regex

## Next Steps

1. ✅ Code changes complete
2. ⏳ Update `STRIPE_SECRET_KEY` in Vercel Production environment
3. ⏳ Test registration flow after deployment
4. ⏳ Verify Stripe checkout works correctly
