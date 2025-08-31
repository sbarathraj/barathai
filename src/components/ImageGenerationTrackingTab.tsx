import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, Eye, Image as ImageIcon, RefreshCw, TrendingUp, Clock, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { ProfessionalImageViewer } from '@/components/ProfessionalImageViewer';
import { ProfessionalImageGallery } from '@/components/ProfessionalImageGallery';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 24;
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Reset and fetch first page when component mounts
    fetchLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLogs(true);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, modelFilter, taskFilter, startDate, endDate]);

  const fetchLogs = async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      if (!hasMore) return;
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 0 : page + 1;
      const from = currentPage * pageSize;
      const to = from + pageSize - 1;

      // Complete query with all API details
      let query = supabase
        .from('image_generation_logs')
        .select(
          'id, user_id, user_email, api_provider, model_name, task_type, prompt, negative_prompt, image_url, status, error_message, parameters, image_metadata, processing_time_ms, response_time_ms, image_size_bytes, guidance_scale, num_inference_steps, seed, width, height, created_at, success'
        )
        .order('created_at', { ascending: false });

      // Apply filters if any
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (modelFilter !== 'all') {
        query = query.eq('model_name', modelFilter);
      }
      if (taskFilter !== 'all') {
        query = query.eq('task_type', taskFilter);
      }
      if (searchTerm) {
        query = query.or(`prompt.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      const { data, error } = await query.range(from, to);

      if (error) throw error;

      const fetched = data || [];
      if (reset) {
        setLogs(fetched);
      } else {
        setLogs(prev => [...prev, ...fetched]);
      }

      setPage(currentPage);
      if (fetched.length < pageSize) setHasMore(false);
    } catch (error) {
      console.error('Error fetching image generation logs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Since we're filtering on the server side now, we don't need client-side filtering
  const filteredLogs = logs;

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

  const handleImageClick = (imageUrl: string, title?: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageTitle(title || 'Generated Image');
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
    setSelectedImageTitle('');
  };

  const exportToExcel = async () => {
    // Fetch all filtered data for export
    let query = supabase
      .from('image_generation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply same filters as display
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (modelFilter !== 'all') {
      query = query.eq('model_name', modelFilter);
    }
    if (taskFilter !== 'all') {
      query = query.eq('task_type', taskFilter);
    }
    if (searchTerm) {
      query = query.or(`prompt.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }

    const { data: allLogs, error } = await query;
    if (error || !allLogs) return;

    const formatDateTime = (iso: string) => {
      if (!iso) return '-';
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };

    const data = allLogs.map(log => ({
      ID: log.id,
      Timestamp: formatDateTime(log.created_at),
      UserEmail: log.user_email || 'Anonymous',
      APIProvider: log.api_provider,
      ModelName: log.model_name,
      TaskType: log.task_type,
      Prompt: log.prompt,
      NegativePrompt: log.negative_prompt || '',
      Status: log.status,
      Success: log.success ? 'Yes' : 'No',
      Width: log.width || '',
      Height: log.height || '',
      Seed: log.seed || '',
      GuidanceScale: log.guidance_scale || '',
      InferenceSteps: log.num_inference_steps || '',
      ProcessingTimeMs: log.processing_time_ms || '',
      ResponseTimeMs: log.response_time_ms || '',
      ImageSizeBytes: log.image_size_bytes || '',
      ImageURL: log.image_url || '',
      ErrorMessage: log.error_message || ''
    }));

    // Import XLSX dynamically
    const XLSX = await import('xlsx');
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add colored header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: 'A855F7' } }, // purple
          font: { color: { rgb: 'FFFFFF' }, bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }
    
    // Set column widths
    ws['!cols'] = [
      { wch: 24 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 50 }, { wch: 30 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
      { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 50 }, { wch: 30 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Image Generation Logs');
    
    const dateRange = startDate || endDate ? `_${startDate || 'start'}_to_${endDate || 'end'}` : '';
    XLSX.writeFile(wb, `image_generation_logs${dateRange}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="hidden sm:inline">Image Generation Analytics</span>
            <span className="sm:hidden">Image Analytics</span>
          </h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            <span className="hidden sm:inline">Professional monitoring and analytics for AI image generation requests</span>
            <span className="sm:hidden">AI image generation monitoring</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
            <span className="sm:hidden">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
          </Button>
          <Button onClick={() => fetchLogs(true)} variant="outline" size="sm" className="text-xs sm:text-sm">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </div>
          Advanced Filters
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
          <Input
            placeholder="Search prompts, users, models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:col-span-2 lg:col-span-2 text-sm"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
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
            <SelectTrigger className="text-sm">
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
            <SelectTrigger className="text-sm">
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
        
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              setSearchTerm('');
              setStartDate('');
              setEndDate('');
              setStatusFilter('all');
              setModelFilter('all');
              setTaskFilter('all');
            }}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
          >
            Clear Filters
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm bg-gradient-to-r from-green-400 to-blue-500 text-white border-0 hover:from-green-500 hover:to-blue-600"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Professional Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">{logs.length}</div>
                <div className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                  <span className="hidden sm:inline">Total Generations</span>
                  <span className="sm:hidden">Total</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                  {logs.filter(log => log.success).length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Successful</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">
                  {logs.filter(log => !log.success).length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Failed</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(logs.filter(log => log.response_time_ms).reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / logs.filter(log => log.response_time_ms).length || 0)}ms
                </div>
                <div className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                  <span className="hidden sm:inline">Avg Response Time</span>
                  <span className="sm:hidden">Avg Time</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Image Gallery */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="hidden sm:inline">Recent Generations</span>
            <span className="sm:hidden">Recent</span>
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
              {filteredLogs.length} images
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {viewMode === 'grid' ? (
            <ProfessionalImageGallery
              images={filteredLogs.filter(log => log.image_url).map(log => ({
                id: log.id,
                image_url: log.image_url!,
                prompt: log.prompt,
                created_at: log.created_at,
                user_email: log.user_email || undefined,
                width: log.width || undefined,
                height: log.height || undefined,
                model_name: log.model_name
              }))}
              onImageClick={handleImageClick}
              title=""
              showUserInfo={true}
              columns={2} // Mobile responsive: 2 columns on mobile, will be overridden by gallery component
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No images found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generate some images to see them here
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge variant={getStatusBadgeVariant(log.status)} className="text-xs">
                            {log.status}
                          </Badge>
                          <Badge variant={getTaskTypeBadgeVariant(log.task_type)} className="text-xs">
                            {log.task_type}
                          </Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {log.model_name.split('/').pop()}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          <div>
                            <p className="font-medium text-xs sm:text-sm mb-1">Prompt:</p>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {log.prompt}
                            </p>
                            {log.negative_prompt && (
                              <>
                                <p className="font-medium text-xs sm:text-sm mt-2 sm:mt-3 mb-1">Negative Prompt:</p>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {log.negative_prompt}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 text-xs">
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                              <span className="truncate">{log.user_email || 'Anonymous'}</span>
                            </div>
                            {log.api_provider && (
                              <div className="text-muted-foreground truncate">
                                API: {log.api_provider}
                              </div>
                            )}
                            <div className="text-muted-foreground truncate">
                              Size: {log.width}×{log.height}
                            </div>
                            {log.seed && (
                              <div className="text-muted-foreground truncate">
                                Seed: {log.seed}
                              </div>
                            )}
                            {log.guidance_scale && (
                              <div className="text-muted-foreground truncate">
                                Guidance: {log.guidance_scale}
                              </div>
                            )}
                            {log.num_inference_steps && (
                              <div className="text-muted-foreground truncate">
                                Steps: {log.num_inference_steps}
                              </div>
                            )}
                            {log.processing_time_ms && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="truncate">{log.processing_time_ms}ms</span>
                              </div>
                            )}
                            {log.response_time_ms && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="truncate">{log.response_time_ms}ms</span>
                              </div>
                            )}
                            {log.image_size_bytes && (
                              <div className="text-muted-foreground truncate">
                                {(log.image_size_bytes / 1024).toFixed(1)}KB
                              </div>
                            )}
                          </div>
                        </div>

                        {log.error_message && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-red-600 dark:text-red-400">
                            {log.error_message}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 sm:gap-3 sm:ml-4">
                        {log.image_url && (
                          <>
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all shadow-md flex-shrink-0"
                              onClick={() => handleImageClick(log.image_url!, log.prompt)}
                            >
                              <img
                                src={log.image_url}
                                alt="Generated thumbnail"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex sm:flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImageClick(log.image_url!, log.prompt)}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                              >
                                <Eye className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadImage(log.image_url!, log.id)}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                              >
                                <Download className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline">Save</span>
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {hasMore && (
                <div className="flex justify-center pt-3 sm:pt-4">
                  <Button onClick={() => fetchLogs(false)} disabled={loadingMore} variant="outline" size="sm" className="text-xs sm:text-sm">
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                        <span className="hidden sm:inline">Loading more images...</span>
                        <span className="sm:hidden">Loading...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Load more images</span>
                        <span className="sm:hidden">Load more</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Image Viewer */}
      <ProfessionalImageViewer
        isOpen={!!selectedImage}
        onClose={handleCloseViewer}
        imageUrl={selectedImage}
        title={selectedImageTitle}
        description="Professional AI-generated image viewer with advanced controls"
      />
    </div>
  );
};

export default ImageGenerationTrackingTab;