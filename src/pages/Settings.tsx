import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  Palette,
  Monitor,
  Smartphone,
  Activity,
  Zap,
  Database,
  Clock,
  TrendingUp,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Users,
  Calendar,
  UserCheck
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

interface UsageStats {
  totalApiCalls: number;
  totalImages: number;
  todayApiCalls: number;
  todayImages: number;
  avgResponseTime: number;
  successRate: number;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // User & Profile State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('barathAI-darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [themeTransition, setThemeTransition] = useState(false);

  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Admin Password Visibility State
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Usage Stats State
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalApiCalls: 0,
    totalImages: 0,
    todayApiCalls: 0,
    todayImages: 0,
    avgResponseTime: 0,
    successRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);



  useEffect(() => {
    initializeSettings();
  }, []);

  useEffect(() => {
    // Animate theme transition
    if (themeTransition) {
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';

      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      localStorage.setItem('barathAI-darkMode', JSON.stringify(darkMode));

      setTimeout(() => {
        document.documentElement.style.transition = '';
        setThemeTransition(false);
      }, 300);
    }
  }, [darkMode, themeTransition]);

  const initializeSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const adminEmail = 'jcibarathraj@gmail.com';
      setIsAdmin(session.user.email === adminEmail);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
      }

      // Fetch usage statistics only for admin
      if (session.user.email === adminEmail) {
        await fetchUsageStats(session.user.id);
      }

    } catch (error) {
      console.error('Error initializing settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async (userId: string) => {
    try {
      setStatsLoading(true);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch API usage stats
      const { count: totalApiCalls } = await supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: todayApiCalls } = await supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today);

      // Fetch image generation stats
      const { count: totalImages } = await supabase
        .from('image_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: todayImages } = await supabase
        .from('image_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today);

      // Calculate average response time and success rate
      const { data: apiLogs } = await supabase
        .from('api_usage_logs')
        .select('response_time, status_code')
        .eq('user_id', userId)
        .limit(100);

      let avgResponseTime = 0;
      let successRate = 0;

      if (apiLogs && apiLogs.length > 0) {
        const responseTimes = apiLogs
          .filter(log => log.response_time)
          .map(log => typeof log.response_time === 'string' ? parseInt(log.response_time) : log.response_time);

        avgResponseTime = responseTimes.length > 0
          ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
          : 0;

        const successfulCalls = apiLogs.filter(log =>
          log.status_code >= 200 && log.status_code < 300
        ).length;

        successRate = Math.round((successfulCalls / apiLogs.length) * 100);
      }

      setUsageStats({
        totalApiCalls: totalApiCalls || 0,
        totalImages: totalImages || 0,
        todayApiCalls: todayApiCalls || 0,
        todayImages: todayImages || 0,
        avgResponseTime,
        successRate
      });

    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    setThemeTransition(true);
    setDarkMode(!darkMode);
  };

  const refreshStats = () => {
    if (user) {
      fetchUsageStats(user.id);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        return;
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);

    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Theme */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 dark:text-slate-100">{user?.email}</p>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          {showAdminPassword ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {isAdmin && showAdminPassword && (
                      <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-400 border">
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3" />
                          <span>Admin Password: ••••••••••••</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Password hidden for security. Use Change Password to update.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode
                      ? 'bg-slate-800 text-yellow-400'
                      : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {darkMode ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {darkMode ? 'Easy on the eyes' : 'Bright and clear'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={handleThemeToggle}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-center">
                    <Monitor className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs font-medium">Auto</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center opacity-50">
                    <Sun className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Light</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center opacity-50">
                    <Moon className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Dark</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Preferences */}
          <div className="space-y-6">
            {/* Notification Settings */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Push Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about important updates</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Email Updates</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly usage reports</p>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Auto-save Chats</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Automatically save conversations</p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">Compact Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Reduce spacing and padding</p>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Usage Stats (Admin Only) */}
          <div className="space-y-6">
            {isAdmin && (
              <>
                {/* Real-time Usage Stats */}
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        Usage Statistics
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshStats}
                        disabled={statsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {usageStats.totalApiCalls}
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-300">Total API Calls</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {usageStats.totalImages}
                        </div>
                        <div className="text-xs text-purple-500 dark:text-purple-300">Images Generated</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">Today's API Calls</span>
                        </div>
                        <Badge variant="secondary">{usageStats.todayApiCalls}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">Today's Images</span>
                        </div>
                        <Badge variant="secondary">{usageStats.todayImages}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">Avg Response Time</span>
                        </div>
                        <Badge variant="outline">{usageStats.avgResponseTime}ms</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">Success Rate</span>
                        </div>
                        <Badge
                          variant={usageStats.successRate >= 95 ? "default" : "destructive"}
                        >
                          {usageStats.successRate}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Security */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Change Password */}
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>

                  {showPasswordChange && (
                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="bg-white/50 dark:bg-slate-800/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-white/50 dark:bg-slate-800/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="bg-white/50 dark:bg-slate-800/50"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={changingPassword}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          {changingPassword ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4 mr-2" />
                              Update Password
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          disabled={changingPassword}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <Button variant="destructive" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/chat')}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate('/admin')}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://docs.barathAI.com', '_blank')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;