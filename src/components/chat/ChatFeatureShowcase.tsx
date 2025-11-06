import React, { useState } from "react";
import {
  Search,
  Download,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ChatFeatureShowcase: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Search,
      title: "Advanced Search",
      description:
        "Search through your entire conversation history with smart filters",
      demo: "Try searching for specific topics, filter by date, or find messages with images",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: ThumbsUp,
      title: "Message Reactions",
      description:
        "React to AI responses with likes, dislikes, and more emotions",
      demo: "Hover over any AI message to see reaction options",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Download,
      title: "Professional Export",
      description:
        "Export your conversations in multiple formats with custom options",
      demo: "Choose from text, markdown, or JSON formats with metadata",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Sparkles,
      title: "Smart Typing Indicators",
      description:
        "See exactly what BarathAI is doing with context-aware status",
      demo: "Watch for thinking, processing, and generating states",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      icon: MessageSquare,
      title: "Enhanced Messages",
      description:
        "Rich message display with metadata, actions, and accessibility",
      demo: "See token usage, model info, and quick actions on every message",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      icon: Zap,
      title: "Professional UI",
      description:
        "Consistent, accessible design with dark mode and responsive layout",
      demo: "Enjoy smooth animations, proper contrast, and mobile optimization",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const feature = features[currentFeature];
  const IconComponent = feature.icon;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Features
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>Professional Chat Features</span>
          </DialogTitle>
          <DialogDescription>
            Discover the enhanced capabilities of BarathAI Chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Display */}
          <div
            className={`rounded-lg p-6 ${feature.bgColor} border border-slate-200 dark:border-slate-700`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}
              >
                <IconComponent className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 rounded-md p-3 border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Try it:</strong> {feature.demo}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevFeature}
              disabled={currentFeature === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFeature
                      ? "bg-blue-500"
                      : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextFeature}
              disabled={currentFeature === features.length - 1}
            >
              Next
            </Button>
          </div>

          {/* Feature Count */}
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {currentFeature + 1} of {features.length} features
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
