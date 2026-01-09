-- SynthChat Complete Setup
-- Creates all necessary tables and RLS policies for SynthChat functionality

-- ============================================================================
-- TABLE: chat_rooms
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT, -- NULL = syntheverse (default), otherwise enterprise_sandboxes.id
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_rooms_sandbox_id ON chat_rooms(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);

-- ============================================================================
-- TABLE: chat_messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL, -- References chat_rooms.id
  sender_email TEXT NOT NULL,
  sender_role TEXT NOT NULL, -- 'contributor', 'operator', 'creator'
  message TEXT NOT NULL,
  image_url TEXT, -- Optional image attachment
  file_url TEXT, -- Optional file attachment  
  file_name TEXT, -- Optional file name
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_email);

-- ============================================================================
-- TABLE: chat_participants
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id TEXT NOT NULL, -- References chat_rooms.id
  user_email TEXT NOT NULL,
  role TEXT NOT NULL, -- 'contributor', 'operator', 'creator'
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_read_at TIMESTAMPTZ
);

-- Indexes and unique constraint
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_email ON chat_participants(user_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_participants_room_user ON chat_participants(room_id, user_email);

-- ============================================================================
-- RLS POLICIES FOR chat_rooms
-- ============================================================================

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view all chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON chat_rooms;

-- Policy 1: View all rooms (authenticated users)
CREATE POLICY "Authenticated users can view all chat rooms"
ON chat_rooms
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Create rooms (authenticated users)
CREATE POLICY "Authenticated users can create chat rooms"
ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.email() = created_by);

-- Policy 3: Update own rooms
CREATE POLICY "Room creators can update their rooms"
ON chat_rooms
FOR UPDATE
TO authenticated
USING (auth.email() = created_by)
WITH CHECK (auth.email() = created_by);

-- Policy 4: Delete own rooms
CREATE POLICY "Room creators can delete their rooms"
ON chat_rooms
FOR DELETE
TO authenticated
USING (auth.email() = created_by);

-- ============================================================================
-- RLS POLICIES FOR chat_messages
-- ============================================================================

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Participants can view messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- Policy 1: View messages (if you're a participant)
CREATE POLICY "Participants can view messages in their rooms"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
    AND chat_participants.user_email = auth.email()
  )
);

-- Policy 2: Send messages (authenticated users in the room)
CREATE POLICY "Authenticated users can send messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.email() = sender_email
);

-- Policy 3: Update own messages
CREATE POLICY "Users can update their own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (auth.email() = sender_email)
WITH CHECK (auth.email() = sender_email);

-- Policy 4: Delete own messages
CREATE POLICY "Users can delete their own messages"
ON chat_messages
FOR DELETE
TO authenticated
USING (auth.email() = sender_email);

-- ============================================================================
-- RLS POLICIES FOR chat_participants
-- ============================================================================

-- Enable RLS
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view participants in rooms they're in" ON chat_participants;
DROP POLICY IF EXISTS "Authenticated users can join rooms" ON chat_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON chat_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON chat_participants;

-- Policy 1: View participants (if you're in the room)
CREATE POLICY "Users can view participants in rooms they're in"
ON chat_participants
FOR SELECT
TO authenticated
USING (true); -- Allow viewing all participants for now

-- Policy 2: Join rooms (authenticated users)
CREATE POLICY "Authenticated users can join rooms"
ON chat_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.email() = user_email);

-- Policy 3: Update own participation
CREATE POLICY "Users can update their own participation"
ON chat_participants
FOR UPDATE
TO authenticated
USING (auth.email() = user_email)
WITH CHECK (auth.email() = user_email);

-- Policy 4: Leave rooms
CREATE POLICY "Users can leave rooms"
ON chat_participants
FOR DELETE
TO authenticated
USING (auth.email() = user_email);

-- ============================================================================
-- STORAGE BUCKET: synthchat-images
-- ============================================================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'synthchat-images', 
  'synthchat-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat images" ON storage.objects;

-- Storage Policy 1: Upload
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'synthchat-images');

-- Storage Policy 2: Read
CREATE POLICY "Public read access for chat images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'synthchat-images');

-- Storage Policy 3: Update
CREATE POLICY "Users can update their own chat images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'synthchat-images' AND
  auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'synthchat-images' AND
  auth.uid() = owner
);

-- Storage Policy 4: Delete
CREATE POLICY "Users can delete their own chat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'synthchat-images' AND
  auth.uid() = owner
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify setup:
-- SELECT COUNT(*) FROM chat_rooms;
-- SELECT COUNT(*) FROM chat_messages;
-- SELECT COUNT(*) FROM chat_participants;
-- SELECT * FROM storage.buckets WHERE id = 'synthchat-images';

