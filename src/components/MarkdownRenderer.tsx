import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set(prev).add(blockIndex));
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const rendered: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';
    let inTable = false;
    let tableRows: string[] = [];
    let blockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          const codeContent = codeBlockContent.join('\n');
          const currentBlockIndex = blockIndex++;
          rendered.push(
            <div key={i} className="my-4 rounded-lg bg-slate-800 dark:bg-slate-800 bg-gray-100 border border-slate-700 dark:border-slate-700 border-gray-300 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-700 dark:bg-slate-700 bg-gray-200 text-xs text-slate-300 dark:text-slate-300 text-gray-600 border-b border-slate-600 dark:border-slate-600 border-gray-300">
                <span>{codeLanguage || 'code'}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(codeContent, currentBlockIndex)}
                  className="h-6 w-6 text-slate-400 hover:text-blue-400 dark:text-slate-400 dark:hover:text-blue-400 text-gray-500 hover:text-blue-500"
                >
                  {copiedBlocks.has(currentBlockIndex) ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 dark:text-slate-100 text-gray-800 font-mono">
                  {codeContent}
                </code>
              </pre>
            </div>
          );
          codeLanguage = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Handle tables
      if (line.includes('|') && line.trim().length > 0) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
        continue;
      } else if (inTable) {
        inTable = false;
        rendered.push(renderTable(tableRows, i));
        tableRows = [];
      }

      // Handle headings
      if (line.startsWith('### ')) {
        rendered.push(
          <h3 key={i} className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        rendered.push(
          <h2 key={i} className="text-xl font-semibold text-slate-900 dark:text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        rendered.push(
          <h1 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        rendered.push(
          <ul key={i} className="list-disc list-inside text-slate-900 dark:text-white my-1">
            <li>{renderInlineMarkdown(line.slice(2))}</li>
          </ul>
        );
      } else if (/^\d+\. /.test(line)) {
        rendered.push(
          <ol key={i} className="list-decimal list-inside text-slate-900 dark:text-white my-1">
            <li>{renderInlineMarkdown(line.replace(/^\d+\. /, ''))}</li>
          </ol>
        );
      } else if (line.trim() === '') {
        rendered.push(<br key={i} />);
      } else {
        rendered.push(
          <p key={i} className="text-slate-900 dark:text-white my-1 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    }

    if (inTable && tableRows.length > 0) {
      rendered.push(renderTable(tableRows, lines.length));
    }

    return rendered;
  };

  const renderInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];

    // Handle complex inline code patterns - FIXED IMPLEMENTATION
    text = text.replace(/<BOLD>(.*?)<\/BOLD>/g, (match, content) => {
      return `<BOLD_TAG>${content}</BOLD_TAG>`;
    });

    text = text.replace(/<INLINECODE>(.*?)<\/INLINECODE>/g, (match, code) => {
      return `<INLINE_CODE_TAG>${code}</INLINE_CODE_TAG>`;
    });

    // Handle nested patterns like <INLINE<ITALIC>CODE>Scanner</INLINE</ITALIC>CODE>
    text = text.replace(/<INLINE<ITALIC>CODE>(.*?)<\/INLINE<\/ITALIC>CODE>/g, (match, code) => {
      return `<INLINE_CODE_TAG>${code}</INLINE_CODE_TAG>`;
    });

    // Handle regular inline code
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return `<INLINE_CODE_TAG>${code}</INLINE_CODE_TAG>`;
    });

    // Handle bold text (** or __)
    text = text.replace(/\*\*([^*]+)\*\*/g, (match, bold) => {
      return `<BOLD_TAG>${bold}</BOLD_TAG>`;
    });
    text = text.replace(/__([^_]+)__/g, (match, bold) => {
      return `<BOLD_TAG>${bold}</BOLD_TAG>`;
    });

    // Handle italic text (* or _)
    text = text.replace(/\*([^*]+)\*/g, (match, italic) => {
      return `<ITALIC_TAG>${italic}</ITALIC_TAG>`;
    });
    text = text.replace(/_([^_]+)_/g, (match, italic) => {
      return `<ITALIC_TAG>${italic}</ITALIC_TAG>`;
    });

    const segments = text.split(/(<BOLD_TAG>.*?<\/BOLD_TAG>|<ITALIC_TAG>.*?<\/ITALIC_TAG>|<INLINE_CODE_TAG>.*?<\/INLINE_CODE_TAG>)/);

    return segments.map((segment, index) => {
      if (segment.startsWith('<BOLD_TAG>')) {
        const content = segment.replace(/<\/?BOLD_TAG>/g, '');
        return (
          <strong key={index} className="font-semibold text-slate-900 dark:text-white">
            {content}
          </strong>
        );
      } else if (segment.startsWith('<ITALIC_TAG>')) {
        const content = segment.replace(/<\/?ITALIC_TAG>/g, '');
        return (
          <em key={index} className="italic text-slate-700 dark:text-slate-300">
            {content}
          </em>
        );
      } else if (segment.startsWith('<INLINE_CODE_TAG>')) {
        const content = segment.replace(/<\/?INLINE_CODE_TAG>/g, '');
        return (
          <code key={index} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded text-sm font-mono">
            {content}
          </code>
        );
      } else {
        return segment;
      }
    });
  };

  const renderTable = (rows: string[], key: number) => {
    if (rows.length < 2) return null;

    const headerRow = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    const separatorRow = rows[1];
    const dataRows = rows.slice(2).map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div key={key} className="my-4 overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700">
              {headerRow.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-slate-900 dark:text-white font-semibold border-b border-slate-300 dark:border-slate-600">
                  {renderInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-slate-800 dark:text-slate-200">
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return <div className={className}>{renderMarkdown(content)}</div>;
};