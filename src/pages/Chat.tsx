
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  user_id: string;
}

export const Chat = () => {
  const navigate = useNavigate();
  const { uniqueUrl } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check authentication and initialize
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);

      if (uniqueUrl) {
        // Load specific chat session
        await loadChatSession(uniqueUrl);
      } else {
        // Create new chat session
        await createNewChatSession(session.user.id);
      }
    };

    checkAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, uniqueUrl]);

  const loadChatSession = async (url: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions_new')
        .select('*')
        .eq('unique_url', url)
        .single();

      if (sessionError) {
        toast({
          title: "Error",
          description: "Chat session not found",
          variant: "destructive",
        });
        navigate('/chat');
        return;
      }

      setCurrentSession(session);

      // Load messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (!messagesError && messagesData) {
        setMessages(messagesData.map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant'
        })));
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      navigate('/chat');
    }
  };

  const createNewChatSession = async (userId: string) => {
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions_new')
        .insert({
          user_id: userId,
          title: 'New Chat'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return;
      }

      setCurrentSession(session);
      // Update URL without causing a page reload
      window.history.replaceState(null, '', `/chat/${session.unique_url}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        // Append to existing input instead of replacing
        if (event.results[event.results.length - 1].isFinal) {
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
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

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('messages').insert({
        session_id: currentSession.id,
        user_id: user.id,
        content: userMessage.content,
        role: 'user'
      });

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I understand you're asking about: "${userMessage.content}". This is a demo response. In a real implementation, this would be connected to an AI service like OpenAI's GPT or similar.`,
          role: 'assistant',
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save AI message to database
        await supabase.from('messages').insert({
          session_id: currentSession.id,
          user_id: user.id,
          content: aiMessage.content,
          role: 'assistant'
        });

        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    navigate('/chat');
    window.location.reload(); // Force reload to create new session
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation user={user} showUserActions={true} />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {currentSession?.title || 'New Chat'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Chat with BarathAI
            </p>
          </div>
          <Button
            onClick={startNewChat}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col mb-4 p-4 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                <p>Ask me anything! I'm here to help.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none pr-12"
                disabled={isLoading}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={`absolute right-2 top-2 h-8 w-8 ${
                  isListening ? 'text-red-500' : 'text-muted-foreground'
                }`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-12 shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
