import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Users, Sparkles } from "lucide-react";

const testimonials = [
  {
    quote: "BarathAI feels like talking to a genius friend who's always available. The conversations are so natural and helpful!",
    author: "Sarah Mitchell",
    role: "Content Creator",
    avatar: "SM"
  },
  {
    quote: "The speed and accuracy are incredible. I use BarathAI daily for coding help and creative brainstorming.",
    author: "Alex Kumar",
    role: "Software Developer",
    avatar: "AK"
  },
  {
    quote: "BarathAI has transformed how I work and think. It's like having a research assistant that never sleeps.",
    author: "Maya Patel",
    role: "Research Analyst",
    avatar: "MP"
  },
  {
    quote: "The voice interaction feature is game-changing. I can have conversations while multitasking seamlessly.",
    author: "David Chen",
    role: "Product Manager",
    avatar: "DC"
  },
  {
    quote: "Privacy-focused AI that actually delivers. BarathAI understands context better than any other AI I've used.",
    author: "Emma Rodriguez",
    role: "Marketing Director",
    avatar: "ER"
  },
  {
    quote: "From creative writing to technical questions, BarathAI adapts to my needs perfectly. Absolutely love it!",
    author: "James Wilson",
    role: "Freelance Writer",
    avatar: "JW"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 px-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-lg transition-colors duration-300 relative overflow-hidden">
      {/* Animated background shape */}
      <div className="absolute -top-32 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-700/30 dark:to-purple-700/30 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-gradient-text">
            What People Say
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto animate-fade-in delay-200">
            Join thousands of satisfied users who have discovered the power of intelligent conversation with BarathAI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-fade-in-up"
              style={{ animationDelay: `${index * 120 + 200}ms` }}
            >
              <CardContent className="p-8 flex flex-col gap-4">
                {/* Quote icon */}
                <div className="mb-2">
                  <Quote className="h-8 w-8 text-blue-600/30 dark:text-blue-400/30" />
                </div>
                {/* Stars */}
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 dark:text-slate-300 text-base mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Trust indicators */}
        <div className="mt-20 text-center animate-fade-in-up delay-800">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-90">
            <div className="flex items-center space-x-2">
              <Users className="h-7 w-7 text-blue-500" />
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">10,000+</div>
              <span className="text-lg text-slate-500 dark:text-slate-400">Happy Users</span>
            </div>
            <div className="w-px h-10 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-7 w-7 text-purple-500" />
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">1M+</div>
              <span className="text-lg text-slate-500 dark:text-slate-400">Conversations</span>
            </div>
            <div className="w-px h-10 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Star className="h-7 w-7 text-yellow-500" />
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">4.9</div>
              <span className="text-lg text-slate-500 dark:text-slate-400">Avg. Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};