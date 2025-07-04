
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const renderMarkdown = (text: string) => {
    // Split text into lines to handle different markdown elements
    const lines = text.split('\n');
    const rendered: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';
    let inTable = false;
    let tableRows: string[] = [];

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
          rendered.push(
            <div key={i} className="my-4 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              {codeLanguage && (
                <div className="px-4 py-2 bg-slate-700 text-xs text-slate-300 border-b border-slate-600">
                  {codeLanguage}
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 font-mono">
                  {codeBlockContent.join('\n')}
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
        // End of table
        inTable = false;
        rendered.push(renderTable(tableRows, i));
        tableRows = [];
      }

      // Handle headings
      if (line.startsWith('### ')) {
        rendered.push(
          <h3 key={i} className="text-lg font-semibold text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        rendered.push(
          <h2 key={i} className="text-xl font-semibold text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        rendered.push(
          <h1 key={i} className="text-2xl font-bold text-white mt-4 mb-2">
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        rendered.push(
          <ul key={i} className="list-disc list-inside text-slate-100 my-1">
            <li>{renderInlineMarkdown(line.slice(2))}</li>
          </ul>
        );
      } else if (/^\d+\. /.test(line)) {
        rendered.push(
          <ol key={i} className="list-decimal list-inside text-slate-100 my-1">
            <li>{renderInlineMarkdown(line.replace(/^\d+\. /, ''))}</li>
          </ol>
        );
      } else if (line.trim() === '') {
        rendered.push(<br key={i} />);
      } else {
        rendered.push(
          <p key={i} className="text-slate-100 my-1 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    }

    // Handle any remaining table
    if (inTable && tableRows.length > 0) {
      rendered.push(renderTable(tableRows, lines.length));
    }

    return rendered;
  };

  const renderInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;

    // Handle inline code
    text = text.replace(/`([^`]+)`/g, (match, code) => {
      return `<INLINE_CODE>${code}</INLINE_CODE>`;
    });

    // Handle bold text (** or __)
    text = text.replace(/\*\*([^*]+)\*\*/g, (match, bold) => {
      return `<BOLD>${bold}</BOLD>`;
    });
    text = text.replace(/__([^_]+)__/g, (match, bold) => {
      return `<BOLD>${bold}</BOLD>`;
    });

    // Handle italic text (* or _)
    text = text.replace(/\*([^*]+)\*/g, (match, italic) => {
      return `<ITALIC>${italic}</ITALIC>`;
    });
    text = text.replace(/_([^_]+)_/g, (match, italic) => {
      return `<ITALIC>${italic}</ITALIC>`;
    });

    // Split by custom tags and render
    const segments = text.split(/(<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>|<INLINE_CODE>.*?<\/INLINE_CODE>)/);

    return segments.map((segment, index) => {
      if (segment.startsWith('<BOLD>')) {
        const content = segment.replace(/<\/?BOLD>/g, '');
        return (
          <strong key={index} className="font-semibold text-white">
            {content}
          </strong>
        );
      } else if (segment.startsWith('<ITALIC>')) {
        const content = segment.replace(/<\/?ITALIC>/g, '');
        return (
          <em key={index} className="italic text-slate-200">
            {content}
          </em>
        );
      } else if (segment.startsWith('<INLINE_CODE>')) {
        const content = segment.replace(/<\/?INLINE_CODE>/g, '');
        return (
          <code key={index} className="px-1.5 py-0.5 bg-slate-700 text-blue-300 rounded text-sm font-mono">
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
        <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg">
          <thead>
            <tr className="bg-slate-700">
              {headerRow.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-white font-semibold border-b border-slate-600">
                  {renderInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-700 hover:bg-slate-750">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-slate-200">
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
