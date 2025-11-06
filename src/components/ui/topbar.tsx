import React from 'react';
import { Button } from './button';
import { Settings, LogOut, Menu } from 'lucide-react';

export const Topbar: React.FC<{
  onMenuClick: () => void;
  onSettings: () => void;
  onLogout: () => void;
}> = ({ onMenuClick, onSettings, onLogout }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between px-4 md:pl-72 h-16">
    <div className="flex items-center gap-3">
      <button className="md:hidden p-2 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 text-white shadow-lg" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={24} />
      </button>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Admin Portal</span>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings"><Settings className="h-5 w-5" /></Button>
      <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout"><LogOut className="h-5 w-5" /></Button>
    </div>
  </header>
);
export default Topbar; 