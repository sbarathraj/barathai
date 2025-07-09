import React, { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import atomOneDark from 'react-syntax-highlighter/dist/styles/atom-one-dark.js';
// import atomOneLight from 'react-syntax-highlighter/dist/styles/atom-one-light.js';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Code2, Terminal, FileText, Database, Globe, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from "clsx";

interface ProfessionalMarkdownProps {
  content: string;
  className?: string;
}

// Type for code renderer props
type CodeRendererProps = {
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

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
          h1: ({ children, ...props }) => (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 mt-2 pb-1 border-b-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 mt-2 pb-1 border-b-2 border-slate-300 dark:border-slate-600 flex items-center" {...props}>
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 mt-2 flex items-center" {...props}>
              <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-xl font-medium text-slate-900 dark:text-white mb-1 mt-1 flex items-center" {...props}>
              <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-red-500 rounded-full mr-3"></span>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-lg font-medium text-slate-900 dark:text-white mb-1 mt-1 flex items-center" {...props}>
              <span className="w-0.5 h-4 bg-gradient-to-b from-red-500 to-yellow-500 rounded-full mr-2"></span>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-base font-medium text-slate-900 dark:text-white mb-1 mt-1 flex items-center" {...props}>
              <span className="w-0.5 h-3 bg-gradient-to-b from-yellow-500 to-green-500 rounded-full mr-2"></span>
              {children}
            </h6>
          ),
          
          // Enhanced paragraph styling
          p: ({ children, ...props }) => (
            <p className="mb-0 leading-normal text-slate-700 dark:text-slate-300 text-base tracking-wide" {...props}>
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
          ul: ({ children }) => <ul className="list-disc list-outside pl-6 space-y-0.5 mb-1 text-[15px] marker:text-xs marker:leading-none">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-outside pl-6 space-y-0.5 mb-1 text-[15px] marker:text-xs marker:leading-none">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5 leading-relaxed break-words text-[15px]">{children}</li>,
          
          // Enhanced blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 bg-blue-50 dark:bg-slate-800/60 pl-3 pr-2 py-0.5 my-1 text-slate-700 dark:text-slate-300 text-[15px] italic">
              {children}
            </blockquote>
          ),
          
          // Enhanced links
          a: ({ children, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 hover:decoration-blue-800 dark:hover:decoration-blue-300 transition-all duration-200 font-medium" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          
          // Professional code rendering
          code: ({ inline, className, children }: CodeRendererProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            codeBlockIndex++;
            if (!inline) {
              // Language label logic
              let langLabel = 'Text';
              if (match && match[1]) {
                langLabel = match[1].charAt(0).toUpperCase() + match[1].slice(1);
              }
              
              // Special handling for text blocks (separators, plain content)
              if (langLabel.toLowerCase() === 'text') {
                return (
                  <div className="relative group mb-6 mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                    <pre className="overflow-x-auto text-[15px] font-mono text-slate-700 dark:text-slate-300">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              }
              
              // Regular code blocks with header
              return (
                <div className="relative group mb-6 mt-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                  {/* Header bar with language and copy button */}
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      {langLabel}
                    </span>
                    <button
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => copyToClipboard(codeString, codeBlockIndex)}
                      title="Copy code"
                      aria-label="Copy code block"
                    >
                      {copiedIndex === codeBlockIndex ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  {/* Code content */}
                  <pre className={clsx(className, "bg-slate-100 dark:bg-slate-900 p-4 overflow-x-auto text-[15px] font-mono")}
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace' }}
                  >
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code className={clsx(className, "bg-slate-200 dark:bg-slate-800 rounded px-1.5 py-0.5 text-sm")}
              >
                {children}
              </code>
            );
          },
          
          // Enhanced table styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-1">
              <table className="min-w-full border-collapse text-[15px]">{children}</table>
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
            <hr className="my-12 mt-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
