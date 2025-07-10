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
    description: "Type your questions or use voice input - BarathAI understands both with advanced speech recognition"
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
    <section className="py-24 px-4 bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-lg transition-colors duration-300 relative overflow-hidden">
      {/* Animated background shape */}
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 dark:from-purple-700/30 dark:to-blue-700/30 rounded-full blur-3xl animate-float-medium -z-10" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-4 animate-gradient-text">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto animate-fade-in delay-200">
            Getting started with BarathAI is simple and intuitive. Follow these easy steps to begin your AI-powered conversation journey.
          </p>
        </div>
        {/* Stepper timeline */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 mb-16">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-teal-400/30 rounded-full -z-10" style={{transform: 'translateY(-50%)'}} />
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center w-full lg:w-1/4 animate-fade-in-up" style={{ animationDelay: `${index * 180 + 200}ms` }}>
              {/* Step number */}
              <div className="mb-4 flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white dark:border-slate-900 animate-gradient-text">
                  {index + 1}
                </div>
              </div>
              {/* Icon */}
              <div className="mb-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <step.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center animate-gradient-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed text-center">
                {step.description}
              </p>
              {/* Connector for mobile */}
              {index < steps.length - 1 && (
                <div className="block lg:hidden w-1 h-12 bg-gradient-to-b from-blue-400/30 to-purple-400/30 rounded-full my-2" />
              )}
            </div>
          ))}
        </div>
        {/* Call to action */}
        <div className="text-center mt-12 animate-fade-in-up delay-800">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 px-8 py-4 rounded-full border border-blue-200 dark:border-blue-800 shadow">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300 font-medium text-lg">It's completely free to get started</span>
          </div>
        </div>
      </div>
    </section>
  );
};