import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import {
  enterpriseSandboxesTable,
  sandboxSynthTransactionsTable,
  sandboxMetricsTable,
} from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { getActivationFee, calculateReachTier, getMonthlyRent } from '@/utils/enterprise/synth-pricing';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST: Activate sandbox with SYNTH tokens
 * Body: { amount: number } - Amount of SYNTH tokens to deposit (must be >= activation fee)
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get sandbox
    const sandboxes = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(
        and(
          eq(enterpriseSandboxesTable.id, params.id),
          eq(enterpriseSandboxesTable.operator, user.email)
        )
      )
      .limit(1);

    if (!sandboxes || sandboxes.length === 0) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    const sandbox = sandboxes[0];

    // Check if already activated
    if (sandbox.synth_activated) {
      return NextResponse.json({ error: 'Sandbox is already activated' }, { status: 400 });
    }

    const activationFee = Number(sandbox.synth_activation_fee || getActivationFee());

    // Check if amount is sufficient for activation
    if (amount < activationFee) {
      return NextResponse.json(
        {
          error: `Insufficient amount. Activation requires ${activationFee} SYNTH tokens`,
          required: activationFee,
        },
        { status: 400 }
      );
    }

    // Calculate new balance (deposit amount)
    const balanceBefore = Number(sandbox.synth_balance || 0);
    const balanceAfter = balanceBefore + amount;

    // Update sandbox: activate and update balance
    await db
      .update(enterpriseSandboxesTable)
      .set({
        synth_balance: balanceAfter.toString(),
        synth_activated: true,
        synth_activated_at: new Date(),
        testing_mode: false,
        vault_status: 'active',
        updated_at: new Date(),
      })
      .where(eq(enterpriseSandboxesTable.id, params.id));

    // Record activation transaction
    const transactionId = crypto.randomUUID();
    await db.insert(sandboxSynthTransactionsTable).values({
      id: transactionId,
      sandbox_id: params.id,
      transaction_type: 'activation',
      amount: amount.toString(),
      balance_before: balanceBefore.toString(),
      balance_after: balanceAfter.toString(),
      metadata: {
        activation_fee: activationFee,
        remaining_balance: balanceAfter - activationFee,
      },
    });

    // Initialize metrics if not exists
    const existingMetrics = await db
      .select()
      .from(sandboxMetricsTable)
      .where(eq(sandboxMetricsTable.sandbox_id, params.id))
      .limit(1);

    if (existingMetrics.length === 0) {
      await db.insert(sandboxMetricsTable).values({
        sandbox_id: params.id,
        unique_contributors: 0,
        total_submissions: 0,
        total_evaluations: 0,
        total_registrations: 0,
        total_allocations: 0,
        total_analytics_queries: 0,
      });
    }

    // Update reach tier
    const metrics = await db
      .select()
      .from(sandboxMetricsTable)
      .where(eq(sandboxMetricsTable.sandbox_id, params.id))
      .limit(1);

    if (metrics.length > 0) {
      const reachTier = calculateReachTier(Number(metrics[0].unique_contributors || 0));
      await db
        .update(enterpriseSandboxesTable)
        .set({
          current_reach_tier: reachTier,
          last_billing_cycle: new Date(),
        })
        .where(eq(enterpriseSandboxesTable.id, params.id));
    }

    return NextResponse.json({
      success: true,
      sandbox_id: params.id,
      activated: true,
      balance: balanceAfter.toString(),
      activation_fee: activationFee,
      remaining_balance: balanceAfter - activationFee,
      transaction_id: transactionId,
    });
  } catch (error: any) {
    console.error('Error activating sandbox:', error);
    return NextResponse.json({ error: 'Failed to activate sandbox' }, { status: 500 });
  }
}

