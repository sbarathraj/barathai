
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTab from './UserManagementTab';
import ApiTrackingTab from './ApiTrackingTab';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onClose, currentUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [open]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-0 w-full max-w-6xl mx-4 relative animate-fade-in max-h-[90vh] overflow-hidden">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>
        )}
        
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-2xl font-bold transition-colors z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="px-8 pt-8 pb-4 h-full">
          <h2 className="text-2xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
            Admin Control Panel
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Complete system administration and monitoring dashboard
          </p>

          {!isAdmin ? (
            <div className="flex justify-center items-center h-32 text-lg text-red-500">
              Access denied. Admin privileges required.
            </div>
          ) : (
            <div className="h-[calc(90vh-200px)] overflow-y-auto">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <span>👥</span>
                    User Management
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <span>📊</span>
                    API Tracking
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="space-y-4">
                  <UserManagementTab currentUser={currentUser} />
                </TabsContent>
                
                <TabsContent value="api" className="space-y-4">
                  <ApiTrackingTab currentUser={currentUser} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
