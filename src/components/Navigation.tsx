import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, MessageCircle, Settings, User, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Section tracking logic
  const sectionIds = ["hero", "features", "how-it-works", "testimonials", "get-started"];
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    // Default to light mode unless user has chosen dark
    const shouldUseDark = savedTheme === 'dark';
    setDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check authentication status
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const handleScroll = () => {
      let current = "hero";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white/30 dark:border-slate-800/40 shadow-xl transition-all duration-500 w-full animate-fade-in-slide-down">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size={32} />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BarathAI
            </span>
          </div>
          {/* Section links (only on landing page) */}
          {location.pathname === "/" && (
            <div className="hidden md:flex items-center space-x-4">
              {[
                { id: "hero", label: "Home" },
                { id: "features", label: "Features" },
                { id: "how-it-works", label: "How It Works" },
                { id: "testimonials", label: "Testimonials" },
                { id: "get-started", label: "Get Started" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`px-3 py-1 rounded-full font-medium text-sm transition-all duration-200 ${activeSection === id ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/40"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/chat')}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/settings')}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  size="icon"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  size="icon"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-200 hover:scale-105"
                >
                  Get Started
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-700 dark:text-slate-300"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg w-full">
            <div className="flex flex-col space-y-4 w-full">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/chat');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-slate-700 dark:text-slate-300"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-slate-700 dark:text-slate-300"
                    size="icon"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-slate-700 dark:text-slate-300"
                    size="icon"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-slate-700 dark:text-slate-300"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};