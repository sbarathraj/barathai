import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-teal-600/20 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="absolute -inset-2 bg-blue-400/20 rounded-full blur-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Ready to experience
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent block mt-2">
            the future of AI?
          </span>
        </h2>
        
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          Join thousands of users who have already discovered the power of intelligent conversation. 
          Start your journey with BarathAI today - it's completely free!
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Instant Access</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Privacy Protected</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white px-12 py-6 text-xl rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 group"
          >
            <MessageCircle className="mr-3 h-6 w-6 group-hover:animate-pulse" />
            Start Chatting Now
          </Button>

          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/auth')}
            className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-12 py-6 text-xl rounded-full transition-all duration-300 hover:scale-105 group backdrop-blur-sm"
          >
            Create Account
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            Trusted by professionals worldwide
          </p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-slate-400 dark:text-slate-600 font-semibold">Developers</div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-slate-400 dark:text-slate-600 font-semibold">Creators</div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-slate-400 dark:text-slate-600 font-semibold">Researchers</div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-slate-400 dark:text-slate-600 font-semibold">Students</div>
          </div>
        </div>
      </div>
    </section>
  );
};