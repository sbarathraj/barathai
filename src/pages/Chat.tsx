import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Menu, X, Plus, Settings, LogOut, Moon, Sun, User, Search, Edit2, Trash2, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TextToSpeech } from "@/components/TextToSpeech";
import { ErrorBanner, LoadingSpinner } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const OPENROUTER_API_KEY = "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";

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current!.continuous = false;
      recognitionRef.current!.interimResults = false;
      recognitionRef.current!.lang = 'en-US';

      recognitionRef.current!.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current!.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again or check microphone permissions",
          variant: "destructive",
        });
      };

      recognitionRef.current!.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  useEffect(() => {
    // Check authentication and get user
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
      setUser(session.user);
      loadChatSessions(session.user.id);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('barathAI-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode ?? true);
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setChatSessions(data.map(session => ({
          ...session,
          messages: []
        })));
        setCurrentSessionId(data[0].id);
        loadMessages(data[0].id);
      } else {
        createNewSession();
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setError('Failed to load chat sessions');
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat'
        })
        .select()
        .single();

      if (error) throw error;

      const newSession = {
        ...data,
        messages: []
      };

      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(data.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create new chat session');
    }
  };

  const updateSessionTitle = async (sessionId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setChatSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title } : session
      ));
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  const saveMessage = async (sessionId: string, content: string, role: 'user' | 'assistant') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content,
          role
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async (retryAttempt = false) => {
    if (!message.trim() || isLoading || !currentSessionId || !user) return;

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      role: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError('');

    if (!retryAttempt) {
      await saveMessage(currentSessionId, userMessage.content, 'user');
      
      if (messages.length === 0) {
        updateSessionTitle(currentSessionId, userMessage.content);
      }
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "BarathAI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3-0324:free",
          "messages": [
            {
              "role": "system",
              "content": "You are BarathAI, a helpful and intelligent AI assistant created by Barathraj. You are knowledgeable, friendly, and always strive to provide accurate and helpful information. You communicate in a natural, conversational manner."
            },
            ...newMessages.map(msg => ({
              "role": msg.role,
              "content": msg.content
            }))
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setRetryCount(0);

      await saveMessage(currentSessionId, assistantMessage.content, 'assistant');

    } catch (error) {
      console.error('Error sending message:', error);
      setRetryCount(prev => prev + 1);
      
      if (retryCount < 2) {
        setError(`Connection failed. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => sendMessage(true), 2000);
      } else {
        setError('Failed to get response. Please check your connection and try again.');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([...newMessages, errorMessage]);
        setRetryCount(0);
      }
    }

    setIsLoading(false);
    setIsTyping(false);
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
    setSidebarOpen(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (sessionId === currentSessionId) {
        const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
        if (remainingSessions.length > 0) {
          switchToSession(remainingSessions[0].id);
        } else {
          createNewSession();
        }
      }

      toast({
        title: "Success",
        description: "Chat session deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete chat session');
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setChatSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
      
      setEditingSessionId('');
      setEditingTitle('');
      
      toast({
        title: "Success",
        description: "Chat session renamed successfully",
      });
    } catch (error) {
      console.error('Error renaming session:', error);
      setError('Failed to rename chat session');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Voice input error",
          description: "Please check microphone permissions",
          variant: "destructive",
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gray-50 text-white dark:text-white text-slate-900">
        
        {/* Connection Status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm flex items-center justify-center">
            <WifiOff size={16} className="mr-2" />
            No internet connection
          </div>
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 w-80 lg:w-72 h-full bg-slate-800/90 backdrop-blur-lg border-r border-slate-700 dark:bg-slate-800/90 dark:border-slate-700 bg-white/90 border-slate-200 transition-transform duration-300`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700 dark:border-slate-700 border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Logo size={32} />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    BarathAI
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>
              <Button
                onClick={createNewSession}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl"
              >
                <Plus className="mr-2" size={16} />
                New Chat
              </Button>
              
              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700/50 dark:border-slate-600 bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Chat Sessions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${
                    session.id === currentSessionId
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-200/50'
                  }`}
                  onClick={() => switchToSession(session.id)}
                >
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => renameSession(session.id, editingTitle)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          renameSession(session.id, editingTitle);
                        }
                      }}
                      className="w-full bg-transparent text-white dark:text-white text-slate-900 text-sm font-medium focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white dark:text-white text-slate-900 truncate flex-1">
                          {session.title}
                        </p>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(session.id);
                              setEditingTitle(session.title);
                            }}
                          >
                            <Edit2 size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-400 dark:text-slate-400 dark:hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-1">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar Footer - Always visible */}
            <div className="p-4 border-t border-slate-700 dark:border-slate-700 border-slate-200 space-y-2 mt-auto">
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <Settings className="mr-2" size={16} />
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white/50 border-slate-200">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white"
              >
                <User size={20} />
              </Button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <ErrorBanner
                message={error}
                onRetry={() => {
                  setError('');
                  if (message.trim()) {
                    sendMessage(true);
                  }
                }}
                onDismiss={() => setError('')}
              />
            )}

            {messages.length === 0 && (
              <div className="text-center py-12">
                <Logo size={64} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white dark:text-white text-slate-900 mb-2">Welcome to BarathAI</h3>
                <p className="text-slate-400 dark:text-slate-400 text-slate-600">How can I help you today?</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-100 border border-slate-600 dark:bg-slate-700/50 dark:text-slate-100 dark:border-slate-600 bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <Logo size={24} className="mr-2" />
                      <span className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">BarathAI</span>
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                    {msg.role === 'assistant' && (
                      <TextToSpeech text={msg.content} className="ml-2" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700/50 border border-slate-600 dark:bg-slate-700/50 dark:border-slate-600 bg-slate-100 border-slate-300 p-4 rounded-2xl">
                  <div className="flex items-center mb-2">
                    <Logo size={24} className="mr-2" />
                    <span className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">BarathAI</span>
                  </div>
                  <LoadingSpinner message="Thinking..." />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-lg border-t border-slate-700 dark:bg-slate-800/50 dark:border-slate-700 bg-white/50 border-slate-200">
            <div className="flex items-end space-x-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="min-h-[60px] max-h-[120px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 resize-none pr-12 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all duration-200"
                  disabled={isLoading}
                />
                <Button
                  onClick={toggleVoiceInput}
                  variant="ghost"
                  size="icon"
                  className={`absolute right-2 top-2 transition-colors duration-200 ${
                    isListening 
                      ? 'text-red-400 hover:text-red-300 animate-pulse' 
                      : 'text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white hover:text-slate-600'
                  }`}
                >
                  {isListening ? (
                    <div className="relative">
                      <MicOff size={20} />
                      <div className="absolute -inset-1 bg-red-400/20 rounded-full animate-ping"></div>
                    </div>
                  ) : (
                    <Mic size={20} />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => sendMessage()}
                disabled={!message.trim() || isLoading || !isOnline}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
            
            {/* Voice Input Status */}
            {isListening && (
              <div className="flex items-center justify-center mt-2">
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
