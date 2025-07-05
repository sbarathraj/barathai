
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Settings, LogOut, MessageSquare, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user?: any;
  onSettingsClick?: () => void;
}

export const Navigation = ({ user, onSettingsClick }: NavigationProps) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    }
  };

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const isOnChatPage = location.pathname.startsWith('/chat');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BarathAI
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {!user && (
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="hover:bg-accent/50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
            
            {user && !isOnChatPage && (
              <Button
                onClick={() => navigate('/chat')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-colors"
            >
              {actualTheme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}

            {!user && (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
