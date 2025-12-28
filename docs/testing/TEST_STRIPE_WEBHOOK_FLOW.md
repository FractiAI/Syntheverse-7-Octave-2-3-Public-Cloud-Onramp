# 🧪 Testing Stripe Webhook Flow on Vercel

This guide helps you verify that the entire Stripe → Hard Hat blockchain → Token allocation → UI update flow is working correctly on Vercel.

## Prerequisites

1. ✅ Vercel deployment is live
2. ✅ Stripe webhook endpoint is configured and pointing to: `https://your-app.vercel.app/webhook/stripe`
3. ✅ `STRIPE_WEBHOOK_SECRET` is set in Vercel environment variables
4. ✅ Database is accessible from Vercel
5. ✅ Hard Hat blockchain registration is configured

---

## Step 1: Verify Webhook Configuration

### Check Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. Verify:
   - ✅ **Endpoint URL** matches your Vercel deployment URL
   - ✅ **Status** shows "Enabled" (green)
   - ✅ **Events** includes `checkout.session.completed`
   - ✅ **Recent events** shows successful deliveries (200 status)

### Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify:
   - ✅ `STRIPE_SECRET_KEY` is set
   - ✅ `STRIPE_WEBHOOK_SECRET` is set (starts with `whsec_`)
   - ✅ `DATABASE_URL` is set
   - ✅ All required environment variables are configured

---

## Step 2: Test End-to-End Flow

### 2.1 Submit a PoC

1. Go to your Vercel deployment
2. Navigate to the submission page
3. Fill out the form and upload a PDF
4. Submit the PoC
5. **Verify:**
   - ✅ Submission is evaluated and shows scores
   - ✅ Status shows "Qualified" or "Unqualified"
   - ✅ You see the evaluation results

### 2.2 Complete Stripe Payment

1. Click "Register PoC" or the registration button
2. Complete the Stripe checkout process
3. Use a test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
4. Complete the payment
5. **Verify:**
   - ✅ You are redirected back to the dashboard with `?registration=success&hash=...` in the URL

---

## Step 3: Check Webhook Execution

### 3.1 Check Stripe Dashboard

1. Go to Stripe Dashboard → Webhooks → Your Webhook
2. Click on "Recent events" tab
3. Find the most recent `checkout.session.completed` event
4. **Verify:**
   - ✅ Status shows "Succeeded" (green)
   - ✅ Response shows `200 OK`
   - ✅ Timestamp is recent (within last few minutes)

### 3.2 Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `/webhook/stripe`
3. View the logs for the most recent invocation
4. **Look for:**
   - ✅ `StripeWebhook: Checkout session completed` log message
   - ✅ `StripeWebhook: PoC registered on Hard Hat L1 blockchain` log message
   - ✅ `StripeWebhook: Auto-allocation` log messages
   - ❌ **No errors** or 500 status codes

### 3.3 Check Database (Using SQL)

Run the SQL script `scripts/test_webhook_status.sql` in Supabase:

```sql
-- This will show you:
-- 1. Recent contributions and their registration status
-- 2. Recent allocations
-- 3. Epoch balances
-- 4. Tokenomics totals
-- 5. Any contributions that are registered but not allocated
```

**Expected Results:**
- ✅ Contribution shows `registered = true`
- ✅ `registration_date` is set
- ✅ `stripe_payment_id` is not null
- ✅ `registration_tx_hash` is set (blockchain transaction)
- ✅ Allocation record exists with correct token amount
- ✅ Epoch balance has decreased
- ✅ `total_distributed` in tokenomics has increased

---

## Step 4: Verify UI Updates

### 4.1 Check Dashboard

1. Go to the dashboard (should already be there after redirect)
2. **Verify:**
   - ✅ Available SYNTH tokens have decreased (reflects allocation)
   - ✅ PoC submission status changed from "Qualified" to "Registered"
   - ✅ Status badge shows "Registered" with the correct metal color
   - ✅ PoC archive shows SYNTH allocation amount
   - ✅ Registration date is displayed

### 4.2 Check PoC Archive

1. Navigate to PoC Archive
2. Find your submission
3. Click to view details
4. **Verify:**
   - ✅ Status shows "Registered" (with metal color badge)
   - ✅ Registration date is shown
   - ✅ Transaction hash is displayed
   - ✅ SYNTH allocation amount is shown
   - ✅ All evaluation details are present

---

## Step 5: Troubleshooting

### Problem: Webhook Not Being Called

**Symptoms:**
- Stripe shows no events in recent events
- Vercel function logs show no invocations

**Solutions:**
1. Verify webhook URL is correct in Stripe Dashboard
2. Check that `STRIPE_WEBHOOK_SECRET` matches the signing secret in Stripe
3. Verify webhook is enabled (not disabled) in Stripe
4. Check that the event `checkout.session.completed` is selected

### Problem: Webhook Returns 400/500 Error

**Symptoms:**
- Stripe shows failed webhook deliveries
- Vercel logs show error messages

**Solutions:**
1. Check Vercel function logs for specific error messages
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check database connection (`DATABASE_URL` is valid)
4. Verify all environment variables are set

### Problem: Database Not Updated

**Symptoms:**
- Webhook succeeds (200 OK) but database shows no changes
- Registration status remains false

**Solutions:**
1. Run `scripts/test_webhook_status.sql` to check database state
2. Check Vercel logs for database errors
3. Verify `DATABASE_URL` is correct and database is accessible
4. Check if contribution exists (submission_hash matches)

### Problem: UI Not Updating

**Symptoms:**
- Database shows registered = true
- But dashboard still shows "Qualified"

**Solutions:**
1. Hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Check browser console for errors
3. Verify polling is working (check console logs for polling messages)
4. Check network tab for API calls to `/api/archive/contributions`
5. Manually refresh the page

### Problem: Allocation Not Happening

**Symptoms:**
- Registration succeeds
- But no allocation record created
- Epoch balance not decreased

**Solutions:**
1. Check Vercel logs for allocation errors
2. Verify contribution has valid scores (novelty, density, coherence, alignment, pod_score)
3. Check if contribution is qualified for current epoch
4. Verify epoch balance is sufficient for allocation
5. Check for errors in `calculateProjectedAllocation` function

---

## Step 6: Manual Verification Checklist

After completing a test registration, verify:

- [ ] Stripe payment completed successfully
- [ ] Webhook event received (check Stripe Dashboard)
- [ ] Webhook processed successfully (check Vercel logs)
- [ ] Contribution `registered` field = `true` (check database)
- [ ] Contribution `registration_date` is set (check database)
- [ ] Contribution `stripe_payment_id` is set (check database)
- [ ] Contribution `registration_tx_hash` is set (check database)
- [ ] Allocation record created (check database)
- [ ] Allocation amount is correct (check database)
- [ ] Epoch balance decreased (check database)
- [ ] Tokenomics `total_distributed` increased (check database)
- [ ] Dashboard shows updated available tokens
- [ ] Dashboard shows "Registered" status
- [ ] PoC archive shows allocation amount
- [ ] Status badge shows correct metal color

---

## Step 7: Test Scripts

### SQL Verification Script

Run `scripts/test_webhook_status.sql` in Supabase SQL Editor to check:
- Recent contributions and registration status
- Recent allocations
- Epoch balances
- Tokenomics totals
- Contributions registered but not allocated

### Console Debugging

Open browser console and look for:
- `[Poll X/15] Registration status:` messages (should show `registered: true` eventually)
- `[EpochInfo Poll X/15] Refreshing epoch info` messages
- Any error messages

---

## Expected Timeline

- **0-2 seconds**: Stripe payment completes, redirects to dashboard
- **2-5 seconds**: Stripe sends webhook to Vercel
- **5-10 seconds**: Webhook processes, updates database, creates allocation
- **10-15 seconds**: Frontend polling detects changes, UI updates

If updates don't appear within 30 seconds, check:
1. Webhook delivery in Stripe Dashboard
2. Vercel function logs for errors
3. Database state using SQL script

---

## Next Steps

After successful testing:

1. ✅ Monitor webhook delivery rates in Stripe Dashboard
2. ✅ Set up alerts for webhook failures in Stripe
3. ✅ Monitor Vercel function logs for errors
4. ✅ Test with multiple submissions to verify tokenomics calculations
5. ✅ Test epoch transitions when allocations exhaust epoch balance

