import React from 'react';
import { Button } from './button';
import { Settings, LogOut, Menu } from 'lucide-react';

export const Topbar: React.FC<{
  onMenuClick: () => void;
  onSettings: () => void;
  onLogout: () => void;
}> = ({ onMenuClick, onSettings, onLogout }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between px-3 sm:px-4 md:pl-72 h-14 sm:h-16">
    <div className="flex items-center gap-2 sm:gap-3">
      <button className="md:hidden p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 text-white shadow-lg" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} className="sm:w-6 sm:h-6" />
      </button>
      <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Admin Portal</span>
    </div>
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings" className="h-8 w-8 sm:h-10 sm:w-10"><Settings className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
      <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout" className="h-8 w-8 sm:h-10 sm:w-10"><LogOut className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
    </div>
  </header>
);
export default Topbar; 