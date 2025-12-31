## Syntheverse: protocol + operator reference client

This repository is organized around a simple distinction:

- **The Syntheverse Protocol**: a public, implementation-agnostic specification for Proof‑of‑Contribution (PoC) primitives, scoring lenses, data models, and optional on‑chain anchoring.
- **Operators**: deployments that run a concrete implementation of the protocol with real infrastructure choices, policies, and costs. **FractiAI** is one operator (and maintains the reference client deployed today).

If you only read one thing, start here:

- **Protocol overview**: `protocol/README.md`
- **Operator (FractiAI) overview**: `operator/README.md`

### Executive overview (intentions + structure)

- **What we’re building**: an operator-safe “lens + archive + optional anchoring” system where contributions become durable, auditable records—without token-sale framing.
- **What “protocol-first” means here**: the *spec* (what must be true) is separated from the *operator* (how it is run).
- **What FractiAI is (and is not)**: FractiAI operates a reference instance and evolves the reference client; it does **not** equal “the protocol.”

### Live deployment (FractiAI operator instance)

The current reference client is deployed on Vercel:

- **Production URL**: `https://syntheverse-poc.vercel.app`

If you deploy your own operator instance, you must update:

- **Site URLs**: `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WEBSITE_URL`
- **Supabase Auth**: Site URL + Redirect URLs (OAuth callbacks)
- **Stripe webhooks**: endpoint URL + `STRIPE_WEBHOOK_SECRET`

### What’s in this repo

This repo currently contains:

- **Operator UI + API routes (Next.js)**: the deployed reference client (root `app/`, `components/`, `utils/`, `supabase/` migrations, etc.)
- **Protocol documentation**: `protocol/` (spec, invariants, and terminology)
- **Operator documentation**: `operator/` (policies, infra choices, and boundaries)
- **Implementation docs**: `docs/` (deployment, OAuth, Supabase, Stripe, testing, etc.)
- **Legacy / R&D workspace**: `syntheverse-ui/` (large experimental subtree; treated as separate internal workspace)

### Core capabilities (reference client)

- **Proof‑of‑Contribution lifecycle**: submission → archive → evaluation → qualification → optional anchoring
- **Scoring lens**: novelty, density, coherence, alignment (+ redundancy penalty)
- **3D vectorized sandbox map**: Three.js + R3F visualization of PoCs as navigable infrastructure
- **Auth + storage**: Supabase Auth + Postgres
- **Payments**: Stripe Checkout + Billing Portal for operator-managed flows

### Tech stack (reference client)

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **3D**: Three.js + React Three Fiber + Drei
- **Auth/DB**: Supabase Auth + Postgres + Drizzle ORM
- **Payments**: Stripe
- **Deployment**: Vercel
- **Language**: TypeScript

### Quick start (run the operator reference client locally)

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment variables (operator reference client)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Operator-configurable anchoring
# (optional) Fee charged for optional on-chain anchoring service (in cents)
POC_ANCHORING_FEE_CENTS=50000
# (optional) Display label used in Stripe product description (e.g., "Base", "Hardhat (devnet)")
POC_ANCHORING_CHAIN_LABEL=Hardhat (devnet)

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

See `docs/deployment/VERCEL_ENV_SETUP.md` for the full setup checklist.

### Documentation map

- **Protocol**: `protocol/README.md`
- **Operator**: `operator/README.md`
- **Deployment**: `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- **OAuth**: `docs/oauth/OAUTH_QUICK_SETUP.md`
- **Stripe**: `docs/stripe/STRIPE_WEBHOOK_SETUP.md`
- **Supabase**: `docs/supabase/`
- **Testing**: `docs/testing/TESTING_PLAN.md`

### Repository structure

```
.
├── protocol/                # Protocol spec (implementation-agnostic)
├── operator/                # Operator notes/policies (FractiAI reference instance)
├── app/                     # Next.js App Router (reference client)
├── components/              # UI components
├── utils/                   # Shared utilities (Stripe/Supabase/tokenomics/vectors)
├── supabase/                # SQL migrations / schema
├── docs/                    # Implementation + deployment docs
├── scripts/                 # Utility scripts (SQL/TS/JS)
└── syntheverse-ui/           # Legacy / R&D workspace (separate subtree)
```

### Database schema (reference client)

### Tables

#### `users_table`
User accounts and Stripe integration.

**IMPORTANT**: This table must be created manually via migration. See `supabase/migrations/create_users_table.sql` or `supabase/migrations/combined_all_migrations.sql`.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (Supabase auth user ID) |
| `name` | text | User's display name |
| `email` | text | User's email (unique) |
| `plan` | text | Subscription plan |
| `stripe_id` | text | Stripe customer ID |

**Indexes:**
- `idx_users_table_email` on `email` column

#### `contributions`
PoC submission archive with 3D vectorization for redundancy detection.

| Column | Type | Description |
|--------|------|-------------|
| `submission_hash` | text | Primary key (SHA-256 hash of submission) |
| `title` | text | Contribution title |
| `contributor` | text | Contributor identifier (email or user ID) |
| `content_hash` | text | Hash of content for deduplication |
| `text_content` | text | Full text content (optional) |
| `pdf_path` | text | Legacy field (unused for text-only submissions) |
| `status` | text | Status: `draft`, `submitted`, `evaluating`, `qualified`, `unqualified`, `archived`, `superseded` |
| `category` | text | Category: `scientific`, `tech`, `alignment` |
| `metals` | jsonb | Array of metal types: `gold`, `silver`, `copper` |
| `metadata` | jsonb | Evaluation metadata (coherence, density, redundancy, pod_score) |
| `embedding` | jsonb | Vector embedding array (for similarity search) |
| `vector_x` | numeric(20,10) | X coordinate in 3D HHF space (Novelty dimension) |
| `vector_y` | numeric(20,10) | Y coordinate in 3D HHF space (Density dimension) |
| `vector_z` | numeric(20,10) | Z coordinate in 3D HHF space (Coherence dimension) |
| `embedding_model` | text | Embedding model used (e.g., `text-embedding-3-small`) |
| `vector_generated_at` | timestamp | When vector was generated |
| `registered` | boolean | Whether PoC is registered on blockchain (via Stripe payment) |
| `registration_date` | timestamp | When PoC was registered |
| `registration_tx_hash` | text | Blockchain transaction hash for registration |
| `stripe_payment_id` | text | Stripe payment ID for registration ($500 fee) |
| `created_at` | timestamp | Submission timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### `tokenomics`
SYNTH token supply and epoch state.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (default: `'main'`) |
| `total_supply` | numeric(20,0) | Total SYNTH supply (default: 90T = 90,000,000,000,000) |
| `total_distributed` | numeric(20,0) | Total SYNTH distributed (default: 0) |
| `current_epoch` | text | Current epoch: `founder`, `pioneer`, `community`, `ecosystem` (default: `founder`) |
| `founder_halving_count` | integer | Number of founder epoch halvings (default: 0) |
| `updated_at` | timestamp | Last update timestamp |

#### `epoch_balances`
Epoch-specific token balances and thresholds.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key |
| `epoch` | text | Epoch name: `founder`, `pioneer`, `community`, `ecosystem` |
| `balance` | numeric(20,0) | Current epoch balance |
| `threshold` | numeric(20,0) | Qualification threshold (pod_score required) |
| `distribution_amount` | numeric(20,0) | Initial distribution amount for epoch |
| `distribution_percent` | numeric(5,2) | Distribution percentage of total supply |
| `updated_at` | timestamp | Last update timestamp |

**Epoch Thresholds:**
- Founder: 45T SYNTH, threshold 8,000 pod_score
- Pioneer: 22.5T SYNTH, threshold 7,000 pod_score
- Community: 11.25T SYNTH, threshold 6,000 pod_score
- Ecosystem: 11.25T SYNTH, threshold 5,000 pod_score

#### `allocations`
Individual token allocations per contribution (requires admin approval).

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (UUID) |
| `submission_hash` | text | Foreign key to `contributions.submission_hash` |
| `contributor` | text | Contributor identifier |
| `metal` | text | Metal type: `gold`, `silver`, `copper` |
| `epoch` | text | Epoch for allocation |
| `tier` | text | Optional tier information |
| `reward` | numeric(20,0) | SYNTH tokens allocated |
| `tier_multiplier` | numeric(10,4) | Multiplier applied (default: 1.0) |
| `epoch_balance_before` | numeric(20,0) | Epoch balance before allocation |
| `epoch_balance_after` | numeric(20,0) | Epoch balance after allocation |
| `created_at` | timestamp | Allocation timestamp |

#### `poc_log`
Audit trail for all PoC submissions and evaluations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (UUID) |
| `submission_hash` | text | Foreign key to `contributions.submission_hash` |
| `contributor` | text | Contributor identifier |
| `event_type` | text | Event: `submission`, `evaluation_start`, `evaluation_complete`, `evaluation_error`, `status_change`, `allocation` |
| `event_status` | text | Status: `success`, `error`, `pending` |
| `title` | text | Contribution title |
| `category` | text | Contribution category |
| `request_data` | jsonb | Full request payload |
| `response_data` | jsonb | Full response payload |
| `evaluation_result` | jsonb | Evaluation result with fields: `coherence`, `density`, `redundancy`, `pod_score`, `novelty`, `alignment`, `metals`, `qualified`, `classification`, `redundancy_analysis`, `metal_justification` |
| `grok_api_request` | jsonb | Grok API request details |
| `grok_api_response` | jsonb | Grok API response details (includes full evaluation JSON) |
| `error_message` | text | Error message if event failed |
| `error_stack` | text | Error stack trace if event failed |
| `processing_time_ms` | integer | Processing time in milliseconds |
| `metadata` | jsonb | Additional metadata |
| `created_at` | timestamp | Event timestamp |

### Scoring Methodology

**Individual Category Scores (0-2,500 each, no penalties):**
- **Novelty**: Originality, frontier contribution, non-derivative insight
- **Density**: Information richness, depth, insight compression
- **Coherence**: Internal consistency, clarity, structural integrity
- **Alignment**: Fit with hydrogen-holographic fractal principles

**Composite Score Calculation:**
```
Composite_Score = Novelty + Density + Coherence + Alignment
Final_Total_Score = Composite_Score × (1 - Redundancy_Penalty% / 100)
```

**Qualification:**
- Redundancy penalty (0-100%) is applied to the composite/total score, not individual category scores
- Founder qualification: Final total score ≥ 8,000
- Qualification is epoch-based (must meet both density and pod_score thresholds for current open epoch)

### 3D Vectorization (Holographic Hydrogen Fractal Sandbox)

Contributions are mapped to 3D coordinates in the HHF space:
- **X-axis (vector_x)**: Novelty dimension
- **Y-axis (vector_y)**: Density dimension
- **Z-axis (vector_z)**: Coherence dimension
- **Distance calculation**: Euclidean distance between vectors for redundancy detection
- **Similarity**: Cosine similarity and distance-based similarity for redundancy percentage

**Interactive 3D Visualization** (Upgraded):
- **Three.js Rendering**: True 3D visualization with WebGL acceleration
- **Visual Encoding**:
  - **Size**: Proportional to density score (0.3x to 3.0x base size)
  - **Color**: Novelty gradient (blue → green → red based on score)
  - **Shape**: Metal-based geometry (Icosahedron for Gold, Octahedron for Silver, Tetrahedron for Copper)
  - **Transparency**: Coherence-based opacity (0.3 to 1.0)
- **Interactive Features**:
  - Click nodes to view detailed PoC information
  - Projected token allocation display (for contributors)
  - One-click token allocation (for qualified, registered PoCs)
  - PoC registration via Stripe checkout ($500 fee)
- **Status Indicators**:
  - Glow effect for qualified PoCs
  - Border highlights for allocated/registered PoCs
  - Dimmed appearance for non-qualified PoCs

This enables:
- Visual representation of contributions in 3D space
- Vector-based redundancy calculation
- Spatial clustering of related contributions
- Holographic visualization on the dashboard
- Interactive token allocation and registration workflow

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run database migrations

# Stripe
npm run stripe:setup     # Setup Stripe products
npm run stripe:listen    # Listen to Stripe webhooks locally

# Testing
npm run test             # Run tests (if configured)
```

## 🚢 Deployment

### Vercel (Recommended)

**Status**: This project is deployed on Vercel (see “Live Deployment” above).

1. **Connect Repository**: Import this GitHub repository to Vercel
2. **Environment Variables**: Add all required variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

See [docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Post-Deploy Setup Checklist (Required for full functionality)

- **Supabase Auth URLs**: Set Supabase Auth “Site URL” + “Redirect URLs” to match your deployed domain (OAuth callbacks rely on this).
- **Stripe webhooks**: Create a Stripe webhook pointing to `https://<your-domain>/webhook/stripe` and set `STRIPE_WEBHOOK_SECRET` in Vercel. See `docs/stripe/STRIPE_WEBHOOK_SETUP.md`.
- **PoC submissions are text-only**: No file uploads / no Supabase Storage bucket is required for submissions.

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔒 Security

- ✅ Environment variables are never committed to git
- ✅ Supabase service role key is kept secret
- ✅ Stripe webhook signatures are verified
- ✅ OAuth redirects are validated
- ✅ All API routes are protected

**Important**: Never commit `.env` files or expose API keys in the repository.

## 🐛 Troubleshooting

### Common Issues

- **Authentication not persisting**: Check [docs/testing/DEBUG_SESSION_ISSUE.md](docs/testing/DEBUG_SESSION_ISSUE.md)
- **OAuth not working**: See [docs/oauth/OAUTH_TROUBLESHOOTING.md](docs/oauth/OAUTH_TROUBLESHOOTING.md)
- **Database connection errors**: Check [docs/supabase/HOW_TO_GET_DATABASE_URL.md](docs/supabase/HOW_TO_GET_DATABASE_URL.md)
- **Stripe webhook issues**: See [docs/stripe/STRIPE_WEBHOOK_SETUP.md](docs/stripe/STRIPE_WEBHOOK_SETUP.md)

## 📝 License
MIT (see `LICENSE`).

## 🤝 Contributing
See `CONTRIBUTING.md`.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the Syntheverse ecosystem
