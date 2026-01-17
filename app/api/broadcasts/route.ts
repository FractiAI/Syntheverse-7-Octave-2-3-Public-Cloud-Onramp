/**
 * System Broadcasts API
 * GET - List active broadcasts for contributor dashboard
 * POST - Create new broadcast (creator/operator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import { db } from '@/utils/db/db';
import { systemBroadcastsTable } from '@/utils/db/schema';
import { eq, and, gte, or, isNull, desc } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/broadcasts - Get active broadcasts for contributor dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Get active broadcasts that haven't expired
    // Gracefully handle case where table might not exist yet
    const broadcasts = await db
      .select()
      .from(systemBroadcastsTable)
      .where(
        and(
          eq(systemBroadcastsTable.is_active, true),
          or(
            isNull(systemBroadcastsTable.expires_at),
            gte(systemBroadcastsTable.expires_at, now)
          )
        )
      )
      .orderBy(desc(systemBroadcastsTable.created_at));

    return NextResponse.json({
      broadcasts: broadcasts.map((b) => ({
        id: b.id,
        message: b.message,
        nature: b.nature,
        created_at: b.created_at?.toISOString(),
        expires_at: b.expires_at?.toISOString() || null,
      })),
    });
  } catch (error: any) {
    // If table doesn't exist or other database error, return empty array instead of 500
    // This allows the UI to continue working even if broadcasts table isn't set up
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      console.warn('Broadcasts table not found, returning empty array:', error.message);
      return NextResponse.json({
        broadcasts: [],
      });
    }
    
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch broadcasts',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/broadcasts - Create new broadcast (creator/operator only)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, isCreator, isOperator } = await getAuthenticatedUserWithRole();

    if (!isCreator && !isOperator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { message, nature = 'info', expires_at } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const validNatures = ['announcement', 'warning', 'info', 'success', 'milestone', 'alert', 'update'];
    if (!validNatures.includes(nature)) {
      return NextResponse.json(
        { error: `Invalid nature. Must be one of: ${validNatures.join(', ')}` },
        { status: 400 }
      );
    }

    const broadcastId = crypto.randomUUID();
    const expiresAt = expires_at ? new Date(expires_at) : null;

    await db.insert(systemBroadcastsTable).values({
      id: broadcastId,
      message: message.trim(),
      nature,
      is_active: true,
      created_by: user?.email || 'unknown',
      expires_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      broadcast: {
        id: broadcastId,
        message: message.trim(),
        nature,
        expires_at: expiresAt?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json(
      {
        error: 'Failed to create broadcast',
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

