
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent } from './ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper for date formatting (dd/mm/yyyy)
const formatDateTime = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  // Add avatar_url state
  const [editAvatar, setEditAvatar] = useState('');
  // Remove all role-related state and logic
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isAdmin = currentUser?.email === 'jcibarathraj@gmail.com';
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
    setEditAvatar(user.avatar_url || '');
    setEditDialogOpen(true);
    // No scrolling
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: editName, 
        email: editEmail, 
        account_status: editStatus,
        avatar_url: editAvatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      setToast({ type: 'error', message: 'Failed to update user.' });
    } else {
      setToast({ type: 'success', message: 'User updated successfully.' });
      fetchUsers(); // Refresh the list
    }
    setEditingId(null);
    setEditDialogOpen(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDialogOpen(false);
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus, modified_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update user status:', error);
      setToast({ type: 'error', message: `Failed to update user status: ${error.message}` });
    } else {
      setToast({ type: 'success', message: `User status updated to ${newStatus}.` });
      fetchUsers();
    }
  };

  const exportToExcel = () => {
    const data = users.map(u => ({
      ID: u.id,
      Name: u.full_name,
      Email: u.email,
      Avatar: u.avatar_url,
      Status: u.account_status,
      Created: u.created_at,
      Updated: u.updated_at,
      Modified: u.modified_at
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    // Add colored header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: 'F472B6' } }, // pink
          font: { color: { rgb: 'FFFFFF' }, bold: true },
          alignment: { horizontal: 'center' }
        };
      }
    }
    ws['!cols'] = [
      { wch: 24 }, { wch: 24 }, { wch: 32 }, { wch: 32 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 24 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `users_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>
      )}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 sm:p-8 shadow-xl border border-white/30 dark:border-slate-800/40 backdrop-blur-xl overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">User Management</h3>
        {loading ? (
          <div className="flex justify-center items-center h-32 text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Button
              onClick={exportToExcel}
              className="mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 hover:from-green-500 hover:to-blue-500 transition-all duration-200 border-0 w-full sm:w-auto text-base sm:text-lg"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-white mr-2" />
              Export to Excel
            </Button>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
              <Table className="min-w-[900px] text-xs sm:text-sm md:text-base">
                <TableHeader className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <TableRow>
                    <TableHead className="py-3">Avatar</TableHead>
                    <TableHead className="py-3">User</TableHead>
                    <TableHead className="py-3">Email</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                    <TableHead className="py-3">Last Login</TableHead>
                    <TableHead className="py-3">Created</TableHead>
                    <TableHead className="py-3">Updated</TableHead>
                    <TableHead className="py-3">Modified</TableHead>
                    <TableHead className="py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-blue-50/40 dark:hover:bg-pink-900/10 transition-colors">
                      <TableCell>
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-pink-400 shadow"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name || user.email || 'User') + '&background=random'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white text-xl border-2 border-blue-200 dark:border-pink-400 shadow">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-100">{user.full_name || 'No Name'}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-300">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.account_status === 'active' ? 'bg-green-100 text-green-800' :
                          user.account_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          user.account_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.account_status || 'active'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">{user.last_login ? formatDateTime(user.last_login) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">{user.created_at ? formatDateTime(user.created_at) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">{user.updated_at ? formatDateTime(user.updated_at) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">{user.modified_at ? formatDateTime(user.modified_at) : '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" onClick={() => startEdit(user)} className="bg-blue-500 text-white w-full sm:w-auto">Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => updateUserStatus(user.id, user.account_status === 'active' ? 'inactive' : 'active')} className="w-full sm:w-auto">
                            {user.account_status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      {/* Edit Dialog/Drawer for mobile/desktop */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <div className="p-6 max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">Edit User</h2>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
            <input className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" />
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
            <input className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" />
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Avatar URL</label>
            <input className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} placeholder="Avatar URL" />
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</label>
            <select className="border border-blue-300 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white/80 dark:bg-slate-800/80" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => saveEdit(editingId!)} className="bg-blue-500 text-white flex-1">Save</Button>
              <Button variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTab;
