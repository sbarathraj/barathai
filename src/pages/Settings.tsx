
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Moon, Sun, Mic, Volume2, Trash2, Bell, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(true);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('barathAI-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode ?? true);
      setVoiceInputEnabled(settings.voiceInputEnabled ?? true);
      setVoiceOutputEnabled(settings.voiceOutputEnabled ?? true);
      setSoundEffectsEnabled(settings.soundEffectsEnabled ?? true);
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setSelectedLanguage(settings.language ?? 'en');
    }

    // Apply theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    const settings = {
      darkMode,
      voiceInputEnabled,
      voiceOutputEnabled,
      soundEffectsEnabled,
      notificationsEnabled,
      language: selectedLanguage,
      ...newSettings
    };
    
    localStorage.setItem('barathAI-settings', JSON.stringify(settings));
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    saveSettings({ darkMode: enabled });
  };

  const clearChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat history cleared successfully",
      });
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gray-50 text-white dark:text-white text-slate-900 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-slate-700 dark:border-slate-700 border-slate-200">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/chat')}
                className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white hover:text-slate-600"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center space-x-3">
                <Logo size={32} />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Appearance Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white dark:text-white text-slate-900">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Customize the look and feel of BarathAI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Dark Mode</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white dark:text-white text-slate-900">
                  <Mic size={20} />
                  <span>Voice Assistant</span>
                </CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Configure voice input and output settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Voice Input</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Enable speech-to-text functionality
                    </p>
                  </div>
                  <Switch
                    checked={voiceInputEnabled}
                    onCheckedChange={(enabled) => {
                      setVoiceInputEnabled(enabled);
                      saveSettings({ voiceInputEnabled: enabled });
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 size={16} className="text-slate-400 dark:text-slate-400 text-slate-600" />
                    <div>
                      <p className="font-medium text-white dark:text-white text-slate-900">Voice Output</p>
                      <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                        Enable text-to-speech for AI responses
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={voiceOutputEnabled}
                    onCheckedChange={(enabled) => {
                      setVoiceOutputEnabled(enabled);
                      saveSettings({ voiceOutputEnabled: enabled });
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio & Notifications */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white dark:text-white text-slate-900">
                  <Bell size={20} />
                  <span>Audio & Notifications</span>
                </CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Manage sound effects and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Sound Effects</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Play sounds for various actions
                    </p>
                  </div>
                  <Switch
                    checked={soundEffectsEnabled}
                    onCheckedChange={(enabled) => {
                      setSoundEffectsEnabled(enabled);
                      saveSettings({ soundEffectsEnabled: enabled });
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Notifications</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={(enabled) => {
                      setNotificationsEnabled(enabled);
                      saveSettings({ notificationsEnabled: enabled });
                    }}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white dark:text-white text-slate-900">
                  <Globe size={20} />
                  <span>Language</span>
                </CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Interface Language</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Select the language for the interface
                    </p>
                  </div>
                  <Select
                    value={selectedLanguage}
                    onValueChange={(value) => {
                      setSelectedLanguage(value);
                      saveSettings({ language: value });
                    }}
                  >
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white border-slate-300 text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white border-slate-300 text-slate-900">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white dark:text-white text-slate-900">
                  <Trash2 size={20} />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Manage your chat data and history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white dark:text-white text-slate-900">Clear Chat History</p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
                      Permanently delete all your chat conversations
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowClearDialog(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Clear History Confirmation Dialog */}
            {showClearDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4 bg-slate-800 border-slate-700 dark:bg-slate-800 dark:border-slate-700 bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-white dark:text-white text-slate-900">Confirm Deletion</CardTitle>
                    <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-600">
                      Are you sure you want to clear all your chat history? This action cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex space-x-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowClearDialog(false)}
                      className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white hover:text-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={clearChatHistory}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};
