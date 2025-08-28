import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Download, Upload, Palette, Image as ImageIcon, Sparkles, Shuffle, Info } from 'lucide-react';

const POPULAR_MODELS = [
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL',
    description: 'High-quality 1024x1024 image generation',
    category: 'SDXL',
    supportsNegative: true
  },
  {
    id: 'stabilityai/stable-diffusion-2-1',
    name: 'Stable Diffusion v2.1',
    description: 'Improved image generation model',
    category: 'SD 2.x',
    supportsNegative: true
  },
  {
    id: 'runwayml/stable-diffusion-v1-5',
    name: 'Stable Diffusion v1.5',
    description: 'Classic and reliable image generation',
    category: 'SD 1.x',
    supportsNegative: true
  },
  {
    id: 'kandinsky-community/kandinsky-2-2-decoder',
    name: 'Kandinsky 2.2',
    description: 'Multilingual text-to-image model',
    category: 'Kandinsky',
    supportsNegative: true
  },
  {
    id: 'prompthero/openjourney-v4',
    name: 'OpenJourney v4',
    description: 'Artistic and creative image generation',
    category: 'Community',
    supportsNegative: true
  },
  {
    id: 'wavymulder/Analog-Diffusion',
    name: 'Analog Diffusion',
    description: 'Vintage photography style',
    category: 'Community',
    supportsNegative: true
  }
];

const WORKFLOWS = [
  { id: 'text-to-image', name: 'Text to Image', icon: Sparkles },
  { id: 'image-to-image', name: 'Image to Image', icon: ImageIcon },
  { id: 'inpainting', name: 'Inpainting', icon: Palette },
];

interface GenerationParams {
  workflow: string;
  model: string;
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
  seed: number | null;
  n: number;
  strength: number;
  seed_image: string | null;
  mask_image: string | null;
}

const ImageGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const [params, setParams] = useState<GenerationParams>({
    workflow: 'text-to-image',
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: '',
    negative_prompt: '',
    width: 1024,
    height: 1024,
    num_inference_steps: 20,
    guidance_scale: 7.5,
    seed: null,
    n: 1,
    strength: 0.7,
    seed_image: null,
    mask_image: null
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
  };

  const handleFileUpload = async (file: File, type: 'seed' | 'mask') => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSeedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await handleFileUpload(file, 'seed');
      setParams(prev => ({ ...prev, seed_image: dataUrl }));
      toast.success('Seed image uploaded successfully');
    }
  };

  const handleMaskImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await handleFileUpload(file, 'mask');
      setParams(prev => ({ ...prev, mask_image: dataUrl }));
      toast.success('Mask image uploaded successfully');
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setParams(prev => ({ ...prev, seed: randomSeed }));
  };

  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Validate workflow requirements
    if (params.workflow === 'image-to-image' && !params.seed_image) {
      toast.error('Please upload a seed image for Image-to-Image generation');
      return;
    }
    if (params.workflow === 'inpainting' && (!params.seed_image || !params.mask_image)) {
      toast.error('Please upload both seed and mask images for Inpainting');
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('huggingface-generate', {
        body: params,
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.success && response.data?.image) {
        setGeneratedImages([response.data.image]);
        toast.success('Image generated successfully!');
      } else {
        throw new Error(response.data?.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedModel = POPULAR_MODELS.find(m => m.id === params.model);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Image Generation</h1>
          <p className="text-muted-foreground">
            Generate stunning images using Hugging Face's powerful AI models
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Workflow Selection */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Workflow</Label>
                  <Tabs value={params.workflow} onValueChange={(value) => setParams(prev => ({ ...prev, workflow: value }))}>
                    <TabsList className="grid w-full grid-cols-3">
                      {WORKFLOWS.map((workflow) => {
                        const Icon = workflow.icon;
                        return (
                          <TabsTrigger key={workflow.id} value={workflow.id} className="flex items-center gap-1">
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{workflow.name}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Model Selection */}
                <div>
                  <Label htmlFor="model" className="text-sm font-medium mb-2 block">Model</Label>
                  <Select value={params.model} onValueChange={(value) => setParams(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModel && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{selectedModel.category}</Badge>
                      {selectedModel.supportsNegative && (
                        <Badge variant="outline">Negative Prompts</Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Prompt */}
                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A magical forest with sparkling lights, fantasy art..."
                    value={params.prompt}
                    onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Negative Prompt */}
                {selectedModel?.supportsNegative && (
                  <div>
                    <Label htmlFor="negative_prompt" className="text-sm font-medium mb-2 block">
                      Negative Prompt
                      <span className="text-muted-foreground ml-1">(optional)</span>
                    </Label>
                    <Textarea
                      id="negative_prompt"
                      placeholder="low quality, blurry, distorted..."
                      value={params.negative_prompt}
                      onChange={(e) => setParams(prev => ({ ...prev, negative_prompt: e.target.value }))}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                )}

                {/* Image Uploads for I2I and Inpainting */}
                {(params.workflow === 'image-to-image' || params.workflow === 'inpainting') && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Seed Image</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('seed-image-input')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </Button>
                        {params.seed_image && (
                          <span className="text-sm text-muted-foreground">Image uploaded</span>
                        )}
                      </div>
                      <input
                        id="seed-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleSeedImageUpload}
                        className="hidden"
                      />
                    </div>

                    {params.workflow === 'inpainting' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Mask Image</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('mask-image-input')?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Mask
                          </Button>
                          {params.mask_image && (
                            <span className="text-sm text-muted-foreground">Mask uploaded</span>
                          )}
                        </div>
                        <input
                          id="mask-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleMaskImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Parameters */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Advanced Parameters</Label>
                  
                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Width</Label>
                      <Select value={params.width.toString()} onValueChange={(value) => setParams(prev => ({ ...prev, width: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512px</SelectItem>
                          <SelectItem value="768">768px</SelectItem>
                          <SelectItem value="1024">1024px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Height</Label>
                      <Select value={params.height.toString()} onValueChange={(value) => setParams(prev => ({ ...prev, height: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512px</SelectItem>
                          <SelectItem value="768">768px</SelectItem>
                          <SelectItem value="1024">1024px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Inference Steps: {params.num_inference_steps}
                    </Label>
                    <Slider
                      value={[params.num_inference_steps]}
                      onValueChange={([value]) => setParams(prev => ({ ...prev, num_inference_steps: value }))}
                      min={10}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Guidance Scale */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Guidance Scale: {params.guidance_scale}
                    </Label>
                    <Slider
                      value={[params.guidance_scale]}
                      onValueChange={([value]) => setParams(prev => ({ ...prev, guidance_scale: value }))}
                      min={1}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Seed */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Seed (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Random"
                        value={params.seed || ''}
                        onChange={(e) => setParams(prev => ({ ...prev, seed: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateRandomSeed}
                      >
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Strength for I2I */}
                  {params.workflow === 'image-to-image' && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Strength: {params.strength}
                      </Label>
                      <Slider
                        value={[params.strength]}
                        onValueChange={([value]) => setParams(prev => ({ ...prev, strength: value }))}
                        min={0.1}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !params.prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Generated Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Generating your image...</p>
                    </div>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Generated ${index + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(imageUrl, index)}
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Generated images will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;