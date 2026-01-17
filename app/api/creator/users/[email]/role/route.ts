/**
 * Creator-only endpoint to grant/revoke operator privileges
 *
 * POST /api/creator/users/[email]/role
 * Body: { action: 'grant' | 'revoke', role: 'operator' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole, CREATOR_EMAIL } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '@/utils/audit/audit-logger';

export async function POST(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const { user, isCreator } = await getAuthenticatedUserWithRole();

    if (!user || !isCreator) {
      return NextResponse.json({ error: 'Unauthorized: Creator access required' }, { status: 403 });
    }

    const targetEmail = decodeURIComponent(params.email).toLowerCase();

    // Prevent modifying Creator role
    if (targetEmail === CREATOR_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot modify Creator role' }, { status: 400 });
    }

    const body = await request.json();
    const { action, role } = body;

    if (!action || (action !== 'grant' && action !== 'revoke')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "grant" or "revoke"' },
        { status: 400 }
      );
    }

    if (role !== 'operator') {
      return NextResponse.json(
        { error: 'Invalid role. Only "operator" can be granted/revoked' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, targetEmail))
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const previousRole = targetUser[0].role;
    const newRole = action === 'grant' ? 'operator' : 'user';

    // Update role
    await db
      .update(usersTable)
      .set({
        role: newRole,
      })
      .where(eq(usersTable.email, targetEmail));

    // Get IP and user agent for audit
    const ip_address =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    await logAuditEvent(
      user.email,
      action === 'grant' ? 'role_grant' : 'role_revoke',
      'role',
      targetEmail,
      1,
      {
        ip_address,
        user_agent,
        previous_role: previousRole,
        new_role: newRole,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Operator role ${action === 'grant' ? 'granted' : 'revoked'}`,
      user: {
        email: targetEmail,
        previous_role: previousRole,
        new_role: newRole,
      },
    });
  } catch (error) {
    console.error('Role management error:', error);
    return NextResponse.json(
      {
        error: 'Failed to manage user role',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
