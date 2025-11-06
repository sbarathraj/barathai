import React, { useState } from "react";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReasoningDetail {
  text: string;
  type: string;
  index: number;
  format?: string;
}

interface ReasoningDisplayProps {
  reasoning?: string;
  reasoningDetails?: ReasoningDetail[];
  className?: string;
}

export const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  reasoning,
  reasoningDetails,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no reasoning data
  if (!reasoning && (!reasoningDetails || reasoningDetails.length === 0)) {
    return null;
  }

  return (
    <Card
      className={`mb-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent ${className}`}
    >
      <CardContent className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-2 h-auto hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                🧠 AI Reasoning
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Main reasoning text */}
            {reasoning && (
              <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Brain className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Primary Reasoning:
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                This reasoning process shows how BarathAI analyzed your request
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
