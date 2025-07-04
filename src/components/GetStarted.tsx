
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <Sparkles className="h-16 w-16 text-blue-400 mx-auto mb-6 animate-pulse" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to experience
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent block mt-2">
            BarathAI?
          </span>
        </h2>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Join thousands of users who have already discovered the power of intelligent conversation.
        </p>
        
        <Button 
          size="lg"
          onClick={() => navigate('/chat')}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-500 hover:via-purple-500 hover:to-teal-500 text-white px-12 py-6 text-xl rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 animate-pulse"
        >
          <Sparkles className="mr-3 h-6 w-6" />
          Start Chatting Now
        </Button>
      </div>
    </section>
  );
};
