import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import atomOneLight from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Code2, Terminal, FileText, Database, Globe, Cpu } from 'lucide-react';
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
      java: { name: 'Java', icon: <Code2 size={16} />, color: 'text-orange-600 dark:text-orange-400' },
      javascript: { name: 'JavaScript', icon: <Code2 size={16} />, color: 'text-yellow-600 dark:text-yellow-400' },
      typescript: { name: 'TypeScript', icon: <Code2 size={16} />, color: 'text-blue-600 dark:text-blue-400' },
      python: { name: 'Python', icon: <Code2 size={16} />, color: 'text-green-600 dark:text-green-400' },
      cpp: { name: 'C++', icon: <Cpu size={16} />, color: 'text-blue-700 dark:text-blue-300' },
      c: { name: 'C', icon: <Cpu size={16} />, color: 'text-gray-600 dark:text-gray-400' },
      html: { name: 'HTML', icon: <Globe size={16} />, color: 'text-orange-500 dark:text-orange-300' },
      css: { name: 'CSS', icon: <FileText size={16} />, color: 'text-blue-500 dark:text-blue-300' },
      sql: { name: 'SQL', icon: <Database size={16} />, color: 'text-purple-600 dark:text-purple-400' },
      bash: { name: 'Bash', icon: <Terminal size={16} />, color: 'text-gray-700 dark:text-gray-300' },
      shell: { name: 'Shell', icon: <Terminal size={16} />, color: 'text-gray-700 dark:text-gray-300' },
      json: { name: 'JSON', icon: <FileText size={16} />, color: 'text-green-500 dark:text-green-300' },
      xml: { name: 'XML', icon: <FileText size={16} />, color: 'text-red-500 dark:text-red-300' },
      yaml: { name: 'YAML', icon: <FileText size={16} />, color: 'text-purple-500 dark:text-purple-300' },
      jsx: { name: 'JSX', icon: <Code2 size={16} />, color: 'text-cyan-600 dark:text-cyan-400' },
      tsx: { name: 'TSX', icon: <Code2 size={16} />, color: 'text-blue-600 dark:text-blue-400' },
      php: { name: 'PHP', icon: <Code2 size={16} />, color: 'text-purple-700 dark:text-purple-300' },
      ruby: { name: 'Ruby', icon: <Code2 size={16} />, color: 'text-red-600 dark:text-red-400' },
      go: { name: 'Go', icon: <Code2 size={16} />, color: 'text-cyan-700 dark:text-cyan-300' },
      rust: { name: 'Rust', icon: <Code2 size={16} />, color: 'text-orange-700 dark:text-orange-300' },
      swift: { name: 'Swift', icon: <Code2 size={16} />, color: 'text-orange-500 dark:text-orange-300' },
      kotlin: { name: 'Kotlin', icon: <Code2 size={16} />, color: 'text-purple-600 dark:text-purple-400' },
      dart: { name: 'Dart', icon: <Code2 size={16} />, color: 'text-blue-500 dark:text-blue-300' },
      scala: { name: 'Scala', icon: <Code2 size={16} />, color: 'text-red-500 dark:text-red-300' },
      r: { name: 'R', icon: <Code2 size={16} />, color: 'text-blue-700 dark:text-blue-300' },
      matlab: { name: 'MATLAB', icon: <Code2 size={16} />, color: 'text-orange-600 dark:text-orange-400' },
    };

    const info = langMap[language.toLowerCase()];
    return info || { 
      name: language.charAt(0).toUpperCase() + language.slice(1), 
      icon: <Code2 size={16} />, 
      color: 'text-gray-600 dark:text-gray-400' 
    };
  };

  const detectLanguage = (code: string): string => {
    const patterns = [
      { regex: /public\s+class\s+\w+|import\s+java\.|System\.out\.print/, lang: 'java' },
      { regex: /function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|console\.log/, lang: 'javascript' },
      { regex: /def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|print\s*\(/, lang: 'python' },
      { regex: /#include\s*<|using\s+namespace\s+std|int\s+main\s*\(|std::/, lang: 'cpp' },
      { regex: /<html|<head|<body|<div|<script|<style/, lang: 'html' },
      { regex: /\.\w+\s*{|#\w+\s*{|\w+\s*:\s*\w+;|@media|border:|background:/, lang: 'css' },
      { regex: /SELECT\s+|FROM\s+|WHERE\s+|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM/i, lang: 'sql' },
    ];

    for (const { regex, lang } of patterns) {
      if (regex.test(code)) {
        return lang;
      }
    }

    return 'text';
  };

  const preprocessContent = (rawContent: string): string => {
    // Handle Java code specifically
    if (rawContent.includes('public class') || rawContent.includes('import java.')) {
      if (!rawContent.includes('```')) {
        return `\`\`\`java\n${rawContent.trim()}\n\`\`\``;
      }
    }

    // Auto-detect and wrap code blocks
    let processedContent = rawContent.replace(/```\s*\n([^`]+)```/g, (match, code) => {
      const trimmedCode = code.trim();
      const detectedLang = detectLanguage(trimmedCode);
      return `\`\`\`${detectedLang}\n${trimmedCode}\n\`\`\``;
    });

    // Handle inline code that should be code blocks
    processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
      const detectedLang = detectLanguage(code);
      if (detectedLang !== 'text' && code.length > 20) {
        return `\`\`\`${detectedLang}\n${code}\n\`\`\``;
      }
      return match;
    });

    return processedContent;
  };

  const processedContent = preprocessContent(content);

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Professional heading components
          h1: ({ children, ...props }) => (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 mt-8 pb-4 border-b-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-tight" {...props}>
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
            <strong className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" {...props}>
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
          li: ({ children, node, ...props }) => {
            // Fix TypeScript error by properly checking parent
            const parentNode = node?.parent as any;
            const isOrdered = parentNode?.tagName === 'ol';
            
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
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            codeBlockIndex++;
            return !inline ? (
              <div className="my-6">
                <div className="flex items-center justify-between px-4 py-2 rounded-t-lg bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                    {(match ? match[1] : 'text').toUpperCase()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => copyToClipboard(String(children), codeBlockIndex)}
                    tabIndex={-1}
                    aria-label="Copy code"
                  >
                    {copiedIndex === codeBlockIndex ? <Check size={18} /> : <Copy size={18} />}
                  </Button>
                </div>
                <div className="rounded-b-lg bg-slate-50 dark:bg-slate-900 shadow-md overflow-x-auto">
                  <SyntaxHighlighter
                    style={isDarkMode ? atomOneDark : atomOneLight}
                    language={match ? match[1] : ""}
                    PreTag="div"
                    customStyle={{ borderRadius: 0, fontSize: '1rem', padding: '1.5em 1em 1em 1em', background: 'inherit', margin: 0 }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
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
