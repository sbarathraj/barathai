
-- Add name field to profiles table for signup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create a new table for chat sessions with unique URLs
CREATE TABLE IF NOT EXISTS public.chat_sessions_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  unique_url TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64url'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.chat_sessions_new ENABLE ROW LEVEL SECURITY;

-- Create policies for the new table
CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions_new 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
  ON public.chat_sessions_new 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions_new 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
  ON public.chat_sessions_new 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update messages table to reference the new chat sessions table
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_session_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES chat_sessions_new(id) ON DELETE CASCADE;
