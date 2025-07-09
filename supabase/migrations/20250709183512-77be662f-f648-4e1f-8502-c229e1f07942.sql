
-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'prompt' or 'voice'
  response_time INTEGER, -- in milliseconds
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_email TEXT,
  metadata JSONB
);

-- Create admin alerts table
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id)
);

-- Create admin messages table
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id),
  from_user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES auth.users(id)
);

-- Create user limits table
CREATE TABLE IF NOT EXISTS public.user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  usage_limit INTEGER DEFAULT 100,
  current_usage INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all admin tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies
CREATE POLICY "Admin can manage settings" ON public.admin_settings
  FOR ALL USING (auth.jwt() ->> 'email' = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can view all logs" ON public.api_usage_logs
  FOR ALL USING (auth.jwt() ->> 'email' = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can manage alerts" ON public.admin_alerts
  FOR ALL USING (auth.jwt() ->> 'email' = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can manage messages" ON public.admin_messages
  FOR ALL USING (auth.jwt() ->> 'email' = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can manage user limits" ON public.user_limits
  FOR ALL USING (auth.jwt() ->> 'email' = 'jcibarathraj@gmail.com');

-- Users can insert their own API usage logs
CREATE POLICY "Users can log their API usage" ON public.api_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can send messages to admin
CREATE POLICY "Users can send admin messages" ON public.admin_messages
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('voice_input_enabled', 'true'),
  ('voice_output_enabled', 'true'),
  ('chat_history_enabled', 'true')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to get user count
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM auth.users;
$$;

-- Create function to get API usage counts
CREATE OR REPLACE FUNCTION get_api_usage_count(request_type_filter TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.api_usage_logs 
  WHERE request_type_filter IS NULL OR request_type = request_type_filter;
$$;
