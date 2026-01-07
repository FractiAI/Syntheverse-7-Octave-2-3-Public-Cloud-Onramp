# Scoring Transparency Update - January 7, 2026

## Quick Summary for Marek & Simba

Thank you for your exceptional testing! You identified critical issues that we've now fixed.

## Issues Fixed

### 1. ✅ Formula Discrepancy (k-factor varying)
**Root Cause**: Double-application of penalties/bonuses  
**Fix**: Always use clean composite (N+D+C+A) as base  
**Expected Result**: k-factor = 1.0 ± 0.01

### 2. ✅ UI Label Bug
**Problem**: "Redundancy Penalty" showing overlap%, not penalty%  
**Fix**: Changed to "Redundancy Overlap"  
**Result**: Labels now accurate

### 3. ✅ Non-Authoritative Narrative
**Problem**: Grok's narrative has wrong math, flipped signs  
**Fix**: Added score_trace as single source of truth + warning banner  
**Result**: Clear distinction between authoritative trace vs commentary

### 4. ✅ Hidden Multipliers
**Problem**: Couldn't trace where all factors were applied  
**Fix**: Enhanced score_trace with step-by-step breakdown  
**Result**: Every factor now visible

### 5. ✅ Metal-Aware Overlap (BONUS)
**Discovery**: Silver/Copper should NOT be penalized for high overlap  
**Fix**: Metal-specific overlap strategy  
**Result**: Silver/Copper rewarded for appropriate overlap

## Key Documents

1. **Full Response**: [`docs/RESPONSE_TO_MAREK_SIMBA_TESTING.md`](docs/RESPONSE_TO_MAREK_SIMBA_TESTING.md)
   - Detailed analysis of all issues
   - Implementation details
   - Testing protocol

2. **Technical Fix Details**: [`docs/MAREK_SIMBA_SCORING_TRANSPARENCY_FIX.md`](docs/MAREK_SIMBA_SCORING_TRANSPARENCY_FIX.md)
   - Code changes
   - Before/after comparisons
   - Implementation checklist

3. **Metal-Aware Strategy**: [`docs/METAL_AWARE_OVERLAP_STRATEGY.md`](docs/METAL_AWARE_OVERLAP_STRATEGY.md)
   - New overlap logic by metal type
   - Rationale and examples
   - Testing cases

## What Changed in Code

### Core Fix (`utils/grok/evaluate.ts`)

**Before**:
```typescript
let basePodScore =
  evaluation.total_score ?? evaluation.pod_score ?? compositeScore;
```

**After**:
```typescript
const basePodScore = compositeScore; // Always N+D+C+A
```

### Enhanced Score Trace

Now includes:
- Step-by-step calculation (Step 1→2→3→4→5)
- Where each factor is applied (composite, post_penalty, post_bonus)
- Config identifiers (score_config_id, sandbox_id, archive_version)
- Formula breakdown for UI display

### Metal-Aware Overlap

- **Gold**: Penalized at >30% (derivative research)
- **Silver**: Rewarded 19.2%-70% (building on research)
- **Copper**: Rewarded 19.2%-80% (thorough verification)

## Testing Protocol

### Your Request
"Same PoCs, same order, same sandbox snapshot, with fully comparable traces"

### Steps
1. Lock configs (no changes during test)
2. Submit 10 test PoCs
3. Calculate k-factors → verify ≈ 1.0
4. Re-run same PoCs → verify identical traces
5. Test metal-aware overlap

### Expected Results
- ✅ k = 1.0 ± 0.01 for all submissions
- ✅ Same input → same output (deterministic)
- ✅ Silver/Copper rewarded for appropriate overlap
- ✅ All factors visible in trace

## Files Changed

- `utils/grok/evaluate.ts` - Core scoring logic
- `components/SubmitContributionForm.tsx` - UI labels, score display
- `components/FrontierModule.tsx` - Overlap labels
- `components/PoCArchive.tsx` - Table labels

## Next Steps

1. Review full response document
2. Run validation testing
3. Report k-factors and any remaining discrepancies
4. Confirm reproducibility (same input → same output)

## Thank You!

Your k-factor analysis was brilliant diagnostics. The formula:

```
k = actual_score / (sum_dims × (1 − penalty%))
```

Led us directly to the double-application bug. **Exceptional testing work!**

---

**Status**: Fixes implemented, ready for validation  
**Contact**: Open GitHub issue or contact engineering team for testing support

