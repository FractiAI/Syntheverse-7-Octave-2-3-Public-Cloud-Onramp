import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { chatParticipantsTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST: Leave a chat room
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
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

    // Remove user from participants
    await db
      .delete(chatParticipantsTable)
      .where(
        and(
          eq(chatParticipantsTable.room_id, roomId),
          eq(chatParticipantsTable.user_email, userEmail)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    return NextResponse.json(
      { error: 'Failed to leave chat room' },
      { status: 500 }
    );
  }
}

