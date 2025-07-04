
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-bounce delay-1000"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main headline with fade-in animation */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            BarathAI
          </span>
          <br />
          <span className="text-3xl md:text-4xl text-slate-300">
            Your Smartest Assistant
          </span>
        </h1>
        
        {/* Animated subheadline */}
        <p className="text-xl md:text-2xl text-slate-400 mb-8 animate-fade-in delay-300">
          Chat naturally. Work smarter. Think faster.
        </p>
        
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
          <Button 
            size="lg" 
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chatting
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
