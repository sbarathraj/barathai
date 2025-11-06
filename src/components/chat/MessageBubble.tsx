import React, { useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { TextToSpeech } from "@/components/TextToSpeech";
import {
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Share2,
  Bookmark,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    image?: string;
    reasoning?: unknown;
    model?: string;
    usage?: { total_tokens?: number };
  };
  isUser: boolean;
  onReaction?: (messageId: string, reaction: "like" | "dislike") => void;
  onBookmark?: (messageId: string) => void;
  onShare?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  onReaction,
  onBookmark,
  onShare,
  onReport,
}) => {
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleReaction = (reactionType: "like" | "dislike") => {
    const newReaction = reaction === reactionType ? null : reactionType;
    setReaction(newReaction);
    if (onReaction && newReaction) {
      onReaction(message.id, newReaction);
    }
    toast({
      title: newReaction ? "Reaction added" : "Reaction removed",
      description: newReaction
        ? `You ${newReaction}d this message`
        : "Reaction removed",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BarathAI Chat Message",
          text: message.content,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying link
      await copyToClipboard(`${window.location.href}#message-${message.id}`);
      toast({
        title: "Link copied",
        description: "Message link copied to clipboard",
      });
    }
    if (onShare) onShare(message.id);
  };

  const handleBookmark = () => {
    if (onBookmark) onBookmark(message.id);
    toast({
      title: "Bookmarked",
      description: "Message saved to bookmarks",
    });
  };

  const handleReport = () => {
    if (onReport) onReport(message.id);
    toast({
      title: "Reported",
      description: "Message has been reported for review",
    });
  };

  // Enhanced image detection and extraction
  const extractImageInfo = (content: string) => {
    // Look for markdown image format: ![alt](data:image/...)
    const imageRegex = /!\[([^\]]*)\]\((data:image\/[^)]+)\)/;
    const match = content.match(imageRegex);

    if (match) {
      return {
        imageUrl: match[2],
        altText: match[1],
        hasImage: true,
      };
    }

    // Also check for direct base64 image URLs in content
    const base64Regex = /(data:image\/[^;\s]+;base64,[A-Za-z0-9+/=]+)/;
    const base64Match = content.match(base64Regex);

    if (base64Match) {
      return {
        imageUrl: base64Match[1],
        altText: "Generated Image",
        hasImage: true,
      };
    }

    return { hasImage: false, imageUrl: null, altText: null };
  };

  const downloadImage = (imageUrl: string) => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `barathai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Downloaded!",
        description: "Image saved to your downloads",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const imageInfo = extractImageInfo(message.content);
  const isImageMessage = imageInfo.hasImage;

  // Extract text content without the image markdown
  const getTextContent = (content: string) => {
    if (!imageInfo.hasImage) return content;

    // Remove the image markdown and clean up the remaining text
    const textContent = content
      .replace(/!\[([^\]]*)\]\((data:image\/[^)]+)\)/, "") // Remove image markdown
      .replace(/^\s*\n+/, "") // Remove leading newlines
      .replace(/\n+\s*$/, "") // Remove trailing newlines
      .trim();

    return textContent;
  };

  const textContent = getTextContent(message.content);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 sm:mb-6 animate-fade-in group px-2 sm:px-0`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      id={`message-${message.id}`}
    >
      <div className={`max-w-[95%] sm:max-w-[85%] ${isUser ? "order-2" : "order-1"} relative`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold mr-3 shadow-lg">
              AI
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                BarathAI
              </span>
              {message.model && (
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
                  {message.model.split("/").pop()}
                </span>
              )}
            </div>
          </div>
        )}

        <div
          className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg backdrop-blur-sm border transition-all duration-200 hover:shadow-xl relative ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300 dark:border-blue-600"
              : "bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
          }`}
        >
          {/* Display image if present */}
          {isImageMessage && imageInfo.imageUrl && (
            <div className="mb-3">
              <div className="relative group">
                <img
                  src={imageInfo.imageUrl}
                  alt={imageInfo.altText || "Generated by BarathAI"}
                  className="w-full max-w-md rounded-lg shadow-md border border-slate-200 dark:border-slate-600"
                  onError={(e) => {
                    console.error("Image failed to load:", imageInfo.imageUrl);
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";

                    // Create fallback element
                    const fallback = document.createElement("div");
                    fallback.className =
                      "bg-slate-100 dark:bg-slate-700 rounded-lg p-6 text-center text-slate-500 border border-slate-200 dark:border-slate-600";
                    fallback.innerHTML = `
                      <div class="flex flex-col items-center space-y-2">
                        <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>[IMAGE] Generated image failed to load</span>
                      </div>
                    `;
                    target.parentNode?.appendChild(fallback);
                  }}
                  onLoad={() => {
                    console.log(
                      "Image loaded successfully:",
                      imageInfo.imageUrl?.substring(0, 50) + "...",
                    );
                  }}
                />

                {/* Download button overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    onClick={() => downloadImage(imageInfo.imageUrl!)}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Display text content if present */}
          {textContent && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownRenderer content={textContent} />
            </div>
          )}

          {/* Show fallback if no image and no text */}
          {!isImageMessage && !textContent && (
            <div className="text-slate-500 dark:text-slate-400 italic">
              [Empty message]
            </div>
          )}

          <div
            className={`flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t ${
              isUser
                ? "border-white/20"
                : "border-slate-200 dark:border-slate-600"
            }`}
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span
                className={`text-xs ${
                  isUser
                    ? "text-white/70"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {message.usage && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isUser
                      ? "bg-white/20 text-white/70"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {message.usage.total_tokens} tokens
                </span>
              )}
            </div>
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {!isUser && (
                <>
                  {/* Reaction buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReaction("like")}
                    className={`h-6 w-6 transition-colors ${
                      reaction === "like"
                        ? "text-green-500 hover:text-green-600"
                        : "text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                    title="Like this response"
                  >
                    <ThumbsUp size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReaction("dislike")}
                    className={`h-6 w-6 transition-colors ${
                      reaction === "dislike"
                        ? "text-red-500 hover:text-red-600"
                        : "text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                    title="Dislike this response"
                  >
                    <ThumbsDown size={12} />
                  </Button>
                </>
              )}

              {!isUser && (
                <TextToSpeech
                  text={
                    isImageMessage
                      ? "Generated image"
                      : textContent || message.content
                  }
                  className={isUser ? "text-white/70 hover:text-white" : ""}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard(
                    isImageMessage ? imageInfo.imageUrl! : message.content,
                  )
                }
                className={`h-6 w-6 transition-colors ${
                  isUser
                    ? "text-white/70 hover:text-white hover:bg-white/20"
                    : "text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                title="Copy content"
              >
                <Copy size={14} />
              </Button>

              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 transition-colors ${
                      isUser
                        ? "text-white/70 hover:text-white hover:bg-white/20"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    } ${showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    title="More actions"
                  >
                    <MoreHorizontal size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBookmark}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmark
                  </DropdownMenuItem>
                  {isImageMessage && imageInfo.imageUrl && (
                    <DropdownMenuItem
                      onClick={() => downloadImage(imageInfo.imageUrl!)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download image
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleReport}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Report message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
