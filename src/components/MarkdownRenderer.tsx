import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check, Play, Terminal } from 'lucide-react';
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

  // Enhanced preprocessing to handle various markdown patterns
  const preprocessContent = (text: string) => {
    let processedText = text;
    
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

    // Enhance instructional sections
    processedText = processedText.replace(
      /^(How to Run|Output|Example|Note|Important|Steps|Instructions?):\s*$/gm,
      '### 📋 $1\n'
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

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Enhanced heading rendering with better styling
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-6 text-slate-900 dark:text-white border-b-2 border-blue-500 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-4 text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600 pb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white flex items-center" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-white" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-base font-semibold mt-3 mb-2 text-slate-900 dark:text-white" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-sm font-semibold mt-2 mb-1 text-slate-900 dark:text-white" {...props} />
          ),

          // Enhanced text formatting
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700 dark:text-slate-300" {...props} />
          ),

          // Enhanced inline code
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code 
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700" 
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

            return (
              <div className="relative group my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                {/* Code block header */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{languageIcon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {language}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(codeString, blockIndex)}
                    >
                      {copiedIndex === blockIndex ? (
                        <>
                          <Check size={12} className="mr-1 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="mr-1" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Code content */}
                <SyntaxHighlighter
                  style={isDarkMode ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  className="!m-0 !bg-transparent text-sm"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Enhanced list rendering
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-4 pl-6 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-4 pl-6 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-2 text-slate-800 dark:text-slate-200" {...props} />
          ),

          // Enhanced blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-400 dark:border-blue-500 pl-6 py-2 italic text-slate-600 dark:text-slate-300 my-6 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg" {...props} />
          ),

          // Enhanced paragraph
          p: ({ node, ...props }) => (
            <p className="my-3 leading-relaxed text-slate-900 dark:text-slate-100" {...props} />
          ),

          // Enhanced links
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),

          // Enhanced table rendering
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-100 dark:bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-3 text-left text-slate-900 dark:text-white font-semibold border-b border-slate-300 dark:border-slate-600" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" {...props} />
          ),

          // Enhanced horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" {...props} />
          ),
        }}
      >
        {preprocessContent(content)}
      </ReactMarkdown>
    </div>
  );
};