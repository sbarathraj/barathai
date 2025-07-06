
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Menu, X, Plus, Settings, LogOut, Moon, Sun, User, Search, Edit2, Trash2, WifiOff } from "lucide-react";
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
  created_at: string;
  updated_at: string;
  unique_url: string;
}

export const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('barathAI-darkMode');
    return saved ? JSON.parse(saved) : true;
  });
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
  const recognitionRef = useRef<any>(null);

  const OPENROUTER_API_KEY = "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";

  // Apply dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('barathAI-darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice input error",
            description: "Please try again or check microphone permissions",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [toast]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
      setUser(session.user);
      
      const urlParams = new URLSearchParams(window.location.search);
      const chatId = urlParams.get('chat');
      
      if (chatId) {
        loadSpecificChat(chatId, session.user.id);
      } else {
        await loadChatSessions(session.user.id);
        createNewSession(session.user.id);
      }
    };

    initAuth();

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateUniqueUrl = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const loadSpecificChat = async (chatId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions_new')
        .select('*')
        .eq('unique_url', chatId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        toast({
          title: "Chat not found",
          description: "The requested chat session could not be found.",
          variant: "destructive",
        });
        createNewSession(userId);
        return;
      }

      setCurrentSessionId(data.id);
      loadMessages(data.id);
      loadChatSessions(userId);
    } catch (error) {
      console.error('Error loading specific chat:', error);
      createNewSession(userId);
    }
  };

  const loadChatSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions_new')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const sessions: ChatSession[] = data.map(session => ({
          id: session.id,
          title: session.title,
          created_at: session.created_at,
          updated_at: session.updated_at,
          unique_url: session.unique_url
        }));
        setChatSessions(sessions);
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

      const formattedMessages: Message[] = data?.map(msg => ({
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

  const createNewSession = async (userId?: string) => {
    const currentUserId = userId || user?.id;
    if (!currentUserId) return;

    try {
      const uniqueUrl = generateUniqueUrl();
      const { data, error } = await supabase
        .from('chat_sessions_new')
        .insert({
          user_id: currentUserId,
          title: 'New Chat',
          unique_url: uniqueUrl
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Error",
          description: "Failed to create new chat session: " + error.message,
          variant: "destructive",
        });
        return;
      }

      const newSession: ChatSession = {
        id: data.id,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at,
        unique_url: data.unique_url
      };

      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(data.id);
      setMessages([]);
      setSidebarOpen(false);
      
      window.history.pushState({}, '', `/chat?chat=${uniqueUrl}`);
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
    }
  };

  const updateSessionTitle = async (sessionId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    try {
      const { error } = await supabase
        .from('chat_sessions_new')
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

  const switchToSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    loadMessages(session.id);
    setSidebarOpen(false);
    
    if (session.unique_url) {
      window.history.pushState({}, '', `/chat?chat=${session.unique_url}`);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions_new')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (sessionId === currentSessionId) {
        const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
        if (remainingSessions.length > 0) {
          switchToSession(remainingSessions[0]);
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
        .from('chat_sessions_new')
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
      <div className="flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
        
        {/* Connection Status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm flex items-center justify-center">
            <WifiOff size={16} className="mr-2" />
            No internet connection
          </div>
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 w-80 lg:w-72 h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Logo size={32} />
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BarathAI
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
            <Button
              onClick={() => createNewSession()}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-200"
            >
              <Plus className="mr-2" size={16} />
              New Chat
            </Button>
            
            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Chat Sessions - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  session.id === currentSessionId
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => switchToSession(session)}
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
                    className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-medium focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate flex-1">
                        {session.title}
                      </p>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
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
                          className="h-6 w-6 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Fixed Sidebar Footer - Always Visible */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg flex-shrink-0">
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <Settings className="mr-2" size={16} />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Professional Header */}
          <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors duration-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors duration-200"
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
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Welcome to BarathAI</h3>
                <p className="text-slate-600 dark:text-slate-400">How can I help you today?</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <Logo size={24} className="mr-2" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BarathAI</span>
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
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <Logo size={24} className="mr-2" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BarathAI</span>
                  </div>
                  <LoadingSpinner message="Thinking..." />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex items-end space-x-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="min-h-[60px] max-h-[120px] bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all duration-200 shadow-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={toggleVoiceInput}
                  variant="ghost"
                  size="icon"
                  className={`absolute right-2 top-2 transition-colors duration-200 ${
                    isListening 
                      ? 'text-red-500 hover:text-red-400 animate-pulse' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg disabled:shadow-none"
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
                <div className="flex items-center space-x-2 text-red-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 lg:hidden z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
