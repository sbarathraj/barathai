import React from "react";
import { Brain, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";

interface ProfessionalTypingIndicatorProps {
  variant?: "default" | "thinking" | "generating" | "processing";
  message?: string;
  showAvatar?: boolean;
}

export const ProfessionalTypingIndicator: React.FC<
  ProfessionalTypingIndicatorProps
> = ({ variant = "default", message, showAvatar = true }) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "thinking":
        return {
          icon: Brain,
          text: message || "Thinking deeply...",
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "generating":
        return {
          icon: Sparkles,
          text: message || "Generating response...",
          color: "text-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        };
      case "processing":
        return {
          icon: Zap,
          text: message || "Processing your request...",
          color: "text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      default:
        return {
          icon: null,
          text: message || "BarathAI is typing...",
          color: "text-slate-500",
          bgColor: "bg-slate-50 dark:bg-slate-800/50",
          borderColor: "border-slate-200 dark:border-slate-700",
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div className="flex justify-start mb-6 animate-fade-in">
      <div className="max-w-[85%]">
        {showAvatar && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold mr-3 shadow-lg">
              <Logo size={20} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              BarathAI
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border transition-all duration-200 ${config.bgColor} ${config.borderColor}`}
        >
          <div className="flex items-center space-x-3">
            {/* Animated dots */}
            <div className="flex items-center space-x-1">
              <span
                className={`block w-2 h-2 rounded-full animate-bounce ${config.color.replace("text-", "bg-")}`}
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className={`block w-2 h-2 rounded-full animate-bounce ${config.color.replace("text-", "bg-")}`}
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className={`block w-2 h-2 rounded-full animate-bounce ${config.color.replace("text-", "bg-")}`}
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>

            {/* Status text with icon */}
            <div className="flex items-center space-x-2">
              {IconComponent && (
                <IconComponent
                  className={`w-4 h-4 ${config.color} animate-pulse`}
                />
              )}
              <span
                className={`text-sm font-medium ${config.color} animate-pulse`}
              >
                {config.text}
              </span>
            </div>
          </div>

          {/* Progress bar for certain variants */}
          {(variant === "generating" || variant === "processing") && (
            <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
              <div
                className={`h-1 rounded-full animate-pulse ${config.color.replace("text-", "bg-")} opacity-60`}
                style={{
                  width: "60%",
                  animation: "progress 2s ease-in-out infinite",
                }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 20%; opacity: 0.4; }
          50% { width: 80%; opacity: 0.8; }
          100% { width: 20%; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
