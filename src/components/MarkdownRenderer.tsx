import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/styles/atom-one-dark';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  // Replace custom tags with markdown equivalents
  const preprocessContent = (text: string) => {
    let processedText = text;
    processedText = processedText.replace(/<BOLDTAG>(.*?)<\/BOLDTAG>/gs, '**$1**');
    processedText = processedText.replace(/<ITALICTAG>(.*?)<\/ITALICTAG>/gs, '*$1*');
    processedText = processedText.replace(/<INLINECODETAG>(.*?)<\/INLINECODETAG>/gs, '`$1`');
    processedText = processedText.replace(/<CODETAG>(.*?)<\/CODETAG>/gs, '`$1`');
    processedText = processedText.replace(/<BOLD>(.*?)<\/BOLD>/gs, '**$1**');
    processedText = processedText.replace(/<ITALIC>(.*?)<\/ITALIC>/gs, '*$1*');
    processedText = processedText.replace(/<INLINECODE>(.*?)<\/INLINECODE>/gs, '`$1`');
    processedText = processedText.replace(/<boldtag>(.*?)<\/boldtag>/gs, '**$1**');
    processedText = processedText.replace(/<italictag>(.*?)<\/italictag>/gs, '*$1*');
    processedText = processedText.replace(/<inlinecodetag>(.*?)<\/inlinecodetag>/gs, '`$1`');
    processedText = processedText.replace(/<codetag>(.*?)<\/codetag>/gs, '`$1`');
    processedText = processedText.replace(/<BoldTag>(.*?)<\/BoldTag>/gs, '**$1**');
    processedText = processedText.replace(/<ItalicTag>(.*?)<\/ItalicTag>/gs, '*$1*');
    processedText = processedText.replace(/<InlineCodeTag>(.*?)<\/InlineCodeTag>/gs, '`$1`');
    processedText = processedText.replace(/<CodeTag>(.*?)<\/CodeTag>/gs, '`$1`');
    processedText = processedText.replace(/<BOLD[^>]*>(.*?)<\/BOLD[^>]*>/gs, '**$1**');
    processedText = processedText.replace(/<ITALIC[^>]*>(.*?)<\/ITALIC[^>]*>/gs, '*$1*');
    processedText = processedText.replace(/<CODE[^>]*>(.*?)<\/CODE[^>]*>/gs, '`$1`');
    return processedText;
  };

  // Copy to clipboard state for code blocks
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Custom renderer for code blocks with copy button
  let codeBlockIdx = 0;

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-slate-900 dark:text-white" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-slate-900 dark:text-white" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-3 mb-2 text-slate-900 dark:text-white" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
          em: ({node, ...props}) => <em className="italic text-slate-700 dark:text-slate-300" {...props} />,
          code: ({node, inline, className, children, ...props}) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded text-sm font-mono" {...props}>{children}</code>
              );
            }
            // For code blocks
            const codeString = String(children).replace(/\n$/, '');
            const language = /language-(\w+)/.exec(className || '')?.[1] || 'text';
            const blockIdx = codeBlockIdx++;
            return (
              <div className="relative group my-4">
                <button
                  className="absolute top-2 right-2 z-10 p-1 rounded bg-slate-700 hover:bg-blue-600 text-white transition flex items-center gap-1 opacity-80 group-hover:opacity-100"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    setCopiedIndex(blockIdx);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  title="Copy code"
                  type="button"
                >
                  {copiedIndex === blockIdx ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  <span className="text-xs">{copiedIndex === blockIdx ? 'Copied!' : 'Copy'}</span>
                </button>
                <SyntaxHighlighter
                  style={atomOneDark}
                  language={language}
                  PreTag="div"
                  className="rounded-lg text-base !pl-4 !pr-4 !pt-4 !pb-4"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 pl-6" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 pl-6" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-slate-600 dark:text-slate-300 my-4" {...props} />,
          p: ({node, ...props}) => <p className="my-2 leading-relaxed text-slate-900 dark:text-white" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
          table: ({node, ...props}) => <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg my-4" {...props} />,
          thead: ({node, ...props}) => <thead className="bg-slate-100 dark:bg-slate-700" {...props} />,
          th: ({node, ...props}) => <th className="px-4 py-2 text-left text-slate-900 dark:text-white font-semibold border-b border-slate-300 dark:border-slate-600" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-2 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-750" {...props} />,
        }}
      >
        {preprocessContent(content)}
      </ReactMarkdown>
    </div>
  );
};