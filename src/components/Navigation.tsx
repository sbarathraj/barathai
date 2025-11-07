import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, MessageCircle, Settings, LogOut, User as UserIcon, Sparkles, Home, Zap, Wrench, Star, Rocket, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Complete section configuration with icons and descriptions
  const sections = [
    { 
      id: "hero", 
      label: "Home", 
      icon: Home, 
      description: "Welcome to BarathAI",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      id: "features", 
      label: "Features", 
      icon: Zap, 
      description: "Powerful AI capabilities",
      color: "from-violet-500 to-purple-500"
    },
    { 
      id: "how-it-works", 
      label: "How It Works", 
      icon: Wrench, 
      description: "Simple 3-step process",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      id: "testimonials", 
      label: "Testimonials", 
      icon: Star, 
      description: "What users say",
      color: "from-amber-500 to-orange-500"
    },
    { 
      id: "get-started", 
      label: "Get Started", 
      icon: Rocket, 
      description: "Begin your journey",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark';
    setDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Authentication check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);

      if (location.pathname !== "/") return;
      
      let current = "hero";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, sections]);

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

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div 
      className="navigation-fixed"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 99999, 
        width: '100vw',
        height: '64px',
        pointerEvents: 'auto'
      }}
    >
      <nav className="w-full h-full relative">
        {/* Enhanced animated particles */}
        <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
          <div className="absolute left-8 top-2 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-60 animate-pulse" />
          <div className="absolute right-12 top-4 w-2 h-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-50 animate-pulse" />
          <div className="absolute left-1/3 top-6 w-2.5 h-2.5 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full opacity-40 animate-pulse" />
          <div className="absolute right-1/4 top-3 w-1.5 h-1.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-60 animate-pulse" />
          <div className="absolute left-3/4 top-5 w-2 h-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-50 animate-pulse" />
        </div>
        
        {/* Enhanced gradient background */}
        <div className={`absolute inset-0 h-full w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg' 
            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-md'
        }`} />
        
        <div className="relative w-full h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full w-full">
            {/* Enhanced Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-25 blur-lg transition-opacity duration-300" />
                <div className="relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-full p-2">
                  <Logo size={32} className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                BarathAI
              </span>
              <Sparkles className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </div>

            {/* Enhanced Desktop Section Navigation */}
            {location.pathname === "/" && (
              <div className="hidden lg:flex items-center space-x-1">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 group flex items-center space-x-2 ${
                        activeSection === section.id 
                          ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105` 
                          : "text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="relative z-10">{section.label}</span>
                      {activeSection !== section.id && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-300`} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Enhanced Desktop User Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/chat')}
                    className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-105 group px-3 py-2"
                  >
                    <MessageCircle className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    <span className="text-sm font-medium">Chat</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/settings')}
                    className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-105 group p-2"
                    size="icon"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-105"
                    size="icon"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  {user && (user as any).email === 'jcibarathraj@gmail.com' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/admin')}
                      className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-105"
                      title="Admin Panel"
                    >
                      <UserIcon className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/auth')}
                    className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-105 font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="relative bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <span className="relative z-10 font-medium">Get Started</span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-105 group"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="h-4 w-4 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </Button>
            </div>

            {/* Enhanced Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-110 group p-2"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="h-4 w-4 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-110 group p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                )}
              </Button>
              {user && (user as any).email === 'jcibarathraj@gmail.com' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 hover:scale-110 p-2"
                  title="Admin Panel"
                >
                  <UserIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Professional Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 shadow-2xl animate-slide-down">
            <div className="px-4 py-6 max-h-[80vh] overflow-y-auto">
              {/* Mobile Section Navigation */}
              {location.pathname === "/" && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                    Navigate Sections
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {sections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 group ${
                            activeSection === section.id 
                              ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-[1.02]` 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              activeSection === section.id 
                                ? 'bg-white/20' 
                                : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-base">{section.label}</div>
                              <div className={`text-sm ${
                                activeSection === section.id 
                                  ? 'text-white/80' 
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                {section.description}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                            activeSection === section.id ? 'rotate-90' : 'group-hover:translate-x-1'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile User Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                  {user ? 'Account' : 'Get Started'}
                </h3>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('/chat');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 py-4 h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Chat</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Start conversation</div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate('/settings');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 py-4 h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Settings</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Manage preferences</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 py-4 h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Logout</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Sign out securely</div>
                        </div>
                      </div>
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
                      className="w-full justify-start text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 py-4 h-auto"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Sign In</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Access your account</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-auto"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <Sparkles className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-bold">Get Started Free</div>
                          <div className="text-sm text-white/80">Begin your AI journey</div>
                        </div>
                      </div>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
