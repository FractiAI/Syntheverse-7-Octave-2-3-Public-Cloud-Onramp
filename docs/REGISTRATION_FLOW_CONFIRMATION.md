# PoC Registration Flow - Complete Confirmation

## Overview
This document confirms that the entire PoC registration flow is properly implemented, from Stripe payment processing through token allocation, blockchain registration, and dashboard status updates.

## ✅ Registration Flow Steps

### 1. Stripe Payment Processing
**Location**: `app/webhook/stripe/route.ts` - `handleCheckoutSessionCompleted()`

- ✅ Webhook receives `checkout.session.completed` event from Stripe
- ✅ Verifies webhook signature for security
- ✅ Extracts `submission_hash` from session metadata
- ✅ Validates that this is a `poc_registration` type payment
- ✅ Retrieves contribution data from database

### 2. Hard Hat Blockchain Registration
**Location**: `app/webhook/stripe/route.ts` (lines 112-146) → `utils/blockchain/register-poc.ts`

- ✅ Calls `registerPoCOnBlockchain()` function
- ✅ Passes PoC metadata (novelty, density, coherence, alignment, pod_score)
- ✅ Passes metals array
- ✅ Receives blockchain transaction hash and block number
- ✅ Stores `registration_tx_hash` in database
- ✅ Handles blockchain registration failures gracefully (non-fatal, payment still processed)

**Note**: Currently uses mock transactions if `HARDHAT_RPC_URL` is not configured. The structure is in place for actual blockchain integration.

### 3. Database Registration Update
**Location**: `app/webhook/stripe/route.ts` (lines 148-158)

- ✅ Updates `contributionsTable` with:
  - `registered = true`
  - `registration_date = current timestamp`
  - `stripe_payment_id = session.payment_intent`
  - `registration_tx_hash = blockchain transaction hash`
  - `updated_at = current timestamp`

### 4. SYNTH Token Allocation
**Location**: `app/webhook/stripe/route.ts` (lines 160-305)

- ✅ Checks if allocation already exists (prevents duplicates)
- ✅ Verifies PoC is qualified (`metadata.qualified_founder`)
- ✅ Uses `qualified_epoch` from metadata (epoch that was open when PoC qualified)
- ✅ Calculates allocation: `(pod_score / 10000) * available_epoch_balance`
- ✅ Applies metal amplification multiplier
- ✅ For 10,000 score PoC: allocates 100% of available Founder epoch balance (45T SYNTH)
- ✅ Creates allocation record in `allocationsTable`:
  - Records reward amount
  - Records epoch balance before/after
  - Records metal, tier, and multipliers
- ✅ Updates `epochBalancesTable`:
  - Decrements epoch balance by allocated amount
- ✅ Updates `tokenomicsTable`:
  - Increments `total_distributed` by allocated amount
- ✅ Triggers epoch transition if balance exhausted (≤ 1000 tokens remaining):
  - Calls `getOpenEpochInfo()` to transition from Founder → Pioneer → Community → Ecosystem
  - Closes Founder epoch when 45T tokens allocated

### 5. Registration Details Response
**Location**: `app/api/archive/contributions/route.ts` and `app/api/archive/contributions/[hash]/route.ts`

**Archive API** returns:
- ✅ `registered: boolean`
- ✅ `registration_date: ISO string`
- ✅ `registration_tx_hash: string | null`
- ✅ `stripe_payment_id: string | null`
- ✅ `allocated: boolean` (based on allocations table)

**Detail API** returns:
- ✅ All registration fields as above
- ✅ Complete PoC metadata and scores

### 6. Dashboard Status Updates
**Location**: `components/PoCArchive.tsx`

**Status Badge** (`getStatusBadge()` function):
- ✅ Shows "Allocated" (green) if `submission.allocated === true`
- ✅ Shows "Registered" (blue) if `submission.registered === true`
- ✅ Shows "Qualified" (purple) if `submission.qualified === true`
- ✅ Priority order: Allocated > Registered > Qualified

**Detail Dialog**:
- ✅ Displays registration status badge
- ✅ Shows "Blockchain Registration Certificate" section when registered:
  - Transaction Hash (clickable for blockchain explorer - can be enhanced)
  - Registration Date
  - Stripe Payment ID
  - Confirmation message: "Registered on Hard Hat L1 Blockchain"
- ✅ Shows "Register PoC" button only for qualified, unregistered PoCs
- ✅ Shows "Tokens allocated" message when allocated

**Auto-refresh**:
- ✅ Detects `registration=success` in URL parameters after Stripe redirect
- ✅ Automatically refreshes submissions list to show updated status
- ✅ Uses `useEffect` hook to trigger `fetchSubmissions()` on URL param change

## Flow Summary

```
1. User clicks "Register PoC" button
   ↓
2. Frontend calls POST /api/poc/[hash]/register
   ↓
3. API creates Stripe checkout session
   ↓
4. User completes payment on Stripe
   ↓
5. Stripe sends webhook: checkout.session.completed
   ↓
6. Webhook handler:
   a. Verifies payment ✅
   b. Registers PoC on Hard Hat blockchain ✅
   c. Updates database: registered = true, stores tx_hash, payment_id ✅
   d. Calculates and allocates SYNTH tokens based on:
      - PoC pod_score (10,000 = 100% of epoch balance)
      - Qualified epoch (Founder/Pioneer/Community/Ecosystem)
      - Available epoch balance
      - Metal amplification multiplier ✅
   e. Updates epoch balance ✅
   f. Updates tokenomics total_distributed ✅
   g. Triggers epoch transition if balance exhausted ✅
   ↓
7. Stripe redirects user back to dashboard with ?registration=success
   ↓
8. Dashboard detects URL param and refreshes data ✅
   ↓
9. Dashboard displays:
   - "Registered" status badge (blue) ✅
   - Epoch badge (Founder/Pioneer/etc.) ✅
   - Blockchain registration certificate in detail dialog ✅
   - Token allocation status ✅
```

## Database Schema Fields Used

### `contributionsTable`
- `registered: boolean`
- `registration_date: timestamp`
- `registration_tx_hash: string | null`
- `stripe_payment_id: string | null`
- `metadata.qualified_epoch: string` (epoch that was open when PoC qualified)
- `metadata.qualified_founder: boolean`
- `metadata.pod_score: number`

### `allocationsTable`
- `submission_hash: string`
- `contributor: string`
- `epoch: string`
- `reward: string` (allocation amount)
- `metal: string`
- `tier: string`
- `tier_multiplier: string`
- `epoch_balance_before: string`
- `epoch_balance_after: string`

### `epochBalancesTable`
- `epoch: string` (founder/pioneer/community/ecosystem)
- `balance: string` (available SYNTH tokens)

### `tokenomicsTable`
- `total_distributed: string` (cumulative SYNTH tokens allocated)

## Token Allocation Formula

For a registered PoC:

```
baseAllocation = (pod_score / 10000) * available_epoch_balance
amplifiedAllocation = baseAllocation * metal_multiplier
finalAllocation = min(amplifiedAllocation, available_epoch_balance)
```

**Example**: 10,000 score PoC in Founder epoch with 45T available:
- baseAllocation = (10000 / 10000) * 45T = 45T
- If Gold+Silver+Copper: metal_multiplier = 1.5
- amplifiedAllocation = 45T * 1.5 = 67.5T
- finalAllocation = min(67.5T, 45T) = 45T (capped at available balance)

**Note**: The allocation uses `Math.floor()` to ensure integer token amounts.

## Epoch Transition Logic

When epoch balance is exhausted (≤ 1000 tokens remaining after allocation):
- ✅ Calls `getOpenEpochInfo()` to check and update epoch states
- ✅ Closes current epoch
- ✅ Opens next epoch in sequence:
  - Founder → Pioneer
  - Pioneer → Community
  - Community → Ecosystem

## Security & Error Handling

- ✅ Webhook signature verification prevents unauthorized requests
- ✅ Blockchain registration failures are non-fatal (payment still processed)
- ✅ Token allocation failures are logged but don't fail registration
- ✅ Duplicate allocation prevention (checks existing allocations)
- ✅ Balance validation (doesn't allocate more than available)

## Testing Checklist

- [ ] Test Stripe checkout completion
- [ ] Verify webhook receives and processes payment
- [ ] Verify blockchain registration (or mock transaction hash stored)
- [ ] Verify database registration fields updated
- [ ] Verify token allocation calculated correctly
- [ ] Verify epoch balance decremented
- [ ] Verify tokenomics total_distributed incremented
- [ ] Verify epoch transition when balance exhausted
- [ ] Verify dashboard shows "Registered" status
- [ ] Verify blockchain certificate displayed in detail dialog
- [ ] Verify auto-refresh after Stripe redirect

