import { MessageCircle, Type, Zap, Sparkles } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Start Your Conversation",
    description: "Simply open BarathAI and begin chatting instantly - no complex setup required"
  },
  {
    icon: Type,
    title: "Communicate Naturally",
    description: "Type your questions or use voice input - express yourself however feels most comfortable"
  },
  {
    icon: Zap,
    title: "Get Intelligent Responses",
    description: "Receive thoughtful, contextual answers powered by advanced AI in real-time"
  },
  {
    icon: Sparkles,
    title: "Continue the Journey",
    description: "Build on conversations, explore ideas, and let BarathAI help you achieve more"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Getting started with BarathAI is simple and intuitive. Follow these easy steps to begin 
            your AI-powered conversation journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              {/* Step connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 transform translate-x-4 z-0"></div>
              )}
              
              <div className="relative z-10">
                {/* Step number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon container */}
                <div className="mb-6 flex justify-center">
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 border border-slate-200 dark:border-slate-700">
                    <step.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Ready to experience the future of AI conversation?
          </p>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">It's completely free to get started</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};