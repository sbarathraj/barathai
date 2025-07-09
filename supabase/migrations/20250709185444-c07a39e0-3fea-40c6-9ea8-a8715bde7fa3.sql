
-- Enable realtime for existing tables to track changes
ALTER TABLE public.api_usage_logs REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.admin_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.admin_messages REPLICA IDENTITY FULL;
ALTER TABLE public.user_limits REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.api_usage_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_limits;

-- Create function to log API usage automatically
CREATE OR REPLACE FUNCTION log_api_usage(
  p_user_id UUID,
  p_user_email TEXT,
  p_endpoint TEXT,
  p_request_type TEXT,
  p_response_time INTEGER DEFAULT NULL,
  p_status_code INTEGER DEFAULT 200,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.api_usage_logs (
    user_id,
    user_email,
    endpoint,
    request_type,
    response_time,
    status_code,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_user_email,
    p_endpoint,
    p_request_type,
    p_response_time,
    p_status_code,
    p_metadata,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to update user usage limits
CREATE OR REPLACE FUNCTION update_user_usage(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_limits (user_id, current_usage, updated_at)
  VALUES (p_user_id, 1, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_usage = user_limits.current_usage + 1,
    updated_at = now();
END;
$$;
