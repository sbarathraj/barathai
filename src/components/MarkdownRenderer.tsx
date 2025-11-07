import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";
import atomOneLight from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Play,
  Terminal,
  Code,
  FileText,
  Lightbulb,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode unless user has chosen dark
    return document.documentElement.classList.contains("dark");
  });

  // Listen for theme changes
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Enhanced preprocessing to handle API response patterns
  const preprocessContent = (text: string) => {
    let processedText = text;

    // Handle escaped newlines from API responses
    processedText = processedText.replace(/\\n/g, "\n");

    // FIX: Format numbered sections so the entire heading (number + title) is bold
    // Pattern: "2. **Title text**" -> "**2. Title text**"
    processedText = processedText.replace(
      /^(\d+)\.\s+\*\*(.+?)\*\*/gm,
      "**$1. $2**",
    );

    // FIX: Format bullet points so the entire item (bullet + text) is bold
    // Pattern: "- **Text**" -> "**- Text**"
    // Pattern: "* **Text**" -> "*** Text**"
    processedText = processedText.replace(
      /^([-*])\s+\*\*(.+?)\*\*/gm,
      "**$1 $2**",
    );

    // CRITICAL: Handle ALL single quote patterns BEFORE any other processing
    // This ensures single quotes NEVER trigger code block styling

    // 1. Handle backtick-wrapped single quotes: `'text'` -> plain text
    processedText = processedText.replace(
      /`'([^']*)'`/g,
      "___SINGLEQUOTE_START___$1___SINGLEQUOTE_END___",
    );

    // 2. Handle standalone single quotes in various contexts
    // - At start of line: 'text'
    // - After whitespace: (space)'text'
    // - After punctuation: ,'text' or .'text' or ('text'
    // - In lists: - 'text' or * 'text'
    processedText = processedText.replace(
      /(^|\s|[,.()[\]!?;:])'([^']*?)'/gm,
      "$1___SINGLEQUOTE_START___$2___SINGLEQUOTE_END___",
    );

    // 3. Handle single quotes in parentheses or brackets
    processedText = processedText.replace(
      /([(])'([^']*?)'([)])/g,
      "$1___SINGLEQUOTE_START___$2___SINGLEQUOTE_END___$3",
    );
    processedText = processedText.replace(
      /([[])'([^']*?)'([\]])/g,
      "$1___SINGLEQUOTE_START___$2___SINGLEQUOTE_END___$3",
    );

    // 4. Handle single quotes with surrounding text (e.g., "methods ('size', 'contains')")
    processedText = processedText.replace(
      /'([^']*?)'/g,
      "___SINGLEQUOTE_START___$1___SINGLEQUOTE_END___",
    );

    // Handle custom tags with various cases
    const customTagPatterns = [
      { pattern: /<BOLDTAG>(.*?)<\/BOLDTAG>/gs, replacement: "**$1**" },
      { pattern: /<ITALICTAG>(.*?)<\/ITALICTAG>/gs, replacement: "*$1*" },
      {
        pattern: /<INLINECODETAG>(.*?)<\/INLINECODETAG>/gs,
        replacement: "`$1`",
      },
      { pattern: /<CODETAG>(.*?)<\/CODETAG>/gs, replacement: "`$1`" },
      { pattern: /<BOLD>(.*?)<\/BOLD>/gs, replacement: "**$1**" },
      { pattern: /<ITALIC>(.*?)<\/ITALIC>/gs, replacement: "*$1*" },
      { pattern: /<INLINECODE>(.*?)<\/INLINECODE>/gs, replacement: "`$1`" },
      { pattern: /<CODE>(.*?)<\/CODE>/gs, replacement: "`$1`" },

      // Handle nested and malformed tags
      {
        pattern: /<INLINE<ITALIC>CODE>(.*?)<\/INLINE<\/ITALIC>CODE>/gs,
        replacement: "`$1`",
      },
      { pattern: /<boldtag>(.*?)<\/boldtag>/gs, replacement: "**$1**" },
      { pattern: /<italictag>(.*?)<\/italictag>/gs, replacement: "*$1*" },
      {
        pattern: /<inlinecodetag>(.*?)<\/inlinecodetag>/gs,
        replacement: "`$1`",
      },
      { pattern: /<codetag>(.*?)<\/codetag>/gs, replacement: "`$1`" },

      // Handle various case combinations
      { pattern: /<BoldTag>(.*?)<\/BoldTag>/gs, replacement: "**$1**" },
      { pattern: /<ItalicTag>(.*?)<\/ItalicTag>/gs, replacement: "*$1*" },
      {
        pattern: /<InlineCodeTag>(.*?)<\/InlineCodeTag>/gs,
        replacement: "`$1`",
      },
      { pattern: /<CodeTag>(.*?)<\/CodeTag>/gs, replacement: "`$1`" },

      // Handle attributes in tags
      { pattern: /<BOLD[^>]*>(.*?)<\/BOLD[^>]*>/gs, replacement: "**$1**" },
      { pattern: /<ITALIC[^>]*>(.*?)<\/ITALIC[^>]*>/gs, replacement: "*$1*" },
      { pattern: /<CODE[^>]*>(.*?)<\/CODE[^>]*>/gs, replacement: "`$1`" },
    ];

    customTagPatterns.forEach(({ pattern, replacement }) => {
      processedText = processedText.replace(pattern, replacement);
    });

    // Enhance instructional sections with icons
    processedText = processedText.replace(
      /^(How to Run|Output|Example|Note|Important|Steps|Instructions?):\s*$/gm,
      "### 💡 $1\n",
    );

    // Add visual separators between major sections
    processedText = processedText.replace(/^(#{1,3}\s+.*?)$/gm, "\n---\n\n$1");

    return processedText;
  };

  let codeBlockIndex = 0;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Universal function to process single quote markers in any text content
  const processSingleQuoteMarkers = (
    children: React.ReactNode,
  ): React.ReactNode => {
    if (typeof children === "string") {
      // Replace single quote markers with styled spans
      const parts = children.split(
        /___SINGLEQUOTE_START___(.*?)___SINGLEQUOTE_END___/g,
      );
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is content that was inside single quotes - render as plain text
          return (
            <span
              key={index}
              className="text-inherit font-inherit text-[1em] align-baseline"
            >
              '{part}'
            </span>
          );
        }
        return part;
      });
    }
    if (Array.isArray(children)) {
      return children.map((child, index) =>
        typeof child === "string" ? processSingleQuoteMarkers(child) : child,
      );
    }
    return children;
  };

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      java: "☕",
      javascript: "🟨",
      typescript: "🔷",
      python: "🐍",
      cpp: "⚡",
      c: "🔧",
      html: "🌐",
      css: "🎨",
      sql: "🗃️",
      bash: "💻",
      shell: "💻",
      json: "📋",
      xml: "📄",
      yaml: "⚙️",
    };
    return icons[language.toLowerCase()] || "📝";
  };

  const getLanguageDisplayName = (language: string) => {
    const names: { [key: string]: string } = {
      java: "Java",
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      cpp: "C++",
      c: "C",
      html: "HTML",
      css: "CSS",
      sql: "SQL",
      bash: "Bash",
      shell: "Shell",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
    };
    return names[language.toLowerCase()] || language.toUpperCase();
  };

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced heading rendering with better styling and icons
          h1: ({ node, ...props }) => (
            <div className="mb-2 mt-2">
              <h1
                className="text-3xl font-bold text-slate-900 dark:text-white border-b-2 border-gradient-to-r from-blue-500 to-purple-500 pb-1 mb-2 flex items-center"
                {...props}
              >
                <span className="mr-3 text-blue-500">🚀</span>
                {processSingleQuoteMarkers(props.children)}
              </h1>
            </div>
          ),
          h2: ({ node, ...props }) => (
            <div className="mb-2 mt-2">
              <h2
                className="text-2xl font-semibold text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-1 mb-2 flex items-center"
                {...props}
              >
                <span className="mr-2 text-purple-500">📋</span>
                {processSingleQuoteMarkers(props.children)}
              </h2>
            </div>
          ),
          h3: ({ node, ...props }) => (
            <div className="mb-2 mt-2">
              <h3
                className="text-xl font-semibold text-slate-900 dark:text-white flex items-center mb-1"
                {...props}
              >
                <span className="mr-2 text-green-500">✨</span>
                {processSingleQuoteMarkers(props.children)}
              </h3>
            </div>
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-semibold text-slate-900 dark:text-white mt-1 mb-1 flex items-center"
              {...props}
            >
              <span className="mr-2 text-orange-500">🔸</span>
              {processSingleQuoteMarkers(props.children)}
            </h4>
          ),

          // Enhanced text formatting
          strong: ({ node, ...props }) => (
            <strong
              className="font-bold text-slate-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded-md"
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em
              className="italic text-blue-600 dark:text-blue-400 font-medium"
              {...props}
            />
          ),

          // Enhanced inline code and code blocks
          code: ({
            node,
            className,
            children,
            ...props
          }: React.ComponentProps<"code"> & {
            node?: unknown;
            className?: string;
          }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "text";
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match;

            if (isInline) {
              // Natural inline code - exactly like ChatGPT/GitHub
              return (
                <code
                  className="inline font-mono text-[0.95em] align-baseline whitespace-normal m-0 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Enhanced code block rendering
            const blockIndex = codeBlockIndex++;
            const languageIcon = getLanguageIcon(language);
            const languageDisplayName = getLanguageDisplayName(language);

            return (
              <div className="my-8">
                <div className="flex items-center justify-between px-4 py-2 rounded-t-lg bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                    {language.toUpperCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(codeString, blockIndex)}
                    aria-label="Copy code"
                  >
                    {copiedIndex === blockIndex ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </Button>
                </div>
                <div className="rounded-b-lg bg-slate-50 dark:bg-slate-900 shadow-md overflow-x-auto">
                  <SyntaxHighlighter
                    style={isDarkMode ? atomOneDark : atomOneLight}
                    language={language}
                    PreTag="div"
                    className="!m-0 !bg-transparent text-sm"
                    customStyle={{
                      borderRadius: 0,
                      fontSize: "0.95rem",
                      padding: "1.5em 1em 1em 1em",
                      background: "inherit",
                      margin: 0,
                    }}
                    showLineNumbers={codeString.split("\n").length > 5}
                    lineNumberStyle={{
                      minWidth: "3em",
                      paddingRight: "1em",
                      color: isDarkMode ? "#6b7280" : "#9ca3af",
                      fontSize: "0.75rem",
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },

          // Enhanced list rendering
          ul: ({ node, ...props }) => (
            <ul className="list-none my-1 pl-0 space-y-0" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-none my-1 pl-0 space-y-0" {...props} />
          ),
          li: ({
            node,
            ...props
          }: React.ComponentProps<"li"> & { node?: { tagName?: string } }) => {
            const isOrderedList = node?.tagName === "ol";
            return (
              <li
                className="flex items-start space-x-3 text-slate-800 dark:text-slate-200"
                {...props}
              >
                {isOrderedList ? (
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    •
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                )}
                <span className="flex-1">
                  {processSingleQuoteMarkers(props.children)}
                </span>
              </li>
            );
          },

          // Enhanced blockquote with professional styling
          blockquote: ({ node, ...props }) => (
            <div className="my-2 p-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <blockquote
                  className="text-slate-700 dark:text-slate-300 italic m-0"
                  {...props}
                />
              </div>
            </div>
          ),

          // Enhanced paragraph with better spacing and single quote handling
          p: ({ node, ...props }) => (
            <p className="my-0 leading-normal text-slate-900 dark:text-slate-100 text-base">
              {processSingleQuoteMarkers(props.children)}
            </p>
          ),

          // Enhanced links with better styling
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Enhanced image rendering for AI-generated images
          img: ({ node, src, alt, ...props }) => {
            // Check if this is a base64 image (AI-generated) or any image
            const isGeneratedImage = src?.startsWith("data:image");

            if (isGeneratedImage) {
              return (
                <div className="my-4 flex flex-col items-center">
                  <div className="relative group max-w-full">
                    <img
                      src={src}
                      alt={alt || "AI Generated Image"}
                      className="max-w-full h-auto rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                      onError={(e) => {
                        console.error(
                          "Generated image failed to load:",
                          src?.substring(0, 50) + "...",
                        );
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
                        console.log("Generated image loaded successfully");
                      }}
                      {...props}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => {
                          if (!src) return;
                          const link = document.createElement("a");
                          link.href = src;
                          link.download = `barathai-generated-${Date.now()}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 text-black hover:bg-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  {alt && alt !== "AI Generated Image" && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-center italic">
                      {alt}
                    </p>
                  )}
                </div>
              );
            }

            // Regular image handling
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700 my-4"
                onError={(e) => {
                  console.error("Regular image failed to load:", src);
                  const target = e.target as HTMLImageElement;
                  target.alt = `[IMAGE] ${alt || "Image failed to load"}`;
                }}
                {...props}
              />
            );
          },
          // Enhanced table rendering
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <table
                className="min-w-full bg-white dark:bg-slate-800"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-4 text-left text-slate-900 dark:text-white font-semibold border-b border-slate-200 dark:border-slate-600 text-sm"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-6 py-4 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 text-sm"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              {...props}
            />
          ),

          // Enhanced horizontal rule
          hr: ({ node, ...props }) => (
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
              <div className="px-4">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
            </div>
          ),
        }}
      >
        {preprocessContent(content)}
      </ReactMarkdown>
    </div>
  );
};
