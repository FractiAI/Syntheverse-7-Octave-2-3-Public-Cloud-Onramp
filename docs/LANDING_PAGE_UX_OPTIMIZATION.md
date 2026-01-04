# Syntheverse PoC Landing Page Optimization
## Conversion-Focused UX/Product Design Strategy

**Date**: January 2025  
**Objective**: Maximize conversion, comprehension, and engagement for frontier contributors while maintaining scientific credibility  
**Target Personas**: Independent researchers, developers, alignment contributors

---

## Executive Summary

**Current Problem**: Complex concepts (fractal, holographic hydrogen, PoC, SYNTH, MOTHERLODE VAULT) create cognitive overload. Dense narrative-first approach buries actionable paths. No clear contributor journey.

**Solution**: Progressive disclosure architecture with three cognitive layers:
1. **Instant clarity** (3-second scan): What it is, why it matters, what to do
2. **Technical credibility** (30-second scan): Evidence, validation, system architecture
3. **Deep exploration** (3+ minutes): Full narrative, papers, proof library

**Key Metrics to Track**:
- Time to first CTA click
- Scroll depth at section breaks
- Secondary CTA engagement (onboarding, examples, papers)
- Mobile vs desktop conversion delta

---

## 1. Optimized Section Structure & Copy

### Hero (Above the Fold) - Viewport 1

**Visual Hierarchy**: Large, centered, maximum 40% of viewport height

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        [Logo/Symbol]  SYNTHEVERSE                  │
│                                                     │
│     Proof-of-Contribution for Frontier Research   │
│                                                     │
│  Turn research into verifiable on-chain records   │
│       No gatekeeping. Measured by coherence.      │
│                                                     │
│    [Primary CTA: Submit Your PoC]  [Secondary]    │
│              [Scroll indicator ↓]                  │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**H1** (48-64px):  
`Syntheverse: Proof-of-Contribution for Frontier Research`

**Subheadline** (20-24px, muted):  
`Turn research into verifiable on-chain records — no gatekeeping, measured by coherence`

**Supporting line** (16-18px):  
`An evaluation system that scores novelty, density, coherence, and alignment — then anchors proofs on Base`

**CTAs**:
- **Primary**: `Submit Your PoC` → `/signup` (then `/submit`)
- **Secondary**: `See How It Works` → scroll to #how-it-works
- **Tertiary**: `View Examples` → scroll to #proof-papers

**Visual Elements**:
- Subtle fractal background animation (slow morph, 60s cycle, low opacity ~0.08)
- Sticky CTA bar on scroll (mobile-first)
- Trust indicators: "Base Mainnet LIVE" • "90T SYNTH" • "Beta Active"

**Mobile Optimizations**:
- Stack CTAs vertically
- Reduce headline to 32px
- Single primary CTA above fold

---

### Section 2: What Syntheverse Is (Viewport 2)

**Purpose**: 60-second comprehension for newcomers. No jargon until concepts are defined.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: OVERVIEW]                               │
│                                                     │
│  What is Syntheverse?                              │
│                                                     │
│  A system that evaluates, archives, and anchors    │
│  scientific contributions — replacing peer review  │
│  gatekeeping with measurable coherence.            │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Submit PoC       │  │ Get Evaluation   │       │
│  │ Abstract+equations│  │ Novelty/density  │       │
│  └──────────────────┘  └──────────────────┘       │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Archive & Map    │  │ Register On-Chain│       │
│  │ Vector-searchable│  │ Base (optional)  │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  [CTA: Submit a PoC]                               │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `OVERVIEW`  
**H2**: `What is Syntheverse?`

**One-sentence definition**:  
`A system that evaluates, archives, and anchors scientific contributions — replacing peer review gatekeeping with measurable coherence.`

**4-Block Explainer** (icon + title + 1-line):

1. **Submit PoC**  
   Icon: 📄  
   `Submit an abstract + equations + constants (4000 chars max)`

2. **Get Evaluation**  
   Icon: 🔬  
   `Receive scores for novelty, density, coherence, alignment + redundancy analysis`

3. **Archive & Map**  
   Icon: 🗺️  
   `Your work becomes vector-searchable and comparable in the sandbox`

4. **Register On-Chain** *(optional)*  
   Icon: ⛓️  
   `Anchor proof on Base Mainnet for permanence (free after qualification)`

**CTA**: `Submit Your PoC` → `/signup`

**Progressive Disclosure**: 
- Expandable "What's a PoC?" tooltip (inline, tap/hover)
- Expandable "What gets evaluated?" drawer

**Visual**: Use cards with subtle borders, 16px padding, 8px gap. Icons left-aligned, monochrome.

---

### Section 3: Why It Matters Now

**Purpose**: Problem → Consequence → Solution (30 seconds)

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: THE PROBLEM]                            │
│                                                     │
│  Why Syntheverse Exists                            │
│                                                     │
│  ┌─────────────────┐ ┌─────────────────┐          │
│  │ ❌ Problem      │ │ ⚠️ Consequence  │          │
│  │ Frontier work   │ │ Good work gets  │          │
│  │ lacks neutral   │ │ ignored; bad    │          │
│  │ evaluation      │ │ work wastes     │          │
│  │                 │ │ cycles          │          │
│  └─────────────────┘ └─────────────────┘          │
│                                                     │
│  ┌─────────────────────────────────────┐           │
│  │ ✅ Solution                          │           │
│  │ SynthScan scores + redundancy        │           │
│  │ detection + verifiable record        │           │
│  └─────────────────────────────────────┘           │
│                                                     │
│  [CTA: See Scoring Criteria] (modal)               │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `THE PROBLEM`  
**H2**: `Why Syntheverse Exists`

**3-Column Layout**:

**Column 1 - Problem** (red tint):  
Icon: ❌  
Title: `The Problem`  
Text: `Frontier research lacks fast, neutral evaluation and provenance. Institutional gatekeeping delays or blocks non-mainstream work.`

**Column 2 - Consequence** (amber tint):  
Icon: ⚠️  
Title: `The Cost`  
Text: `Good work gets ignored. Redundant work wastes cycles. Independent researchers have no verification path.`

**Column 3 - Solution** (green tint, full-width):  
Icon: ✅  
Title: `The Solution`  
Text: `SynthScan™ MRI scores contributions objectively (novelty, density, coherence, alignment). Redundancy detection prevents overlap. On-chain anchoring provides permanent provenance.`

**CTA**: `See Scoring Criteria` → Opens modal with 4-dimension breakdown + example scores

**Visual**: Use subtle background tints (red/amber/green at ~0.05 opacity). Borders 2px on solution box.

---

### Section 4: How It Works (5-Step Visual Timeline)

**Purpose**: Clear contributor journey (45 seconds)

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: YOUR JOURNEY]                           │
│                                                     │
│  How It Works                                      │
│                                                     │
│  ①────→②────→③────→④────→⑤                        │
│  Prepare  Submit  Evaluate  Iterate  Register      │
│                                                     │
│  [Each step expands on click/tap]                  │
│                                                     │
│  Currently viewing: Step 1                         │
│  ┌───────────────────────────────────────┐        │
│  │ ① Prepare Your PoC                    │        │
│  │                                        │        │
│  │ • Extract abstract (key findings)     │        │
│  │ • Include equations (if applicable)   │        │
│  │ • Add constants/parameters            │        │
│  │ • Max 4000 characters                 │        │
│  │                                        │        │
│  │ [CTA: See Example PoC]                │        │
│  └───────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `YOUR JOURNEY`  
**H2**: `How It Works: 5 Steps`

**Step 1 - Prepare** *(Default expanded)*:  
`Extract your abstract, equations, and constants. Max 4000 characters (about 1 page).`  
**CTA**: `See Example PoC` → Opens example in modal

**Step 2 - Submit**:  
`Create account, pay $500 evaluation fee (below journal costs), submit your PoC.`  
**CTA**: `Start Submission` → `/signup`

**Step 3 - Evaluate**:  
`SynthScan™ MRI scores your work in ~10 minutes. Receive novelty, density, coherence, alignment scores + redundancy analysis.`  
**CTA**: `See Example Evaluation` → Opens sample report

**Step 4 - Iterate**:  
`Review redundancy feedback. Refine your work to reduce overlap and improve scores. Resubmit if needed.`  
**CTA**: `Learn About Scoring` → `/onboarding`

**Step 5 - Register** *(optional)*:  
`Qualifying PoCs (score threshold + operator approval) can be registered on Base Mainnet for permanent proof. Free after qualification.`  
**CTA**: `Check Eligibility` → Calculator/checker tool

**Visual**:
- Horizontal timeline on desktop, vertical accordion on mobile
- Active step highlighted with accent color
- Progress indicator: "You are here" pointer
- Each step click expands detail panel below timeline

---

### Section 5: Technical Signals (Credibility Layer)

**Purpose**: Show validation without overwhelming newcomers (clustered, expandable)

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: VALIDATION]                             │
│                                                     │
│  What Powers Syntheverse                           │
│                                                     │
│  ┌────────────────┐ ┌────────────────┐            │
│  │ Physics/HHF    │ │ Bio/Fractal    │            │
│  │ Hydrogen holo- │ │ Fractal struct-│            │
│  │ graphic lens   │ │ ure as signal  │            │
│  │ [Expand ↓]     │ │ [Expand ↓]     │            │
│  └────────────────┘ └────────────────┘            │
│                                                     │
│  ┌────────────────────────────────────┐            │
│  │ Materials/Systems                  │            │
│  │ Cross-domain constants as          │            │
│  │ contribution fingerprint           │            │
│  │ [Expand ↓]                         │            │
│  └────────────────────────────────────┘            │
│                                                     │
│  [CTA: Read Short Paper] (2-3 min)                 │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `VALIDATION`  
**H2**: `What Powers Syntheverse`

**Intro**: `Built on holographic hydrogen framing (HHF) — a measurement lens that detects coherence patterns across domains.`

**3 Cluster Cards** (collapsed by default):

**Card 1 - Physics / HHF**:  
**Label**: `Physics & Holographic Hydrogen`  
**One-liner**: `Uses hydrogen holographic framing as a coherence lens — detects measurable patterns conceptually and empirically.`  
**Expand reveals**:
- CERN data analysis (ALICE): 5.8σ event-type bifurcation
- Fractal dimension measurements (2.73 ± 0.11)
- Multi-detector cross-validation
- **Link**: "View validation report" → PDF/page

**Card 2 - Biology / Fractal**:  
**Label**: `Biological & Fractal Structure`  
**One-liner**: `Fractal self-similarity as a compression signal — organizational patterns that repeat across scales.`  
**Expand reveals**:
- Biological proxy validation (PFD 1.024, HFD 0.871)
- Genome-as-conditions model (not instructions)
- Cross-scale pattern detection
- **Link**: "View biological validation" → GitHub repo

**Card 3 - Materials / Systems**:  
**Label**: `Materials & Cross-Domain Systems`  
**One-liner**: `Universal constants and equation structure as contribution fingerprints — detecting alignment across fields.`  
**Expand reveals**:
- Isotopologue scaling (deviation < 2.4%)
- Molecular/photonic validation (error < 10⁻⁶)
- PEFF seismic/EEG coherence
- **Link**: "View materials validation" → GitHub repo

**CTA**: `Read the Short Paper` (2-3 min) → `/docs/syntheverse-brief.pdf`

**Visual**: Use `<details>` HTML elements for native expand/collapse. Add "+" icon that rotates to "×" on expand.

---

### Section 6: SYNTH Token & Sandbox (Risk Framing Central)

**Purpose**: Centralize all token/risk/legal info in one scannable block

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: TOKEN & SANDBOX]                        │
│                                                     │
│  SYNTH Token & Sandbox Rules                       │
│                                                     │
│  ⚠️ Read this section carefully ⚠️                 │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ SYNTH Token      │  │ Sandbox Rules    │       │
│  │ • 90T supply     │  │ • What's a PoC   │       │
│  │ • Base Mainnet   │  │ • What's scored  │       │
│  │ • Non-financial  │  │ • What's stored  │       │
│  │ • No promises    │  │ • Eligibility    │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  [CTA: Read Full Rules] (modal)                    │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `TOKEN & SANDBOX`  
**H2**: `SYNTH Token & Sandbox Rules`

**Warning banner** (amber background):  
`⚠️ Read this section carefully before submitting. SYNTH is not an investment.`

**2-Column Layout**:

**Column 1 - SYNTH Token**:

**Title**: `What is SYNTH?`

**Bullets**:
- **Supply**: Fixed 90 trillion ERC-20 tokens
- **Chain**: Base Mainnet (Chain ID: 8453)
- **Purpose**: Coordination primitive for allocation accounting
- **Not**: An investment, security, or profit promise
- **No**: Market listing, trading, or external exchange planned

**Risk statement** (red text):  
`SYNTH has no guaranteed value. Participation is voluntary and carries no expectation of profit.`

**Column 2 - Sandbox Rules**:

**Title**: `How the Sandbox Works`

**Bullets**:
- **PoC Definition**: Abstract (findings) + equations (if any) + constants/parameters
- **Evaluation Criteria**: Novelty, density, coherence, alignment (4 dimensions)
- **What's Stored**: Vector embeddings, metadata, scores (NOT full text)
- **Eligibility**: Score threshold + low redundancy + operator approval
- **Your Rights**: You retain all rights to your work; you grant evaluation/archival permission only

**CTA**: `Read Full Sandbox Rules` → Opens modal with complete terms

**Visual**: 
- Amber border on warning banner (3px, `border-warning`)
- Use monospace font for token supply ("90,000,000,000,000")
- Red asterisk on "No promises" line

---

### Section 7: MOTHERLODE VAULT (High-Contrast Feature Block)

**Purpose**: Drive conversion for vault opening deadline

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Dark bg, amber accents, subtle glow]             │
│                                                     │
│  🏛️ SYNTH90T MOTHERLODE VAULT                     │
│  Opens Spring Equinox: March 20, 2026             │
│                                                     │
│  What: Allocation mechanism for qualifying PoCs    │
│  Deadline: March 19, 2026 (submit by this date)   │
│  How: Score-based allocation (see eligibility)     │
│                                                     │
│  ┌─────────────────────────────────────┐          │
│  │ Eligibility Checklist:              │          │
│  │ ✓ PoC score above threshold         │          │
│  │ ✓ Redundancy below limit            │          │
│  │ ✓ Operator approval                 │          │
│  │ ✗ No guaranteed allocation          │          │
│  └─────────────────────────────────────┘          │
│                                                     │
│  [CTA: Check Eligibility] [CTA: Submit Now]       │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `VAULT OPENING`  
**Icon + H2**: `🏛️ SYNTH90T MOTHERLODE VAULT`

**Hero statement**:  
`Opens Spring Equinox: March 20, 2026`

**Subhead**:  
`All qualifying PoCs submitted by March 19, 2026 will be registered on-chain and allocated SYNTH by score.`

**3-Line Explainer**:
- **What**: Allocation mechanism for the fixed-supply 90T SYNTH system
- **Deadline**: Submit your best work by **March 19, 2026**
- **How**: Score-based allocation after operator review (no promises)

**Eligibility Checklist** (4 items):
- ✓ PoC score above threshold (varies by epoch)
- ✓ Redundancy percentage below limit
- ✓ Operator approval (discretionary)
- ✗ **No guaranteed allocation or value**

**Risk disclosure** (small text):  
`Submitting a PoC does not guarantee SYNTH allocation, value, or profit. Operator reserves full discretion.`

**CTAs**:
- **Primary**: `Submit Your PoC Now` → `/signup`
- **Secondary**: `Check Eligibility` → Calculator tool
- **Tertiary**: `Read Vault FAQ` → Modal

**Visual**:
- Dark background (almost black: `#0a0a0a`)
- Amber/gold accent color for borders and text highlights
- Subtle box-shadow glow: `0 0 24px rgba(255,184,77,0.3)`
- Use vault/temple icon (🏛️ or custom SVG)
- Animated countdown timer (days until March 19, 2026)

---

### Section 8: Proof & Papers (Social Proof + Archive)

**Purpose**: Build credibility with examples and validation

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: PROOF LIBRARY]                          │
│                                                     │
│  Validated Work & Papers                           │
│                                                     │
│  [Tab: Examples] [Tab: Papers] [Tab: On-Chain]    │
│                                                     │
│  Currently viewing: Examples                        │
│                                                     │
│  ┌──────────────────┐ ┌──────────────────┐        │
│  │ Example PoC #1   │ │ Example PoC #2   │        │
│  │ Title: ...       │ │ Title: ...       │        │
│  │ Score: 8,343     │ │ Score: 9,127     │        │
│  │ Novelty: 85%     │ │ Novelty: 92%     │        │
│  │ [View →]         │ │ [View →]         │        │
│  └──────────────────┘ └──────────────────┘        │
│                                                     │
│  [CTA: Browse Archive]                             │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `PROOF LIBRARY`  
**H2**: `Validated Work & Research Papers`

**3-Tab Layout**:

**Tab 1 - Examples** *(default active)*:  
Show 3-6 example PoC submissions in card grid:
- **Card format**:
  - Title (truncated to 60 chars)
  - 1-line abstract preview
  - Key metrics: Total score, novelty %, density %, coherence %
  - Badge: Metal tier (Gold/Silver/Copper if applicable)
  - CTA: `View Full Evaluation` → Detail page

**Tab 2 - Papers**:  
Show 3-4 key research papers/validation reports:
- **Card format**:
  - Paper title
  - Authors + date
  - 1-sentence takeaway
  - Link to PDF/external source
  - Badge: "Peer-reviewed" or "Validation report"

**Tab 3 - On-Chain Proofs**:  
Show registered PoCs on Base:
- **Card format**:
  - PoC hash (truncated)
  - Registration date
  - Base Mainnet transaction link
  - Badge: "Registered on-chain"

**CTA**: `Browse Full Archive` → `/dashboard` (public archive view)

**Visual**: 
- Use horizontal tab bar (underline active tab)
- Cards: white background, 1px border, 16px padding, 8px gap
- Monospace font for hashes and scores
- Hover effect: subtle lift (2px translate + shadow)

---

### Section 9: How to Engage Now (Persona-Driven Journeys)

**Purpose**: Direct visitors to role-specific paths

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  [Eyebrow: GET STARTED]                            │
│                                                     │
│  How to Engage: Choose Your Path                   │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Researcher │ │ Developer  │ │ Alignment  │    │
│  │            │ │            │ │ Contributor│    │
│  │ 5 steps    │ │ 4 steps    │ │ 5 steps    │    │
│  │ [View →]   │ │ [View →]   │ │ [View →]   │    │
│  └────────────┘ └────────────┘ └────────────┘    │
│                                                     │
│  Currently viewing: Researcher Journey              │
│  ① Read 2-min explainer                            │
│  ② View example evaluation                         │
│  ③ Submit abstract + equations                     │
│  ④ Receive SynthScan score                         │
│  ⑤ Iterate with feedback                           │
│                                                     │
│  [CTA: Start as Researcher]                        │
└─────────────────────────────────────────────────────┘
```

**Copy**:

**Eyebrow**: `GET STARTED`  
**H2**: `How to Engage: Choose Your Path`

**3-Card Persona Layout**:

---

**Card 1 - Independent Researchers**:

**Icon**: 🔬  
**Title**: `For Researchers`

**Journey** (5 steps):
1. Read the 2-minute explainer
2. View example evaluation
3. Submit abstract + equations + constants
4. Receive SynthScan™ MRI score
5. Iterate with redundancy feedback

**CTA**: `Start as Researcher` → `/onboarding?track=researcher`

---

**Card 2 - Developers**:

**Icon**: 💻  
**Title**: `For Developers`

**Journey** (4 steps):
1. Read integration docs
2. Explore API endpoints
3. Build tool/visualization
4. Submit demo PoC

**CTA**: `View Developer Docs` → `/docs/api` (or GitHub)

---

**Card 3 - Alignment Contributors**:

**Icon**: 🧭  
**Title**: `For Alignment Work`

**Journey** (5 steps):
1. Read alignment track overview
2. View framework examples
3. Submit alignment PoC
4. Compare against archive (redundancy)
5. Collaborate on refinement

**CTA**: `Start Alignment Track` → `/onboarding?track=alignment`

---

**Visual**:
- 3-column card grid on desktop, stacked on mobile
- Icon at top-center of each card
- Numbered list inside each card
- Hover effect: card border accent color change
- Expandable detail drawer (click card to expand journey steps below)

---

## 2. Visual Block Layout & Hierarchy

### Grid System & Spacing

**Container**:
- Max width: `1200px`
- Padding: `48px` (desktop), `24px` (mobile)
- Section vertical gap: `96px` (desktop), `64px` (mobile)

**Typography Scale**:
- H1 (Hero): `56px` / `32px` (mobile)
- H2 (Section): `40px` / `28px` (mobile)
- H3 (Subsection): `28px` / `20px` (mobile)
- Body: `16px` / `14px` (mobile)
- Small/Meta: `14px` / `12px` (mobile)

**Color Palette**:
- **Primary (Accent)**: `#ffb84d` (hydrogen amber)
- **Background**: `#0a0a0a` (near-black)
- **Surface**: `#1a1a1a` (panel background)
- **Border**: `#2a2a2a` (keyline primary)
- **Text Primary**: `#f5f5f5`
- **Text Secondary**: `#a0a0a0`
- **Success**: `#22c55e` (green)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)

**Component Hierarchy** (visual weight order):
1. **Hero CTA** (largest, accent color, 3D depth)
2. **MOTHERLODE VAULT block** (glowing border, dark bg)
3. **Section H2s** (large, bold)
4. **Example cards / Proof cards** (white surface, elevated)
5. **Body text / Explainers** (muted, readable)
6. **Metadata / Fine print** (smallest, low opacity)

### Recommended Block Sizes

**Hero**: `100vh` (full viewport) with scroll indicator

**Section 2-4** (What/Why/How): `60-80vh` each, depending on content

**Section 5** (Technical): `40-60vh` (collapsed by default, can expand to 100vh)

**Section 6** (Token): `50vh` (critical info, must be scannable)

**Section 7** (MOTHERLODE): `80vh` (high conversion priority, large)

**Section 8** (Proof): `60vh` (tabbed, scrollable within)

**Section 9** (Engage): `60vh` (persona cards expandable)

---

## 3. Plain-Language Glossary (Inline Tooltips)

**Implementation**: Use `<abbr>` HTML element or custom tooltip component. Trigger on hover (desktop) and tap (mobile). Pin mode available ("keep this open").

**Terms to define inline**:

| Term | Plain-Language Explanation |
|------|----------------------------|
| **Proof-of-Contribution (PoC)** | A compact submission: abstract + equations + constants—enough to evaluate originality and structure. |
| **Fractal** | A pattern that repeats at different scales. Used as a signal for organization and compressibility. |
| **Holographic Hydrogen (HHF)** | A measurement lens using hydrogen resonance as a metaphor and method for detecting coherence. |
| **SynthScan™ MRI** | An evaluation system that scores contribution quality (novelty, density, coherence, alignment) and overlap. |
| **Coherence** | How well ideas connect internally—like signal-to-noise for logic. |
| **Novelty** | How new the contribution is compared to what already exists. |
| **Density** | How much valuable information is packed into the work. |
| **Alignment** | How well the work fits the Syntheverse sandbox principles. |
| **Redundancy** | Overlap with existing archived contributions (measured via vectors). |
| **SYNTH Token** | A coordination primitive for allocation accounting—on Base—explicitly not a profit promise. |
| **MOTHERLODE VAULT** | The allocation mechanism tied to qualifying contributions (opens March 20, 2026). |
| **Base Mainnet** | An Ethereum Layer 2 blockchain (Coinbase) where proofs are anchored. |
| **Vector / Embedding** | A numerical representation of your work that allows similarity comparison. |

**Design**:
- Dotted underline on glossary terms
- Tooltip appears above term (desktop) or below (mobile)
- Max width: `300px`
- Close button: "×" or tap outside
- "Pin" icon to keep open while reading

---

## 4. Contributor Journeys & CTAs

### Researcher Journey (Primary Persona)

**Step 1: Discovery (Landing Page)**  
Entry point: Google search, GitHub, Twitter, Zenodo  
Goal: Understand what Syntheverse is in <60 seconds  
**CTA**: `See How It Works` (scroll to Section 4)

**Step 2: Comprehension (Scroll to Section 4)**  
Review 5-step process  
**CTA**: `See Example PoC` (modal with sample abstract + evaluation)

**Step 3: Credibility Check (Scroll to Section 5 & 8)**  
Expand technical signals, view validated work  
**CTA**: `Read Short Paper` → PDF opens

**Step 4: Decision (Scroll to Section 7 - MOTHERLODE)**  
See deadline, check eligibility  
**CTA**: `Submit Your PoC Now` → `/signup`

**Step 5: Onboarding (After Signup)**  
Complete profile, learn scoring criteria  
**CTA**: `Start Onboarding` → `/onboarding`

**Step 6: Submission (Dashboard)**  
Paste abstract + equations, submit  
**CTA**: `Submit Contribution` → `/submit`

**Step 7: Evaluation (Wait ~10 min)**  
Receive scores via email + dashboard  
**CTA**: `View Evaluation` → `/dashboard`

**Step 8: Iteration (Dashboard)**  
Review redundancy, refine work, resubmit  
**CTA**: `Refine & Resubmit` → `/submit`

**Step 9: Registration (Optional)**  
If qualified, register on Base  
**CTA**: `Register On-Chain` → Wallet connect flow

---

### Developer Journey

**Step 1: Discovery**  
Entry point: GitHub, Hacker News  
Goal: Understand the API/integration potential  
**CTA**: `View Developer Docs` → GitHub or `/docs/api`

**Step 2: Exploration**  
Clone repo, read API docs  
**CTA**: `Try API Sandbox` → Codesandbox or Postman collection

**Step 3: Build**  
Create visualization, tool, or plugin  
**CTA**: `Submit Demo PoC` → `/submit`

**Step 4: Collaborate**  
Open PR to main repo  
**CTA**: `Contribute Code` → GitHub PR

---

### Alignment Contributor Journey

**Step 1: Discovery**  
Entry point: Alignment forums, LessWrong, EA community  
Goal: Understand alignment track  
**CTA**: `Read Alignment Overview` → `/docs/alignment`

**Step 2: Review Examples**  
See existing alignment PoCs  
**CTA**: `Browse Alignment Archive` → `/archive?category=alignment`

**Step 3: Submit Framework**  
Submit alignment framework PoC  
**CTA**: `Submit Alignment Work` → `/submit?category=alignment`

**Step 4: Collaborate**  
Engage with other alignment contributors  
**CTA**: `Join Discussion` → Discord/Forum link

---

### CTA Hierarchy (Priority Order)

**Primary CTAs** (accent color, large, sticky on scroll):
1. `Submit Your PoC` (Hero + Section 2 + Section 7)
2. `See How It Works` (Hero)
3. `Check Eligibility` (Section 7 - MOTHERLODE)

**Secondary CTAs** (outline style, medium):
1. `View Examples` (Hero + Section 8)
2. `Read Short Paper` (Section 5)
3. `Browse Archive` (Section 8)
4. `Start Onboarding` (Section 9)

**Tertiary CTAs** (text link, small):
1. `Learn About Scoring` (tooltips, modals)
2. `View Developer Docs` (Section 9)
3. `Read Vault FAQ` (Section 7)
4. `See Scoring Criteria` (Section 3)

---

## 5. UI/UX Improvements

### Readability

**Typography**:
- Use system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`
- Line height: `1.7` for body text
- Letter spacing: `-0.02em` for headlines
- Max line length: `70ch` (characters) for body text

**Contrast**:
- Text on background: minimum 7:1 ratio (AAA standard)
- Use `#f5f5f5` (near-white) on `#0a0a0a` (near-black)
- Muted text: `#a0a0a0` (4.5:1 ratio minimum)

**Whitespace**:
- Section padding: `96px` vertical (desktop), `64px` (mobile)
- Card padding: `24px` internal
- Paragraph spacing: `16px` between paragraphs
- List item spacing: `8px` between items

**Scannability**:
- Use bullet lists instead of paragraphs where possible
- Eyebrow labels (small caps, `12px`, `#a0a0a0`) above every section
- Bold keywords in body text
- Break long sections into numbered steps or tabbed content

---

### Engagement & Retention

**Progressive Disclosure**:
- Default: Show 3-5 bullets + "Expand for more"
- Expanded: Show full content + references
- Use `<details>` HTML element for semantic collapse/expand

**Micro-Interactions**:
- CTA hover: 2px lift + shadow
- Card hover: border color change (subtle)
- Tab switch: underline slide animation (200ms ease)
- Scroll indicator: bounce animation (2s loop)

**Loading States**:
- Skeleton screens for data-heavy sections (e.g., archive)
- Spinner for CTA clicks (prevent double-submit)
- Progress bar for multi-step onboarding

**Empty States**:
- If archive is empty: "No PoCs yet. Be the first to submit."
- If user has no submissions: "Ready to contribute? Submit your first PoC."

**Error States**:
- Form validation: Inline error messages (red, below field)
- API errors: Toast notification (top-right, auto-dismiss 5s)
- Retry button for failed loads

---

### Mobile Optimizations

**Navigation**:
- Sticky header with hamburger menu (collapse sections)
- Floating CTA button (bottom-right, `Submit PoC`)
- Breadcrumb trail (show current section in header)

**Touch Targets**:
- Minimum 44×44px for all interactive elements
- Increase spacing between CTAs on mobile (16px gap)

**Content Reflow**:
- Stack cards vertically on mobile (<768px)
- Collapse multi-column layouts to single column
- Reduce font sizes (see typography scale above)
- Hide secondary CTAs on mobile (show only primary)

**Performance**:
- Lazy-load images below the fold
- Defer non-critical JS (animations, analytics)
- Use `srcset` for responsive images
- Compress all images (WebP format, <100KB each)

---

### Accessibility (WCAG 2.1 AA Minimum)

**Keyboard Navigation**:
- All interactive elements focusable via Tab
- Focus indicator: 3px accent-color outline
- Skip-to-content link (visible on Tab focus)

**Screen Readers**:
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- `aria-label` on icon-only buttons
- `alt` text on all images (descriptive, <125 chars)
- `aria-expanded` on expandable sections

**Motion**:
- Respect `prefers-reduced-motion` media query
- Disable animations if user prefers reduced motion
- Provide pause button for auto-playing content (countdown timer)

---

## 6. Animations & Micro-Interactions

### Hero Background Animation

**Concept**: Slow-morphing fractal field (reinforces fractal theme)

**Implementation**:
- SVG or Canvas-based
- 60-second loop
- Low opacity: `0.08` (barely visible, atmospheric)
- Greyscale palette
- Pauses on scroll or interaction (performance)

**Fallback**: Static gradient background

---

### Scroll-Triggered Animations

**Fade-in-up** (sections enter from below):
- Trigger: Section enters viewport (IntersectionObserver)
- Animation: `opacity 0 → 1`, `translateY(20px → 0)`
- Duration: `600ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

**Counter animation** (MOTHERLODE countdown):
- Trigger: Section enters viewport
- Animation: Numbers count up from 0 to target
- Duration: `1200ms`
- Use `requestAnimationFrame` for smooth counting

**Progress bar** (How It Works timeline):
- Trigger: User scrolls through steps
- Animation: Bar fills left-to-right as steps complete
- Color: Accent color gradient

---

### CTA Micro-Interactions

**Primary button hover**:
- Scale: `1.0 → 1.02`
- Shadow: `0 2px 4px → 0 8px 16px` (accent color)
- Duration: `200ms`
- Cursor: `pointer`

**Primary button click**:
- Scale: `1.02 → 0.98` (momentary press)
- Duration: `100ms`
- Haptic feedback (if supported)

---

### Card Interactions

**Hover** (desktop):
- Border color: `#2a2a2a → accent color`
- Lift: `translateY(0 → -4px)`
- Shadow: `0 2px 8px → 0 8px 24px`
- Duration: `300ms`

**Tap** (mobile):
- Background: `#1a1a1a → #2a2a2a` (slightly lighter)
- Duration: `100ms`
- No lift on mobile (performance)

---

### Tooltip Animations

**Entry**:
- Opacity: `0 → 1`
- Scale: `0.9 → 1`
- Duration: `150ms`
- Easing: `ease-out`

**Exit**:
- Opacity: `1 → 0`
- Duration: `100ms`

---

### Modal Animations

**Backdrop**:
- Opacity: `0 → 0.8` (dark overlay)
- Duration: `200ms`

**Modal panel**:
- Scale: `0.95 → 1`
- Opacity: `0 → 1`
- Duration: `250ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

**Close**:
- Reverse of entry (200ms)

---

## 7. Performance & Technical Implementation

### Page Load Optimization

**Critical Rendering Path**:
1. Inline critical CSS (above-the-fold styles)
2. Defer non-critical CSS
3. Async load web fonts (with fallback)
4. Lazy-load images below fold

**Target Metrics**:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1

**Bundle Size**:
- HTML + Critical CSS: <14KB (1 TCP roundtrip)
- JS bundle (initial): <50KB gzipped
- Total page weight: <500KB (excluding videos)

---

### Component Architecture (React/Next.js)

**Recommended Structure**:
```
components/
├── landing/
│   ├── Hero.tsx
│   ├── SectionWhat.tsx
│   ├── SectionWhy.tsx
│   ├── SectionHow.tsx
│   ├── SectionTechnical.tsx
│   ├── SectionToken.tsx
│   ├── SectionMotherlode.tsx
│   ├── SectionProof.tsx
│   ├── SectionEngage.tsx
│   └── shared/
│       ├── SectionWrapper.tsx
│       ├── CTA.tsx
│       ├── Card.tsx
│       ├── Tooltip.tsx
│       ├── Modal.tsx
│       └── ExpandablePanel.tsx
```

**Prop Types**:
- Use TypeScript for all components
- Define interfaces for props
- Export component + props interface

**Accessibility Props**:
- `aria-label`, `aria-describedby`, `role` on all interactive elements

---

### Analytics Tracking

**Key Events to Track**:

**Engagement**:
- Hero CTA click (`cta_hero_submit`)
- Section scroll depth (25%, 50%, 75%, 100%)
- Tab switch (Proof & Papers)
- Expandable panel open (Technical Signals)

**Conversion**:
- Primary CTA click (`cta_submit_poc`)
- Secondary CTA click (`cta_see_how_it_works`, `cta_view_examples`)
- Modal open (`modal_scoring_criteria`, `modal_example_poc`)
- Tooltip hover (`tooltip_${term}`)

**Persona Selection**:
- Persona card click (`persona_researcher`, `persona_developer`, `persona_alignment`)

**Technical**:
- Page load time (custom metric)
- Error events (API failures, modal errors)

---

## 8. Testing & Iteration Plan

### A/B Test Variants

**Hero Headline** (3 variants):
1. **Variant A** (current): "Proof-of-Contribution for Frontier Research"
2. **Variant B** (action): "Turn Your Research into Verifiable On-Chain Proofs"
3. **Variant C** (benefit): "Get Your Work Evaluated, Archived, and Anchored — No Gatekeeping"

**Primary CTA Label** (3 variants):
1. **Variant A**: "Submit Your PoC"
2. **Variant B**: "Get Evaluated Now"
3. **Variant C**: "Start Contributing"

**MOTHERLODE Position** (2 variants):
1. **Variant A**: Section 7 (current)
2. **Variant B**: Section 2 (move up for urgency)

---

### User Testing Protocol

**Test 1: 5-Second Test**  
Show hero for 5 seconds, ask:
- "What is this website about?"
- "What would you do next?"
- Target: 80% correctly identify "research evaluation system"

**Test 2: First-Click Test**  
Where do users click first?
- Expected: Primary CTA or "See How It Works"
- Red flag: Clicking glossary terms or ignoring CTAs

**Test 3: Task Completion**  
Give task: "You're a researcher. How would you submit work?"
- Expected path: Hero → How It Works → Submit CTA
- Target: 90% completion rate

**Test 4: Comprehension Test**  
After reading landing page, ask:
- "What is Syntheverse in one sentence?"
- "What happens when you submit a PoC?"
- "Is SYNTH an investment?"
- Target: 85% correct answers

---

### Heatmap Analysis

**Tools**: Hotjar, Microsoft Clarity, or Crazy Egg

**Metrics to Track**:
- Scroll depth by section
- Click heatmap (where users click most)
- Rage clicks (repeated clicks on non-interactive elements)
- Dead zones (sections with no engagement)

**Red Flags**:
- <50% scroll past hero
- <10% CTA click rate
- High rage click rate on glossary terms (improve tooltips)

---

## 9. Content Variants (Scientific vs Builder Tone)

### Hero Headline Variants

**Scientific Tone**:
> **Syntheverse: A Proof-of-Contribution Protocol for Frontier Research**  
> _Evaluate, archive, and anchor scientific contributions using holographic hydrogen fractal coherence measurement — no institutional gatekeeping._

**Builder/Frontier Tone**:
> **Syntheverse: Turn Research into Verifiable On-Chain Proofs**  
> _Submit your work. Get scored on coherence. Archive it forever. No gatekeeping. No waiting._

---

### Section 2 Intro Variants

**Scientific Tone**:
> Syntheverse is an evaluation and archival system that applies holographic hydrogen fractal (HHF) coherence measurement to scientific contributions, replacing traditional peer review with objective, multi-dimensional scoring and permanent on-chain anchoring.

**Builder/Frontier Tone**:
> Syntheverse scores your research on what matters—novelty, coherence, density, alignment—then saves it to an auditable archive. Optionally anchor your proof on-chain. No committees. No delays.

---

### Recommendation

**Use Builder/Frontier tone** for landing page (conversion focus). Scientific tone for `/docs` and technical papers.

---

## 10. Launch Checklist

### Pre-Launch

- [ ] All sections responsive (test on mobile, tablet, desktop)
- [ ] CTAs linked to correct destinations
- [ ] Tooltips functional and accurate
- [ ] Modals load without layout shift
- [ ] Images optimized (WebP, <100KB)
- [ ] Fonts loaded with fallback
- [ ] Analytics events firing correctly
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Performance audit passed (Lighthouse score >90)

### Launch Day

- [ ] Deploy to production
- [ ] Monitor analytics (real-time)
- [ ] Check for console errors
- [ ] Test primary conversion path (signup → submit)
- [ ] Monitor server load (if API-heavy)

### Post-Launch (Week 1)

- [ ] Review heatmaps (where users click/scroll)
- [ ] Check bounce rate by section
- [ ] Analyze CTA click-through rates
- [ ] Review user testing feedback
- [ ] Identify drop-off points in funnel

### Iteration (Week 2+)

- [ ] A/B test hero headline variants
- [ ] A/B test CTA label variants
- [ ] Test MOTHERLODE position (move up?)
- [ ] Refine copy based on user confusion (tooltips)
- [ ] Optimize sections with high drop-off

---

## 11. Success Metrics (30-Day Goals)

| Metric | Current (Baseline) | Target (30 Days) |
|--------|-------------------|------------------|
| **Bounce Rate** | TBD | <40% |
| **Avg. Time on Page** | TBD | >3 min |
| **Scroll Depth (75%)** | TBD | >60% |
| **Primary CTA Click Rate** | TBD | >15% |
| **Secondary CTA Click Rate** | TBD | >25% |
| **Signup Conversion** | TBD | >5% |
| **Mobile Bounce Rate** | TBD | <50% |

---

## 12. Appendix: Example Code Snippets

### Hero Component (React/TypeScript)

```typescript
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center">
      {/* Fractal background animation */}
      <div className="absolute inset-0 opacity-[0.08]">
        <FractalAnimation />
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Syntheverse: Proof-of-Contribution for Frontier Research
        </h1>

        <p className="mb-4 text-xl text-muted-foreground md:text-2xl">
          Turn research into verifiable on-chain records — no gatekeeping, measured by coherence
        </p>

        <p className="mb-8 text-base text-muted-foreground">
          An evaluation system that scores novelty, density, coherence, and alignment — then anchors proofs on Base
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            Submit Your PoC
            <ArrowRight className="h-5 w-5" />
          </Link>

          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            See How It Works
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Base Mainnet LIVE
          </span>
          <span>•</span>
          <span>90T SYNTH</span>
          <span>•</span>
          <span>Beta Active</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-8 animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </button>
    </section>
  );
}
```

### Tooltip Component

```typescript
import { useState } from 'react';

interface TooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function Tooltip({ term, definition, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  return (
    <span className="relative inline-block">
      <abbr
        className="cursor-help border-b border-dotted border-current no-underline"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => !isPinned && setIsOpen(false)}
        onClick={() => setIsPinned(!isPinned)}
        title={definition}
      >
        {children}
      </abbr>

      {isOpen && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-keyline bg-surface p-3 text-sm shadow-lg"
          role="tooltip"
        >
          <strong className="mb-1 block">{term}</strong>
          <p className="text-muted-foreground">{definition}</p>

          <button
            onClick={() => setIsPinned(!isPinned)}
            className="mt-2 text-xs text-accent hover:underline"
          >
            {isPinned ? 'Unpin' : 'Pin this'}
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setIsPinned(false);
            }}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            aria-label="Close tooltip"
          >
            ×
          </button>
        </span>
      )}
    </span>
  );
}
```

---

## End of Document

**Next Steps**:
1. Review this document with team
2. Create wireframes/mockups for each section
3. Implement Hero + Section 2-3 first (MVP)
4. User test with 5-10 target personas
5. Iterate based on feedback
6. Launch full landing page
7. Monitor analytics and A/B test

**Questions?** Contact: [your-email@domain.com]

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: UX/Product Design Strategy Team

