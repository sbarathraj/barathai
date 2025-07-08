import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ErrorBanner } from "@/components/ErrorBoundary";
import { apiService, type ChatMessage } from "@/services/apiService";
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
  
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('barathAI-darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Apply dark mode
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
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Authentication and initialization
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
        await loadSpecificChat(chatId, session.user.id);
      } else {
        await loadChatSessions(session.user.id);
        await createNewSession(session.user.id);
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

  // Utility functions
  const generateUniqueUrl = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Database operations
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
        await createNewSession(userId);
        return;
      }

      setCurrentSessionId(data.id);
      await loadMessages(data.id);
      await loadChatSessions(userId);
    } catch (error) {
      console.error('Error loading specific chat:', error);
      await createNewSession(userId);
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

      const sessions: ChatSession[] = (data || []).map(session => ({
        id: session.id,
        title: session.title,
        created_at: session.created_at,
        updated_at: session.updated_at,
        unique_url: (session as any).unique_url || ''
      }));
      
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
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
      console.error('Error loading messages:', error);
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
      
      // Update URL without page reload
      window.history.pushState({}, '', `/chat?chat=${uniqueUrl}`);
    } catch (error) {
      console.error('Error creating new session:', error);
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
      console.error('Error updating session title:', error);
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
      console.error('Error saving message:', error);
    }
  };

  // Message handling
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !currentSessionId || !user) {
      return;
    }

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // Update UI immediately
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError('');

    try {
      // Save user message to database
      await saveMessage(currentSessionId, userMessage.content, 'user');
      
      // Update session title if this is the first message
      if (messages.length === 0) {
        await updateSessionTitle(currentSessionId, userMessage.content);
      }

      // Prepare messages for API
      const apiMessages: ChatMessage[] = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call API
      const response = await apiService.sendMessage(apiMessages);

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      // Update messages
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save assistant message to database
      await saveMessage(currentSessionId, assistantMessage.content, 'assistant');

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to get response: ${errorMessage}`);
      
      // Add error message to chat
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Session management
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    loadMessages(session.id);
    setSidebarOpen(false);
    
    if (session.unique_url) {
      window.history.pushState({}, '', `/chat?chat=${session.unique_url}`);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
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
          handleSelectSession(remainingSessions[0]);
        } else {
          await createNewSession();
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

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      setChatSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
      
      toast({
        title: "Success",
        description: "Chat session renamed successfully",
      });
    } catch (error) {
      console.error('Error renaming session:', error);
      setError('Failed to rename chat session');
    }
  };

  // UI handlers
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
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 text-slate-900 dark:text-white transition-all duration-300">
        
        {/* Connection Status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
            No internet connection
          </div>
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed z-50 lg:relative transition-transform duration-300`}>
          <ChatSidebar
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            onNewSession={() => createNewSession()}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            user={user}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-screen lg:ml-0">
          <ChatHeader
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onSettings={() => navigate('/settings')}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />

          {/* Error Banner */}
          {error && (
            <div className="pt-16 px-4">
              <ErrorBanner
                message={error}
                onRetry={() => {
                  setError('');
                  // Retry last message if available
                  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
                  if (lastUserMessage) {
                    handleSendMessage(lastUserMessage.content);
                  }
                }}
                onDismiss={() => setError('')}
              />
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 pt-16">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentSessionId={currentSessionId}
            />
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