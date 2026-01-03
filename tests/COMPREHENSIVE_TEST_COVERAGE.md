# Comprehensive Test Coverage Plan

## Overview

This document outlines comprehensive test coverage for **all components, pages, and functions** in the Syntheverse PoC Contributor Dashboard.

**Testing Environment**: Hardhat emulating Base Mainnet (forking Base Mainnet)

---

## Test Coverage Status

### ✅ Components (36 components)

#### Core Dashboard Components
- [x] `ReactorCore.tsx` - SYNTH token display, epoch breakdown
- [x] `FrontierModule.tsx` - PoC archive, submission listing
- [x] `BootSequenceIndicators.tsx` - Boot status lights
- [ ] `PoCDashboardStats.tsx` - Statistics dashboard
- [ ] `SandboxMap3D.tsx` - 3D visualization
- [ ] `CockpitHeader.tsx` - Dashboard header
- [ ] `DashboardHeader.tsx` - Header with profile
- [ ] `DashboardHeaderProfileDropdown.tsx` - Profile dropdown

#### Forms & Input Components
- [ ] `SubmitContributionForm.tsx` - PoC submission form
- [ ] `LoginForm.tsx` - Login form
- [ ] `SignupForm.tsx` - Signup form
- [ ] `ForgotPasswordForm.tsx` - Password reset form
- [ ] `ResetPasswordForm.tsx` - Password reset confirmation
- [ ] `UpdateUsernameForm.tsx` - Username update form

#### Navigation & Layout
- [ ] `Navigation.tsx` - Main navigation
- [ ] `Footer.tsx` - Footer component
- [ ] `OnboardingNavigator.tsx` - Training modules
- [ ] `FractiAILanding.tsx` - Landing page content

#### Payment & Stripe
- [ ] `StripePricingTable.tsx` - Pricing table
- [ ] `FinancialAlignmentButton.tsx` - Financial support button

#### Status & Info
- [ ] `FractiAIStatusWidget.tsx` - Status widget
- [ ] `TestReportView.tsx` - Test report viewer
- [ ] `ErrorBoundary.tsx` - Error handling
- [ ] `ProviderSigninBlock.tsx` - OAuth signin

#### UI Components (shadcn/ui)
- [ ] `ui/button.tsx` - Button component
- [ ] `ui/card.tsx` - Card component
- [ ] `ui/dialog.tsx` - Dialog component
- [ ] `ui/dropdown-menu.tsx` - Dropdown menu
- [ ] `ui/input.tsx` - Input field
- [ ] `ui/label.tsx` - Label component
- [ ] `ui/badge.tsx` - Badge component
- [ ] `ui/skeleton.tsx` - Loading skeleton
- [ ] `ui/separator.tsx` - Separator
- [ ] `ui/alert.tsx` - Alert component

#### Legacy/Deprecated
- [ ] `PoCArchive.tsx` - Legacy archive (if still used)
- [ ] `EpochTokenDisplay.tsx` - Legacy epoch display (if still used)

---

### ✅ Pages (20 pages)

#### Public Pages
- [ ] `app/page.tsx` - Home page
- [ ] `app/fractiai/page.tsx` - FractiAI landing
- [ ] `app/fractiai/hhf-ai/page.tsx` - HHF-AI page
- [ ] `app/fractiai/awarenessverse/page.tsx` - Awarenessverse page
- [ ] `app/fractiai/syntheverse/page.tsx` - Syntheverse brief
- [ ] `app/fractiai/genome-12d/page.tsx` - 12D Genome page
- [ ] `app/fractiai/test-report/page.tsx` - Test report page
- [ ] `app/onboarding/page.tsx` - Onboarding page

#### Authentication Pages
- [ ] `app/login/page.tsx` - Login page
- [ ] `app/signup/page.tsx` - Signup page
- [ ] `app/signup/check-email/page.tsx` - Email confirmation
- [ ] `app/forgot-password/page.tsx` - Forgot password
- [ ] `app/forgot-password/reset/page.tsx` - Reset password
- [ ] `app/forgot-password/reset/success/page.tsx` - Reset success
- [ ] `app/forgot-password/success/page.tsx` - Forgot password success

#### Protected Pages
- [ ] `app/dashboard/page.tsx` - Main dashboard
- [ ] `app/submit/page.tsx` - Submit contribution
- [ ] `app/account/page.tsx` - Account settings
- [ ] `app/subscribe/page.tsx` - Subscription page
- [ ] `app/subscribe/success/page.tsx` - Subscription success

---

### ✅ API Routes (All API endpoints)

#### PoC & Evaluation APIs
- [ ] `app/api/evaluate/route.ts` - PoC evaluation
- [ ] `app/api/submit/route.ts` - PoC submission
- [ ] `app/api/archive/route.ts` - Archive data
- [ ] `app/api/sandbox-map/route.ts` - 3D map data
- [ ] `app/api/vectors/route.ts` - Vector embeddings
- [ ] `app/api/test-report/latest/route.ts` - Test report

#### Tokenomics & Epochs
- [ ] `app/api/tokenomics/epoch-info/route.ts` - Epoch information
- [ ] `app/api/tokenomics/route.ts` - Tokenomics data
- [ ] `app/api/epochs/route.ts` - Epochs data

#### Blockchain & Registration
- [ ] `app/api/blockchain/register/route.ts` - PoC registration
- [ ] `app/api/blockchain/status/route.ts` - Registration status

#### Stripe & Payments
- [ ] `app/api/stripe/checkout/route.ts` - Stripe checkout
- [ ] `app/api/stripe/webhook/route.ts` - Stripe webhook
- [ ] `app/api/stripe/customer-portal/route.ts` - Customer portal

#### User & Account
- [ ] `app/api/user/route.ts` - User data
- [ ] `app/api/user/update-username/route.ts` - Username update

---

### ✅ Utility Functions (33 utility files)

#### Blockchain Utilities
- [x] `utils/blockchain/base-mainnet-integration.ts` - Base Mainnet integration
- [x] `utils/blockchain/register-poc.ts` - PoC registration
- [ ] `utils/blockchain/base-mainnet-integration-simple.ts` - Simple integration

#### Database Utilities
- [x] `utils/db/db.ts` - Database connection
- [x] `utils/db/schema.ts` - Database schema
- [ ] `utils/db/numeric-helpers.ts` - Numeric helpers

#### Evaluation & Grok
- [x] `utils/grok/evaluate.ts` - Grok evaluation
- [x] `utils/grok/evaluate-improved.ts` - Improved evaluation
- [x] `utils/grok/system-prompt.ts` - System prompt

#### Vector & Embeddings
- [x] `utils/vectors/embeddings.ts` - Embedding generation
- [x] `utils/vectors/hhf-3d-mapping.ts` - 3D coordinate mapping
- [x] `utils/vectors/redundancy.ts` - Redundancy detection
- [ ] `utils/vectors/index.ts` - Vector utilities index

#### Tokenomics
- [x] `utils/tokenomics/epoch-metal-pools.ts` - Metal pools
- [x] `utils/tokenomics/projected-allocation.ts` - Projected allocation
- [x] `utils/tokenomics/metal-assay.ts` - Metal assay
- [ ] `utils/tokenomics/metal-amplification.ts` - Metal amplification

#### Epochs & Qualification
- [x] `utils/epochs/qualification.ts` - Qualification logic

#### Archive & Matching
- [ ] `utils/archive/extract.ts` - Content extraction
- [ ] `utils/archive/find-matches.ts` - Match finding

#### Supabase
- [x] `utils/supabase/server.ts` - Server-side Supabase
- [x] `utils/supabase/client.ts` - Client-side Supabase
- [ ] `utils/supabase/middleware.ts` - Supabase middleware

#### Stripe
- [ ] `utils/stripe/api.ts` - Stripe API utilities

#### Email
- [ ] `utils/email/send-welcome-email.ts` - Welcome email
- [ ] `utils/email/send-approval-request.ts` - Approval email

#### Other Utilities
- [ ] `utils/rate-limit.ts` - Rate limiting
- [ ] `utils/cors.ts` - CORS configuration
- [ ] `utils/env-validation.ts` - Environment validation
- [ ] `utils/debug.ts` - Debug utilities

---

## Test Categories

### 1. Component Tests
**Location**: `tests/components/`

Test each component:
- Rendering (mount/unmount)
- Props handling
- State management
- User interactions
- Error boundaries
- Loading states
- Edge cases

### 2. Page Tests
**Location**: `tests/pages/`

Test each page:
- Route accessibility
- Authentication requirements
- Data fetching
- Server-side rendering
- Client-side hydration
- Error handling
- Redirects

### 3. API Route Tests
**Location**: `tests/api/`

Test each API route:
- Request handling
- Response format
- Authentication/authorization
- Input validation
- Error responses
- Rate limiting
- CORS headers

### 4. Utility Function Tests
**Location**: `tests/utils/`

Test each utility:
- Function logic
- Input/output validation
- Error handling
- Edge cases
- Integration with dependencies

### 5. Integration Tests
**Location**: `tests/integration/`

Test end-to-end flows:
- PoC submission → evaluation → registration
- User signup → authentication → dashboard
- Payment → webhook → database update
- Blockchain registration → status tracking

### 6. Hardhat/Blockchain Tests
**Location**: `tests/hardhat/`

Test blockchain interactions:
- Contract interactions (Hardhat forking Base)
- Transaction creation
- Event listening
- State verification
- Gas estimation

---

## Test Implementation Plan

### Phase 1: Core Components (Priority 1)
1. `ReactorCore.tsx` ✅
2. `FrontierModule.tsx` ✅
3. `BootSequenceIndicators.tsx` ✅
4. `PoCDashboardStats.tsx`
5. `SandboxMap3D.tsx`
6. `SubmitContributionForm.tsx`

### Phase 2: Authentication & Forms (Priority 2)
1. `LoginForm.tsx`
2. `SignupForm.tsx`
3. `ForgotPasswordForm.tsx`
4. `ResetPasswordForm.tsx`
5. `UpdateUsernameForm.tsx`

### Phase 3: Pages (Priority 3)
1. `app/dashboard/page.tsx`
2. `app/submit/page.tsx`
3. `app/login/page.tsx`
4. `app/signup/page.tsx`
5. `app/fractiai/page.tsx`

### Phase 4: API Routes (Priority 4)
1. `app/api/evaluate/route.ts`
2. `app/api/submit/route.ts`
3. `app/api/archive/route.ts`
4. `app/api/tokenomics/epoch-info/route.ts`
5. `app/api/stripe/webhook/route.ts`

### Phase 5: Utilities (Priority 5)
1. Remaining utility functions
2. Edge case coverage
3. Performance testing

---

## Test Execution

### Run All Tests
```bash
npm run test:all
```

### Run Component Tests
```bash
npm run test:components
```

### Run Page Tests
```bash
npm run test:pages
```

### Run API Tests
```bash
npm run test:api
```

### Run Utility Tests
```bash
npm run test:utils
```

---

## Coverage Goals

- **Components**: 90%+ coverage
- **Pages**: 85%+ coverage
- **API Routes**: 95%+ coverage
- **Utilities**: 90%+ coverage
- **Integration**: 80%+ coverage

---

## Hardhat Configuration

### Forking Base Mainnet

Hardhat is configured to **fork Base Mainnet** for testing:

```javascript
// hardhat.config.js
hardhat: {
  chainId: 8453, // Base Mainnet chain ID
  forking: {
    url: "https://mainnet.base.org",
    enabled: true,
  },
}
```

This allows:
- ✅ Testing against actual Base Mainnet state
- ✅ Using actual contract addresses
- ✅ Emulating Base Mainnet without using real Base
- ✅ Fast, deterministic testing

---

**Last Updated**: January 2025  
**Status**: In Progress  
**Total Components**: 36  
**Total Pages**: 20  
**Total Utilities**: 33  
**Test Coverage**: ~30% (expanding)

