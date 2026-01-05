import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { chatRoomsTable, chatParticipantsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// POST: Create a new user-defined sandbox chat room
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const userEmail = user.email;
    const userRole = isCreator ? 'creator' : isOperator ? 'operator' : 'contributor';

    const body = await request.json();
    const { name, description, sandbox_id } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Generate unique room ID
    const roomId = `sandbox-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create the room
    await db.insert(chatRoomsTable).values({
      id: roomId,
      sandbox_id: sandbox_id || null, // null for user-defined sandboxes, or link to enterprise sandbox
      name: name.trim(),
      description: description?.trim() || null,
      created_by: userEmail,
    });

    // Auto-add creator as participant
    const participantId = `${roomId}-${userEmail}-${Date.now()}`;
    await db.insert(chatParticipantsTable).values({
      id: participantId,
      room_id: roomId,
      user_email: userEmail,
      role: userRole,
    });

    // Fetch the created room with participant count
    const room = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    const participants = await db
      .select()
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.room_id, roomId));

    return NextResponse.json({
      success: true,
      room: {
        ...room[0],
        participant_count: participants.length,
        participants: participants.map((p) => ({
          email: p.user_email,
          role: p.role,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}

