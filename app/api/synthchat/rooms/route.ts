import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { chatRoomsTable, chatParticipantsTable, enterpriseSandboxesTable } from '@/utils/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

interface ChatRoom {
  id: string;
  sandbox_id: string | null;
  name: string;
  description: string | null;
  participant_count: number;
  participants: Array<{ email: string; role: string }>;
}

export const dynamic = 'force-dynamic';

// GET: List available chat rooms for the user
export async function GET(request: NextRequest) {
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

    // Get or create Syntheverse room first

    // Also get enterprise sandboxes the user can access
    let accessibleSandboxes = [];
    if (isOperator || isCreator) {
      // Operators/Creators can see all enterprise sandboxes
      accessibleSandboxes = await db.select().from(enterpriseSandboxesTable);
    } else {
      // Regular users see sandboxes they operate
      accessibleSandboxes = await db
        .select()
        .from(enterpriseSandboxesTable)
        .where(eq(enterpriseSandboxesTable.operator, userEmail));
    }

    // Get or create Syntheverse room
    let syntheverseRoom = await db
      .select()
      .from(chatRoomsTable)
      .where(isNull(chatRoomsTable.sandbox_id))
      .limit(1);

    if (syntheverseRoom.length === 0) {
      // Create Syntheverse room
      const roomId = 'syntheverse-main';
      await db.insert(chatRoomsTable).values({
        id: roomId,
        sandbox_id: null,
        name: 'Syntheverse',
        description: 'Main Syntheverse Protocol collaborative chat',
        created_by: 'system',
      });
      syntheverseRoom = await db
        .select()
        .from(chatRoomsTable)
        .where(eq(chatRoomsTable.id, roomId))
        .limit(1);
    }

    // Get or create rooms for accessible enterprise sandboxes
    const sandboxRoomIds = await Promise.all(
      accessibleSandboxes.map((sb) => getOrCreateSandboxRoom(sb.id))
    );

    // Get all rooms where user is a participant
    const userParticipantRooms = await db
      .select({
        room_id: chatParticipantsTable.room_id,
      })
      .from(chatParticipantsTable)
      .where(eq(chatParticipantsTable.user_email, userEmail));

    const userRoomIds = userParticipantRooms.map((p) => p.room_id);

    // Get all rooms user is in (user-defined sandboxes)
    const allUserRooms =
      userRoomIds.length > 0
        ? await db.select().from(chatRoomsTable).where(inArray(chatRoomsTable.id, userRoomIds))
        : [];

    // Filter to get only user-defined rooms (not Syntheverse, not enterprise sandboxes)
    const enterpriseSandboxIds = accessibleSandboxes.map((sb) => sb.id);
    const userDefinedRooms = allUserRooms.filter(
      (room) =>
        room.id !== syntheverseRoom[0].id && // Not Syntheverse
        (room.sandbox_id === null || !enterpriseSandboxIds.includes(room.sandbox_id)) // Not enterprise sandbox
    );

    // Get all room IDs (Syntheverse + enterprise sandbox rooms + user-defined rooms)
    const userDefinedRoomIds = userDefinedRooms
      .map((r) => r.id)
      .filter((id) => id !== syntheverseRoom[0].id && !sandboxRoomIds.includes(id));

    const allRoomIds = [syntheverseRoom[0].id, ...sandboxRoomIds, ...userDefinedRoomIds].filter(
      Boolean
    );

    // Get participant counts for each room
    const roomsWithCounts = await Promise.all(
      allRoomIds.map(async (roomId) => {
        const participants = await db
          .select()
          .from(chatParticipantsTable)
          .where(eq(chatParticipantsTable.room_id, roomId));

        const room = await db
          .select()
          .from(chatRoomsTable)
          .where(eq(chatRoomsTable.id, roomId))
          .limit(1);

        if (room.length === 0) return null;

        return {
          ...room[0],
          participant_count: participants.length,
          participants: participants.map((p) => ({
            email: p.user_email,
            role: p.role,
          })),
        };
      })
    );

    const filteredRooms = roomsWithCounts.filter((r) => r !== null) as ChatRoom[];

    return NextResponse.json({ rooms: filteredRooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
  }
}

// Helper: Get or create room for a sandbox
async function getOrCreateSandboxRoom(sandboxId: string) {
  let room = await db
    .select()
    .from(chatRoomsTable)
    .where(eq(chatRoomsTable.sandbox_id, sandboxId))
    .limit(1);

  if (room.length === 0) {
    const sandbox = await db
      .select()
      .from(enterpriseSandboxesTable)
      .where(eq(enterpriseSandboxesTable.id, sandboxId))
      .limit(1);

    if (sandbox.length > 0) {
      const roomId = `sandbox-${sandboxId}`;
      await db.insert(chatRoomsTable).values({
        id: roomId,
        sandbox_id: sandboxId,
        name: sandbox[0].name,
        description: sandbox[0].description || `Chat for ${sandbox[0].name}`,
        created_by: sandbox[0].operator,
      });
      return roomId;
    }
  }

  return room[0]?.id;
}

// POST: Join a chat room
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
    const { room_id } = body;

    if (!room_id) {
      return NextResponse.json({ error: 'room_id is required' }, { status: 400 });
    }

    // Check if user is already a participant
    const existing = await db
      .select()
      .from(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.room_id, room_id),
          eq(chatParticipantsTable.user_email, userEmail)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Add user as participant
      const participantId = `${room_id}-${userEmail}-${Date.now()}`;
      await db.insert(chatParticipantsTable).values({
        id: participantId,
        room_id,
        user_email: userEmail,
        role: userRole,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining chat room:', error);
    return NextResponse.json({ error: 'Failed to join chat room' }, { status: 500 });
  }
}
