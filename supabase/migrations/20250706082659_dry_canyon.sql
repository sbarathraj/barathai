/*
  # Add unique URLs to chat sessions

  1. Changes
    - Add unique_url column to chat_sessions table
    - Generate unique URLs for existing sessions
    - Make unique_url column NOT NULL
    - Add full_name column to profiles table

  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity with unique constraints
*/

-- Add full_name field to profiles table for signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Add unique_url column to existing chat_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'unique_url'
  ) THEN
    ALTER TABLE public.chat_sessions ADD COLUMN unique_url TEXT;
  END IF;
END $$;

-- Function to generate random string for unique URLs
CREATE OR REPLACE FUNCTION generate_unique_url()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing sessions that don't have unique URLs
DO $$
DECLARE
  session_record RECORD;
  new_url TEXT;
  url_exists BOOLEAN;
BEGIN
  FOR session_record IN 
    SELECT id FROM public.chat_sessions WHERE unique_url IS NULL
  LOOP
    LOOP
      new_url := generate_unique_url();
      
      -- Check if this URL already exists
      SELECT EXISTS(
        SELECT 1 FROM public.chat_sessions WHERE unique_url = new_url
      ) INTO url_exists;
      
      -- If URL doesn't exist, use it
      IF NOT url_exists THEN
        UPDATE public.chat_sessions 
        SET unique_url = new_url 
        WHERE id = session_record.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Make unique_url NOT NULL and add unique constraint
DO $$
BEGIN
  -- First make sure all records have unique_url values
  IF NOT EXISTS (
    SELECT 1 FROM public.chat_sessions WHERE unique_url IS NULL
  ) THEN
    -- Add NOT NULL constraint
    ALTER TABLE public.chat_sessions 
    ALTER COLUMN unique_url SET NOT NULL;
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'chat_sessions' 
      AND constraint_name = 'chat_sessions_unique_url_key'
    ) THEN
      ALTER TABLE public.chat_sessions 
      ADD CONSTRAINT chat_sessions_unique_url_key UNIQUE (unique_url);
    END IF;
  END IF;
END $$;

-- Clean up the function as it's no longer needed
DROP FUNCTION IF EXISTS generate_unique_url();