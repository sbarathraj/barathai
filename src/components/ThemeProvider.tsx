import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  isDark: false,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'barathAI-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [isDark, setIsDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Add professional transition classes for smooth theme changes
    if (isTransitioning) {
      root.style.transition = 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      body.style.transition = 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Add a subtle scale animation to the entire page
      body.style.transform = 'scale(0.98)';
      body.style.opacity = '0.9';
      
      // Add CSS for all elements to transition smoothly
      const style = document.createElement('style');
      style.id = 'theme-transition-styles';
      style.textContent = `
        * {
          transition: background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                      color 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                      border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `;
      document.head.appendChild(style);
    }

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      setIsDark(systemTheme === 'dark');
    } else {
      root.classList.add(theme);
      setIsDark(theme === 'dark');
    }

    // Remove transition after animation completes
    if (isTransitioning) {
      setTimeout(() => {
        // Restore normal state
        body.style.transform = 'scale(1)';
        body.style.opacity = '1';
        
        setTimeout(() => {
          root.style.transition = '';
          body.style.transition = '';
          
          // Remove transition styles
          const transitionStyles = document.getElementById('theme-transition-styles');
          if (transitionStyles) {
            transitionStyles.remove();
          }
          
          setIsTransitioning(false);
        }, 200);
      }, 300);
    }
  }, [theme, isTransitioning]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setIsTransitioning(true);
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    isDark,
    toggleTheme: () => {
      setIsTransitioning(true);
      const newTheme = isDark ? 'light' : 'dark';
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};