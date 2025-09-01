import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, Copy, Calendar, User, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ImageItem {
  id: string;
  key?: string;
  image_url: string;
  prompt: string;
  created_at: string;
  user_email?: string;
  width?: number;
  height?: number;
  model_name?: string;
}

interface ProfessionalImageGalleryProps {
  images: ImageItem[];
  onImageClick: (imageUrl: string, title?: string) => void;
  title?: string;
  showUserInfo?: boolean;
  columns?: number;
}

export const ProfessionalImageGallery: React.FC<ProfessionalImageGalleryProps> = ({
  images,
  onImageClick,
  title = "Image Gallery",
  showUserInfo = false,
  columns = 5
}) => {
  const { toast } = useToast();

  const downloadImage = (imageUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${filename}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      toast({
        title: "Copied!",
        description: "Image URL copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    });
  };

  const getGridCols = () => {
    // Always start with 2 columns on mobile for better usability
    switch (columns) {
      case 2: return 'grid-cols-2 sm:grid-cols-2';
      case 3: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
      default: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No images found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate some images to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            {title}
            <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">
              ({images.length})
            </span>
          </h3>
        </div>
      )}
      
      <div className={`grid ${getGridCols()} gap-2 sm:gap-3 lg:gap-4`}>
        {images.map((image) => (
          <div
            key={image.key || image.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Image Container */}
            <div 
              className="aspect-square relative overflow-hidden"
              onClick={() => onImageClick(image.image_url, image.prompt)}
            >
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjdBMiAyIDAgMCAwIDE5IDVINUEyIDIgMCAwIDAgMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1YxMloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTkgOUE0IDQgMCAwIDEgMTcgOSIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* View Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                  <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              
              {/* Quick Actions - Hidden on mobile for better touch experience */}
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex gap-1 hidden sm:flex">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image.image_url, `image-${image.id}`);
                  }}
                  title="Download image"
                >
                  <Download className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </div>
              
              {/* Resolution Badge */}
              {image.width && image.height && (
                <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-black/70 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded backdrop-blur-sm">
                  <span className="hidden sm:inline">{image.width}×{image.height}</span>
                  <span className="sm:hidden">{image.width}×{image.height}</span>
                </div>
              )}
            </div>
            
            {/* Info Panel */}
            <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
              <p 
                className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
                title={image.prompt}
              >
                {image.prompt}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="text-xs">{format(new Date(image.created_at), 'MMM dd')}</span>
                </div>
                
                {showUserInfo && image.user_email && (
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <User className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-[60px] sm:max-w-[80px] text-xs">
                      {image.user_email.split('@')[0]}
                    </span>
                  </div>
                )}
                
                {image.model_name && (
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-[40px] sm:max-w-[60px] text-xs">
                      {image.model_name.split('/').pop()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ready</span>
                </div>
                
                {/* Mobile Download Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 sm:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image.image_url, `image-${image.id}`);
                  }}
                  title="Download image"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};