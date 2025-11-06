-- Add reasoning support to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reasoning JSONB,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS usage JSONB;

-- Add index for reasoning queries
CREATE INDEX IF NOT EXISTS idx_messages_reasoning 
ON public.messages USING GIN (reasoning) 
WHERE reasoning IS NOT NULL;

-- Add index for model queries
CREATE INDEX IF NOT EXISTS idx_messages_model 
ON public.messages (model) 
WHERE model IS NOT NULL;

-- Update RLS policies to include new columns
-- (Existing policies will automatically cover new columns)

-- Add comment for documentation
COMMENT ON COLUMN public.messages.reasoning IS 'JSON data containing AI reasoning process and details';
COMMENT ON COLUMN public.messages.model IS 'AI model used to generate the response';
COMMENT ON COLUMN public.messages.usage IS 'Token usage and cost information from API response';