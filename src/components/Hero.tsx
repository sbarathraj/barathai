import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles, Zap, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 sm:pt-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-400/10 dark:bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Logo and brand */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Logo size={80} />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              BarathAI
            </span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl text-slate-700 dark:text-slate-300 font-medium">
              Your Smartest Assistant
            </span>
          </h1>
        </div>
        
        {/* Animated tagline */}
        <div className="mb-8 animate-fade-in delay-300">
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-4">
            Chat naturally. Work smarter. Think faster.
          </p>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-500 max-w-2xl mx-auto px-4">
            Experience the future of AI conversation with advanced natural language processing, 
            voice interaction, and intelligent responses tailored to your needs.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 animate-fade-in delay-500 px-4">
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Powered</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lightning Fast</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Intelligent</span>
          </div>
        </div>
        
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-700 px-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 group"
          >
            <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Start Chatting Now
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 sm:mt-16 animate-fade-in delay-1000 px-4">
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">Trusted by thousands of users worldwide</p>
          <div className="flex justify-center items-center space-x-4 sm:space-x-8 opacity-60">
            <div className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600">10K+</div>
            <div className="w-px h-6 sm:h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600">24/7</div>
            <div className="w-px h-6 sm:h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600">99.9%</div>
          </div>
          <div className="flex justify-center items-center space-x-4 sm:space-x-8 mt-2">
            <div className="text-xs text-slate-400 dark:text-slate-500">Active Users</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">Available</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};