import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfessionalMarkdown } from "@/components/ProfessionalMarkdown";
import { TextToSpeech } from "@/components/TextToSpeech";
import { ChatLoading } from "@/components/ChatLoading";
import { 
  Send, 
  Mic, 
  MicOff, 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Copy,
  Check,
  History,
  Zap,
  Sparkles,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  unique_url: string;
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for SpeechRecognition API support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('SpeechRecognition API is not supported in this browser.');
      toast({
        title: "Warning",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      setIsAdmin(session.user.email === 'jcibarathraj@gmail.com');
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      setProfile(profileData);
      
      // Load chat sessions
      await loadChatSessions();
      
      // Create or load current session
      await createNewSession();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user.id,
            title: `Chat ${new Date().toLocaleString()}`,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSession(data);
      setMessages([]);
      await loadChatSessions();
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
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
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const selectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    await loadMessages(session.id);
    setShowSidebar(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('messages').insert([
        {
          session_id: currentSession.id,
          user_id: user.id,
          role: 'user' as 'user' | 'assistant',
          content: userMessage.content
        }
      ]);

      // Here you would typically call your AI service
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm a placeholder response. In a real implementation, this would connect to your AI service.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from('messages').insert([
        {
          session_id: currentSession.id,
          user_id: user.id,
          role: 'assistant' as 'user' | 'assistant',
          content: assistantMessage.content
        }
      ]);

      // Update session updated_at
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user || !profile) {
    return <ChatLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-slate-900/95 backdrop-blur-lg border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">BarathAI</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Welcome, {profile?.full_name || profile?.email}
            </p>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={createNewSession}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-slate-700 space-y-2">
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Control
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-1 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700/50 dark:to-purple-900/10 backdrop-blur-lg flex-shrink-0">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Features
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                AI Chat
              </Badge>
              <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart
              </Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                <History className="w-3 h-3 mr-1" />
                History
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(true)}
                className="lg:hidden text-slate-400 hover:text-white mr-3"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-white">
                {currentSession?.title || 'New Chat'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800/50 text-white border border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {message.role === 'assistant' ? (
                        <ProfessionalMarkdown content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.id, message.content)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {message.role === 'assistant' && (
                        <TextToSpeech text={message.content} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 text-white border border-slate-700 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span>BarathAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4 bg-slate-800/50 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 pr-12"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoiceRecognition}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 ${
                    isListening ? 'text-red-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};
