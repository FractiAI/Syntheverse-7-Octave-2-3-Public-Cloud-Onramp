# Syntheverse PoC Contributor Dashboard

> **Protocol + Operator Reference Client** - A production-ready Next.js application for Proof-of-Contribution (PoC) submissions, evaluations, and blockchain anchoring.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![Base Mainnet](https://img.shields.io/badge/Blockchain-Base%20Mainnet-blue)](https://base.org)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Migration Report](#pre-migration-report)
- [Current Status](#current-status)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

This repository implements the **Syntheverse Protocol** - a public, implementation-agnostic specification for Proof-of-Contribution (PoC) primitives, scoring lenses, data models, and optional on-chain anchoring.

### Key Concepts

- **The Syntheverse Protocol**: Public specification for PoC primitives, scoring, and anchoring
- **Operators**: Concrete implementations with infrastructure choices, policies, and costs
- **FractiAI**: Reference operator maintaining this client

### What We're Building

An operator-safe "lens + archive + optional anchoring" system where contributions become durable, auditable records—without token-sale framing.

**Protocol-first approach**: The *spec* (what must be true) is separated from the *operator* (how it is run).

---

## 🔄 Pre-Migration Report

### Migration Context: Hardhat → Base Mainnet

**Migration Date**: January 2025  
**Status**: ✅ **COMPLETE** - Base Mainnet Production Ready  
**Target Network**: Base Mainnet (Chain ID: 8453) - **ACTIVE**

### Pre-Migration State (Before Base Migration)

#### Network Configuration
- **Network**: Hardhat (local/testnet)
- **Chain ID**: 31337 (Hardhat local) or custom testnet
- **RPC**: `http://localhost:8545` or custom Hardhat node
- **Block Explorer**: None (local network)

#### Contract Architecture
- **Contracts**: Custom SYNTH, SyntheverseLens, POCRegistry
- **Solidity Version**: 0.8.19
- **Hardhat Version**: v2.22.18
- **Deployment**: Manual Hardhat deployment scripts
- **Contract Addresses**: Local/testnet addresses (not on public mainnet)

#### Integration Status
- ✅ Basic PoC registration via POCRegistry
- ✅ Transaction hash storage in database
- ✅ Hardhat RPC integration with ethers.js v6
- ⚠️ Limited to test environments
- ⚠️ No public mainnet deployment
- ⚠️ No integration with production Genesis contracts

#### Environment Variables (Pre-Migration)
```env
# Hardhat Configuration
HARDHAT_RPC_URL=http://localhost:8545
POC_REGISTRY_ADDRESS=0x...  # Local/testnet address
BLOCKCHAIN_PRIVATE_KEY=0x... # Test wallet
```

#### Limitations
1. **Network Isolation**: Hardhat networks are not publicly accessible
2. **No Mainnet Presence**: Contracts not deployed on production blockchain
3. **Limited Scalability**: Hardhat suitable for development only
4. **No Public Verification**: Transactions not verifiable on public explorers
5. **Contract Mismatch**: Using custom contracts instead of deployed Genesis contracts

### Post-Migration State (Current - Phase 1 Complete)

#### Network Configuration
- **Network**: Base Mainnet (Chain ID: 8453) + Base Sepolia (Chain ID: 84532)
- **RPC**: `https://mainnet.base.org` / `https://sepolia.base.org`
- **Block Explorer**: https://basescan.org
- **Gas Costs**: ~0.1 gwei (very low)

#### Contract Architecture
- **Contracts**: SyntheverseGenesisSYNTH90T, SyntheverseGenesisLensKernel (deployed on Base mainnet)
- **Solidity Version**: 0.8.24
- **Hardhat Version**: v2.22.18 (updated for Base)
- **Deployment**: Genesis contracts already deployed
- **Contract Addresses**: 
  - SYNTH90T: `0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3`
  - LensKernel: `0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8`

#### Integration Status
- ✅ Base mainnet network configuration complete
- ✅ Genesis contract ABIs created
- ✅ Base mainnet integration code implemented
- ✅ Environment variables documented and validated
- ✅ Vercel environment variables configured (with newline fixes)
- ✅ Contract integration complete (register-poc.ts updated)
- ✅ Lens event emission working with ownership verification
- ✅ Default network set to Base Mainnet
- ✅ Gas balance checker implemented
- ✅ Contract ownership verification script added
- ✅ Environment variable trimming (fixes newline issues)
- ✅ Enhanced error handling and logging
- ✅ Production ready for PoC registrations

#### Environment Variables (Post-Migration)
```env
# Base Network Configuration
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BLOCKCHAIN_NETWORK=base_mainnet  # or base_sepolia for testing

# Genesis Contract Addresses
SYNTH90T_CONTRACT_ADDRESS=0xAC9fa48Ca1D60e5274d14c7CEd6B3F4C1ADd1Aa3
LENS_KERNEL_CONTRACT_ADDRESS=0xD9ABf9B19B4812A2fd06c5E8986B84040505B9D8
MOTHERLODE_VAULT_ADDRESS=0x3563388d0e1c2d66a004e5e57717dc6d7e568be3

# Deployment Wallet
BLOCKCHAIN_PRIVATE_KEY=0x...  # Production wallet
DEPLOYER_ADDRESS=0x...        # Public address
```

### Migration Benefits

1. **Public Mainnet**: Contracts deployed on Base mainnet (publicly verifiable)
2. **Low Gas Costs**: Base has very low transaction fees (~$0.01 per transaction)
3. **Production Ready**: Real blockchain with public explorers
4. **Genesis Integration**: Using official Syntheverse Genesis contracts
5. **Scalability**: Base L2 provides high throughput and low latency
6. **Ecosystem**: Part of Coinbase's Base ecosystem

### Migration Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Infrastructure | ✅ Complete | Hardhat config, ABIs, integration code, docs |
| Phase 2: Contract Integration | ✅ Complete | register-poc.ts updated, Genesis contracts integrated |
| Phase 3: Dashboard UI/UX | ✅ Complete | Core functionality working, ready for production |
| Phase 4: Testing | ✅ Complete | Base Sepolia tested, mainnet verified |
| Phase 5: Production | ✅ **LIVE** | **Production on Base Mainnet - Ready for PoC Registrations** |

**Overall Progress**: ✅ **100% Complete - Production Ready on Base Mainnet**

---

## Current Status

### ✅ Production Ready Features

- **PoC Lifecycle**: Submission → Archive → Evaluation → Qualification → Blockchain Anchoring
- **Scoring Lens**: Novelty, density, coherence, alignment with overlap-aware redundancy
- **3D Vectorized Sandbox**: Three.js + R3F visualization of PoCs
- **Authentication**: Supabase Auth (OAuth + email/password)
- **Payments**: Stripe Checkout + Billing Portal
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Blockchain**: ✅ **Base Mainnet Production** - Lens event emission, token allocation ready
- **LLM Metadata**: Full capture of evaluation metadata (timestamp, model, version, prompts)

### 🎯 Current Status: **LIVE ON BASE MAINNET**

- ✅ Base Mainnet integration complete
- ✅ Genesis contracts integrated (SYNTH90T, LensKernel)
- ✅ PoC registration via Lens events working
- ✅ Contract ownership verification implemented
- ✅ Environment variable handling (newline fixes)
- ✅ Enhanced error handling and transaction logging
- ✅ Gas balance checker implemented
- ✅ Default network: Base Mainnet (Chain ID: 8453)
- ✅ Ready for production PoC registrations

### 🔧 Recent Improvements (January 2025)

- **Environment Variable Fixes**: Aggressive trimming of contract addresses to prevent newline issues
- **Ownership Verification**: Automatic verification that wallet is contract owner before transactions
- **Error Handling**: Enhanced error messages with detailed transaction information
- **Vercel Integration**: Scripts to fix and update environment variables via CLI
- **Debugging Tools**: Contract ownership verification and gas balance checking scripts

### 📋 Future Enhancements

- Wallet connection UI for user-controlled transactions
- Enhanced on-chain data display components
- Event subscription dashboard

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)
- Base wallet with ETH (for blockchain operations)

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd Syntheverse_PoC_Contributer_UI_Vercel_Stripe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Environment Setup

See [Environment Variables](#environment-variables) section below for complete configuration.

---

## Repository Structure

```
.
├── 📁 app/                          # Next.js App Router
│   ├── api/                         # API routes
│   │   ├── test/                    # Test endpoints (Base Sepolia)
│   │   ├── poc/                     # PoC operations
│   │   ├── evaluate/                # Evaluation endpoints
│   │   └── ...
│   ├── auth/                        # Authentication routes
│   ├── dashboard/                   # Protected dashboard
│   └── ...
│
├── 📁 components/                    # React components
│   ├── ui/                          # shadcn/ui components
│   ├── 3d/                          # 3D visualization
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
│       ├── hardhat.config.js         # Base mainnet config
│       ├── deploy/                   # Deployment scripts
│       └── src/                     # Solidity contracts
│
├── 📁 docs/                          # Documentation
│   ├── BASE_MAINNET_MIGRATION_PLAN.md
│   ├── BASE_MAINNET_ENV_SETUP.md
│   ├── BASE_SEPOLIA_TESTING_PLAN.md
│   └── ...
│
├── 📁 scripts/                       # Utility scripts
│   ├── setup-vercel-env.sh          # Vercel env setup
│   ├── fix-vercel-addresses.sh       # Fix contract addresses in Vercel
│   ├── verify-contract-ownership.ts  # Verify wallet is contract owner
│   ├── test-base-sepolia.ts         # Base Sepolia testing
│   ├── check-gas-balance.ts         # Check wallet ETH balance
│   └── ...
│
├── 📁 supabase/                      # Database migrations
│   └── migrations/                  # SQL migration files
│
├── 📁 protocol/                      # Protocol specification
├── 📁 operator/                      # Operator documentation
│
├── 📄 .env                           # Environment variables (gitignored)
├── 📄 .env.example                   # Environment template
├── 📄 package.json
└── 📄 README.md                      # This file
```

### Key Directories

- **`app/`**: Next.js 14 App Router pages and API routes
- **`components/`**: React components (UI + business logic)
- **`utils/`**: Shared utilities organized by domain
- **`syntheverse-ui/src/blockchain/`**: Hardhat contracts and deployment scripts
- **`docs/`**: Comprehensive documentation including migration plans
- **`scripts/`**: Utility scripts for deployment and testing

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

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

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
- **Testing Plan**: [`docs/BASE_SEPOLIA_TESTING_PLAN.md`](docs/BASE_SEPOLIA_TESTING_PLAN.md) - Testnet validation

### Deployment Documentation

- **Vercel Deployment**: [`docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- **Vercel Base Sepolia**: [`docs/VERCEL_BASE_SEPOLIA_SETUP.md`](docs/VERCEL_BASE_SEPOLIA_SETUP.md)
- **Base Sepolia Quick Start**: [`docs/BASE_SEPOLIA_QUICK_START.md`](docs/BASE_SEPOLIA_QUICK_START.md)

### Integration Documentation

- **Stripe**: [`docs/stripe/STRIPE_WEBHOOK_SETUP.md`](docs/stripe/STRIPE_WEBHOOK_SETUP.md)
- **OAuth**: [`docs/oauth/OAUTH_QUICK_SETUP.md`](docs/oauth/OAUTH_QUICK_SETUP.md)
- **Supabase**: [`docs/supabase/`](docs/supabase/)

### Testing Documentation

- **Pre-Test Report**: [`tests/PRETEST_REPORT.md`](tests/PRETEST_REPORT.md) - **Executive summary and testing readiness assessment** ⭐
- **Test Suite Overview**: [`tests/README.md`](tests/README.md) - Complete test suite documentation
- **Comprehensive Coverage**: [`tests/COMPREHENSIVE_TEST_COVERAGE.md`](tests/COMPREHENSIVE_TEST_COVERAGE.md) - All components, pages, and functions
- **Lens & Sandbox Testing**: [`tests/LENS_AND_SANDBOX_TESTING.md`](tests/LENS_AND_SANDBOX_TESTING.md) - HHF-AI lens and sandbox validation
- **Constants Validation**: [`tests/CONSTANTS_VALIDATION.md`](tests/CONSTANTS_VALIDATION.md) - Physical constants and equations
- **Vercel Testing Config**: [`tests/VERCEL_TESTING_CONFIG.md`](tests/VERCEL_TESTING_CONFIG.md) - Vercel server testing setup

---

## Testing

### Testing Status

**✅ Testing Infrastructure**: Fully configured and ready  
**✅ Test Framework**: Mocha + Chai + TypeScript  
**✅ Hardhat Configuration**: Base Mainnet forking enabled  
**📊 Current Coverage**: ~30% (expanding to 90%+)  
**🎯 Testing Readiness**: **READY TO PROCEED**

### Pre-Test Report

**📄 [Pre-Test Report](tests/PRETEST_REPORT.md)** - Comprehensive executive summary and testing readiness assessment

The pre-test report includes:
- Executive summary
- System overview
- Testing infrastructure
- Test coverage plan (36 components, 20 pages, 33 utilities)
- Test execution plan (5 phases)
- Risk assessment
- Success criteria
- Recommendations

### Test Suites

**Hardhat Tests** (6 suites) - ✅ Complete
- Scoring determinism
- Tokenomics validation
- Lens consistency
- Sandbox vector mapping
- Calibration (peer-reviewed papers)
- Constants & equations validation

**Integration Tests** (3 suites) - 📋 Pending
- PoC submission flow
- Evaluation flow
- Registration flow

**Security Tests** (2 suites) - 📋 Pending
- Authentication security
- API security

**Load Tests** (1 suite) - 📋 Pending
- API load testing

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

### Test Environment

- **Execution**: Vercel server (production/preview environments)
- **Blockchain**: Hardhat forking Base Mainnet (Chain ID: 8453)
- **Database**: PostgreSQL via Supabase (test database)
- **AI Evaluation**: Grok API (test mode)

### Test Reports

Test reports are generated in `tests/reports/`:
- **JSON Reports**: Machine-readable test results
- **HTML Reports**: Human-readable test reports
- **Boot Sequence Report**: Available at `/fractiai/test-report`

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
- [ ] Stripe webhook configured (`/webhook/stripe`)
- [ ] Base mainnet environment variables set (without trailing newlines)
- [ ] Contract addresses verified in Vercel (use `fix-vercel-addresses.sh`)
- [ ] Wallet funded with ETH for gas fees (check via `/api/check-gas-balance`)
- [ ] Contract ownership verified (wallet must be contract owner)
- [ ] Test endpoint accessible: `/api/test/base-sepolia`

### Important Notes

⚠️ **Environment Variables**: Contract addresses in Vercel must not have trailing newlines. Use `fix-vercel-addresses.sh` to ensure clean addresses.

⚠️ **Contract Ownership**: The `BLOCKCHAIN_PRIVATE_KEY` must correspond to the contract owner (deployer: `0x3563388d0E1c2D66A004E5E57717dc6D7e568BE3`). Use `verify-contract-ownership.ts` to verify.

---

## Tech Stack

### Core Framework
- **Next.js 14** (App Router) - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend Services
- **Supabase** - Auth + PostgreSQL database
- **Stripe** - Payment processing
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

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive documentation

---

## Security

- ✅ Environment variables never committed to git
- ✅ Private keys stored securely in Vercel
- ✅ Stripe webhook signatures verified
- ✅ OAuth redirects validated
- ✅ API routes protected
- ✅ Database queries parameterized

**Important**: Never commit `.env` files or expose API keys.

---

## License

MIT License - See [`LICENSE`](LICENSE) file.

---

## Support

- **Issues**: Open an issue on GitHub
- **Documentation**: See [`docs/`](docs/) directory
- **Protocol**: See [`protocol/README.md`](protocol/README.md)

---

## Acknowledgments

Built for the Syntheverse ecosystem with ❤️

**FractiAI** - Reference Operator  
**Base** - Blockchain Infrastructure  
**Vercel** - Deployment Platform

---

**Last Updated**: January 2025  
**Version**: 2.1 (Base Mainnet Production - Environment & Error Handling Improvements)

### Recent Changes

- **v2.1** (January 2025): Environment variable fixes, ownership verification, enhanced error handling
- **v2.0** (January 2025): Base Mainnet migration complete, production ready
