/**
 * Get messages for a specific SynthChat room
 * GET /api/synthchat/rooms/[roomId]/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  console.log('[SynthChat Messages] === REQUEST START ===');
  console.log('[SynthChat Messages] Request URL:', request.url);
  console.log('[SynthChat Messages] Params:', params);
  
  try {
    const supabase = createClient();
    
    console.log('[SynthChat Messages] Supabase client created');
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[SynthChat Messages] Auth check result:', { 
      hasUser: !!user, 
      email: user?.email,
      authError: authError?.message 
    });

    if (!user?.email) {
      console.log('[SynthChat Messages] Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = params;
    console.log('[SynthChat Messages] Processing room:', roomId);

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

    console.log('[SynthChat Messages] User:', user.email);
    console.log('[SynthChat Messages] Room:', roomId);
    console.log('[SynthChat Messages] Is participant:', !!participant);
    console.log('[SynthChat Messages] Participant check error:', participantCheckError);

    // If not a participant, auto-add them (room is accessible to authenticated users)
    if (!participant) {
      console.log('[SynthChat Messages] Auto-adding user as participant');
      
      // Get user role from users_table
      const { data: userData, error: userError } = await supabase
        .from('users_table')
        .select('role')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('[SynthChat Messages] Error fetching user role:', userError);
      }

      const userRole = userData?.role || 'contributor';
      console.log('[SynthChat Messages] User role:', userRole);

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
        console.error('[SynthChat Messages] Error adding participant:', addError);
        console.error('[SynthChat Messages] Add error details:', JSON.stringify(addError, null, 2));
        // Continue anyway - they might still be able to view
      } else {
        console.log('[SynthChat Messages] Successfully added participant:', addedParticipant);
      }
    }

    // Fetch messages with sender information
    const { data: messages, error: messagesError } = await supabase
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
        created_at
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(500); // Limit to last 500 messages

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Get sender names from users_table
    const senderEmails = [...new Set(messages?.map(m => m.sender_email) || [])];
    const { data: users } = await supabase
      .from('users_table')
      .select('email, name')
      .in('email', senderEmails);

    // Map sender names to messages
    const messagesWithNames = messages?.map(msg => ({
      ...msg,
      sender_name: users?.find(u => u.email === msg.sender_email)?.name || null,
    }));

    return NextResponse.json({
      messages: messagesWithNames || [],
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
