
import { MessageCircle, Type, Zap } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    title: "Start Chatting",
    description: "Open BarathAI and begin your conversation instantly"
  },
  {
    icon: Type,
    title: "Speak or Type Naturally",
    description: "Express yourself however feels most comfortable"
  },
  {
    icon: Zap,
    title: "Get Smart Answers Instantly",
    description: "Receive intelligent, helpful responses in seconds"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-slate-800/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          How It
          <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent ml-3">
            Works
          </span>
        </h2>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center group">
              <div className="relative">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                {/* Icon container */}
                <div className="mb-6 flex justify-center">
                  <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 group-hover:scale-110">
                    <step.icon className="h-12 w-12 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
              
              {/* Arrow connector (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
