import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import {
  chatMessagesTable,
  chatRoomsTable,
  chatParticipantsTable,
  usersTable,
} from '@/utils/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Fetch messages for a specific room
export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.roomId;
    const userEmail = user.email;

    // Verify user is a participant in this room
    const participant = await db
      .select()
      .from(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.room_id, roomId),
          eq(chatParticipantsTable.user_email, userEmail)
        )
      )
      .limit(1);

    // For Syntheverse room, allow access even if not explicitly a participant
    const room = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Auto-join Syntheverse room (sandbox_id is null) if not already a participant
    // For sandbox-based collaborative rooms, users must explicitly join
    if (!room[0].sandbox_id && participant.length === 0) {
      const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
      const userRole = isCreator ? 'creator' : isOperator ? 'operator' : 'contributor';
      const participantId = `${roomId}-${userEmail}-${Date.now()}`;
      try {
        await db.insert(chatParticipantsTable).values({
          id: participantId,
          room_id: roomId,
          user_email: userEmail,
          role: userRole,
        });
      } catch (error: any) {
        // Ignore duplicate key errors (user might have been added concurrently)
        if (!error.message?.includes('duplicate') && !error.code?.includes('23505')) {
          console.warn('Failed to auto-join Syntheverse room:', error);
        }
      }
    } else if (participant.length === 0) {
      // For sandbox-based collaborative rooms, user must be a participant
      return NextResponse.json({ 
        error: 'Not a participant in this collaborative room. Please join the room first.' 
      }, { status: 403 });
    }

    // Get limit from query params (for fetching last message)
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 200;

    // Fetch messages for this room
    const messages = await db
      .select({
        id: chatMessagesTable.id,
        room_id: chatMessagesTable.room_id,
        sender_email: chatMessagesTable.sender_email,
        sender_role: chatMessagesTable.sender_role,
        message: chatMessagesTable.message,
        created_at: chatMessagesTable.created_at,
        sender_name: usersTable.name,
      })
      .from(chatMessagesTable)
      .leftJoin(usersTable, eq(chatMessagesTable.sender_email, usersTable.email))
      .where(eq(chatMessagesTable.room_id, roomId))
      .orderBy(desc(chatMessagesTable.created_at))
      .limit(limit);

    // Get participants for this room
    const participants = await db
      .select({
        email: chatParticipantsTable.user_email,
        role: chatParticipantsTable.role,
        name: usersTable.name,
      })
      .from(chatParticipantsTable)
      .leftJoin(usersTable, eq(chatParticipantsTable.user_email, usersTable.email))
      .where(eq(chatParticipantsTable.room_id, roomId));

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      participants,
      room: room[0],
    });
  } catch (error: any) {
    // If tables don't exist, return empty array instead of 500
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      console.warn('SynthChat tables not found, returning empty array:', error.message);
      return NextResponse.json({
        messages: [],
        participants: [],
        room: null,
      });
    }
    
    console.error('Error fetching room messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      message: error.message || String(error)
    }, { status: 500 });
  }
}

// POST: Send a new message to a room
export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomId = params.roomId;
    const userEmail = user.email;
    const { isCreator, isOperator } = await getAuthenticatedUserWithRole();
    const userRole = isCreator ? 'creator' : isOperator ? 'operator' : 'contributor';

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verify user is a participant
    const participant = await db
      .select()
      .from(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.room_id, roomId),
          eq(chatParticipantsTable.user_email, userEmail)
        )
      )
      .limit(1);

    // Check if room exists and is Syntheverse (auto-join)
    const room = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Auto-join Syntheverse room (sandbox_id is null) if not already a participant
    // For sandbox-based collaborative rooms, users must explicitly join before sending messages
    if (!room[0].sandbox_id && participant.length === 0) {
      const participantId = `${roomId}-${userEmail}-${Date.now()}`;
      try {
        await db.insert(chatParticipantsTable).values({
          id: participantId,
          room_id: roomId,
          user_email: userEmail,
          role: userRole,
        });
      } catch (error: any) {
        // Ignore duplicate key errors (user might have been added concurrently)
        if (!error.message?.includes('duplicate') && !error.code?.includes('23505')) {
          console.warn('Failed to auto-join Syntheverse room:', error);
        }
      }
    } else if (participant.length === 0) {
      // For sandbox-based collaborative rooms, user must be a participant
      return NextResponse.json({ 
        error: 'Not a participant in this collaborative room. Please join the room first.' 
      }, { status: 403 });
    }

    // Generate unique ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Insert message
    await db.insert(chatMessagesTable).values({
      id: messageId,
      room_id: roomId,
      sender_email: userEmail,
      sender_role: userRole,
      message: message.trim(),
      read: false,
    });

    // Update room's updated_at
    await db
      .update(chatRoomsTable)
      .set({ updated_at: new Date() })
      .where(eq(chatRoomsTable.id, roomId));

    return NextResponse.json({ success: true, id: messageId });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
