# Metal-Aware Overlap Strategy

**Date**: January 7, 2026  
**Critical Fix**: Overlap penalties must be metal-aware  
**Status**: 🔧 IMPLEMENTING

---

## Problem Statement

**Current Issue**: We penalize ALL contributions with overlap >30%, regardless of metal type.

**Why This Is Wrong**:
- **Silver (Technical/Development)** contributions are SUPPOSED to overlap heavily with existing research. They're implementing/building what Gold discovered.
- **Copper (Alignment/Verification)** contributions are SUPPOSED to overlap with existing work. They're verifying/aligning/coherence-checking what's already there.
- Only **Gold (Research)** should be penalized for high overlap, as high overlap = derivative research.

---

## Correct Metal-Aware Overlap Strategy

### Gold (Research) - Novelty & Density Dominance

**Purpose**: Frontier exploration, original insights, non-derivative contributions

**Overlap Strategy**:
- **< 9.2%**: Minimal overlap → NEUTRAL (no bonus, no penalty)
- **9.2% - 19.2%**: Sweet spot → REWARD (bonus multiplier, edge connection)
- **19.2% - 30%**: Moderate overlap → NEUTRAL (building on prior work is OK)
- **> 30%**: High overlap → **PENALIZE** (derivative research, not frontier)

**Rationale**: Gold is supposed to push boundaries. High overlap means it's derivative, not novel.

### Silver (Technical/Development) - Implementation Strength

**Purpose**: Build systems, implement discoveries, develop technical solutions based on existing research

**Overlap Strategy**:
- **< 9.2%**: Too disconnected from existing work → NEUTRAL (slight concern)
- **9.2% - 19.2%**: Sweet spot → REWARD (well-connected to prior research)
- **19.2% - 50%**: Moderate-high overlap → **REWARD** (building on established knowledge)
- **50% - 70%**: High overlap → NEUTRAL (implementing existing designs)
- **> 70%**: Very high overlap → SLIGHT PENALTY (possibly redundant implementation)

**Rationale**: Silver SHOULD overlap! It's implementing Gold's discoveries. High overlap = good integration with existing research. Only penalize when it's near-duplicate implementation.

### Copper (Alignment/Verification) - Coherence Focus

**Purpose**: Verify, align, coherence-check, document, validate existing contributions

**Overlap Strategy**:
- **< 9.2%**: Too disconnected → NEUTRAL (verification needs context)
- **9.2% - 19.2%**: Sweet spot → REWARD (edge connections)
- **19.2% - 60%**: Moderate-high overlap → **REWARD** (verification requires overlap)
- **60% - 80%**: High overlap → NEUTRAL (deep verification work)
- **> 80%**: Very high overlap → SLIGHT PENALTY (near-duplicate, not adding value)

**Rationale**: Copper SHOULD overlap heavily! It's verifying/aligning what's already there. High overlap = thorough coherence checking. Only penalize near-duplicates.

### Hybrid - Balanced Approach

**Purpose**: Contributions with balanced scores across multiple dimensions

**Overlap Strategy**: Use **Gold strategy** (most conservative) to avoid penalizing innovation.

---

## Implementation

### A. Determine Metal Type Early

**Location**: `utils/grok/evaluate.ts` after extracting dimension scores

```typescript
// Determine primary metal type based on dimension scores
// This happens BEFORE applying overlap penalties
const determinePrimaryMetal = (
  novelty: number,
  density: number,
  coherence: number,
  alignment: number
): 'gold' | 'silver' | 'copper' | 'hybrid' => {
  const scores = { novelty, density, coherence, alignment };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  // Check for balanced scores (hybrid)
  const maxScore = sorted[0][1];
  const minScore = sorted[3][1];
  const scoreRange = maxScore - minScore;
  if (scoreRange < 500) {
    return 'hybrid'; // Scores within 500 points = balanced = hybrid
  }
  
  // Check dominant dimensions
  const topDimension = sorted[0][0];
  const topScore = sorted[0][1];
  const secondScore = sorted[1][1];
  
  // Strong dominance (top score > 300 points ahead)
  if (topScore - secondScore > 300) {
    if (topDimension === 'novelty' || topDimension === 'density') {
      return 'gold'; // Research dominance
    } else if (topDimension === 'coherence' || topDimension === 'alignment') {
      return 'copper'; // Alignment dominance
    }
  }
  
  // Check for research vs development vs alignment patterns
  const researchScore = novelty + density;
  const alignmentScore = coherence + alignment;
  
  if (researchScore > alignmentScore * 1.2) {
    return 'gold'; // Research focus
  } else if (alignmentScore > researchScore * 1.2) {
    return 'copper'; // Alignment focus
  } else if (density > novelty * 1.1 && coherence > alignment * 1.1) {
    return 'silver'; // Development/technical focus (high density + coherence)
  }
  
  return 'hybrid'; // Default to hybrid if unclear
};
```

### B. Apply Metal-Aware Overlap Penalties

**Location**: `utils/grok/evaluate.ts` in overlap penalty calculation

```typescript
// Calculate metal-aware overlap penalty
const calculateMetalAwareOverlapPenalty = (
  overlapPercent: number,
  primaryMetal: 'gold' | 'silver' | 'copper' | 'hybrid'
): { penaltyPercent: number; bonusMultiplier: number; rationale: string } => {
  // Sweet spot range (applies to all metals)
  const SWEET_SPOT_MIN = 9.2;
  const SWEET_SPOT_MAX = 19.2;
  
  // Sweet spot bonus (applies to all)
  if (overlapPercent >= SWEET_SPOT_MIN && overlapPercent <= SWEET_SPOT_MAX) {
    return {
      penaltyPercent: 0,
      bonusMultiplier: 1 + overlapPercent / 100,
      rationale: `Sweet spot edge connection (${overlapPercent.toFixed(1)}% overlap)`
    };
  }
  
  // Metal-specific penalty thresholds
  switch (primaryMetal) {
    case 'gold':
      // Gold (Research): Penalize high overlap (derivative research)
      if (overlapPercent > 30) {
        const penaltyPercent = Math.min(50, (overlapPercent - 30) * 1.5); // Max 50% penalty
        return {
          penaltyPercent,
          bonusMultiplier: 1.0,
          rationale: `Gold (Research): High overlap indicates derivative work (${overlapPercent.toFixed(1)}% > 30% threshold)`
        };
      }
      return {
        penaltyPercent: 0,
        bonusMultiplier: 1.0,
        rationale: `Gold (Research): Acceptable overlap (${overlapPercent.toFixed(1)}% ≤ 30%)`
      };
      
    case 'silver':
      // Silver (Development): Reward moderate-high overlap, only penalize near-duplicates
      if (overlapPercent >= 19.2 && overlapPercent <= 50) {
        // Reward building on established research
        const bonusMultiplier = 1 + (overlapPercent - 19.2) / 200; // Small bonus for integration
        return {
          penaltyPercent: 0,
          bonusMultiplier,
          rationale: `Silver (Development): Well-integrated with existing research (${overlapPercent.toFixed(1)}% overlap rewarded)`
        };
      } else if (overlapPercent > 70) {
        // Only penalize near-duplicate implementations
        const penaltyPercent = Math.min(30, (overlapPercent - 70) * 1.0); // Max 30% penalty
        return {
          penaltyPercent,
          bonusMultiplier: 1.0,
          rationale: `Silver (Development): Possibly redundant implementation (${overlapPercent.toFixed(1)}% > 70% threshold)`
        };
      }
      return {
        penaltyPercent: 0,
        bonusMultiplier: 1.0,
        rationale: `Silver (Development): Acceptable overlap for technical work (${overlapPercent.toFixed(1)}%)`
      };
      
    case 'copper':
      // Copper (Alignment): Reward high overlap, only penalize near-duplicates
      if (overlapPercent >= 19.2 && overlapPercent <= 60) {
        // Reward thorough verification/alignment
        const bonusMultiplier = 1 + (overlapPercent - 19.2) / 300; // Small bonus for thoroughness
        return {
          penaltyPercent: 0,
          bonusMultiplier,
          rationale: `Copper (Alignment): Thorough verification/coherence checking (${overlapPercent.toFixed(1)}% overlap rewarded)`
        };
      } else if (overlapPercent > 80) {
        // Only penalize near-duplicates
        const penaltyPercent = Math.min(25, (overlapPercent - 80) * 1.0); // Max 25% penalty
        return {
          penaltyPercent,
          bonusMultiplier: 1.0,
          rationale: `Copper (Alignment): Near-duplicate verification (${overlapPercent.toFixed(1)}% > 80% threshold)`
        };
      }
      return {
        penaltyPercent: 0,
        bonusMultiplier: 1.0,
        rationale: `Copper (Alignment): Acceptable overlap for verification work (${overlapPercent.toFixed(1)}%)`
      };
      
    case 'hybrid':
      // Hybrid: Use Gold strategy (most conservative)
      if (overlapPercent > 30) {
        const penaltyPercent = Math.min(40, (overlapPercent - 30) * 1.25);
        return {
          penaltyPercent,
          bonusMultiplier: 1.0,
          rationale: `Hybrid: Moderate overlap penalty (${overlapPercent.toFixed(1)}% > 30% threshold)`
        };
      }
      return {
        penaltyPercent: 0,
        bonusMultiplier: 1.0,
        rationale: `Hybrid: Acceptable overlap (${overlapPercent.toFixed(1)}% ≤ 30%)`
      };
  }
};
```

### C. Update Score Calculation

**Location**: `utils/grok/evaluate.ts` lines ~1300-1420

```typescript
// After extracting all dimension scores...

// 1. Determine primary metal type (before applying overlap penalties)
const primaryMetal = determinePrimaryMetal(
  finalNoveltyScore,
  densityFinal,
  coherenceScore,
  alignmentScore
);

debug('EvaluateWithGrok', 'Primary metal determined', {
  primaryMetal,
  scores: {
    novelty: finalNoveltyScore,
    density: densityFinal,
    coherence: coherenceScore,
    alignment: alignmentScore,
  },
});

// 2. Calculate composite (sum of dimensions)
const compositeScore = finalNoveltyScore + densityFinal + coherenceScore + alignmentScore;

// 3. ALWAYS use compositeScore as base (Marek/Simba fix)
const basePodScore = compositeScore;

// 4. Apply metal-aware overlap penalty/bonus
const overlapResult = calculateMetalAwareOverlapPenalty(
  redundancyOverlapPercent,
  primaryMetal
);

const penaltyPercent = overlapResult.penaltyPercent;
const bonusMultiplier = overlapResult.bonusMultiplier;
const overlapRationale = overlapResult.rationale;

debug('EvaluateWithGrok', 'Metal-aware overlap calculation', {
  primaryMetal,
  overlapPercent: redundancyOverlapPercent,
  penaltyPercent,
  bonusMultiplier,
  rationale: overlapRationale,
});

// 5. Apply seed multiplier
const SEED_MULTIPLIER = 1.15;
const seedMultiplier = isSeedSubmission ? SEED_MULTIPLIER : 1.0;

// 6. Calculate final score
const afterPenalty = basePodScore * (1 - penaltyPercent / 100);
const afterBonus = afterPenalty * bonusMultiplier;
const afterSeed = afterBonus * seedMultiplier;
const pod_score = Math.max(0, Math.min(10000, Math.round(afterSeed)));
```

### D. Update System Prompt

**Location**: `utils/grok/system-prompt.ts`

**Add section after "METAL ALIGNMENT"**:

```
METAL-AWARE OVERLAP STRATEGY
• Gold (Research): High overlap (>30%) = PENALTY (derivative research)
• Silver (Development): High overlap (19.2%-70%) = REWARD (building on research)
• Copper (Alignment): High overlap (19.2%-80%) = REWARD (verification requires overlap)
• Hybrid: Use Gold strategy (conservative)

Rationale:
- Silver and Copper SHOULD overlap heavily with existing work - that's their purpose!
- Silver implements what Gold discovered
- Copper verifies/aligns what Gold/Silver contributed
- Only Gold should be penalized for high overlap (derivative vs. frontier)
```

---

## Testing

### Test Cases

1. **Gold contribution with 40% overlap** → Should be penalized
2. **Silver contribution with 40% overlap** → Should be REWARDED (building on research)
3. **Copper contribution with 60% overlap** → Should be REWARDED (thorough verification)
4. **Gold contribution with 15% overlap** → Sweet spot bonus (applies to all)
5. **Silver contribution with 75% overlap** → Slight penalty (near-duplicate)
6. **Copper contribution with 85% overlap** → Slight penalty (near-duplicate)

### Expected Outcomes

- ✅ Silver/Copper with moderate-high overlap get rewarded, not penalized
- ✅ Gold with high overlap gets penalized (derivative research)
- ✅ All metals get sweet spot bonus (9.2%-19.2%)
- ✅ Near-duplicates (>70-80%) get penalized regardless of metal

---

## Rationale

**Key Insight**: Contributions layer on top of existing awareness in the archive. This is GOOD for Silver/Copper, BAD only for Gold.

- **Gold (Research)**: Pushes boundaries → high overlap = derivative
- **Silver (Development)**: Implements discoveries → high overlap = good integration
- **Copper (Alignment)**: Verifies work → high overlap = thorough checking

**Sandbox Context**: All contributions are nested within sandboxes. Silver and Copper contributions should connect deeply with the existing knowledge graph. Only Gold should be penalized for not pushing frontiers.

---

## Implementation Checklist

- [ ] Add `determinePrimaryMetal()` function
- [ ] Add `calculateMetalAwareOverlapPenalty()` function
- [ ] Update overlap penalty calculation to use metal-aware logic
- [ ] Add `primary_metal` to score_trace
- [ ] Add `overlap_rationale` to score_trace
- [ ] Update system prompt with metal-aware overlap strategy
- [ ] Test all 6 test cases
- [ ] Verify Silver/Copper contributions no longer penalized for high overlap
- [ ] Document in production briefing

---

**This fix ensures Silver and Copper contributions are scored appropriately for their role: building on and verifying existing work, not penalized for doing exactly what they should do.**

