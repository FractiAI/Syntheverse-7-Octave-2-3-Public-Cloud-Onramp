# Testing Stripe Live Mode with Small Transactions

This guide explains how to test the Stripe live mode integration using very small transactions.

## Overview

After migrating to Stripe live mode, you can test the integration with minimal transactions. Stripe's minimum transaction amount is **$0.50 USD (50 cents)**.

## Testing Options

### Option 1: Use the Test Endpoint (Recommended)

A dedicated test endpoint is available at `/api/test/stripe-small` that creates a minimal checkout session.

**Endpoint:** `POST /api/test/stripe-small`

**Request Body (optional):**
```json
{
  "amount_cents": 50
}
```

- If `amount_cents` is not provided, defaults to **50 cents ($0.50)**
- Minimum allowed: **50 cents**
- Must be authenticated (requires user login)

**Example using curl:**
```bash
curl -X POST https://syntheverse-poc.vercel.app/api/test/stripe-small \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"amount_cents": 50}'
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "amount_cents": 50,
  "amount_usd": "$0.50",
  "message": "Test checkout session created for $0.50 USD"
}
```

### Option 2: Use Financial Support Endpoint

The financial support endpoint accepts any amount (minimum 50 cents):

**Endpoint:** `POST /api/financial-support/create-checkout`

**Request Body:**
```json
{
  "amount_cents": 50,
  "support_type": "Test Transaction"
}
```

**Example:**
```bash
curl -X POST https://syntheverse-poc.vercel.app/api/financial-support/create-checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "amount_cents": 50,
    "support_type": "Test Transaction"
  }'
```

## Testing Steps

1. **Verify Live Keys are Configured**
   - Check that `STRIPE_SECRET_KEY` starts with `sk_live_` (not `sk_test_`)
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`

2. **Create Test Checkout Session**
   - Use the test endpoint or financial support endpoint
   - Use minimum amount: **50 cents ($0.50)**

3. **Complete Test Payment**
   - Use a real credit card (will charge $0.50)
   - Or use Stripe's test card numbers if in test mode (but we're in live mode now)

4. **Verify Webhook**
   - Check Vercel logs for webhook events
   - Verify webhook secret is configured correctly
   - Check that payment events are processed

5. **Check Stripe Dashboard**
   - Log into Stripe Dashboard
   - View Payments section
   - Verify the test transaction appears

## Important Notes

⚠️ **Live Mode = Real Charges**
- Transactions in live mode will charge real credit cards
- Use small amounts (50 cents minimum) for testing
- Consider refunding test transactions after verification

⚠️ **Minimum Amount**
- Stripe requires minimum $0.50 USD (50 cents) per transaction
- Smaller amounts will be rejected by Stripe

⚠️ **Authentication Required**
- Both endpoints require user authentication
- Must be logged in to create checkout sessions

## Test Card Numbers (Live Mode)

In live mode, you cannot use test card numbers. You must use real credit cards. However, you can:

1. Use a real card with a small amount ($0.50)
2. Refund the transaction after testing
3. Use Stripe's "Refund" feature in the dashboard

## Verifying Success

After completing a test transaction:

1. ✅ Checkout session created successfully
2. ✅ Payment processed in Stripe Dashboard
3. ✅ Webhook received and processed (check Vercel logs)
4. ✅ Success redirect works correctly
5. ✅ Payment appears in Stripe Dashboard → Payments

## Troubleshooting

### Error: "Amount too small"
- **Solution:** Use at least 50 cents (5000 = $50.00 is wrong, use 50 = $0.50)

### Error: "Live keys required"
- **Solution:** Verify `STRIPE_SECRET_KEY` starts with `sk_live_` in Vercel environment variables

### Error: "Unauthorized"
- **Solution:** Must be logged in. Authenticate first before calling the endpoint.

### Webhook not received
- **Solution:** 
  1. Verify webhook endpoint URL in Stripe Dashboard
  2. Check `STRIPE_WEBHOOK_SECRET` is set correctly
  3. Check Vercel logs for webhook events

## Next Steps

After successful testing:

1. ✅ Verify all payment flows work correctly
2. ✅ Test with different amounts
3. ✅ Verify webhook processing
4. ✅ Monitor Stripe Dashboard for transactions
5. ✅ Consider refunding test transactions if desired

---

**Last Updated:** After Stripe live mode migration  
**Minimum Test Amount:** $0.50 USD (50 cents)

