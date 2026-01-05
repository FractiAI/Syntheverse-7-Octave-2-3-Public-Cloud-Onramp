import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, enterpriseContributionsTable } from '@/utils/db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET: List all sandboxes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sandboxes = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.operator, user.email));

    // Get contribution counts for each sandbox
    const sandboxesWithCounts = await Promise.all(
      sandboxes.map(async (sandbox) => {
        const counts = await db
          .select({
            total: sql<number>`count(*)::int`,
            qualified: sql<number>`count(*) filter (where ${enterpriseContributionsTable.status} = 'qualified')::int`,
          })
          .from(enterpriseContributionsTable)
          .where(eq(enterpriseContributionsTable.sandbox_id, sandbox.id));

        const countData = counts[0] || { total: 0, qualified: 0 };

        return {
          ...sandbox,
          contribution_count: countData.total || 0,
          qualified_count: countData.qualified || 0,
          subscription_tier: sandbox.subscription_tier || null,
          node_count: sandbox.node_count || 0,
        };
      })
    );

    return NextResponse.json({ sandboxes: sandboxesWithCounts });
  } catch (error) {
    console.error('Error fetching sandboxes:', error);
    return NextResponse.json({ error: 'Failed to fetch sandboxes' }, { status: 500 });
  }
}

// POST: Create a new sandbox
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Sandbox name is required' }, { status: 400 });
    }

    const sandboxId = crypto.randomUUID();

    const newSandbox = await db
      .insert(enterpriseSandboxesTable)
      .values({
        id: sandboxId,
        operator: user.email,
        name: name.trim(),
        description: description?.trim() || null,
        vault_status: 'paused', // Start paused
        tokenized: false,
        current_epoch: 'founder',
        scoring_config: {
          // Default to main Syntheverse scoring weights
          novelty_weight: 1.0,
          density_weight: 1.0,
          coherence_weight: 1.0,
          alignment_weight: 1.0,
          qualification_threshold: 4000, // Same as main ecosystem
        },
        metadata: {},
      })
      .returning();

    return NextResponse.json({ sandbox: newSandbox[0] });
  } catch (error) {
    console.error('Error creating sandbox:', error);
    return NextResponse.json({ error: 'Failed to create sandbox' }, { status: 500 });
  }
}
