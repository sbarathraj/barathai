// Updated: Fixed overflow and provider grouping - v2.0
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Search, Sparkles, Check, ChevronDown } from "lucide-react";
import { AI_MODELS, MODEL_PROVIDERS, type AIModel } from "@/types/models";
import { cn } from "@/lib/utils.ts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  className,
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("All");

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  // Filter models based on search and provider
  const filteredModels = useMemo(() => {
    return AI_MODELS.filter((model) => {
      const matchesSearch =
        searchQuery === "" ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProvider =
        selectedProvider === "All" || model.provider === selectedProvider;

      return matchesSearch && matchesProvider;
    });
  }, [searchQuery, selectedProvider]);

  // Group models by provider
  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, AIModel[]> = {};

    filteredModels.forEach((model) => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });

    // Sort providers based on MODEL_PROVIDERS order
    return Object.keys(grouped)
      .sort((a, b) => {
        const indexA = MODEL_PROVIDERS.indexOf(a as any);
        const indexB = MODEL_PROVIDERS.indexOf(b as any);
        // Handle cases where provider might not be in the list (fallback to alphabetical)
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .reduce(
        (acc, key) => {
          acc[key] = grouped[key];
          return acc;
        },
        {} as Record<string, AIModel[]>,
      );
  }, [filteredModels]);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setOpen(false);
  };

  // MOBILE VIEW
  if (isMobile) {
    return (
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger
          className={cn(
            "h-9 min-w-[140px] max-w-[200px]",
            "border-2 border-purple-200 dark:border-purple-800",
            "bg-gradient-to-r from-purple-50 to-blue-50",
            "dark:from-purple-950/30 dark:to-blue-950/30",
            "hover:border-purple-300 dark:hover:border-purple-700",
            "hover:shadow-md",
            "focus:ring-2 focus:ring-purple-500",
            "transition-all duration-200",
            className,
          )}
        >
          <div className="flex items-center gap-1.5 w-full overflow-hidden">
            <Brain className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="text-xs font-bold truncate flex-1 text-left">
              {currentModel?.name || "Select Model"}
            </span>
            <Badge className="bg-green-500 text-white text-[9px] px-1.5 h-4 flex-shrink-0 border-0 shadow-sm">
              FREE
            </Badge>
          </div>
        </SelectTrigger>

        <SelectContent className="max-h-[70vh] w-[min(90vw,360px)] border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
          {/* Professional Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 z-20 p-4 border-b-2 border-purple-200 dark:border-purple-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Choose AI Model</p>
                <p className="text-[10px] text-muted-foreground">
                  {AI_MODELS.length} free models by provider
                </p>
              </div>
            </div>
          </div>

          {/* Models grouped by Provider */}
          <div className="py-2">
            {Object.keys(modelsByProvider).length === 0 ? (
              <div className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No models found
                </p>
              </div>
            ) : (
              Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider} className="mb-3">
                  {/* Provider Header - Professional */}
                  <div className="sticky top-[73px] bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 px-4 py-2 border-y-2 border-purple-200 dark:border-purple-800 z-10 shadow-sm">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-purple-900 dark:text-purple-100">
                        {provider}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-purple-300 dark:border-purple-700"
                      >
                        {models.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Provider Models - Professional Cards */}
                  {models.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="py-3 px-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs truncate mb-1">
                            {model.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-green-500 text-white text-[9px] px-1.5 py-0 border-0">
                              FREE
                            </Badge>
                            <span className="text-[9px] text-muted-foreground">
                              {model.category}
                            </span>
                          </div>
                        </div>
                        {model.id === selectedModel && (
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Professional Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-3 border-t-2 border-purple-200 dark:border-purple-800 shadow-md">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                All models are free
              </span>
            </div>
          </div>
        </SelectContent>
      </Select>
    );
  }

  // DESKTOP VIEW
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-3 gap-2",
            "bg-gradient-to-r from-purple-50 to-blue-50",
            "dark:from-purple-950/30 dark:to-blue-950/30",
            "border border-purple-200 dark:border-purple-800",
            "hover:border-purple-300 dark:hover:border-purple-700",
            "hover:shadow-md",
            "transition-all duration-200",
            className,
          )}
        >
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span className="text-sm font-semibold truncate max-w-[160px]">
            {currentModel?.name || "Select Model"}
          </span>
          <Badge className="ml-auto bg-green-500 text-white text-[10px] px-2 border-0">
            FREE
          </Badge>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold">
                Choose AI Model
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select from {AI_MODELS.length} free AI models grouped by
                provider
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models by name or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger className="w-[200px] h-10">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_PROVIDERS.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                    {provider !== "All" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (
                        {
                          AI_MODELS.filter((m) => m.provider === provider)
                            .length
                        }
                        )
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Models by Provider */}
          <ScrollArea className="h-[450px] pr-4">
            {Object.keys(modelsByProvider).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Brain className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">
                  No models found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(modelsByProvider).map(([provider, models]) => (
                  <div key={provider} className="overflow-hidden">
                    {/* Provider Header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-200 dark:border-purple-800">
                      <h3 className="text-base font-bold text-purple-900 dark:text-purple-100">
                        {provider}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold"
                      >
                        {models.length}{" "}
                        {models.length === 1 ? "model" : "models"}
                      </Badge>
                    </div>

                    {/* Provider Models Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                      {models.map((model) => (
                        <div key={model.id} className="min-w-0">
                          <ModelCard
                            model={model}
                            isSelected={model.id === selectedModel}
                            onSelect={() => handleModelSelect(model.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredModels.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {AI_MODELS.length}
              </span>{" "}
              models
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                All models are free
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Model Card Component - FIXED OVERFLOW ISSUE
interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  onSelect: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected,
  onSelect,
}) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      reasoning: "bg-purple-500",
      general: "bg-blue-500",
      coding: "bg-green-500",
      vision: "bg-orange-500",
      small: "bg-yellow-500",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      reasoning:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      general:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      coding:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      vision:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      small:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    };
    return badges[category as keyof typeof badges] || badges.general;
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        "active:translate-y-0",
        "overflow-hidden", // FIXED: Prevent content overflow
        isSelected
          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-md"
          : "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700",
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Category Color Bar */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-1 rounded-t-lg",
          getCategoryColor(model.category),
        )}
      />

      <div className="space-y-2.5 pt-1 w-full min-w-0">
        {/* Model Name - Truncated to prevent overflow */}
        <div className="w-full pr-6 min-w-0">
          <h3 className="font-bold text-sm leading-tight truncate">
            {model.name}
          </h3>
        </div>

        {/* Badges - Wrapped properly */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <Badge
            className={cn(
              "text-[10px] px-1.5 py-0 shrink-0",
              getCategoryBadge(model.category),
            )}
          >
            {model.category}
          </Badge>
          <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0 border-0 shrink-0">
            FREE
          </Badge>
        </div>

        {/* Description - Line clamped */}
        {model.description && (
          <div className="w-full min-w-0">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
              {model.description}
            </p>
          </div>
        )}
      </div>
    </button>
  );
};
