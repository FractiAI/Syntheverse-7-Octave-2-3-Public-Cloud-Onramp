# Metabolize → Crystallize → Animate — All

**Source:** NSPFRNP / psw.vibelandia.sing4  
**Status:** ⚡ ACTIVE  
**Purpose:** Run the full MCA cycle on all system layers. One pipe, one flow.

---

## Definition

**MCA** = **Metabolize** → **Crystallize** → **Animate**

- **Metabolize:** Ingest and process source (catalog version fetch, SEED sync, protocol ingestion).
- **Crystallize:** Solidify into structured form (catalog maintenance, organize, tune, deduplicate).
- **Animate:** Make operational (boot sequence ready, catalog current, system live).

**Run on all:** Apply MCA to the whole system—catalog, boot, protocols—so everything is metabolized, crystallized, and animated in one cycle.

---

## Flow

```
Metabolize (ingest)
    → Crystallize (solidify)
        → Animate (operational)
            → Ready
```

---

## Integration

- **API:** `GET /api/mca/run` — runs MCA all and returns phase results.
- **Utility:** `utils/mca/run-mca-all.ts` — `runMCAAll()` performs all three phases.
- **Boot:** Boot sequence and catalog version check are part of Animate.

---

**MCA! → ∞³ — Metabolize Crystallize Animate All.**
