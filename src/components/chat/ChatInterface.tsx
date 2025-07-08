import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Square, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TextToSpeech } from "@/components/TextToSpeech";
import { LoadingSpinner } from "@/components/ErrorBoundary";
import { Logo } from "@/components/Logo";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  currentSessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentSessionId
}) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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

        recognitionRef.current.onerror = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setMessage(value);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || wordCount > 1000) return;

    const messageToSend = message.trim();
    setMessage('');
    setWordCount(0);
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex > 0 && messages[messageIndex - 1]?.role === 'user') {
      const userMessage = messages[messageIndex - 1].content;
      await onSendMessage(userMessage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Logo size={80} className="mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Welcome to BarathAI
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Your intelligent AI assistant created by Barathraj
              </p>
            </div>
            
            {/* Feature showcase */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { emoji: "💻", title: "Code Help", desc: "Java, Python, JS" },
                  { emoji: "🔍", title: "Research", desc: "Deep Analysis" },
                  { emoji: "✍️", title: "Writing", desc: "Creative & Technical" },
                  { emoji: "🤔", title: "Problem Solving", desc: "Step-by-step" }
                ].map((feature, index) => (
                  <div key={index} className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                    <div className="text-2xl mb-2">{feature.emoji}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">{feature.desc}</div>
                  </div>
                ))}
              </div>
              
              <div className="text-base text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                💡 <strong>Pro Tip:</strong> I can help with Java programming, markdown formatting, code examples, and much more!
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                    <Logo size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">BarathAI</span>
                </div>
              )}
              
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer 
                    content={msg.content} 
                    className="prose prose-slate dark:prose-invert max-w-none"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>

              {/* Message actions */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between mt-2 px-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(msg.content)}
                      className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <Copy size={12} className="mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regenerateResponse(index)}
                      className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <RotateCcw size={12} className="mr-1" />
                      Regenerate
                    </Button>
                    <TextToSpeech text={msg.content} className="h-7 w-7" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-green-600"
                    >
                      <ThumbsUp size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                    >
                      <ThumbsDown size={12} />
                    </Button>
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div className="text-right mt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] mr-12">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-3">
                  <Logo size={20} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">BarathAI</span>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm">
                <LoadingSpinner message="Thinking..." />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Message BarathAI... (max 1000 words)"
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 pr-20 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all min-h-[60px] max-h-40"
              rows={2}
              disabled={isLoading}
            />
            
            {/* Input controls */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`h-8 w-8 p-0 ${isListening ? 'text-red-500 hover:text-red-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                disabled={isLoading}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              
              {isLoading ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500"
                  disabled
                >
                  <Square size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || wordCount > 1000}
                  className="h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </Button>
              )}
            </div>
          </div>
          
          {/* Word count and status */}
          <div className="flex justify-between items-center mt-2 px-2">
            <span className={`text-xs ${wordCount > 1000 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
              {wordCount}/1000 words
            </span>
            {isListening && (
              <span className="text-xs text-red-500 animate-pulse">
                🎤 Listening...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};