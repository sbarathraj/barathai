
-- Add unique_url column to existing chat_sessions table
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS unique_url TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64url');

-- Update existing sessions that don't have unique URLs
UPDATE public.chat_sessions 
SET unique_url = encode(gen_random_bytes(16), 'base64url') 
WHERE unique_url IS NULL;

-- Make unique_url NOT NULL after updating existing records
ALTER TABLE public.chat_sessions 
ALTER COLUMN unique_url SET NOT NULL;
