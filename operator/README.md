## Operator (FractiAI reference instance)

This directory describes the **operator layer**: the concrete deployment of the Syntheverse Protocol that users interact with.

An operator is responsible for infrastructure, safety boundaries, costs, and policy decisions. **FractiAI** is one operator and maintains the current reference client deployed on Vercel.

### Executive overview

- **Protocol vs operator**: the protocol is the portable spec; the operator is the running service that enforces policies and pays for compute/storage.
- **Reference client stance**: this repo's root Next.js app is the FractiAI-operated reference client (UI + API routes).
- **Replaceability**: other operators can implement the same protocol semantics with different stacks and policies.
- **Liberation Mission**: The operator implements the hydrogen spin MRI-based PoC protocol on the blockchain, ensuring contributions are no longer gatekept—visible and demonstrable to all via HHF-AI MRI science and technology.

### What FractiAI operates (today)

- **Web app + API routes**: Next.js (root `app/`)
- **Auth + DB**: Supabase Auth + Postgres (Drizzle migrations in `supabase/`)
- **Payments**: Stripe (Checkout + Billing Portal)
- **Deployment**: Vercel

### Operator contact (security + operations)

- **Security reports**: see `../SECURITY.md`
- **Email**: `pru@fractiai.com`, `daniel@fractiai.com`

### Operator-defined policies (examples)

- Qualification thresholds and epoch gating rules
- Rate limits, abuse prevention, and safety constraints
- Which evaluation providers/models are used
- Whether and how optional on-chain anchoring is offered
- Fees for registration or cost recovery (if any)

### Compliance boundary

The reference instance is an **experimental, non-custodial sandbox**. Participation does not confer ownership, equity, profit rights, or guaranteed outcomes.
