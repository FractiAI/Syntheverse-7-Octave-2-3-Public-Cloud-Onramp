# Quick Test Guide for Marek & Simba

**Date:** January 13, 2026  
**Purpose:** Rapid verification of all audit fixes

---

## 🚀 Quick Start (2 Minutes)

### Step 1: Check Operator Console Toggles

**URL:** `https://syntheverse-poc.vercel.app/operator/dashboard`

**Current State (for baseline test):**
- ✅ Seed Multiplier: **OFF**
- ✅ Edge Multiplier: **OFF**
- ✅ Overlap Adjustments: **OFF**

**Expected Behavior:** Score = Composite only (N+D+C+A), no penalties/bonuses

---

### Step 2: Run Test Evaluation

**Pick any test submission** (or create new one):

```bash
# Example hash from your tests:
HASH="7bcba7f8..."

# Trigger evaluation:
curl -X POST https://syntheverse-poc.vercel.app/api/evaluate/${HASH}

# Retrieve result:
curl https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH} | jq '.'
```

---

### Step 3: Verify Zero-Delta

**One-line check:**

```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{pod: .pod_score, atomic: .atomic_score.final, match: (.pod_score == .atomic_score.final)}'
```

**Expected output:**
```json
{
  "pod": 8600,
  "atomic": 8600,
  "match": true
}
```

---

## 🔍 Detailed Verification Checklist

### ✅ Issue #1: Timestamp Ghost

**Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.metadata.scoring_metadata.evaluation_timestamp'
```

**Expected:**
- ✅ Timestamp shows **2026** (current year)
- ✅ Timestamp is **recent** (within last few minutes of evaluation)
- ❌ NO timestamps showing `2023-12-01T12:00:00Z`

---

### ✅ Issue #2: Computed vs Applied Clarity

**Check UI at:** `https://syntheverse-poc.vercel.app/submit`

**With Overlap Toggle OFF:**
- Overlap > 30% should show: **"⚠ Excess Overlap Detected (Computed, toggle OFF)"**
- Overlap 9.2-19.2% should show: **"⚡ Sweet Spot Detected (Computed, toggle OFF)"**

**With Overlap Toggle ON:**
- Overlap > 30% should show: **"⚠ Excess Overlap Detected (Penalty Applied)"**
- Overlap 9.2-19.2% should show: **"⚡ Sweet Spot Detected (Bonus Applied)"**

---

### ✅ Issue #3: Precision Tracking

**Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.atomic_score.trace'
```

**Expected fields:**
```json
{
  "penalty_percent": 16.1765,
  "penalty_percent_exact": 16.1765,
  "intermediate_steps": {
    "after_penalty": 7210.456,
    "after_penalty_exact": 7210.456,
    "raw_final": 8345.234,
    "clamped_final": 8345
  }
}
```

**Verify:**
- ✅ `penalty_percent_exact` exists
- ✅ `after_penalty_exact` exists
- ✅ Full precision preserved (not rounded to 2 decimals)

---

### ✅ Issue #4: Atomic Synchronization

**Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{
    pod_score: .pod_score,
    atomic_final: .atomic_score.final,
    metadata_pod: .metadata.pod_score,
    all_match: ((.pod_score == .atomic_score.final) and (.metadata.pod_score == .atomic_score.final))
  }'
```

**Expected:**
```json
{
  "pod_score": 8600,
  "atomic_final": 8600,
  "metadata_pod": 8600,
  "all_match": true
}
```

**Verify:**
- ✅ `pod_score` == `atomic_score.final`
- ✅ `metadata.pod_score` == `atomic_score.final`
- ✅ All three values IDENTICAL (Zero-Delta)

---

### ✅ Issue #5: Explicit Overlap Fields

**Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.metadata.score_trace | {
    overlap_percent,
    penalty_percent_computed,
    penalty_percent_applied,
    penalty_difference_reason,
    bonus_multiplier_computed,
    bonus_multiplier_applied,
    bonus_difference_reason
  }'
```

**Expected (toggles OFF):**
```json
{
  "overlap_percent": 44.3,
  "penalty_percent_computed": 4.4,
  "penalty_percent_applied": 0,
  "penalty_difference_reason": "Overlap adjustments disabled via config toggle - penalty computed but not applied",
  "bonus_multiplier_computed": 1.05,
  "bonus_multiplier_applied": 1.0,
  "bonus_difference_reason": "Overlap adjustments disabled via config toggle - bonus computed but not applied (1.0 used)"
}
```

**Verify:**
- ✅ `penalty_percent_computed` exists
- ✅ `penalty_percent_applied` exists
- ✅ `penalty_difference_reason` explains why they differ
- ✅ Same structure for bonus multipliers

---

## 🧪 Test Scenarios

### Scenario A: Toggles OFF (Baseline)

**Setup:**
1. Go to Operator Console
2. Turn ALL toggles OFF
3. Submit/evaluate test PoC

**Expected:**
- Overlap measured: **YES** (e.g., 44.3%)
- Penalty computed: **YES** (e.g., 4.4%)
- Penalty applied: **NO** (0%)
- Final score: **Composite only** (8600)
- UI message: **"(Computed, toggle OFF)"**

---

### Scenario B: Overlap Toggle ON (Real Test)

**Setup:**
1. Go to Operator Console
2. Turn Overlap Adjustments **ON**
3. Keep Seed/Edge **OFF**
4. Re-evaluate Test 2 (high overlap case)

**Expected:**
- Overlap measured: **85.0%**
- Penalty computed: **65.4%**
- Penalty applied: **65.4%**
- Final score: **~2976** (8600 × 0.346)
- UI message: **"(Penalty Applied)"**

**Zero-Delta Check:**
```bash
# All should show ~2976:
DB:  atomic_score.final = 2976
API: pod_score = 2976
UI:  Final Score = 2976
```

---

### Scenario C: All Toggles ON (Full System)

**Setup:**
1. Turn ALL toggles ON
2. Submit seed/edge content with overlap

**Expected:**
- Seed multiplier: **1.15** (if detected)
- Edge multiplier: **1.12** (if detected)
- Overlap bonus/penalty: **Applied**
- Final score: **Composite × penalties × bonuses × seed × edge**
- All values in trace explicit

---

## 🔥 Red Flags (What Should NOT Happen)

❌ **Timestamp shows 2023**  
❌ **UI says "Penalty Applied" when toggle is OFF**  
❌ **pod_score ≠ atomic_score.final**  
❌ **penalty_percent_computed missing**  
❌ **Rounded values used for recomputation**  
❌ **Multiple "final scores" with different values**

---

## 📊 Evidence Packet Checklist

For each test run, capture:

1. **Operator Console Screenshot** (showing toggle states)
2. **API Response JSON** (`/api/archive/contributions/<HASH>`)
3. **UI Screenshot** (showing final score and messages)
4. **Zero-Delta Verification** (jq command output)
5. **Timestamp Verification** (showing 2026, not 2023)

---

## 🚨 If Something Fails

**Capture:**
1. Full API response JSON
2. Operator console toggle states
3. Submission hash
4. Expected vs actual values

**Send to:** Engineering team with subject "Audit Verification Failure"

---

## ✅ Success Criteria

**All tests pass if:**

1. ✅ Zero timestamps show 2023
2. ✅ UI messages match toggle states
3. ✅ Full precision in `*_exact` fields
4. ✅ `pod_score` == `atomic_score.final` (always)
5. ✅ Computed vs applied fields explicit
6. ✅ Overlap toggle OFF → penalty_applied = 0
7. ✅ Overlap toggle ON → penalty_applied = penalty_computed

---

## 🎯 Quick Commands Reference

**Zero-Delta Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{pod: .pod_score, atomic: .atomic_score.final, match: (.pod_score == .atomic_score.final)}'
```

**Timestamp Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.metadata.scoring_metadata.evaluation_timestamp'
```

**Precision Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.atomic_score.trace | {penalty_exact: .penalty_percent_exact, after_penalty_exact: .intermediate_steps.after_penalty_exact}'
```

**Overlap Fields Check:**
```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '.metadata.score_trace | {computed: .penalty_percent_computed, applied: .penalty_percent_applied, reason: .penalty_difference_reason}'
```

---

**Happy Testing!**

— Engineering Team

