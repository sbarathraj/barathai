
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse basic markdown elements
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let keyCounter = 0;

    // Process different markdown patterns
    const patterns = [
      {
        regex: /<BOLD>(.*?)<\/BOLD>/g,
        render: (match: string, content: string) => (
          <strong key={keyCounter++} className="font-bold text-foreground">
            {content}
          </strong>
        )
      },
      {
        regex: /<INLINECODE>(.*?)<\/INLINECODE>/g,
        render: (match: string, content: string) => (
          <code key={keyCounter++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {content}
          </code>
        )
      },
      {
        regex: /<INLINE<ITALIC>CODE>(.*?)<\/INLINE<\/ITALIC>CODE>/g,
        render: (match: string, content: string) => (
          <code key={keyCounter++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary italic">
            {content}
          </code>
        )
      },
      {
        regex: /\*\*(.*?)\*\*/g,
        render: (match: string, content: string) => (
          <strong key={keyCounter++} className="font-bold text-foreground">
            {content}
          </strong>
        )
      },
      {
        regex: /`([^`]+)`/g,
        render: (match: string, content: string) => (
          <code key={keyCounter++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {content}
          </code>
        )
      }
    ];

    const allMatches: Array<{
      index: number;
      length: number;
      element: React.ReactNode;
    }> = [];

    // Find all matches
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          element: pattern.render(match[0], match[1])
        });
      }
    });

    // Sort matches by index
    allMatches.sort((a, b) => a.index - b.index);

    // Build the result
    allMatches.forEach(match => {
      // Add text before the match
      if (currentIndex < match.index) {
        const textBefore = text.slice(currentIndex, match.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }
      
      // Add the matched element
      parts.push(match.element);
      currentIndex = match.index + match.length;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts.length > 0 ? parts : [text];
  };

  // Split content by lines and process each line
  const lines = content.split('\n');
  const processedLines = lines.map((line, lineIndex) => {
    // Handle headers
    if (line.startsWith('#### ')) {
      return (
        <h4 key={lineIndex} className="text-lg font-semibold mt-4 mb-2 text-foreground">
          {line.slice(4)}
        </h4>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIndex} className="text-xl font-semibold mt-4 mb-2 text-foreground">
          {line.slice(3)}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={lineIndex} className="text-2xl font-semibold mt-4 mb-2 text-foreground">
          {line.slice(2)}
        </h2>
      );
    }

    // Handle horizontal rules
    if (line.trim() === '---') {
      return <hr key={lineIndex} className="my-4 border-border" />;
    }

    // Handle empty lines
    if (line.trim() === '') {
      return <br key={lineIndex} />;
    }

    // Process regular lines with inline markdown
    const parsedContent = parseMarkdown(line);
    return (
      <p key={lineIndex} className="mb-2 text-foreground leading-relaxed">
        {parsedContent}
      </p>
    );
  });

  return <div className="markdown-content">{processedLines}</div>;
};
