import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Users, Sparkles } from "lucide-react";

const testimonials = [
  {
    quote: "BarathAI feels like talking to a genius friend who's always available. The conversations are so natural and helpful!",
    author: "Sarah Mitchell",
    role: "Content Creator",
    avatar: "SM",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    quote: "The speed and accuracy are incredible. I use BarathAI daily for coding help and creative brainstorming.",
    author: "Alex Kumar",
    role: "Software Developer",
    avatar: "AK",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    quote: "BarathAI has transformed how I work and think. It's like having a research assistant that never sleeps.",
    author: "Maya Patel",
    role: "Research Analyst",
    avatar: "MP",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10"
  },
  {
    quote: "The voice interaction feature is game-changing. I can have conversations while multitasking seamlessly.",
    author: "David Chen",
    role: "Product Manager",
    avatar: "DC",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10"
  },
  {
    quote: "BarathAI delivers exceptional AI capabilities. The context understanding is better than any other AI I've used.",
    author: "Emma Rodriguez",
    role: "Marketing Director",
    avatar: "ER",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 to-red-500/10"
  },
  {
    quote: "From creative writing to technical questions, BarathAI adapts to my needs perfectly. Absolutely love it!",
    author: "James Wilson",
    role: "Freelance Writer",
    avatar: "JW",
    gradient: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-500/10 to-blue-500/10"
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 px-4 bg-gradient-to-br from-pink-50 via-rose-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-br from-pink-300/20 via-rose-300/15 to-orange-300/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-blue-300/18 via-indigo-300/12 to-violet-300/18 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-gradient-to-r from-teal-300/12 via-cyan-300/8 to-emerald-300/12 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-[22rem] h-[22rem] bg-gradient-to-br from-yellow-300/15 via-amber-300/10 to-orange-300/15 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[20rem] h-[20rem] bg-gradient-to-br from-purple-300/12 via-pink-300/8 to-rose-300/12 rounded-full blur-xl animate-float-medium" style={{ animationDelay: '5s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-teal-600 via-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text">
              What People Say
            </h2>
            <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto animate-fade-in delay-200 leading-relaxed">
            Join <span className="text-teal-600 dark:text-teal-400 font-semibold">thousands</span> of satisfied users who have discovered the power of <span className="text-violet-600 dark:text-violet-400 font-semibold">intelligent conversation</span> with BarathAI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 shadow-2xl rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover-lift animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 100 + 300}ms` }}
            >
              <CardContent className="p-8 flex flex-col gap-4 relative">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                
                {/* Quote icon */}
                <div className="relative z-10 mb-2">
                  <Quote className={`h-8 w-8 bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent opacity-60`} />
                </div>
                
                {/* Colorful stars */}
                <div className="relative z-10 flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 fill-current ${
                        i % 5 === 0 ? 'text-red-400' :
                        i % 5 === 1 ? 'text-orange-400' :
                        i % 5 === 2 ? 'text-yellow-400' :
                        i % 5 === 3 ? 'text-green-400' :
                        'text-blue-400'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                
                <blockquote className="relative z-10 text-slate-700 dark:text-slate-300 text-base mb-6 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="relative z-10 flex items-center mt-auto">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 shadow-xl group-hover:shadow-2xl transition-shadow duration-300 group-hover:scale-110`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className={`font-bold bg-gradient-to-r ${testimonial.gradient} bg-clip-text text-transparent`}>
                      {testimonial.author}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">{testimonial.role}</div>
                  </div>
                </div>
                
                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Enhanced trust indicators */}
        <div className="mt-24 animate-fade-in delay-1000">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/60 dark:border-slate-700/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Users, value: "10,000+", label: "Happy Users", gradient: "from-emerald-500 to-teal-500" },
                { icon: Sparkles, value: "1M+", label: "Conversations", gradient: "from-violet-500 to-purple-500" },
                { icon: Star, value: "4.9", label: "Avg. Rating", gradient: "from-yellow-500 to-orange-500" },
              ].map(({ icon: Icon, value, label, gradient }, index) => (
                <div key={label} className="flex flex-col items-center space-y-3 group">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    {value}
                  </div>
                  <span className="text-lg font-semibold text-slate-600 dark:text-slate-300 text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};