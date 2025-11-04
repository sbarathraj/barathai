-- Create system_settings table for global configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Admin can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (auth.email() = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (auth.email() = 'jcibarathraj@gmail.com');

CREATE POLICY "Admin can insert system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (auth.email() = 'jcibarathraj@gmail.com');

-- Insert default image generation provider setting
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('image_generation_provider', 'openrouter')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();