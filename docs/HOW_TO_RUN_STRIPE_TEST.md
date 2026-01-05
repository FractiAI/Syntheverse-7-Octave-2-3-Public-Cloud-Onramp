# Quick Guide: How to Run the Stripe Live Mode Test

## 🚀 Fastest Method: Browser Console

1. **Log in** to https://syntheverse-poc.vercel.app
2. **Open DevTools**: Press `F12` (or `Cmd+Option+I` on Mac)
3. **Click the Console tab**
4. **Paste this code and press Enter:**

```javascript
fetch('/api/test/stripe-small', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount_cents: 50 })
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Success!', data);
    if (data.checkout_url) {
      window.open(data.checkout_url, '_blank');
      console.log('🔗 Opening Stripe Checkout...');
    }
  })
  .catch(err => console.error('❌ Error:', err));
```

5. **A new tab will open** with Stripe Checkout for $0.50
6. **Complete the payment** with a real credit card
7. **Check Stripe Dashboard** to verify the transaction

## ✅ What to Expect

- **Success**: You'll see a JSON response with `checkout_url`
- **Error**: Check the console message - usually means you're not logged in

## ⚠️ Important Notes

- **Real Charge**: This will charge $0.50 USD to your card (live mode)
- **Minimum Amount**: Stripe requires at least $0.50 (50 cents)
- **Authentication**: Must be logged in to run the test
- **Refund**: You can refund test transactions in Stripe Dashboard if needed

## 🔍 Verify in Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Navigate to **Payments**
3. Look for a $0.50 payment
4. Check the payment details

---

**That's it!** The test is complete when you see the payment in Stripe Dashboard.

