
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User as UserIcon,
  Loader2,
  MessageSquare,
  History,
  Plus
} from 'lucide-react';
import { Navigation } from "@/components/Navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  unique_url: string;
  created_at: string;
  updated_at: string;
}

export const Chat = () => {
  const navigate = useNavigate();
  const { sessionUrl } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const OPENROUTER_API_KEY = "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";

  // Auth effect
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current!.continuous = false;
      recognitionRef.current!.interimResults = false;
      recognitionRef.current!.lang = 'en-US';

      recognitionRef.current!.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Append to existing message instead of replacing
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current!.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current!.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  // Load chat sessions and handle routing
  useEffect(() => {
    if (!user) return;

    const loadChatSessions = async () => {
      try {
        const { data: sessions, error } = await supabase
          .from('chat_sessions_new')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading chat sessions:', error);
          return;
        }

        setChatHistory(sessions || []);

        // Handle routing logic
        if (sessionUrl) {
          // Load specific session by URL
          const session = sessions?.find(s => s.unique_url === sessionUrl);
          if (session) {
            setCurrentSession(session);
            await loadMessages(session.id);
          } else {
            toast({
              title: "Session Not Found",
              description: "The requested chat session could not be found.",
              variant: "destructive",
            });
            navigate('/chat');
          }
        } else {
          // Create new session for authenticated users
          await createNewSession();
        }
      } catch (error) {
        console.error('Error in loadChatSessions:', error);
        toast({
          title: "Error",
          description: "Failed to load chat sessions.",
          variant: "destructive",
        });
      }
    };

    loadChatSessions();
  }, [user, sessionUrl, navigate, toast]);

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data: newSession, error } = await supabase
        .from('chat_sessions_new')
        .insert({
          user_id: user.id,
          title: 'New Chat'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Failed to create new chat session.",
          variant: "destructive",
        });
        return;
      }

      setCurrentSession(newSession);
      setMessages([]);
      
      // Update URL without triggering a page reload
      window.history.replaceState(null, '', `/chat/${newSession.unique_url}`);
    } catch (error) {
      console.error('Error in createNewSession:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data: sessionMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(sessionMessages || []);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!currentSession || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          session_id: currentSession.id,
          user_id: user.id,
          content,
          role
        });

      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Error in saveMessage:', error);
    }
  };

  const updateSessionTitle = async (firstMessage: string) => {
    if (!currentSession) return;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    try {
      const { error } = await supabase
        .from('chat_sessions_new')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) {
        console.error('Error updating session title:', error);
        return;
      }

      setCurrentSession(prev => prev ? { ...prev, title } : null);
      setChatHistory(prev => 
        prev.map(session => 
          session.id === currentSession.id 
            ? { ...session, title, updated_at: new Date().toISOString() }
            : session
        )
      );
    } catch (error) {
      console.error('Error in updateSessionTitle:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentSession) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    setRetryCount(0);

    // Add user message to UI immediately
    const newUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Save user message to database
    await saveMessage(userMessage, 'user');

    // Update session title if this is the first message
    if (messages.length === 0) {
      await updateSessionTitle(userMessage);
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'BarathAI Chat'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are BarathAI, a helpful and intelligent AI assistant created by Barathraj. You provide accurate, helpful, and engaging responses while being friendly and professional.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Add assistant message to UI
      const newAssistantMessage: Message = {
        id: `temp-${Date.now()}-assistant`,
        content: assistantMessage,
        role: 'assistant',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      // Save assistant message to database
      await saveMessage(assistantMessage, 'assistant');

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    setMessages([]);
    setShowHistory(false);
    await loadMessages(session.id);
    navigate(`/chat/${session.unique_url}`);
  };

  const startNewChat = async () => {
    await createNewSession();
    setShowHistory(false);
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation user={user} />
      
      <div className="pt-16 h-screen flex">
        {/* Chat History Sidebar */}
        <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-border bg-card/30`}>
          <div className="p-4 border-b border-border">
            <Button onClick={startNewChat} className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-2">
              {chatHistory.map((session) => (
                <Button
                  key={session.id}
                  variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => selectSession(session)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-card/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-semibold">{currentSession?.title || 'New Chat'}</h1>
                <p className="text-sm text-muted-foreground">Chat with BarathAI</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to BarathAI</h2>
                  <p className="text-muted-foreground">Start a conversation by typing a message below.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                        <AvatarFallback>
                          <Bot className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <Card className={`max-w-[80%] p-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-card'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </Card>

                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-muted">
                        <AvatarFallback>
                          <UserIcon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="max-w-[80%] p-4 bg-card">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">BarathAI is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card/30">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[50px] max-h-[200px] resize-none pr-12"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleListening}
                    className={`absolute right-2 top-2 h-8 w-8 p-0 ${
                      isListening 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="h-[50px] px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                BarathAI may make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
