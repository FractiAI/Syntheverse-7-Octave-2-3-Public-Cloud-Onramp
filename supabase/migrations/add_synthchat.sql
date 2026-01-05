-- Migration: Add SynthChat collaborative sandbox chat system
-- Created: 2025-01-XX

-- Drop old chat_messages table if it exists (migration from simple chat)
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT, -- null = syntheverse (default), otherwise enterprise_sandboxes.id
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chat_messages table (sandbox-based collaborative chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('contributor', 'operator', 'creator')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chat_participants table (tracks who's in which room)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('contributor', 'operator', 'creator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_email)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_rooms_sandbox_id ON public.chat_rooms(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON public.chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_email ON public.chat_participants(user_email);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
-- Everyone can read rooms (to see available sandboxes)
CREATE POLICY "Everyone can read chat rooms"
  ON public.chat_rooms
  FOR SELECT
  USING (true);

-- Only operators/creators can create rooms (for enterprise sandboxes)
CREATE POLICY "Operators and creators can create rooms"
  ON public.chat_rooms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_table
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('operator', 'creator')
      AND deleted_at IS NULL
    )
  );

-- RLS Policies for chat_messages
-- Participants can read messages in their rooms
CREATE POLICY "Participants can read room messages"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    -- Syntheverse room (sandbox_id is null) - everyone can read
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND chat_rooms.sandbox_id IS NULL
    )
  );

-- Participants can send messages in their rooms
CREATE POLICY "Participants can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    -- Syntheverse room - everyone can send
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND chat_rooms.sandbox_id IS NULL
    )
  );

-- RLS Policies for chat_participants
-- Users can see participants in rooms they're in
CREATE POLICY "Users can see room participants"
  ON public.chat_participants
  FOR SELECT
  USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.chat_participants cp2
      WHERE cp2.room_id = chat_participants.room_id
      AND cp2.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Users can join rooms (auto-join for Syntheverse)
CREATE POLICY "Users can join rooms"
  ON public.chat_participants
  FOR INSERT
  WITH CHECK (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role has full access
CREATE POLICY "Service role full access to chat_rooms"
  ON public.chat_rooms
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to chat_messages"
  ON public.chat_messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to chat_participants"
  ON public.chat_participants
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create default Syntheverse room
INSERT INTO public.chat_rooms (id, sandbox_id, name, description, created_by)
VALUES ('syntheverse-main', NULL, 'Syntheverse', 'Main Syntheverse Protocol collaborative chat', 'system')
ON CONFLICT (id) DO NOTHING;

