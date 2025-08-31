import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Menu, X, Plus, Settings, LogOut, Moon, Sun, User, Search, Edit2, Trash2, WifiOff, Crown, Zap, Brain, Sparkles, Copy, Check, Lock, User as UserIcon, ImageIcon, Loader2, Eye, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfessionalMarkdown } from "@/components/ProfessionalMarkdown";
import { TextToSpeech } from "@/components/TextToSpeech";
import { ErrorBanner, LoadingSpinner } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  unique_url: string;
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 h-6">
    <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
    <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
    <span className="block w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
  </div>
);

export const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('barathAI-darkMode');
    // Default to light mode (false) unless user has explicitly chosen dark
    return saved ? JSON.parse(saved) : false;
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBarathAITyping, setIsBarathAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [wordCount, setWordCount] = useState(0);
  const [wordLimitError, setWordLimitError] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const inputRefContainer = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState<number>(0);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageLoadingByMessageId, setImageLoadingByMessageId] = useState<Record<string, boolean>>({});
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerSrc, setImageViewerSrc] = useState<string | null>(null);
  const [imageErrorByMessageId, setImageErrorByMessageId] = useState<Record<string, boolean>>({});
  const [recentImages, setRecentImages] = useState<Array<{id: string, image_url: string, prompt: string, created_at: string}>>([]);

  // API Configuration
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const OPENROUTER_API_KEY2 = import.meta.env.VITE_OPENROUTER_API_KEY2;
  const API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const API_URL2 = import.meta.env.VITE_OPENROUTER_API_URL2 || API_URL;
  const OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";

  // Clean up empty "New Chat" sessions (keep only the most recent one)
  const cleanupEmptyNewChats = async (userId: string) => {
    const { data: sessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .eq('title', 'New Chat')
      .order('created_at', { ascending: true });

    if (sessionError || !sessions) return;

    // Find all unused 'New Chat' sessions (no messages)
    const unusedNewChats: { id: string, created_at: string }[] = [];
    for (const session of sessions) {
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('id')
          .eq('session_id', session.id)
          .limit(1);
        if (msgError) continue;
        if (!messages || messages.length === 0) {
          unusedNewChats.push({ id: session.id, created_at: session.created_at });
        }
      }

    // If we have multiple empty "New Chat" sessions, keep only the newest one
    if (unusedNewChats.length > 1) {
    // Sort by created_at (newest last)
    unusedNewChats.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      // Delete all except the newest (last in sorted array)
      const idsToDelete = unusedNewChats.slice(0, -1).map(s => s.id);
      await Promise.all(idsToDelete.map(id =>
        supabase
          .from('chat_sessions')
          .delete()
          .eq('id', id)
      ));
    }
  };

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
      setSessionsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        setSessionsLoading(false);
        return;
      }
      setSession(session);
      setUser(session.user);
      // Fetch user profile (full_name)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);
      
      // Load recent images
      await loadRecentImages();
      
      const urlParams = new URLSearchParams(window.location.search);
      const chatId = urlParams.get('chat');
      
      if (chatId) {
        await loadSpecificChat(chatId, session.user.id);
        setSessionsLoading(false);
      } else {
        await loadChatSessions(session.user.id);
        await cleanupEmptyNewChats(session.user.id);
        // Re-fetch sessions after cleanup
        await loadChatSessions(session.user.id);
        
        // Check if we need to create a "New Chat" session
        const { data: existingSessions } = await supabase
          .from('chat_sessions')
          .select('id, title')
          .eq('user_id', session.user.id)
          .eq('title', 'New Chat');
        
        const hasEmptyNewChat = existingSessions && existingSessions.length > 0;
        if (!hasEmptyNewChat) {
          await createNewSession(session.user.id);
          await loadChatSessions(session.user.id);
        } else {
          // Set the existing "New Chat" as current
          setCurrentSessionId(existingSessions[0].id);
          loadMessages(existingSessions[0].id);
        }
        setSessionsLoading(false);
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
      // Fetch user profile (full_name)
      (async () => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      })();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Wait for layout to settle, then scroll
    const timeout = setTimeout(() => {
    scrollToBottom();
    }, 60);
    return () => clearTimeout(timeout);
  }, [messages, isBarathAITyping, inputHeight, headerHeight]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && chatScrollAreaRef.current) {
      messagesEndRef.current.style.scrollMarginBottom = (inputHeight + (isMobile ? 24 : 40)) + 'px';
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
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

      const sessions: ChatSession[] = (data || []).map(session => ({
        id: session.id,
        title: session.title,
        created_at: session.created_at,
        updated_at: session.updated_at,
        unique_url: session.unique_url || ''
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

      const formattedMessages: Message[] = (data || []).map((msg: any) => {
        let extractedImage: string | undefined = undefined;
        if (typeof msg.content === 'string') {
          // Try patterns: "[IMAGE]: <url>" or "[IMAGE] (<url>)" or content containing base64 image
          const colonMatch = msg.content.match(/\[IMAGE\]\s*:\s*(\S+)/);
          const parenMatch = msg.content.match(/\[IMAGE\]\s*\(([^)]+)\)/);
          const base64Match = msg.content.match(/(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/);
          extractedImage = colonMatch?.[1] || parenMatch?.[1] || base64Match?.[1] || undefined;
        }
        return {
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          timestamp: new Date(msg.created_at),
          image: extractedImage
        };
      });

      console.log('Fetched messages:', formattedMessages.length, 'messages');
      // Log any image messages for debugging
      formattedMessages.forEach(msg => {
        if (msg.content.includes('data:image')) {
          console.log('Found image message:', {
            id: msg.id,
            hasImage: true,
            contentPreview: msg.content.substring(0, 100) + '...'
          });
        }
      });

      setMessages(formattedMessages);
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const createNewSession = async (userId?: string) => {
    try {
      const sessionUserId = userId || user?.id;
      if (!sessionUserId) return;

      // First, cleanup any existing empty "New Chat" sessions
      await cleanupEmptyNewChats(sessionUserId);

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
      setError('Failed to update session title');
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
      setError('Failed to save message');
    }
  };

  const logApiUsage = async ({ user_id, user_email, api_name, endpoint_hit, request_method, request_payload, response_payload, response_time, status_code }: any) => {
    const { error } = await supabase.from('api_usage_logs').insert({
      user_id,
      user_email,
      api_name,
      endpoint_hit,
      request_method,
      request_payload,
      response_payload,
      response_time,
      status_code,
      created_at: new Date().toISOString(),
    });
    return !error;
  };

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentSessionId || !user) {
      return;
    }

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    if (wordCount > 1000) {
      setWordLimitError('Message cannot exceed 1000 words.');
      return;
    }

    // If image mode is enabled, generate image instead of text response
    if (isImageMode) {
      await generateImage(message.trim());
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
    setIsBarathAITyping(true);
    setError('');

    try {
      await saveMessage(currentSessionId, userMessage.content, 'user');
      if (messages.length === 0) {
        await updateSessionTitle(currentSessionId, userMessage.content);
      }
    } catch (error) {
      setError('Failed to save message');
    }

    try {
      const apiMessages = [
        {
          "role": "system",
          "content": "You are BarathAI, an intelligent AI assistant created by Barathraj. You are knowledgeable, friendly, and always strive to provide accurate and helpful information. You communicate in a natural, conversational manner. You can help with coding, problem-solving, research, creative writing, and general questions. Always be helpful, accurate, and engaging in your responses. Format your responses using proper Markdown syntax for better readability.\n\nPrivacy Notice: All features are built on BarathAI. No third parties are involved—your data is processed securely and privately within BarathAI."
        },
        ...newMessages.slice(-10).map(msg => ({
          "role": msg.role,
          "content": msg.content
        }))
      ];

      const requestBody = {
        "model": OPENROUTER_MODEL,
        "messages": apiMessages,
        "max_tokens": 2000,
        "temperature": 0.7,
        "top_p": 0.9,
        "frequency_penalty": 0.1,
        "presence_penalty": 0.1
      };

      let usedApiKey = OPENROUTER_API_KEY;
      let usedApiUrl = API_URL;
      let triedSecondary = false;
      let response;
      let apiError = null;
      let apiResponseData = null;
      let apiStatus = null;
      let apiResponseTime = null;
      let apiName = null;
      let attempt = 0;
      const maxAttempts = 3;
      while (attempt < maxAttempts) {
        attempt++;
        const attemptStart = Date.now();
        try {
        response = await fetch(usedApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${usedApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "BarathAI Chat"
          },
          body: JSON.stringify(requestBody)
        });
          apiResponseTime = Date.now() - attemptStart;
          apiStatus = response.status;
          apiName = usedApiUrl.includes('openrouter') ? (usedApiUrl === API_URL ? 'OpenRouter_API_1' : 'OpenRouter_API_2') : 'Unknown';
          let logSuccess = false;
          if (!response.ok) {
            const errorText = await response.text();
            apiError = errorText;
            logSuccess = await logApiUsage({
              user_id: user.id,
              user_email: user.email,
              api_name: apiName,
              endpoint_hit: usedApiUrl,
              request_method: 'POST',
              request_payload: requestBody,
              response_payload: { error: errorText },
              response_time: apiResponseTime,
              status_code: apiStatus
            });
            if (apiStatus === 429 && !triedSecondary && OPENROUTER_API_KEY2) {
              usedApiKey = OPENROUTER_API_KEY2;
              usedApiUrl = API_URL2;
              triedSecondary = true;
              continue;
            }
            if (attempt < maxAttempts) {
              await sleep(1000 * attempt); // Exponential backoff
              continue;
            }
            setError(`API error (${apiStatus}): ${errorText}`);
            setIsLoading(false);
            setIsBarathAITyping(false);
            return;
          } else {
            apiResponseData = await response.json();
            logSuccess = await logApiUsage({
              user_id: user.id,
              user_email: user.email,
              api_name: apiName,
              endpoint_hit: usedApiUrl,
              request_method: 'POST',
              request_payload: requestBody,
              response_payload: apiResponseData,
              response_time: apiResponseTime,
              status_code: apiStatus
            });
            if (!logSuccess) {
              setError('Failed to log API usage. Please try again.');
              setIsLoading(false);
              setIsBarathAITyping(false);
              return;
            }
          break;
        }
        } catch (err: any) {
          apiResponseTime = Date.now() - attemptStart;
          apiStatus = null;
          apiError = err.message || 'Network error';
          await logApiUsage({
            user_id: user.id,
            user_email: user.email,
            api_name: apiName || 'Unknown',
            endpoint_hit: usedApiUrl,
            request_method: 'POST',
            request_payload: requestBody,
            response_payload: { error: apiError },
            response_time: apiResponseTime,
            status_code: apiStatus
          });
          if (attempt < maxAttempts) {
            await sleep(1000 * attempt); // Exponential backoff
            continue;
          }
          setError('Network error. Please try again.');
          setIsLoading(false);
          setIsBarathAITyping(false);
          return;
      }
      }
      
      if (!apiResponseData || !apiResponseData.choices || !apiResponseData.choices[0] || !apiResponseData.choices[0].message) {
        setError('Invalid response format from API');
        setIsLoading(false);
        setIsBarathAITyping(false);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: apiResponseData.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      try {
        await saveMessage(currentSessionId, assistantMessage.content, 'assistant');
      } catch (error) {
        setError('Failed to save assistant message');
      }

    } catch (error) {
      setError(`Failed to get response: ${error.message}`);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    }

    setIsLoading(false);
    setIsBarathAITyping(false);
  };

  const generateImage = async (prompt: string) => {
    if (!prompt.trim() || isGeneratingImage || !currentSessionId || !user) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setMessage('');
    setIsGeneratingImage(true);
    setError('');

    try {
      await saveMessage(currentSessionId, userMessage.content, 'user');
      if (messages.length === 0) {
        await updateSessionTitle(currentSessionId, userMessage.content);
      }
    } catch (error) {
      setError('Failed to save message');
    }

    // Add a pending assistant message so the loader shows immediately
    const tempAssistantId = `img-${Date.now()}`;
    const pendingAssistant: Message = {
      id: tempAssistantId,
      content: `🎨 Generating your image: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, pendingAssistant]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('openrouter-generate', {
        body: {
          prompt: prompt,
          model: 'google/gemini-2.5-flash-image-preview:free'
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.success && response.data?.image) {
        const imageUrl = response.data.image as string;
        const assistantContent = response.data.content || "✨ Here's your generated image:";

        // Update pending assistant message with the image
        setMessages(prev => prev.map(m => m.id === tempAssistantId ? {
          ...m,
          content: `${assistantContent}\n[IMAGE]: ${imageUrl}`,
          image: imageUrl
        } : m));

        try {
          await saveMessage(currentSessionId, `${assistantContent}\n[IMAGE]: ${imageUrl}`, 'assistant');
        } catch (error) {
          setError('Failed to save assistant message');
        }

        toast({
          title: "Success",
          description: "Image generated successfully!",
        });

        // Reload recent images to include the new one
        await loadRecentImages();
      } else {
        throw new Error(response.data?.error || 'Image generation failed');
      }

    } catch (error: any) {
      setError(`Failed to generate image: ${error.message}`);
      // Replace pending message with error text
      setMessages(prev => prev.map(m => m.id === tempAssistantId ? {
        ...m,
        content: "❌ I'm sorry, I'm having trouble generating the image right now. Please try again.",
        image: undefined
      } : m));
      
      try {
        await saveMessage(currentSessionId, "❌ I'm sorry, I'm having trouble generating the image right now. Please try again.", 'assistant');
      } catch (saveError) {
        console.error('Failed to save error message');
      }
    }

    setIsGeneratingImage(false);
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

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    if (inputRefContainer.current) {
      setInputHeight(inputRefContainer.current.offsetHeight);
    }
    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
      if (inputRefContainer.current) {
        setInputHeight(inputRefContainer.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Initialize image loading state for messages that have images but no recorded state yet
  useEffect(() => {
    setImageLoadingByMessageId(prev => {
      const next = { ...prev };
      for (const m of messages) {
        if (m.image && next[m.id] === undefined) {
          next[m.id] = true;
        }
      }
      return next;
    });
    setImageErrorByMessageId(prev => {
      const next = { ...prev };
      for (const m of messages) {
        if (m.image && next[m.id] === undefined) {
          next[m.id] = false;
        }
      }
      return next;
    });
  }, [messages]);

  const openImageViewer = (imageUrl: string) => {
    setImageViewerSrc(imageUrl);
    setIsImageViewerOpen(true);
  };

  const downloadImage = (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `barathai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // no-op
    }
  };

  const loadRecentImages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('image_generation_logs')
        .select('id, image_url, prompt, created_at')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      console.log('Loaded recent images:', data?.length || 0);
      setRecentImages(data || []);
    } catch (error) {
      console.error('Failed to load recent images:', error);
    }
  };

  if (sessionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl px-10 py-12 flex flex-col items-center">
          <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl p-6 animate-pulse">
            <Logo size={80} className="drop-shadow-2xl" />
          </div>
          <span className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-sans" style={{letterSpacing: '0.04em'}}>BarathAI</span>
          <span className="mt-2 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse font-sans" style={{letterSpacing: '0.04em'}}>Loading chats…</span>
          <div className="w-64 h-3 mt-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full overflow-hidden relative shadow-lg">
            <div className="absolute left-0 top-0 h-3 w-1/3 bg-white/60 rounded-full animate-loading-bar" />
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { left: 0; width: 20%; opacity: 0.7; }
            50% { left: 60%; width: 40%; opacity: 1; }
            100% { left: 100%; width: 20%; opacity: 0.7; }
          }
          .animate-loading-bar {
            animation: loading-bar 1.4s cubic-bezier(0.4,0,0.2,1) infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 text-slate-900 dark:text-white`}>
      <div className="flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 text-slate-900 dark:text-white transition-all duration-300 min-h-screen">
        
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm flex items-center justify-center">
            <WifiOff size={16} className="mr-2" />
            No internet connection
          </div>
        )}

        {/* Desktop Sidebar - Always visible on large screens */}
        <div className={`hidden lg:block w-80 h-screen fixed left-0 top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 shadow-xl`}>
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Logo size={28} />
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    BarathAI
                  </h2>
                </div>
              </div>
              <Button
                onClick={() => createNewSession()}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-200 text-sm py-2"
              >
                <Plus className="mr-2" size={14} />
                New Chat
              </Button>
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

            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/10">
              <div className="flex items-center space-x-2 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {profile?.full_name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="text-center p-1 bg-white/70 dark:bg-slate-800/70 rounded">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {chatSessions.length}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">Chats</div>
                </div>
                <div className="text-center p-1 bg-white/70 dark:bg-slate-800/70 rounded">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {messages.length}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">Messages</div>
                </div>
              </div>
            </div>

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
                          {new Date(session.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-1 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-purple-900/10 backdrop-blur-lg flex-shrink-0">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Features
              </div>
              <div className="grid grid-cols-2 gap-1">
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
                  <Lock size={12} className="text-green-600" />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && isMobile && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar overlay"
              tabIndex={-1}
            />
            <div className="fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col shadow-xl transition-transform duration-300">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isMobile ? (
                      <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Logo size={32} />
                      </div>
                    ) : (
                      <Logo size={32} />
                    )}
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-0 mt-0">
                      BarathAI
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                    aria-label="Close sidebar"
                  >
                    <X size={18} />
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    createNewSession();
                    setSidebarOpen(false);
                  }}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-200 text-sm py-2"
                >
                  <Plus className="mr-2" size={14} />
                  New Chat
                </Button>
                <div className="mt-2 relative">
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

              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/10">
                <div className="flex items-center space-x-2 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {profile?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <div className="text-center p-1 bg-white/70 dark:bg-slate-800/70 rounded">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {chatSessions.length}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400">Chats</div>
                  </div>
                  <div className="text-center p-1 bg-white/70 dark:bg-slate-800/70 rounded">
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {messages.length}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400">Messages</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-0">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-1">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Logo size={20} />
                    </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0">No chat history yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0">Start a new conversation to see it here</p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative p-2 rounded-lg transition-all duration-200 cursor-pointer mb-0 ${
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
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate flex-1 mb-0">
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
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0 mb-0">
                            {new Date(session.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-1 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-purple-900/10 backdrop-blur-lg flex-shrink-0">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Features
                </div>
                <div className="grid grid-cols-2 gap-1">
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
                    <Lock size={12} className="text-green-600" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Chat Area */}
        <div className={`flex flex-col h-full w-full ${!isMobile ? 'lg:ml-80' : ''}`}>
          <header ref={headerRef} className={`fixed top-0 right-0 z-40 flex items-center justify-between p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-sm ${!isMobile ? 'left-80' : 'left-0'}`}>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className={`text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white ${!isMobile ? 'hidden' : ''}`}
              >
                <Menu size={20} />
              </Button>
              <div className="flex items-center space-x-2">
                {isMobile ? (
                  <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Logo size={32} />
                  </div>
                ) : (
                <Logo size={24} />
                )}
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BarathAI
                </span>
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
              {user && user.email === 'jcibarathraj@gmail.com' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Admin Panel"
                >
                  <UserIcon className="h-5 w-5" />
                </Button>
              )}
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

          {/* Messages Area */}
          <div
            ref={chatScrollAreaRef}
            className={`flex-1 overflow-y-auto flex flex-col ${isMobile ? 'p-2 space-y-4 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 pt-4 pb-4' : 'p-6 space-y-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-8 pb-8'}`}
            style={{ paddingTop: headerHeight + (isMobile ? 16 : 32), paddingBottom: inputHeight + (isMobile ? 16 : 32) }}
          >
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

            {sessionsLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl p-4 animate-pulse">
                    <Logo size={56} className="drop-shadow-lg" />
                  </div>
                  <span className="mt-4 text-xl font-bold text-slate-800 dark:text-white tracking-wide animate-pulse">Loading chat…</span>
                  <div className="w-48 h-2 mt-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-2 w-1/3 bg-white/60 rounded-full animate-loading-bar" />
                  </div>
                </div>
                <style>{`
                  @keyframes loading-bar {
                    0% { left: 0; width: 20%; opacity: 0.7; }
                    50% { left: 60%; width: 40%; opacity: 1; }
                    100% { left: 100%; width: 20%; opacity: 0.7; }
                  }
                  .animate-loading-bar {
                    animation: loading-bar 1.4s cubic-bezier(0.4,0,0.2,1) infinite;
                  }
                `}</style>
              </div>
            ) : (
              <>
            {messages.length === 0 && (
              <div className="text-center py-12">
                    {isMobile ? (
                      <div className="mx-auto mb-4 w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Logo size={48} />
                      </div>
                    ) : (
                <Logo size={64} className="mx-auto mb-4" />
                    )}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to BarathAI</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Your intelligent AI assistant created by Barathraj</p>
                
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-2xl mb-2">💻</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Code Help</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">Java, Python, JS</div>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Research</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">Deep Analysis</div>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-2xl mb-2">✍️</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Writing</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">Creative & Technical</div>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-2xl mb-2">🎨</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Image Generation</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">AI-Powered Art</div>
                    </div>
                  </div>
                  
                  {recentImages.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                        Your Recent Images
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {recentImages.map((img) => (
                          <div 
                            key={img.id} 
                            className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => openImageViewer(img.image_url)}
                          >
                            <div className="aspect-square">
                              <img 
                                src={img.image_url} 
                                alt={img.prompt} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                            <div className="p-2">
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={img.prompt}>
                                {img.prompt}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                {new Date(img.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

                {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                      className={`
                        ${isMobile ? 'max-w-[90vw]' : 'max-w-[60%]'}
                        rounded-xl transition-all duration-200
                        break-words whitespace-pre-wrap
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-lg'}
                        text-base sm:text-base
                        relative
                      `}
                >
                  {msg.role === 'assistant' && (
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
                            <Logo size={20} />
                          </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">BarathAI</span>
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    <div className="px-4 pb-4">
                      {msg.content && (
                        <ProfessionalMarkdown content={msg.content.replace(/\[IMAGE\]:\s*\S+/g, '').trim()} />
                      )}
                      {!msg.image && msg.content && msg.content.includes('🎨 Generating') && (
                        <div className="mt-4">
                          <div className="w-full max-w-[512px] aspect-square mx-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex flex-col items-center justify-center p-8">
                            <div className="relative">
                              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">Creating your image...</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">This may take a few moments</p>
                          </div>
                        </div>
                      )}
                      {msg.image && (
                        <div className="mt-4 relative">
                          {imageLoadingByMessageId[msg.id] && (
                            <div className="w-full max-w-[512px] aspect-square mx-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 animate-pulse flex items-center justify-center">
                              <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading image...</span>
                              </div>
                            </div>
                          )}
                          {!imageErrorByMessageId[msg.id] && (
                            <div className="w-full max-w-[512px] mx-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                              <img 
                                src={msg.image} 
                                alt="Generated image" 
                                className="w-full h-auto object-contain"
                                style={{ display: imageLoadingByMessageId[msg.id] ? 'none' : 'block' }}
                                onLoad={() => setImageLoadingByMessageId(prev => ({ ...prev, [msg.id]: false }))}
                                onError={() => {
                                  setImageLoadingByMessageId(prev => ({ ...prev, [msg.id]: false }));
                                  setImageErrorByMessageId(prev => ({ ...prev, [msg.id]: true }));
                                }}
                              />
                              {!imageLoadingByMessageId[msg.id] && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Generated Image</span>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => openImageViewer(msg.image!)}
                                        title="View full size"
                                      >
                                        <Eye className="w-3 h-3 mr-1" /> View
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => downloadImage(msg.image!)}
                                        title="Download image"
                                      >
                                        <Download className="w-3 h-3 mr-1" /> Save
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {imageErrorByMessageId[msg.id] && (
                            <div className="w-full max-w-[512px] mx-auto rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center text-center">
                              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-3">
                                <ImageIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Unable to display image</div>
                              <div className="text-xs text-red-600 dark:text-red-400 mb-4">The image may be corrupted or in an unsupported format</div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-3 text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30" 
                                  onClick={() => {
                                    setImageErrorByMessageId(prev => ({ ...prev, [msg.id]: false }));
                                    setImageLoadingByMessageId(prev => ({ ...prev, [msg.id]: true }));
                                  }}
                                >
                                  Retry
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 px-3 text-xs" 
                                  onClick={() => openImageViewer(msg.image!)}
                                >
                                  <Eye className="w-3 h-3 mr-1" /> View Raw
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 px-4 pb-2">
                    <div className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                    {msg.role === 'assistant' && (!msg.content || !msg.content.startsWith('[IMAGE]')) && (
                      <TextToSpeech text={msg.content} className="ml-2" />
                    )}
                  </div>
                      {msg.role === 'assistant' && (
                        <button
                          className={`absolute top-2 right-2 z-10 p-1 rounded-md bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 shadow hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity duration-200`}
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMsgId(msg.id);
                            setTimeout(() => setCopiedMsgId(null), 1500);
                          }}
                          title="Copy"
                        >
                          {copiedMsgId === msg.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                      )}
                </div>
              </div>
            ))}
            {isBarathAITyping && (
              <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
                          <Logo size={20} />
                        </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">BarathAI</span>
                  </div>
                      <div className="flex items-center space-x-3 pb-2">
                        <TypingIndicator />
                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">Thinking</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div ref={inputRefContainer} className={`fixed bottom-0 right-0 z-40 p-2 sm:p-3 bg-gradient-to-t from-white/95 via-white/98 to-white/90 dark:from-slate-800/95 dark:via-slate-900/98 dark:to-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 transition-colors duration-300 shadow-2xl ${!isMobile ? 'left-80' : 'left-0'}`}
            style={{maxWidth: '100vw'}}>
            <div className="flex justify-center w-full max-w-4xl mx-auto">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md px-2 py-1 w-full">
                <Textarea
                  ref={inputRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={isImageMode ? "Describe the image you want to generate..." : "Type your message... (max 1000 words)"}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-base text-slate-900 dark:text-white min-h-[40px] max-h-40"
                  rows={2}
                  maxLength={10000}
                  disabled={isLoading || isGeneratingImage || !isOnline}
                />
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    onClick={() => setIsImageMode(!isImageMode)}
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-lg transition-all duration-200 ${
                      isImageMode 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                    disabled={isLoading || isGeneratingImage}
                    title={isImageMode ? 'Switch to chat mode' : 'Switch to image generation mode'}
                  >
                    <ImageIcon size={20} className={isImageMode ? 'animate-pulse' : ''} />
                  </Button>
                  <Button
                    onClick={toggleVoiceInput}
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-lg ${isListening ? 'bg-red-500 text-white' : ''}`}
                    disabled={isLoading || isGeneratingImage}
                  >
                    {isListening ? (
                      <span className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                        <Mic size={20} className="relative z-10 animate-pulse" />
                      </span>
                    ) : (
                      <Mic size={20} />
                    )}
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading || isGeneratingImage || wordCount > 1000}
                    className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                  >
                    {isLoading || isGeneratingImage ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <Send size={20} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1 max-w-4xl mx-auto">
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${wordCount > 1000 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{wordCount}/1000 words</span>
                {isImageMode && (
                  <span className="text-xs px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 rounded-full font-medium border border-purple-200 dark:border-purple-700 shadow-sm">
                    🎨 Image Mode
                  </span>
                )}
              </div>
              {wordLimitError && <span className="text-xs text-red-500">{wordLimitError}</span>}
            </div>
          </div>

          {/* Full-screen Image Viewer */}
          <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 border-0 bg-transparent shadow-none">
              <div className="w-full h-full flex items-center justify-center bg-black/80 rounded-lg">
                {imageViewerSrc && (
                  <img
                    src={imageViewerSrc}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain rounded-md"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};