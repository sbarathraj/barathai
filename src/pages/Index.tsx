import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { GetStarted } from "@/components/GetStarted";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated and redirect to chat
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/chat');
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/chat');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 animate-gradient-move bg-gradient-to-br from-rose-200/60 via-fuchsia-200/40 to-pink-200/60 dark:from-rose-900/60 dark:via-fuchsia-900/40 dark:to-pink-900/60 blur-2xl opacity-80" />
      <Navigation />
      <div id="hero" className="scroll-mt-24 z-0">
        <Hero />
      </div>
      <div id="features" className="scroll-mt-24 z-0">
        <Features />
      </div>
      <div id="how-it-works" className="scroll-mt-24 z-0">
        <HowItWorks />
      </div>
      <div id="testimonials" className="scroll-mt-24 z-0">
        <Testimonials />
      </div>
      <div id="get-started" className="scroll-mt-24 z-0">
        <GetStarted />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
