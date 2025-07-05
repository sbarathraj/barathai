import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

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
    <section className="py-20 px-4 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            What People{" "}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Join thousands of satisfied users who have discovered the power of intelligent conversation 
            with BarathAI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote className="h-8 w-8 text-blue-600/30 dark:text-blue-400/30" />
                </div>
                
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 dark:text-slate-300 text-base mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
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
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">4.9</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-slate-600 dark:text-slate-400">
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm">Happy Users</div>
            </div>
            <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-slate-600 dark:text-slate-400">
              <div className="text-2xl font-bold">1M+</div>
              <div className="text-sm">Conversations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};