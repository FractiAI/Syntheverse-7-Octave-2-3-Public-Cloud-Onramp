-- Migration: Add chat_messages table for contributor-operator communication
-- Created: 2025-01-XX

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  contributor_email TEXT NOT NULL,
  operator_email TEXT,
  message TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('contributor', 'operator', 'creator')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_messages_contributor_email ON public.chat_messages(contributor_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_operator_email ON public.chat_messages(operator_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON public.chat_messages(read) WHERE read = FALSE;

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Contributors can read their own messages
CREATE POLICY "Contributors can read own messages"
  ON public.chat_messages
  FOR SELECT
  USING (
    contributor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Operators and Creators can read all messages
CREATE POLICY "Operators and creators can read all messages"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_table
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('operator', 'creator')
      AND deleted_at IS NULL
    )
  );

-- Contributors can insert their own messages
CREATE POLICY "Contributors can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    contributor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND sender_role = 'contributor'
  );

-- Operators and Creators can insert messages
CREATE POLICY "Operators and creators can send messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_table
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('operator', 'creator')
      AND deleted_at IS NULL
    )
    AND sender_role IN ('operator', 'creator')
  );

-- Service role has full access
CREATE POLICY "Service role full access to chat_messages"
  ON public.chat_messages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

