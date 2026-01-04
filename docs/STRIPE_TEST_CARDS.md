# Stripe Test Card Numbers

## Overview

When testing PoC registration in Stripe test mode, use these test card numbers. These cards will work with any expiry date, CVC, and ZIP code in test mode.

## Test Cards

### ✅ Successful Payment

**Card Number:** `4242 4242 4242 4242`

- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

**Use Case:** Test successful registration flow

---

### ❌ Declined Payment

**Card Number:** `4000 0000 0000 0002`

- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

**Use Case:** Test error handling when payment fails

---

### 🔐 Requires Authentication (3D Secure)

**Card Number:** `4000 0025 0000 3155`

- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

**Use Case:** Test 3D Secure authentication flow

---

### 💳 Other Test Cards

**Visa (Success):**

- `4242 4242 4242 4242`

**Visa (Decline):**

- `4000 0000 0000 0002`

**Visa (Insufficient Funds):**

- `4000 0000 0000 9995`

**Visa (3D Secure):**

- `4000 0025 0000 3155`

**Mastercard (Success):**

- `5555 5555 5555 4444`

**American Express (Success):**

- `3782 822463 10005`

---

## Testing Registration Flow

1. **Navigate to Dashboard**
   - Log in as PoC contributor
   - Find qualified PoC in "My Submissions"

2. **Click "Anchor PoC on-chain - $500"**
   - Should redirect to Stripe checkout

3. **Use Test Card**
   - Enter: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

4. **Complete Payment**
   - Click "Pay $500.00"
   - Should process successfully in test mode

5. **Verify Registration**
   - Should redirect to dashboard with success message
   - PoC should show as "Registered" in archive
   - Check database for:
     - `registered = true`
     - `registration_date` set
     - `stripe_payment_id` populated
     - `registration_tx_hash` set (Hard Hat L1 transaction)

---

## Important Notes

⚠️ **Test Mode Only:** These cards only work when Stripe is in test mode. Check your Stripe dashboard to confirm test mode is enabled.

⚠️ **Live Mode:** If Stripe is in live mode, you'll need real payment methods. **Do not use real cards for testing.**

✅ **No Charges:** Test cards will not charge real money, even if they appear to process successfully.

---

## Verifying Stripe Mode

1. Go to Stripe Dashboard
2. Check the mode toggle (top right)
3. Ensure "Test mode" is enabled
4. Test cards will only work in test mode

---

## Troubleshooting

**Issue:** Card is declined even with test card

- **Solution:** Verify Stripe is in test mode, not live mode

**Issue:** Payment processes but registration doesn't update

- **Solution:** Check Stripe webhook configuration in Vercel
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly

**Issue:** 3D Secure authentication required

- **Solution:** Use card `4000 0025 0000 3155` to test 3D Secure flow
- Or use `4242 4242 4242 4242` which doesn't require 3D Secure
