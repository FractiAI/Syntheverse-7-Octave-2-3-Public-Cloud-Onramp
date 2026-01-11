# 🔥 MAREK & SIMBA ACTION PLAN - THALET EMISSION FIX

**Date:** 2026-01-11  
**Status:** 🚨 **IN PROGRESS**  
**Priority:** **P0 - CRITICAL**

---

## 🎯 OBJECTIVE

Prove THALET `atomic_score` is being emitted, stored, and displayed correctly. If not, fix the emission path.

---

## ✅ COMPLETED ACTIONS

### 1. ✅ Repository Diagnostic (Prompt 1)

**Status:** COMPLETE  
**Findings:**
- ✅ AtomicScorer imported in `utils/grok/evaluate.ts`
- ✅ AtomicScorer.computeScore() called (line 1588)
- ✅ atomic_score returned in evaluation object (line 2068)
- ✅ atomic_score extracted in API routes (line 266)
- ✅ atomic_score stored in database (top-level + metadata)
- ✅ UI prioritizes atomic_score over legacy fallback

**Conclusion:** Code structure is correct. THALET should be emitting.

---

### 2. ✅ Debug Logging Added

**Files Modified:**
- `app/api/evaluate/[hash]/route.ts`
- `app/api/enterprise/evaluate/[hash]/route.ts`

**Added:**
```typescript
// 🔥 MAREK & SIMBA DIAGNOSTIC: Verify THALET emission
debug('THALET_DIAGNOSTIC', 'Evaluation object inspection', {
  has_atomic_score: !!atomicScore,
  atomic_score_final: atomicScore?.final,
  atomic_score_integrity_hash: atomicScore?.integrity_hash?.substring(0, 16),
  evaluation_keys: Object.keys(evaluation),
  pod_score: evaluation.pod_score,
  has_score_trace: !!evaluation.score_trace,
});
```

**Purpose:** Log atomic_score presence/absence in production logs

---

### 3. ✅ Verification Script Created

**File:** `scripts/verify-thalet-emission.sh`  
**Usage:**
```bash
./scripts/verify-thalet-emission.sh <SUBMISSION_HASH>
```

**What it does:**
1. Fetches contribution record from API
2. Extracts `metadata.atomic_score`
3. Validates structure (final, execution_context, integrity_hash, trace)
4. Verifies `pod_score` matches `atomic_score.final`
5. Checks for legacy `score_trace` (backward compat)
6. Prints full diagnostic report

**Output:**
- ✅ Green: THALET is emitting
- ❌ Red: THALET is NOT emitting (with diagnosis)

---

## 🔄 PENDING ACTIONS

### 4. ⏳ Fresh Test Submission Required

**Assignee:** Marek  
**Task:** Submit a NEW test PoC (not re-evaluate an old one)

**Why:** If Marek's current test was evaluated before commit `2ab7088`, it won't have `atomic_score`. A fresh submission will trigger the current code path.

**Steps:**
1. Go to `/submit`
2. Submit test content (can be same content as before)
3. Wait for evaluation to complete
4. Note the submission hash
5. Run verification script: `./scripts/verify-thalet-emission.sh <HASH>`

---

### 5. ⏳ Production Log Inspection

**Assignee:** Pru  
**Task:** Check Vercel production logs for `THALET_DIAGNOSTIC` output

**Where:** Vercel Dashboard → Deployments → Latest → Logs  
**Search for:** `THALET_DIAGNOSTIC`

**Expected output:**
```json
{
  "has_atomic_score": true,
  "atomic_score_final": 8600,
  "atomic_score_integrity_hash": "a1b2c3d4e5f6...",
  "evaluation_keys": ["coherence", "density", "pod_score", "atomic_score", ...],
  "pod_score": 8600,
  "has_score_trace": true
}
```

**If `has_atomic_score: false`:**
- Problem is in `evaluateWithGroq()` function
- AtomicScorer is not being called or not returning correctly

**If `has_atomic_score: true`:**
- Problem is in database storage or API response
- Check if `atomic_score` column exists in database

---

### 6. ⏳ Database Schema Verification

**Assignee:** Pru  
**Task:** Verify `atomic_score` column exists in production database

**SQL Query:**
```sql
-- Check if atomic_score column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contributions' 
  AND column_name = 'atomic_score';

-- Check if any records have atomic_score populated
SELECT 
  submission_hash,
  title,
  pod_score,
  atomic_score IS NOT NULL as has_atomic_score,
  metadata->'atomic_score' IS NOT NULL as has_metadata_atomic_score,
  created_at
FROM contributions
WHERE status = 'qualified'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- Column exists: `atomic_score | jsonb`
- Recent records have `has_atomic_score: true`

---

### 7. ⏳ Type Interface Verification

**Assignee:** Pru  
**Task:** Verify TypeScript interface includes `atomic_score`

**File:** `utils/grok/evaluate.ts`  
**Interface:** `GroqEvaluationResult`

**Current (line 85):**
```typescript
atomic_score?: any; // THALET Protocol: Atomic score payload
```

**Action:** Change `any` to proper type:
```typescript
atomic_score?: AtomicScore; // THALET Protocol: Atomic score payload
```

**Import required:**
```typescript
import { AtomicScore } from '@/utils/scoring/AtomicScorer';
```

---

## 🔬 BINARY PROOF PROTOCOL

This is the **ONLY** test that matters. Everything else is noise.

### Test Protocol

1. **Marek:** Submit fresh test PoC
2. **Marek:** Report submission hash
3. **Pru:** Run verification script:
   ```bash
   ./scripts/verify-thalet-emission.sh <HASH>
   ```
4. **Pru:** Check production logs for `THALET_DIAGNOSTIC`
5. **Pru:** Inspect database record directly

### Success Criteria

✅ **THALET IS EMITTING** if:
- Verification script shows green ✅
- `metadata.atomic_score.final` exists
- `metadata.atomic_score.execution_context` exists
- `metadata.atomic_score.integrity_hash` exists
- `pod_score` equals `atomic_score.final`

❌ **THALET IS NOT EMITTING** if:
- Verification script shows red ❌
- `metadata.atomic_score` is null
- UI falls back to `score_trace.final_score`

---

## 🐛 CONTINGENCY: If THALET Is Not Emitting

### Scenario A: `has_atomic_score: false` in logs

**Root Cause:** AtomicScorer not being called or not returning

**Fix:**
1. Check `evaluateWithGroq()` function (line 1588)
2. Verify `AtomicScorer.computeScore()` is being called
3. Add debug logging before/after AtomicScorer call
4. Check for exceptions in AtomicScorer

---

### Scenario B: `has_atomic_score: true` in logs, but not in database

**Root Cause:** Database write failing or column missing

**Fix:**
1. Run database schema verification (Action 6)
2. Check if migration `20260111000001_thalet_compliance.sql` was executed
3. Manually add column if missing:
   ```sql
   ALTER TABLE contributions 
   ADD COLUMN atomic_score JSONB;
   ```
4. Re-run evaluation

---

### Scenario C: `has_atomic_score: true` in database, but not in API response

**Root Cause:** API not including field in response

**Fix:**
1. Check API route response construction (line 325)
2. Verify `atomic_score` is in the returned object
3. Check if serialization is dropping the field

---

### Scenario D: `has_atomic_score: true` in API response, but UI not displaying

**Root Cause:** UI render path bug

**Fix:**
1. Check `IntegrityValidator.getValidatedScore()` function
2. Verify UI is reading `metadata.atomic_score` correctly
3. Add console.log in UI components to trace data flow

---

## 📊 CURRENT HYPOTHESIS

**Most Likely (70%):** Stale Evaluation
- Marek is looking at a pre-THALET evaluation
- Submission was evaluated before commit `2ab7088`
- Fresh submission will emit `atomic_score`

**Alternative (30%):** Type Mismatch
- TypeScript interface not properly typed
- `(evaluation as any).atomic_score` suggests type escape
- Might need explicit type assertion

---

## 🚀 DEPLOYMENT CHECKLIST

Once fix is confirmed:

- [ ] Remove debug logging (or keep behind feature flag)
- [ ] Update RESPONSE_TO_MAREK_SIMBA_THALET_AUDIT.md with findings
- [ ] Commit changes with message: "Fix: THALET emission verified and debugged"
- [ ] Push to production
- [ ] Run verification script on production
- [ ] Report to Marek & Simba with proof

---

## 📝 NOTES FOR MAREK & SIMBA

Your field report was **100% correct**. The diagnostic approach you outlined is exactly what we needed:

1. ✅ "Stop explaining, force binary proof" - Verification script created
2. ✅ "Check for emission gap" - Repository scan complete
3. ✅ "Wire THALET into evaluate endpoint" - Already done (commit 2ab7088)
4. ✅ "UI becomes dumb terminal" - Already implemented
5. ✅ "Verification harness" - Script created and executable

The "Help Pru's AI" prompts were perfect. They forced systematic verification instead of assumptions.

**Next step:** Fresh test submission to trigger current code path.

---

**Reg.**  
Pru  
FractiAI & Syntheverse — Senior Scientist & Full Stack Engineer  
Holographic Hydrogen Fractal Systems-Cøre Safety Operator  
🔥☀️🦬 (Fire, Sol, Bison — Outcast Hero's Return)

---

**STATUS:** Awaiting fresh test submission from Marek for binary proof verification.

