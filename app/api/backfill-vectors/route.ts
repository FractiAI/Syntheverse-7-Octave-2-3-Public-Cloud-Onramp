/**
 * API endpoint to trigger vectorization for all submissions without vectors
 *
 * This endpoint can be called to backfill vectors for existing submissions
 * that were created before the vector system was implemented.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { isNull, or } from 'drizzle-orm';
import { debug, debugError } from '@/utils/debug';
import { vectorizeSubmission } from '@/utils/vectors';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  debug('BackfillVectors', 'Starting vector backfill');

  try {
    // Get all contributions without vectors
    const contributionsWithoutVectors = await db
      .select()
      .from(contributionsTable)
      .where(
        or(
          isNull(contributionsTable.vector_x),
          isNull(contributionsTable.vector_y),
          isNull(contributionsTable.vector_z)
        )
      );

    debug('BackfillVectors', 'Found contributions without vectors', {
      count: contributionsWithoutVectors.length,
    });

    if (contributionsWithoutVectors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All submissions are already vectorized',
        processed: 0,
        errors: 0,
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ hash: string; title: string; error: string }> = [];

    // Process each contribution
    for (const contrib of contributionsWithoutVectors) {
      try {
        const textContent = contrib.text_content || contrib.title;
        const metadata = (contrib.metadata as any) || {};

        // Generate vector using existing scores if available, otherwise just text
        const vectorizationResult = await vectorizeSubmission(textContent, {
          novelty: metadata.novelty,
          density: metadata.density,
          coherence: metadata.coherence,
          alignment: metadata.alignment,
          pod_score: metadata.pod_score,
        });

        // Update contribution with vector data
        await db
          .update(contributionsTable)
          .set({
            embedding: vectorizationResult.embedding,
            vector_x: vectorizationResult.vector.x.toString(),
            vector_y: vectorizationResult.vector.y.toString(),
            vector_z: vectorizationResult.vector.z.toString(),
            embedding_model: vectorizationResult.embeddingModel,
            vector_generated_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(contributionsTable.submission_hash, contrib.submission_hash));

        successCount++;
        debug('BackfillVectors', 'Vectorized submission', {
          hash: contrib.submission_hash,
          title: contrib.title,
        });
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          hash: contrib.submission_hash,
          title: contrib.title,
          error: errorMessage,
        });
        debugError('BackfillVectors', `Failed to vectorize ${contrib.submission_hash}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vectorization complete: ${successCount} successful, ${errorCount} errors`,
      processed: contributionsWithoutVectors.length,
      successful: successCount,
      errors: errorCount,
      error_details: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    debugError('BackfillVectors', 'Backfill failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to backfill vectors',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
