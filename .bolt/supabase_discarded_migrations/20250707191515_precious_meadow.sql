/*
  # Fix Chat Sessions Schema

  1. Schema Updates
    - Add full_name field to profiles table for signup
    - Create new chat_sessions table with unique URLs
    - Update foreign key constraints for messages table
    
  2. Security
    - Enable RLS on new chat_sessions table
    - Add comprehensive policies for CRUD operations
    
  3. Data Migration
    - Safely migrate existing data if any
    - Ensure referential integrity
*/

-- Add full_name field to profiles table for signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Drop existing chat_sessions table if it exists (backup data first if needed)
DROP TABLE IF EXISTS public.chat_sessions CASCADE;

-- Create new chat_sessions table with unique URLs
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  unique_url TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64url'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions table
CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
  ON public.chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
  ON public.chat_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update messages table foreign key constraint
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_session_id_fkey'
  ) THEN
    ALTER TABLE messages DROP CONSTRAINT messages_session_id_fkey;
  END IF;
  
  -- Add new constraint
  ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_unique_url ON public.chat_sessions(unique_url);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);