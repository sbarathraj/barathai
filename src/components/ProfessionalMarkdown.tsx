
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check, Code2, Terminal, FileText } from 'lucide-react';
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

  useEffect(() => {
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

  const getLanguageInfo = (language: string) => {
    const langMap: { [key: string]: { name: string; icon: React.ReactNode; color: string } } = {
      java: { name: 'Java', icon: <Code2 size={14} />, color: 'text-orange-600' },
      javascript: { name: 'JavaScript', icon: <Code2 size={14} />, color: 'text-yellow-600' },
      typescript: { name: 'TypeScript', icon: <Code2 size={14} />, color: 'text-blue-600' },
      python: { name: 'Python', icon: <Code2 size={14} />, color: 'text-green-600' },
      cpp: { name: 'C++', icon: <Code2 size={14} />, color: 'text-blue-700' },
      c: { name: 'C', icon: <Code2 size={14} />, color: 'text-gray-600' },
      html: { name: 'HTML', icon: <FileText size={14} />, color: 'text-orange-500' },
      css: { name: 'CSS', icon: <FileText size={14} />, color: 'text-blue-500' },
      sql: { name: 'SQL', icon: <Terminal size={14} />, color: 'text-purple-600' },
      bash: { name: 'Bash', icon: <Terminal size={14} />, color: 'text-gray-700' },
      shell: { name: 'Shell', icon: <Terminal size={14} />, color: 'text-gray-700' },
      json: { name: 'JSON', icon: <FileText size={14} />, color: 'text-green-500' },
      xml: { name: 'XML', icon: <FileText size={14} />, color: 'text-red-500' },
      yaml: { name: 'YAML', icon: <FileText size={14} />, color: 'text-purple-500' },
      jsx: { name: 'JSX', icon: <Code2 size={14} />, color: 'text-cyan-600' },
      tsx: { name: 'TSX', icon: <Code2 size={14} />, color: 'text-blue-600' },
      php: { name: 'PHP', icon: <Code2 size={14} />, color: 'text-purple-700' },
      ruby: { name: 'Ruby', icon: <Code2 size={14} />, color: 'text-red-600' },
      go: { name: 'Go', icon: <Code2 size={14} />, color: 'text-cyan-700' },
      rust: { name: 'Rust', icon: <Code2 size={14} />, color: 'text-orange-700' },
      swift: { name: 'Swift', icon: <Code2 size={14} />, color: 'text-orange-500' },
      kotlin: { name: 'Kotlin', icon: <Code2 size={14} />, color: 'text-purple-600' },
      dart: { name: 'Dart', icon: <Code2 size={14} />, color: 'text-blue-500' },
      scala: { name: 'Scala', icon: <Code2 size={14} />, color: 'text-red-500' },
      r: { name: 'R', icon: <Code2 size={14} />, color: 'text-blue-700' },
      matlab: { name: 'MATLAB', icon: <Code2 size={14} />, color: 'text-orange-600' },
    };

    const info = langMap[language.toLowerCase()];
    return info || { 
      name: language.toUpperCase(), 
      icon: <Code2 size={14} />, 
      color: 'text-gray-600' 
    };
  };

  // Enhanced content preprocessing for all programming languages
  const preprocessContent = (rawContent: string): string => {
    // Common programming language patterns
    const codePatterns = [
      // Java patterns
      { patterns: [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /import\s+java\./, /System\.out\.print/], lang: 'java' },
      // JavaScript patterns
      { patterns: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/, /var\s+\w+\s*=/, /console\.log/], lang: 'javascript' },
      // Python patterns
      { patterns: [/def\s+\w+\s*\(/, /import\s+\w+/, /from\s+\w+\s+import/, /print\s*\(/, /if\s+__name__\s*==\s*['""]__main__['""]:/], lang: 'python' },
      // C++ patterns
      { patterns: [/#include\s*</, /using\s+namespace\s+std/, /int\s+main\s*\(/, /std::cout/, /std::cin/], lang: 'cpp' },
      // HTML patterns
      { patterns: [/<html/, /<head/, /<body/, /<div/, /<p>/, /<script/, /<style/], lang: 'html' },
      // CSS patterns
      { patterns: [/\.\w+\s*{/, /#\w+\s*{/, /\w+\s*:\s*\w+;/, /@media/, /border:/, /background:/], lang: 'css' },
      // SQL patterns
      { patterns: [/SELECT\s+/, /FROM\s+/, /WHERE\s+/, /INSERT\s+INTO/, /UPDATE\s+/, /DELETE\s+FROM/], lang: 'sql' },
    ];

    // Check if content looks like code but isn't wrapped in code blocks
    const detectedLang = codePatterns.find(({ patterns }) => 
      patterns.some(pattern => pattern.test(rawContent))
    );

    if (detectedLang && !rawContent.includes('```')) {
      return `\`\`\`${detectedLang.lang}\n${rawContent.trim()}\n\`\`\``;
    }

    // Handle cases where code blocks exist but language isn't specified
    let processedContent = rawContent.replace(/```\s*\n([^`]+)```/g, (match, code) => {
      const trimmedCode = code.trim();
      const detectedLang = codePatterns.find(({ patterns }) => 
        patterns.some(pattern => pattern.test(trimmedCode))
      );
      
      if (detectedLang) {
        return `\`\`\`${detectedLang.lang}\n${trimmedCode}\n\`\`\``;
      }
      return match;
    });

    // Handle inline code that should be code blocks
    processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
      const detectedLang = codePatterns.find(({ patterns }) => 
        patterns.some(pattern => pattern.test(code))
      );
      
      if (detectedLang && code.length > 20) {
        return `\`\`\`${detectedLang.lang}\n${code}\n\`\`\``;
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
          // Enhanced heading components with professional styling
          h1: ({ children, ...props }) => (
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 mt-8 pb-4 border-b-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 mt-8 pb-3 border-b-2 border-slate-300 dark:border-slate-600 flex items-center" {...props}>
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 mt-6 flex items-center" {...props}>
              <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-xl font-medium text-slate-900 dark:text-white mb-3 mt-5 flex items-center" {...props}>
              <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-red-500 rounded-full mr-3"></span>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-lg font-medium text-slate-900 dark:text-white mb-2 mt-4 flex items-center" {...props}>
              <span className="w-0.5 h-4 bg-gradient-to-b from-red-500 to-yellow-500 rounded-full mr-2"></span>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-base font-medium text-slate-900 dark:text-white mb-2 mt-3 flex items-center" {...props}>
              <span className="w-0.5 h-3 bg-gradient-to-b from-yellow-500 to-green-500 rounded-full mr-2"></span>
              {children}
            </h6>
          ),
          
          // Enhanced paragraph styling
          p: ({ children, ...props }) => (
            <p className="mb-6 leading-8 text-slate-700 dark:text-slate-300 text-base tracking-wide" {...props}>
              {children}
            </p>
          ),
          
          // Professional text formatting
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-slate-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-slate-600 dark:text-slate-400 font-medium" {...props}>
              {children}
            </em>
          ),
          
          // Enhanced list styling
          ul: ({ children, ...props }) => (
            <ul className="list-none mb-6 space-y-3 text-slate-700 dark:text-slate-300 pl-0" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-none mb-6 space-y-3 text-slate-700 dark:text-slate-300 pl-0 counter-reset-list" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isOrdered = props.node?.parent?.tagName === 'ol';
            return (
              <li className={`leading-8 flex items-start ${isOrdered ? 'counter-increment-list' : ''}`} {...props}>
                {isOrdered ? (
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3 mt-1 counter-content"></span>
                ) : (
                  <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 mt-3"></span>
                )}
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          
          // Enhanced blockquote
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-6 my-8 italic text-slate-600 dark:text-slate-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-6 rounded-r-xl shadow-lg" {...props}>
              <div className="flex items-start">
                <span className="text-6xl text-blue-500 dark:text-blue-400 opacity-50 mr-4 leading-none">"</span>
                <div className="flex-1">{children}</div>
              </div>
            </blockquote>
          ),
          
          // Enhanced links
          a: ({ children, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 hover:decoration-blue-800 dark:hover:decoration-blue-300 transition-all duration-200 font-medium" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          
          // Professional code rendering
          code: ({ children, className, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');
            const isInlineCode = !match && !codeString.includes('\n');

            if (isInlineCode) {
              return (
                <code 
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-md text-sm font-mono border border-slate-200 dark:border-slate-700 shadow-sm" 
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const blockIndex = codeBlockIndex++;
            const langInfo = getLanguageInfo(language);

            return (
              <div className="relative group my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={langInfo.color}>{langInfo.icon}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {langInfo.name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs opacity-70 hover:opacity-100 transition-all duration-200 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-sm"
                    onClick={() => copyToClipboard(codeString, blockIndex)}
                  >
                    {copiedIndex === blockIndex ? (
                      <>
                        <Check size={14} className="mr-2 text-green-500" />
                        <span className="text-green-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="mr-2" />
                        <span className="font-medium">Copy</span>
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
                      padding: '2rem',
                      background: 'transparent',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace',
                    }}
                    showLineNumbers={codeString.split('\n').length > 3}
                    lineNumberStyle={{
                      minWidth: '3.5em',
                      paddingRight: '1.5em',
                      color: isDarkMode ? '#6b7280' : '#9ca3af',
                      fontSize: '12px',
                      textAlign: 'right',
                      userSelect: 'none',
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
          
          // Enhanced table styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
              <table className="min-w-full bg-white dark:bg-slate-800" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 tracking-wide" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700" {...props}>
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors duration-200" {...props}>
              {children}
            </tr>
          ),
          
          // Enhanced horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
