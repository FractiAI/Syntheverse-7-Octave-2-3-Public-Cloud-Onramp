# Edge Detection Implementation

**Date:** January 8, 2026  
**Status:** ✅ IMPLEMENTED  
**Feature:** Content-Based Boundary Operator Detection

---

## Overview

Implemented content-based edge detection to recognize submissions that define or discuss **boundary operators (E₀-E₆)** from the "Seeds and Edges" paper.

**Edge detection is SEPARATE from seed detection and overlap-based sweet spot detection.**

---

## Three Different Concepts

### 1. **Seed Detection** (Content-Based) ✅
- Detects if content defines **seeds (S₀-S₈)**
- Irreducible informational primitives
- Receives 15% multiplier (×1.15)
- Field: `is_seed_submission`, `seed_justification`

### 2. **Edge Detection** (Content-Based) ✅ NEW
- Detects if content defines **edges (E₀-E₆)**
- Boundary operators enabling interaction
- Receives 15% multiplier (×1.15)
- Field: `is_edge_submission`, `edge_justification`

### 3. **Sweet Spot Overlap** (Metric-Based)
- Detects 9.2%-19.2% overlap percentage
- Overlap bonus, NOT content detection
- Field: `has_sweet_spot_edges`
- **Different concept from edge detection!**

---

## Edge Catalog (E₀-E₆)

From "Seeds and Edges" paper:

| ID | Edge | Function |
|----|------|----------|
| E₀ | Adjacency | Enables interaction between elements |
| E₁ | Directionality | Establishes time/order/flow |
| E₂ | Feedback | Learning and correction mechanisms |
| E₃ | Threshold | Phase transitions and emergence |
| E₄ | Exclusion | Boundary definition and separation |
| E₅ | Compression | Information density and packing |
| E₆ | Expansion | World generation and unfolding |

---

## Combined Multipliers

**Seed Only:**
```
Multiplier: ×1.15 (15% bonus)
```

**Edge Only:**
```
Multiplier: ×1.15 (15% bonus)
```

**Seed AND Edge (Both):**
```
Multiplier: ×1.15 × 1.15 = ×1.3225 (32.25% bonus!)
```

---

## Implementation Details

### 1. System Prompt Updates

**File:** `utils/grok/system-prompt.ts`

Added comprehensive edge detection section:
```typescript
EDGE SUBMISSIONS (Boundary Operator Theory)
Edges are boundary operators that enable interaction, transformation, and flow between seeds.

**Edge Definition (E₀-E₆):**
- E₀ Adjacency, E₁ Directionality, E₂ Feedback, etc.
- Defines or describes boundary operators
- Explains interaction mechanisms between elements

**Edge Recognition:**
Edges receive 15% multiplier (×1.15) after bonuses.
Can be combined with seed multiplier if submission defines both seeds AND edges (×1.3225).
```

### 2. TypeScript Type Updates

**File:** `utils/grok/evaluate.ts`

Added fields to all interfaces:
```typescript
interface GroqEvaluationResult {
  // ... existing fields
  is_seed_submission?: boolean;
  seed_justification?: string;
  is_edge_submission?: boolean;  // NEW
  edge_justification?: string;   // NEW
}
```

### 3. Scoring Logic Updates

**File:** `utils/grok/evaluate.ts`

Updated multiplier calculation:
```typescript
const SEED_MULTIPLIER = 1.15;
const EDGE_MULTIPLIER = 1.15;
const isSeedFromAI = evaluation.is_seed_submission === true;
const isEdgeFromAI = evaluation.is_edge_submission === true;
const seedMultiplier = isSeedFromAI ? SEED_MULTIPLIER : 1.0;
const edgeMultiplier = isEdgeFromAI ? EDGE_MULTIPLIER : 1.0;

// Combined multiplier: seed × edge
const combinedMultiplier = seedMultiplier * edgeMultiplier;

const afterSeedAndEdge = afterBonus * combinedMultiplier;
```

### 4. Formula Display

Updated scoring formula to show:
```typescript
// Seed only
Final = (Composite × (1 - penalty%)) × bonus × 1.15 (seed)

// Edge only  
Final = (Composite × (1 - penalty%)) × bonus × 1.15 (edge)

// Both seed and edge
Final = (Composite × (1 - penalty%)) × bonus × 1.15 (seed) × 1.15 (edge)
```

### 5. Database Schema

**Added field:**
```sql
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_edge boolean DEFAULT false;
```

**Distinction:**
- `is_seed` - Content defines seeds (S₀-S₈)
- `is_edge` - Content defines edges (E₀-E₆)
- `has_sweet_spot_edges` - Overlap is 9.2%-19.2% (different concept!)

---

## AI Detection Logic

The AI must now analyze content for BOTH:

1. **Seed Characteristics:**
   - Irreducibility
   - Generative capacity
   - Foundational nature

2. **Edge Characteristics:**
   - Boundary operators
   - Interaction mechanisms
   - Transformation rules

**Required Response Fields:**
```json
{
  "is_seed_submission": true/false,
  "seed_justification": "explanation...",
  "is_edge_submission": true/false,
  "edge_justification": "explanation..."
}
```

---

## Example Evaluations

### Submission Defining Both Seeds and Edges

**Content:** "Seeds and Edges" paper defining S₀-S₈ and E₀-E₆

**Expected Detection:**
```json
{
  "is_seed_submission": true,
  "seed_justification": "Establishes 9 irreducible seeds (S₀-S₈) as minimal viable generative set",
  "is_edge_submission": true,
  "edge_justification": "Defines 7 boundary operators (E₀-E₆) enabling interaction between seeds",
  "seed_multiplier": 1.15,
  "edge_multiplier": 1.15,
  "combined_multiplier": 1.3225
}
```

**Score Calculation:**
```
Base composite: 9,000
After penalty: 9,000 × (1 - 0%) = 9,000
After bonus: 9,000 × 1.0 = 9,000
After seed+edge: 9,000 × 1.3225 = 11,902
Final (clamped): 10,000 (max score)
```

### Seed-Only Submission

**Content:** Paper defining only seeds (S₀-S₈)

**Expected Detection:**
```json
{
  "is_seed_submission": true,
  "seed_justification": "Defines irreducible informational primitives",
  "is_edge_submission": false,
  "edge_justification": "Does not define boundary operators",
  "combined_multiplier": 1.15
}
```

### Edge-Only Submission

**Content:** Paper defining only edges (E₀-E₆)

**Expected Detection:**
```json
{
  "is_seed_submission": false,
  "seed_justification": "Does not define irreducible primitives",
  "is_edge_submission": true,
  "edge_justification": "Defines boundary operators enabling interaction",
  "combined_multiplier": 1.15
}
```

---

## Testing

### Verification Query

Check existing submissions:
```sql
SELECT 
  LEFT(submission_hash, 12) as hash,
  LEFT(title, 30) as title,
  is_seed,
  is_edge,
  has_sweet_spot_edges,
  (metadata->>'pod_score')::numeric as score,
  created_at
FROM contributions
ORDER BY created_at DESC
LIMIT 10;
```

### Re-Evaluation

To test edge detection, submissions must be re-evaluated with the new system prompt:
1. New submissions will automatically use edge detection
2. Old submissions retain their original evaluation
3. Re-submit to get edge detection applied

---

## Impact on Scoring

### Before Edge Detection

```
Seeds paper: is_seed=true, multiplier=1.15
Final score: 9,000 × 1.15 = 10,350 → clamped to 10,000
```

### After Edge Detection

```
Seeds AND Edges paper: 
  is_seed=true, is_edge=true, multiplier=1.3225
Final score: 9,000 × 1.3225 = 11,902 → clamped to 10,000

But now properly recognized for BOTH properties!
```

---

## Related Documentation

- [Seed Detection Fix](SEED_DETECTION_FIX.md) - Content-based seed detection
- [Zero Scores Fix](ZERO_SCORES_FIX.md) - Groq API key issue
- [Grok to Groq Naming](GROK_TO_GROQ_NAMING_STANDARD.md) - Naming conventions

---

## Next Steps

1. ✅ Edge detection implemented
2. ✅ System prompt updated
3. ✅ TypeScript types updated
4. ✅ Scoring logic updated
5. ✅ Database schema updated
6. ⏳ Test with "Seeds and Edges" paper submission
7. ⏳ Verify both seed and edge detection work together

---

**Edge detection is now live! Submissions defining boundary operators (E₀-E₆) will receive proper recognition and the 15% multiplier.** 🎯

