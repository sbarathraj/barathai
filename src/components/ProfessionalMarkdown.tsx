
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
    };
    return names[language.toLowerCase()] || language.toUpperCase();
  };

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 mt-6 pb-2 border-b border-slate-200 dark:border-slate-700" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-5 pb-1 border-b border-slate-200 dark:border-slate-700" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 mt-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2 mt-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-7 text-slate-700 dark:text-slate-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700 dark:text-slate-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-r" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code 
                  className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const codeString = String(children).replace(/\n$/, '');
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const blockIndex = codeBlockIndex++;
            const languageDisplayName = getLanguageDisplayName(language);

            return (
              <div className="relative group my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {languageDisplayName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
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
                <div className="relative">
                  <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!m-0 !bg-transparent"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
                    }}
                    showLineNumbers={codeString.split('\n').length > 3}
                    lineNumberStyle={{
                      minWidth: '2.5em',
                      paddingRight: '1em',
                      color: isDarkMode ? '#6b7280' : '#9ca3af',
                      fontSize: '12px',
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full bg-white dark:bg-slate-800" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t border-slate-200 dark:border-slate-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
