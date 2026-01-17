/**
 * Get messages for a specific WorkChat room
 * GET /api/workchat/rooms/[roomId]/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  console.log('[WorkChat Messages] === REQUEST START ===');
  console.log('[WorkChat Messages] Request URL:', request.url);
  
  try {
    const supabase = createClient();
    
    console.log('[WorkChat Messages] Supabase client created');
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[WorkChat Messages] Auth check result:', { 
      hasUser: !!user, 
      email: user?.email,
      authError: authError?.message 
    });

    if (!user?.email) {
      console.log('[WorkChat Messages] Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;
    console.log('[WorkChat Messages] Processing room:', roomId);

    // Check if room exists first
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is a participant of this room
    const { data: participant, error: participantCheckError } = await supabase
      .from('chat_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_email', user.email)
      .single();

    console.log('[WorkChat Messages] User:', user.email);
    console.log('[WorkChat Messages] Room:', roomId);
    console.log('[WorkChat Messages] Is participant:', !!participant);
    console.log('[WorkChat Messages] Participant check error:', participantCheckError);

    // If not a participant, auto-add them (room is accessible to authenticated users)
    if (!participant) {
      console.log('[WorkChat Messages] Auto-adding user as participant');
      
      // Get user role from users_table
      const { data: userData, error: userError } = await supabase
        .from('users_table')
        .select('role')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('[WorkChat Messages] Error fetching user role:', userError);
      }

      const userRole = userData?.role || 'contributor';
      console.log('[WorkChat Messages] User role:', userRole);

      // Add user as participant
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
        console.error('[WorkChat Messages] Error adding participant:', addError);
        console.error('[WorkChat Messages] Add error details:', JSON.stringify(addError, null, 2));
        // Continue anyway - they might still be able to view
      } else {
        console.log('[WorkChat Messages] Successfully added participant:', addedParticipant);
      }
    }

    // Fetch messages with sender information (optimized with JOIN to reduce queries)
    // Changed from 500 to 50 for faster load and reduced bandwidth
    const { data: rawMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        room_id,
        sender_email,
        sender_role,
        message,
        image_url,
        file_url,
        file_name,
        created_at,
        users_table!chat_messages_sender_email_fkey (
          name
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50); // Optimized: reduced from 500 to 50 messages

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Transform messages to include sender_name from the join
    const messagesWithNames = rawMessages?.map(msg => ({
      id: msg.id,
      room_id: msg.room_id,
      sender_email: msg.sender_email,
      sender_role: msg.sender_role,
      message: msg.message,
      image_url: msg.image_url,
      file_url: msg.file_url,
      file_name: msg.file_name,
      created_at: msg.created_at,
      sender_name: (msg.users_table as any)?.name || null,
    }));

    return NextResponse.json({
      messages: messagesWithNames || [],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
