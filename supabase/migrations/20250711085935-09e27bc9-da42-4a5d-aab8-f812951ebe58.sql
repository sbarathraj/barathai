
-- Add tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'banned'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update modified_at
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modified_at ON public.profiles;
CREATE TRIGGER update_profiles_modified_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at_column();

-- Create comprehensive API usage logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  api_name TEXT NOT NULL CHECK (api_name IN ('API_1', 'API_2', 'OpenRouter_API_1', 'OpenRouter_API_2')),
  endpoint_hit TEXT NOT NULL,
  request_method TEXT DEFAULT 'POST',
  response_time INTEGER, -- in milliseconds
  status_code INTEGER DEFAULT 200,
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on api_usage_logs
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_usage_logs (admin can see all, users can see their own)
CREATE POLICY "Admin can view all API logs" ON public.api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'jcibarathraj@gmail.com'
    )
  );

CREATE POLICY "Users can view their own API logs" ON public.api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to log API usage
CREATE OR REPLACE FUNCTION public.log_api_usage(
  p_user_id UUID,
  p_user_email TEXT,
  p_api_name TEXT,
  p_endpoint_hit TEXT,
  p_request_method TEXT DEFAULT 'POST',
  p_response_time INTEGER DEFAULT NULL,
  p_status_code INTEGER DEFAULT 200,
  p_request_payload JSONB DEFAULT NULL,
  p_response_payload JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.api_usage_logs (
    user_id, user_email, api_name, endpoint_hit, request_method,
    response_time, status_code, request_payload, response_payload,
    error_message, ip_address, user_agent, created_at
  ) VALUES (
    p_user_id, p_user_email, p_api_name, p_endpoint_hit, p_request_method,
    p_response_time, p_status_code, p_request_payload, p_response_payload,
    p_error_message, p_ip_address, p_user_agent, now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to update user last login
CREATE OR REPLACE FUNCTION public.update_user_last_login(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login = now(), modified_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Enable realtime for the new table
ALTER TABLE public.api_usage_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.api_usage_logs;
