
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Moon, Sun, Mic, MicOff, Trash2, Volume2, VolumeX, Bell, BellOff, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [voiceInput, setVoiceInput] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isClearing, setIsClearing] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('barathAI-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode ?? true);
      setVoiceInput(settings.voiceInput ?? false);
      setVoiceOutput(settings.voiceOutput ?? false);
      setSoundEffects(settings.soundEffects ?? true);
      setNotifications(settings.notifications ?? true);
      setLanguage(settings.language ?? 'en');
    }
  };

  const saveSettings = (newSettings: any) => {
    const settings = {
      darkMode,
      voiceInput,
      voiceOutput,
      soundEffects,
      notifications,
      language,
      ...newSettings
    };
    localStorage.setItem('barathAI-settings', JSON.stringify(settings));
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    saveSettings({ darkMode: enabled });
    // Apply theme immediately
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleVoiceInputToggle = (enabled: boolean) => {
    setVoiceInput(enabled);
    saveSettings({ voiceInput: enabled });
    toast({
      title: enabled ? "Voice Input Enabled" : "Voice Input Disabled",
      description: enabled ? "You can now use the microphone to speak your messages" : "Voice input has been turned off",
    });
  };

  const handleVoiceOutputToggle = (enabled: boolean) => {
    setVoiceOutput(enabled);
    saveSettings({ voiceOutput: enabled });
    toast({
      title: enabled ? "Voice Output Enabled" : "Voice Output Disabled",
      description: enabled ? "AI responses will be read aloud" : "AI responses will be text-only",
    });
  };

  const handleSoundEffectsToggle = (enabled: boolean) => {
    setSoundEffects(enabled);
    saveSettings({ soundEffects: enabled });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotifications(enabled);
    saveSettings({ notifications: enabled });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    saveSettings({ language: newLanguage });
    toast({
      title: "Language Updated",
      description: `Language changed to ${newLanguage === 'en' ? 'English' : newLanguage === 'es' ? 'Spanish' : 'French'}`,
    });
  };

  const handleClearChatHistory = async () => {
    setIsClearing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete all chat sessions and messages for the user
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Chat History Cleared",
        description: "All your chat history has been permanently deleted",
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-white text-white dark:text-white text-slate-900">
        <div className="container mx-auto max-w-4xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/chat')}
                className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-slate-400 dark:text-slate-400 text-slate-600">
                  Customize your BarathAI experience
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of BarathAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Dark Mode</label>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
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

            {/* Voice Assistant Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic size={20} />
                  <span>Voice Assistant</span>
                </CardTitle>
                <CardDescription>
                  Configure voice input and output settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Voice Input</label>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                      Enable speech-to-text for message input
                    </p>
                  </div>
                  <Switch
                    checked={voiceInput}
                    onCheckedChange={handleVoiceInputToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <Separator className="bg-slate-700 dark:bg-slate-700 bg-slate-200" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Voice Output</label>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                      Enable text-to-speech for AI responses
                    </p>
                  </div>
                  <Switch
                    checked={voiceOutput}
                    onCheckedChange={handleVoiceOutputToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio & Notifications */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 size={20} />
                  <span>Audio & Notifications</span>
                </CardTitle>
                <CardDescription>
                  Control sound effects and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      <label className="text-sm font-medium">Sound Effects</label>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                      Play sounds for interactions and notifications
                    </p>
                  </div>
                  <Switch
                    checked={soundEffects}
                    onCheckedChange={handleSoundEffectsToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <Separator className="bg-slate-700 dark:bg-slate-700 bg-slate-200" />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {notifications ? <Bell size={16} /> : <BellOff size={16} />}
                      <label className="text-sm font-medium">Notifications</label>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                      Receive notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={handleNotificationsToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="bg-slate-800/50 border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe size={20} />
                  <span>Language</span>
                </CardTitle>
                <CardDescription>
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Interface Language</label>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600">
                      Select the language for the interface
                    </p>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 dark:bg-slate-700 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 dark:bg-slate-700 dark:border-slate-600">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-slate-800/50 border-slate-700 border-red-900/20 dark:bg-slate-800/50 dark:border-slate-700 dark:border-red-900/20 bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-400">
                  <Trash2 size={20} />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your chat data and history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-900/10 border border-red-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-red-400 mb-2">
                      Clear Chat History
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600 mb-4">
                      This will permanently delete all your chat conversations. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isClearing}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 size={16} className="mr-2" />
                          {isClearing ? 'Clearing...' : 'Clear All History'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700 dark:bg-slate-800 dark:border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">
                            Clear Chat History
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300 dark:text-slate-300">
                            Are you sure you want to delete all your chat history? This action cannot be undone and will permanently remove all your conversations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearChatHistory}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-400 text-slate-600">
              Created with ❤️ by Barathraj — BarathAI © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
