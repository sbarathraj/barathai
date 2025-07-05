import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Mic, Clock, Shield, Brain, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Advanced AI",
    description: "Powered by cutting-edge language models for intelligent, context-aware conversations."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant responses with our optimized AI infrastructure and real-time processing."
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description: "Speak naturally or type - BarathAI understands both with advanced speech recognition."
  },
  {
    icon: Clock,
    title: "Chat History",
    description: "Never lose important conversations. All your chats are safely stored and searchable."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your conversations are encrypted and kept completely private and secure."
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Experience human-like interactions with contextual understanding and memory."
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BarathAI?
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Experience the next generation of AI conversation with features designed for productivity, 
            creativity, and seamless interaction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};