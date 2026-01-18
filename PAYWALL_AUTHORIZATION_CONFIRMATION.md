# Paywall Authorization & Tester Bypass - Confirmation

**Status:** ✅ **CONFIRMED**  
**Date:** January 17, 2025

---

## ✅ Confirmation Summary

**Question 1:** Does the paywall authorize API access?  
**Answer:** ✅ **YES** - Payment must succeed before evaluation (API access) is authorized.

**Question 2:** Are testers bypassed from paywall?  
**Answer:** ✅ **YES** - Creators and Operators (testers) bypass payment entirely and get direct API access.

---

## 🔐 Paywall Authorization Flow

### For Regular Users (Non-Testers)

**Flow:**
1. User submits contribution → Status: `payment_pending`
2. Stripe checkout session created ($500 submission fee)
3. User completes payment via Stripe
4. **Stripe Webhook** (`checkout.session.completed`) receives payment confirmation
5. Webhook **authorizes API access** by:
   - Updating status: `payment_pending` → `evaluating`
   - Marking payment as `completed` in metadata
   - **Triggering evaluation** (API access granted)

**Code Location:** `app/webhook/stripe/route.ts` (lines 189-297)

**Key Logic:**
```typescript
// Lines 217-230: Update status after payment
await db.update(contributionsTable)
  .set({
    status: 'evaluating',  // Payment authorizes evaluation
    metadata: {
      ...metadata,
      payment_status: 'completed',
      payment_completed_at: new Date().toISOString(),
    }
  })
  .where(eq(contributionsTable.submission_hash, submissionHash));

// Lines 238-287: Trigger evaluation (API access granted)
const evaluateUrl = `${baseUrl}/api/evaluate/${submissionHash}`;
fetch(evaluateUrl, { method: 'POST' });
```

**Authorization Mechanism:**
- ✅ Payment **MUST succeed** before evaluation is triggered
- ✅ No evaluation without successful payment
- ✅ Paywall **authorizes** API access via webhook confirmation

---

## 🚀 Tester Bypass Flow

### For Creators/Operators (Testers)

**Flow:**
1. Creator/Operator submits contribution
2. System checks role via `getAuthenticatedUserWithRole()`
3. **Payment bypass** detected (`isCreator || isOperator`)
4. Status set directly to `evaluating` (skips payment)
5. **Evaluation triggered immediately** (API access granted without payment)

**Code Location:** `app/api/submit/route.ts` (lines 287-384)

**Key Logic:**
```typescript
// Lines 287-289: Check if exempt from payment
const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
const isExemptFromPayment = isCreator || isOperator;

// Lines 291-384: Bypass payment if exempt
if (isExemptFromPayment) {
  // Save submission directly with evaluating status
  await db.insert(contributionsTable).values({
    status: 'evaluating',  // Direct to evaluation
    metadata: {
      payment_status: isCreator ? 'creator_exempt' : 'operator_exempt',
      creator_mode: isCreator,
      operator_mode: isOperator,
    },
  });

  // Trigger evaluation immediately (no payment required)
  const evaluateUrl = `${baseUrl}/api/evaluate/${submissionHash}`;
  fetch(evaluateUrl, { method: 'POST' });
}
```

**Bypass Mechanism:**
- ✅ Creators (`info@fractiai.com`) - **Always bypassed**
- ✅ Operators (users with `role='operator'` in database) - **Always bypassed**
- ✅ No Stripe checkout created
- ✅ Direct API access without payment

---

## 🎯 Role Detection

**File:** `utils/auth/permissions.ts`

**Creator:**
- Hard-coded: `info@fractiai.com`
- Always exempt from payment

**Operator:**
- Checked in database: `usersTable.role = 'operator'`
- Always exempt from payment

**Regular User:**
- Default role: `'user'`
- Must complete payment to access API

**Detection Logic:**
```typescript
export async function getAuthenticatedUserWithRole() {
  const role = await getUserRole(user.email);
  const isCreatorRole = role === 'creator';
  const isOperatorRole = role === 'operator' || isCreatorRole;
  
  return {
    isCreator: isCreatorRole,
    isOperator: isOperatorRole,
  };
}
```

---

## 📋 Protected Endpoints with Paywall Authorization

### Main Submission API
- **Endpoint:** `POST /api/submit`
- **Paywall:** ✅ Yes (except creators/operators)
- **Authorization:** Payment required → Webhook confirms → Evaluation triggered

### Enterprise Submission API
- **Endpoint:** `POST /api/enterprise/submit`
- **Paywall:** ✅ Yes (except creators/operators)
- **Authorization:** Payment required → Webhook confirms → Evaluation triggered

### FieldScan Checkout API
- **Endpoint:** `POST /api/fieldscan/create-checkout`
- **Paywall:** ✅ Yes (except creators/operators)
- **Bypass:** Creators/operators get access without payment

### SynthScan Checkout API
- **Endpoint:** `POST /api/synthscan/create-checkout`
- **Paywall:** ✅ Yes (except creators/operators)
- **Bypass:** Creators/operators get access without payment

---

## 🔄 Payment Authorization Process

### Step 1: Submission (Regular User)
```
User submits → Status: payment_pending → Stripe checkout created
```

### Step 2: Payment
```
User pays → Stripe processes payment → Payment succeeds
```

### Step 3: Authorization (Webhook)
```
Stripe webhook → checkout.session.completed → 
  Status: payment_pending → evaluating →
  Payment status: completed →
  Evaluation triggered (API access authorized)
```

### Step 4: API Access Granted
```
Evaluation endpoint called → AI evaluation runs → 
  Results stored → User gets evaluation results
```

---

## 🚀 Tester Bypass Process

### Step 1: Submission (Creator/Operator)
```
Creator/Operator submits → Role detected → isExemptFromPayment = true
```

### Step 2: Bypass Payment
```
Payment check skipped → No Stripe checkout created →
  Status: evaluating (direct) →
  Metadata: creator_exempt / operator_exempt
```

### Step 3: Direct API Access
```
Evaluation triggered immediately → 
  No payment required → 
  API access granted immediately
```

---

## 📊 Summary Table

| User Type | Payment Required | Authorization Method | Evaluation Trigger |
|-----------|------------------|---------------------|-------------------|
| **Regular User** | ✅ Yes ($500) | Stripe Webhook | After payment success |
| **Creator** | ❌ No | Role-based bypass | Immediately |
| **Operator** | ❌ No | Role-based bypass | Immediately |

---

## ✅ Final Confirmation

1. **Paywall authorizes API access?** ✅ **YES**
   - Payment must succeed before evaluation is triggered
   - Webhook confirms payment and authorizes evaluation
   - No API access without successful payment (for regular users)

2. **Testers are bypassed?** ✅ **YES**
   - Creators always bypass payment
   - Operators always bypass payment
   - Testers get immediate API access without payment

3. **Authorization mechanism is secure?** ✅ **YES**
   - Payment verification via Stripe webhook
   - Tester roles verified via database/permissions
   - No way to bypass payment without creator/operator role

---

**Status:** ✅ **CONFIRMED - Paywall Authorizes API Access, Testers Bypassed**
