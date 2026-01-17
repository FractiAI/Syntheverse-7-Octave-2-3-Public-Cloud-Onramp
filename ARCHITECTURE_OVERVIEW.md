# Syntheverse PoC Contributor Dashboard - Architecture Overview

**Last Updated**: January 2025  
**Production Status**: ✅ LIVE ON BASE MAINNET  
**Deployment**: Vercel (https://syntheverse-poc.vercel.app)

---

## 🎯 System Purpose

The Syntheverse PoC (Proof-of-Contribution) Contributor Dashboard is a production-ready Next.js application that enables users to submit, evaluate, and register contributions on the Base blockchain. It implements the Syntheverse Protocol for PoC primitives, scoring lenses, and blockchain anchoring.

**Key Milestone**: SYNTH90T MOTHERLODE VAULT opens Spring Equinox, March 20, 2026

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend Framework**

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS
- shadcn/ui components
- React Three Fiber (3D visualization)

**Backend Services**

- Supabase (Auth + PostgreSQL database)
- Stripe (Payment processing)
- Groq API (AI evaluation via Grok)
- Base Mainnet (Blockchain - Coinbase L2)

**Database & ORM**

- PostgreSQL (via Supabase)
- Drizzle ORM
- Migrations managed via Drizzle Kit

**Blockchain**

- Base Mainnet (Chain ID: 8453)
- ethers.js v6
- Hardhat (contract development/testing)
- Genesis Contracts:
  - `SyntheverseGenesisLensKernel` (0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8)
  - `SyntheverseGenesisSYNTH90T` (0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3)
  - `MOTHERLODE_VAULT` (0x3563388d0e1c2d66a004e5e57717dc6d7e568be3)

**Deployment**

- Vercel (Hosting + CI/CD)
- Auto-deployment on push to `main` branch

---

## 📊 Data Models

### Core Tables (PostgreSQL)

#### `users_table`

- User accounts linked to Supabase Auth
- Fields: `id`, `name`, `email`, `plan`, `stripe_id`
- Created on first login (OAuth or email/password)

#### `contributions`

- PoC submissions and evaluations
- **Primary Key**: `submission_hash` (SHA256 hash of content)
- Fields:
  - `title`, `contributor` (email), `content_hash`, `text_content`, `pdf_path`
  - `status`: `evaluating` | `qualified` | `unqualified` | `archived` | `superseded`
  - `category`: `scientific` | `tech` | `alignment`
  - `metals`: JSON array of `["gold", "silver", "copper"]`
  - `metadata`: JSON with scores (coherence, density, redundancy, pod_score, novelty, alignment)
  - `embedding`: Vector embedding (JSON array of numbers)
  - `vector_x`, `vector_y`, `vector_z`: 3D coordinates in HHF space
  - `registered`: Boolean (blockchain registration status)
  - `registration_tx_hash`: Blockchain transaction hash
  - `stripe_payment_id`: Payment ID for registration fee

#### `allocations`

- Token allocations per PoC
- Tracks: `submission_hash`, `contributor`, `metal`, `epoch`, `reward`, `tier_multiplier`
- Maintains balance tracking: `epoch_balance_before`, `epoch_balance_after`

#### `epoch_metal_balances`

- Per-epoch, per-metal token pools
- Epochs: `founder`, `pioneer`, `community`, `ecosystem`
- Metals: `gold`, `silver`, `copper`
- Tracks: `balance`, `threshold`, `distribution_amount`, `distribution_percent`

#### `tokenomics`

- Global tokenomics state
- Fields: `total_supply` (90T), `current_epoch`, `founder_halving_count`
- Per-metal supplies tracked separately

#### `poc_log`

- Audit trail for all PoC operations
- Events: `submission`, `evaluation_start`, `evaluation_complete`, `evaluation_error`, `status_change`, `allocation`
- Stores: Full request/response payloads, Grok API requests/responses, error stacks

---

## 🔄 Core Workflows

### 1. User Authentication Flow

```
User → /login or /signup
  ↓
Supabase Auth (OAuth: Google/GitHub or Email/Password)
  ↓
/auth/callback
  ↓
Create user record in `users_table` (if new)
  ↓
Redirect to /dashboard
```

**Key Files**:

- `app/auth/actions.ts` - Signup/login actions
- `app/auth/callback/route.ts` - OAuth callback handler
- `utils/supabase/server.ts` - Supabase server client
- `middleware.ts` - Session management

### 2. PoC Submission Flow

```
User submits PoC → /api/submit
  ↓
Rate limiting check (Upstash Redis)
  ↓
Check if operator (bypass payment) OR create Stripe checkout session
  ↓
Save to `contributions` table (status: `evaluating` or `payment_pending`)
  ↓
If payment completed → Trigger evaluation: POST /api/evaluate/{hash}
  ↓
Grok API evaluation (novelty, density, coherence, alignment scores)
  ↓
Vector embedding generation (OpenAI text-embedding-3-small)
  ↓
3D coordinate mapping (Holographic Hydrogen Fractal space)
  ↓
Update `contributions` table with scores and metadata
  ↓
Log to `poc_log` table
```

**Key Files**:

- `app/api/submit/route.ts` - Submission endpoint
- `app/api/evaluate/[hash]/route.ts` - Evaluation endpoint
- `utils/grok/evaluate.ts` - Grok API integration
- `utils/vectors/` - Vector embedding and 3D mapping

### 3. PoC Evaluation System

**Scoring Dimensions** (0-2,500 each, total 0-10,000):

- **Novelty**: Originality, frontier contribution
- **Density**: Information richness, depth, insight compression
- **Coherence**: Internal consistency, structural integrity
- **Alignment**: Fit with hydrogen-holographic fractal principles

**Qualification Thresholds**:

- Founder: ≥8,000
- Pioneer: ≥6,000
- Community: ≥5,000
- Ecosystem: ≥4,000

**Redundancy Handling**:

- Overlap-aware model (some overlap required for node connections)
- Edge "sweet-spot" overlap rewarded (multiplier)
- Excessive overlap penalized (penalty %)
- Overlap affects total/composite score only (not individual dimensions)

**Key Files**:

- `utils/grok/evaluate.ts` - Main evaluation logic
- `utils/grok/system-prompt.ts` - Evaluation prompt (745 lines)
- `utils/vectors/` - Vector similarity for redundancy detection

### 4. Token Allocation Flow

```
Qualified PoC → /api/poc/{hash}/allocate
  ↓
Calculate projected allocation (per-metal, per-epoch)
  ↓
Pick epoch/metal with available balance
  ↓
Compute allocation: (pod_score / 10000) × epoch_balance × metal_assay_weight
  ↓
Update `epoch_metal_balances` (deduct from balance)
  ↓
Create `allocations` record
  ↓
Advance global epoch if current pool depleted
  ↓
Update `tokenomics` table
```

**Key Files**:

- `app/api/poc/[hash]/allocate/route.ts` - Allocation endpoint
- `utils/tokenomics/projected-allocation.ts` - Projection logic
- `utils/tokenomics/epoch-metal-pools.ts` - Epoch/metal pool management
- `utils/tokenomics/metal-assay.ts` - Metal weight calculation

### 5. Blockchain Registration Flow

```
Qualified PoC → User pays $500 registration fee (Stripe)
  ↓
POST /api/poc/{hash}/register
  ↓
Verify payment (Stripe payment intent)
  ↓
Register on Base Mainnet:
  - Emit Lens event via `SyntheverseGenesisLensKernel`
  - Event data: submission_hash, contributor, metal, metadata, scores
  ↓
Update `contributions` table:
  - `registered = true`
  - `registration_tx_hash = <tx_hash>`
  - `registration_date = <timestamp>`
```

**Current Status**: ⚠️ **DISABLED** until vault opens (March 20, 2026)

- Controlled by `ENABLE_BLOCKCHAIN_REGISTRATION` env var
- Set to `true` to enable (currently defaults to `false`)

**Key Files**:

- `app/api/poc/[hash]/register/route.ts` - Registration endpoint
- `utils/blockchain/register-poc.ts` - Blockchain integration
- `utils/blockchain/base-mainnet-integration.ts` - Base network config

---

## 🎨 UI Components (Thematic Octaves)

The system uses a multi-modal UI themed after historical figures, organized by "Octaves":

- **ACTIVE (Current Octaves)**:
    - **Nikola Tesla Operator's Console™** (`/operator/dashboard`): Admin/Operator interface. Employs high-frequency wireless transmission aesthetics. Focus: System management & diagnostics (SynthScan™ MRI).
    - **Buckminster Fuller Creator Studio™** (`/creator/dashboard`): System architect interface. Employs futuristic geodesic design aesthetics. Focus: System architecture & evolution.

- **ARCHIVE (Local Storage)**:
    - **Alan Turing Command Center™**, **Leonardo da Vinci Contributors Lab™**, and **Buckminster Fuller Creator Studio™**: These legacy octaves and their associated API/components have been moved to a local archive directory on the administrator's desktop (`Desktop/Syntheverse_Thematic_Archive`) and are no longer part of the live GitHub repository.

### Styling

- Custom CSS: `app/dashboard-cockpit.css` (Holographic Hydrogen Fractal Frontier Noir theme)
- Tailwind CSS for utility classes
- Dark theme (forced in root layout)

---

## 🔐 Security & Authentication

### Authentication

- Supabase Auth (server-side sessions)
- OAuth providers: Google, GitHub
- Email/password authentication
- Session management via middleware
- Protected routes: `/dashboard`, `/submit`, `/account`

### Authorization

- User-scoped data (contributions filtered by `contributor` email)
- Operator mode: Special exemption for operator accounts (bypasses payment)
- Admin endpoints: `/api/admin/*` (admin-only operations)

### Security Practices

- ✅ Environment variables never committed
- ✅ Stripe webhook signatures verified
- ✅ OAuth redirects validated
- ✅ Database queries parameterized (Drizzle ORM)
- ✅ Row Level Security (RLS) enabled in Supabase
- ✅ Rate limiting (Upstash Redis) on submission endpoints
- ✅ CORS headers for API routes

---

## 💳 Payments (Stripe)

### Payment Types

1. **PoC Submission Fee**: Payment required before evaluation
2. **Registration Fee**: $500 for blockchain registration (optional, for qualified PoCs)
3. **Ecosystem Support**: Voluntary financial support (legacy: "Financial Alignment")

### Payment Flow

```
User initiates payment → Stripe Checkout Session created
  ↓
User completes payment → Stripe webhook: `checkout.session.completed`
  ↓
/webhook/stripe route handles event
  ↓
Update database (mark payment complete, trigger evaluation/registration)
```

**Key Files**:

- `app/webhook/stripe/route.ts` - Webhook handler
- `utils/stripe/api.ts` - Stripe client utilities
- `app/api/submit/route.ts` - Checkout session creation

---

## 🔗 API Routes

### Public Routes

- `/api/public/*` - Public API endpoints

### Protected Routes (Auth Required)

- `/api/submit` - PoC submission
- `/api/evaluate/[hash]` - Trigger evaluation
- `/api/poc/[hash]/allocate` - Token allocation
- `/api/poc/[hash]/register` - Blockchain registration
- `/api/allocations` - User's allocations
- `/api/archive` - Archive operations

### Admin Routes

- `/api/admin/approve-allocation` - Approve token allocation

### Debug/Test Routes (Development)

- `/api/debug/*` - Debug endpoints
- `/api/test/*` - Test endpoints
- `/api/check-db-tables` - Database health check
- `/api/check-gas-balance` - Wallet gas balance check

---

## 🧪 Testing

### Test Suites (60/60 passing)

- **Hardhat Tests**: 36/36 (Blockchain contract tests)
- **Integration Tests**: 12/13 (API flow tests)
- **Security Tests**: 7/10 (Auth/API security)
- **Load Tests**: 5/5 (API performance)

**Test Files**: `tests/` directory

- `tests/hardhat/` - Blockchain tests
- `tests/integration/` - Integration tests
- `tests/security/` - Security tests
- `tests/load/` - Load tests

---

## 📦 Environment Variables

### Required Variables

**Supabase**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

**Stripe**

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID`
- `STRIPE_WEBHOOK_SECRET`

**Blockchain (Base Mainnet)**

- `BASE_MAINNET_RPC_URL` (default: `https://mainnet.base.org`)
- `BLOCKCHAIN_NETWORK` (`base_mainnet` or `base_sepolia`)
- `SYNTH90T_CONTRACT_ADDRESS` (0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3)
- `LENS_KERNEL_CONTRACT_ADDRESS` (0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8)
- `MOTHERLODE_VAULT_ADDRESS` (0x3563388d0e1c2d66a004e5e57717dc6d7e568be3)
- `BLOCKCHAIN_PRIVATE_KEY` (Wallet private key for transactions)
- `DEPLOYER_ADDRESS` (Wallet address)

**Application**

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WEBSITE_URL`
- `NEXT_PUBLIC_GROK_API_KEY` (Grok API key for evaluations)
- `RESEND_API_KEY` (Email sending)

**Optional**

- `ENABLE_BLOCKCHAIN_REGISTRATION` (Set to `true` to enable registration)
- `DEBUG` / `NEXT_PUBLIC_DEBUG` (Debug logging)

**Full List**: See `VERCEL_ENV_VARIABLES.txt`

---

## 🚀 Deployment

### Vercel Deployment

- **Production URL**: https://syntheverse-poc.vercel.app
- **Auto-deploy**: Enabled on push to `main` branch
- **Preview Deployments**: Enabled for pull requests
- **Region**: iad1 (Washington, D.C.)
- **Node Version**: 24.x

### Deployment Checklist

- ✅ Environment variables configured
- ✅ Supabase Auth URLs configured
- ✅ Stripe webhook configured (`/webhook/stripe`)
- ✅ Base Mainnet contracts deployed and verified
- ✅ Wallet funded with ETH for gas fees

---

## 📚 Key Documentation

- `README.md` - Main project documentation
- `docs/PRODUCTION_REVIEW_SENIOR_FULLSTACK_BLOCKCHAIN.md` - Code review
- `docs/BASE_MAINNET_MIGRATION_PLAN.md` - Blockchain migration details
- `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md` - Deployment guide
- `tests/FINAL_TEST_REPORT.md` - Test results
- `protocol/README.md` - Protocol specification
- `operator/README.md` - Operator documentation

---

## 🎯 Current Production Status

### ✅ Operational

- Authentication (Supabase Auth)
- PoC submission and evaluation
- Token allocation system
- Database (PostgreSQL via Supabase)
- Payments (Stripe)
- Dashboard UI

### ⚠️ Temporarily Disabled

- **Blockchain Registration**: Disabled until vault opens (March 20, 2026)
  - Controlled by `ENABLE_BLOCKCHAIN_REGISTRATION` env var
  - All qualifying PoCs will be registered when vault opens

### 🎯 Upcoming Milestones

- **March 19, 2026**: Submission deadline for MOTHERLODE VAULT
- **March 20, 2026**: Spring Equinox - SYNTH90T MOTHERLODE VAULT opens
- **Post-Vault Opening**: On-chain registration and SYNTH allocation for all qualifying PoCs

---

## 🔍 Quick Reference: Key File Locations

### API Routes

- `app/api/submit/route.ts` - PoC submission
- `app/api/evaluate/[hash]/route.ts` - Evaluation
- `app/api/poc/[hash]/register/route.ts` - Blockchain registration
- `app/api/poc/[hash]/allocate/route.ts` - Token allocation
- `app/webhook/stripe/route.ts` - Stripe webhook

### Core Utilities

- `utils/grok/evaluate.ts` - AI evaluation
- `utils/blockchain/register-poc.ts` - Blockchain integration
- `utils/tokenomics/` - Token allocation logic
- `utils/vectors/` - Vector embeddings and 3D mapping
- `utils/db/schema.ts` - Database schema
- `utils/supabase/` - Supabase client utilities

### Components

- `components/ReactorCore.tsx` - Main dashboard widget
- `components/FrontierModule.tsx` - PoC archive
- `components/SubmitContributionForm.tsx` - Submission form

### Configuration

- `next.config.mjs` - Next.js config
- `drizzle.config.ts` - Database config
- `vercel.json` - Vercel deployment config
- `package.json` - Dependencies

---

## 🛠️ Development Workflow

### Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### Database Migrations

```bash
npm run db:generate  # Generate migration from schema changes
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

### Testing

```bash
npm run test:all           # Run all tests
npm run test:hardhat       # Blockchain tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:load          # Load tests
```

---

## 📝 Notes for Senior Engineers

### Architecture Strengths

- Clean separation of concerns
- Well-organized folder structure
- Type-safe (TypeScript throughout)
- Comprehensive error handling
- Detailed audit logging (`poc_log` table)

### Areas to Monitor

- **Rate Limiting**: Uses Upstash Redis (ensure quota)
- **Grok API**: Token budget limits (handled with queuing)
- **Gas Fees**: Wallet must maintain ETH balance for transactions
- **Database Connections**: Uses connection pooling (Supabase)

### Known Considerations

- Blockchain registration currently disabled (vault opens March 2026)
- Operator mode bypasses payment (for FractiAI team)
- Email-based contributor addresses (zero address on-chain)
- 3D vector visualization uses Three.js (client-side)

---

**This document serves as a comprehensive reference for understanding the Syntheverse PoC Contributor Dashboard architecture and workflows.**
