import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { contributionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { debug } from '@/utils/debug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers });
    }

    const submissionHash = params.hash;

    const contribution = await db
      .select()
      .from(contributionsTable)
      .where(eq(contributionsTable.submission_hash, submissionHash))
      .limit(1);

    if (!contribution || contribution.length === 0) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404, headers });
    }

    const contrib = contribution[0];

    // Only allow public access to qualified submissions
    if (contrib.status !== 'qualified') {
      return NextResponse.json(
        { error: 'This submission is not publicly available' },
        { status: 403, headers }
      );
    }

    const md: any = (contrib.metadata as any) || {};

    // Get full evaluation response
    const grokDetails = md.grok_evaluation_details || {};
    const rawGrokResponse =
      grokDetails.raw_grok_response || grokDetails.full_evaluation?.raw_grok_response || null;

    // Return public-safe data (no sensitive information)
    return NextResponse.json(
      {
        submission_hash: contrib.submission_hash,
        title: contrib.title,
        contributor: contrib.contributor,
        category: contrib.category,
        text_content: contrib.text_content || null, // Full submission content
        metals: (contrib.metals as any) || null,
        status: contrib.status,
        created_at: contrib.created_at ? new Date(contrib.created_at).toISOString() : null,
        metadata: {
          pod_score: md.pod_score || null,
          novelty: md.novelty || null,
          density: md.density || null,
          coherence: md.coherence || null,
          alignment: md.alignment || null,
          qualified_epoch: md.qualified_epoch || null,
          classification: md.classification || null,
          redundancy_analysis: md.redundancy_analysis || null,
          metal_justification: md.metal_justification || null,
          // Include evaluation details if available
          grok_evaluation_details: md.grok_evaluation_details || null,
          raw_grok_response: rawGrokResponse, // Full evaluation response
        },
      },
      { headers }
    );
  } catch (err) {
    debug('PublicExample', 'Failed to fetch example', err);
    return NextResponse.json({ error: 'Failed to fetch example' }, { headers, status: 500 });
  }
}
