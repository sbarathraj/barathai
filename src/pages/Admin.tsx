
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import { Topbar } from '@/components/ui/topbar';
import UserManagementTab from '@/components/UserManagementTab';
import ApiTrackingTab from '@/components/ApiTrackingTab';
import ImageGenerationTrackingTab from '@/components/ImageGenerationTrackingTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faUsers, faChartBar, faImage } from '@fortawesome/free-solid-svg-icons';

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [apiCalls, setApiCalls] = useState<number | null>(null);
  const [activeAdmins, setActiveAdmins] = useState<number | null>(null);
  const [imageGenerations, setImageGenerations] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState('dashboard');
  const mainContentRef = useRef<HTMLDivElement>(null);

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
      fetchDashboardStats();
    }
  }, [authChecked, currentUser, navigate]);

  useEffect(() => {
    // Set tab from query param
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t === 'users' || t === 'api' || t === 'images') setTab(t);
    else setTab('dashboard');
  }, [location.search]);

  const fetchDashboardStats = async () => {
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setTotalUsers(userCount ?? 0);
    const { count: apiCount } = await supabase.from('api_usage_logs').select('*', { count: 'exact', head: true });
    setApiCalls(apiCount ?? 0);
    const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('email', 'jcibarathraj@gmail.com');
    setActiveAdmins(adminCount ?? 0);
    const { count: imageCount } = await supabase.from('image_generation_logs').select('*', { count: 'exact', head: true });
    setImageGenerations(imageCount ?? 0);
  };

  if (!authChecked) return null;
  if (!currentUser || currentUser.email !== 'jcibarathraj@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar (truly fixed, static) */}
      <div className="fixed left-0 top-0 h-full z-40 w-64 hidden md:block">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>
      {/* Topbar */}
      <Topbar
        onMenuClick={() => setSidebarOpen(true)}
        onSettings={() => navigate('/settings')}
        onLogout={async () => { await supabase.auth.signOut(); navigate('/'); }}
      />
      {/* Main Content (scrollable, with left padding) */}
      <div className="md:pl-64">
        <main id="admin-main-content" ref={mainContentRef} className="pt-20 px-2 sm:px-6 pb-8 relative">
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-2xl border border-white/30 dark:border-slate-800/40 animate-fade-in p-0 sm:p-0">
            <div className="flex items-center gap-4 px-6 pt-10 pb-2 border-b border-slate-200 dark:border-slate-700 mb-6">
              <div className="bg-gradient-to-br from-blue-500 via-pink-400 to-yellow-400 rounded-full p-3 shadow-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} size="2x" className="text-white drop-shadow-lg" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)', borderRadius: '50%', padding: '6px' }} />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent mb-1">Admin Control Panel</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Complete system administration and monitoring dashboard</p>
              </div>
            </div>
            {/* Render section based on tab */}
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 backdrop-blur-xl transition-transform hover:scale-105">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-4 shadow-lg mb-2 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUsers} size="2x" className="text-white drop-shadow" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{totalUsers !== null ? totalUsers : '--'}</div>
                    <div className="text-base font-semibold text-blue-500 dark:text-blue-300">Total Users</div>
                      </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 backdrop-blur-xl transition-transform hover:scale-105">
                    <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-full p-4 shadow-lg mb-2 flex items-center justify-center">
                      <FontAwesomeIcon icon={faChartBar} size="2x" className="text-white drop-shadow" />
                      </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{apiCalls !== null ? apiCalls : '--'}</div>
                    <div className="text-base font-semibold text-pink-500 dark:text-pink-300">API Calls</div>
                    </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 backdrop-blur-xl transition-transform hover:scale-105">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-4 shadow-lg mb-2 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} size="2x" className="text-white drop-shadow" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{activeAdmins !== null ? activeAdmins : '--'}</div>
                    <div className="text-base font-semibold text-yellow-600 dark:text-yellow-300">Active Admins</div>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 backdrop-blur-xl transition-transform hover:scale-105">
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-4 shadow-lg mb-2 flex items-center justify-center">
                      <FontAwesomeIcon icon={faImage} size="2x" className="text-white drop-shadow" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{imageGenerations !== null ? imageGenerations : '--'}</div>
                    <div className="text-base font-semibold text-purple-600 dark:text-purple-300">AI Images</div>
                  </div>
                </div>
            </div>
            )}
            {tab === 'users' && <UserManagementTab currentUser={currentUser} />}
            {tab === 'api' && <ApiTrackingTab currentUser={currentUser} />}
            {tab === 'images' && <ImageGenerationTrackingTab currentUser={currentUser} />}
          </div>
        </main>
        </div>
      {/* Mobile Sidebar Drawer */}
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
};

export default Admin;
 