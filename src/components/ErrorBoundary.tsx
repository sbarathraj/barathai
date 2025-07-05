
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message, 
  onRetry, 
  onDismiss,
  type = 'error'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const bgColor = type === 'error' ? 'bg-red-900/20' : type === 'warning' ? 'bg-yellow-900/20' : 'bg-blue-900/20';
  const borderColor = type === 'error' ? 'border-red-500/30' : type === 'warning' ? 'border-yellow-500/30' : 'border-blue-500/30';
  const textColor = type === 'error' ? 'text-red-300' : type === 'warning' ? 'text-yellow-300' : 'text-blue-300';
  const iconColor = type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-yellow-400' : 'text-blue-400';

  return (
    <div className={`animate-fade-in mb-4 p-4 rounded-lg border ${bgColor} ${borderColor} flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <AlertCircle className={`h-5 w-5 ${iconColor}`} />
        <span className={`text-sm ${textColor}`}>{message}</span>
      </div>
      <div className="flex items-center space-x-2">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className={`${textColor} hover:bg-white/10`}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className={`h-6 w-6 ${textColor} hover:bg-white/10`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Generating response...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-slate-400 dark:text-slate-400 text-gray-600">{message}</span>
    </div>
  );
};
