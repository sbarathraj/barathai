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
    <section className="py-24 px-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-lg transition-colors duration-300 relative overflow-hidden">
      {/* Animated floating background shape */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-700/30 dark:to-purple-700/30 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-gradient-text">
            Why Choose BarathAI?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto animate-fade-in delay-200">
            Experience the next generation of AI conversation with features designed for productivity, creativity, and seamless interaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-fade-in-up`}
              style={{ animationDelay: `${index * 120 + 200}ms` }}
            >
              <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-600/30 dark:to-purple-600/30 rounded-full group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 shadow">
                  <feature.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 animate-gradient-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};