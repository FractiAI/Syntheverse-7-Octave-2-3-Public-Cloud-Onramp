import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable, allocationsTable } from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { distance3D, similarityFromDistance } from '@/utils/vectors/hhf-3d-mapping';

export async function GET(request: NextRequest) {
  debug('SandboxMap', 'Fetching sandbox map data with 3D vectors');

  try {
    // Get ALL contributions (including those without vectors - they'll be included in map with derived positions)
    const contributions = await db
      .select({
        submission_hash: contributionsTable.submission_hash,
        title: contributionsTable.title,
        contributor: contributionsTable.contributor,
        status: contributionsTable.status,
        category: contributionsTable.category,
        metals: contributionsTable.metals,
        metadata: contributionsTable.metadata,
        vector_x: contributionsTable.vector_x,
        vector_y: contributionsTable.vector_y,
        vector_z: contributionsTable.vector_z,
        embedding: contributionsTable.embedding,
        registered: contributionsTable.registered,
        registration_date: contributionsTable.registration_date,
        registration_tx_hash: contributionsTable.registration_tx_hash,
        stripe_payment_id: contributionsTable.stripe_payment_id,
        created_at: contributionsTable.created_at,
      })
      .from(contributionsTable)
      .orderBy(contributionsTable.created_at);

    // Get all allocations to check which PoCs are allocated
    const allAllocations = await db
      .select({
        submission_hash: allocationsTable.submission_hash,
      })
      .from(allocationsTable);

    const allocatedHashes = new Set(allAllocations.map((a) => a.submission_hash));

    // Generate nodes from ALL contributions (include both vectorized and non-vectorized)
    // Non-vectorized submissions will be positioned at origin (0,0,0) or based on scores if available
    const nodes = contributions.map((contrib) => {
      const metadata = (contrib.metadata as any) || {};
      const hasVector =
        contrib.vector_x !== null && contrib.vector_y !== null && contrib.vector_z !== null;

      // If vector exists, use it; otherwise, try to derive from scores or use origin
      let vector: { x: number; y: number; z: number } | null = null;

      if (hasVector) {
        vector = {
          x: Number(contrib.vector_x),
          y: Number(contrib.vector_y),
          z: Number(contrib.vector_z),
        };
      } else if (metadata.novelty || metadata.density || metadata.coherence) {
        // Derive approximate position from scores if available (even if not fully vectorized)
        const hhfScale = Math.log10(1.12e22) / 10; // ~2.05
        vector = {
          x: ((metadata.novelty || 0) / 2500) * hhfScale * 100,
          y: ((metadata.density || 0) / 2500) * hhfScale * 100,
          z: ((metadata.coherence || 0) / 2500) * hhfScale * 100,
        };
      } else {
        // Place at origin if no vector and no scores
        vector = { x: 0, y: 0, z: 0 };
      }

      return {
        id: contrib.submission_hash,
        submission_hash: contrib.submission_hash,
        title: contrib.title,
        contributor: contrib.contributor,
        status: contrib.status,
        category: contrib.category,
        metals: (contrib.metals as string[]) || [],
        // 3D vector coordinates for visualization (always present, may be derived)
        vector,
        vectorized: hasVector, // Flag to indicate if fully vectorized
        // Evaluation scores
        scores: {
          coherence: metadata.coherence,
          density: metadata.density,
          novelty: metadata.novelty,
          alignment: metadata.alignment,
          pod_score: metadata.pod_score,
          redundancy: metadata.redundancy,
        },
        // Registration and allocation status
        registered: contrib.registered || false,
        allocated: allocatedHashes.has(contrib.submission_hash),
        created_at: contrib.created_at?.toISOString(),
      };
    });

    // Generate edges based on 3D vector similarity
    const edges: Array<{
      source: string;
      target: string;
      similarity_score: number;
      distance: number;
      overlap_type: string;
    }> = [];

    // Calculate edges based on 3D vector proximity
    // Use all nodes (they all have vectors now, either actual or derived)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        if (nodeA.vector && nodeB.vector) {
          // Calculate 3D distance
          const distance = distance3D(nodeA.vector, nodeB.vector);
          const similarity = similarityFromDistance(distance);

          // Only create edge if similarity is above threshold (0.3 = 30% similar)
          // Or if they share contributor/category (lower threshold for those)
          const isSameContributor = nodeA.contributor === nodeB.contributor;
          const isSameCategory = nodeA.category === nodeB.category && nodeA.category;
          const threshold = isSameContributor || isSameCategory ? 0.2 : 0.3;

          if (similarity > threshold) {
            // Determine overlap type
            let overlapType = 'vector_similarity';
            if (isSameContributor) {
              overlapType = 'same_contributor';
            } else if (isSameCategory) {
              overlapType = 'same_category';
            }

            edges.push({
              source: nodeA.submission_hash,
              target: nodeB.submission_hash,
              similarity_score: similarity,
              distance: distance,
              overlap_type: overlapType,
            });
          }
        }
      }
    }

    // Also add edges for same contributor (even without vectors)
    const contributorMap = new Map<string, string[]>();
    contributions.forEach((contrib) => {
      if (!contributorMap.has(contrib.contributor)) {
        contributorMap.set(contrib.contributor, []);
      }
      contributorMap.get(contrib.contributor)!.push(contrib.submission_hash);
    });

    contributorMap.forEach((hashes, contributor) => {
      for (let i = 0; i < hashes.length; i++) {
        for (let j = i + 1; j < hashes.length; j++) {
          // Check if edge already exists
          const exists = edges.some(
            (e) =>
              (e.source === hashes[i] && e.target === hashes[j]) ||
              (e.source === hashes[j] && e.target === hashes[i])
          );
          if (!exists) {
            edges.push({
              source: hashes[i],
              target: hashes[j],
              similarity_score: 0.4, // Lower score for contributor-only connection
              distance: 0,
              overlap_type: 'contributor',
            });
          }
        }
      }
    });

    const vectorizedCount = nodes.filter((n) => (n as any).vectorized === true).length;

    const sandboxMap = {
      nodes,
      edges,
      metadata: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        vectorized_nodes: vectorizedCount,
        fully_vectorized: vectorizedCount === nodes.length,
        coordinate_system: 'HHF 3D Holographic Hydrogen Fractal Sandbox',
        hhf_constant: 'Λᴴᴴ ≈ 1.12 × 10²²',
        generated_at: new Date().toISOString(),
      },
    };

    debug('SandboxMap', 'Sandbox map generated with 3D vectors', {
      nodes: nodes.length,
      edges: edges.length,
      vectorized: vectorizedCount,
      all_included: true,
    });

    return NextResponse.json(sandboxMap);
  } catch (error) {
    debugError('SandboxMap', 'Error generating sandbox map', error);
    return NextResponse.json(
      {
        error: 'Failed to generate sandbox map',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
