
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Chat } from "./pages/Chat";
import Settings from "./pages/Settings";
import SettingsDemo from "./pages/SettingsDemo";
import NotFound from "./pages/NotFound";
import { Footer } from "./components/Footer";
import Admin from "./pages/Admin";

import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const INACTIVITY_LIMIT_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in ms

const InactivityHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const now = Date.now();
    const lastActivity = Number(localStorage.getItem('lastActivity'));
    if (lastActivity && now - lastActivity > INACTIVITY_LIMIT_MS) {
      supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      navigate('/auth');
    } else {
      localStorage.setItem('lastActivity', String(now));
    }
  }, [location.pathname]);

  // Also update lastActivity on user actions (click, keydown)
  useEffect(() => {
    const updateActivity = () => localStorage.setItem('lastActivity', String(Date.now()));
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="barathAI-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <InactivityHandler />
        <div className="min-h-screen w-full bg-gradient-to-br from-rose-200/80 via-rose-100/70 to-pink-200/80 dark:from-rose-900/80 dark:via-rose-800/70 dark:to-pink-900/80 backdrop-blur-2xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 shadow-2xl">
          <div className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings-demo" element={<SettingsDemo />} />
              <Route path="/admin" element={<Admin />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
