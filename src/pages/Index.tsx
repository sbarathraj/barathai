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
    <div className="main-container relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-cyan-50 via-violet-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 pt-16">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-violet-200/30 to-pink-200/40 dark:from-cyan-900/30 dark:via-violet-900/20 dark:to-pink-900/30 animate-gradient-move" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-200/30 via-cyan-200/20 to-violet-200/30 dark:from-pink-900/20 dark:via-cyan-900/10 dark:to-violet-900/20 animate-gradient-move" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/25 via-teal-100/15 to-blue-100/25 dark:from-emerald-900/15 dark:via-teal-900/10 dark:to-blue-900/15 animate-gradient-move" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-100/20 via-orange-100/15 to-red-100/20 dark:from-yellow-900/10 dark:via-orange-900/8 dark:to-red-900/10 animate-gradient-move" style={{ animationDelay: '6s' }} />
      </div>
      <Navigation />
      <div id="hero" className="scroll-mt-24">
        <Hero />
      </div>
      <div id="features" className="scroll-mt-24">
        <Features />
      </div>
      <div id="how-it-works" className="scroll-mt-24">
        <HowItWorks />
      </div>
      <div id="testimonials" className="scroll-mt-24">
        <Testimonials />
      </div>
      <div id="get-started" className="scroll-mt-24">
        <GetStarted />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
