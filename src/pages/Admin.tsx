import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Admin: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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

  useEffect(() => {
    if (!authChecked || !currentUser || currentUser.email !== 'jcibarathraj@gmail.com') return;
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [authChecked, currentUser]);

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditName(user.full_name || '');
    setEditEmail(user.email || '');
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ full_name: editName, email: editEmail }).eq('id', id);
    if (error) {
      setToast({ type: 'error', message: 'Failed to update user.' });
    } else {
      setToast({ type: 'success', message: 'User updated successfully.' });
    }
    setEditingId(null);
    // Refresh users
    const { data } = await supabase.from('profiles').select('*');
    setUsers(data || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      setToast({ type: 'error', message: 'Failed to delete user.' });
    } else {
      setToast({ type: 'success', message: 'User deleted successfully.' });
    }
    setDeletingId(null);
    // Refresh users
    const { data } = await supabase.from('profiles').select('*');
    setUsers(data || []);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>
      )}
      <div className="w-full max-w-2xl mx-auto mt-12 mb-8 bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-2xl p-0 relative animate-fade-in border border-white/30 dark:border-slate-800/40">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Admin User Management</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Manage all users below. Only you can edit or delete users.</p>
          {loading ? (
            <div className="flex justify-center items-center h-32 text-lg text-slate-400">Loading users...</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow group relative">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      getInitials(user.full_name)
                    )}
                  </div>
                  {/* User Info or Edit Fields */}
                  {editingId === user.id ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm mb-1 outline-none transition-all"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Full Name"
                        autoFocus
                      />
                      <input
                        className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm outline-none transition-all"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{user.full_name || 'No Name'}</div>
                        {/* Admin badge for super admin */}
                        {user.email === 'jcibarathraj@gmail.com' && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xs font-bold shadow">Admin</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  )}
                  {/* Controls */}
                  <div className="flex flex-col gap-2 items-end min-w-[110px]">
                    {/* Admin status toggle placeholder */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-slate-400">Admin:</span>
                      <button
                        className="w-8 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-600 relative group"
                        title="Admin promotion/demotion coming soon! Add 'is_admin' or 'role' field to enable."
                        disabled
                      >
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 opacity-50" />
                      </button>
                    </div>
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => saveEdit(user.id)}>Save</Button>
                        <Button size="sm" variant="ghost" className="hover:bg-slate-200 dark:hover:bg-slate-700" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => startEdit(user)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="hover:bg-red-600" onClick={() => confirmDelete(user.id)}>Delete</Button>
                      </div>
                    )}
                  </div>
                  {/* Delete confirmation dialog */}
                  {deletingId === user.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 min-w-[280px] max-w-[90vw] border border-red-200 dark:border-red-800 animate-fade-in">
                        <div className="mb-4 text-lg font-semibold text-red-600">Delete User?</div>
                        <div className="mb-6 text-slate-600 dark:text-slate-300">Are you sure you want to delete <span className="font-bold">{user.full_name || user.email}</span>? This action cannot be undone.</div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="destructive" className="hover:bg-red-700" onClick={() => deleteUser(user.id)}>Delete</Button>
                          <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => setDeletingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin; 