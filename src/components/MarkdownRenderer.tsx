import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check, Play, Terminal, Code, FileText, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  // Listen for theme changes
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

  // Enhanced preprocessing to handle API response patterns
  const preprocessContent = (text: string) => {
    let processedText = text;
    
    // Handle escaped newlines from API responses
    processedText = processedText.replace(/\\n/g, '\n');
    
    // Handle custom tags with various cases
    const customTagPatterns = [
      { pattern: /<BOLDTAG>(.*?)<\/BOLDTAG>/gs, replacement: '**$1**' },
      { pattern: /<ITALICTAG>(.*?)<\/ITALICTAG>/gs, replacement: '*$1*' },
      { pattern: /<INLINECODETAG>(.*?)<\/INLINECODETAG>/gs, replacement: '`$1`' },
      { pattern: /<CODETAG>(.*?)<\/CODETAG>/gs, replacement: '`$1`' },
      { pattern: /<BOLD>(.*?)<\/BOLD>/gs, replacement: '**$1**' },
      { pattern: /<ITALIC>(.*?)<\/ITALIC>/gs, replacement: '*$1*' },
      { pattern: /<INLINECODE>(.*?)<\/INLINECODE>/gs, replacement: '`$1`' },
      { pattern: /<CODE>(.*?)<\/CODE>/gs, replacement: '`$1`' },
      
      // Handle nested and malformed tags
      { pattern: /<INLINE<ITALIC>CODE>(.*?)<\/INLINE<\/ITALIC>CODE>/gs, replacement: '`$1`' },
      { pattern: /<boldtag>(.*?)<\/boldtag>/gs, replacement: '**$1**' },
      { pattern: /<italictag>(.*?)<\/italictag>/gs, replacement: '*$1*' },
      { pattern: /<inlinecodetag>(.*?)<\/inlinecodetag>/gs, replacement: '`$1`' },
      { pattern: /<codetag>(.*?)<\/codetag>/gs, replacement: '`$1`' },
      
      // Handle various case combinations
      { pattern: /<BoldTag>(.*?)<\/BoldTag>/gs, replacement: '**$1**' },
      { pattern: /<ItalicTag>(.*?)<\/ItalicTag>/gs, replacement: '*$1*' },
      { pattern: /<InlineCodeTag>(.*?)<\/InlineCodeTag>/gs, replacement: '`$1`' },
      { pattern: /<CodeTag>(.*?)<\/CodeTag>/gs, replacement: '`$1`' },
      
      // Handle attributes in tags
      { pattern: /<BOLD[^>]*>(.*?)<\/BOLD[^>]*>/gs, replacement: '**$1**' },
      { pattern: /<ITALIC[^>]*>(.*?)<\/ITALIC[^>]*>/gs, replacement: '*$1*' },
      { pattern: /<CODE[^>]*>(.*?)<\/CODE[^>]*>/gs, replacement: '`$1`' },
    ];

    customTagPatterns.forEach(({ pattern, replacement }) => {
      processedText = processedText.replace(pattern, replacement);
    });

    // Enhance instructional sections with icons
    processedText = processedText.replace(
      /^(How to Run|Output|Example|Note|Important|Steps|Instructions?):\s*$/gm,
      '### 💡 $1\n'
    );

    // Add visual separators between major sections
    processedText = processedText.replace(
      /^(#{1,3}\s+.*?)$/gm,
      '\n---\n\n$1'
    );

    return processedText;
  };

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

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      java: '☕',
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      cpp: '⚡',
      c: '🔧',
      html: '🌐',
      css: '🎨',
      sql: '🗃️',
      bash: '💻',
      shell: '💻',
      json: '📋',
      xml: '📄',
      yaml: '⚙️',
    };
    return icons[language.toLowerCase()] || '📝';
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
    };
    return names[language.toLowerCase()] || language.toUpperCase();
  };

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Enhanced heading rendering with better styling and icons
          h1: ({ node, ...props }) => (
            <div className="mb-8 mt-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white border-b-2 border-gradient-to-r from-blue-500 to-purple-500 pb-3 mb-4 flex items-center" {...props}>
                <span className="mr-3 text-blue-500">🚀</span>
                {props.children}
              </h1>
            </div>
          ),
          h2: ({ node, ...props }) => (
            <div className="mb-6 mt-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-2 mb-4 flex items-center" {...props}>
                <span className="mr-2 text-purple-500">📋</span>
                {props.children}
              </h2>
            </div>
          ),
          h3: ({ node, ...props }) => (
            <div className="mb-4 mt-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center mb-3" {...props}>
                <span className="mr-2 text-green-500">✨</span>
                {props.children}
              </h3>
            </div>
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2 flex items-center" {...props}>
              <span className="mr-2 text-orange-500">🔸</span>
              {props.children}
            </h4>
          ),

          // Enhanced text formatting
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded-md" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-blue-600 dark:text-blue-400 font-medium" {...props} />
          ),

          // Enhanced inline code
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code 
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700 shadow-sm" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Enhanced code block rendering
            const codeString = String(children).replace(/\n$/, '');
            const language = /language-(\w+)/.exec(className || '')?.[1] || 'text';
            const blockIndex = codeBlockIndex++;
            const languageIcon = getLanguageIcon(language);
            const languageDisplayName = getLanguageDisplayName(language);

            return (
              <div className="relative group my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900">
                {/* Professional code block header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{languageIcon}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {languageDisplayName}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-white/50 dark:hover:bg-slate-600/50"
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
                </div>

                {/* Code content with professional styling */}
                <div className="relative">
                  <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!m-0 !bg-transparent text-sm"
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
                    }}
                    showLineNumbers={codeString.split('\n').length > 5}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: isDarkMode ? '#6b7280' : '#9ca3af',
                      fontSize: '0.75rem',
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
            <ul className="list-none my-6 pl-0 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-none my-6 pl-0 space-y-2 counter-reset-item" {...props} />
          ),
          li: ({ node, ordered, ...props }) => (
            <li className={`flex items-start space-x-3 text-slate-800 dark:text-slate-200 ${ordered ? 'counter-increment-item' : ''}`} {...props}>
              {ordered ? (
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5 counter-item">
                  {/* Counter will be handled by CSS */}
                </span>
              ) : (
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
              )}
              <span className="flex-1">{props.children}</span>
            </li>
          ),

          // Enhanced blockquote with professional styling
          blockquote: ({ node, ...props }) => (
            <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <blockquote className="text-slate-700 dark:text-slate-300 italic m-0" {...props} />
              </div>
            </div>
          ),

          // Enhanced paragraph with better spacing
          p: ({ node, ...props }) => (
            <p className="my-4 leading-relaxed text-slate-900 dark:text-slate-100 text-base" {...props} />
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

          // Enhanced table rendering
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="min-w-full bg-white dark:bg-slate-800" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 text-left text-slate-900 dark:text-white font-semibold border-b border-slate-200 dark:border-slate-600 text-sm" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 text-sm" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" {...props} />
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
      
      <style jsx>{`
        .counter-reset-item {
          counter-reset: item;
        }
        .counter-increment-item {
          counter-increment: item;
        }
        .counter-item::before {
          content: counter(item);
        }
      `}</style>
    </div>
  );
};