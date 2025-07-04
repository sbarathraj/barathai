
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "It feels like talking to a genius friend.",
    author: "Sarah M.",
    role: "Content Creator"
  },
  {
    quote: "So fast, so smooth — I use it daily.",
    author: "Alex K.",
    role: "Software Developer"
  },
  {
    quote: "BarathAI has transformed how I work and think.",
    author: "Maya P.",
    role: "Research Analyst"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          What People
          <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent ml-3">
            Say
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-8">
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-slate-300 text-lg mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
