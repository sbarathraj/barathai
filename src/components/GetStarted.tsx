import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, MessageCircle, ShieldCheck, Zap, Star, Rocket, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <section id="get-started" className="py-32 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-br from-cyan-300/20 via-violet-300/15 to-pink-300/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] bg-gradient-to-br from-violet-300/18 via-pink-300/12 to-cyan-300/18 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-gradient-to-r from-pink-300/12 via-cyan-300/8 to-violet-300/12 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[24rem] h-[24rem] bg-gradient-to-br from-indigo-300/15 via-purple-300/10 to-pink-300/15 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[20rem] h-[20rem] bg-gradient-to-br from-rose-300/12 via-pink-300/8 to-purple-300/12 rounded-full blur-xl animate-float-medium" style={{ animationDelay: '4s' }} />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-gradient-to-r ${
              i % 4 === 0 ? 'from-cyan-400 to-blue-500' :
              i % 4 === 1 ? 'from-violet-400 to-purple-500' :
              i % 4 === 2 ? 'from-pink-400 to-rose-500' :
              'from-indigo-400 to-violet-500'
            } rounded-full opacity-40 animate-particle-float`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Premium header section */}
        <div className="mb-16">
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-full opacity-20 blur-2xl animate-gradient-move group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/95 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-white/50 dark:border-slate-600/50">
                <Crown className="h-12 w-12 text-violet-600 animate-float" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text leading-tight">
              Ready to experience
              <span className="block mt-4">the future of AI?</span>
            </h2>
            
            <div className="flex items-center justify-center gap-1 mb-8">
              <Star className="w-4 h-4 text-red-400 animate-pulse" />
              <Star className="w-4 h-4 text-orange-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Star className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <Star className="w-4 h-4 text-green-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <Star className="w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.8s' }} />
            </div>
            
            <p className="text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto animate-fade-in delay-200 leading-relaxed">
              Join <span className="text-violet-600 dark:text-violet-400 font-bold">10,000+</span> users who have already discovered the power of intelligent conversation. 
              Start your journey with BarathAI today - it's <span className="text-emerald-600 dark:text-emerald-400 font-bold">completely free!</span>
            </p>
          </div>
        </div>
        {/* Premium feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {[
            { icon: ShieldCheck, label: "Privacy Protected", color: "from-emerald-500 to-teal-500", delay: "delay-300" },
            { icon: Zap, label: "Instant Access", color: "from-cyan-500 to-blue-500", delay: "delay-500" },
            { icon: Sparkles, label: "No Credit Card Required", color: "from-violet-500 to-purple-500", delay: "delay-700" },
          ].map(({ icon: Icon, label, color, delay }, index) => (
            <div 
              key={label}
              className={`group flex items-center space-x-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-8 py-4 rounded-2xl border-2 border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift animate-fade-in ${delay}`}
            >
              <div className={`p-2 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{label}</span>
            </div>
          ))}
        </div>
        {/* Premium CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20 animate-fade-in delay-1000">
          <Button 
            size="lg"
            onClick={() => navigate('/chat')}
            className="relative bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white px-16 py-8 text-2xl font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-3xl group shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <MessageCircle className="mr-4 h-8 w-8 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Start Chatting Now</span>
            <Rocket className="ml-4 h-8 w-8 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-300 relative z-10" />
          </Button>

          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/auth')}
            className="relative border-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 px-16 py-8 text-2xl font-bold rounded-2xl transition-all duration-500 hover:scale-110 group backdrop-blur-xl shadow-xl hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Create Account</span>
            <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-3 transition-transform duration-300 relative z-10" />
          </Button>
        </div>
        {/* Premium trust indicators */}
        <div className="animate-fade-in delay-1200">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-white/50 dark:border-slate-700/50">
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 font-medium">
              Trusted by professionals worldwide
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Developers", icon: "💻" },
                { label: "Creators", icon: "🎨" },
                { label: "Researchers", icon: "🔬" },
                { label: "Students", icon: "📚" },
              ].map(({ label, icon }, index) => (
                <div 
                  key={label}
                  className="flex flex-col items-center gap-3 group hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Final CTA */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                What are you waiting for? Join the AI revolution today! 🚀
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>100% Free to start</span>
                <span className="mx-2">•</span>
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Setup in 30 seconds</span>
                <span className="mx-2">•</span>
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>No commitment required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};