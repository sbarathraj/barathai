import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import { Topbar } from '@/components/ui/topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title = "Chat Main Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Topbar */}
      <Topbar
        onMenuClick={() => setSidebarOpen(true)}
        onSettings={() => navigate('/settings')}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="md:pl-72">
        <main className="pt-16 sm:pt-20 px-2 sm:px-4 md:px-6 pb-6 sm:pb-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;