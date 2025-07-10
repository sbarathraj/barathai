import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles, Zap, Brain, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useEffect, useRef, useState } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const tagline = "Chat naturally. Work smarter. Think faster.";
  const typingIndex = useRef(0);

  // Typewriter effect for tagline
  useEffect(() => {
    setTypedText("");
    typingIndex.current = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + tagline[typingIndex.current]);
      typingIndex.current++;
      if (typingIndex.current >= tagline.length) clearInterval(interval);
    }, 32);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 sm:pt-20 overflow-hidden">
      {/* Animated floating background shapes */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-24 left-10 w-40 h-40 bg-blue-400/20 dark:bg-blue-400/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-24 right-10 w-32 h-32 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-2xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center gap-8">
        {/* Logo with animated border */}
        <div className="mb-6 animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-60 animate-gradient-move" />
            <Logo size={96} />
          </div>
        </div>
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-xl mb-4">
          BarathAI
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-slate-700 dark:text-slate-300 font-medium animate-fade-in delay-200 mb-4">
          Your Smartest Assistant
        </h2>
        {/* Animated tagline */}
        <div className="mb-6 min-h-[2.5rem] animate-fade-in delay-300">
          <span className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-mono tracking-wide">
            {typedText}
            <span className="inline-block w-2 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded animate-blink align-middle ml-1" />
          </span>
        </div>
        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 animate-fade-in delay-500 px-4">
          <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Powered</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lightning Fast</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Intelligent</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Private & Secure</span>
          </div>
        </div>
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-700 px-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl group shadow-lg backdrop-blur-md"
          >
            <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Start Chatting Now
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-10 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 group backdrop-blur-md shadow"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        {/* Trust indicators */}
        <div className="mt-12 sm:mt-16 animate-fade-in delay-1000 px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-500" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200">10K+</div>
              <span className="text-base text-slate-500 dark:text-slate-400">Active Users</span>
            </div>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200">99.9%</div>
              <span className="text-base text-slate-500 dark:text-slate-400">Uptime</span>
            </div>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <div className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200">24/7</div>
              <span className="text-base text-slate-500 dark:text-slate-400">Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};