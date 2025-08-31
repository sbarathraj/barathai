
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import { Topbar } from '@/components/ui/topbar';
import UserManagementTab from '@/components/UserManagementTab';
import ApiTrackingTab from '@/components/ApiTrackingTab';
import ImageGenerationTrackingTab from '@/components/ImageGenerationTrackingTab';

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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
      <div className="flex flex-col flex-grow h-full md:pl-64">
        <main id="admin-main-content" ref={mainContentRef} className="pt-20 px-2 sm:px-6 pb-8 relative overflow-y-auto">
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
              <div className="space-y-8 px-6 pb-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 shadow-xl border border-blue-200 dark:border-blue-800/40 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
                        <FontAwesomeIcon icon={faUsers} size="lg" className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUsers !== null ? totalUsers.toLocaleString() : '--'}</div>
                        <div className="text-sm text-blue-500 dark:text-blue-300 font-medium">Total Users</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">Active Platform Users</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl p-6 shadow-xl border border-pink-200 dark:border-pink-800/40 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3 shadow-lg">
                        <FontAwesomeIcon icon={faChartBar} size="lg" className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{apiCalls !== null ? apiCalls.toLocaleString() : '--'}</div>
                        <div className="text-sm text-pink-500 dark:text-pink-300 font-medium">API Calls</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-pink-600 dark:text-pink-400">
                      <span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-full">Total Requests</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 shadow-xl border border-green-200 dark:border-green-800/40 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-lg">
                        <FontAwesomeIcon icon={faUser} size="lg" className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeAdmins !== null ? activeAdmins.toLocaleString() : '--'}</div>
                        <div className="text-sm text-green-500 dark:text-green-300 font-medium">Active Admins</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                      <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">System Administrators</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 shadow-xl border border-purple-200 dark:border-purple-800/40 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 shadow-lg">
                        <FontAwesomeIcon icon={faImage} size="lg" className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{imageGenerations !== null ? imageGenerations.toLocaleString() : '--'}</div>
                        <div className="text-sm text-purple-500 dark:text-purple-300 font-medium">AI Images</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                      <span className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">Generated Images</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faTachometerAlt} className="text-white text-sm" />
                    </div>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => navigate('/admin?tab=users')}
                      className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faUsers} size="lg" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Manage Users</div>
                          <div className="text-xs opacity-90">View & edit user accounts</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/admin?tab=api')}
                      className="h-16 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faChartBar} size="lg" />
                        <div className="text-left">
                          <div className="text-sm font-bold">API Analytics</div>
                          <div className="text-xs opacity-90">Monitor API usage & performance</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/admin?tab=images')}
                      className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faImage} size="lg" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Image Analytics</div>
                          <div className="text-xs opacity-90">Track AI image generation</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      System Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">Online</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">API Services</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">Operational</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Image Generation</span>
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faChartBar} className="text-white text-xs" />
                      </div>
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">New user registration</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">API request completed</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">5 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Image generated successfully</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">8 minutes ago</div>
                        </div>
                      </div>
                    </div>
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
 