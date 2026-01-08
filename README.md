# Syntheverse PoC Contributor Dashboard

> **Protocol + Operator Reference Client** - A production-ready Next.js application for Proof-of-Contribution (PoC) submissions, evaluations, and blockchain anchoring on Base Mainnet.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![Base Mainnet](https://img.shields.io/badge/Blockchain-Base%20Mainnet-blue)](https://base.org)
[![Tests](https://img.shields.io/badge/Tests-60%2F60%20Passing-success)](tests/FINAL_TEST_REPORT.md)

> **📖 New to the codebase?** See the [Senior Engineer Production Briefing](docs/SENIOR_ENGINEER_PRODUCTION_BRIEFING.md) for a comprehensive system overview covering architecture, workflows, key features, and operational considerations.

> **🔧 Latest Update (Jan 8, 2026):** Fixed zero scores issue - Resolved environment variable name mismatch (`GROK` → `GROQ`) that was preventing AI evaluations. All submissions now receive proper scoring. See [Zero Scores Fix Documentation](docs/ZERO_SCORES_FIX.md) for details.

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
- [Documentation](#documentation) - **See [Production Briefing](docs/SENIOR_ENGINEER_PRODUCTION_BRIEFING.md) for comprehensive system overview**
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

# Run database migrations
# In Supabase SQL Editor, run:
# 1. supabase/migrations/20250121000001_create_blog_posts.sql (creates blog_posts table)
# 2. supabase/migrations/20250121000002_add_welcome_post.sql (adds welcome post)
# 3. supabase/migrations/add_synthchat_production.sql (creates chat tables)
# 4. supabase/migrations/SOCIAL_MEDIA_SETUP_SNIPPET.sql (creates social media tables - copy entire file)
#
# Also create storage buckets:
# - blog-images (5MB, public)
# - chat-images (10MB, public)
# - chat-files (20MB, public)
# - social-media-images (5MB, public)
# - profile-pictures (2MB, public)
# - Go to Supabase Dashboard → Storage → New Bucket
# - blog-images: Public: Yes, Size limit: 5MB, MIME types: image/*
# - chat-images: Public: Yes, Size limit: 10MB, MIME types: image/*
# - chat-files: Public: Yes, Size limit: 20MB, MIME types: application/pdf

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
- **Seed Submission Recognition**: First submissions to a sandbox receive 15% score multiplier (×1.15) based on Seed Information Theory
- **Operator Mode**: Special exemption for operator accounts
- **Creator Dashboard**: Creator-only destructive controls for PoC lifecycle management and user administration
- **Mobile UI Optimization**: Crisp, beautiful desktop-quality display on mobile with proper typography hierarchy, proportional spacing, and maintained visual polish
- **Sales Tracking**: Simplified revenue tracking for creators and operators (Total, This Month, Last Month) with expandable details
- **Dashboard Layout**: Optimized dashboard structure with Core Instrument Panel at the very top, followed by Quick Actions, then navigation modules (Sandbox Navigator, PoC Archive, SynthChat Navigator)
  - **Core Instrument Panel**: SYNTH90T ERC-20 MOTHERLODE BLOCKMINE display showing available SYNTH tokens, epoch breakdown, and system status - positioned at the very top of all dashboards
  - **Quick Actions Panel**: Fixed-position panel in upper right corner of all dashboards with quick access buttons (FractiAI, Onboarding Navigator, Submit Contribution, Blog, Genesis on Base Mainnet, role-specific dashboards). Responsive design adapts to screen size while maintaining accessibility.
  - **Genesis Button**: "Check out our Syntheverse Genesis on Base Mainnet" button added to Quick Actions section on all dashboards
  - **Consistent Navigation**: Standardized table-based navigators across all dashboards for easy sandbox, PoC, and chat access
  - **Contributor Dashboard Cockpit**: Enhanced contributor dashboard with full cockpit design resonance - includes CockpitHeader, Contributor Cockpit title panel, enhanced system status indicators, Quick Operations panel, and Genesis Status panel. All panels use consistent cockpit styling with heavy keylines, proper typography hierarchy, and hydrogen-amber accents.
- **Sandbox Selector**: Dashboard-level sandbox selection with Syntheverse as default and enterprise sandboxes nested within
- **Activity Stats**: Page activity, new users, submissions, chat sessions, and problems reported tracking
- **Genesis Info**: On-chain transaction information display
- **Submission Limits**: 4000 character limit (abstract, equations, constants only) with automatic truncation
- **Scalability**: Vector-based redundancy detection scales to 10,000+ submissions without performance degradation

### 🏢 Worldbuilding Creator & Enterprise Application

**Customized HHF-AI Sandbox & Ecosystem, Nested Within Syntheverse**

- **For Worldbuilder Creators**: Unleash your creativity with an infinite set of HHF-AI materials and substrates. Unlimited access to holographic hydrogen fractal AI resources for building, iterating, and refining creative worlds with precision coherence measurement
- **For Enterprise Operators**: Create self-similar enterprise sandboxes within Syntheverse with customized HHF-AI evaluation
- **Nested PoC Environments**: Create self-similar enterprise sandboxes within Syntheverse
- **Broadcast to Contributor Channels & Creator Communities**: Accept submissions from your contributor channels, creator communities, and worldbuilding teams with clear, transparent scoring
- **Aligned Tokenomics**: Fully aligned with SYNTH90T ERC-20 MOTHERLODE VAULT—same epoch structure, metal assay system, and allocation logic
- **🆕 SYNTH Token-Based Pricing**: Blockchain-native pricing model (replaces Stripe subscriptions)
  - **Free Testing**: Create and test sandboxes for free with full functionality
  - **SYNTH Activation**: One-time 10,000 SYNTH token activation fee to enable production use
  - **Usage-Based Charges**: Rent (based on reach) + Energy (based on activity)
    - **Rent**: Monthly charges based on unique contributors (Seed: 1,000 SYNTH, Growth: 5,000 SYNTH, Community: 15,000 SYNTH, Ecosystem: 50,000 SYNTH, Metropolis: 100,000 SYNTH)
    - **Energy**: Per-operation charges (Evaluation: 100 SYNTH, Registration: 500 SYNTH, Allocation: 50 SYNTH, Analytics: 10 SYNTH)
  - **Transparent Costs**: All charges visible and predictable, scale with actual usage
  - **Creator Dashboard Access**: Creators and enterprises can manage their sandboxes from the creator dashboard
  - **✅ Database Migration Applied**: SYNTH pricing schema deployed to production (January 2025)
- **Vault Management**: Independent activate/pause controls per sandbox
- **SynthScan™ MRI Integration**: Full evaluation system with custom scoring weights
- **Analytics Dashboard**: Contribution metrics, SYNTH balance tracking, reach/activity metrics, score distribution
- **Tokenized Rewards**: Allocate tokens for qualified contributions
- **On-Chain Registration**: Optional 500 SYNTH per registration for permanent anchoring
- **Featured on FractiAI Page**: Prominently displayed with "Get PoC Enterprise Dashboard" buttons in Quick Navigation and Today's Highlights
- **Onboarding Integration**: Included in onboarding flow with dedicated Enterprise Operators section

### 🎯 Recent Additions

- **Seeds and Edges Module**: Added Module 14 to onboarding covering "Syntheverse Minimum Viable Product: Seeds and Edges"
  - Comprehensive module explaining the minimum viable generative set (9 seeds and 7 edge classes)
  - Includes abstract, definitions, predictions, experimental results, and implications
  - Added Seeds and Edges section to FractiAI landing page with overview and links to Module 14
  - Content based on January 6, 2026 expedition by Pru "El Taíno" Méndez × FractiAI Research Team
  - Demonstrates boundary-first model of reality construction with implications for AI, economics, and governance

- **Quick Actions Panel Enhancements**: Improved Quick Actions Panel positioning and functionality
  - Moved from fixed right-side panel to horizontal bar across top of all dashboards
  - Integrated System Status indicators (Protocol, Blockchain, HHF-AI, SynthScan™) into top bar
  - Consolidated all quick navigation and system status into single top horizontal bar
  - Panel uses normal document flow (position: relative) - not floating, doesn't overlap content
  - Responsive design with horizontal scrolling on mobile/tablet
  - All quick operations and system status now accessible from top bar

- **Broadcast System Error Handling**: Improved error handling for broadcast messages
  - Fixed 500 errors on `/api/broadcasts/all` endpoint when table doesn't exist (returns empty array gracefully)
  - Enhanced error handling in SystemBroadcastCenter component for 403 permission errors
  - All broadcast API calls now properly handle errors without hanging UI
  - Clear user-friendly error messages when permissions are missing
  - Prevents UI from hanging when selecting broadcast messages

- **Interactive Onboarding Training System**: Transformed onboarding from passive reading to active, hands-on training
  - **Training Paths**: Three paths (Contributor, Advanced, Operator) with progressive skill-building
  - **Hands-On Exercises**: Interactive practice exercises in each module for practical skill development
  - **Knowledge Checks**: 3-5 question assessments with scoring (80%+ to pass) ensuring comprehension before advancing
  - **Real-World Application**: Tasks connecting theory to actual Syntheverse operations and dashboard navigation
  - **Progress Tracking**: Module completion tracking and state management for exercise completion
  - **Module 1 Template**: Fully transformed Module 1 as template for remaining modules (2-15)
  - **Training Syllabus**: Comprehensive training documentation with 15 detailed module breakdowns, assessment framework, and certification paths
  - See [`docs/ONBOARDING_TRANSFORMATION_GUIDE.md`](docs/ONBOARDING_TRANSFORMATION_GUIDE.md) and [`docs/TRAINING_SYLLABUS.md`](docs/TRAINING_SYLLABUS.md) for complete details

- **Sales Tracking Dashboard**: Simplified revenue tracking for operators and creators
  - **Essential Metrics**: Total Revenue, This Month, Last Month (always visible)
  - **Expandable Details**: Click to expand for subscriptions, revenue by product, customers, and payments
  - **Auto-refresh**: Updates every 60 seconds
  - **Access Control**: Creator and Operator dashboard only (not visible in contributor dashboard)
- **Activity Stats Dashboard**: Comprehensive activity tracking for operators and creators
  - **Page Activity**: Total events tracked from system logs (today, this week, this month)
  - **New Users**: User registration tracking (total, today, this week, this month)
  - **Submissions**: Submission tracking with status breakdown (evaluating, qualified, unqualified, payment_pending)
  - **Chat Sessions**: Chat session tracking (placeholder for future chat system)
  - **Problems Reported**: Error and issue tracking with type categorization (errors, evaluation_errors, payment_errors, other)
  - **Auto-refresh**: Updates every 30 seconds
  - **Access Control**: Operator and Creator only, server-side permission enforcement
- **Broadcast Archive Navigator**: Archive view for all broadcast messages with filtering and status tracking
  - **Table-Based Display**: Similar to PoC Archive, shows all broadcasts in organized table format
  - **View Modes**: Filter by Active, Inactive, or All broadcasts
  - **Status Indicators**: Visual indicators for active/inactive status and message types (info, warning, alert, announcement, success, milestone, update)
  - **Metadata Display**: Shows message content, creation date, and creator information
  - **Available on All Dashboards**: Integrated as collapsible panel in Contributor, Creator, and Operator dashboards
  - **Auto-refresh**: Refresh button to reload latest broadcasts
  - **Error Handling**: Graceful handling of missing permissions and API errors
- **Creator/Operator Paywall Exemptions**: Comprehensive payment bypass for testing and development
  - **Submissions**: Creators and operators bypass $500 submission fee, submissions go directly to evaluation
  - **SynthScan Monthly**: Bypass monthly subscription fees for creators and operators
  - **Field Imaging Services**: Bypass FieldScan service fees (Light/Pro/Enterprise tiers)
  - **Enterprise Sandbox Plans**: Bypass Stripe checkout, sandboxes created and activated directly
  - **Sandbox Activation**: Bypass SYNTH token activation fees, sandboxes activated with testing balance
  - **Automatic Detection**: All paywall checks use `getAuthenticatedUserWithRole()` for automatic exemption
  - **Full Functionality**: Exempt users maintain all features while skipping payment processing
- **SynthChat - Collaborative Sandbox Chat System**: WhatsApp-style mobile chat interface for sandbox collaboration
  - **WhatsApp-Style Interface**: Mobile-first design with two-panel layout (sandbox list + chat view)
  - **Sandbox-Based Rooms**: Chat rooms organized by sandbox (Syntheverse default + enterprise + user-defined)
  - **Multi-User Participation**: Multiple users can participate in the same chat room
  - **Role-Based Display**: Shows Creator/Operator/Contributor badges for each message with avatars
  - **Real-Time Updates**: Auto-refreshes messages every 3 seconds
  - **File Upload Support**: Upload images (max 10MB) and PDFs (max 20MB) directly in chat
    - **Image Upload**: Click image button to upload images, displayed inline in messages
    - **PDF Upload**: Click PDF button to upload PDFs, displayed as download links
    - **File Preview**: See uploaded files before sending, remove from preview if needed
    - **Markdown Integration**: Files embedded as markdown in messages for compatibility
    - **Storage**: Files stored in Supabase Storage (chat-images and chat-files buckets)
  - **User-Defined Sandboxes**: Users can create custom chat sandboxes for projects/teams
  - **Connect/Disconnect**: Users can join or leave chat rooms with connection status tracking
  - **Chat Navigator**: Table-based navigation similar to PoC Archive, filter by search
  - **Available on All Dashboards**: SynthChat accessible via SynthChatNavigator component on all dashboards
  - **Embedded Mode**: Creator Dashboard displays chat interface directly in the Chat tab (no dialog)
  - **Participant Tracking**: Shows who's in each room with participant counts and connection status
  - **Auto-Join**: Syntheverse room auto-joins users on first access
  - **Message Bubbles**: WhatsApp-style rounded message bubbles with timestamps and sender names
  - **Last Message Preview**: Shows last message and timestamp in sandbox list
- **Social Media Panel - Sandbox-Based Community Feed**: Collapsible social media panel for sandbox-linked community engagement
  - **Sandbox-Linked Feeds**: Each sandbox has its own social feed, creating isolated communities within the Syntheverse ecosystem
  - **Post Creation**: Create posts with text content and optional image uploads (5MB limit)
  - **Image Uploads**: Upload images directly to posts with preview before posting
  - **Like System**: Like and unlike posts with real-time count updates
  - **Comment Threads**: Expandable comment sections with threaded discussions
  - **Profile Pictures**: Display user profile pictures on posts and comments (2MB limit, stored in Supabase Storage)
  - **Profile Picture Upload**: Upload and update profile pictures via dedicated API endpoint
  - **Post Management**: Delete own posts, view pinned posts (operators/creators can pin)
  - **Real-Time Updates**: Auto-refresh on post creation, like/comment actions
  - **Pagination**: Load more posts with infinite scroll support
  - **Sandbox Integration**: Automatically follows selected sandbox from dashboard (Syntheverse default or enterprise sandbox)
  - **Cockpit Styling**: Consistent cockpit aesthetic matching other dashboard panels
  - **Available on Contributor Dashboard**: Integrated as collapsible panel after Broadcast Archive
  - **Storage**: Images stored in Supabase Storage (social-media-images and profile-pictures buckets)
  - **Database**: Full database schema with posts, likes, comments tables, RLS policies, and auto-updating counters
- **Sandbox Selector**: Dashboard-level sandbox selection at top of dashboard page
  - **Syntheverse Default**: Always shown as the primary/default option
  - **Enterprise Sandboxes**: Nested below Syntheverse with visual separation
  - **Search & Filter**: Search by name, filter by subscription tier (Pioneer, Trading Post, Settlement, Metropolis)
  - **Contribution Counts**: Shows contribution and qualified counts for each sandbox
  - **Access Control**: Operators and creators see all sandboxes, regular users see only their own
- **Creator Dashboard Enhancements**:
  - **PoC Archive Integration**: Full PoC Archive view (same as contributor dashboard) showing all submissions
  - **Archive Management**: View and manage PoC entries with detailed statistics
  - **SynthChat Integration**: Collaborative chat system for creator coordination
  - **Sales Tracking**: Revenue and subscription analytics (simplified view with expandable details)
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
- **Status Indicators**: Comprehensive system status display in header (visible on all screen sizes)
  - **Syntheverse Components**: Green indicator lights showing online status for:
    - Syntheverse Protocol (always green, deployed)
    - Whole Brain AI
    - SynthScan MRI
    - PoC Sandbox
    - ERC-20 Base Mainnet Ecosystem
    - Awareness Bridge Router
  - **Current Sandbox Indicator**: Shows active sandbox with deployment status
    - Green pulsing light if deployed (`synth_activated: true`)
    - Gray static light if not deployed
    - Updates dynamically when sandbox selection changes
    - Reads from localStorage for persistence
  - **Beta Active Badge**: Shows current beta status
  - **Boot Sequence Indicators**: System initialization status
  - **Responsive Display**: Labels visible on large screens, tooltips on smaller screens
  - **Real-Time Updates**: Listens for sandbox selection changes across all dashboards
  - **Always Visible**: Status indicators displayed on all screen sizes (mobile, tablet, desktop)
- **Blog System**: Comprehensive blog functionality with sandbox-specific blogs
  - **Main Syntheverse Blog**: Public blog for protocol updates and announcements
  - **Sandbox-Specific Blogs**: Each creator/enterprise sandbox spawns its own blog page
  - **Blog Post Creator**: Rich text editor with markdown support, image upload/paste, and preview
  - **Image Support**: Upload images via file picker or paste directly from clipboard
  - **Markdown Formatting**: Full markdown support (headers, bold, italic, links, code blocks, lists, images)
  - **Cockpit Styling**: All blog pages styled in consistent cockpit theme
  - **Permissions Management**: Creator can control who can create blog posts (contributors, operators, creator)
  - **Access Control**: Permissions enforced server-side via blog_permissions table
  - **Featured Posts**: Mark posts as featured for prominent display
  - **Tags & Excerpts**: Organize posts with tags and optional excerpts
  - **Draft/Published Status**: Save drafts or publish immediately (defaults to published)
  - **Auto-refresh**: Page automatically refreshes after creating a post

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

### 🔬 SynthScan Prompt Transformation (January 2025)

**Hardened System Prompt with Deterministic Scoring & Full Transparency**

The system prompt has been transformed into a hardened SynthScan prompt incorporating comprehensive feedback for scientific validation and reproducibility:

- **✅ Deterministic Score Contract**: Versioned scoring config ID, sandbox context ID, and mandatory PoD composition breakdown showing complete calculation path
- **✅ One Source of Truth**: Fixed redundancy reporting to prevent showing "0.0% penalty" when no penalty exists
- **✅ Exposed Sweet Spot Parameters**: Documented ρ* (14.2%), τ (±5.0%), ρ_max (30%) with clear explanations
- **✅ Archive Similarity Distribution**: Enhanced to show overlap percentile, nearest 10 neighbors statistics, and computation context (global/per-user/per-sandbox)
- **✅ Documentation Consistency**: Fixed Module 12 mismatch (text-only PoC vs PDF pipeline)
- **✅ Testing Protocol**: Added guidance for reset baseline, lock configs, and re-run validation
- **✅ Seed Submission Detection**: System prompt includes seed submission recognition with 15% multiplier (×1.15) for foundational contributions

**Key Features:**
- Every evaluation includes `scoring_metadata` (config ID, sandbox ID, archive version)
- Complete `pod_composition` breakdown: `PoD = (N + D + C + A) × [multipliers] - [penalties] × [sandbox_factor]`
- `archive_similarity_distribution` with percentile ranking and neighbor statistics
- Seed multiplier applied: `Final = (Composite × (1 - penalty%/100)) × bonus_multiplier × seed_multiplier`
- Testing protocol ensures identical input + identical config ⇒ identical output

See [`SYNTHSCAN_PROMPT_TRANSFORMATION.md`](SYNTHSCAN_PROMPT_TRANSFORMATION.md) for complete details.

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
- ✅ **Zero Scores Issue Fixed** (Jan 8, 2026): Groq AI evaluation now working properly
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
│   ├── landing/                     # Landing page sections
│   ├── EnterpriseDashboard.tsx      # Enterprise dashboard UI
│   ├── EnterprisePricing.tsx         # Pricing tiers component
│   ├── EnterpriseSubmitForm.tsx      # Contribution submission form
│   ├── EnterpriseSandboxDetail.tsx   # Sandbox management page
│   ├── EnterpriseContributionDetail.tsx # Contribution details
│   ├── EnterpriseAnalytics.tsx       # Analytics dashboard
│   ├── SocialMediaPanel.tsx          # Social media feed component
│   ├── PostCard.tsx                 # Individual post display
│   ├── CreatePostForm.tsx           # Post creation form
│   ├── PostComments.tsx             # Comment threads
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
│       ├── 20250105000001_create_enterprise_tables.sql # Enterprise tables
│       ├── add_synthchat_production.sql # SynthChat tables (chat_rooms, chat_messages, chat_participants)
│       ├── SOCIAL_MEDIA_SETUP_SNIPPET.sql # Social media tables (copy-paste ready)
│       └── 20250106000002_create_social_media_tables.sql # Social media schema
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

### System Overview & Reviews

- **Production Briefing**: [`docs/SENIOR_ENGINEER_PRODUCTION_BRIEFING.md`](docs/SENIOR_ENGINEER_PRODUCTION_BRIEFING.md) - Comprehensive system overview for senior engineers
- **Code Review**: [`docs/CODE_REVIEW_SENIOR_ENGINEER.md`](docs/CODE_REVIEW_SENIOR_ENGINEER.md) - Detailed code review (8.5/10 rating)
- **Architecture**: [`ARCHITECTURE_OVERVIEW.md`](ARCHITECTURE_OVERVIEW.md) - System architecture and workflows
- **Scoring Transparency**: [`docs/RESPONSE_TO_MAREK_SIMBA_TESTING.md`](docs/RESPONSE_TO_MAREK_SIMBA_TESTING.md) - Response to tester feedback on scoring reproducibility
- **Metal-Aware Overlap**: [`docs/METAL_AWARE_OVERLAP_STRATEGY.md`](docs/METAL_AWARE_OVERLAP_STRATEGY.md) - Metal-specific overlap penalty strategy

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

**Last Updated**: January 2025  
**Version**: 2.27 (Dashboard Fixes & Persistent Panel State)

### Version History

- **v2.28** (January 2025): Deterministic Score Transparency & Formula Validation (Marek/Simba Audit Response) - Comprehensive scoring transparency overhaul in response to tester feedback. Implemented complete deterministic score trace showing all calculation steps: dimension scores, composite, overlap %, penalty %, bonus multiplier, seed multiplier, and final score with formula validation. Added scoring_metadata (config ID, sandbox ID, archive version, timestamp) and pod_composition to evaluation output for full audit trail. Fixed critical UI label bug: "Redundancy Penalty" now correctly labeled as "Redundancy Overlap" with visual indicators for sweet spot bonus (9.2%-19.2%) and excess penalty (>30%). Added real-time formula validation displaying k-factor (actual_score / (sum_dims × (1 − penalty%))) which should be ~1.0 - alerts if mismatch detected. All evaluation results now include authoritative score trace in UI with step-by-step calculation breakdown, configuration identifiers, and formula verification. This enables testers to validate that published formula matches displayed scores exactly, addressing all transparency concerns raised in production testing.

- **v2.27** (January 2025): Dashboard Fixes & Persistent Panel State - Critical fixes and UX improvements for contributor dashboard. Fixed mobile status indicators to consistently show "ERC-20 MOTHERLODE VAULT" label. Fixed social media panel logic that prevented Syntheverse sandbox posts from loading. Removed Genesis button from Reactor Core footer for cleaner interface. Fixed onboarding module numbering to be sequential (01-19 instead of duplicated MODULE 16). Added PersistentDetails component for collapsible panels - all dashboard panels (Reactor Core, Sandbox Navigator, SynthChat Navigator, Sandbox Channel, PoC Navigator) now remember their open/closed state across page refreshes using localStorage. Significantly improves UX by maintaining user preferences for panel visibility.

- **v2.26** (January 2025): Dashboard Navigation Clarity & Status Indicator Updates - Improved dashboard navigation clarity and terminology. Removed Dashboard button from Quick Actions Panel to reduce redundancy. Updated status indicators: renamed "ERC-20 Base" to "ERC-20 MOTHERLODE VAULT" for clearer blockchain integration context. Renamed navigation sections for better clarity: "FRONTIER MODULE" to "PoC NAVIGATOR", "SANDBOX" to "SANDBOX NAVIGATOR", and "SYNTHCHAT" to "SYNTHCHAT NAVIGATOR". All changes enhance user understanding of dashboard sections and their purpose while maintaining consistent cockpit aesthetic.

- **v2.25** (January 2025): Cockpit Dashboard Refinement & Three-Column Layout - Comprehensive dashboard UI optimization for enhanced cockpit resonance and coherence. Restructured contributor dashboard to three-column layout: left sidebar (compact Sandbox and SynthChat navigators), center column (Social Media Channel and Frontier Module as primary content), right column (future expansion). Removed Genesis and Broadcast buttons from Quick Actions Panel to reduce clutter. Added Genesis on Base button to Reactor Core footer for contextual access. Centered epoch breakdown display (FOUNDER/GOLD/SILVER/COPPER) for better visual balance. Streamlined STATUS panel to 5 core technical indicators: Awareness Bridge/Router, Whole Brain AI, SynthScan MRI, PoC Sandbox, ERC-20 Base, plus dynamic Current Sandbox indicator. Mobile optimization: hid status indicators on mobile (< 1024px), showing only My Account icon in header; reordered columns to prioritize Social Media Channel first; enhanced navigator readability with larger fonts (0.8rem) and better touch targets (44px minimum). Added cockpit-navigator-compact CSS class for left sidebar with compressed styling. Renamed Social Media Feed to dynamic "[Sandbox Name] CHANNEL" displaying actual sandbox names. Fixed CSS syntax error (extra closing brace) causing webpack build failure. All changes maintain cockpit aesthetic while improving information hierarchy and mobile UX.

- **v2.24** (January 2025): Landing Page Optimization & Social Media Panel - Streamlined landing page for better UX: moved trust indicators to top, added "Join the Frontier" button routing to dashboard, removed redundant "See How It Works" button and Token & Sandbox section, moved Proof Library to FractiAI page. Updated all content to be inclusive of "Frontier R&D, Creators & Enterprises" (not just R&D). Updated hero messaging, section descriptions, and page metadata to reflect new framing. Made content inclusive of research, creative work, and enterprise solutions throughout all landing sections. Social Media Panel: Added comprehensive sandbox-based community feed with posts, likes, comments, and image uploads. Full database schema with RLS policies, triggers, and profile picture support. Complete API endpoints and frontend components integrated into Contributor Dashboard.
- **v2.23** (January 2025): Social Media Panel - Sandbox-Based Community Feed - Added comprehensive social media panel for sandbox-linked community engagement. Implemented full database schema with social_posts, social_post_likes, and social_post_comments tables, including RLS policies, triggers for auto-updating like/comment counts, and profile picture support in users_table. Created complete API endpoints for posts (GET, POST, DELETE), likes (POST, DELETE), comments (GET, POST, DELETE), image uploads, and profile picture uploads. Built frontend components: SocialMediaPanel (main feed), PostCard (individual posts with profile pictures), CreatePostForm (post creation with image upload), and PostComments (comment threads). Integrated into Contributor Dashboard as collapsible panel. Features include sandbox-linked feeds (each sandbox has its own community), post creation with images (5MB limit), like/unlike system, comment threads, profile picture display and upload (2MB limit), post deletion, pagination, and real-time updates. Storage buckets: social-media-images (5MB) and profile-pictures (2MB) in Supabase Storage. Follows existing cockpit styling patterns and sandbox selection integration.
- **v2.22** (January 2025): Broadcast Archive Navigator & Creator/Operator Paywall Exemptions - Added Broadcast Archive Navigator component similar to PoC Archive, displaying all broadcast messages in a table format with filtering (Active/Inactive/All), status indicators, message types, and creation metadata. Integrated into all dashboards (Contributor, Creator, Operator) as collapsible panels. Implemented comprehensive paywall exemptions for creators and operators across all services: submissions (bypass $500 fee), SynthScan Monthly (bypass subscription), Field Imaging Services (bypass service fees), Enterprise Sandbox Plans (bypass checkout, direct activation), and Sandbox Activation (bypass SYNTH token fees). All paywall checks now use `getAuthenticatedUserWithRole()` to automatically exempt creators and operators while maintaining full functionality for testing purposes.

- **v2.21** (January 2025): Seeds and Edges Module & Broadcast Error Handling - Added Module 14 to onboarding covering "Syntheverse Minimum Viable Product: Seeds and Edges" with comprehensive content on the minimum viable generative set (9 seeds and 7 edge classes). Added Seeds and Edges section to FractiAI landing page with overview, seed/edge catalogs, and links to Module 14. Moved Quick Actions Panel from fixed right-side panel to horizontal bar across top of all dashboards. Integrated System Status indicators into top Quick Actions bar. Fixed 500 errors on `/api/broadcasts/all` endpoint with graceful table existence handling. Improved error handling in SystemBroadcastCenter component to prevent UI hanging on 403 errors. All broadcast API calls now properly handle errors with user-friendly messages.

- **v2.20** (January 2025): Contributor Dashboard Cockpit Resonance & Quick Actions Positioning - Enhanced contributor dashboard with full cockpit design resonance matching creator and operator dashboards. Added CockpitHeader, Contributor Cockpit title panel with "Proof-of-Contribution Station" branding, enhanced system status indicators including SynthScan™, Quick Operations panel in left sidebar, and Genesis Status panel in right sidebar. Improved Quick Actions Panel positioning to fixed upper-right corner on all dashboards with responsive design that adapts to screen size and header presence. Enhanced Command Zone and Protocol Info panels with better typography hierarchy and formatting. All panels now use consistent cockpit styling with heavy keylines, proper spacing, and hydrogen-amber accents for strong visual resonance.

- **v2.19** (January 2025): Chat Migration Fix & Status Indicators Improvements - Fixed chat migration SQL to be fully idempotent by adding missing DROP POLICY statement for "Users can leave rooms" policy. Improved StatusIndicators component with proper SSR handling and client-side mounting checks to prevent hydration errors. Enhanced header layout with better responsive design for status indicators. All chat tables and policies now properly support safe re-running of migrations without errors.

- **v2.18** (January 2025): Dashboard Layout Optimization & Status Indicators - Reorganized dashboard structure to prioritize Core Instrument Panel (ReactorCore) at the very top of all dashboards, followed by Quick Actions section. Added "Check out our Syntheverse Genesis on Base Mainnet" button to Quick Actions on all dashboards (contributor, creator, operator). Made status indicators visible on all screen sizes (removed mobile hiding) so system status is always accessible. Improved dashboard hierarchy: Header (with always-visible status indicators) → Core Instrument Panel → Quick Actions (including Genesis button) → Navigation Modules → Content. All dashboards now have consistent layout and structure.

- **v2.17** (January 2025): Syntheverse Component Status Indicators - Enhanced status indicators in header to show comprehensive system status. Added green indicator lights for all Syntheverse components (Syntheverse Protocol, Whole Brain AI, SynthScan MRI, PoC Sandbox, ERC-20 Base Mainnet, Awareness Bridge Router) with real-time online status. Added current sandbox indicator showing active sandbox with deployment status (green if deployed, gray if not). Status indicators appear on all dashboards (contributor, creator, operator) via CockpitHeader component. Indicators update dynamically when sandbox selection changes, reading from localStorage for persistence. Responsive design shows labels on large screens and tooltips on smaller screens. All components show as green (online) with pulsing animation for deployed systems.

- **v2.16** (January 2025): Dashboard Layout Optimization & Quick Actions - Reorganized dashboard structure for improved navigation and accessibility. Added dedicated Quick Actions panel at the top of all dashboards (contributor, creator, operator) with quick access buttons for FractiAI, Onboarding Navigator, Submit Contribution, Blog, and role-specific dashboards. Moved Core Instrument Panel (ReactorCore) to prominent position after Quick Actions, displaying SYNTH90T ERC-20 MOTHERLODE BLOCKMINE with available SYNTH tokens, epoch breakdown, and system status. Standardized navigation modules (Sandbox Navigator, PoC Archive, SynthChat Navigator) in consistent table-based format across all dashboards. Improved dashboard hierarchy: Quick Actions → Core Instrument Panel → Navigation Modules → Content.

- **v2.15** (January 2025): SYNTH Token-Based Enterprise Pricing & Creator Dashboard Integration - Reframed enterprise and creator sandbox pricing from Stripe subscriptions to blockchain-native SYNTH token economy. Sandboxes are now free to create and test, with SYNTH token charges functioning as "rent" (based on reach/unique contributors) and "energy" (based on activity/operations). Added comprehensive SYNTH balance tracking, activation system, usage metrics, and pricing calculations. Created CreatorEnterpriseSandboxes component for creator dashboard, allowing creators and enterprises to manage their own sandboxes. Updated database schema with SYNTH balance, activation status, transactions, and metrics tracking. Implemented usage-based billing with transparent rent and energy charges. **Database migration applied to production** - SYNTH pricing schema deployed. Transformed enterprise dashboard into intuitive setup/configuration page with step-by-step guidance and cockpit styling. See [`docs/ENTERPRISE_SYNTH_PRICING_MODEL.md`](docs/ENTERPRISE_SYNTH_PRICING_MODEL.md) for complete details.

- **v2.14** (January 2025): Activity Analytics & User Management Enhancements - Fixed activity analytics API SQL queries to use proper string table/column names instead of Drizzle objects, resolving 500 errors in Creator Dashboard. Added user filter toggle in Creator Dashboard to view "All Users" or "Operators Only" with dynamic API filtering. Enhanced constants and equations extraction to capture from both public and enterprise contributions, storing archive data during evaluation. Made CI/CD prettier format check non-blocking to prevent git exit code 128 errors. Confirmed operators and creators bypass payment firewall for testing submissions. Added optional SQL verification and optimization scripts for activity analytics performance.
- **v2.13** (January 2025): Creator Integration & Mobile UI Refinement - Integrated worldbuilder creators into enterprise package with infinite HHF-AI materials and substrates messaging. Updated enterprise offering to position as "Worldbuilding Creator & Enterprise Application" serving both creators and enterprises. Enhanced mobile UI for crisp, beautiful desktop-quality display with proper typography hierarchy, proportional spacing, and maintained visual polish. Updated onboarding and enterprise dashboard messaging to include creator benefits. Improved CI/CD git configuration for prettier format checks.
- **v2.12** (January 2025): Seed Submission Recognition & Multiplier - Implemented seed submission detection and reward system based on Seed Information Theory. Seed submissions (first submission to a sandbox) receive a 15% score multiplier (×1.15) recognizing their disproportionately high Generative Value Density (GVD). System prompt updated with seed detection instructions, evaluation query explicitly flags seed submissions, and score trace includes seed multiplier information. Added Module 13 onboarding covering Seed Information as a Fundamental Class with Holographic Hydrogen Fractals as high-value generative seeds. See Seed Information Theory paper for empirical validation of seed information's generative capacity (8.7–14.2× greater reachable configuration spaces than non-seed encodings).
- **v2.11** (January 2025): Scoring Formula Fix & Transparency Improvements - Fixed critical scoring formula violation to match published formula `Final = (Composite × (1 - penalty%/100)) × bonus_multiplier`. Added comprehensive score trace block showing all intermediate values (composite, overlap, penalty computed/applied, bonus computed/applied, final score). Added Beta/Mode banners to submission form and scoring page clarifying current text-only mode (4k chars) vs planned PDF pipeline, and fee structure by mode. Added sweet spot clarification documenting 14.2% is tuned for "edge novelty" vs "ecosystem synthesis". See [`MAREK_FEEDBACK_G_M_IMPLEMENTATION.md`](MAREK_FEEDBACK_G_M_IMPLEMENTATION.md) for details.
- **v2.11** (January 2025): SynthChat File Uploads - Added image and PDF upload support to SynthChat. Users can upload images (max 10MB) and PDFs (max 20MB) directly in chat messages. Files are stored in Supabase Storage (chat-images and chat-files buckets), displayed inline for images and as download links for PDFs. Upload preview allows users to see files before sending and remove them if needed. Files are embedded as markdown in messages for compatibility.
- **v2.10** (January 2025): SynthScan Prompt Transformation - Hardened system prompt with deterministic scoring contract, versioned config IDs, sandbox context tracking, mandatory PoD composition breakdown, fixed redundancy reporting (one source of truth), exposed sweet spot parameters, archive similarity distribution with percentile and neighbor statistics, fixed Module 12 documentation mismatch, and testing protocol for scientific validation. See [`SYNTHSCAN_PROMPT_TRANSFORMATION.md`](SYNTHSCAN_PROMPT_TRANSFORMATION.md) for details.
- **v2.9** (January 2025): Simplified Sales Tracking & Sandbox Selector - Simplified SalesTracking component to show only essential metrics (Total Revenue, This Month, Last Month) with expandable details section. Added SandboxSelector component to dashboard with Syntheverse as default and enterprise sandboxes nested within. Sales tracking restricted to creator/operator dashboard only. Sandbox selector includes search and filter by subscription tier capabilities.
- **v2.8** (January 2025): SynthChat WhatsApp-Style Interface - Redesigned SynthChat with WhatsApp-style mobile interface featuring two-panel layout (sandbox list + chat view), connect/disconnect functionality, chat navigator with filtering (All/Connected/Available), embedded mode in Creator Dashboard, message bubbles with timestamps, last message preview, and participant tracking. Database schema includes chat_rooms, chat_messages, and chat_participants tables with Row Level Security policies.
- **v2.7** (January 2025): Sales Tracking & Activity Stats - Added comprehensive sales tracking dashboard with revenue, subscription, payment, and customer analytics. Added activity stats dashboard tracking page activity, new users, submissions, chat sessions, and problems reported. Both dashboards are accessible to operators and creators with auto-refresh capabilities. Sales tracking integrates with Stripe API and database records for real-time analytics.
- **v2.6** (January 2025): Creator Dashboard - Creator-controlled destructive operations for PoC archive management and user administration. Includes PoC archive reset (hard mode), user deletion (hard mode), operator role management, and complete audit logging. Creator-only access (info@fractiai.com) with server-side permission enforcement and safeguards.
- **v2.5** (January 2025): Enterprise Frontier Sandbox Dashboard - Complete enterprise sandbox system with tiered pricing, contribution management, analytics, and tokenized rewards. Featured on FractiAI page with "Get" buttons and integrated into onboarding flow. Narrative emphasizes customized HHF-AI sandbox ecosystem nested within Syntheverse, broadcast to contributor channels, with transparent scoring and SYNTH90T ERC-20 MOTHERLODE VAULT alignment.
- **v2.4** (January 2025): Scalability improvements - vectors-only redundancy, 4000 char submission limit, automatic truncation
- **v2.3** (January 2025): Genesis transaction info, mobile navigation, repository organization
- **v2.2** (January 2025): Operator broadcast banner, status indicators, complete test suite (60/60 passing)
- **v2.1** (January 2025): Environment variable fixes, ownership verification, enhanced error handling
- **v2.0** (January 2025): Base Mainnet migration complete, production ready
