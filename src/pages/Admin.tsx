
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTab from '@/components/UserManagementTab';
import ApiTrackingTab from '@/components/ApiTrackingTab';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon, LogOut, Menu, Plus, ArrowUp } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faUsers, faChartBar } from '@fortawesome/free-solid-svg-icons';

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [apiCalls, setApiCalls] = useState<number | null>(null);
  const [activeAdmins, setActiveAdmins] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      setAuthChecked(true);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!currentUser || currentUser.email !== 'jcibarathraj@gmail.com') {
      setTimeout(() => navigate('/'), 2000);
    } else {
      // Fetch dashboard stats
      fetchDashboardStats();
    }
  }, [authChecked, currentUser, navigate]);

  const fetchDashboardStats = async () => {
    // Total Users
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setTotalUsers(userCount ?? 0);
    // API Calls
    const { count: apiCount } = await supabase.from('api_usage_logs').select('*', { count: 'exact', head: true });
    setApiCalls(apiCount ?? 0);
    // Active Admins (users with role 'admin' or just your email)
    const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('email', 'jcibarathraj@gmail.com');
    setActiveAdmins(adminCount ?? 0);
  };

  if (!authChecked) return null;
  
  if (!currentUser || currentUser.email !== 'jcibarathraj@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl p-12 border border-white/30 dark:border-slate-800/40 flex flex-col items-center max-w-md w-full animate-fade-in">
          <div className="mb-6">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="url(#grad403)" />
              <rect x="20" y="28" width="24" height="20" rx="4" fill="#fff" stroke="#e11d48" strokeWidth="2" />
              <rect x="28" y="36" width="8" height="8" rx="4" fill="#e11d48" />
              <defs>
                <linearGradient id="grad403" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f472b6" />
                  <stop offset="1" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">403</div>
          <div className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Forbidden</div>
          <div className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-xs">You do not have permission to access the Admin Portal. If you believe this is a mistake, contact your administrator.</div>
          <Button variant="default" onClick={() => navigate('/')} className="px-8 py-2 text-lg font-semibold rounded-full shadow-lg">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Hamburger menu for mobile */}
            <button
              className="sm:hidden flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chat')}
              className="hidden sm:inline-flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
              aria-label="Back to Chat"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center space-x-3">
              <Logo size={32} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <Button
              onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex">
            <div className="w-64 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col p-6 animate-fade-in">
              <button
                className="self-end mb-4 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-pink-400"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <ArrowLeft size={24} />
              </button>
              <nav className="flex flex-col gap-4 mt-4">
                <button className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-pink-400" onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}>
                  <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                </button>
                <button className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-pink-400" onClick={() => { setMobileMenuOpen(false); const el = document.querySelector('[data-state="active"][value="users"]') as HTMLElement; el && el.click(); }}>
                  <FontAwesomeIcon icon={faUsers} /> User Management
                </button>
                <button className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-pink-400" onClick={() => { setMobileMenuOpen(false); const el = document.querySelector('[data-state="active"][value="api"]') as HTMLElement; el && el.click(); }}>
                  <FontAwesomeIcon icon={faChartBar} /> API Tracking
                </button>
                <button className="flex items-center gap-2 text-lg font-semibold text-blue-600 dark:text-pink-400" onClick={() => { setMobileMenuOpen(false); navigate('/settings'); }}>
                  <SettingsIcon className="h-5 w-5" /> Settings
                </button>
                <button className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400 mt-8" onClick={async () => { setMobileMenuOpen(false); await supabase.auth.signOut(); navigate('/'); }}>
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </header>
      {/* Floating Action Button (FAB) for mobile */}
      <button
        className="fixed bottom-6 right-6 z-40 sm:hidden bg-gradient-to-br from-blue-500 to-pink-500 text-white rounded-full shadow-2xl p-4 flex items-center justify-center hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={28} />
      </button>
      {/* Main Content */}
      <main className="flex-1 pt-20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-white/30 dark:border-slate-800/40 animate-fade-in">
            <div className="flex items-center gap-4 px-10 pt-10 pb-2 border-b border-slate-200 dark:border-slate-700 mb-6">
              <div className="bg-gradient-to-br from-blue-500 via-pink-400 to-yellow-400 rounded-full p-3 shadow-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} size="2x" className="text-white drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)', borderRadius: '50%', padding: '6px' }} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent mb-1">Admin Control Panel</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Complete system administration and monitoring dashboard</p>
              </div>
            </div>
            <div className="px-2 pb-2">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTachometerAlt} className="text-blue-500" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-pink-500" />
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartBar} className="text-purple-500" />
                    API Tracking
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="space-y-6">
                  {/* Dashboard summary cards go here */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
                      <FontAwesomeIcon icon={faUsers} size="2x" className="text-white mb-2" />
                      <div className="text-2xl font-bold text-white">{totalUsers !== null ? totalUsers : '--'}</div>
                      <div className="text-sm text-blue-100">Total Users</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
                      <FontAwesomeIcon icon={faChartBar} size="2x" className="text-white mb-2" />
                      <div className="text-2xl font-bold text-white">{apiCalls !== null ? apiCalls : '--'}</div>
                      <div className="text-sm text-pink-100">API Calls</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
                      <FontAwesomeIcon icon={faUser} size="2x" className="text-white mb-2" />
                      <div className="text-2xl font-bold text-white">{activeAdmins !== null ? activeAdmins : '--'}</div>
                      <div className="text-sm text-yellow-100">Active Admins</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="users" className="space-y-6">
                  <UserManagementTab currentUser={currentUser} />
                </TabsContent>
                <TabsContent value="api" className="space-y-6">
                  <ApiTrackingTab currentUser={currentUser} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
