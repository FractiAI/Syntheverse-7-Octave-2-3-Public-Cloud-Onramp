/**
 * Get specific WorkChat room details
 * GET /api/workchat/rooms/[roomId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;

    // Fetch room details
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Fetch participants
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('user_email, role')
      .eq('room_id', roomId);

    // Get participant count
    const participantCount = participants?.length || 0;

    // Check if current user is a participant
    let isConnected = participants?.some(p => p.user_email === user.email) || false;

    console.log('[WorkChat Room] User:', user.email);
    console.log('[WorkChat Room] Room:', roomId);
    console.log('[WorkChat Room] Is connected:', isConnected);

    // If not connected, auto-add them as participant
    if (!isConnected) {
      console.log('[WorkChat Room] Auto-adding user as participant');
      
      const { data: userData, error: userError } = await supabase
        .from('users_table')
        .select('role')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('[WorkChat Room] Error fetching user role:', userError);
      }

      const userRole = userData?.role || 'contributor';
      console.log('[WorkChat Room] User role:', userRole);

      const { error: addError, data: addedParticipant } = await supabase
        .from('chat_participants')
        .insert({
          room_id: roomId,
          user_email: user.email,
          role: userRole,
        })
        .select()
        .single();

      if (addError) {
        console.error('[WorkChat Room] Error adding participant:', addError);
        console.error('[WorkChat Room] Add error details:', JSON.stringify(addError, null, 2));
      } else {
        console.log('[WorkChat Room] Successfully added participant:', addedParticipant);
        isConnected = true;
      }
    }

    return NextResponse.json({
      room: {
        ...room,
        participant_count: participantCount,
        is_connected: isConnected,
        participants: participants || [],
      },
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

