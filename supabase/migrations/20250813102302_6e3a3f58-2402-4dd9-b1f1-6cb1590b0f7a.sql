-- Create image_generation_logs table for tracking Hugging Face API usage
CREATE TABLE public.image_generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  api_provider TEXT NOT NULL DEFAULT 'huggingface',
  model_name TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('text-to-image', 'image-to-image', 'inpainting')),
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  model_id TEXT NOT NULL DEFAULT 'unknown',
  parameters JSONB DEFAULT '{}',
  image_metadata JSONB DEFAULT '{}',
  processing_time_ms INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  image_size_bytes INTEGER,
  has_source_image BOOLEAN DEFAULT false,
  has_mask BOOLEAN DEFAULT false,
  guidance_scale NUMERIC DEFAULT 7.5,
  num_inference_steps INTEGER DEFAULT 20,
  seed INTEGER,
  width INTEGER DEFAULT 512,
  height INTEGER DEFAULT 512,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_generation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for image generation logs
CREATE POLICY "Users can view their own image generation logs" 
ON public.image_generation_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image generation logs" 
ON public.image_generation_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert image generation logs" 
ON public.image_generation_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can view all image generation logs" 
ON public.image_generation_logs 
FOR ALL 
USING (auth.email() = 'jcibarathraj@gmail.com');