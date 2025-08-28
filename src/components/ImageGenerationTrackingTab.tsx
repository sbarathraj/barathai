import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Download, Eye, Filter, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGenerationLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  api_provider: string;
  model_name: string;
  task_type: string;
  prompt: string;
  negative_prompt: string | null;
  image_url: string | null;
  status: string;
  error_message: string | null;
  parameters: any;
  image_metadata: any;
  processing_time_ms: number | null;
  response_time_ms: number | null;
  success: boolean;
  image_size_bytes: number | null;
  guidance_scale: number | null;
  num_inference_steps: number | null;
  seed: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

const ImageGenerationTrackingTab: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [logs, setLogs] = useState<ImageGenerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('image_generation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching image generation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesModel = modelFilter === 'all' || log.model_name === modelFilter;
    const matchesTask = taskFilter === 'all' || log.task_type === taskFilter;

    return matchesSearch && matchesStatus && matchesModel && matchesTask;
  });

  const uniqueModels = [...new Set(logs.map(log => log.model_name))];
  const uniqueTasks = [...new Set(logs.map(log => log.task_type))];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getTaskTypeBadgeVariant = (taskType: string) => {
    switch (taskType) {
      case 'text-to-image': return 'default';
      case 'image-to-image': return 'secondary';
      case 'inpainting': return 'outline';
      default: return 'outline';
    }
  };

  const downloadImage = (imageUrl: string, logId: string) => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${logId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Image Generation Tracking</h2>
          <p className="text-muted-foreground">Monitor AI image generation requests and usage</p>
        </div>
        <Button onClick={fetchLogs} variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          placeholder="Search prompts, users, models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lg:col-span-2"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {uniqueModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model.split('/').pop()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={taskFilter} onValueChange={setTaskFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Task Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            {uniqueTasks.map((task) => (
              <SelectItem key={task} value={task}>
                {task}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{logs.length}</div>
              <div className="text-sm text-muted-foreground">Total Generations</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => !log.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(logs.filter(log => log.response_time_ms).reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / logs.filter(log => log.response_time_ms).length || 0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Recent Generations ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No image generation logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                        <Badge variant={getTaskTypeBadgeVariant(log.task_type)}>
                          {log.task_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.model_name.split('/').pop()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-sm">Prompt:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {log.prompt}
                          </p>
                          {log.negative_prompt && (
                            <>
                              <p className="font-medium text-sm mt-2">Negative Prompt:</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {log.negative_prompt}
                              </p>
                            </>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            User: {log.user_email || 'Anonymous'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Size: {log.width}×{log.height}
                          </div>
                          {log.guidance_scale && (
                            <div className="text-xs text-muted-foreground">
                              Guidance: {log.guidance_scale}
                            </div>
                          )}
                          {log.num_inference_steps && (
                            <div className="text-xs text-muted-foreground">
                              Steps: {log.num_inference_steps}
                            </div>
                          )}
                          {log.response_time_ms && (
                            <div className="text-xs text-muted-foreground">
                              Time: {log.response_time_ms}ms
                            </div>
                          )}
                          {log.image_size_bytes && (
                            <div className="text-xs text-muted-foreground">
                              Size: {(log.image_size_bytes / 1024).toFixed(1)}KB
                            </div>
                          )}
                        </div>
                      </div>

                      {log.error_message && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm text-red-600 dark:text-red-400">
                          {log.error_message}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {log.image_url && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedImage(log.image_url)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(log.image_url!, log.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={setSelectedImage}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center p-4">
              <img 
                src={selectedImage} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button onClick={() => setSelectedImage(null)} className="mt-4">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageGenerationTrackingTab;