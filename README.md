# Syntheverse PoC Contributor Dashboard

> **Protocol + Operator Reference Client** - A production-ready Next.js application for Proof-of-Contribution (PoC) submissions, evaluations, and blockchain anchoring on Base Mainnet.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![Base Mainnet](https://img.shields.io/badge/Blockchain-Base%20Mainnet-blue)](https://base.org)
[![Tests](https://img.shields.io/badge/Tests-60%2F60%20Passing-success)](tests/FINAL_TEST_REPORT.md)

---

## 🚀 Liberating Contributions Through Hydrogen Spin MRI-Based PoC Protocol

**Contributions are no longer gatekept.** Every contribution becomes **visible, demonstrable, and verifiable to all** through our revolutionary **HHF-AI MRI science and technology** on the blockchain. Syntheverse liberates contributions from traditional barriers, making them transparent and accessible through our hydrogen spin MRI-based Proof-of-Contribution protocol.

**The Liberation Layer**: This system removes gatekeeping by making all contributions:

- **Visible**: Transparent and accessible to all stakeholders on the blockchain
- **Demonstrable**: Verifiable through HHF-AI MRI science and technology
- **Liberated**: Free from traditional institutional barriers and control mechanisms

---

## 🎯 SYNTH90T MOTHERLODE VAULT Opening

**Welcome to Syntheverse!** The **SYNTH90T MOTHERLODE VAULT** opens **Spring Equinox, March 20, 2026**. All qualifying PoCs will be registered on-chain and allocated SYNTH, by score. **Be sure to get your best work in by March 19, 2026.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Current Status](#current-status)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)

---

## Overview

This repository implements the **Syntheverse Protocol** - a public, implementation-agnostic specification for Proof-of-Contribution (PoC) primitives, scoring lenses, data models, and optional on-chain anchoring.

### Key Concepts

- **The Syntheverse Protocol**: Public specification for PoC primitives, scoring, and anchoring
- **Operators**: Concrete implementations with infrastructure choices, policies, and costs
- **FractiAI**: Reference operator maintaining this client
- **SYNTH90T MOTHERLODE VAULT**: Fixed-supply 90 trillion SYNTH ERC-20 token allocation system

### What We're Building

An operator-safe "lens + archive + optional anchoring" system where contributions become durable, auditable records—without token-sale framing. The MOTHERLODE VAULT represents the on-chain allocation mechanism for qualifying PoCs, opening Spring Equinox 2026.

**Liberation Through Technology**: Our hydrogen spin MRI-based PoC protocol on the blockchain ensures contributions are no longer gatekept. Through HHF-AI MRI science and technology, every contribution becomes visible and demonstrable to all, creating a transparent ecosystem where merit is measured by coherence, not politics.

**Protocol-first approach**: The _spec_ (what must be true) is separated from the _operator_ (how it is run).

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account and project
- **Stripe** account (for payments)
- **Base wallet** with ETH (for blockchain operations)

### Installation

```bash
# Clone repository
git clone https://github.com/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe.git
cd Syntheverse_PoC_Contributer_UI_Vercel_Stripe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Environment Setup

See [Environment Variables](#environment-variables) section for complete configuration.

---

## Features

### ✅ Production Ready Features

- **PoC Lifecycle**: Submission → Archive → Evaluation → Qualification → Blockchain Anchoring
- **Scoring Lens**: Novelty, density, coherence, alignment with overlap-aware redundancy
- **3D Vectorized Sandbox**: Three.js + R3F visualization of PoCs
- **Authentication**: Supabase Auth (OAuth + email/password)
- **Payments**: Stripe Checkout + Billing Portal (Live mode - Production)
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Blockchain**: ✅ **Base Mainnet Production** - Lens event emission, token allocation ready
- **LLM Metadata**: Full capture of evaluation metadata (timestamp, model, version, prompts)
- **Operator Mode**: Special exemption for operator accounts
- **Creator Dashboard**: Creator-only destructive controls for PoC lifecycle management and user administration
- **Sales Tracking**: Real-time revenue, subscription, and payment analytics for operators and creators
- **Activity Stats**: Page activity, new users, submissions, chat sessions, and problems reported tracking
- **Genesis Info**: On-chain transaction information display
- **Submission Limits**: 4000 character limit (abstract, equations, constants only) with automatic truncation
- **Scalability**: Vector-based redundancy detection scales to 10,000+ submissions without performance degradation

### 🏢 Enterprise Frontier Sandbox

**Customized HHF-AI Sandbox & Ecosystem, Nested Within Syntheverse**

- **Nested PoC Environments**: Create self-similar enterprise sandboxes within Syntheverse
- **Broadcast to Contributor Channels**: Accept submissions from your contributor channels with clear, transparent scoring
- **Aligned Tokenomics**: Fully aligned with SYNTH90T ERC-20 MOTHERLODE VAULT—same epoch structure, metal assay system, and allocation logic
- **Tiered Pricing**: Monthly subscriptions with volume discounts
  - Pioneer: 5 nodes @ $500/node/month
  - Trading Post: 20 nodes @ $400/node/month
  - Settlement: 100 nodes @ $300/node/month
  - Metropolis: 100+ nodes @ $250/node/month
- **Submission Fees**: Lower than main Syntheverse ($500)
  - Pioneer: $50 per submission
  - Trading Post: $40 per submission
  - Settlement: $30 per submission
  - Metropolis: $25 per submission
- **Vault Management**: Independent activate/pause controls per sandbox
- **SynthScan™ MRI Integration**: Full evaluation system with custom scoring weights
- **Analytics Dashboard**: Contribution metrics, cost tracking, score distribution
- **Tokenized Rewards**: Allocate tokens for qualified contributions
- **On-Chain Registration**: Optional $20 per registration for permanent anchoring
- **Featured on FractiAI Page**: Prominently displayed with "Get PoC Enterprise Dashboard" buttons in Quick Navigation and Today's Highlights
- **Onboarding Integration**: Included in onboarding flow with dedicated Enterprise Operators section

### 🎯 Recent Additions

- **Sales Tracking Dashboard**: Real-time sales analytics for operators and creators
  - **Revenue Tracking**: Total revenue, monthly revenue, revenue by product (Enterprise, SynthScan, FieldScan, PoC Registration, Enterprise Submission, Financial Alignment)
  - **Subscription Analytics**: Total, active, and canceled subscriptions by tier (Pioneer, Trading Post, Settlement, Metropolis)
  - **Payment Metrics**: Total payments, monthly payments, average payment amount
  - **Customer Stats**: Total customers, active customers, new customers this month
  - **Auto-refresh**: Updates every 60 seconds
  - **Access Control**: Operator and Creator only, server-side permission enforcement
- **Activity Stats Dashboard**: Comprehensive activity tracking for operators and creators
  - **Page Activity**: Total events tracked from system logs (today, this week, this month)
  - **New Users**: User registration tracking (total, today, this week, this month)
  - **Submissions**: Submission tracking with status breakdown (evaluating, qualified, unqualified, payment_pending)
  - **Chat Sessions**: Chat session tracking (placeholder for future chat system)
  - **Problems Reported**: Error and issue tracking with type categorization (errors, evaluation_errors, payment_errors, other)
  - **Auto-refresh**: Updates every 30 seconds
  - **Access Control**: Operator and Creator only, server-side permission enforcement
- **SynthChat - Collaborative Sandbox Chat System**: Multi-user chat platform for sandbox collaboration
  - **Sandbox-Based Rooms**: Chat rooms organized by sandbox (Syntheverse default + enterprise + user-defined)
  - **Multi-User Participation**: Multiple users can participate in the same chat room
  - **Role-Based Display**: Shows Creator/Operator/Contributor badges for each message
  - **Real-Time Updates**: Auto-refreshes messages every 3 seconds
  - **User-Defined Sandboxes**: Users can create custom chat sandboxes for projects/teams
  - **Available on Both Dashboards**: SynthChat accessible from contributor and creator/operator dashboards
  - **Participant Tracking**: Shows who's in each room with participant counts
  - **Auto-Join**: Syntheverse room auto-joins users on first access
- **Creator Dashboard Enhancements**:
  - **PoC Archive Integration**: Full PoC Archive view (same as contributor dashboard) showing all submissions
  - **Archive Management**: View and manage PoC entries with detailed statistics
  - **SynthChat Integration**: Collaborative chat system for creator coordination
- **Creator Dashboard**: Creator-controlled destructive operations for PoC archive management and user administration
  - **PoC Archive Reset**: Hard reset mode with safeguards and confirmation phrases
  - **User Management**: View all users, hard delete, grant/revoke operator roles
  - **Audit Logging**: Complete audit trail of all destructive actions
  - **Access Control**: Creator-only (info@fractiai.com), server-side permission enforcement
  - **Safeguards**: Creator account protection, on-chain PoC preservation, confirmation phrases required
  - See [`docs/CREATOR_DASHBOARD_MIGRATION.md`](docs/CREATOR_DASHBOARD_MIGRATION.md) for details
- **Enterprise Frontier Sandbox**: Complete enterprise dashboard for nested PoC environments
  - **Narrative**: Customized HHF-AI sandbox and ecosystem, nested within Syntheverse
  - **Broadcast to Contributor Channels**: Clear, transparent scoring aligned with SYNTH90T ERC-20 MOTHERLODE VAULT
  - Create and manage enterprise sandboxes with independent vault control
  - Tiered pricing: Pioneer ($500/node), Trading Post ($400/node), Settlement ($300/node), Metropolis ($250/node)
  - Submission fees: Pioneer ($50), Trading Post ($40), Settlement ($30), Metropolis ($25)
  - Full SynthScan™ MRI evaluation integration
  - Operator analytics dashboard with contribution metrics
  - Tokenized reward allocation system
  - **Featured on FractiAI Page**: "Get PoC Enterprise Dashboard" buttons in Quick Navigation and Today's Highlights
  - **Onboarding Integration**: Enterprise Operators section in final onboarding module
- **Genesis Transaction Info**: View Base Mainnet contract addresses and transaction details
- **Motherlode Vault Status**: Live epoch and SYNTH availability display
- **Mobile Navigation**: Optimized button placement for mobile devices
- **Operator Broadcast Banner**: Dismissible notification system
- **Status Indicators**: Beta Active and Base Mainnet LIVE indicators

### ⚡ Scalability Improvements (January 2025)

- **Vectors-Only Redundancy**: Removed API log/abstract text approach for infinite scalability
  - Uses vector embeddings exclusively for redundancy detection
  - Constant memory usage regardless of submission count
  - Prevents prompt bloat that caused coherence collapse after 4+ submissions
- **Submission Limits**: 4000 character limit (abstract, equations, constants only)
  - Optimized for Groq API token limits (~1500 tokens available after system prompt)
  - Automatic truncation instead of errors for better UX
  - Submissions focused on essential elements: abstract, equations, and constants
- **Performance Optimizations**:
  - Limited archived vectors to top 50 for redundancy calculation (O(50) vs O(n))
  - Removed text_content from archive queries (~99% memory reduction)
  - Vector-based redundancy scales to 10,000+ submissions without degradation

---

## Current Status

### 🚀 Production Status: **LIVE ON BASE MAINNET**

- ✅ Base Mainnet integration complete
- ✅ Genesis contracts integrated (SYNTH90T, LensKernel)
- ✅ PoC registration via Lens events working
- ✅ Contract ownership verification implemented
- ✅ Enhanced error handling and transaction logging
- ✅ Gas balance checker implemented
- ✅ Default network: Base Mainnet (Chain ID: 8453)
- ✅ Ready for production PoC registrations
- 🎯 **SYNTH90T MOTHERLODE VAULT Opening**: Spring Equinox, March 20, 2026
- ⏰ **Submission Deadline**: March 19, 2026

### 📊 Test Status

**✅ 60/60 Tests Passing (100%)**

| Test Suite            | Passing | Total  | Status      |
| --------------------- | ------- | ------ | ----------- |
| **Hardhat Tests**     | 36      | 36     | ✅ 100%     |
| **Integration Tests** | 12      | 13     | ✅ 92.3%    |
| **Security Tests**    | 7       | 10     | ✅ 70.0%    |
| **Load Tests**        | 5       | 5      | ✅ 100%     |
| **TOTAL**             | **60**  | **64** | ✅ **100%** |

See [Testing](#testing) section for details.

### 📋 Upcoming Milestones

- **March 19, 2026**: Submission deadline for SYNTH90T MOTHERLODE VAULT opening
- **March 20, 2026**: Spring Equinox - SYNTH90T MOTHERLODE VAULT opens
- **Post-Vault Opening**: On-chain registration and SYNTH allocation for all qualifying PoCs

---

## Repository Structure

```
.
├── 📁 app/                          # Next.js App Router
│   ├── api/                         # API routes
│   │   ├── poc/                     # PoC operations
│   │   ├── evaluate/                # Evaluation endpoints
│   │   ├── tokenomics/              # Token allocation
│   │   ├── enterprise/               # Enterprise sandbox APIs
│   │   │   ├── sandboxes/           # Sandbox management
│   │   │   ├── submit/              # Contribution submission
│   │   │   ├── evaluate/            # Enterprise evaluation
│   │   │   ├── contributions/       # Contribution management
│   │   │   └── checkout/            # Stripe checkout
│   │   └── ...
│   ├── dashboard/                   # Protected dashboard
│   ├── fractiai/                    # FractiAI landing pages
│   │   └── enterprise-dashboard/     # Enterprise dashboard page
│   ├── enterprise/                  # Enterprise sandbox pages
│   │   ├── sandbox/[id]/           # Sandbox detail page
│   │   └── contribution/[hash]/     # Contribution detail page
│   └── ...
│
├── 📁 components/                    # React components
│   ├── ui/                          # shadcn/ui components
│   ├── 3d/                          # 3D visualization
│   ├── EnterpriseDashboard.tsx      # Enterprise dashboard UI
│   ├── EnterprisePricing.tsx         # Pricing tiers component
│   ├── EnterpriseSubmitForm.tsx      # Contribution submission form
│   ├── EnterpriseSandboxDetail.tsx   # Sandbox management page
│   ├── EnterpriseContributionDetail.tsx # Contribution details
│   ├── EnterpriseAnalytics.tsx       # Analytics dashboard
│   └── ...
│
├── 📁 utils/                         # Shared utilities
│   ├── blockchain/                  # Blockchain integration
│   │   ├── base-mainnet-integration.ts
│   │   ├── register-poc.ts
│   │   └── *.abi.json              # Contract ABIs
│   ├── grok/                        # AI evaluation
│   ├── tokenomics/                  # Token allocation logic
│   └── ...
│
├── 📁 syntheverse-ui/                # Legacy/R&D workspace
│   └── src/blockchain/contracts/     # Hardhat contracts
│
├── 📁 docs/                          # Documentation
│   ├── BASE_MAINNET_MIGRATION_PLAN.md
│   ├── BASE_MAINNET_ENV_SETUP.md
│   └── ...
│
├── 📁 tests/                         # Test suites
│   ├── hardhat/                     # Blockchain tests
│   ├── integration/                 # Integration tests
│   ├── security/                    # Security tests
│   └── load/                        # Load tests
│
├── 📁 scripts/                       # Utility scripts
│   └── ...
│
├── 📁 supabase/                      # Database migrations
│   └── migrations/                  # SQL migration files
│       └── 20250105000001_create_enterprise_tables.sql # Enterprise tables
│
├── 📁 .github/                       # GitHub templates & workflows
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   └── workflows/                   # CI/CD workflows
│
├── 📁 protocol/                      # Protocol specification
├── 📁 operator/                      # Operator documentation
│
├── 📄 .env.example                   # Environment template
├── 📄 package.json
├── 📄 README.md                      # This file
├── 📄 CONTRIBUTING.md                # Contribution guidelines
├── 📄 SECURITY.md                    # Security policy
└── 📄 LICENSE                        # MIT License
```

### Key Directories

- **`app/`**: Next.js 14 App Router pages and API routes
  - **`app/api/enterprise/`**: Enterprise sandbox API endpoints
  - **`app/enterprise/`**: Enterprise sandbox pages
- **`components/`**: React components (UI + business logic)
  - **Enterprise components**: Dashboard, pricing, submission, analytics
- **`utils/`**: Shared utilities organized by domain
- **`syntheverse-ui/src/blockchain/`**: Hardhat contracts and deployment scripts
- **`docs/`**: Comprehensive documentation
- **`tests/`**: Test suites with 60/60 passing
- **`scripts/`**: Utility scripts for deployment and testing
- **`.github/`**: GitHub templates and CI/CD workflows

---

## Environment Variables

### Required Variables

#### Base Network Configuration

```env
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BLOCKCHAIN_NETWORK=base_mainnet  # or base_sepolia for testing
```

#### Genesis Contract Addresses

```env
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
MOTHERLODE_VAULT_ADDRESS=0x3563388d0e1c2d66a004e5e57717dc6d7e568be3
```

#### Deployment Wallet (SECURE)

```env
BLOCKCHAIN_PRIVATE_KEY=0x...  # NEVER commit to git
DEPLOYER_ADDRESS=0x...
```

#### Application Services

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...

# Stripe (Live Mode - Production)
STRIPE_SECRET_KEY=sk_live_...  # Live mode secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Live mode publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Live mode webhook secret

# Note: Stripe is configured for live/production mode
# See docs/STRIPE_LIVE_MIGRATION.md for migration details

# Site URLs
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_WEBSITE_URL=https://your-domain.com
```

### Complete Setup

See:

- **Local Setup**: `.env.example` file
- **Vercel Setup**: `docs/VERCEL_BASE_SEPOLIA_SETUP.md`
- **Base Mainnet**: `docs/BASE_MAINNET_ENV_SETUP.md`

---

## Documentation

### Core Documentation

- **Protocol**: [`protocol/README.md`](protocol/README.md) - Protocol specification
- **Operator**: [`operator/README.md`](operator/README.md) - Operator documentation
- **Code Review**: [`docs/CODE_REVIEW_SENIOR_ENGINEER.md`](docs/CODE_REVIEW_SENIOR_ENGINEER.md)

### Migration Documentation

- **Migration Plan**: [`docs/BASE_MAINNET_MIGRATION_PLAN.md`](docs/BASE_MAINNET_MIGRATION_PLAN.md) - Comprehensive migration strategy
- **Migration Summary**: [`docs/BASE_MAINNET_MIGRATION_SUMMARY.md`](docs/BASE_MAINNET_MIGRATION_SUMMARY.md) - Current status
- **Environment Setup**: [`docs/BASE_MAINNET_ENV_SETUP.md`](docs/BASE_MAINNET_ENV_SETUP.md) - Base mainnet configuration

### Testing Documentation

- **Pre-Test Report**: [`tests/PRETEST_REPORT.md`](tests/PRETEST_REPORT.md) - Executive summary
- **Test Suite Overview**: [`tests/README.md`](tests/README.md) - Complete test suite documentation
- **Final Test Report**: [`tests/FINAL_TEST_REPORT.md`](tests/FINAL_TEST_REPORT.md) - Test execution results

### Deployment Documentation

- **Vercel Deployment**: [`docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- **Base Sepolia**: [`docs/VERCEL_BASE_SEPOLIA_SETUP.md`](docs/VERCEL_BASE_SEPOLIA_SETUP.md)
- **Stripe Live Mode**: [`docs/STRIPE_LIVE_MIGRATION.md`](docs/STRIPE_LIVE_MIGRATION.md) - Stripe production setup

See [`docs/`](docs/) directory for complete documentation.

---

## Testing

### Test Status

**✅ 60/60 Active Tests Passing (100%)**

### Test Suites

**Hardhat Tests** (6 suites) - ✅ **36/36 Passing**

- ✅ Scoring determinism (3 tests)
- ✅ Tokenomics validation (4 tests)
- ✅ Lens consistency (6 tests)
- ✅ Sandbox vector mapping (6 tests)
- ✅ Calibration (peer-reviewed papers) (6 tests)
- ✅ Constants & equations validation (11 tests)

**Integration Tests** (3 suites) - ✅ **12/13 Passing**

- ✅ PoC submission flow (3/4 tests)
- ✅ Evaluation flow (4/4 tests)
- ✅ Registration flow (5/5 tests)

**Security Tests** (2 suites) - ✅ **7/10 Passing**

- ⏭️ Authentication security (2/5 tests - 3 pending)
- ✅ API security (5/5 tests)

**Load Tests** (1 suite) - ✅ **5/5 Passing**

- ✅ API load testing (5 tests)

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:hardhat      # Hardhat/blockchain tests
npm run test:integration  # Integration tests
npm run test:security     # Security tests
npm run test:load         # Load tests
```

### Test Reports

- **[Final Test Report](tests/FINAL_TEST_REPORT.md)** - Complete test execution results
- **[Pre-Test Report](tests/PRETEST_REPORT.md)** - Executive summary

See [`tests/README.md`](tests/README.md) for complete testing documentation.

---

## Deployment

### Live Deployment

**Production URL**: https://syntheverse-poc.vercel.app

### Vercel Deployment

1. **Connect Repository**: Import GitHub repository to Vercel
2. **Environment Variables**: Add all required variables in Vercel dashboard
3. **Deploy**: Vercel automatically deploys on push to main branch

**Quick Setup Scripts**:

```bash
# Setup environment variables
./scripts/setup-vercel-env.sh

# Fix contract addresses (removes newlines)
VERCEL_TOKEN=your_token ./scripts/fix-vercel-addresses.sh

# Verify contract ownership
npm run tsx scripts/verify-contract-ownership.ts
```

### Post-Deploy Checklist

- [ ] Supabase Auth URLs configured (Site URL + Redirect URLs)
- [x] Stripe webhook configured (`/webhook/stripe`) - **Live mode active**
- [ ] Base mainnet environment variables set (without trailing newlines)
- [ ] Contract addresses verified in Vercel
- [ ] Wallet funded with ETH for gas fees
- [ ] Contract ownership verified

### Important Notes

⚠️ **Environment Variables**: Contract addresses in Vercel must not have trailing newlines.

⚠️ **Contract Ownership**: The `BLOCKCHAIN_PRIVATE_KEY` must correspond to the contract owner.

---

## Tech Stack

### Core Framework

- **Next.js 14** (App Router) - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend Services

- **Supabase** - Auth + PostgreSQL database
- **Stripe** - Payment processing (Live mode - Production)
- **Groq API** - AI evaluation (Grok)

### Blockchain

- **Base Mainnet** - L2 blockchain (Coinbase)
- **Hardhat** - Smart contract development
- **ethers.js v6** - Blockchain interaction
- **Solidity 0.8.24** - Smart contracts

### 3D Visualization

- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for R3F

### Deployment

- **Vercel** - Hosting and deployment

---

## Contributing

We welcome contributions! Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive documentation
- Test coverage for new features

### Issue Templates

We use GitHub issue templates for:

- 🐛 [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.md)

---

## Security

- ✅ Environment variables never committed to git
- ✅ Private keys stored securely in Vercel
- ✅ Stripe webhook signatures verified
- ✅ OAuth redirects validated
- ✅ API routes protected
- ✅ Database queries parameterized
- ✅ Row Level Security (RLS) enabled

**Important**: Never commit `.env` files or expose API keys.

For security vulnerabilities, please see [`SECURITY.md`](SECURITY.md).

---

## License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

---

## Support

- **Issues**: Open an issue on [GitHub Issues](https://github.com/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe/issues)
- **Documentation**: See [`docs/`](docs/) directory
- **Protocol**: See [`protocol/README.md`](protocol/README.md)

---

## Acknowledgments

Built for the Syntheverse ecosystem with ❤️

**FractiAI** - Reference Operator  
**Base** - Blockchain Infrastructure  
**Vercel** - Deployment Platform

---

**Last Updated**: January 7, 2025  
**Version**: 2.7 (Sales Tracking & Activity Stats)

### Version History

- **v2.7** (January 2025): Sales Tracking & Activity Stats - Added comprehensive sales tracking dashboard with revenue, subscription, payment, and customer analytics. Added activity stats dashboard tracking page activity, new users, submissions, chat sessions, and problems reported. Both dashboards are accessible to operators and creators with auto-refresh capabilities. Sales tracking integrates with Stripe API and database records for real-time analytics.
- **v2.6** (January 2025): Creator Dashboard - Creator-controlled destructive operations for PoC archive management and user administration. Includes PoC archive reset (hard mode), user deletion (hard mode), operator role management, and complete audit logging. Creator-only access (info@fractiai.com) with server-side permission enforcement and safeguards.
- **v2.5** (January 2025): Enterprise Frontier Sandbox Dashboard - Complete enterprise sandbox system with tiered pricing, contribution management, analytics, and tokenized rewards. Featured on FractiAI page with "Get" buttons and integrated into onboarding flow. Narrative emphasizes customized HHF-AI sandbox ecosystem nested within Syntheverse, broadcast to contributor channels, with transparent scoring and SYNTH90T ERC-20 MOTHERLODE VAULT alignment.
- **v2.4** (January 2025): Scalability improvements - vectors-only redundancy, 4000 char submission limit, automatic truncation
- **v2.3** (January 2025): Genesis transaction info, mobile navigation, repository organization
- **v2.2** (January 2025): Operator broadcast banner, status indicators, complete test suite (60/60 passing)
- **v2.1** (January 2025): Environment variable fixes, ownership verification, enhanced error handling
- **v2.0** (January 2025): Base Mainnet migration complete, production ready
