# THALET Test Quick Reference Card

**For:** Marek, Simba, Pablo, Lexary Nova, and all auditors  
**Date:** January 12, 2026  
**Status:** Test harness fixed and operational

---

## 🚀 Quick Test (30 Seconds)

### Browser Method (No Tools Required)

1. **Open URL:**
   ```
   https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a
   ```

2. **Search for these strings (Cmd+F / Ctrl+F):**
   - `"atomic_score"` → Must exist ✅
   - `"final"` → Must be inside atomic_score ✅
   - `"pod_score"` → Must exist at top level ✅
   - `"integrity_hash"` → Must be 64 characters ✅

3. **Verify Zero-Delta:**
   - Find `"pod_score": 8600`
   - Find `"atomic_score": { "final": 8600 }`
   - Values must match ✅

**If all checks pass → THALET is operational** ✅

---

## 🧪 Command-Line Tests

### Test 1: Single Submission Verification

```bash
cd /path/to/repo
./scripts/verify-thalet-emission.sh 9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a
```

**Expected output:**
```
🎯 VERDICT: THALET IS EMITTING CORRECTLY
✅ atomic_score.final: 8600
✅ pod_score matches atomic_score.final: 8600
```

**If you see this → THALET is working** ✅

---

### Test 2: Comprehensive Test Suite

```bash
cd /path/to/repo
./scripts/comprehensive-thalet-test.sh
```

**Expected output:**
```
Total Tests:  15
Passed:       15
Failed:       0

✅ ALL TESTS PASSED ✅
THALET PROTOCOL COMPLIANCE VERIFIED
```

**If you see this → Full compliance confirmed** ✅

---

## 🔍 Manual Verification (Using curl + jq)

### Check Zero-Delta

```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a" | \
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

### Check Integrity Hash

```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a" | \
  jq '.atomic_score.integrity_hash | length'
```

**Expected output:**
```
64
```

(SHA-256 hash is always 64 characters)

---

### Check Execution Context

```bash
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a" | \
  jq '.atomic_score.execution_context'
```

**Expected output:**
```json
{
  "toggles": {
    "overlap_on": true,
    "seed_on": true,
    "edge_on": true,
    "metal_policy_on": true
  },
  "seed": "...",
  "timestamp_utc": "2026-01-12T...",
  "pipeline_version": "2.0.0-thalet",
  "operator_id": "syntheverse-primary"
}
```

---

## 📋 THALET Compliance Checklist

Use this for any submission hash:

```
Submission Hash: _______________________________

[ ] atomic_score exists at top level
[ ] atomic_score.final is a number in [0, 10000]
[ ] atomic_score.integrity_hash is 64 characters
[ ] atomic_score.execution_context exists
[ ] atomic_score.execution_context.timestamp_utc is recent (2026)
[ ] atomic_score.execution_context.toggles is populated
[ ] atomic_score.trace exists with formula
[ ] pod_score exists at top level
[ ] pod_score == atomic_score.final (Zero-Delta)
[ ] metadata.atomic_score == atomic_score (redundant storage)

If all checked → THALET COMPLIANT ✅
```

---

## 🐛 Common Issues & Solutions

### Issue: "404 Not Found"

**Cause:** Using wrong endpoint

**Wrong:** `/api/contributions/<hash>`  
**Right:** `/api/archive/contributions/<hash>`

**Fix:** Update your test script to use correct endpoint

---

### Issue: "pod_score is null"

**Cause:** Old submission (pre-THALET) or not yet evaluated

**Solution:**
1. Check if `atomic_score` exists
2. If yes: Use `atomic_score.final` as sovereign value
3. If no: Re-evaluate submission to generate THALET data

---

### Issue: "atomic_score is null"

**Cause:** Submission created before THALET implementation

**Solution:** Submit fresh test PoC to trigger new evaluation with THALET

---

### Issue: "Submission failed"

**Cause:** Not a THALET issue — it's auth/payment

**Check:**
1. Are you logged in to Supabase?
2. Do you have `operator` role in users table?
3. Are Stripe env vars configured?

**Fix:** Set operator role in Supabase:
```sql
UPDATE users SET role = 'operator' WHERE email = 'your-email@example.com';
```

---

## 🎯 What Each Field Means

### `atomic_score.final`
- **Range:** [0, 10000]
- **Type:** Number
- **Purpose:** The sovereign, single source of truth for PoC score
- **Immutable:** Yes (frozen object)

### `atomic_score.integrity_hash`
- **Length:** 64 characters
- **Type:** String (hex)
- **Purpose:** SHA-256 hash for bit-by-bit verification
- **Format:** `abc123def456...` (lowercase hex)

### `atomic_score.execution_context`
- **Purpose:** Deterministic evaluation provenance
- **Contains:**
  - `timestamp_utc` — When evaluation ran
  - `toggles` — Which scoring features were enabled
  - `pipeline_version` — THALET version used
  - `operator_id` — Who/what ran the evaluation
  - `seed` — Entropy seed for reproducibility

### `atomic_score.trace`
- **Purpose:** Auditability and transparency
- **Contains:**
  - `composite` — Sum of dimension scores
  - `penalty_percent` — Overlap penalty applied
  - `bonus_multiplier` — Sweet spot bonus
  - `seed_multiplier` — Seed bonus (1.15x)
  - `edge_multiplier` — Edge bonus (1.12x)
  - `formula` — Human-readable computation string
  - `intermediate_steps` — Step-by-step breakdown

### `pod_score`
- **Purpose:** Convenience field for UI/API consumers
- **Value:** Always equals `atomic_score.final`
- **Zero-Delta:** `pod_score == atomic_score.final` (always true)

---

## 📊 Example Valid Response

```json
{
  "submission_hash": "9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a",
  "title": "Test Submission",
  "contributor": "0x123...",
  "pod_score": 8600,
  "novelty": 2150,
  "density": 2150,
  "coherence": 2150,
  "alignment": 2150,
  "atomic_score": {
    "final": 8600,
    "execution_context": {
      "toggles": {
        "overlap_on": true,
        "seed_on": true,
        "edge_on": true,
        "metal_policy_on": true
      },
      "seed": "abc-123",
      "timestamp_utc": "2026-01-12T10:30:00.000Z",
      "pipeline_version": "2.0.0-thalet",
      "operator_id": "syntheverse-primary"
    },
    "trace": {
      "composite": 8600,
      "penalty_percent": 0,
      "bonus_multiplier": 1.0,
      "seed_multiplier": 1.0,
      "edge_multiplier": 1.0,
      "formula": "Composite=8600 = 8600.00",
      "intermediate_steps": {
        "after_penalty": 8600,
        "after_bonus": 8600,
        "after_seed": 8600,
        "raw_final": 8600,
        "clamped_final": 8600
      }
    },
    "integrity_hash": "abc123def456...789" // 64 chars
  },
  "metadata": {
    "atomic_score": { /* same as above */ },
    "pod_score": 8600,
    "novelty": 2150,
    "density": 2150,
    "coherence": 2150,
    "alignment": 2150
  }
}
```

---

## 🔥 Success Indicators

**THALET is working if:**

✅ `atomic_score` exists and is not null  
✅ `atomic_score.final` is in range [0, 10000]  
✅ `atomic_score.integrity_hash` is 64 characters  
✅ `atomic_score.execution_context` is populated  
✅ `pod_score == atomic_score.final` (Zero-Delta)  
✅ Test scripts pass without errors  

**If all true → Protocol is operational** 🎯

---

## 📞 Support

**Need help?**
- Full audit: `RESPONSE_TO_MAREK_SIMBA_FINAL_AUDIT.md`
- Deploy guide: `QUICK_DEPLOY_GUIDE_THALET_FIXES.md`
- Summary: `MAREK_SIMBA_FIXES_SUMMARY.md`

**Found an issue?**
- Run test suite and save log: `./scripts/comprehensive-thalet-test.sh`
- Check Vercel logs for API errors
- Verify operator role in Supabase

---

**Last Updated:** January 12, 2026  
**Test Harness Status:** ✅ Operational  
**THALET Protocol Status:** ✅ Compliant




