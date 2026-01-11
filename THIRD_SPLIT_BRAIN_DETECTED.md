# 🚨 THIRD SPLIT-BRAIN DIVERGENCE DETECTED

**Date:** January 11, 2026  
**Status:** 🔴 **UI CORRECT - JSON WRONG**

---

## 🔥 SPLIT-BRAIN #3: UI vs JSON Response

### ✅ Frontend Shows (CORRECT):
```
Composite: 10,000
Bonus Multiplier: ×1.000 ✅
Final Score: 10,000 ✅
```

### ❌ JSON Shows (WRONG):
```json
{
  "composite": 10000,
  "multipliers": {
    "sweet_spot_multiplier": 1.13,  ❌
    "seed_multiplier": 1.15,        ❌
    "total_multiplier": 1.3225      ❌
  },
  "final_clamped": 13225,           ❌
  "pod_score": 13225                ❌
}
```

### ❌ Narrative Says (WRONG):
> "Since this is within the sweet spot range (9.2%–19.2%), a bonus multiplier of 1.13 is applied."

---

## 🎯 WHAT THIS MEANS

### The Toggle Fix WORKED for AtomicScorer!
- ✅ AtomicScorer correctly computed 10,000
- ✅ UI correctly displays 10,000
- ✅ No multipliers applied in AtomicScorer

### BUT Legacy JSON Fields Still Wrong!
- ❌ JSON response still shows 13,225
- ❌ JSON shows multipliers that weren't applied
- ❌ AI narrative thinks multipliers were applied
- ❌ Legacy fields not using atomic_score

---

## 🔍 ROOT CAUSE

There are **TWO SEPARATE CALCULATIONS** happening:

### Calculation #1: AtomicScorer (NEW - CORRECT)
```typescript
// In evaluate.ts, line ~1588
const atomicScore = AtomicScorer.computeScore({
  toggles: {
    seed_on: false,  ✅
    edge_on: false,  ✅
    overlap_on: false ✅
  }
});
// Result: atomicScore.final = 10,000 ✅
```

### Calculation #2: Legacy JSON Fields (OLD - WRONG)
```typescript
// Somewhere in evaluate.ts or the AI prompt
// These fields are being populated separately:
{
  "sweet_spot_multiplier": 1.13,  ❌ Calculated independently
  "seed_multiplier": 1.15,        ❌ Calculated independently
  "final_clamped": 13225          ❌ Using old formula
}
```

**The Problem:** The JSON response is being built from BOTH sources:
- Uses `atomic_score.final` for UI display ✅
- But ALSO includes legacy fields calculated separately ❌

---

## 🔬 WHERE TO FIX

### Location: `utils/grok/evaluate.ts`

After the AtomicScorer call, there's code that builds the JSON response for the AI to format. This code is likely:

1. **Computing multipliers again** (ignoring toggles)
2. **Using legacy formulas** to calculate final_clamped
3. **Passing wrong values** to the AI prompt

**We need to find where:**
```typescript
// After AtomicScorer.computeScore()
const pod_score = atomicScore.final; // ✅ This is correct

// But somewhere there's also:
const sweetSpotMultiplier = calculateSweetSpot(...); // ❌ Ignoring toggles
const seedMultiplier = isSeed ? 1.15 : 1.0;          // ❌ Ignoring toggles
const finalClamped = composite * sweetSpot * seed;   // ❌ Wrong formula
```

**These legacy calculations need to be REMOVED or replaced with:**
```typescript
// Use atomic_score values ONLY
const sweetSpotMultiplier = atomicScore.trace.bonus_multiplier;
const seedMultiplier = atomicScore.trace.seed_multiplier;
const edgeMultiplier = atomicScore.trace.edge_multiplier;
const finalClamped = atomicScore.final;
```

---

## 🔍 SEARCH FOR THE BUG

Need to find in `evaluate.ts` where these values are calculated:

1. **sweet_spot_multiplier**: Where is 1.13 coming from?
2. **seed_multiplier**: Where is 1.15 coming from?
3. **total_multiplier**: Where is 1.3225 calculated?
4. **final_clamped**: Where is 13225 calculated?

These are likely being computed in the section that builds the `pod_composition` object for the AI prompt.

---

## 🎯 EXPECTED FIX

### Current (BROKEN):
```typescript
// Separate calculations that ignore toggles
const sweetSpotMultiplier = calculateSweetSpot(overlap);
const seedMultiplier = isSeed ? 1.15 : 1.0;
const edgeMultiplier = isEdge ? 1.15 : 1.0;
const total = composite * sweetSpot * seed * edge;
```

### Fixed (Use AtomicScore):
```typescript
// Use values from AtomicScorer (respects toggles)
const sweetSpotMultiplier = atomicScore.trace.bonus_multiplier;
const seedMultiplier = atomicScore.trace.seed_multiplier;
const edgeMultiplier = atomicScore.trace.edge_multiplier;
const totalMultiplier = sweetSpotMultiplier * seedMultiplier * edgeMultiplier;
const finalClamped = atomicScore.final;
```

---

## 📊 EVIDENCE

### From User's Submission:

**UI Shows:**
```
Composite: 10,000
Bonus Multiplier: ×1.000
Final Score: 10,000
```

**JSON Shows:**
```json
{
  "pod_composition": {
    "sum_dims": {
      "composite": 10000
    },
    "multipliers": {
      "sweet_spot_multiplier": 1.13,
      "seed_multiplier": 1.15,
      "total_multiplier": 1.3225
    },
    "final_clamped": 13225
  },
  "pod_score": 13225
}
```

**This proves:**
- UI reading from `atomic_score.final` = 10,000 ✅
- JSON built from separate calculation = 13,225 ❌

---

## 🔧 ACTION PLAN

### Step 1: Find Legacy Calculation

Search `evaluate.ts` for:
- Where `sweet_spot_multiplier` is calculated
- Where `seed_multiplier` is set to 1.15
- Where `final_clamped` is computed
- Where `pod_composition` object is built

### Step 2: Replace with AtomicScore Values

Change all legacy calculations to use `atomicScore.trace` values.

### Step 3: Verify AI Prompt

Make sure the AI prompt receives correct values from `atomic_score`, not legacy fields.

### Step 4: Test Again

Re-submit and verify:
- ✅ UI shows 10,000
- ✅ JSON shows 10,000
- ✅ Multipliers all 1.0
- ✅ Narrative doesn't mention bonus

---

## 🚨 SEVERITY

**Priority:** 🔴 **HIGH**

**Why:**
- UI is correct (good!)
- But JSON response is wrong (bad!)
- AI narrative is misleading
- Legacy fields contradicting atomic_score
- Audit trail is inconsistent

**This undermines:**
- Data integrity
- Audit trail
- API consumers relying on JSON
- Trust in the system

---

**Status:** 🔴 **INVESTIGATING - NEED TO FIND LEGACY CALCULATION CODE**

**Next:** Search `evaluate.ts` for where `pod_composition` is built.

🚨🔍🔥

