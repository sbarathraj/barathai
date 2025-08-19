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
    id: 'runware:101@1',
    name: 'FLUX.1 Dev',
    description: 'High-quality, fast image generation',
    category: 'FLUX',
    supportsNegative: false
  },
  {
    id: 'runware:100@1',
    name: 'FLUX.1 Schnell',
    description: 'Ultra-fast image generation',
    category: 'FLUX',
    supportsNegative: false
  },
  {
    id: 'civitai:139562@297320',
    name: 'Realistic Vision',
    description: 'Photorealistic image generation',
    category: 'SDXL',
    supportsNegative: true
  },
  {
    id: 'civitai:25694@143906',
    name: 'DreamShaper',
    description: 'Creative and artistic generation',
    category: 'SD 1.5',
    supportsNegative: true
  }
];

const WORKFLOWS = [
  { id: 'text-to-image', name: 'Text to Image', icon: Sparkles },
  { id: 'image-to-image', name: 'Image to Image', icon: ImageIcon },
  { id: 'inpainting', name: 'Inpainting', icon: Palette },
  { id: 'outpainting', name: 'Outpainting', icon: Upload }
];

export const ImageGeneration: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(POPULAR_MODELS[0].id);
  const [workflow, setWorkflow] = useState<'text-to-image' | 'image-to-image' | 'inpainting' | 'outpainting'>('text-to-image');
  const [guidanceScale, setGuidanceScale] = useState([7.5]);
  const [steps, setSteps] = useState([28]);
  const [seed, setSeed] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [strength, setStrength] = useState([0.7]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [outpaintSettings, setOutpaintSettings] = useState({ top: 128, bottom: 128, left: 64, right: 64 });
  const [numberResults, setNumberResults] = useState(1);
  const [nsfw, setNsfw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const handleImageUpload = (file: File, type: 'source' | 'mask') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'source') {
        setSourceImage(result);
      } else {
        setMaskImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 4294967295).toString());
  };

  const validateDimensions = (width: number, height: number) => {
    if (width < 128 || width > 2048 || width % 64 !== 0) {
      toast.error('Width must be between 128-2048 and multiple of 64');
      return false;
    }
    if (height < 128 || height > 2048 || height % 64 !== 0) {
      toast.error('Height must be between 128-2048 and multiple of 64');
      return false;
    }
    return true;
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!validateDimensions(width, height)) {
      return;
    }

    if (workflow === 'image-to-image' && !sourceImage) {
      toast.error('Please upload a source image for image-to-image generation');
      return;
    }

    if (workflow === 'inpainting' && (!sourceImage || !maskImage)) {
      toast.error('Please upload both source and mask images for inpainting');
      return;
    }

    if (workflow === 'outpainting' && !sourceImage) {
      toast.error('Please upload a source image for outpainting');
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      const requestBody: any = {
        workflow,
        model: selectedModel,
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        num_inference_steps: steps[0],
        guidance_scale: guidanceScale[0],
        seed: seed ? parseInt(seed) : null,
        n: numberResults,
        nsfw_check: nsfw
      };

      if (workflow === 'image-to-image') {
        requestBody.seed_image = sourceImage;
        requestBody.strength = strength[0];
      } else if (workflow === 'inpainting') {
        requestBody.seed_image = sourceImage;
        requestBody.mask_image = maskImage;
      } else if (workflow === 'outpainting') {
        requestBody.seed_image = sourceImage;
        requestBody.outpaint = outpaintSettings;
      }

      const { data, error } = await supabase.functions.invoke('runware-generate', {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedImages([data.image]);
        toast.success('Image generated successfully!');
        
        // Update seed if one was returned
        if (data.metadata?.parameters?.seed) {
          setSeed(data.metadata.parameters.seed.toString());
        }
      } else {
        throw new Error(data.details || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number = 0) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `runware-ai-generated-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedModelInfo = POPULAR_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Create stunning images with Runware AI's advanced models. Generate from text, modify existing images, or use inpainting and outpainting techniques.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card className="shadow-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Generation Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Tabs */}
              <div className="space-y-2">
                <Label>Workflow</Label>
                <Tabs value={workflow} onValueChange={(value: any) => setWorkflow(value)}>
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    {WORKFLOWS.map((wf) => {
                      const Icon = wf.icon;
                      return (
                        <TabsTrigger key={wf.id} value={wf.id} className="flex items-center gap-1 text-xs">
                          <Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{wf.name}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelInfo && (
                  <div className="flex gap-1 flex-wrap items-center">
                    <Badge variant="secondary" className="text-xs">
                      {selectedModelInfo.category}
                    </Badge>
                    {!selectedModelInfo.supportsNegative && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        No negative prompts
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Negative Prompt */}
              {selectedModelInfo?.supportsNegative && (
                <div className="space-y-2">
                  <Label>Negative Prompt (Optional)</Label>
                  <Textarea
                    placeholder="What you don't want in the image..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Image Uploads for non-text-to-image workflows */}
              {workflow !== 'text-to-image' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Source Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      {sourceImage ? (
                        <div className="space-y-2">
                          <img src={sourceImage} alt="Source" className="max-h-32 mx-auto rounded" />
                          <Button variant="outline" size="sm" onClick={() => setSourceImage(null)}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'source')}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {workflow === 'inpainting' && (
                    <div className="space-y-2">
                      <Label>Mask Image</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        {maskImage ? (
                          <div className="space-y-2">
                            <img src={maskImage} alt="Mask" className="max-h-32 mx-auto rounded" />
                            <Button variant="outline" size="sm" onClick={() => setMaskImage(null)}>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'mask')}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {workflow === 'image-to-image' && (
                    <div className="space-y-2">
                      <Label className="text-sm">Strength: {strength[0]}</Label>
                      <Slider
                        value={strength}
                        onValueChange={setStrength}
                        min={0.1}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  )}

                  {workflow === 'outpainting' && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Outpaint Settings</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Top: {outpaintSettings.top}px</Label>
                          <Slider
                            value={[outpaintSettings.top]}
                            onValueChange={([value]) => setOutpaintSettings(prev => ({ ...prev, top: value }))}
                            min={0}
                            max={512}
                            step={64}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Bottom: {outpaintSettings.bottom}px</Label>
                          <Slider
                            value={[outpaintSettings.bottom]}
                            onValueChange={([value]) => setOutpaintSettings(prev => ({ ...prev, bottom: value }))}
                            min={0}
                            max={512}
                            step={64}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left: {outpaintSettings.left}px</Label>
                          <Slider
                            value={[outpaintSettings.left]}
                            onValueChange={([value]) => setOutpaintSettings(prev => ({ ...prev, left: value }))}
                            min={0}
                            max={512}
                            step={64}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Right: {outpaintSettings.right}px</Label>
                          <Slider
                            value={[outpaintSettings.right]}
                            onValueChange={([value]) => setOutpaintSettings(prev => ({ ...prev, right: value }))}
                            min={0}
                            max={512}
                            step={64}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Width</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={128}
                    max={2048}
                    step={64}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Height</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={128}
                    max={2048}
                    step={64}
                  />
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Advanced Parameters</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Guidance Scale: {guidanceScale[0]}</Label>
                    <Slider
                      value={guidanceScale}
                      onValueChange={setGuidanceScale}
                      min={0}
                      max={50}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Steps: {steps[0]}</Label>
                    <Slider
                      value={steps}
                      onValueChange={setSteps}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Seed (Optional)</Label>
                    <Button variant="ghost" size="sm" onClick={randomizeSeed}>
                      <Shuffle className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="Random seed for reproducible results"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Number of Images: {numberResults}</Label>
                  <Slider
                    value={[numberResults]}
                    onValueChange={([value]) => setNumberResults(value)}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateImage} 
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
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

          {/* Result Panel */}
          <Card className="shadow-xl border-border/50">
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">Generating your image...</p>
                    </div>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <img 
                          src={image} 
                          alt={`Generated ${index + 1}`} 
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                        <Button 
                          onClick={() => downloadImage(image, index)}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Image {index + 1}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Your generated images will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};