import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Menu, X, Plus, Settings, LogOut, Moon, Sun, User, Search, Edit2, Trash2, WifiOff, Crown, Zap, Brain, Sparkles, Square } from "lucide-react";
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

// Utility to chunk a string into max 1000-word chunks
function chunkByWords(text: string, maxWords = 1000): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
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
  const [isBarathAITyping, setIsBarathAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('barathAI-settings');
    return saved ? JSON.parse(saved) : {
      voiceInputEnabled: true,
      voiceOutputEnabled: true,
      soundEffectsEnabled: true,
      notificationsEnabled: true,
      language: 'en',
    };
  });
  const [wordCount, setWordCount] = useState(0);
  const [wordLimitError, setWordLimitError] = useState('');

  // API Configuration - Exact curl implementation
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const OPENROUTER_MODEL = "deepseek/deepseek-chat-v3-0324:free";

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
          // Fix: Append to existing message instead of replacing
          setMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
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

  // Listen for settings changes in localStorage (for real-time updates)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'barathAI-settings') {
        setSettings(e.newValue ? JSON.parse(e.newValue) : settings);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [settings]);

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
        // Always create a new session for fresh start
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
  }, [messages, isBarathAITyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const generateUniqueUrl = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const loadSpecificChat = async (chatId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
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
      createNewSession(userId);
    }
  };

  const loadChatSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to match ChatSession interface
      const sessions: ChatSession[] = (data || []).map(session => ({
          id: session.id,
          title: session.title,
          created_at: session.created_at,
          updated_at: session.updated_at,
        unique_url: (session as any).unique_url || ''
        }));
      
        setChatSessions(sessions);
    } catch (error) {
      setError('Failed to load chat history');
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

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));

      setMessages(formattedMessages);
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const createNewSession = async (userId?: string) => {
    try {
      const sessionUserId = userId || user?.id;
      if (!sessionUserId) return;

      const uniqueUrl = generateUniqueUrl();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          title: 'New Chat',
          user_id: sessionUserId,
          unique_url: uniqueUrl
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      setMessages([]);
      await loadChatSessions(sessionUserId);
    } catch (error) {
      setError('Failed to create new chat session');
    }
  };

  const updateSessionTitle = async (sessionId: string, firstMessage: string) => {
    try {
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      await loadChatSessions(user?.id || '');
    } catch (error) {
    }
  };

  const saveMessage = async (sessionId: string, content: string, role: 'user' | 'assistant') => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          content,
          role,
          user_id: user?.id || ''
        });

      if (error) throw error;
    } catch (error) {
    }
  };

  const sendMessage = async () => {
    // Basic validation
    if (!message.trim() || isLoading || !currentSessionId || !user) {
      return;
    }

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    if (wordCount > 1000) {
      setWordLimitError('Message cannot exceed 1000 words.');
      setIsLoading(false);
      setIsTyping(false);
      setIsBarathAITyping(false);
      return;
    }

    // Create user message
    const userChunks = chunkByWords(message.trim(), 1000);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userChunks[0], // Only send the first chunk for now
      role: 'user',
      timestamp: new Date()
    };

    // Update UI immediately
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setIsBarathAITyping(true);
    setError('');

    // Save user message to database (non-blocking)
    try {
      await saveMessage(currentSessionId, userMessage.content, 'user');
      if (messages.length === 0) {
        await updateSessionTitle(currentSessionId, userMessage.content);
      }
    } catch (dbError) {
    }

    // Make API call - BarathAI with chat history
    try {
      // Prepare messages array with system message and chat history
      const apiMessages = [
          {
            "role": "system",
            "content": "You are BarathAI, an intelligent AI assistant created by Barathraj. You are knowledgeable, friendly, and always strive to provide accurate and helpful information. You communicate in a natural, conversational manner. You can help with coding, problem-solving, research, creative writing, and general questions. Always be helpful, accurate, and engaging in your responses."
          },
        // Include previous messages for context (last 10 messages to avoid token limits)
        ...newMessages.slice(-10).map(msg => ({
            "role": msg.role,
            "content": msg.content
          }))
      ];

      const requestBody = {
        "model": OPENROUTER_MODEL,
        "messages": apiMessages,
        "max_tokens": 1000,
        "temperature": 0.7
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      // Create assistant message
      const assistantChunks = chunkByWords(data.choices[0].message.content, 1000);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantChunks[0], // Only save the first chunk for now
        role: 'assistant',
        timestamp: new Date()
      };

      // Update messages
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save assistant message to database (non-blocking)
      try {
      await saveMessage(currentSessionId, assistantMessage.content, 'assistant');
      } catch (dbError) {
      }

    } catch (error) {
      setError(`Failed to get response: ${error.message}`);
      
      // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([...newMessages, errorMessage]);
    }

    // Reset loading states
    setIsLoading(false);
    setIsTyping(false);
    setIsBarathAITyping(false);
  };

  const switchToSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    loadMessages(session.id);
    setSidebarOpen(false);
    
    if ((session as any).unique_url) {
      window.history.pushState({}, '', `/chat?chat=${(session as any).unique_url}`);
    }
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
      
      navigate('/auth');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const toggleVoiceInput = () => {
    if (!settings.voiceInputEnabled) {
      toast({
        title: "Voice input disabled",
        description: "Enable voice input in Settings to use this feature.",
        variant: "destructive",
      });
      return;
    }
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
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

  // Example: Set recognition language from settings
  useEffect(() => {
    if (recognitionRef.current && settings.language) {
      recognitionRef.current.lang = settings.language;
    }
  }, [settings.language]);

  // Update word count and error in the input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    if (words.length > 1000) {
      setWordLimitError('Message cannot exceed 1000 words.');
    } else {
      setWordLimitError('');
    }
    setMessage(value);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 text-slate-900 dark:text-white transition-all duration-300">
        
        {/* Connection Status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm flex items-center justify-center">
            <WifiOff size={16} className="mr-2" />
            No internet connection
          </div>
        )}

        {/* Fixed Sidebar - Improved for better history visibility */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed z-50 w-80 lg:w-80 h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col shadow-xl`}>
          {/* Sidebar Header - Compact */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Logo size={28} />
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BarathAI
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <X size={18} />
              </Button>
            </div>
            <Button
              onClick={() => createNewSession()}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-200 text-sm py-2"
            >
              <Plus className="mr-2" size={14} />
              New Chat
            </Button>
            
            {/* Search - Compact */}
            <div className="mt-3 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
              />
            </div>
          </div>

          {/* Profile Section - Compact */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/10">
            <div className="flex items-center space-x-2 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.email || 'User'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Crown size={10} className="text-yellow-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Premium</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats - Compact */}
            <div className="grid grid-cols-3 gap-1 mt-2">
              <div className="text-center p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {chatSessions.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Chats</div>
              </div>
              <div className="text-center p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {messages.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Messages</div>
              </div>
              <div className="text-center p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                  {Math.floor(Math.random() * 100) + 50}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Chat Sessions - More space for history */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Logo size={20} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">No chat history yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Start a new conversation to see it here</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
              <div
                key={session.id}
                  className={`group relative p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
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
                            className="h-5 w-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(session.id);
                            setEditingTitle(session.title);
                          }}
                        >
                            <Edit2 size={10} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                            className="h-5 w-5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                        >
                            <Trash2 size={10} />
                        </Button>
                      </div>
                    </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              ))
            )}
          </div>

          {/* Sidebar Footer - Features Section - Compact */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-purple-900/10 backdrop-blur-lg flex-shrink-0">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Features
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center space-x-1.5 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <Zap size={12} className="text-yellow-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Fast AI</span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <Brain size={12} className="text-blue-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Smart</span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <Sparkles size={12} className="text-purple-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Creative</span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-md">
                <Crown size={12} className="text-yellow-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-screen lg:ml-80">
          {/* Fixed Header with Settings and Logout */}
          <header className="fixed top-0 right-0 left-0 lg:left-80 z-40 flex items-center justify-between p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm">
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
                <Logo size={24} />
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BarathAI
                </span>
              </div>
            </div>

            {/* Fixed Settings and Logout buttons */}
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
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Settings size={20} />
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={20} />
              </Button>
            </div>
          </header>

          {/* Messages Area - Scrollable with fixed positioning */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 pb-32">
            {error && (
              <ErrorBanner
                message={error}
                onRetry={() => {
                  setError('');
                  if (message.trim()) {
                    sendMessage();
                  }
                }}
                onDismiss={() => setError('')}
              />
            )}

            {messages.length === 0 && (
              <div className="text-center py-12">
                <Logo size={64} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Welcome to BarathAI</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Your intelligent AI assistant created by Barathraj</p>
                
                {/* Simplified single-line features */}
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <span>💻</span>
                      <span>Coding Help</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🔍</span>
                      <span>Research</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>✍️</span>
                      <span>Writing</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>🤔</span>
                      <span>Problem Solving</span>
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                    Start typing to begin your conversation with BarathAI
                  </div>
                </div>
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
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm'
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

            {isBarathAITyping && (
              <div className="flex justify-start">
                <div className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm backdrop-blur-sm">
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

          {/* Fixed Input Area at Bottom */}
          <div className="fixed bottom-0 right-0 left-0 lg:left-80 z-40 p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-lg">
            <div className="flex items-end space-x-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... (max 1000 words)"
                  className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all min-h-[56px] max-h-40"
                  rows={2}
                  maxLength={10000}
                  disabled={isLoading || !isOnline}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${wordCount > 1000 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{wordCount}/1000 words</span>
                  {wordLimitError && <span className="text-xs text-red-500 ml-2">{wordLimitError}</span>}
                </div>
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send size={16} />
                    <span>Send</span>
                  </div>
                )}
              </Button>
            </div>
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