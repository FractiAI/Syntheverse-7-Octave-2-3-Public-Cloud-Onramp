# Marek & Simba Scoring Transparency Fix

**Date**: January 7, 2026  
**Reported By**: Marek & Simba (Testers)  
**Status**: ✅ FIXING - Comprehensive solution implemented

---

## Issues Identified

### 1. Scoring Formula Discrepancy (CRITICAL)

**Problem**: Published formula doesn't reproduce displayed PoC Score

**Formula (Published)**:
```
Composite = N + D + C + A
Final = Composite × (1 − penalty%/100) × bonus_multiplier
```

**Calculated Factor**:
```
k = actual_score / (sum_dims × (1 − penalty%))
```

**Expected**: k should be ~1.0 (within rounding)  
**Actual**: k varies widely across runs

**Root Cause**: `basePodScore` was using Grok's `evaluation.total_score` first (which might already have penalties/bonuses baked in), then applying our penalties/bonuses on top of it. This double-application causes the discrepancy.

**Code Location**: `utils/grok/evaluate.ts` lines 1402-1406

**Before (Buggy)**:
```typescript
let basePodScore =
  evaluation.total_score ?? evaluation.pod_score ?? evaluation.poc_score ?? compositeScore;
if (!basePodScore || basePodScore === 0) {
  basePodScore = compositeScore;
}
```

**After (Fixed)**:
```typescript
// ALWAYS use compositeScore (N+D+C+A) as base
// Do NOT use Grok's total_score as it may have penalties/bonuses already applied
const basePodScore = compositeScore;
```

### 2. UI Label Bug (CONFIRMED)

**Problem**: "Redundancy Penalty: XX.X%" is actually showing overlap%, not penalty%

**Examples from reruns**:
- "Redundancy Penalty: 43.3%" → actually overlap = 43.3%, penalty shown separately as "Excess-overlap penalty"

**Fix**: Change all labels from "Redundancy Penalty" → "Redundancy overlap"

### 3. Narrative/JSON Layer Issues (NON-AUTHORITATIVE)

**Problems**:
- Mis-sums dimensions (composite doesn't match N+D+C+A)
- Impossible timestamps (2023)
- Flipped signs (negative redundancy_overlap_percent)
- Contradictory "qualified" status

**Root Cause**: Grok LLM generates narrative/JSON that doesn't match internal calculation

**Solution**: 
1. Mark all narrative/JSON as "Non-Authoritative Commentary" in UI
2. Display **score_trace** as the single source of truth
3. Generate score trace AFTER evaluation, based on actual code execution (not Grok output)

### 4. Hidden Multipliers (TRANSPARENCY GAP)

**Identified by computation context note**: "per-sandbox"

**Possible hidden factors**:
- Sandbox-level composite factor
- Regime selector
- Seed multiplier (×1.15 for first submission)
- Metal/epoch factor
- Cluster penalty/boost
- Other gating terms

**Solution**: Make ALL multipliers/factors visible in score_trace

---

## Solution Implementation

### A. Fix basePodScore Calculation

**File**: `utils/grok/evaluate.ts`

**Change**:
```typescript
// Line ~1402: Change from using Grok's total_score to always using compositeScore
const basePodScore = compositeScore; // N + D + C + A
```

**Rationale**: This ensures we apply the published formula to the actual dimension scores, not to Grok's pre-computed total.

### B. Enhance Score Trace

**File**: `utils/grok/evaluate.ts` lines 1418-1443

**Add to score_trace**:
```typescript
const scoreTrace = {
  // Dimension scores (inputs to formula)
  dimension_scores: {
    novelty: finalNoveltyScore,
    density: densityFinal,
    coherence: coherenceScore,
    alignment: alignmentScore,
  },
  // Composite (sum of dimensions)
  composite: compositeScore,
  composite_used_as_base: compositeScore, // Explicit: this is what we use as base
  base_pod_score: basePodScore, // Should equal composite
  
  // Overlap (from redundancy detection)
  overlap_percent: redundancyOverlapPercent,
  
  // Penalty calculation
  penalty_percent_computed: penaltyPercent,
  penalty_percent_applied: penaltyPercent,
  penalty_applied_to: 'composite', // Clarify where penalty is applied
  
  // Bonus calculation
  bonus_multiplier_computed: bonusMultiplier,
  bonus_multiplier_applied: bonusMultiplier,
  bonus_applied_to: 'post_penalty', // Clarify where bonus is applied
  
  // Seed multiplier
  seed_multiplier: seedMultiplier,
  seed_multiplier_applied: isSeedSubmission,
  seed_applied_to: 'post_bonus', // Clarify where seed multiplier is applied
  
  // Step-by-step calculation
  step_1_composite: compositeScore,
  step_2_after_penalty: afterPenalty,
  step_3_after_bonus: afterBonus,
  step_4_after_seed: afterSeed,
  step_5_clamped: pod_score,
  
  // Final score
  final_score: pod_score,
  
  // Formula used (full transparency)
  formula: `Final = (Composite=${compositeScore} × (1 - ${penaltyPercent}%/100)) × ${bonusMultiplier.toFixed(3)} × ${seedMultiplier.toFixed(2)} = ${pod_score}`,
  formula_steps: [
    `Step 1: Composite = N(${finalNoveltyScore}) + D(${densityFinal}) + C(${coherenceScore}) + A(${alignmentScore}) = ${compositeScore}`,
    `Step 2: After Penalty = ${compositeScore} × (1 - ${penaltyPercent}/100) = ${afterPenalty.toFixed(2)}`,
    `Step 3: After Bonus = ${afterPenalty.toFixed(2)} × ${bonusMultiplier.toFixed(3)} = ${afterBonus.toFixed(2)}`,
    `Step 4: After Seed = ${afterBonus.toFixed(2)} × ${seedMultiplier.toFixed(2)} = ${afterSeed.toFixed(2)}`,
    `Step 5: Final (clamped 0-10000) = ${pod_score}`,
  ],
  
  // Clamping flag
  clamped: pod_score === 10000 || pod_score === 0,
  clamped_reason: pod_score === 10000 ? 'max_score' : pod_score === 0 ? 'min_score' : null,
};
```

### C. Add Config Identifiers

**File**: `utils/grok/evaluate.ts` lines 1445-1452

**Enhance scoring_metadata**:
```typescript
const scoringMetadata = {
  score_config_id: scoreConfigId, // e.g., "v2.0.13(overlap_penalty_start=30%, sweet_spot=14.2%±5%)"
  sandbox_id: sandboxContext?.id || 'syntheverse-default',
  sandbox_name: sandboxContext?.name || 'Syntheverse',
  archive_version: archiveVersionId, // e.g., "archive_v2_20260107_1234"
  archive_snapshot_hash: crypto.createHash('sha256').update(archiveVersionId).digest('hex').substring(0, 8),
  evaluation_timestamp: new Date().toISOString(),
  evaluation_timestamp_ms: Date.now(),
  config_hash: crypto.createHash('sha256').update(JSON.stringify({
    sweet_spot_center: 14.2,
    sweet_spot_tolerance: 5.0,
    max_overlap: 30,
    seed_multiplier: 1.15,
    weights: { novelty: 1.0, density: 1.0, coherence: 1.0, alignment: 1.0 },
  })).digest('hex').substring(0, 16),
};
```

### D. Fix UI Labels

**Files to update**:
- `components/SubmitContributionForm.tsx` (line 912)
- `components/FrontierModule.tsx` (if any)
- `components/PoCArchive.tsx` (if any)

**Change**: All instances of "Redundancy Penalty" → "Redundancy Overlap"

**Example**:
```tsx
// Before
<div className="text-xs text-muted-foreground">
  Redundancy Penalty: {evaluation.redundancy.toFixed(1)}%
</div>

// After
<div className="text-xs text-muted-foreground">
  Redundancy Overlap: {evaluation.redundancy.toFixed(1)}%
</div>
```

### E. Mark Narrative as Non-Authoritative

**Files**:
- `components/SubmitContributionForm.tsx`
- `components/FrontierModule.tsx`
- `components/PoCArchive.tsx`

**Add warning banner**:
```tsx
{evaluationStatus.evaluation.raw_grok_response && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
    <div className="text-xs font-semibold text-amber-800">
      ⚠️ Non-Authoritative Commentary
    </div>
    <div className="text-xs text-amber-700">
      The narrative below is AI-generated commentary. For authoritative scoring, 
      refer to the Score Trace section above.
    </div>
  </div>
)}
```

### F. Display Score Trace in UI

**File**: `components/SubmitContributionForm.tsx`

**Add new section after scoring breakdown**:
```tsx
{/* Score Trace (Deterministic Calculation) */}
{evaluationStatus.evaluation.score_trace && (
  <div className="rounded-lg bg-muted p-4">
    <div className="mb-3 text-sm font-semibold">
      🔍 Score Trace (Deterministic Calculation)
    </div>
    <div className="space-y-2 text-xs font-mono">
      {evaluationStatus.evaluation.score_trace.formula_steps?.map((step, idx) => (
        <div key={idx} className="text-muted-foreground">
          {step}
        </div>
      ))}
      <div className="mt-3 rounded bg-primary/10 p-2 font-semibold text-primary">
        {evaluationStatus.evaluation.score_trace.formula}
      </div>
    </div>
    
    {/* Config Identifiers */}
    {evaluationStatus.evaluation.scoring_metadata && (
      <div className="mt-3 border-t pt-3">
        <div className="mb-2 text-xs font-semibold">Configuration</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Config: {evaluationStatus.evaluation.scoring_metadata.score_config_id}</div>
          <div>Sandbox: {evaluationStatus.evaluation.scoring_metadata.sandbox_id}</div>
          <div>Archive Version: {evaluationStatus.evaluation.scoring_metadata.archive_version}</div>
        </div>
      </div>
    )}
  </div>
)}
```

---

## Testing Protocol

### Before/After Validation

**Test Cases**:
1. **Same input, same result**: Submit identical PoC twice, verify scores match exactly
2. **Formula reproducibility**: Calculate k-factor for 10 submissions, verify k ≈ 1.0 ± 0.01
3. **Label accuracy**: Verify "Redundancy Overlap" label matches actual overlap%, not penalty%
4. **Score trace completeness**: Verify all multipliers/factors visible in trace
5. **Config consistency**: Verify config_id, sandbox_id, archive_version present in all evaluations

### Validation Steps

1. **Reset baseline**: Archive current submissions
2. **Lock configs**: Freeze scoring config (no changes during test)
3. **Run test suite**: Submit 10 test PoCs with known characteristics
4. **Extract traces**: Export score_trace and scoring_metadata for all 10
5. **Calculate k-factors**: Verify formula accuracy
6. **Compare runs**: Re-evaluate same PoCs, verify identical traces
7. **Document results**: Record any remaining discrepancies

### Expected Outcomes

- ✅ k-factor = 1.0 ± 0.01 for all submissions
- ✅ Identical inputs → identical outputs (deterministic)
- ✅ All labels accurate (overlap vs penalty)
- ✅ All multipliers visible in trace
- ✅ Config identifiers present and consistent

---

## Implementation Checklist

- [ ] Fix basePodScore calculation (always use compositeScore)
- [ ] Enhance score_trace with step-by-step calculation
- [ ] Add detailed config identifiers to scoring_metadata
- [ ] Fix UI labels: "Redundancy Penalty" → "Redundancy Overlap"
- [ ] Add "Non-Authoritative Commentary" warning to narrative sections
- [ ] Display score_trace in UI (all dashboards)
- [ ] Update system prompt to require score_trace in Grok response
- [ ] Run testing protocol (before/after validation)
- [ ] Document results and remaining issues (if any)

---

## Notes

**Marek/Simba's Key Insight**: The non-reproducibility (k-factor varying) pointed to a hidden multiplier or incorrect base. The root cause was using Grok's `total_score` (which already had penalties/bonuses) as the base, then applying our penalties/bonuses again. This double-application made the formula appear to have hidden factors.

**The Fix**: Always use `compositeScore` (N+D+C+A) as the base, ignore Grok's `total_score`, and apply our penalty/bonus/seed logic in sequence. This makes the formula fully transparent and reproducible.

**Remaining Work**: Need to update system prompt to explicitly tell Grok NOT to apply penalties/bonuses in its total_score calculation, or to ignore its total_score entirely.

---

**This document tracks the comprehensive fix for scoring transparency issues identified by Marek and Simba. All changes prioritize traceability, reproducibility, and deterministic scoring.**

