import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { enterpriseSandboxesTable, sandboxSynthTransactionsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST: Deposit SYNTH tokens to sandbox balance
 * Body: { amount: number } - Amount of SYNTH tokens to deposit
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
    const balanceBefore = Number(sandbox.synth_balance || 0);
    const balanceAfter = balanceBefore + amount;

    // Update balance
    await db
      .update(enterpriseSandboxesTable)
      .set({
        synth_balance: balanceAfter.toString(),
        updated_at: new Date(),
        // Reactivate if paused due to low balance
        vault_status: sandbox.vault_status === 'paused' && balanceAfter > 0 ? 'active' : sandbox.vault_status,
      })
      .where(eq(enterpriseSandboxesTable.id, params.id));

    // Record deposit transaction
    const transactionId = crypto.randomUUID();
    await db.insert(sandboxSynthTransactionsTable).values({
      id: transactionId,
      sandbox_id: params.id,
      transaction_type: 'deposit',
      amount: amount.toString(),
      balance_before: balanceBefore.toString(),
      balance_after: balanceAfter.toString(),
      metadata: {
        deposited_by: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      sandbox_id: params.id,
      balance: balanceAfter.toString(),
      balance_before: balanceBefore.toString(),
      amount_deposited: amount.toString(),
      transaction_id: transactionId,
    });
  } catch (error: any) {
    console.error('Error depositing SYNTH tokens:', error);
    return NextResponse.json({ error: 'Failed to deposit SYNTH tokens' }, { status: 500 });
  }
}

