# 📋 Stripe Webhook Events to Select

## Required Events for Your App

Based on your webhook handler code, here are the events you should select:

---

## ✅ Required Events (Select These)

### 1. `checkout.session.completed`
- **When:** Customer successfully completes a checkout session
- **Why:** Needed to track when users complete their subscription purchase
- **Status:** ✅ Required

### 2. `customer.subscription.created`
- **When:** A new subscription is created
- **Why:** Your code handles this - updates user plan in database
- **Status:** ✅ Required (handled in your code)

### 3. `customer.subscription.updated`
- **When:** Subscription is updated (plan change, billing cycle, etc.)
- **Why:** Your code handles this - updates user plan in database
- **Status:** ✅ Required (handled in your code)

### 4. `customer.subscription.deleted`
- **When:** Subscription is canceled or deleted
- **Why:** Your code handles this - logs subscription deletion
- **Status:** ✅ Required (handled in your code)

### 5. `invoice.payment_succeeded`
- **When:** An invoice payment succeeds (recurring billing)
- **Why:** Important for tracking successful recurring payments
- **Status:** ✅ Recommended

### 6. `invoice.payment_failed`
- **When:** An invoice payment fails (recurring billing)
- **Why:** Important for handling failed payments and notifying users
- **Status:** ✅ Recommended

---

## Complete List to Select in Stripe

When creating your webhook in Stripe Dashboard, select these events:

```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

---

## How to Select Events in Stripe Dashboard

1. **Click "Select events"** or **"Add events"** button
2. **Search or scroll** to find each event
3. **Check the box** next to each event listed above
4. **Click "Add events"** when done
5. **Click "Add endpoint"** to create the webhook

---

## Event Categories (Where to Find Them)

### Checkout Events
- `checkout.session.completed` ← Find this here

### Customer Subscription Events
- `customer.subscription.created` ← Find this here
- `customer.subscription.updated` ← Find this here
- `customer.subscription.deleted` ← Find this here

### Invoice Events
- `invoice.payment_succeeded` ← Find this here
- `invoice.payment_failed` ← Find this here

---

## What Your Code Does with Each Event

### Your webhook handler (`app/webhook/stripe/route.ts`) handles:

**`customer.subscription.created` & `customer.subscription.updated`:**
```typescript
// Updates user's plan in database
await db.update(usersTable)
    .set({ plan: event.data.object.id })
    .where(eq(usersTable.stripe_id, (event.data.object as any).customer));
```

**`customer.subscription.deleted`:**
```typescript
// Logs subscription cancellation
console.log('Subscription deleted:', event.data.object.id)
```

**Other events:**
- `checkout.session.completed` - Useful for tracking completions
- `invoice.payment_succeeded` - Track successful recurring payments
- `invoice.payment_failed` - Handle failed payments (you may want to add logic for this)

---

## Optional Events (You Can Add Later)

These are not required but might be useful:

- `payment_intent.succeeded` - Track successful one-time payments
- `payment_intent.payment_failed` - Track failed payments
- `customer.created` - Track when new customers are created
- `customer.updated` - Track customer updates

**For now, stick with the 6 required events listed above.**

---

## Quick Checklist

When selecting events in Stripe, make sure you check:

- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

---

## Screenshot Guide

In Stripe Dashboard when selecting events:

1. You'll see a list or search box
2. Type the event name (e.g., "checkout.session.completed")
3. Check the box next to it
4. Repeat for all 6 events
5. Click "Add events" or "Add endpoint"

---

**These 6 events are all you need for your Syntheverse PoC Contributor UI!** ✅

