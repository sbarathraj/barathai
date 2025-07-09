
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Activity, 
  Settings, 
  Bell, 
  Search,
  RefreshCw,
  Ban,
  CheckCircle,
  AlertTriangle,
  Mail,
  Eye,
  Trash2,
  Calendar,
  Globe,
  Zap
} from 'lucide-react';

interface DashboardStats {
  promptHits: number;
  voiceHits: number;
  totalUsers: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  is_blocked: boolean;
  usage_count: number;
  usage_limit: number;
}

interface ApiLog {
  id: string;
  user_email: string;
  endpoint: string;
  created_at: string;
  response_time: number;
  status_code: number;
  request_type: string;
}

interface AdminSettings {
  voice_input_enabled: boolean;
  voice_output_enabled: boolean;
  chat_history_enabled: boolean;
}

interface Alert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  is_active: boolean;
  created_at: string;
}

interface AdminMessage {
  id: string;
  from_user_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({ promptHits: 0, voiceHits: 0, totalUsers: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({ 
    voice_input_enabled: true, 
    voice_output_enabled: true, 
    chat_history_enabled: true 
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      if (session.user.email !== 'jcibarathraj@gmail.com') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setUser(session.user);
      await loadDashboardData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/auth');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadApiLogs(),
        loadSettings(),
        loadAlerts(),
        loadMessages()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [promptResult, voiceResult, userResult] = await Promise.all([
        supabase.rpc('get_api_usage_count', { request_type_filter: 'prompt' }),
        supabase.rpc('get_api_usage_count', { request_type_filter: 'voice' }),
        supabase.rpc('get_user_count')
      ]);

      setStats({
        promptHits: promptResult.data || 0,
        voiceHits: voiceResult.data || 0,
        totalUsers: userResult.data || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: limits } = await supabase
        .from('user_limits')
        .select('*');

      const userList = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        created_at: profile.created_at,
        is_blocked: limits?.find(l => l.user_id === profile.id)?.is_blocked || false,
        usage_count: limits?.find(l => l.user_id === profile.id)?.current_usage || 0,
        usage_limit: limits?.find(l => l.user_id === profile.id)?.usage_limit || 100
      })) || [];

      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadApiLogs = async () => {
    try {
      const { data } = await supabase
        .from('api_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setApiLogs(data || []);
    } catch (error) {
      console.error('Error loading API logs:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*');

      if (data) {
        const settingsObj: AdminSettings = {
          voice_input_enabled: true,
          voice_output_enabled: true,
          chat_history_enabled: true
        };

        data.forEach(setting => {
          if (setting.setting_key in settingsObj) {
            settingsObj[setting.setting_key as keyof AdminSettings] = setting.setting_value === 'true';
          }
        });

        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const toggleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('user_limits')
        .upsert({
          user_id: userId,
          is_blocked: !isBlocked,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error toggling user block:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const updateUserLimit = async (userId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('user_limits')
        .upsert({
          user_id: userId,
          usage_limit: newLimit,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User limit updated successfully",
      });

      await loadUsers();
    } catch (error) {
      console.error('Error updating user limit:', error);
      toast({
        title: "Error",
        description: "Failed to update user limit",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (key: keyof AdminSettings, value: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: value.toString(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('admin_alerts')
        .update({
          is_active: false,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert acknowledged",
      });

      await loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: user?.id
        })
        .eq('id', messageId);

      if (error) throw error;

      await loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">Welcome back, {user?.email}</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              API Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-600">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-600">
              <Mail className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Prompt API Hits</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.promptHits}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadStats}
                    className="text-slate-400 hover:text-white mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Voice API Hits</CardTitle>
                  <Zap className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.voiceHits}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadStats}
                    className="text-slate-400 hover:text-white mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadStats}
                    className="text-slate-400 hover:text-white mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Signup Date</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Usage</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-slate-700">
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_blocked ? "destructive" : "default"}>
                            {user.is_blocked ? "Blocked" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {user.usage_count} / {user.usage_limit}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                              className="text-slate-400 hover:text-white"
                            >
                              {user.is_blocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            <Input
                              type="number"
                              value={user.usage_limit}
                              onChange={(e) => updateUserLimit(user.id, parseInt(e.target.value))}
                              className="w-20 bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">API Usage Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">User Email</TableHead>
                      <TableHead className="text-slate-300">Endpoint</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Response Time</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.map((log) => (
                      <TableRow key={log.id} className="border-slate-700">
                        <TableCell className="text-white">{log.user_email || 'Anonymous'}</TableCell>
                        <TableCell className="text-slate-300">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant={log.request_type === 'prompt' ? 'default' : 'secondary'}>
                            {log.request_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{log.response_time}ms</TableCell>
                        <TableCell>
                          <Badge variant={log.status_code === 200 ? 'default' : 'destructive'}>
                            {log.status_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Global Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Voice Input</Label>
                    <p className="text-slate-400 text-sm">Enable voice input for users</p>
                  </div>
                  <Switch
                    checked={settings.voice_input_enabled}
                    onCheckedChange={(checked) => updateSetting('voice_input_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Voice Output</Label>
                    <p className="text-slate-400 text-sm">Enable voice output for users</p>
                  </div>
                  <Switch
                    checked={settings.voice_output_enabled}
                    onCheckedChange={(checked) => updateSetting('voice_output_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Chat History</Label>
                    <p className="text-slate-400 text-sm">Enable chat history for users</p>
                  </div>
                  <Switch
                    checked={settings.chat_history_enabled}
                    onCheckedChange={(checked) => updateSetting('chat_history_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                          <h3 className="text-white font-medium">{alert.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {alert.alert_type}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mt-1">{alert.message}</p>
                        <p className="text-slate-400 text-xs mt-2">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No active alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-medium">{message.subject}</h3>
                            {!message.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">From: {message.from_user_email}</p>
                          <p className="text-slate-300 mt-2">{message.message}</p>
                          <p className="text-slate-400 text-xs mt-2">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {!message.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No messages
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-slate-400 text-sm border-t border-slate-700 pt-4">
          Admin Panel — Created by Barathraj — BarathAI © 2025
        </div>
      </div>
    </div>
  );
};
