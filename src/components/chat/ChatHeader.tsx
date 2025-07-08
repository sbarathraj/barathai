import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Settings, LogOut, Moon, Sun, X } from "lucide-react";
import { Logo } from "@/components/Logo";

interface ChatHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  onSettings: () => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onToggleSidebar,
  onSettings,
  onLogout,
  sidebarOpen,
  isMobile
}) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-80 z-40 h-16 flex items-center justify-between px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        
        {isMobile && (
          <div className="flex items-center space-x-2">
            <Logo size={24} />
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BarathAI
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors duration-200"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        <Button
          onClick={onSettings}
          variant="ghost"
          size="icon"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </Button>
        
        <Button
          onClick={onLogout}
          variant="ghost"
          size="icon"
          className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
};