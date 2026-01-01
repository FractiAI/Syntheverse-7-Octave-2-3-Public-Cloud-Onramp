# 3D Vectorized Map Upgrade Plan - Nested Fractal Layers

## Overview

Upgrade the current basic 3D map visualization to a fully interactive, nested fractal structure that displays all PoCs with visual encoding, dynamic token allocation, and registration functionality.

---

## Architecture

### 1. Technology Stack Upgrade

**Current**: Canvas 2D projection  
**Upgrade to**: Three.js for true 3D rendering

**Dependencies to Add**:
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0"
}
```

### 2. Sandbox Structure (Nested Fractals)

```
Layer 0: Outer narrative layer
  └─ InfinitePossibilitiesVerse
      └─ StoryVerse

Layer 1: Core holographic awareness
  ├─ Aspect A: AwarenessVerse
  ├─ Aspect B: Holographic Hydrogen (Element 0)
  └─ Aspect C: Syntheverse (PRIMARY SANDBOX)

Layer 2: Meta-integrated universes
  └─ IamVerse
      ├─ AwarenessVerse (nested)
      ├─ Syntheverse (nested)
      └─ Quantum/Electronic/System/Internet/Blockchain universes

Layer 3+: Operational layers
  ├─ ElectronicVerse
  ├─ SystemVerse
  ├─ InternetVerse
  └─ BlockchainVerse
```

**Implementation**: Hierarchical scene graph with nested Group objects representing each layer.

---

## PoC Node Representation

### Visual Encoding

Each PoC node is a 3D object with:

1. **Position (x, y, z)**:
   - Based on current vector_x, vector_y, vector_z coordinates
   - Adjusted to reflect fractal layer hierarchy
   - Clustering within appropriate layer

2. **Size (Scale)**:
   - Proportional to `density` score
   - Formula: `scale = min(max(density / 2500, 0.3), 3.0)`
   - Range: 30% to 300% of base size

3. **Color**:
   - Represents `novelty` score
   - Gradient: Low (blue) → Medium (green) → High (red/orange)
   - Formula: `hue = (novelty / 2500) * 360` (HSV color space)

4. **Shape**:
   - **Gold**: Icosahedron (20-sided)
   - **Silver**: Octahedron (8-sided)
   - **Copper**: Tetrahedron (4-sided)
   - **Multiple metals**: Combined/composite shape

5. **Transparency (Opacity)**:
   - Proportional to `coherence` score
   - Formula: `opacity = coherence / 2500`
   - Range: 0.3 (low coherence) to 1.0 (high coherence)

### Node States

- **Qualified**: Full opacity, normal scale
- **Non-qualified**: Dimmed (50% opacity), smaller scale
- **Allocated**: Solid border/outline, badge indicator
- **Registered**: Special marker/indicator
- **Highlighted (Hover)**: Glow effect, larger scale

---

## Interaction Behavior

### Click Event Handling

When a PoC node is clicked, open a detail panel showing:

#### Panel Content

**Header**:
- PoC Title
- Submission Hash (shortened)
- Contributor email/ID

**Scores Section**:
- Novelty: `{novelty}/2500`
- Density: `{density}/2500`
- Coherence: `{coherence}/2500`
- Alignment: `{alignment}/2500`
- Composite Score: `{pod_score}`
- Redundancy Penalty: `{redundancy}%`

**Status Section**:
- Epoch Qualification Status: "Qualified for {epoch}" or "Not qualified"
- Registration Status: "Registered" / "Unregistered"
- Allocation Status: "Allocated: {amount} SYNTH" / "Unallocated"

**Metals Section**:
- Badges for Gold, Silver, Copper
- Metal justification text

**Contributor-Specific Actions** (if current user is contributor):

1. **Projected SYNTH Allocation**:
   - Display: "Projected: {amount} SYNTH"
   - Calculated dynamically based on:
     - Current pod_score
     - Metallic assay (Gold/Silver/Copper multipliers)
     - Current epoch availability
     - Tier multipliers

2. **Allocate SYNTH Button**:
   - Enabled only if:
     - PoC is qualified
     - PoC is not yet allocated
     - User is the contributor
   - On click: Call API to allocate tokens
   - Tooltip: "SYNTH tokens are allocated based on your PoC score, metallic assay, and current epoch availability."

3. **Register PoC Button**:
   - Display: "Anchor PoC on-chain - $500"
   - Enabled only if:
     - PoC is not yet registered
     - User is the contributor
   - On click: Open Stripe checkout
   - After payment: Enable allocation button if not already allocated

**Non-Contributor View**:
- Read-only panel
- All buttons hidden
- Scores and status visible

---

## API Endpoints Needed

### 1. Enhanced Sandbox Map Data
**Endpoint**: `GET /api/sandbox-map`

**Query Parameters**:
- `layer` (optional): Filter by fractal layer
- `contributor` (optional): Filter by contributor (for contributor view)
- `include_projected_allocation` (optional): Include projected token amounts

**Response**:
```typescript
{
  nodes: PoCNode[],
  edges: Edge[],
  layers: FractalLayer[],
  metadata: {
    total_nodes: number,
    vectorized_nodes: number,
    layers: {
      layer_0: { count: number, nodes: string[] },
      layer_1: { count: number, nodes: string[] },
      // ...
    }
  }
}
```

### 2. Projected Token Allocation
**Endpoint**: `GET /api/poc/{submission_hash}/projected-allocation`

**Response**:
```typescript
{
  submission_hash: string,
  projected_allocation: number,
  breakdown: {
    base_score: number,
    metal_multiplier: number,
    epoch_availability: number,
    tier_multiplier: number,
    final_amount: number
  },
  eligible: boolean,
  epoch: string
}
```

### 3. Allocate SYNTH Tokens
**Endpoint**: `POST /api/poc/{submission_hash}/allocate`

**Auth**: Required (contributor only)

**Body**:
```typescript
{
  epoch?: string, // Optional: specify epoch, defaults to current
  tier?: string   // Optional: specify tier
}
```

**Response**:
```typescript
{
  success: boolean,
  allocation_id: string,
  amount: number,
  epoch: string,
  transaction_hash?: string
}
```

### 4. Register PoC (Stripe Checkout)
**Endpoint**: `POST /api/poc/{submission_hash}/register`

**Auth**: Required (contributor only)

**Response**: Stripe checkout session
```typescript
{
  checkout_url: string,
  session_id: string
}
```

### 5. Registration Status
**Endpoint**: `GET /api/poc/{submission_hash}/registration-status`

**Response**:
```typescript
{
  submission_hash: string,
  registered: boolean,
  registration_date?: string,
  transaction_hash?: string,
  stripe_payment_id?: string
}
```

---

## Component Structure

### Main Component: `SandboxMap3D.tsx`

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import { FractalLayers } from './FractalLayers'
import { PoCNodes } from './PoCNodes'
import { PoCDetailPanel } from './PoCDetailPanel'
import { useState } from 'react'

export function SandboxMap3D() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [currentLayer, setCurrentLayer] = useState(1) // Default to Layer 1 (Syntheverse)
  
  return (
    <div className="relative w-full h-[800px]">
      <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Nested Fractal Layers */}
        <FractalLayers 
          currentLayer={currentLayer}
          onLayerChange={setCurrentLayer}
        />
        
        {/* PoC Nodes */}
        <PoCNodes 
          onNodeClick={setSelectedNode}
          selectedNode={selectedNode}
          currentLayer={currentLayer}
        />
        
        {/* Camera Controls */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={50}
          maxDistance={500}
        />
      </Canvas>
      
      {/* Layer Navigation */}
      <LayerNavigator 
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
      />
      
      {/* PoC Detail Panel */}
      {selectedNode && (
        <PoCDetailPanel 
          submissionHash={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}
```

### Sub-Components

1. **FractalLayers.tsx**: Renders nested fractal structure
2. **PoCNodes.tsx**: Renders PoC nodes with visual encoding
3. **PoCDetailPanel.tsx**: Interactive detail panel
4. **LayerNavigator.tsx**: Layer zoom/navigation controls
5. **PoCNode.tsx**: Individual PoC node component

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Install Three.js dependencies
- [ ] Set up basic Three.js canvas
- [ ] Create base component structure
- [ ] Implement basic node rendering

### Phase 2: Visual Encoding (Week 1-2)
- [ ] Implement size scaling (density)
- [ ] Implement color mapping (novelty)
- [ ] Implement shape selection (metals)
- [ ] Implement transparency (coherence)
- [ ] Add node state styling (qualified, allocated, etc.)

### Phase 3: Fractal Layers (Week 2)
- [ ] Design layer hierarchy structure
- [ ] Implement nested Group objects
- [ ] Add layer navigation/zooming
- [ ] Position nodes within appropriate layers

### Phase 4: Interactivity (Week 2-3)
- [ ] Implement node click detection
- [ ] Create PoC detail panel component
- [ ] Add hover effects and highlighting
- [ ] Implement panel animations

### Phase 5: Token Allocation (Week 3)
- [ ] Create projected allocation API endpoint
- [ ] Calculate and display projected amounts
- [ ] Implement Allocate SYNTH button
- [ ] Add allocation API endpoint

### Phase 6: Registration (Week 3-4)
- [ ] Create registration API endpoint
- [ ] Integrate Stripe checkout
- [ ] Implement Register PoC button
- [ ] Handle registration webhook

### Phase 7: Polish & Testing (Week 4)
- [ ] Add visual cues and badges
- [ ] Implement contributor-specific views
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

## Data Model Extensions

### Database Schema Updates

**contributions table** (already has):
- `vector_x`, `vector_y`, `vector_z` ✅
- `metadata` (scores) ✅
- `metals` ✅
- `status` ✅

**New fields needed**:
- `registered`: boolean (is PoC registered on blockchain)
- `registration_date`: timestamp
- `registration_tx_hash`: text (blockchain transaction)
- `stripe_payment_id`: text (Stripe payment ID)

**allocations table** (already exists):
- Already tracks token allocations ✅

---

## Visual Design Specifications

### Color Scheme

**Novelty Gradient** (HSL):
- Low (0-833): `hsl(240, 100%, 50%)` (Blue)
- Medium (834-1666): `hsl(120, 100%, 50%)` (Green)
- High (1667-2500): `hsl(0, 100%, 50%)` (Red)

**Metal Colors** (for badges/shapes):
- Gold: `#FFD700`
- Silver: `#C0C0C0`
- Copper: `#CD7F32`

**Status Colors**:
- Qualified: Green glow
- Non-qualified: Gray, dimmed
- Allocated: Gold border
- Registered: Blue border

### Typography

- Panel Headers: Bold, 18px
- Scores: Monospace, 16px
- Labels: Regular, 14px
- Badges: Small, 12px

---

## Performance Considerations

1. **Node Limit**: Optimize rendering for 1000+ nodes
2. **Level of Detail (LOD)**: Reduce detail for distant nodes
3. **Frustum Culling**: Only render visible nodes
4. **Instance Rendering**: Use InstancedMesh for similar nodes
5. **Lazy Loading**: Load layer data on demand

---

## Testing Checklist

- [ ] All PoCs display correctly with visual encoding
- [ ] Fractal layers render properly
- [ ] Node clicking opens detail panel
- [ ] Scores display accurately
- [ ] Projected allocation calculates correctly
- [ ] Allocate SYNTH button works
- [ ] Register PoC opens Stripe checkout
- [ ] Registration updates PoC status
- [ ] Contributor vs non-contributor views work
- [ ] Zoom/navigation works smoothly
- [ ] Performance is acceptable with 100+ nodes

---

## Files to Create/Modify

### New Files
- `components/SandboxMap3DUpgraded.tsx` - Main upgraded component
- `components/3d/FractalLayers.tsx` - Fractal layer rendering
- `components/3d/PoCNodes.tsx` - PoC nodes container
- `components/3d/PoCNode.tsx` - Individual PoC node
- `components/3d/PoCDetailPanel.tsx` - Interactive detail panel
- `components/3d/LayerNavigator.tsx` - Layer navigation controls
- `app/api/poc/[hash]/projected-allocation/route.ts` - Projected allocation API
- `app/api/poc/[hash]/allocate/route.ts` - Allocate tokens API
- `app/api/poc/[hash]/register/route.ts` - Register PoC API
- `app/api/poc/[hash]/registration-status/route.ts` - Registration status API

### Modified Files
- `app/api/sandbox-map/route.ts` - Enhance with layer data, projected allocations
- `utils/db/schema.ts` - Add registration fields to contributions table
- `utils/tokenomics/calculate-allocation.ts` - Token allocation calculation logic

---

## Next Steps

1. **Review and approve this plan**
2. **Set up Three.js dependencies**
3. **Create database migration for registration fields**
4. **Start with Phase 1 implementation**
5. **Iterate through phases with testing**

---

**Status**: Planning Complete - Ready for Implementation  
**Estimated Timeline**: 4 weeks  
**Priority**: High

