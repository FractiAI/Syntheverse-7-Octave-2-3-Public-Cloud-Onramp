# Stripe Sandbox Test Cards - Quick Reference

## 🎯 Quick Answer

**Yes, you need test card info for Stripe sandbox testing.**

## 📋 Test Card Numbers (Copy & Paste Ready)

### ✅ Success Card (Most Common)
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

### ❌ Decline Card (Test Errors)
```
Card Number: 4000 0000 0000 0002
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 🔐 3D Secure Card (Test Authentication)
```
Card Number: 4000 0025 0000 3155
Expiry: 12/34
CVC: 123
ZIP: 12345
```

---

## 📍 Where to Find Stripe Test Cards

### Option 1: Stripe Dashboard (Official Source)
1. Go to: https://dashboard.stripe.com/test
2. Click on **"Testing"** in the left sidebar
3. Click **"Testing cards"** or **"Card testing"**
4. You'll see all available test card numbers

### Option 2: Stripe Documentation
- URL: https://stripe.com/docs/testing
- Contains: All test card numbers, test scenarios, and testing guides

### Option 3: Local Documentation
- File: `docs/STRIPE_TEST_CARDS.md` (in this project)
- Contains: Quick reference for common test cards

---

## 🔑 Important: Stripe Test Mode

**Before using test cards, ensure Stripe is in TEST MODE:**

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Check the toggle in the top right corner
3. It should say **"Test mode"** (not "Live mode")
4. Test cards only work in test mode!

---

## 🧪 Testing Registration Flow

1. **Navigate to your PoC in dashboard**
2. **Click "Anchor PoC on-chain - $500"**
3. **Stripe checkout opens**
4. **Enter test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
5. **Click "Pay $500.00"**
6. **Payment processes (no real charge)**
7. **Redirects back to dashboard**
8. **PoC shows as "Registered"**

---

## 📚 Complete Test Card List

See `docs/STRIPE_TEST_CARDS.md` for:
- All available test cards
- Different card types (Visa, Mastercard, Amex)
- Special scenarios (insufficient funds, etc.)
- Troubleshooting guide

---

## ⚠️ Important Notes

- ✅ Test cards work in **test mode only**
- ✅ No real money is charged
- ✅ Use for development and testing
- ❌ Don't use test cards in live mode
- ❌ Don't use real cards for testing

---

## 🔗 Quick Links

- **Stripe Test Cards:** https://stripe.com/docs/testing#cards
- **Stripe Testing Guide:** https://stripe.com/docs/testing
- **Stripe Dashboard (Test):** https://dashboard.stripe.com/test

