import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Clock,
  Shield,
  Brain,
  Zap,
  ImageIcon,
  Sparkles,
  Globe,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "50+ AI Models",
    description:
      "Choose from 50+ free AI models including DeepSeek, Qwen, Llama, Gemini, and more - all in one place.",
    gradient: "from-purple-500 to-blue-500",
    bgGradient: "from-purple-500/10 to-blue-500/10",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    description:
      "Create stunning visuals from text descriptions with our advanced AI image generation studio.",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get instant responses with our optimized AI infrastructure and real-time processing.",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
  },
  {
    icon: Mic,
    title: "Voice Interaction",
    description:
      "Speak naturally or type - BarathAI understands both with advanced speech recognition.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Clock,
    title: "Chat History",
    description:
      "Never lose important conversations. All your chats are safely stored and searchable.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 to-red-500/10",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Built with enterprise-grade security and reliability powered by BarathAI.",
    gradient: "from-indigo-500 to-blue-500",
    bgGradient: "from-indigo-500/10 to-blue-500/10",
  },
  {
    icon: Sparkles,
    title: "Model Switching",
    description:
      "Seamlessly switch between reasoning, coding, vision, and general models for any task.",
    gradient: "from-cyan-500 to-teal-500",
    bgGradient: "from-cyan-500/10 to-teal-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Provider",
    description:
      "Access models from DeepSeek, Qwen, Meta, Google, Mistral, NVIDIA, and 15+ providers.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Users,
    title: "Free Forever",
    description:
      "All 50+ AI models are completely free. No hidden costs, no subscriptions required.",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="py-32 px-4 bg-gradient-to-br from-violet-50 via-pink-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative overflow-hidden"
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-gradient-to-br from-cyan-300/20 via-violet-300/15 to-pink-300/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-br from-violet-300/18 via-pink-300/12 to-cyan-300/18 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] bg-gradient-to-r from-pink-300/12 via-cyan-300/8 to-violet-300/12 rounded-full blur-2xl animate-pulse" />
        <div
          className="absolute top-20 right-20 w-[20rem] h-[20rem] bg-gradient-to-br from-emerald-300/15 via-teal-300/10 to-blue-300/15 rounded-full blur-2xl animate-float-slow"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-20 left-20 w-[18rem] h-[18rem] bg-gradient-to-br from-orange-300/12 via-yellow-300/8 to-red-300/12 rounded-full blur-xl animate-float-medium"
          style={{ animationDelay: "5s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text">
              Why Choose BarathAI?
            </h2>
            <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
          </div>
          <p className="text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto animate-fade-in delay-200 leading-relaxed">
            Experience the next generation of AI conversation with features
            designed for
            <span className="text-violet-600 dark:text-violet-400 font-semibold">
              {" "}
              productivity
            </span>
            ,
            <span className="text-pink-600 dark:text-pink-400 font-semibold">
              {" "}
              creativity
            </span>
            , and
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
              {" "}
              seamless interaction
            </span>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-white/50 dark:border-slate-700/50 shadow-2xl rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover-lift animate-fade-in`}
              style={{ animationDelay: `${index * 150 + 300}ms` }}
            >
              <CardContent className="p-10 text-center flex flex-col items-center gap-6 relative overflow-hidden">
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                />

                {/* Icon container */}
                <div
                  className={`relative z-10 p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}
                >
                  <feature.icon className="h-8 w-8 text-white animate-float" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3
                    className={`text-2xl font-bold mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="mt-24 text-center">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-2 border-white/50 dark:border-slate-700/50">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    10K+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Happy Users
                  </div>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    50+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Countries
                  </div>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    99.9%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Uptime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
