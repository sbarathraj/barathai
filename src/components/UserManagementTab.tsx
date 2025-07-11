
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFileExcel } from '@fortawesome/free-solid-svg-icons';

const getInitials = (name: string | null) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper for date-time formatting
const formatDateTime = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-');
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
  const [editRole, setEditRole] = useState('user');
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
    setEditRole(user.role || 'user');
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: editName, 
        email: editEmail, 
        account_status: editStatus,
        role: editRole,
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
      Status: u.account_status,
      Role: u.role,
      Created: u.created_at,
      Modified: u.modified_at,
      LastLogin: u.last_login
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
      { wch: 24 }, { wch: 24 }, { wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 24 }
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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">User Management</h3>
        
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
            <Table className="min-w-[700px] text-xs sm:text-sm md:text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
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
                      <div className="flex items-center gap-2 sm:gap-3 flex-col sm:flex-row items-start sm:items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                          <FontAwesomeIcon icon={faUser} size="lg" className="text-white drop-shadow" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #f472b6 100%)', borderRadius: '50%', padding: '4px' }} />
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
                      {editingId === user.id ? (
                        <select
                          className="border border-blue-300 focus:border-blue-500 rounded px-2 py-1 text-sm outline-none"
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300">{user.role || 'user'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">
                        {user.last_login ? formatDateTime(user.last_login) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">
                        {user.created_at ? formatDateTime(user.created_at) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-mono">
                        {user.modified_at ? formatDateTime(user.modified_at) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {editingId === user.id ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(user.id)} className="bg-blue-500 text-white w-full sm:w-auto">Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} className="w-full sm:w-auto">Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => startEdit(user)} className="bg-blue-500 text-white w-full sm:w-auto">Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => updateUserStatus(user.id, user.account_status === 'active' ? 'inactive' : 'active')} className="w-full sm:w-auto">
                              {user.account_status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </>
                        )}
                      </div>
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
