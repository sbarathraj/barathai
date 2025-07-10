
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Chat } from "./pages/Chat";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen w-full bg-gradient-to-br from-rose-200/80 via-rose-100/70 to-pink-200/80 dark:from-rose-900/80 dark:via-rose-800/70 dark:to-pink-900/80 backdrop-blur-2xl flex flex-col items-center justify-center border border-white/30 dark:border-slate-800/40 shadow-2xl">
          <div className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
