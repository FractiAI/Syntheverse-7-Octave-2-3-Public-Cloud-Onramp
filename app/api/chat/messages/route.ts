import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { chatMessagesTable, usersTable } from '@/utils/db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';

export const dynamic = 'force-dynamic';

// GET: Fetch messages for the current user
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

    // Get user's role from database
    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail))
      .limit(1);

    const userRole = userResult[0]?.role || 'user';

    // Fetch messages
    // Contributors see their own messages
    // Operators/Creators see all messages
    let messages;
    if (isOperator || isCreator) {
      // Operators/Creators see all messages
      messages = await db
        .select()
        .from(chatMessagesTable)
        .orderBy(desc(chatMessagesTable.created_at))
        .limit(100);
    } else {
      // Contributors see only their own messages
      messages = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.contributor_email, userEmail))
        .orderBy(desc(chatMessagesTable.created_at))
        .limit(100);
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST: Send a new message
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

    const body = await request.json();
    const { message, operator_email } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate unique ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (isOperator || isCreator) {
      // Operator/Creator replying to a contributor
      if (!operator_email) {
        return NextResponse.json(
          { error: 'operator_email is required for operator messages' },
          { status: 400 }
        );
      }

      await db.insert(chatMessagesTable).values({
        id: messageId,
        contributor_email: operator_email,
        operator_email: userEmail,
        message: message.trim(),
        sender_role: isCreator ? 'creator' : 'operator',
        read: false,
      });
    } else {
      // Contributor sending a message
      await db.insert(chatMessagesTable).values({
        id: messageId,
        contributor_email: userEmail,
        operator_email: null,
        message: message.trim(),
        sender_role: 'contributor',
        read: false,
      });
    }

    return NextResponse.json({ success: true, id: messageId });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

