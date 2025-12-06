import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ImageProvider = 'openrouter' | 'freepik' | 'deapi';

interface ProviderOption {
  id: ImageProvider;
  name: string;
  description: string;
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Google Gemini)',
    description: 'Using OpenRouter with Google Gemini Flash Image model'
  },
  {
    id: 'freepik',
    name: 'Freepik Mystic',
    description: 'Using Freepik AI with widescreen 16:9 aspect ratio'
  },
  {
    id: 'deapi',
    name: 'DeAPI (ZImageTurbo)',
    description: 'Using DeAPI with ZImageTurbo INT8 model - Fast & High Quality'
  }
];

export const ImageProviderToggle = () => {
  const [provider, setProvider] = useState<ImageProvider>('openrouter');
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
      setProvider(data?.setting_value as ImageProvider || 'openrouter');
    } catch (error) {
      console.error('Error fetching provider setting:', error);
      toast.error('Failed to load provider setting');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (newProvider: ImageProvider) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: newProvider })
        .eq('setting_key', 'image_generation_provider');

      if (error) throw error;

      setProvider(newProvider);
      const providerName = PROVIDER_OPTIONS.find(p => p.id === newProvider)?.name || newProvider;
      toast.success(`Image provider switched to ${providerName}`);
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('Failed to update provider');
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const currentProvider = PROVIDER_OPTIONS.find(p => p.id === provider);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Image Generation Provider</h3>
          <p className="text-sm text-muted-foreground">
            Choose which AI provider to use for image generation across the entire platform
          </p>
        </div>
        
        <RadioGroup
          value={provider}
          onValueChange={(value) => handleProviderChange(value as ImageProvider)}
          className="space-y-3"
        >
          {PROVIDER_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                provider === option.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="text-sm text-muted-foreground pt-2 border-t">
          <p className="font-medium">Current: {currentProvider?.name}</p>
        </div>
      </div>
    </Card>
  );
};
