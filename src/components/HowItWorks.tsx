import { MessageCircle, Type, Zap, Sparkles, Play, Mic, Brain, Rocket } from "lucide-react";

const steps = [
  {
    icon: Play,
    title: "Start Your Conversation",
    description: "Simply open BarathAI and begin chatting instantly - no complex setup required",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-500/10 to-cyan-500/10"
  },
  {
    icon: Mic,
    title: "Communicate Naturally",
    description: "Type your questions or use voice input - BarathAI understands both with advanced speech recognition",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgGradient: "from-blue-500/10 to-violet-500/10"
  },
  {
    icon: Brain,
    title: "Get Intelligent Responses",
    description: "Receive thoughtful, contextual answers powered by advanced AI in real-time",
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    bgGradient: "from-violet-500/10 to-pink-500/10"
  },
  {
    icon: Rocket,
    title: "Continue the Journey",
    description: "Build on conversations, explore ideas, and let BarathAI help you achieve more",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    bgGradient: "from-pink-500/10 to-orange-500/10"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-4 bg-gradient-to-br from-emerald-50 via-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-br from-violet-300/20 via-purple-300/15 to-pink-300/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] bg-gradient-to-br from-cyan-300/18 via-blue-300/12 to-indigo-300/18 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-gradient-to-r from-emerald-300/12 via-teal-300/8 to-cyan-300/12 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[20rem] h-[20rem] bg-gradient-to-br from-yellow-300/15 via-orange-300/10 to-red-300/15 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[18rem] h-[18rem] bg-gradient-to-br from-indigo-300/12 via-violet-300/8 to-purple-300/12 rounded-full blur-xl animate-float-medium" style={{ animationDelay: '6s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 via-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text">
              How It Works
            </h2>
            <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
          </div>
          <p className="text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto animate-fade-in delay-200 leading-relaxed">
            Getting started with BarathAI is <span className="text-emerald-600 dark:text-emerald-400 font-semibold">simple</span> and <span className="text-violet-600 dark:text-violet-400 font-semibold">intuitive</span>. Follow these easy steps to begin your AI-powered conversation journey.
          </p>
        </div>
        {/* Enhanced stepper timeline */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 mb-20">
          {/* Animated timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400/30 via-cyan-400/30 via-blue-400/30 via-violet-400/30 to-pink-400/30 rounded-full -z-10 animate-gradient-move" style={{transform: 'translateY(-50%)'}} />
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center w-full lg:w-1/4 group animate-fade-in" style={{ animationDelay: `${index * 150 + 300}ms` }}>
              {/* Step number with enhanced design */}
              <div className="mb-6 flex items-center justify-center relative">
                <div className={`absolute -inset-4 bg-gradient-to-r ${step.gradient} rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`} />
                <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform duration-300`}>
                  {index + 1}
                </div>
              </div>
              
              {/* Enhanced icon container */}
              <div className={`relative mb-6 p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/60 dark:border-slate-700/60 group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`relative z-10 p-2 rounded-xl bg-gradient-to-r ${step.gradient} shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
              
              {/* Enhanced connector for mobile */}
              {index < steps.length - 1 && (
                <div className={`block lg:hidden w-2 h-16 bg-gradient-to-b ${step.gradient} rounded-full my-6 opacity-30`} />
              )}
            </div>
          ))}
        </div>
        {/* Enhanced call to action */}
        <div className="text-center animate-fade-in delay-1000">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/60 dark:border-slate-700/60 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
              <Zap className="h-6 w-6 text-violet-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Sparkles className="h-6 w-6 text-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-violet-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              It's <span className="text-emerald-600 dark:text-emerald-400 font-bold">completely free</span> to begin your AI journey with BarathAI
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};