import React, { useState, useEffect } from "react";
import { Search, X, Filter, Calendar, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFilters {
  role?: "user" | "assistant" | "all";
  dateRange?: "today" | "week" | "month" | "all";
  hasImage?: boolean;
  hasReasoning?: boolean;
}

interface ChatSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  isSearching?: boolean;
  resultCount?: number;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  onSearch,
  onClear,
  isSearching = false,
  resultCount = 0,
}) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    role: "all",
    dateRange: "all",
    hasImage: false,
    hasReasoning: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (
        query.trim() ||
        Object.values(filters).some((v) => v !== "all" && v !== false)
      ) {
        onSearch(query, filters);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters, onSearch]);

  const handleClear = () => {
    setQuery("");
    setFilters({
      role: "all",
      dateRange: "all",
      hasImage: false,
      hasReasoning: false,
    });
    onClear();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((v) => v !== "all" && v !== false)
      .length;
  };

  const hasActiveSearch = query.trim() || getActiveFiltersCount() > 0;

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={16}
          />
          <Input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Filter Toggle */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 relative ${
                    getActiveFiltersCount() > 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="Search filters"
                >
                  <Filter size={14} />
                  {getActiveFiltersCount() > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-blue-600 text-white"
                    >
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Search Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          role: "all",
                          dateRange: "all",
                          hasImage: false,
                          hasReasoning: false,
                        })
                      }
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  </div>

                  {/* Role Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <User size={12} className="mr-1" />
                      Message Type
                    </label>
                    <Select
                      value={filters.role}
                      onValueChange={(value: "user" | "assistant" | "all") =>
                        setFilters((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All messages</SelectItem>
                        <SelectItem value="user">My messages</SelectItem>
                        <SelectItem value="assistant">AI responses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Time Period
                    </label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(
                        value: "today" | "week" | "month" | "all",
                      ) =>
                        setFilters((prev) => ({ ...prev, dateRange: value }))
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Type Filters */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <MessageSquare size={12} className="mr-1" />
                      Content Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.hasImage}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              hasImage: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Has images</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.hasReasoning}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              hasReasoning: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Has reasoning</span>
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Button */}
            {hasActiveSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-7 w-7 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Search Status */}
        {hasActiveSearch && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <span>
                  {resultCount > 0
                    ? `Found ${resultCount} message${resultCount === 1 ? "" : "s"}`
                    : "No messages found"}
                </span>
              )}
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex items-center space-x-1">
                <span>Filters:</span>
                {filters.role !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.role === "user" ? "My messages" : "AI responses"}
                  </Badge>
                )}
                {filters.dateRange !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.dateRange}
                  </Badge>
                )}
                {filters.hasImage && (
                  <Badge variant="secondary" className="text-xs">
                    Images
                  </Badge>
                )}
                {filters.hasReasoning && (
                  <Badge variant="secondary" className="text-xs">
                    Reasoning
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
