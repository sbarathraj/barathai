import React, { useState } from "react";
import { Download, FileText, Image, Share2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/types/message";

interface ChatExportProps {
  messages: Message[];
  sessionTitle: string;
  onExport?: (format: string, options: ExportOptions) => void;
}

interface ExportOptions {
  includeTimestamps: boolean;
  includeImages: boolean;
  includeReasoning: boolean;
  includeMetadata: boolean;
  format: "txt" | "md" | "json" | "pdf" | "html";
}

export const ChatExport: React.FC<ChatExportProps> = ({
  messages,
  sessionTitle,
  onExport,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamps: true,
    includeImages: false,
    includeReasoning: false,
    includeMetadata: false,
    format: "txt",
  });

  const formatMessage = (message: Message, options: ExportOptions): string => {
    let formatted = "";

    if (options.includeTimestamps) {
      formatted += `[${message.timestamp.toLocaleString()}] `;
    }

    formatted += `${message.role === "user" ? "You" : "BarathAI"}: `;
    formatted += message.content;

    if (options.includeImages && message.image) {
      formatted += `\n[Image: ${message.image}]`;
    }

    if (options.includeReasoning && message.reasoning) {
      formatted += `\n[Reasoning: ${message.reasoning.reasoning || "Available"}]`;
    }

    if (options.includeMetadata && (message.model || message.usage)) {
      formatted += `\n[Metadata: Model: ${message.model || "N/A"}, Tokens: ${message.usage?.total_tokens || "N/A"}]`;
    }

    return formatted;
  };

  const exportAsText = (): string => {
    const header = `Chat Export: ${sessionTitle}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    const content = messages
      .map((msg) => formatMessage(msg, options))
      .join("\n\n");
    return header + content;
  };

  const exportAsMarkdown = (): string => {
    const header = `# Chat Export: ${sessionTitle}\n\n**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
    const content = messages
      .map((msg) => {
        let md = `## ${msg.role === "user" ? "You" : "BarathAI"}`;
        if (options.includeTimestamps) {
          md += ` *(${msg.timestamp.toLocaleString()})*`;
        }
        md += "\n\n" + msg.content;

        if (options.includeImages && msg.image) {
          md += `\n\n![Generated Image](${msg.image})`;
        }

        return md;
      })
      .join("\n\n---\n\n");
    return header + content;
  };

  const exportAsJSON = (): string => {
    const exportData = {
      sessionTitle,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        ...(options.includeImages && msg.image && { image: msg.image }),
        ...(options.includeReasoning &&
          msg.reasoning && { reasoning: msg.reasoning }),
        ...(options.includeMetadata && { model: msg.model, usage: msg.usage }),
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      let content = "";
      let filename = "";
      let mimeType = "";

      const sanitizedTitle = sessionTitle
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const timestamp = new Date().toISOString().split("T")[0];

      switch (options.format) {
        case "txt":
          content = exportAsText();
          filename = `chat_${sanitizedTitle}_${timestamp}.txt`;
          mimeType = "text/plain";
          break;
        case "md":
          content = exportAsMarkdown();
          filename = `chat_${sanitizedTitle}_${timestamp}.md`;
          mimeType = "text/markdown";
          break;
        case "json":
          content = exportAsJSON();
          filename = `chat_${sanitizedTitle}_${timestamp}.json`;
          mimeType = "application/json";
          break;
        default:
          throw new Error("Unsupported format");
      }

      downloadFile(content, filename, mimeType);

      if (onExport) {
        onExport(options.format, options);
      }

      toast({
        title: "Export successful",
        description: `Chat exported as ${filename}`,
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export chat",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Chat</DialogTitle>
          <DialogDescription>
            Export your conversation in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select
              value={options.format}
              onValueChange={(value: "txt" | "md" | "json") =>
                setOptions((prev) => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Plain Text (.txt)
                  </div>
                </SelectItem>
                <SelectItem value="md">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Markdown (.md)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    JSON (.json)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Include</label>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timestamps"
                  checked={options.includeTimestamps}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeTimestamps: !!checked,
                    }))
                  }
                />
                <label htmlFor="timestamps" className="text-sm">
                  Timestamps
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="images"
                  checked={options.includeImages}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeImages: !!checked,
                    }))
                  }
                />
                <label htmlFor="images" className="text-sm">
                  Image references
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reasoning"
                  checked={options.includeReasoning}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeReasoning: !!checked,
                    }))
                  }
                />
                <label htmlFor="reasoning" className="text-sm">
                  AI reasoning
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeMetadata: !!checked,
                    }))
                  }
                />
                <label htmlFor="metadata" className="text-sm">
                  Technical metadata
                </label>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || messages.length === 0}
            className="w-full"
          >
            {isExporting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </div>
            ) : (
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Chat
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
