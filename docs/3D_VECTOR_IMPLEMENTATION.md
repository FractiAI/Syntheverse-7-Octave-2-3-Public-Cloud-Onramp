# 3D Vector Implementation for Holographic Hydrogen Fractal Sandbox

## Overview

This implementation provides actual 3D vectorization of PoC submissions within the holographic hydrogen fractal sandbox framework. Submissions are mapped to 3D coordinates using HHF (Hydrogen Holographic Framework) geometry, enabling:

1. **Actual geometric redundancy calculations** (not just text-based)
2. **Vector similarity metrics** for comparison
3. **3D visualization** of the Syntheverse sandbox and contributions
4. **HHF-based coordinate mapping** using the hydrogen holographic constant Λᴴᴴ ≈ 1.12 × 10²²

## Architecture

### Database Schema

New columns added to `contributions` table:

- `embedding` (jsonb): Vector embedding as array of numbers
- `vector_x`, `vector_y`, `vector_z` (numeric): 3D coordinates in HHF space
- `embedding_model` (text): Model used for embedding generation
- `vector_generated_at` (timestamp): When vector was generated

**Migration:** Run `supabase/migrations/add_vector_columns.sql` in Supabase SQL Editor

### Core Components

#### 1. Embedding Generation (`utils/vectors/embeddings.ts`)

- **Primary:** Uses OpenAI Embeddings API (if `OPENAI_API_KEY` is set)
  - Model: `text-embedding-3-small` (default, 1536 dimensions)
  - Falls back to hash-based embedding if API key not available
- **Functions:**
  - `generateEmbedding(text, model?)`: Generate embedding vector
  - `cosineSimilarity(a, b)`: Calculate cosine similarity between embeddings
  - `euclideanDistance(a, b)`: Calculate Euclidean distance

#### 2. HHF 3D Mapping (`utils/vectors/hhf-3d-mapping.ts`)

Maps embeddings to 3D coordinates using HHF geometry:

- **X-axis:** Novelty (originality dimension)
- **Y-axis:** Density (information richness dimension)
- **Z-axis:** Coherence (structural consistency dimension)

Uses HHF constant (Λᴴᴴ ≈ 1.12 × 10²²) for coordinate scaling.

**Functions:**

- `mapTo3DCoordinates(params)`: Map embedding + scores to 3D coordinates
- `distance3D(a, b)`: Calculate 3D distance between vectors
- `similarityFromDistance(distance)`: Convert distance to similarity score

#### 3. Redundancy Calculation (`utils/vectors/redundancy.ts`)

Calculates redundancy using actual vector similarity:

- Compares current submission's embedding and 3D vector to archived PoCs
- Uses cosine similarity for embeddings and 3D distance for coordinates
- Maps similarity (0-1) to redundancy penalty (0-100%)
- Returns closest matching vectors with analysis

**Function:**

- `calculateRedundancy(currentEmbedding, currentVector, archivedVectors)`: Calculate redundancy penalty

#### 4. Unified Vector Utilities (`utils/vectors/index.ts`)

Main entry point providing:

- `vectorizeSubmission(text, scores?)`: Complete vectorization (embedding + 3D mapping)
- `formatArchivedVectors(archivedPoCs)`: Format database records for redundancy calculations
- `calculateVectorRedundancy(...)`: Calculate redundancy using vectors

## Integration Points

### Submission Flow (`app/api/submit/route.ts`)

When a submission is evaluated:

1. Grok API evaluates the submission (generates scores)
2. **Vector generation:** `vectorizeSubmission()` creates embedding + 3D coordinates
3. **Storage:** Vector data saved to database with evaluation results
4. Evaluation results include calculated redundancy from vector similarity

### Evaluation Flow (`utils/grok/evaluate.ts`)

The `evaluateWithGrok()` function now:

1. **Generates vector** for current submission
2. **Fetches archived vectors** from database (with embeddings and 3D coordinates)
3. **Calculates redundancy** using actual vector similarity
4. **Passes calculated redundancy** to Grok (as baseline, Grok can refine)
5. **Uses calculated redundancy** in final result (if available)

### Visualization API (`app/api/vectors/route.ts`)

**Endpoint:** `GET /api/vectors`

Returns all PoC submissions with 3D coordinates for visualization:

- **Query params:**
  - `include_embeddings=true`: Include full embedding arrays (default: false)
- **Response:**
  ```json
  {
    "success": true,
    "count": 10,
    "vectors": [
      {
        "id": "submission_hash",
        "title": "PoC Title",
        "vector": { "x": 123.45, "y": 67.89, "z": 234.56 },
        "scores": { "pod_score": 8500, "novelty": 2200, ... },
        ...
      }
    ],
    "metadata": {
      "coordinate_system": "HHF 3D Holographic Hydrogen Fractal Sandbox",
      "hhf_constant": "Λᴴᴴ ≈ 1.12 × 10²²"
    }
  }
  ```

## Usage

### Environment Variables

Optional (for better embeddings):

- `OPENAI_API_KEY`: OpenAI API key for embedding generation
  - If not set, uses fallback hash-based embedding (deterministic but not semantic)

Required:

- `DATABASE_URL`: Database connection string (already configured)
- `NEXT_PUBLIC_GROK_API_KEY`: Grok API key for evaluation (already configured)

### Running Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/add_vector_columns.sql`
3. Paste and run in SQL Editor
4. Verify columns were added: `SELECT column_name FROM information_schema.columns WHERE table_name = 'contributions' AND column_name LIKE 'vector%';`

### Testing

1. **Submit a new PoC** - vectors will be automatically generated
2. **Check vectors API:** `GET /api/vectors` to see all vectorized submissions
3. **Check database:** Query `contributions` table to see `vector_x`, `vector_y`, `vector_z` columns populated

## Coordinate System

The 3D coordinate system maps:

- **X-axis (Novelty):** 0-2500 score → ~0-200 range (scaled by HHF constant)
- **Y-axis (Density):** 0-2500 score → ~0-200 range
- **Z-axis (Coherence):** 0-2500 score → ~0-200 range

If evaluation scores aren't available, coordinates are derived from embedding's principal components.

## Redundancy Calculation

Redundancy penalty is calculated as:

1. **Embedding similarity:** Cosine similarity between current and archived embeddings (0-1)
2. **3D vector distance:** Euclidean distance in 3D space
3. **Combined similarity:** Weighted average (70% embedding, 30% 3D distance)
4. **Redundancy mapping:**
   - Similarity 0.0-0.3: 0-25% penalty
   - Similarity 0.3-0.6: 25-50% penalty
   - Similarity 0.6-0.8: 50-75% penalty
   - Similarity 0.8-1.0: 75-100% penalty

## Visualization

The `/api/vectors` endpoint provides data for 3D visualization:

- **3D Scatter Plot:** Plot `vector.x`, `vector.y`, `vector.z` coordinates
- **Color coding:** By category, status, or metals
- **Size:** Based on pod_score
- **Labels:** Show title on hover/click
- **Clustering:** Identify groups of similar submissions

Example visualization libraries:

- Three.js (web)
- Plotly.js (interactive 3D plots)
- D3.js (custom 3D rendering)

## Future Enhancements

1. **Vector embeddings upgrade:**
   - Use sentence-transformers for free, high-quality embeddings
   - Support multiple embedding models
   - Fine-tune embeddings on Syntheverse corpus

2. **Advanced HHF mapping:**
   - Use actual HHF geometric transformations
   - Implement fractal dimension calculations
   - Add time dimension (4D space)

3. **Vector database:**
   - Use pgvector extension for efficient similarity search
   - Implement approximate nearest neighbor (ANN) search
   - Support semantic search across archive

4. **Visualization dashboard:**
   - Interactive 3D sandbox viewer
   - Vector similarity graphs
   - Redundancy analysis visualizations

## Files Created/Modified

### New Files

- `utils/vectors/embeddings.ts` - Embedding generation
- `utils/vectors/hhf-3d-mapping.ts` - 3D coordinate mapping
- `utils/vectors/redundancy.ts` - Redundancy calculations
- `utils/vectors/index.ts` - Unified exports
- `app/api/vectors/route.ts` - Visualization API endpoint
- `supabase/migrations/add_vector_columns.sql` - Database migration

### Modified Files

- `utils/db/schema.ts` - Added vector columns to schema
- `utils/grok/evaluate.ts` - Integrated vector calculations
- `app/api/submit/route.ts` - Generate and store vectors on submission

## Notes

- **Backward compatible:** Existing submissions without vectors still work (Grok estimates redundancy)
- **Graceful degradation:** If vector generation fails, submission/evaluation continues
- **Performance:** Vector generation adds ~1-2 seconds per submission (if using OpenAI API)
- **Cost:** OpenAI embeddings cost ~$0.0001 per 1K tokens (very affordable)
