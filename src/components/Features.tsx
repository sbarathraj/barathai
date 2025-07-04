
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Mic, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Instant Conversations",
    description: "Get immediate responses to all your questions with lightning-fast AI processing."
  },
  {
    icon: Mic,
    title: "Voice Friendly",
    description: "Speak naturally or type - BarathAI understands both perfectly."
  },
  {
    icon: Clock,
    title: "History Saved",
    description: "Never lose important conversations. All your chats are safely stored and searchable."
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your conversations are encrypted and kept completely private and secure."
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          Why Choose 
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-3">
            BarathAI?
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 animate-fade-in group"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
