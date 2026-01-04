# 🔍 How to Find Stripe Webhooks - Step by Step

## Finding the Developer Section in Stripe Dashboard

The "Developers" option might be in a different location depending on your Stripe dashboard view. Here's how to find it:

---

## Method 1: Direct Navigation (Easiest)

### Option A: Use the Direct URL

**For Test Mode:**

```
https://dashboard.stripe.com/test/webhooks
```

**For Live Mode:**

```
https://dashboard.stripe.com/webhooks
```

Just paste this URL in your browser and you'll go straight to webhooks!

---

### Option B: Navigate from Dashboard

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - Make sure you're in **Test mode** (toggle switch in top right should say "Test mode")

2. **Find "Developers" in the Left Sidebar**
   - Look at the left sidebar menu
   - You should see these options:
     - Home
     - Payments
     - Customers
     - Products
     - **Developers** ← This is what you're looking for!
     - Reports
     - Settings
     - etc.

3. **Click "Developers"**
   - Click on **"Developers"** in the left sidebar
   - A submenu will appear or you'll see options including:
     - API keys
     - Webhooks ← Click this!
     - Events
     - Logs
     - etc.

4. **Click "Webhooks"**
   - Click on **"Webhooks"** under Developers
   - You should now see the webhooks page

---

## Method 2: If You Don't See "Developers" Option

If the sidebar is collapsed or you're on mobile:

1. **Look for a Menu Icon**
   - Click the hamburger menu (☰) or menu icon in the top left
   - This will expand the sidebar
   - Look for "Developers"

2. **Search for "Webhooks"**
   - Use the search bar at the top of Stripe Dashboard
   - Type: "webhooks"
   - Click on the "Webhooks" result

3. **Check Your Account Type**
   - Make sure you're logged in with an account that has developer access
   - If you're part of a team, check if you have the right permissions

---

## Method 3: Alternative Routes

If you still can't find it, try these:

1. **Go to Settings First**
   - Click **"Settings"** in the left sidebar
   - Look for "Developers" or "Webhooks" in the settings menu

2. **Use the URL Structure**
   - The webhooks page is always at: `https://dashboard.stripe.com/[test/]webhooks`
   - Add `test/` if you're in test mode
   - Just type this in your browser address bar

---

## Quick Visual Guide

```
Stripe Dashboard Layout:

┌─────────────────────────────────────┐
│  [Stripe Logo]    [Test mode: ON]  │
├──────┬──────────────────────────────┤
│ Home │   Main Content Area          │
│ Paym │                              │
│ Cust │                              │
│ Prod │                              │
│ Dev  │  ← CLICK THIS!               │
│  ↓   │                              │
│  API keys                           │
│  Webhooks ← THEN CLICK THIS!        │
│  Events                             │
│  Logs                               │
│ Report│                              │
│ Sett  │                              │
└──────┴──────────────────────────────┘
```

---

## Once You're on the Webhooks Page

You should see:

1. **"Add endpoint"** button (top right) - Click this to create a webhook
2. A list of existing webhooks (if any)
3. Options to test webhooks, view logs, etc.

---

## What to Do Next (After Finding Webhooks)

### Step 1: Create Webhook Endpoint

1. **Click "+ Add endpoint"** or **"Add endpoint"** button

2. **Enter Endpoint URL:**

   ```
   https://your-app-name.vercel.app/webhook/stripe
   ```

   ⚠️ **Note:** You'll need your Vercel URL first. If you haven't deployed yet, you can:
   - Create the webhook after deployment
   - OR use a placeholder URL for now and update it later

3. **Add Description (optional):**

   ```
   Production webhook for Syntheverse PoC
   ```

4. **Select Events:**
   Click **"Select events"** or **"Add events"** and check:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**

### Step 2: Get the Webhook Secret

1. Click on the webhook you just created
2. Scroll to **"Signing secret"** section
3. Click **"Reveal"** button
4. Copy the secret (starts with `whsec_`)

### Step 3: Add to Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add `STRIPE_WEBHOOK_SECRET` with the `whsec_...` value
3. Redeploy

---

## Quick Links

**Test Mode Webhooks:**

- Direct link: https://dashboard.stripe.com/test/webhooks

**Live Mode Webhooks:**

- Direct link: https://dashboard.stripe.com/webhooks

**Test Mode Dashboard:**

- https://dashboard.stripe.com/test

**Live Mode Dashboard:**

- https://dashboard.stripe.com

---

## Troubleshooting

### "I still can't find Developers"

1. **Try the direct URL:** https://dashboard.stripe.com/test/webhooks
2. **Check if you're logged in** to the correct Stripe account
3. **Clear browser cache** and refresh
4. **Try a different browser**
5. **Check your account permissions** - you might need admin access

### "The page shows an error"

- Make sure you're using the correct mode (test vs live)
- Try logging out and back in
- Check your internet connection

### "I see the page but no 'Add endpoint' button"

- Make sure you have permission to create webhooks
- Try refreshing the page
- Check if you're in the right account/team

---

## Screenshot Locations (What to Look For)

When you're in Stripe Dashboard, look for:

1. **Left Sidebar:** Vertical menu on the left side
2. **"Developers"** text/link in that sidebar
3. **"Webhooks"** option under Developers (or as a submenu item)
4. **"Add endpoint"** or **"+ Add endpoint"** button (usually top right)

---

**Can't find it?** Just use the direct URL: https://dashboard.stripe.com/test/webhooks

This will take you straight to the webhooks page! 🎯
