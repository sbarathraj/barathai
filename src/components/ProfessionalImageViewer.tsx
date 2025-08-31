import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  description?: string;
}

export const ProfessionalImageViewer: React.FC<ProfessionalImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Image Viewer",
  description
}) => {
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (isOpen && imageUrl) {
      setImageLoaded(false);
      setImageError(false);
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, imageUrl]);

  const downloadImage = () => {
    if (!imageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `barathAI-image-${Date.now()}.jpg`;
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



  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!isOpen || !imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] sm:max-w-[95vw] sm:w-[95vw] sm:h-[95vh] p-0 border-0 bg-transparent shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || "Professional image viewer with zoom, rotate, and download capabilities"}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-full flex flex-col bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-2xl">
          {/* Header Controls */}
          <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-lg sm:rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none sm:ml-4">
                {title}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile: Simplified controls */}
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.25}
                  className="h-7 w-7 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="h-7 w-7 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadImage}
                  className="h-7 w-7 p-0"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="h-7 w-7 p-0"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Desktop: Full controls */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.25}
                  className="h-8 w-8 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="h-8 w-8 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRotate}
                  className="h-8 w-8 p-0"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadImage}
                  className="h-8 px-3"
                  title="Download Image"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Image Area */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-hidden">
            <div className="relative max-w-full max-h-full">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg min-w-[200px] min-h-[200px] sm:min-w-[300px] sm:min-h-[300px]">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading image...</span>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg min-w-[200px] min-h-[200px] sm:min-w-[300px] sm:min-h-[300px] p-4 sm:p-8">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Failed to load image
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      The image could not be displayed. It may be corrupted or in an unsupported format.
                    </p>
                  </div>
                </div>
              )}
              
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-transform duration-300"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  display: imageLoaded && !imageError ? 'block' : 'none',
                  maxWidth: '90vw',
                  maxHeight: '75vh'
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
              />
            </div>
          </div>
          
          {/* Footer Info */}
          {description && (
            <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-b-lg sm:rounded-b-2xl">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
                {description}
              </p>
            </div>
          )}
          
          {/* Mobile Zoom Indicator */}
          <div className="sm:hidden absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};