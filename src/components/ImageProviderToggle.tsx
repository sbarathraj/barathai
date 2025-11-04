import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export const ImageProviderToggle = () => {
  const [provider, setProvider] = useState<'openrouter' | 'freepik'>('openrouter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentProvider();
  }, []);

  const fetchCurrentProvider = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'image_generation_provider')
        .single();

      if (error) throw error;
      setProvider(data?.setting_value as 'openrouter' | 'freepik' || 'openrouter');
    } catch (error) {
      console.error('Error fetching provider setting:', error);
      toast.error('Failed to load provider setting');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    const newProvider = checked ? 'freepik' : 'openrouter';
    
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: newProvider })
        .eq('setting_key', 'image_generation_provider');

      if (error) throw error;

      setProvider(newProvider);
      toast.success(`Image provider switched to ${newProvider === 'freepik' ? 'Freepik' : 'OpenRouter'}`);
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('Failed to update provider');
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Image Generation Provider</h3>
          <p className="text-sm text-muted-foreground">
            Choose which AI provider to use for image generation across the entire platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Label htmlFor="provider-toggle" className="text-base">
            {provider === 'openrouter' ? 'OpenRouter' : 'Freepik'}
          </Label>
          <Switch
            id="provider-toggle"
            checked={provider === 'freepik'}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Current: {provider === 'freepik' ? 'Freepik Mystic' : 'OpenRouter (Google Gemini)'}</p>
          <p className="text-xs">
            {provider === 'freepik' 
              ? 'Using Freepik AI with widescreen 16:9 aspect ratio' 
              : 'Using OpenRouter with Google Gemini Flash Image model'}
          </p>
        </div>
      </div>
    </Card>
  );
};
