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
import { toast } from 'sonner';
import { Loader2, Download, Upload, Palette, Image as ImageIcon } from 'lucide-react';

const POPULAR_MODELS = [
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL',
    description: 'High-quality text-to-image generation',
    tasks: ['text-to-image']
  },
  {
    id: 'runwayml/stable-diffusion-v1-5',
    name: 'Stable Diffusion 1.5',
    description: 'Fast and reliable image generation',
    tasks: ['text-to-image', 'image-to-image', 'inpainting']
  },
  {
    id: 'kandinsky-community/kandinsky-2-2-decoder',
    name: 'Kandinsky 2.2',
    description: 'Advanced artistic image generation',
    tasks: ['text-to-image']
  },
  {
    id: 'DeepFloyd/IF-I-XL-v1.0',
    name: 'DeepFloyd IF',
    description: 'High-resolution text understanding',
    tasks: ['text-to-image']
  }
];

const IMAGE_SIZES = [
  { label: '512×512', width: 512, height: 512 },
  { label: '768×768', width: 768, height: 768 },
  { label: '1024×1024', width: 1024, height: 1024 },
  { label: '1152×896', width: 1152, height: 896 },
  { label: '896×1152', width: 896, height: 1152 },
];

export const ImageGeneration: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(POPULAR_MODELS[0].id);
  const [taskType, setTaskType] = useState<'text-to-image' | 'image-to-image' | 'inpainting'>('text-to-image');
  const [guidanceScale, setGuidanceScale] = useState([7.5]);
  const [steps, setSteps] = useState([20]);
  const [seed, setSeed] = useState('');
  const [selectedSize, setSelectedSize] = useState(IMAGE_SIZES[2]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
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

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (taskType === 'image-to-image' && !sourceImage) {
      toast.error('Please upload a source image for image-to-image generation');
      return;
    }

    if (taskType === 'inpainting' && (!sourceImage || !maskImage)) {
      toast.error('Please upload both source and mask images for inpainting');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('huggingface-generate', {
        body: {
          prompt,
          negative_prompt: negativePrompt,
          model: selectedModel,
          task_type: taskType,
          guidance_scale: guidanceScale[0],
          num_inference_steps: steps[0],
          seed: seed ? parseInt(seed) : null,
          width: selectedSize.width,
          height: selectedSize.height,
          source_image: sourceImage,
          mask_image: maskImage
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedImage(data.image);
        toast.success('Image generated successfully!');
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

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `barath-ai-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedModelInfo = POPULAR_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blue-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl shadow-lg">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning images with Hugging Face's advanced AI models. Generate from text, modify existing images, or use inpainting techniques.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/20 dark:border-slate-800/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Generation Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Type */}
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select value={taskType} onValueChange={(value: any) => setTaskType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-to-image">Text to Image</SelectItem>
                    <SelectItem value="image-to-image">Image to Image</SelectItem>
                    <SelectItem value="inpainting">Inpainting</SelectItem>
                  </SelectContent>
                </Select>
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
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedModelInfo && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedModelInfo.tasks.map((task) => (
                      <Badge key={task} variant="secondary" className="text-xs">
                        {task}
                      </Badge>
                    ))}
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
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label>Negative Prompt (Optional)</Label>
                <Textarea
                  placeholder="What you don't want in the image..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Image Uploads for non-text-to-image tasks */}
              {taskType !== 'text-to-image' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Source Image</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
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

                  {taskType === 'inpainting' && (
                    <div className="space-y-2">
                      <Label>Mask Image</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
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
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-2">
                <Label>Image Size</Label>
                <Select 
                  value={`${selectedSize.width}x${selectedSize.height}`}
                  onValueChange={(value) => {
                    const [width, height] = value.split('x').map(Number);
                    setSelectedSize({ label: value, width, height });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_SIZES.map((size) => (
                      <SelectItem key={size.label} value={`${size.width}x${size.height}`}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Advanced Parameters</Label>
                
                <div className="space-y-2">
                  <Label className="text-sm">Guidance Scale: {guidanceScale[0]}</Label>
                  <Slider
                    value={guidanceScale}
                    onValueChange={setGuidanceScale}
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Inference Steps: {steps[0]}</Label>
                  <Slider
                    value={steps}
                    onValueChange={setSteps}
                    min={10}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Seed (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Random seed for reproducible results"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateImage} 
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/20 dark:border-slate-800/40 shadow-xl">
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                {loading ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Generating your image...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="w-full space-y-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <Button 
                      onClick={downloadImage}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Your generated image will appear here</p>
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