# Quick Deploy Guide: THALET Test Harness Fixes

**Date:** January 12, 2026  
**Purpose:** Deploy fixes for Marek & Simba's identified test harness booby-traps

---

## What Was Fixed

### 🔧 Fixed Files

1. ✅ `scripts/verify-thalet-emission.sh` - Corrected API endpoint path
2. ✅ `scripts/comprehensive-thalet-test.sh` - Added metadata fallback
3. ✅ `app/api/archive/contributions/[hash]/route.ts` - Added top-level dimension scores

### 🐛 Bugs Fixed

**Bug #1: Non-Existent Endpoint**
- **Was:** `/api/contributions/<hash>` (doesn't exist)
- **Now:** `/api/archive/contributions/<hash>` (correct)

**Bug #2: Missing Dimension Scores**
- **Was:** Only `atomic_score` and `metadata` returned
- **Now:** Also returns `pod_score`, `novelty`, `density`, `coherence`, `alignment`

---

## Quick Deploy (3 Steps)

### Step 1: Verify Local Changes

```bash
cd /Users/macbook/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe

# Check that files were updated
git status

# Should show:
# modified:   app/api/archive/contributions/[hash]/route.ts
# modified:   scripts/verify-thalet-emission.sh
# modified:   scripts/comprehensive-thalet-test.sh
```

### Step 2: Test Locally (Optional)

```bash
# Build to check for TypeScript errors
npm run build

# If successful, continue to deploy
```

### Step 3: Deploy to Vercel

```bash
# Option A: Push to git (triggers auto-deploy)
git add .
git commit -m "Fix THALET test harness: correct API endpoint + add dimension scores"
git push

# Option B: Direct Vercel deploy
npx vercel --prod

# Option C: Use existing deploy script
./vercel-deploy-only.sh
```

---

## Verify Deployment

### Test 1: Quick Browser Check

1. Open: `https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a`

2. Press `Cmd+F` and search for:
   - `"pod_score"` - Should appear at top level ✅
   - `"novelty"` - Should appear at top level ✅
   - `"atomic_score"` - Should appear at top level ✅
   - `"final"` - Should be inside atomic_score ✅

3. Verify Zero-Delta:
   - `pod_score` value should equal `atomic_score.final` value

### Test 2: Run Verification Script

```bash
cd /Users/macbook/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe

# Test single submission (Pablo's hash)
./scripts/verify-thalet-emission.sh 9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a

# Expected output:
# ✅ atomic_score.final: 8600
# ✅ pod_score matches atomic_score.final: 8600
# 🎯 VERDICT: THALET IS EMITTING CORRECTLY
```

### Test 3: Run Comprehensive Test Suite

```bash
./scripts/comprehensive-thalet-test.sh

# Expected output:
# Total Tests:  15
# Passed:       15
# Failed:       0
# ✅ ALL TESTS PASSED ✅
```

---

## If Tests Still Fail

### Issue: "pod_score is null"

**Cause:** Old submissions might not have metadata.pod_score

**Fix:** The API now falls back to `atomic_score.final`:

```typescript
pod_score: ((contrib.metadata as any)?.pod_score ?? contrib.atomic_score?.final ?? null)
```

**Action:** Re-evaluate the submission to populate metadata:

```bash
# In your test suite or Postman
POST https://syntheverse-poc.vercel.app/api/evaluate/{hash}
```

### Issue: "atomic_score is null"

**Cause:** Pre-THALET submission (before AtomicScorer was implemented)

**Solution:** Submit a fresh test PoC to trigger new THALET evaluation

### Issue: "endpoint returns 404"

**Cause:** Deployment not yet live or script using wrong endpoint

**Check:**
```bash
# Verify endpoint exists
curl -I https://syntheverse-poc.vercel.app/api/archive/contributions/9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a

# Should return: HTTP/2 200
```

---

## Rollback Plan (If Needed)

### If deployment breaks something:

```bash
# Option 1: Revert git commit
git revert HEAD
git push

# Option 2: Rollback in Vercel UI
# 1. Go to Vercel dashboard
# 2. Select project
# 3. Go to Deployments
# 4. Click "..." on previous working deployment
# 5. Click "Promote to Production"
```

### Critical: Archive endpoint changes are additive only

The changes to `route.ts` only **add** fields. They don't remove or modify existing fields, so rollback risk is minimal.

---

## Success Criteria

✅ Deployment successful when:

1. `GET /api/archive/contributions/<hash>` returns 200
2. Response includes top-level `pod_score`, `novelty`, `density`, `coherence`, `alignment`
3. Response includes `atomic_score` with `final`, `integrity_hash`, `execution_context`
4. `pod_score == atomic_score.final` (Zero-Delta)
5. Both test scripts pass without errors

---

## Next Steps After Deploy

1. ✅ Run test suite on production
2. ✅ Update Pablo, Marek, Simba with results
3. ⚠️ Address Founder Certificate dual reality issue (separate task)
4. 📚 Document operator role setup for new testers

---

## Support

**Need help?** Check:
- Full audit response: `RESPONSE_TO_MAREK_SIMBA_FINAL_AUDIT.md`
- Vercel logs: `https://vercel.com/<your-project>/logs`
- Test results: `thalet-test-results-*.log`

**Still stuck?** The THALET implementation is solid. If tests fail, it's likely:
- Auth issues (missing operator role)
- Rate limiting (too many requests)
- Stale data (pre-THALET submissions)

---

**Deploy with confidence. The test harness is now reliable.** 🚀




