import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faUsers, faChartBar, faCog, faImage } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { Palette } from 'lucide-react';

export const Sidebar: React.FC<{
  mobileOpen: boolean;
  onClose: () => void;
}> = ({ mobileOpen, onClose }) => {
    return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:z-40 bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl shadow-2xl border-r border-white/30 dark:border-slate-800/40">
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center justify-center h-24 border-b border-white/20 dark:border-slate-800/40 gap-2">
            <NavLink to="/chat" aria-label="Go to Chat">
              <Logo size={40} />
            </NavLink>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Admin</span>
          </div>
          <nav className="flex-1 flex flex-col gap-2 mt-6 px-4">
            <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-pink-400' : 'hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</NavLink>
            <NavLink to="/admin?tab=users" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400' : 'hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><FontAwesomeIcon icon={faUsers} /> User Management</NavLink>
            <NavLink to="/admin?tab=api" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-purple-100 dark:bg-slate-800 text-purple-600 dark:text-pink-400' : 'hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><FontAwesomeIcon icon={faChartBar} /> API Tracking</NavLink>
            <NavLink to="/admin?tab=images" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-green-100 dark:bg-slate-800 text-green-600 dark:text-green-400' : 'hover:bg-green-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><FontAwesomeIcon icon={faImage} /> Image Generation</NavLink>
            <NavLink to="/image-generation" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400' : 'hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><Palette className="w-4 h-4" /> AI Image Studio</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-yellow-100 dark:bg-slate-800 text-yellow-600 dark:text-yellow-400' : 'hover:bg-yellow-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` }><FontAwesomeIcon icon={faCog} /> Settings</NavLink>
          </nav>
        </div>
      </aside>
      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 h-full shadow-2xl flex flex-col p-6 animate-fade-in rounded-r-3xl backdrop-blur-xl">
            <button
              className="self-end mb-4 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-pink-400"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-2xl">×</span>
            </button>
            <div className="flex flex-col items-center gap-2 mb-4">
              <NavLink to="/chat" aria-label="Go to Chat">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                  <Logo size={36} />
                </div>
              </NavLink>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Admin</span>
            </div>
            <nav className="flex flex-col gap-4 mt-4">
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-pink-400' : 'hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faTachometerAlt} /> Dashboard</NavLink>
              <NavLink to="/admin?tab=users" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-pink-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400' : 'hover:bg-pink-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faUsers} /> User Management</NavLink>
              <NavLink to="/admin?tab=api" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-purple-100 dark:bg-slate-800 text-purple-600 dark:text-pink-400' : 'hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faChartBar} /> API Tracking</NavLink>
              <NavLink to="/admin?tab=images" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-green-100 dark:bg-slate-800 text-green-600 dark:text-green-400' : 'hover:bg-green-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faImage} /> Image Generation</NavLink>
              <NavLink to="/image-generation" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400' : 'hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faImage} /> AI Image Studio</NavLink>
              <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive ? 'bg-yellow-100 dark:bg-slate-800 text-yellow-600 dark:text-yellow-400' : 'hover:bg-yellow-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}` } onClick={onClose}><FontAwesomeIcon icon={faCog} /> Settings</NavLink>
            </nav>
          </div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </>
  );
};
export default Sidebar;
