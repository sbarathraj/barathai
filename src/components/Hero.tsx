import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  Zap,
  Brain,
  ShieldCheck,
  Users,
  ImageIcon,
  Star,
  Rocket,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useEffect, useRef, useState } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
      return () =>
        heroElement.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Premium animated background system */}
      <AnimatedBackground />

      {/* Ultra-colorful dynamic animated background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Multi-layered interactive gradient orbs */}
        <div
          className="absolute w-[32rem] h-[32rem] bg-gradient-to-r from-emerald-400/25 via-cyan-400/20 to-blue-400/25 rounded-full blur-3xl animate-float-slow transition-all duration-1000"
          style={{
            top: "5%",
            left: `${8 + mousePosition.x * 4}%`,
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 10}px)`,
          }}
        />
        <div
          className="absolute w-[28rem] h-[28rem] bg-gradient-to-r from-violet-400/22 via-purple-400/18 to-pink-400/22 rounded-full blur-2xl animate-float-medium transition-all duration-1000"
          style={{
            top: "20%",
            right: `${12 + mousePosition.y * 4}%`,
            transform: `translate(${-mousePosition.x * 15}px, ${-mousePosition.y * 18}px)`,
          }}
        />
        <div
          className="absolute w-[24rem] h-[24rem] bg-gradient-to-r from-pink-400/20 via-rose-400/15 to-orange-400/20 rounded-full blur-xl animate-pulse transition-all duration-1000"
          style={{
            bottom: "25%",
            left: `${25 + mousePosition.x * 3}%`,
            transform: `translate(${mousePosition.x * 12}px, ${mousePosition.y * 15}px)`,
          }}
        />
        <div
          className="absolute w-[20rem] h-[20rem] bg-gradient-to-r from-cyan-400/18 via-teal-400/12 to-emerald-400/18 rounded-full blur-lg animate-float-slow transition-all duration-1000"
          style={{
            bottom: "10%",
            right: `${20 + mousePosition.y * 2}%`,
            transform: `translate(${-mousePosition.x * 10}px, ${mousePosition.y * 8}px)`,
          }}
        />
        <div
          className="absolute w-[16rem] h-[16rem] bg-gradient-to-r from-indigo-400/15 via-blue-400/10 to-cyan-400/15 rounded-full blur-md animate-float-medium transition-all duration-1000"
          style={{
            top: "70%",
            left: `${70 + mousePosition.x * 2}%`,
            transform: `translate(${mousePosition.x * 8}px, ${-mousePosition.y * 10}px)`,
          }}
        />

        {/* Rainbow floating elements with varied sizes */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-40 animate-particle-float shadow-xl ${
              i % 6 === 0
                ? "w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500"
                : i % 6 === 1
                  ? "w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500"
                  : i % 6 === 2
                    ? "w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500"
                    : i % 6 === 3
                      ? "w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"
                      : i % 6 === 4
                        ? "w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500"
                        : "w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-500"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}

        {/* Additional colorful geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className={`absolute opacity-20 animate-float-slow ${
              i % 3 === 0
                ? "w-8 h-8 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-lg rotate-45"
                : i % 3 === 1
                  ? "w-6 h-6 bg-gradient-to-br from-lime-400 to-green-500 rounded-full"
                  : "w-10 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            }`}
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto flex flex-col items-center">
        {/* Clean logo without gap issues */}
        <div className="mb-6 animate-fade-in">
          <Logo size={80} className="animate-float drop-shadow-2xl" />
        </div>

        {/* Enhanced headline with better typography */}
        <div className="space-y-6 mb-10">
          <div className="relative">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-cyan-500 via-violet-500 via-pink-500 to-orange-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
              BarathAI
            </h1>
            {/* Subtle glow effect */}
            <div
              className="absolute inset-0 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-cyan-400 via-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent opacity-20 blur-sm animate-gradient-text"
              style={{ animationDelay: "0.5s" }}
            >
              BarathAI
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 animate-fade-in delay-200">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 animate-pulse ${
                  i % 5 === 0
                    ? "text-cyan-400"
                    : i % 5 === 1
                      ? "text-violet-400"
                      : i % 5 === 2
                        ? "text-pink-400"
                        : i % 5 === 3
                          ? "text-orange-400"
                          : "text-emerald-400"
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold animate-fade-in delay-300">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Your
            </span>{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Smartest
            </span>{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Assistant
            </span>
          </h2>
        </div>

        {/* Enhanced tagline with better styling */}
        <div className="mb-10 animate-fade-in delay-300">
          <p className="text-xl sm:text-2xl md:text-3xl text-slate-600 dark:text-slate-300 font-medium tracking-wide leading-relaxed max-w-4xl mx-auto">
            Converse with AI.{" "}
            <span className="text-violet-600 dark:text-violet-400 font-bold">
              Boost productivity.
            </span>{" "}
            <span className="text-pink-600 dark:text-pink-400 font-bold">
              Unlock creativity.
            </span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
        {/* Ultra-colorful feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in delay-500 px-4">
          {[
            {
              icon: Brain,
              label: "50+ AI Models",
              color: "from-purple-400 via-blue-500 to-cyan-500",
              bgColor: "from-purple-500/10 to-cyan-500/10",
              delay: "delay-500",
            },
            {
              icon: Zap,
              label: "Lightning Fast",
              color: "from-yellow-400 via-orange-500 to-red-500",
              bgColor: "from-yellow-500/10 to-red-500/10",
              delay: "delay-700",
            },
            {
              icon: Sparkles,
              label: "Intelligent",
              color: "from-violet-400 via-purple-500 to-pink-500",
              bgColor: "from-violet-500/10 to-pink-500/10",
              delay: "delay-1000",
            },
            {
              icon: ShieldCheck,
              label: "Private & Secure",
              color: "from-blue-400 via-indigo-500 to-purple-500",
              bgColor: "from-blue-500/10 to-purple-500/10",
              delay: "delay-1200",
            },
            {
              icon: ImageIcon,
              label: "Image Generation",
              color: "from-pink-400 via-rose-500 to-red-500",
              bgColor: "from-pink-500/10 to-red-500/10",
              delay: "delay-1400",
            },
            {
              icon: Globe,
              label: "Multi-Provider",
              color: "from-emerald-400 via-teal-500 to-cyan-500",
              bgColor: "from-emerald-500/10 to-cyan-500/10",
              delay: "delay-1600",
            },
          ].map(({ icon: Icon, label, color, bgColor, delay }) => (
            <div
              key={label}
              className={`group relative flex items-center space-x-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-4 py-2 rounded-2xl border-2 border-white/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover-lift animate-fade-in ${delay} overflow-hidden`}
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div
                className={`relative z-10 p-1.5 rounded-lg bg-gradient-to-r ${color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
              >
                <Icon className="h-3 w-3 text-white" />
              </div>
              <span className="relative z-10 text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-300">
                {label}
              </span>

              {/* Sparkle effect on hover */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-2 h-2 text-yellow-400 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* Ultra-colorful CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-700 px-4 mb-12">
          <Button
            size="lg"
            onClick={() => navigate("/chat")}
            className="relative bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:from-cyan-600 hover:via-violet-600 hover:to-pink-600 text-white px-10 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <MessageCircle className="mr-2 h-5 w-5 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Start Chatting Now</span>
            <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 relative z-10" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth")}
            className="relative text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 px-10 py-4 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 group backdrop-blur-xl shadow-lg hover:shadow-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
          </Button>
        </div>
        {/* Professional trust indicators */}
        <div className="animate-fade-in delay-1000 px-4">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 dark:border-slate-700/50 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400 via-violet-400 to-pink-400 animate-gradient-move"></div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  value: "10K+",
                  label: "Active Users",
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  icon: ShieldCheck,
                  value: "99.9%",
                  label: "Uptime",
                  gradient: "from-violet-500 to-purple-500",
                },
                {
                  icon: Globe,
                  value: "24/7",
                  label: "Support",
                  gradient: "from-cyan-500 to-blue-500",
                },
              ].map(({ icon: Icon, value, label, gradient }) => (
                <div
                  key={label}
                  className="flex flex-col items-center space-y-4 group"
                >
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}
                  >
                    {value}
                  </div>
                  <span className="text-lg font-semibold text-slate-600 dark:text-slate-300 text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
