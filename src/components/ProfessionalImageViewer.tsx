import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, X, Loader2, ZoomIn, ZoomOut, RotateCw, MoreHorizontal, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
      <DialogContent className={`p-0 border-0 bg-transparent shadow-none 
        ${isMobile 
          ? 'max-w-[90vw] w-[90vw] max-h-[80vh] h-auto mt-16 mx-auto' 
          : 'max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] p-4'
        }`}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || "Professional image viewer with zoom, rotate, and download capabilities"}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`w-full flex flex-col bg-white dark:bg-gray-900 rounded-lg sm:rounded-2xl shadow-xl 
          ${isMobile ? 'max-h-[80vh] overflow-hidden' : 'h-full overflow-auto'}`}>
          {/* Clean Header - Removed Share/Copy buttons */}
          <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 
            ${isMobile ? 'p-3 h-12 rounded-t-lg' : 'p-4 h-16 rounded-t-2xl'}`}>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Desktop: Traffic light buttons */}
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
              
              <span className={`font-medium text-gray-700 dark:text-gray-300 truncate 
                ${isMobile ? 'text-sm' : 'text-base ml-4'}`}>
                {title}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isMobile ? (
                // Mobile: Simplified controls without Share/Copy
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadImage}
                    className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]"
                    aria-label="Download image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={handleZoomIn} disabled={zoom >= 3}>
                        <ZoomIn className="w-3.5 h-3.5 mr-2" />
                        Zoom In ({Math.round(zoom * 100)}%)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleZoomOut} disabled={zoom <= 0.25}>
                        <ZoomOut className="w-3.5 h-3.5 mr-2" />
                        Zoom Out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleRotate}>
                        <RotateCw className="w-3.5 h-3.5 mr-2" />
                        Rotate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="h-8 w-8 p-0 min-h-[36px] min-w-[36px]"
                    aria-label="Close viewer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                // Desktop: Clean controls without Share/Copy
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                    className="h-8 w-8 p-0"
                    aria-label="Zoom out"
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
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRotate}
                    className="h-8 w-8 p-0"
                    aria-label="Rotate image"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadImage}
                    className="h-8 w-8 p-0 min-h-[40px] min-w-[40px]"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                    aria-label="Close viewer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Main Image Area - Optimized for mobile card layout */}
          <div className={`flex-1 flex items-center justify-center overflow-hidden 
            ${isMobile ? 'p-3' : 'p-4 lg:p-8'}`}>
            <div className="relative w-full h-full flex items-center justify-center">
              {!imageLoaded && !imageError && (
                <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded 
                  ${isMobile ? 'min-w-[150px] min-h-[150px]' : 'min-w-[300px] min-h-[300px]'}`}>
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className={`animate-spin text-blue-500 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                    <span className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Loading image...
                    </span>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded p-4 
                  ${isMobile ? 'min-w-[150px] min-h-[150px]' : 'min-w-[300px] min-h-[300px]'}`}>
                  <div className="text-center">
                    <div className={`bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2 
                      ${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`}>
                      <X className={`text-red-500 ${isMobile ? 'w-5 h-5' : 'w-8 h-8'}`} />
                    </div>
                    <h3 className={`font-medium text-gray-900 dark:text-gray-100 mb-1 
                      ${isMobile ? 'text-sm' : 'text-lg'}`}>
                      Failed to load image
                    </h3>
                    <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      The image could not be displayed.
                    </p>
                  </div>
                </div>
              )}
              
              <img
                src={imageUrl}
                alt={title}
                className={`object-contain rounded transition-transform duration-300 
                  ${isMobile ? 'max-w-[85vw] max-h-[60vh]' : 'max-w-full max-h-[calc(90vh-8rem)]'}`}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  display: imageLoaded && !imageError ? 'block' : 'none'
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
              />
            </div>
          </div>
          
          {/* Footer Info - Compact for mobile */}
          {description && (
            <div className={`border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 
              ${isMobile ? 'p-3 rounded-b-lg' : 'p-4 rounded-b-2xl'}`}>
              <p className={`text-gray-600 dark:text-gray-300 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {description}
              </p>
            </div>
          )}
          
          {/* Mobile Zoom Indicator - Repositioned for card layout */}
          {isMobile && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};