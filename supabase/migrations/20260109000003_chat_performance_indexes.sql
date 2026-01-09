-- SynthChat Performance Optimization - Database Indexes
-- Created: January 9, 2026
-- Purpose: Add indexes to improve chat performance and reduce query times

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Index for chat_messages queries (room_id + created_at)
-- This speeds up the main messages fetch query significantly
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
  ON chat_messages(room_id, created_at DESC);

-- Index for chat_participants lookups
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_user 
  ON chat_participants(room_id, user_email);

-- Index for chat_messages sender lookups (for JOINs)
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender 
  ON chat_messages(sender_email);

-- Index for users_table email lookups (for JOINs)
CREATE INDEX IF NOT EXISTS idx_users_table_email 
  ON users_table(email);

-- ============================================================================
-- FOREIGN KEY FOR JOIN OPTIMIZATION
-- ============================================================================

-- Add foreign key constraint if it doesn't exist (for better JOIN performance)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_messages_sender_email_fkey'
  ) THEN
    ALTER TABLE chat_messages 
    ADD CONSTRAINT chat_messages_sender_email_fkey 
    FOREIGN KEY (sender_email) 
    REFERENCES users_table(email)
    ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

-- Update statistics for query planner
ANALYZE chat_messages;
ANALYZE chat_participants;
ANALYZE chat_rooms;
ANALYZE users_table;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_chat_messages_room_created IS 
  'Optimizes queries fetching messages for a specific room ordered by time';

COMMENT ON INDEX idx_chat_participants_room_user IS 
  'Speeds up participant membership checks';

COMMENT ON INDEX idx_chat_messages_sender IS 
  'Optimizes sender lookups and JOINs with users_table';

COMMENT ON INDEX idx_users_table_email IS 
  'Speeds up user lookups by email';

COMMENT ON CONSTRAINT chat_messages_sender_email_fkey ON chat_messages IS 
  'Foreign key enables efficient JOIN with users_table for sender names';

