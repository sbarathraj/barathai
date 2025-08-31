import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export const AnimatedThemeToggle: React.FC<AnimatedThemeToggleProps> = ({
  darkMode,
  onToggle,
  size = 'md',
  variant = 'outline',
  showLabel = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-0';
      case 'lg':
        return 'h-12 w-12 p-0';
      default:
        return 'h-10 w-10 p-0';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <Button
      variant={variant}
      className={`${getSizeClasses()} relative overflow-hidden transition-all duration-300 ${
        darkMode 
          ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-yellow-400' 
          : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-600'
      } ${showLabel ? 'px-4 w-auto' : ''}`}
      onClick={handleToggle}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background Animation */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-yellow-100 to-orange-100'
      }`} />
      
      {/* Icon Container */}
      <div className={`relative z-10 flex items-center gap-2 transition-all duration-300 ${
        isAnimating ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
      }`}>
        {/* Sun Icon */}
        <div className={`absolute transition-all duration-500 ${
          darkMode 
            ? 'opacity-0 scale-0 rotate-180' 
            : 'opacity-100 scale-100 rotate-0'
        }`}>
          <Sun className={`${getIconSize()} transition-all duration-300 ${
            isAnimating ? 'animate-pulse' : ''
          }`} />
        </div>
        
        {/* Moon Icon */}
        <div className={`absolute transition-all duration-500 ${
          darkMode 
            ? 'opacity-100 scale-100 rotate-0' 
            : 'opacity-0 scale-0 -rotate-180'
        }`}>
          <Moon className={`${getIconSize()} transition-all duration-300 ${
            isAnimating ? 'animate-pulse' : ''
          }`} />
        </div>
        
        {/* Label */}
        {showLabel && (
          <span className={`ml-6 text-sm font-medium transition-all duration-300 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}>
            {darkMode ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
      
      {/* Ripple Effect */}
      {isAnimating && (
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 rounded-full animate-ping ${
            darkMode ? 'bg-yellow-400/30' : 'bg-orange-400/30'
          }`} />
        </div>
      )}
    </Button>
  );
};