import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Heart, Smile, Frown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Reaction {
  type: "like" | "dislike" | "love" | "happy" | "sad" | "star";
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onReact: (messageId: string, reactionType: string) => void;
  compact?: boolean;
}

const reactionConfig = {
  like: { icon: ThumbsUp, label: "Like", color: "text-green-500" },
  dislike: { icon: ThumbsDown, label: "Dislike", color: "text-red-500" },
  love: { icon: Heart, label: "Love", color: "text-pink-500" },
  happy: { icon: Smile, label: "Happy", color: "text-yellow-500" },
  sad: { icon: Frown, label: "Sad", color: "text-blue-500" },
  star: { icon: Star, label: "Star", color: "text-amber-500" },
};

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  onReact,
  compact = false,
}) => {
  const [showAllReactions, setShowAllReactions] = useState(false);

  const handleReaction = (reactionType: string) => {
    onReact(messageId, reactionType);
  };

  const getReactionButton = (
    type: keyof typeof reactionConfig,
    reaction?: Reaction,
  ) => {
    const config = reactionConfig[type];
    const IconComponent = config.icon;
    const isActive = reaction?.userReacted || false;
    const count = reaction?.count || 0;

    return (
      <TooltipProvider key={type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={compact ? "sm" : "icon"}
              onClick={() => handleReaction(type)}
              className={`h-8 px-2 transition-all duration-200 ${
                isActive
                  ? `${config.color} bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600`
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <IconComponent size={14} />
              {count > 0 && (
                <span className="ml-1 text-xs font-medium">{count}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Show only primary reactions by default, all when expanded
  const primaryReactions: (keyof typeof reactionConfig)[] = ["like", "dislike"];
  const allReactions: (keyof typeof reactionConfig)[] = [
    "like",
    "dislike",
    "love",
    "happy",
    "sad",
    "star",
  ];

  const reactionsToShow = showAllReactions ? allReactions : primaryReactions;
  const reactionMap = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = reaction;
      return acc;
    },
    {} as Record<string, Reaction>,
  );

  // Check if there are any non-primary reactions with counts
  const hasSecondaryReactions = reactions.some(
    (r) => !primaryReactions.includes(r.type) && r.count > 0,
  );

  return (
    <div className="flex items-center space-x-1 flex-wrap">
      {reactionsToShow.map((type) =>
        getReactionButton(type, reactionMap[type]),
      )}

      {/* Show more/less button */}
      {(hasSecondaryReactions || showAllReactions) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllReactions(!showAllReactions)}
          className="h-8 px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {showAllReactions ? "Less" : "More"}
        </Button>
      )}
    </div>
  );
};
