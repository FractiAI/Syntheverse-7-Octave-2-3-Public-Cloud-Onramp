# Evidence Packet System - Implementation Guide

**Date:** January 13, 2026  
**Status:** ✅ **Option A Implemented** - Direct API Links Available  
**For:** Marek, Simba, Pablo, Lexary Nova (ARP/Zero-Delta Verification)

---

## Quick Answer: Option A is LIVE

**You can now access full evidence for any submission hash:**

### Direct API Links (Option A) ✅ IMPLEMENTED

For any submission hash (e.g., `7bcba7f8a2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a`):

**1. View Stored Record (GET):**
```
https://syntheverse-poc.vercel.app/api/archive/contributions/7bcba7f8a2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a
```

**Returns:**
- Full 64-char hash
- `atomic_score` (complete with execution context, trace, integrity hash)
- `pod_score` (sovereign value)
- All dimension scores
- Metadata with scoring_metadata, pod_composition, score_trace
- Toggle states
- Timestamp (backend-generated)
- Zero-Delta verified values

**2. Trigger Evaluation (POST):**
```bash
curl -X POST https://syntheverse-poc.vercel.app/api/evaluate/7bcba7f8a2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a
```

**Returns:**
- Fresh evaluation result
- `atomic_score` (newly computed)
- LLM metadata (model, timestamp, system prompt hash)
- Full trace with toggles

---

## UI Changes - Full Hash Now Visible

### Before (PROBLEM):
- Submission forms showed: `7bcba7f8a254...` (truncated)
- Hard to copy full hash for API verification

### After (FIXED):
- **Submission forms now show FULL 64-char hash**
- Direct link to JSON API below hash: "📊 View JSON"
- Archive views already showed full hash (no change needed)

---

## Complete Evidence Retrieval Workflow

### Step 1: Get the Full Hash

**From UI (after submission):**
- Full hash displayed in "Exam ID (HHF-AI HASH)" section
- Click "📊 View JSON" link to open API directly

**From Archive/Frontier:**
- Full hash shown in "HHF-AI HASH" field
- Copy entire hash

### Step 2: Access Evidence

**Browser (for visual inspection):**
```
https://syntheverse-poc.vercel.app/api/archive/contributions/<FULL_HASH>
```

**Command Line (for automation):**
```bash
# Get full evidence JSON
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/<HASH>" | jq '.' > evidence_${HASH}.json

# Zero-Delta check
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/<HASH>" | \
  jq '{pod: .pod_score, atomic: .atomic_score.final, match: (.pod_score == .atomic_score.final)}'

# Get atomic score details
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/<HASH>" | \
  jq '.atomic_score'
```

### Step 3: Verify Zero-Delta

**Quick verification:**
```bash
HASH="7bcba7f8a2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a"

curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{
    submission_hash: .submission_hash,
    pod_score: .pod_score,
    atomic_final: .atomic_score.final,
    atomic_clamped: .atomic_score.final_clamped,
    metadata_pod: .metadata.pod_score,
    all_match: (
      (.pod_score == .atomic_score.final) and 
      (.metadata.pod_score == .atomic_score.final)
    ),
    timestamp: .metadata.scoring_metadata.evaluation_timestamp,
    toggles: .atomic_score.execution_context.toggles,
    integrity_hash: .atomic_score.integrity_hash
  }'
```

---

## What's in the JSON Response

### Top-Level Fields:
```json
{
  "submission_hash": "full-64-char-hash",
  "title": "Test 2 - Calibration",
  "contributor": "marek@example.com",
  "pod_score": 8600,          // ← SOVEREIGN SOURCE (from atomic_score.final)
  "novelty": 2150,
  "density": 2150,
  "coherence": 2150,
  "alignment": 2150,
  "atomic_score": { /* ... */ },  // ← Single Source of Truth
  "metadata": { /* ... */ },
  "created_at": "2026-01-13T...",
  "updated_at": "2026-01-13T..."
}
```

### atomic_score Object:
```json
{
  "final": 8600.0,              // ← SOVEREIGN FIELD (full precision)
  "final_clamped": 8600,        // ← Integer for display
  "execution_context": {
    "timestamp_utc": "2026-01-13T12:34:56.789Z",
    "toggles": {
      "overlap_on": false,
      "seed_on": false,
      "edge_on": false,
      "metal_policy_on": true
    },
    "seed": "uuid-here",
    "pipeline_version": "2.0.0-thalet",
    "operator_id": "syntheverse-primary"
  },
  "trace": {
    "composite": 8600,
    "penalty_percent": 4.4,
    "penalty_percent_exact": 4.400000,  // ← Full precision
    "bonus_multiplier": 1.05,
    "bonus_multiplier_exact": 1.050000,
    "seed_multiplier": 1.0,
    "edge_multiplier": 1.0,
    "formula": "Final = (Composite=8600 × (1 - 0%/100)) × 1.000 = 8600",
    "intermediate_steps": {
      "after_penalty": 8600.0,
      "after_penalty_exact": 8600.000000,  // ← No rounding
      "after_bonus": 8600.0,
      "after_bonus_exact": 8600.000000,
      "after_seed": 8600.0,
      "raw_final": 8600.0,
      "clamped_final": 8600
    }
  },
  "integrity_hash": "abc123def456..."  // ← SHA-256 for verification
}
```

### metadata.score_trace Object (Overlap Details):
```json
{
  "overlap_percent": 44.3,
  "penalty_percent_computed": 4.4,
  "penalty_percent_applied": 0.0,      // ← Different because toggle OFF
  "penalty_difference_reason": "Overlap adjustments disabled via config toggle - penalty computed but not applied",
  "bonus_multiplier_computed": 1.05,
  "bonus_multiplier_applied": 1.0,
  "bonus_difference_reason": "Overlap adjustments disabled via config toggle - bonus computed but not applied (1.0 used)",
  "overlap_adjustments_enabled": false,
  "toggles": {
    "overlap_on": false,
    "seed_on": false,
    "edge_on": false
  }
}
```

---

## Future Options (Not Yet Implemented)

### Option B: Evidence Packet ZIP 📦

**Proposed Script:**
```bash
#!/bin/bash
# evidence-packet-generator.sh
HASH=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DIR="evidence_${HASH}_${TIMESTAMP}"

mkdir -p "${DIR}"

# 1. Fetch stored record
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" > "${DIR}/stored_record.json"

# 2. Fetch evaluation details
curl -s "https://syntheverse-poc.vercel.app/api/evaluate/${HASH}" > "${DIR}/evaluation.json" 2>&1

# 3. Create verification report
echo "Zero-Delta Verification Report" > "${DIR}/verification.txt"
echo "Generated: ${TIMESTAMP}" >> "${DIR}/verification.txt"
echo "" >> "${DIR}/verification.txt"
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{pod: .pod_score, atomic: .atomic_score.final, match: (.pod_score == .atomic_score.final)}' >> "${DIR}/verification.txt"

# 4. Extract key fields
echo "Extracting key fields..." >> "${DIR}/verification.txt"
curl -s "https://syntheverse-poc.vercel.app/api/archive/contributions/${HASH}" | \
  jq '{
    timestamp: .metadata.scoring_metadata.evaluation_timestamp,
    toggles: .atomic_score.execution_context.toggles,
    integrity_hash: .atomic_score.integrity_hash
  }' >> "${DIR}/verification.txt"

# 5. Create README
cat > "${DIR}/README.md" << EOF
# Evidence Packet for ${HASH}

## Contents
- stored_record.json: Full API response from /api/archive/contributions
- evaluation.json: Evaluation details (if available)
- verification.txt: Zero-Delta verification report
- README.md: This file

## Verification
\`\`\`bash
# Check Zero-Delta
jq '{pod: .pod_score, atomic: .atomic_score.final, match: (.pod_score == .atomic_score.final)}' stored_record.json
\`\`\`

Generated: ${TIMESTAMP}
EOF

# 6. Create ZIP
zip -r "evidence_packet_${HASH}_${TIMESTAMP}.zip" "${DIR}"
echo "✅ Evidence packet created: evidence_packet_${HASH}_${TIMESTAMP}.zip"
```

**Status:** Script template provided, not deployed

---

### Option C: Read-Only Dashboard 📊

**Proposed URL:**
```
https://syntheverse-poc.vercel.app/evidence/<HASH>
```

**Would Display:**
- Full 64-char hash (with copy button)
- Atomic score details (formatted)
- Execution context (timestamp, toggles, pipeline version)
- Complete trace with all intermediate steps
- Zero-Delta verification status (green checkmark if match)
- Toggle states (visual indicators)
- Download JSON button
- Integrity hash verification

**Status:** Not yet implemented (would require new page component)

---

## Current Status Summary

| Option | Status | Description |
|--------|--------|-------------|
| **A: Direct API Links** | ✅ **LIVE** | Browser or curl access to JSON endpoints |
| **B: Evidence Packet ZIP** | 📝 Template Ready | Script provided, can be run manually |
| **C: Dashboard View** | 🔜 Planned | Would need UI component development |

---

## Recommendation for ARP/Zero-Delta Verification

**Use Option A (Currently Available):**

1. **For Manual Inspection:**
   - Copy hash from UI (now shows full 64 chars)
   - Open: `https://syntheverse-poc.vercel.app/api/archive/contributions/<HASH>`
   - Browser will display formatted JSON
   - Search for `atomic_score`, `pod_score`, `integrity_hash`

2. **For Automated Verification:**
   - Use curl commands (see Step 2 above)
   - Save JSON to file for records
   - Run Zero-Delta verification
   - Extract integrity hash for chain of custody

3. **For Evidence Collection:**
   - Save JSON response
   - Screenshot operator console (toggle states)
   - Screenshot UI display
   - Document hash + timestamp + toggles

---

## GitHub vs Live Data

**You're correct:** GitHub contains code, not live evaluation data.

**For live run data, you need:**
- ✅ API endpoints (available now)
- ✅ Full hash from UI (fixed today)
- ✅ Direct browser access (working)
- ✅ Command-line tools (curl + jq)

**For reproducibility:**
- Integrity hash (in atomic_score)
- Execution context (timestamp, toggles, seed)
- System prompt hash (in llm_metadata)
- Archive snapshot ID (in metadata)

---

## Questions?

**Need Option B script deployed as a tool?** Let us know.  
**Want Option C dashboard built?** We can prioritize.  
**Other format needed?** Tell us your workflow.

**For now, Option A (Direct API Links) provides everything needed for ARP/Zero-Delta verification.**

---

**All evidence is accessible via API. Full hashes now visible in UI. Zero-Delta verification ready.**

— Engineering Team

