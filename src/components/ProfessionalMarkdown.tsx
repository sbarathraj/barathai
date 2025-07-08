
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfessionalMarkdownProps {
  content: string;
  className?: string;
}

export const ProfessionalMarkdown: React.FC<ProfessionalMarkdownProps> = ({ 
  content, 
  className = "" 
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  let codeBlockIndex = 0;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getLanguageDisplayName = (language: string) => {
    const names: { [key: string]: string } = {
      java: 'Java',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      cpp: 'C++',
      c: 'C',
      html: 'HTML',
      css: 'CSS',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      jsx: 'JSX',
      tsx: 'TSX',
    };
    return names[language.toLowerCase()] || language.toUpperCase();
  };

  // Enhanced content preprocessing to detect and format Java code
  const preprocessContent = (rawContent: string): string => {
    // Check if content looks like Java code (contains common Java patterns)
    const javaPatterns = [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /import\s+java\./,
      /System\.out\.print/,
      /Scanner\s+\w+\s*=/,
      /\bpublic\s+\w+\s+\w+\s*\(/
    ];

    const hasJavaPatterns = javaPatterns.some(pattern => pattern.test(rawContent));

    // If it looks like Java code but isn't wrapped in code blocks, wrap it
    if (hasJavaPatterns && !rawContent.includes('```')) {
      return `\`\`\`java\n${rawContent.trim()}\n\`\`\``;
    }

    // Handle cases where code blocks exist but language isn't specified
    let processedContent = rawContent.replace(/```\s*\n([^`]+)```/g, (match, code) => {
      const trimmedCode = code.trim();
      if (javaPatterns.some(pattern => pattern.test(trimmedCode))) {
        return `\`\`\`java\n${trimmedCode}\n\`\`\``;
      }
      return match;
    });

    // Format inline code that might be Java snippets
    processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
      if (code.includes('System.out') || code.includes('public class') || code.includes('import java')) {
        return `\`\`\`java\n${code}\n\`\`\``;
      }
      return match;
    });

    return processedContent;
  };

  const processedContent = preprocessContent(content);

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 mt-8 pb-3 border-b-2 border-gradient-to-r from-blue-500 to-purple-500" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 mt-6 pb-2 border-b border-slate-300 dark:border-slate-600" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2 mt-4" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-base font-medium text-slate-900 dark:text-white mb-2 mt-3" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-sm font-medium text-slate-900 dark:text-white mb-2 mt-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-7 text-slate-700 dark:text-slate-300 text-base" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700 dark:text-slate-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-700 dark:text-slate-300 pl-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7 mb-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-6 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-4 rounded-r-lg" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');
            const isInlineCode = !match && !codeString.includes('\n');

            if (isInlineCode) {
              return (
                <code 
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const blockIndex = codeBlockIndex++;
            const languageDisplayName = getLanguageDisplayName(language);

            return (
              <div className="relative group my-6 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-2">
                      {languageDisplayName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs opacity-70 hover:opacity-100 transition-opacity bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700"
                    onClick={() => copyToClipboard(codeString, blockIndex)}
                  >
                    {copiedIndex === blockIndex ? (
                      <>
                        <Check size={14} className="mr-1 text-green-500" />
                        <span className="text-green-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-1" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!m-0 !bg-transparent"
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, "Monaco", monospace',
                    }}
                    showLineNumbers={codeString.split('\n').length > 5}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: isDarkMode ? '#6b7280' : '#9ca3af',
                      fontSize: '12px',
                      textAlign: 'right',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="min-w-full bg-white dark:bg-slate-800" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t-2 border-slate-200 dark:border-slate-700" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
