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

## How to Run the Test

### Method 1: Browser Console (Easiest) ⭐

This is the easiest method - just use your browser's developer tools:

1. **Log into your application**
   - Go to https://syntheverse-poc.vercel.app (or your localhost if testing locally)
   - Sign in with your account (Google OAuth or email/password)

2. **Open Browser Developer Tools**
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - **Safari**: Press `Cmd+Option+I` (enable Developer menu first: Preferences → Advanced → Show Develop menu)

3. **Go to Console Tab**
   - Click on the "Console" tab in Developer Tools

4. **Run this JavaScript code:**
   ```javascript
   fetch('/api/test/stripe-small', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ amount_cents: 50 })
   })
     .then((res) => res.json())
     .then((data) => {
       console.log('✅ Test Results:', data);
       if (data.checkout_url) {
         console.log('🔗 Checkout URL:', data.checkout_url);
         console.log('💡 Open this URL in a new tab to complete the test payment');
         // Optionally open automatically:
         // window.open(data.checkout_url, '_blank');
       }
     })
     .catch((err) => console.error('❌ Error:', err));
   ```

5. **Check the Results**
   - If successful, you'll see the checkout URL in the console
   - Copy the URL or click it to open Stripe Checkout
   - Complete the payment with a real credit card ($0.50 will be charged)
   - Verify the transaction in Stripe Dashboard

### Method 2: Using curl (Advanced)

If you prefer command-line testing:

1. **Log into your application in a browser**

2. **Copy your session cookie**
   - Open Developer Tools → Application tab (Chrome) or Storage tab (Firefox)
   - Go to Cookies → Your domain
   - Find cookie named `sb-jfbgdxeumzqzigptbmvp-auth-token`
   - Copy the entire cookie value

3. **Run curl command:**
   ```bash
   curl -X POST https://syntheverse-poc.vercel.app/api/test/stripe-small \
     -H "Content-Type: application/json" \
     -H "Cookie: sb-jfbgdxeumzqzigptbmvp-auth-token=YOUR_COOKIE_VALUE_HERE" \
     -d '{"amount_cents": 50}' \
     | jq '.'
   ```

   (Replace `YOUR_COOKIE_VALUE_HERE` with the actual cookie value)

**Expected Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_live_...",
  "amount_cents": 50,
  "amount_usd": "$0.50",
  "message": "Test checkout session created for $0.50 USD"
}
```

### Method 3: Create a Test Button (For Multiple Tests)

You can create a simple test page with a button:

1. **Create a test file** (e.g., `app/test-stripe/page.tsx`):

```typescript
'use client';

import { useState } from 'react';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/stripe-small', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount_cents: 50 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
      
      // Open checkout URL automatically
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Stripe Live Mode</h1>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating checkout...' : 'Test Small Transaction ($0.50)'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">Success!</h3>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.checkout_url && (
            <a
              href={result.checkout_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Open Checkout
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

2. **Navigate to** `/test-stripe` in your browser (after logging in)
3. **Click the button** to run the test

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

