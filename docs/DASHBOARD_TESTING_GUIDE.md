# Syntheverse Contributor Dashboard - Testing & Tuning Guide

## System Overview

This is a **Next.js 14** application for the Syntheverse Proof of Contribution (PoC) system, featuring:

- **Authentication**: Supabase Auth (OAuth + email/password)
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Payments**: Stripe integration
- **3D Visualization**: Holographic Hydrogen Fractal Sandbox map
- **PoC Evaluation**: AI-powered scoring with vector embeddings

---

## Current Dashboard Components

### 1. **PoCDashboardStats Component** (`components/PoCDashboardStats.tsx`)

- **Purpose**: Displays PoC evaluation statistics
- **Features**:
  - Total contributions count
  - Unique contributors count
  - Token distribution statistics
  - Current epoch information
  - Status distribution charts (bar chart)
  - Metal distribution (pie chart)
  - Epoch distribution visualization
- **Data Sources**:
  - `/api/archive` - Archive statistics
  - `/api/tokenomics` - Tokenomics data
  - `/api/epochs` - Epoch information
- **Status**: ✅ Fully implemented with charts

### 2. **SandboxMap3D Component** (`components/SandboxMap3D.tsx`)

- **Purpose**: 3D visualization of PoC submissions in HHF space
- **Current Implementation**:
  - Canvas-based 2D projection of 3D coordinates
  - Isometric projection rendering
  - Node visualization with metal-based coloring (Gold/Silver/Copper)
  - Edge rendering for similarity connections
  - Basic camera controls (zoom, rotate, reset)
  - Node selection (currently simplified - always selects first node)
- **Known Limitations** ⚠️:
  - **Node clicking is broken**: Always selects first node instead of clicked node
  - **2D canvas projection**: Not true 3D (no WebGL/Three.js)
  - **No hover tooltips**: Limited interactivity
  - **Fixed canvas size**: Not responsive
  - **Simple rendering**: Basic circles, no advanced visualization
- **Data Source**: `/api/sandbox-map`
- **Status**: 🔧 Needs upgrade (as mentioned in your plan)

### 3. **Dashboard Page** (`app/dashboard/page.tsx`)

- **Purpose**: Main dashboard layout
- **Sections**:
  - Account overview
  - Quick actions
  - PoC statistics
  - 3D sandbox map
  - Status overview

---

## 3D Map Current Architecture

### Vector System (`utils/vectors/`)

#### 1. **Embedding Generation** (`embeddings.ts`)

- **Primary**: OpenAI Embeddings API (`text-embedding-3-small`, 1536 dimensions)
- **Fallback**: Hash-based embedding if no API key
- **Functions**: `generateEmbedding()`, `cosineSimilarity()`, `euclideanDistance()`

#### 2. **3D Coordinate Mapping** (`hhf-3d-mapping.ts`)

- **HHF Constant**: Λᴴᴴ ≈ 1.12 × 10²²
- **Coordinate System**:
  - **X-axis**: Novelty (0-2500 score → ~0-200 range)
  - **Y-axis**: Density (0-2500 score → ~0-200 range)
  - **Z-axis**: Coherence (0-2500 score → ~0-200 range)
- **Scaling**: Uses `log10(HHF_CONSTANT) / 10 ≈ 2.05` as scale factor
- **Functions**: `mapTo3DCoordinates()`, `distance3D()`, `similarityFromDistance()`

#### 3. **Redundancy Calculation** (`redundancy.ts`)

- Compares embeddings and 3D vectors for similarity
- Calculates redundancy penalty based on vector distance
- Used during PoC evaluation

#### 4. **API Endpoint** (`app/api/sandbox-map/route.ts`)

- **Endpoint**: `GET /api/sandbox-map`
- **Returns**:
  - `nodes[]`: All submissions with 3D coordinates
  - `edges[]`: Similarity connections between nodes
  - `metadata`: Statistics about vectorization
- **Edge Generation**:
  - Based on 3D vector proximity
  - Similarity threshold: 0.3 (or 0.2 for same contributor/category)
  - Edge types: `vector_similarity`, `same_contributor`, `same_category`

---

## Testing Areas

### ✅ Well-Tested Components

1. **Authentication**: Supabase auth flow
2. **Database Schema**: Drizzle ORM with proper types
3. **API Routes**: Archive, tokenomics, epochs endpoints
4. **Stats Dashboard**: Charts and visualizations working

### 🔧 Components Needing Testing/Tuning

#### 1. **3D Map Rendering** (High Priority)

**Current Issues**:

- Node selection broken (always selects first node)
- 2D canvas projection limitations
- No proper 3D interaction
- Limited visual feedback

**Testing Checklist**:

- [ ] Verify nodes render at correct 3D positions
- [ ] Test node clicking - should select closest node in 2D projection
- [ ] Verify edge rendering (similarity connections)
- [ ] Test camera controls (zoom, rotate, reset)
- [ ] Check performance with large datasets (100+ nodes)
- [ ] Verify metal color coding (gold/silver/copper)
- [ ] Test node sizing based on pod_score
- [ ] Check axis labels and legend

**Recommended Improvements**:

- Upgrade to WebGL/Three.js for true 3D rendering
- Implement proper node picking (3D to 2D projection)
- Add hover tooltips
- Implement smooth camera transitions
- Add node filtering/search
- Responsive canvas sizing

#### 2. **Vector Generation & Storage**

**Testing Checklist**:

- [ ] Verify embeddings are generated for new submissions
- [ ] Check embedding quality (OpenAI vs fallback)
- [ ] Verify 3D coordinates are calculated correctly
- [ ] Test redundancy calculation accuracy
- [ ] Check vector storage in database
- [ ] Verify HHF scaling factor application

#### 3. **API Performance**

**Testing Checklist**:

- [ ] `/api/sandbox-map` response time with 100+ submissions
- [ ] Edge calculation performance (O(n²) complexity)
- [ ] Database query optimization for large datasets
- [ ] Vector similarity calculations

#### 4. **Dashboard Stats**

**Testing Checklist**:

- [ ] Verify all statistics are accurate
- [ ] Test chart rendering with various data states (empty, single item, many items)
- [ ] Check refresh functionality
- [ ] Verify tokenomics calculations
- [ ] Test epoch information display

---

## 3D Map Upgrade Plan

### Phase 1: Fix Current Implementation

1. **Fix Node Selection**
   - Implement proper 3D-to-2D picking
   - Calculate closest node to click position in screen space
   - Update `handleClick()` function in `SandboxMap3D.tsx`

2. **Improve Visual Feedback**
   - Add hover states
   - Better node highlighting
   - Tooltips with submission details

3. **Performance Optimization**
   - Optimize edge calculation (use spatial indexing if needed)
   - Implement view frustum culling for large datasets
   - Add loading states for large maps

### Phase 2: Enhanced Features

1. **WebGL/Three.js Migration**
   - Replace canvas 2D with Three.js for true 3D
   - Better rendering quality
   - Hardware acceleration
   - Smooth animations

2. **Interactive Features**
   - Node filtering by status/category/metal
   - Search functionality
   - Time-based filtering (show submissions by date range)
   - Cluster visualization for dense areas

3. **Advanced Visualization**
   - Better node representations (3D shapes instead of circles)
   - Gradient edges based on similarity
   - Animation for new submissions
   - Orbit controls with smooth transitions

### Phase 3: Advanced Features

1. **Multi-dimensional Views**
   - Switch between different axis mappings
   - Add 4D visualization (time dimension)
   - Dimension filtering

2. **Comparison Tools**
   - Compare two submissions side-by-side
   - Path tracing between related submissions
   - Similarity heatmap overlay

3. **Export & Sharing**
   - Export map as image
   - Shareable map links with filters
   - Embeddable map widget

---

## Key Files for 3D Map Upgrade

### Current Implementation

- `components/SandboxMap3D.tsx` - Main 3D map component (NEEDS UPGRADE)
- `app/api/sandbox-map/route.ts` - API endpoint for map data
- `utils/vectors/hhf-3d-mapping.ts` - 3D coordinate calculations
- `utils/vectors/embeddings.ts` - Embedding generation
- `utils/vectors/redundancy.ts` - Similarity calculations

### Database Schema

- `contributions` table with vector columns:
  - `embedding` (jsonb) - Full embedding array
  - `vector_x`, `vector_y`, `vector_z` (numeric) - 3D coordinates
  - `embedding_model` (text) - Model used
  - `vector_generated_at` (timestamp)

---

## Environment Variables Required

For full functionality:

- `OPENAI_API_KEY` - For high-quality embeddings (optional, has fallback)
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side)

---

## Quick Testing Commands

```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/sandbox-map
curl http://localhost:3000/api/archive
curl http://localhost:3000/api/tokenomics

# Run database migrations
npm run db:migrate

# Check database schema
npm run db:studio
```

---

## Next Steps

1. **Immediate**: Test current 3D map functionality
   - Identify all bugs and limitations
   - Document performance issues
   - Test with real data

2. **Short-term**: Fix critical issues
   - Fix node selection
   - Improve rendering performance
   - Add better visual feedback

3. **Medium-term**: Upgrade to WebGL/Three.js
   - Migrate from canvas 2D to Three.js
   - Implement proper 3D interactions
   - Add advanced features

4. **Long-term**: Advanced visualization features
   - Multi-dimensional views
   - Comparison tools
   - Export/sharing functionality

---

## Notes

- The 3D map currently uses a **2D canvas projection** of 3D coordinates
- Node selection is **broken** (always selects first node)
- Vector system is **fully implemented** and working
- Database schema supports full vector storage
- API endpoints are functional but may need performance tuning for large datasets

**Last Updated**: Based on current codebase review
**Status**: Ready for testing and 3D map upgrade planning
