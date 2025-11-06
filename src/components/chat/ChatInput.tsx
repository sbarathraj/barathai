import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Image, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isImageMode: boolean;
  onToggleImageMode: () => void;
  isGeneratingImage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  isImageMode,
  onToggleImageMode,
  isGeneratingImage = false
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input failed",
          description: "Please try again or check your microphone permissions",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isGeneratingImage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-2 sm:p-4">
      {/* Mode Indicator */}
      {isImageMode && (
        <div className="mb-2 sm:mb-3 flex items-center justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg animate-pulse">
            <Image className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            🎨 AI Image Generation Mode Active
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-1.5 sm:space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isImageMode ? "Describe the image you want to generate..." : "Type your message..."}
            className="min-h-[44px] sm:min-h-[50px] max-h-[100px] sm:max-h-[120px] resize-none pr-10 sm:pr-12 text-sm sm:text-base bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl shadow-sm"
            disabled={disabled || isGeneratingImage}
          />
          
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            disabled={disabled || isGeneratingImage}
            className={`absolute right-1.5 sm:right-2 top-1.5 sm:top-2 h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
              isListening 
                ? 'text-red-500 hover:text-red-600 animate-pulse' 
                : 'text-slate-400 hover:text-blue-500'
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff size={14} className="sm:w-4 sm:h-4" /> : <Mic size={14} className="sm:w-4 sm:h-4" />}
          </Button>
        </div>

        {/* Image Mode Toggle */}
        <Button
          type="button"
          variant={isImageMode ? "default" : "outline"}
          size="icon"
          onClick={onToggleImageMode}
          disabled={disabled || isGeneratingImage}
          className={`h-10 w-10 sm:h-12 sm:w-12 transition-all duration-200 ${
            isImageMode 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg' 
              : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isImageMode ? "Switch to Chat Mode" : "Switch to Image Generation Mode"}
        >
          {isImageMode ? <MessageCircle size={18} className="sm:w-5 sm:h-5" /> : <Image size={18} className="sm:w-5 sm:h-5" />}
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isGeneratingImage}
          className={`h-10 px-3 sm:h-12 sm:px-6 transition-all duration-200 text-sm sm:text-base ${
            isImageMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          } text-white shadow-lg hover:shadow-xl disabled:opacity-50`}
        >
          {isGeneratingImage ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : (
            <>
              <Send size={16} className="mr-1.5 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">{isImageMode ? 'Generate' : 'Send'}</span>
              <span className="sm:hidden">{isImageMode ? 'Gen' : 'Send'}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};