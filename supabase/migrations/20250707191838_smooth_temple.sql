/*
  # Database Schema Update for Chat Sessions

  1. New Tables
    - Updates `profiles` table to include `full_name` column
    - Recreates `chat_sessions` table with proper structure and unique URLs
    
  2. Security
    - Enable RLS on `chat_sessions` table
    - Add policies for authenticated users to manage their own sessions
    
  3. Data Migration
    - Safely migrates existing chat session data
    - Cleans up orphaned messages
    - Maintains referential integrity
    
  4. Performance
    - Adds indexes for optimal query performance
*/

-- Step 1: Add full_name field to profiles table for signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Step 2: Temporarily disable foreign key constraint on messages table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_session_id_fkey'
  ) THEN
    ALTER TABLE messages DROP CONSTRAINT messages_session_id_fkey;
  END IF;
END $$;

-- Step 3: Backup existing chat_sessions data if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN
    -- Create temporary backup table
    CREATE TEMP TABLE chat_sessions_backup AS 
    SELECT * FROM public.chat_sessions;
  END IF;
END $$;

-- Step 4: Drop existing chat_sessions table
DROP TABLE IF EXISTS public.chat_sessions CASCADE;

-- Step 5: Create function to generate unique URLs
CREATE OR REPLACE FUNCTION generate_unique_url() RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    substring(
      encode(gen_random_bytes(12), 'hex') || 
      extract(epoch from now())::text
    , 1, 16)
  );
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create new chat_sessions table with proper structure
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  unique_url TEXT NOT NULL UNIQUE DEFAULT generate_unique_url(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 7: Enable RLS on the chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policies for chat_sessions table
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

-- Step 9: Restore data from backup if it exists and users still exist
DO $$
DECLARE
  backup_exists BOOLEAN := FALSE;
BEGIN
  -- Check if backup table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'chat_sessions_backup'
  ) INTO backup_exists;
  
  IF backup_exists THEN
    -- Only restore sessions for users that still exist in auth.users
    INSERT INTO public.chat_sessions (id, user_id, title, unique_url, created_at, updated_at)
    SELECT 
      b.id,
      b.user_id,
      COALESCE(b.title, 'New Chat'),
      COALESCE(
        CASE 
          WHEN b.unique_url IS NOT NULL AND b.unique_url != '' 
          THEN b.unique_url 
          ELSE generate_unique_url() 
        END,
        generate_unique_url()
      ),
      COALESCE(b.created_at, now()),
      COALESCE(b.updated_at, now())
    FROM chat_sessions_backup b
    WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = b.user_id)
    ON CONFLICT (unique_url) DO UPDATE SET
      unique_url = generate_unique_url();
  END IF;
END $$;

-- Step 10: Clean up orphaned messages (messages without valid session_id)
DELETE FROM messages 
WHERE session_id NOT IN (SELECT id FROM public.chat_sessions);

-- Step 11: Add foreign key constraint back to messages table
ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;

-- Step 12: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_unique_url ON public.chat_sessions(unique_url);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Step 13: Update existing messages table to ensure user_id foreign key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_user_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 14: Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();