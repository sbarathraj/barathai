
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface UserManagementTabProps {
  currentUser: any;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditName(user.full_name || '');
    setEditEmail(user.email || '');
    setEditStatus(user.account_status || 'active');
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: editName, 
        email: editEmail, 
        account_status: editStatus,
        modified_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      setToast({ type: 'error', message: 'Failed to update user.' });
    } else {
      setToast({ type: 'success', message: 'User updated successfully.' });
      fetchUsers(); // Refresh the list
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus, modified_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      setToast({ type: 'error', message: 'Failed to update user status.' });
    } else {
      setToast({ type: 'success', message: `User status updated to ${newStatus}.` });
      fetchUsers();
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!isAdmin) {
    return <div className="text-center text-red-500 p-4">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">User Management</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-32 text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            getInitials(user.full_name)
                          )}
                        </div>
                        {editingId === user.id ? (
                          <div className="flex flex-col gap-1">
                            <input
                              className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm outline-none"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              placeholder="Full Name"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">
                              {user.full_name || 'No Name'}
                            </div>
                            {user.email === 'jcibarathraj@gmail.com' && (
                              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xs font-bold">Admin</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <input
                          className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm outline-none"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300">{user.email}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <select
                          className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm outline-none"
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.account_status === 'active' ? 'bg-green-100 text-green-800' :
                          user.account_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          user.account_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.account_status || 'active'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-500 text-sm">
                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-500 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-500 text-sm">
                        {user.modified_at ? new Date(user.modified_at).toLocaleDateString() : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === user.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => saveEdit(user.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                            Edit
                          </Button>
                          {user.account_status !== 'suspended' && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => updateUserStatus(user.id, 'suspended')}
                            >
                              Suspend
                            </Button>
                          )}
                          {user.account_status === 'suspended' && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={() => updateUserStatus(user.id, 'active')}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementTab;
