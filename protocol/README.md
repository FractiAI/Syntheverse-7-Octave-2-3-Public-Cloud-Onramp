## Syntheverse Protocol (spec)

This directory describes the **Syntheverse Protocol**: a public, implementation-agnostic specification for how Proof‑of‑Contribution (PoC) works end-to-end.

The protocol defines **what must be true** (invariants, data contracts, lifecycle semantics). It does not mandate **who runs it** or **how it is funded**.

### Executive overview

- **Purpose**: turn contributions into **durable, auditable records** with an evaluation lens and optional anchoring.
- **Design stance**: protocol-first separation between **spec** (portable) and **operators** (deployments).
- **Non-financial framing**: protocol primitives support accounting/coordination; operators may add fees/cost recovery, but the protocol does not encode investment claims.

### Protocol primitives (high level)

- **Contribution (PoC)**: a submission with content, metadata, and an immutable identifier (e.g., hash).
- **Archive-first**: submissions are recorded immediately to support dedupe/redaction/supersession logic.
- **Evaluation lens**: a scoring function producing structured outputs (e.g., novelty/density/coherence/alignment plus redundancy).
- **Qualification**: policy-driven thresholding over evaluation outputs (operator-defined thresholds; protocol defines the semantics).
- **Optional anchoring**: optional on-chain registration/attestation of qualified PoCs (operator can choose chain/tooling).

### What’s intentionally NOT in the protocol

- Operator identity (FractiAI is one operator; not the protocol)
- Hosting stack (Vercel/Supabase/Stripe are implementation choices)
- Model providers and prompt details (operators can vary)
- Pricing, fees, subscriptions, and commercial terms (operator-level)

### Where the current reference client lives

- **Reference client (FractiAI operator implementation)**: see `../operator/README.md`
- **Implementation docs**: see `../docs/`

### Status

This spec is under active iteration. The “source of truth” for current behavior is the reference client implementation at the repo root (`app/`, `utils/`, `supabase/`).



