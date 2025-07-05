
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* AI Neural Network inspired design */}
        <circle cx="20" cy="20" r="18" fill="url(#gradient1)" />
        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="28" cy="12" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="12" cy="28" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="28" cy="28" r="3" fill="#ffffff" opacity="0.9" />
        
        {/* Neural connections */}
        <line x1="12" y1="12" x2="20" y2="20" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        <line x1="28" y1="12" x2="20" y2="20" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        <line x1="20" y1="20" x2="12" y2="28" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        <line x1="20" y1="20" x2="28" y2="28" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        <line x1="12" y1="12" x2="28" y2="12" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="28" x2="28" y2="28" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
