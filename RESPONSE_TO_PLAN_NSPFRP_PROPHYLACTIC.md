# Response to Plan: NSPFRP Prophylactic Implementation Strategy

**Date:** January 2025  
**To:** Testing Team, Marcin, Pablo  
**From:** Senior Research Scientist & Full Stack Engineer  
**Subject:** Plan Accepted // NSPFRP Prophylactic Enforcement // Implementation Roadmap

---

## Executive Summary

**Plan accepted and understood.** I will apply **NSPFRP (Natural System Protocol First Refactoring Pattern)** prophylactically to prevent fractalized errors before they occur. All new gate logic, BridgeSpec extraction, and n̂ calculations will use centralized utilities from day one.

**Status:** ✅ **PLAN ACCEPTED**  
**NSPFRP Mode:** Prophylactic (prevent bugs before they happen)  
**Implementation:** Sequential (finish Steel enforcement first, then gates)

---

## 1. Plan Understanding & Acceptance

### ✅ Point 1: Keep 4-Axis Score Untouched

**Understood:** N/D/C/A scoring logic remains exactly as-is. No rewrites, no scope explosion.

**NSPFRP Application:**
- ✅ Current scoring logic in `utils/grok/evaluate.ts` and `utils/scoring/AtomicScorer.ts` remains untouched
- ✅ No modifications to dimension calculation logic
- ✅ All existing tests remain valid

**Status:** ✅ **ACCEPTED - NO CHANGES**

---

### ✅ Point 2: One Truth in atomic_score.trace

**Understood:** 
- `atomic_score.final` = only sovereign score
- `atomic_score.trace` = only sovereign step-by-step truth
- UI = projection only
- Narrative = text-only (Option A enforced)

**NSPFRP Application:**
- ✅ **Already implemented:** `utils/thalet/ScoreExtractor.ts` enforces `atomic_score.final` priority
- ✅ **Already implemented:** `utils/narrative/sanitizeNarrative.ts` enforces text-only narratives
- ✅ **Protocol enforced:** All score extraction MUST use `extractSovereignScore()` utility
- ✅ **Zero-Delta discipline:** All authoritative values come from `atomic_score.trace`

**Current State:**
```typescript
// ✅ CORRECT (already using NSPFRP)
import { extractSovereignScore } from '@/utils/thalet/ScoreExtractor';
const score = extractSovereignScore(data); // Always uses atomic_score.final

// ❌ FORBIDDEN (would violate protocol)
const score = data.pod_score; // Direct access - blocked by NSPFRP
```

**Status:** ✅ **ALREADY ENFORCED - NO CHANGES NEEDED**

---

### ✅ Point 3: Two Hard Gate Layers

**Understood:** Add gates around existing score (don't change score itself).

#### Layer A (Hardening Existing)

**Components:**
1. **ΔNovelty gate** (rename from "Zero-Delta"): `ΔNovelty = 1 - overlap_max ≥ Δmin`
2. **THALET checks**: integrity/provenance/replay/time/trace
3. **n̂ (BMP precision) gate**: steel vs fog (experimental field first)

**NSPFRP Prophylactic Approach:**

**BEFORE implementing gates, create centralized utilities:**

```typescript
// utils/gates/LayerAGateExtractor.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for Layer A gate extraction
 * Prevents fractalized gate logic errors
 */
export function extractLayerAGates(data: any): {
  deltaNovelty: number | null;
  deltaNoveltyPasses: boolean;
  thaletChecks: ThaletCheckResult;
  bmpPrecision: number | null; // n̂
  bmpPrecisionPasses: boolean;
  layerAPasses: boolean;
} {
  // Single implementation - all gate logic here
  // No copy-paste allowed
}

// utils/gates/ThaletCheckExtractor.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for THALET checks
 */
export function extractThaletChecks(atomicScore: any): ThaletCheckResult {
  // integrity/provenance/replay/time/trace checks
  // Single implementation
}
```

**Implementation Order (NSPFRP):**
1. ✅ **Create utilities FIRST** (before any gate logic)
2. ✅ **Add to NSPFRP protocol** (document forbidden patterns)
3. ✅ **Then implement gates** (using utilities only)

#### Layer B (New: BridgeSpec / Testability Gate)

**Components:**
- BridgeSpec JSON schema
- Regime, Observables, Differential prediction, Failure condition, Floor constraints
- Chamber A (meaning/narrative) vs Chamber B (physics/testability)

**NSPFRP Prophylactic Approach:**

**BEFORE implementing BridgeSpec, create centralized utilities:**

```typescript
// utils/bridgespec/BridgeSpecExtractor.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for BridgeSpec extraction
 * Prevents fractalized BridgeSpec parsing errors
 */
export function extractBridgeSpec(data: any): BridgeSpec | null {
  // Single implementation - all BridgeSpec extraction here
  // No copy-paste allowed
}

// utils/bridgespec/BridgeSpecValidator.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for BridgeSpec validation
 */
export function validateBridgeSpec(spec: BridgeSpec): {
  valid: boolean;
  errors: string[];
  testabilityScore: number; // How testable is this spec?
} {
  // Single implementation
}

// utils/bridgespec/BridgeSpecGate.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for BridgeSpec gate logic
 */
export function evaluateBridgeSpecGate(spec: BridgeSpec | null): {
  passes: boolean;
  reason: string;
  chamberA: boolean; // meaning/narrative
  chamberB: boolean; // physics/testability
  official: boolean; // requires Chamber B
} {
  // Single implementation
}
```

**Implementation Order (NSPFRP):**
1. ✅ **Create utilities FIRST** (before any BridgeSpec logic)
2. ✅ **Add to NSPFRP protocol** (document forbidden patterns)
3. ✅ **Then implement gates** (using utilities only)

**Status:** ✅ **ACCEPTED - NSPFRP UTILITIES FIRST**

---

### ✅ Point 4: n̂ and BridgeSpec Coupling

**Understood:** 
- Missing/failed BridgeSpec → HOLD officialness or fail-closed
- Weak BridgeSpec → raises ε → lowers n̂
- Strong BridgeSpec → lowers ε → raises n̂
- n̂ = "does it hold under scrutiny?"

**NSPFRP Prophylactic Approach:**

**BEFORE implementing coupling, create centralized utility:**

```typescript
// utils/gates/PrecisionCoupling.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for n̂ calculation and BridgeSpec coupling
 * Prevents fractalized precision calculation errors
 */
export function calculateBMPPrecision(
  bridgeSpec: BridgeSpec | null,
  layerAGates: LayerAGateResult,
  epsilon: number
): {
  n_hat: number; // BMP precision (steel vs fog)
  epsilon: number; // Inconsistency penalty
  bridgeSpecContribution: number; // How BridgeSpec affects n̂
  layerAContribution: number; // How Layer A affects n̂
  passes: boolean;
} {
  // Single implementation - all n̂ logic here
  // No copy-paste allowed
}
```

**Implementation Order (NSPFRP):**
1. ✅ **Create utility FIRST** (before any coupling logic)
2. ✅ **Add to NSPFRP protocol** (document forbidden patterns)
3. ✅ **Then implement coupling** (using utility only)

**Status:** ✅ **ACCEPTED - NSPFRP UTILITY FIRST**

---

### ✅ Point 5: Finish Steel Enforcement First

**Understood:** Before adding new gates, complete current stabilization.

**Checklist (NSPFRP Verified):**

1. ✅ **Option A (Text-Only Narrative)**
   - **Status:** ✅ **COMPLETE**
   - **File:** `utils/narrative/sanitizeNarrative.ts`
   - **NSPFRP:** Single utility, no copy-paste

2. ✅ **Zero-Delta Discipline**
   - **Status:** ✅ **COMPLETE**
   - **File:** `utils/thalet/ScoreExtractor.ts`
   - **NSPFRP:** Single utility, all extraction uses it

3. ⏳ **Fail-Closed Time Uncertainty**
   - **Status:** ⏳ **IN PROGRESS**
   - **Needs:** Time skew detection in `atomic_score.trace`
   - **NSPFRP:** Create `utils/time/TimeSkewValidator.ts` FIRST

4. ⏳ **T2-6 Pack Clean Run**
   - **Status:** ⏳ **PENDING**
   - **Needs:** Evidence bundle generation
   - **NSPFRP:** Create `utils/evidence/EvidenceBundleGenerator.ts` FIRST

**NSPFRP Prophylactic Action Items:**

**Before implementing time skew checks:**
```typescript
// utils/time/TimeSkewValidator.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for time uncertainty validation
 */
export function validateTimeSkew(atomicScore: any): {
  passes: boolean;
  skewMs: number;
  reason: string;
} {
  // Single implementation - all time skew logic here
  // Threshold: > 200ms → VETO
}
```

**Before implementing evidence bundles:**
```typescript
// utils/evidence/EvidenceBundleGenerator.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for evidence bundle generation
 */
export function generateEvidenceBundle(submissionHash: string): {
  jsonFiles: string[]; // 6 JSONs
  screenshots: string[];
  manifest: EvidenceManifest;
} {
  // Single implementation
}
```

**Status:** ✅ **ACCEPTED - FINISH STEEL FIRST, THEN GATES**

---

### ✅ Point 6: Recordkeeping Structure

**Understood:** 
- One Evidence folder per run (6 JSONs + screenshots + manifest)
- One Work board (Notion/Linear/GitHub Projects)
- Email = notification only

**NSPFRP Prophylactic Approach:**

**Create centralized evidence management:**

```typescript
// utils/evidence/EvidenceManager.ts (NEW - CREATE FIRST)
/**
 * NSPFRP: Single source of truth for evidence management
 * Prevents fractalized evidence handling errors
 */
export class EvidenceManager {
  static createEvidenceFolder(runId: string): string {
    // Single implementation
  }
  
  static saveEvidenceBundle(bundle: EvidenceBundle, folder: string): void {
    // Single implementation
  }
  
  static generateManifest(bundle: EvidenceBundle): EvidenceManifest {
    // Single implementation
  }
}
```

**Status:** ✅ **ACCEPTED - NSPFRP UTILITY FIRST**

---

### ✅ Point 7: 3-Sprint Implementation

**Understood:** Marcin's roadmap is realistic.

**Sprint 1: BridgeSpec JSON schema + validation; add T-B-01..03 fail-closed for official**

**NSPFRP Prophylactic Tasks:**
1. ✅ Create `utils/bridgespec/BridgeSpecExtractor.ts` FIRST
2. ✅ Create `utils/bridgespec/BridgeSpecValidator.ts` FIRST
3. ✅ Create `utils/bridgespec/BridgeSpecGate.ts` FIRST
4. ✅ Add BridgeSpec schema to `types/bridgespec.ts`
5. ✅ Add to NSPFRP protocol documentation
6. ✅ Then implement T-B-01..03 checks (using utilities)

**Sprint 2: Write BridgeSpec hash + T-B results into atomic_score.trace; UI shows Chamber A/B panels**

**NSPFRP Prophylactic Tasks:**
1. ✅ Extend `utils/scoring/AtomicScorer.ts` to include BridgeSpec hash
2. ✅ Create `components/BridgeSpecPanel.tsx` (Chamber A/B display)
3. ✅ Use `extractBridgeSpec()` utility everywhere (no copy-paste)
4. ✅ Use `extractSovereignScore()` for all scores (already enforced)

**Sprint 3: Couple degeneracy penalty into ε and n̂; show BubbleClass/tier logic**

**NSPFRP Prophylactic Tasks:**
1. ✅ Use `calculateBMPPrecision()` utility (created in Point 4)
2. ✅ Create `utils/gates/DegeneracyPenalty.ts` FIRST
3. ✅ Create `components/BubbleClassDisplay.tsx` for tier logic
4. ✅ All calculations use centralized utilities

**Status:** ✅ **ACCEPTED - NSPFRP UTILITIES FIRST IN EACH SPRINT**

---

### ✅ Point 8: Naming Correction

**Understood:**
- **Zero-Delta** = one truth everywhere (DB=API=UI=Cert=atomic)
- **ΔNovelty gate** = anti-duplicate progress gate

**NSPFRP Application:**

**Update NSPFRP protocol documentation:**

```typescript
// .nspfrp-protocol.md (UPDATE)
// Zero-Delta = Single source of truth enforcement
// ΔNovelty = Overlap-based novelty gate (1 - overlap_max ≥ Δmin)

// ✅ CORRECT usage:
import { extractSovereignScore } from '@/utils/thalet/ScoreExtractor';
const score = extractSovereignScore(data); // Zero-Delta enforced

import { extractLayerAGates } from '@/utils/gates/LayerAGateExtractor';
const gates = extractLayerAGates(data);
const deltaNovelty = gates.deltaNovelty; // ΔNovelty gate
```

**Status:** ✅ **ACCEPTED - NAMING CLARIFIED**

---

## 2. NSPFRP Prophylactic Implementation Strategy

### Core Principle: Create Utilities BEFORE Implementation

**NSPFRP Rule:** Never implement gate logic, BridgeSpec parsing, or n̂ calculations inline. Always create centralized utilities first, then use them.

### Implementation Order (NSPFRP Enforced)

#### Phase 0: Complete Steel Enforcement (Current)

1. ✅ **Time Skew Validator** (create utility first)
   - File: `utils/time/TimeSkewValidator.ts`
   - Usage: All time checks use this utility
   - NSPFRP: Single source of truth

2. ✅ **Evidence Bundle Generator** (create utility first)
   - File: `utils/evidence/EvidenceBundleGenerator.ts`
   - Usage: All evidence generation uses this utility
   - NSPFRP: Single source of truth

#### Phase 1: Layer A Gates (Hardening)

1. ✅ **Layer A Gate Extractor** (create utility first)
   - File: `utils/gates/LayerAGateExtractor.ts`
   - Usage: All Layer A gate logic uses this utility
   - NSPFRP: Single source of truth

2. ✅ **THALET Check Extractor** (create utility first)
   - File: `utils/gates/ThaletCheckExtractor.ts`
   - Usage: All THALET checks use this utility
   - NSPFRP: Single source of truth

#### Phase 2: BridgeSpec (Sprint 1)

1. ✅ **BridgeSpec Extractor** (create utility first)
   - File: `utils/bridgespec/BridgeSpecExtractor.ts`
   - Usage: All BridgeSpec extraction uses this utility
   - NSPFRP: Single source of truth

2. ✅ **BridgeSpec Validator** (create utility first)
   - File: `utils/bridgespec/BridgeSpecValidator.ts`
   - Usage: All BridgeSpec validation uses this utility
   - NSPFRP: Single source of truth

3. ✅ **BridgeSpec Gate** (create utility first)
   - File: `utils/bridgespec/BridgeSpecGate.ts`
   - Usage: All BridgeSpec gate logic uses this utility
   - NSPFRP: Single source of truth

#### Phase 3: n̂ and Coupling (Sprint 3)

1. ✅ **BMP Precision Calculator** (create utility first)
   - File: `utils/gates/PrecisionCoupling.ts`
   - Usage: All n̂ calculations use this utility
   - NSPFRP: Single source of truth

2. ✅ **Degeneracy Penalty** (create utility first)
   - File: `utils/gates/DegeneracyPenalty.ts`
   - Usage: All degeneracy calculations use this utility
   - NSPFRP: Single source of truth

---

## 3. NSPFRP Protocol Updates

### New Forbidden Patterns (To Be Added)

```typescript
// ❌ FORBIDDEN: Inline Layer A gate logic
const deltaNovelty = 1 - data.overlap_max;
const passes = deltaNovelty >= deltaMin;

// ❌ FORBIDDEN: Inline BridgeSpec extraction
const regime = data.bridgeSpec?.regime;
const observables = data.bridgeSpec?.observables;

// ❌ FORBIDDEN: Inline n̂ calculation
const n_hat = calculateN(data.bridgeSpec, epsilon);

// ❌ FORBIDDEN: Inline time skew check
const skew = Date.now() - data.timestamp;
if (skew > 200) return false;
```

### Required Patterns (To Be Added)

```typescript
// ✅ REQUIRED: Use Layer A gate extractor
import { extractLayerAGates } from '@/utils/gates/LayerAGateExtractor';
const gates = extractLayerAGates(data);

// ✅ REQUIRED: Use BridgeSpec extractor
import { extractBridgeSpec } from '@/utils/bridgespec/BridgeSpecExtractor';
const spec = extractBridgeSpec(data);

// ✅ REQUIRED: Use n̂ calculator
import { calculateBMPPrecision } from '@/utils/gates/PrecisionCoupling';
const precision = calculateBMPPrecision(spec, gates, epsilon);

// ✅ REQUIRED: Use time skew validator
import { validateTimeSkew } from '@/utils/time/TimeSkewValidator';
const timeCheck = validateTimeSkew(atomicScore);
```

---

## 4. What I Need (Pru's Requirements)

### Immediate (Before Any New Gates)

1. **Confirmation of ΔNovelty threshold (Δmin)**
   - What is the minimum ΔNovelty value for passing?
   - Should this be configurable or fixed?

2. **BridgeSpec JSON Schema**
   - Marcin's schema definition
   - Example BridgeSpec for reference
   - Validation rules

3. **n̂ Calculation Formula**
   - Exact formula for n̂ (BMP precision)
   - How ε (epsilon) is calculated
   - How BridgeSpec quality affects ε

4. **Time Skew Threshold**
   - Confirmed: > 200ms → VETO?
   - How to measure time skew in `atomic_score.trace`?

5. **Evidence Bundle Structure**
   - Which 6 JSONs are required?
   - Screenshot requirements
   - Manifest format

### For Sprint 1 (BridgeSpec)

1. **T-B-01..03 Check Definitions**
   - What are T-B-01, T-B-02, T-B-03?
   - What constitutes "fail-closed" for official status?

2. **Chamber A vs Chamber B Criteria**
   - How to determine if BridgeSpec satisfies Chamber B?
   - What makes a BridgeSpec "testable"?

### For Sprint 3 (n̂ Coupling)

1. **Degeneracy Penalty Formula**
   - How weak BridgeSpec increases ε
   - How strong BridgeSpec decreases ε
   - Exact coupling formula

2. **BubbleClass/Tier Logic**
   - Tier definitions
   - How n̂ maps to tiers
   - Display requirements

---

## 5. Implementation Commitment

### NSPFRP Prophylactic Promise

**I commit to:**

1. ✅ **Create utilities FIRST** before any gate logic implementation
2. ✅ **Use centralized utilities ONLY** (no inline logic)
3. ✅ **Update NSPFRP protocol** with new forbidden patterns
4. ✅ **Document all utilities** with clear usage examples
5. ✅ **Prevent fractalized errors** through protocol enforcement

### Code Quality Guarantees

- ✅ **Single Source of Truth:** All gate logic in one place
- ✅ **Type Safety:** Full TypeScript with proper types
- ✅ **Testability:** Utilities can be tested independently
- ✅ **Maintainability:** Fix bugs in one place, not 15+
- ✅ **Zero-Delta:** All authoritative values from `atomic_score.trace`

---

## 6. Next Steps

### Immediate Actions

1. **Wait for clarifications** (Δmin, BridgeSpec schema, n̂ formula, etc.)
2. **Create utility stubs** (empty functions with proper types)
3. **Update NSPFRP protocol** (add new forbidden patterns)
4. **Finish Steel enforcement** (time skew validator, evidence bundle)

### Sprint 1 Preparation

1. **BridgeSpec utilities** (extractor, validator, gate)
2. **T-B-01..03 checks** (using utilities)
3. **atomic_score.trace extension** (BridgeSpec hash)

### Sprint 2 Preparation

1. **UI components** (Chamber A/B panels)
2. **BridgeSpec display** (using extractor utility)

### Sprint 3 Preparation

1. **n̂ calculator** (using BridgeSpec and Layer A gates)
2. **Degeneracy penalty** (coupling logic)
3. **BubbleClass display** (tier visualization)

---

## 7. Conclusion

**Plan accepted.** I will apply NSPFRP prophylactically to prevent fractalized errors before they occur. All new gate logic, BridgeSpec handling, and n̂ calculations will use centralized utilities from day one.

**Zero-Delta discipline maintained:** All authoritative values come from `atomic_score.trace`.

**NSPFRP enforcement:** No inline gate logic, no copy-paste patterns, single source of truth for all new features.

**Ready to proceed** once clarifications are provided.

---

**Status:** ✅ **PLAN ACCEPTED - NSPFRP PROPHYLACTIC MODE ACTIVE**

**Next:** Await clarifications, then create utilities FIRST, implement gates SECOND.

---

**Resonative communion in alignment through generative efforts.**

