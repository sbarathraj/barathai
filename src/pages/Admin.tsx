
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTab from '@/components/UserManagementTab';
import ApiTrackingTab from '@/components/ApiTrackingTab';

const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
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
    }
  }, [authChecked, currentUser, navigate]);

  if (!authChecked) return null;
  
  if (!currentUser || currentUser.email !== 'jcibarathraj@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Logo size={48} />
        <div className="mt-6 text-xl font-bold text-red-500">Access Denied</div>
        <div className="text-slate-500 mt-2">You are not authorized to view this page. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-6xl mx-auto mt-12 mb-8 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-2xl p-8 relative animate-fade-in border border-white/30 dark:border-slate-800/40">
        <h1 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
          Admin Control Panel
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Complete system administration and monitoring dashboard
        </p>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <span>👥</span>
              User Management
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <span>📊</span>
              API Tracking
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagementTab currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="api" className="space-y-6">
            <ApiTrackingTab currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
