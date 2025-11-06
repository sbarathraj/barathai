-- Add reasoning support columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS usage JSONB;